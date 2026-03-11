import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  EnvelopeIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  ArrowTopRightOnSquareIcon,
  TrashIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import Card from '../components/ui/Card';
import { useAuth } from '../contexts/AuthContext';
import API from '../api';

interface EmailConnection {
  provider: string;
  connected: boolean;
  email?: string;
  connectedAt?: string;
  isActive?: boolean;
}

interface EmailStatus {
  gmail: EmailConnection;
  outlook: EmailConnection;
}

const EmailConnector: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [emailStatus, setEmailStatus] = useState<EmailStatus>({
    gmail: { connected: false, provider: 'gmail' },
    outlook: { connected: false, provider: 'outlook' }
  });
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [authUrls, setAuthUrls] = useState<any>(null);
  const [testEmailData, setTestEmailData] = useState({
    to: '',
    subject: 'Test Email from Timesheet Pro',
    text: 'This is a test email sent from your Timesheet Pro application.'
  });

  // Check for OAuth callback success/failure
  useEffect(() => {
    const success = searchParams.get('success');
    const provider = searchParams.get('provider');
    const email = searchParams.get('email');
    const error = searchParams.get('error');

    if (success === 'true' && provider && email) {
      // Show success message
      const message = `${provider === 'gmail' ? 'Gmail' : 'Outlook'} account ${email} connected successfully!`;
      alert(message);
      
      // Clear URL params
      window.history.replaceState({}, '', '/email-connector');
      
      // Refresh status
      fetchEmailStatus();
    } else if (success === 'false' && provider && error) {
      // Show error message
      alert(`Failed to connect ${provider === 'gmail' ? 'Gmail' : 'Outlook'}: ${error}`);
      
      // Clear URL params
      window.history.replaceState({}, '', '/email-connector');
    }
  }, [searchParams]);

  useEffect(() => {
    fetchEmailStatus();
    fetchAuthUrls();
  }, []);

  const fetchEmailStatus = async () => {
    try {
      setLoading(true);
      const response = await API.get('/email/status');
      setEmailStatus(response.data.data);
    } catch (error) {
      console.error('Failed to fetch email status:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAuthUrls = async () => {
    try {
      const response = await API.get('/email/auth/urls');
      setAuthUrls(response.data.data);
    } catch (error) {
      console.error('Failed to fetch auth URLs:', error);
    }
  };

  const handleConnect = async (provider: 'gmail' | 'outlook') => {
    if (!authUrls) return;

    setConnecting(provider);
    
    try {
      const authUrl = provider === 'gmail' ? authUrls.google.authUrl : authUrls.microsoft.authUrl;
      
      // Store current user info in session for OAuth callback
      sessionStorage.setItem('oauth_user', JSON.stringify({
        employeeId: user?.id,
        name: user?.name
      }));
      
      // Redirect to OAuth provider
      window.location.href = authUrl;
    } catch (error) {
      console.error('Failed to initiate OAuth flow:', error);
      alert('Failed to initiate connection. Please try again.');
    } finally {
      setConnecting(null);
    }
  };

  const handleDisconnect = async (provider: 'gmail' | 'outlook') => {
    if (!confirm(`Are you sure you want to disconnect your ${provider === 'gmail' ? 'Gmail' : 'Outlook'} account?`)) {
      return;
    }

    try {
      await API.delete(`/email/disconnect/${provider}`);
      alert(`${provider === 'gmail' ? 'Gmail' : 'Outlook'} account disconnected successfully.`);
      fetchEmailStatus();
    } catch (error) {
      console.error('Failed to disconnect email:', error);
      alert('Failed to disconnect email account. Please try again.');
    }
  };

  const handleSendTestEmail = async () => {
    if (!testEmailData.to) {
      alert('Please enter a recipient email address.');
      return;
    }

    try {
      const response = await API.post('/email/send-test', testEmailData);
      
      if (response.data.success) {
        alert('Test email sent successfully!');
      } else {
        alert('Failed to send test email.');
      }
    } catch (error) {
      console.error('Failed to send test email:', error);
      alert(error instanceof Error ? error.message : 'Failed to send test email. Please check your email connection.');
    }
  };

  const renderProviderCard = (provider: 'gmail' | 'outlook') => {
    const connection = emailStatus[provider];
    const isConnected = connection.connected;
    const providerName = provider === 'gmail' ? 'Gmail' : 'Outlook';
    const providerIcon = provider === 'gmail' ? 
      <EnvelopeIcon className="h-8 w-8 text-red-500" /> : 
      <EnvelopeIcon className="h-8 w-8 text-blue-500" />;

    return (
      <Card key={provider} className="relative overflow-hidden">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {providerIcon}
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{providerName}</h3>
                <p className="text-sm text-gray-500">Connect your {providerName} account</p>
              </div>
            </div>
            
            {/* Status Badge */}
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              isConnected 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-600'
            }`}>
              {isConnected ? 'Connected' : 'Not Connected'}
            </div>
          </div>

          {/* Connection Details */}
          {isConnected && connection.email && (
            <div className="mb-4 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-start gap-3">
                <CheckCircleIcon className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-900">Connected Account</p>
                  <p className="text-sm text-green-700">{connection.email}</p>
                  <p className="text-xs text-green-600 mt-1">
                    Connected on {new Date(connection.connectedAt!).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {!isConnected ? (
              <button
                onClick={() => handleConnect(provider)}
                disabled={connecting === provider || !authUrls}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {connecting === provider ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Connecting...
                  </>
                ) : (
                  <>
                    <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                    Connect {providerName}
                  </>
                )}
              </button>
            ) : (
              <>
                <button
                  onClick={() => handleDisconnect(provider)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <TrashIcon className="h-4 w-4" />
                  Disconnect
                </button>
              </>
            )}
          </div>
        </div>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Email Connector</h1>
        <p className="text-gray-600 mt-2">
          Connect your email accounts to send emails directly from the Timesheet Pro application.
        </p>
      </div>

      {/* Admin Access Notice */}
      {user?.role?.toLowerCase() !== 'admin' && (
        <Card className="border-yellow-200 bg-yellow-50">
          <div className="p-4">
            <div className="flex items-start gap-3">
              <ShieldCheckIcon className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-yellow-900">Admin Access Required</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Only administrators can connect and manage email accounts for the organization.
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Email Provider Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderProviderCard('gmail')}
        {renderProviderCard('outlook')}
      </div>

      {/* Test Email Section */}
      {(emailStatus.gmail.connected || emailStatus.outlook.connected) && (
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Send Test Email</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recipient Email
                </label>
                <input
                  type="email"
                  value={testEmailData.to}
                  onChange={(e) => setTestEmailData({ ...testEmailData, to: e.target.value })}
                  placeholder="Enter recipient email address"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  value={testEmailData.subject}
                  onChange={(e) => setTestEmailData({ ...testEmailData, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  value={testEmailData.text}
                  onChange={(e) => setTestEmailData({ ...testEmailData, text: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <button
                onClick={handleSendTestEmail}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <EnvelopeIcon className="h-4 w-4" />
                Send Test Email
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">How It Works</h3>
          <div className="space-y-4 text-sm text-gray-600">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">1</div>
              <p>
                <strong>Connect Your Account:</strong> Click "Connect Gmail" or "Connect Outlook" to authorize the application to send emails on your behalf.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">2</div>
              <p>
                <strong>OAuth Authentication:</strong> You'll be redirected to Google or Microsoft to sign in and grant permission. We use secure OAuth 2.0 authentication.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">3</div>
              <p>
                <strong>Automatic Token Refresh:</strong> Access tokens are automatically refreshed to maintain connection without requiring re-authentication.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">4</div>
              <p>
                <strong>Send Emails:</strong> Once connected, the application can send emails using your connected account for notifications, reports, and other communications.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default EmailConnector;
