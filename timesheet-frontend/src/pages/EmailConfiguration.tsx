import React, { useState, useEffect, useRef } from 'react';
import API from '../api';
import { useAuth } from '../contexts/AuthContext';
import {
  EnvelopeIcon,
  ServerIcon,
  KeyIcon,
  ShieldCheckIcon,
  PaperAirplaneIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  GlobeAltIcon,
  LockClosedIcon,
  ArrowTopRightOnSquareIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

// UI Components
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import StatusBadge from '../components/ui/StatusBadge';
import Modal from '../components/ui/Modal';

interface OAuthConnection {
  provider: string;
  email: string;
  isActive: boolean;
  expiresAt?: string;
  createdAt?: string;
}

interface EmailConfig {
  emailProvider: string;
  enableNotifications: boolean;
  oauthConnection?: OAuthConnection;
}

interface ProviderConfig {
  id: string;
  name: string;
  description: string;
  authType: 'OAuth' | 'API';
  setupNote: string;
}

const EmailConfiguration: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; details?: any } | null>(null);
  
  const [config, setConfig] = useState<EmailConfig>(() => ({
    emailProvider: 'outlook-365',
    enableNotifications: true
  }));

  const [savedConfig, setSavedConfig] = useState<EmailConfig | null>(null);
  const [providerConfigs, setProviderConfigs] = useState<ProviderConfig[]>([]);
  const [selectedProviderInfo, setSelectedProviderInfo] = useState<ProviderConfig | null>(null);
  const [oauthConnection, setOAuthConnection] = useState<OAuthConnection | null>(null);
  const [oauthLoading, setOAuthLoading] = useState(false);

  // Ref to prevent duplicate API calls in StrictMode
  const hasFetched = useRef(false);

  // Check if user is admin, if not redirect to dashboard
  useEffect(() => {
    if (user && user.role !== 'admin' && user.role !== 'Admin') {
      window.location.href = '/dashboard';
    }
  }, [user]);

  // Add debugging for user authentication
  useEffect(() => {
    console.log('User authentication status:', {
      user: user,
      token: localStorage.getItem('authToken'),
      isAdmin: user && (user.role === 'admin' || user.role === 'Admin')
    });
  }, [user]);

  useEffect(() => {
    // Prevent duplicate calls in React StrictMode
    if (hasFetched.current) return;
    hasFetched.current = true;

    fetchEmailConfig();
    fetchProviderConfigs();
    checkOAuthStatus();
  }, []);

  // Check for OAuth callback on component mount
  useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      const success = urlParams.get('success');
      const provider = urlParams.get('provider');
      const email = urlParams.get('email');
      const error = urlParams.get('error');
      const outlookConnected = urlParams.get('outlook');

      // Handle OAuth code redirect (if Microsoft sends the code directly to frontend)
      if (code) {
        console.log('📡 Captured OAuth code from URL, forwarding to backend...');
        setOAuthLoading(true);
        try {
          const response = await API.post('/email/oauth/callback', {
            provider: 'outlook',
            code,
            state
          });
          
          if (response.data.success) {
            setTestResult({
              success: true,
              message: 'Outlook account connected successfully!',
              details: { 
                provider: 'outlook', 
                email: response.data.connection?.email || 'Connected',
                connectedAt: new Date().toISOString() 
              }
            });
            setShowTestModal(true);
            checkOAuthStatus();
          }
        } catch (err: any) {
          console.error('❌ Failed to process OAuth code:', err);
          setTestResult({
            success: false,
            message: 'Failed to complete Outlook connection: ' + (err.response?.data?.message || err.message),
            details: { provider: 'outlook', error: err.message }
          });
          setShowTestModal(true);
        } finally {
          setOAuthLoading(false);
          // Clear URL params
          window.history.replaceState({}, '', window.location.pathname);
        }
        return;
      }

      // Handle OAuth callback result - backend-driven redirect (outlook=connected)
      if (outlookConnected === 'connected') {
        setTestResult({
          success: true,
          message: 'Outlook account connected successfully!',
          details: { provider: 'outlook', connectedAt: new Date().toISOString() }
        });
        setShowTestModal(true);
        window.history.replaceState({}, '', window.location.pathname);
        checkOAuthStatus();
      }
      // Handle OAuth callback result - legacy format
      else if (success === 'true' && provider && email) {
        setTestResult({
          success: true,
          message: `${provider === 'gmail' ? 'Gmail' : 'Outlook'} account ${email} connected successfully!`,
          details: { provider, email, connectedAt: new Date().toISOString() }
        });
        setShowTestModal(true);
        window.history.replaceState({}, '', window.location.pathname);
        checkOAuthStatus();
      } else if (success === 'false' && provider && error) {
        setTestResult({
          success: false,
          message: `Failed to connect ${provider === 'gmail' ? 'Gmail' : 'Outlook'}: ${error}`,
          details: { provider, error }
        });
        setShowTestModal(true);
        window.history.replaceState({}, '', window.location.pathname);
      }
    };

    handleCallback();
  }, []);

  // Listen for OAuth messages from popup
  useEffect(() => {
    const handleOAuthMessage = (event: MessageEvent) => {
      if (event.data.type === 'OAUTH_SUCCESS') {
        console.log('Received OAUTH_SUCCESS message:', event.data);
        
        setTestResult({
          success: true,
          message: 'Outlook account connected successfully!',
          details: { 
            provider: 'outlook', 
            email: event.data.data?.email || 'Connected',
            connectedAt: new Date().toISOString() 
          }
        });
        setShowTestModal(true);
        
        // Refresh OAuth status
        checkOAuthStatus();
      }
    };

    window.addEventListener('message', handleOAuthMessage);
    return () => window.removeEventListener('message', handleOAuthMessage);
  }, []);


  const checkOAuthStatus = async () => {
    try {
      console.log('🔍 Checking OAuth status...');
      const response = await API.get('/email/status');
      console.log('📊 OAuth status response:', response.data);
      
      if (response?.data?.success) {
        // Update connection status based on the response
        if (response.data.outlookConnected) {
          setOAuthConnection({
            provider: 'outlook',
            email: response.data.providers?.outlook?.email || 'Connected',
            isActive: true,
            createdAt: new Date().toISOString()
          });
        } else {
          setOAuthConnection(null);
        }
      } else {
        setOAuthConnection(null);
      }
    } catch (err) {
      console.error('❌ Failed to check OAuth status:', err);
      setOAuthConnection(null);
    }
  };

  const fetchProviderConfigs = async () => {
    try {
      const response = await API.get('/admin/provider-configurations');
      if (response?.data && Array.isArray(response.data)) {
        setProviderConfigs(response.data);
        const outlookProvider = response.data.find((p: ProviderConfig) => p.id === 'outlook-365');
        setSelectedProviderInfo(outlookProvider || null);
      } else {
        setProviderConfigs([]);
        setSelectedProviderInfo(null);
      }
    } catch (err) {
      console.error('Failed to fetch provider configurations:', err);
      // Fallback to hardcoded providers if API fails
      const fallbackProviders = [
        {
          id: 'outlook-365',
          name: 'Outlook 365',
          description: 'Use Microsoft Outlook or Office 365 account',
          authType: 'OAuth' as const,
          setupNote: 'Register app in Azure Active Directory and enable Mail.Send permission'
        }
      ];
      setProviderConfigs(fallbackProviders);
      const outlookProvider = fallbackProviders.find(p => p.id === 'outlook-365');
      setSelectedProviderInfo(outlookProvider || null);
    }
  };

  const fetchEmailConfig = async () => {
    try {
      setLoading(true);
      const response = await API.get('/admin/email-configuration');
      if (response?.data && typeof response.data === 'object') {
        setConfig(prev => ({ 
          ...prev, 
          ...response.data,
          enableNotifications: response.data.enableNotifications ?? prev.enableNotifications
        }));
        setSavedConfig(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch email configuration:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectOutlook = async () => {
    try {
      setOAuthLoading(true);
      console.log('Attempting Outlook OAuth connection');
      
      const response = await API.get('/email/oauth/outlook');
      
      console.log('Outlook OAuth response:', response);
      
      if (response?.data?.success && response.data.url) {
        // Open OAuth URL in the same window instead of a popup
        window.location.href = response.data.url;
      } else {
        const errorMessage = response?.data?.message || 'Failed to generate Outlook OAuth authorization URL';
        const isConfigError = errorMessage.includes('not configured') || errorMessage.includes('Missing required environment variables');
        
        setTestResult({
          success: false,
          message: isConfigError 
            ? 'Outlook OAuth is not configured. Please contact your administrator.'
            : errorMessage,
          details: { 
            provider: 'outlook',
            error: errorMessage,
            needsConfiguration: isConfigError
          }
        });
        setShowTestModal(true);
      }
    } catch (err: any) {
      console.error('Outlook OAuth connection error:', err);
      setTestResult({
        success: false,
        message: err?.response?.data?.message || 'Failed to initiate Outlook OAuth connection',
        details: { 
          provider: 'outlook', 
          error: err?.response?.data?.message || err?.message || 'Unknown error'
        }
      });
      setShowTestModal(true);
    } finally {
      setOAuthLoading(false);
    }
  };

  const handleDisconnectOutlook = async () => {
    if (!confirm('Are you sure you want to disconnect your Outlook account?')) {
      return;
    }

    try {
      setOAuthLoading(true);
      console.log('🔌 Disconnecting Outlook account...');
      
      await API.delete('/email/disconnect/outlook');
      
      console.log('✅ Outlook account disconnected successfully');
      setOAuthConnection(null);
      setTestResult({
        success: true,
        message: 'Outlook account disconnected successfully',
        details: null
      });
      setShowTestModal(true);
      
      // Refresh OAuth status after disconnect
      await checkOAuthStatus();
    } catch (err: any) {
      console.error('❌ Failed to disconnect Outlook:', err);
      setTestResult({
        success: false,
        message: err?.response?.data?.message || 'Failed to disconnect Outlook account',
        details: null
      });
      setShowTestModal(true);
    } finally {
      setOAuthLoading(false);
    }
  };

  const handleTestConnection = async () => {
    try {
      setTestLoading(true);
      const response = await API.post('/admin/test-email-configuration', {
        to: user?.officeEmail || user?.email,
        subject: 'Test Email from Timesheet Pro',
        text: 'This is a test email sent from your Timesheet Pro application using your connected Outlook account.',
        html: '<p>This is a test email sent from your Timesheet Pro application using your connected Outlook account.</p>'
      });
      
      if (response?.data) {
        const responseData = response.data;
        setTestResult({ 
          success: responseData.success === true, 
          message: responseData.message || 'Test email sent successfully',
          details: responseData.details 
        });
      } else {
        setTestResult({ 
          success: false, 
          message: 'Unable to send test email. Please check your Outlook connection.',
          details: null 
        });
      }
      setShowTestModal(true);
    } catch (err: any) {
      const errorData = err?.response?.data;
      setTestResult({ 
        success: false, 
        message: errorData?.message || 'Failed to send test email. Please check your Outlook connection.',
        details: errorData?.details || null 
      });
      setShowTestModal(true);
    } finally {
      setTestLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      await API.post('/admin/email-configuration', config);
      setSavedConfig(config);
      setTestResult({ success: true, message: 'Email configuration saved successfully!' });
      setShowTestModal(true);
    } catch (err: any) {
      setTestResult({ 
        success: false, 
        message: err?.response?.data?.message || 'Failed to save email configuration.' 
      });
      setShowTestModal(true);
    } finally {
      setLoading(false);
    }
  };

  const isConfigured = savedConfig && oauthConnection && oauthConnection.isActive;

  return (
    <div className="h-full flex flex-col space-y-6 animate-fade-in max-h-[calc(100vh-120px)] overflow-hidden">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 flex-none">
        <div>
          <h1 className="text-3xl font-extrabold text-secondary-900 tracking-tight">Email Configuration</h1>
          <p className="text-sm font-medium text-secondary-500 mt-1 italic">Connect your Outlook account to send system emails and notifications.</p>
        </div>
        <div className="flex items-center gap-3">
          {isConfigured && (
            <div className="flex items-center gap-2 px-3 py-2 bg-success-50 border border-success-200 rounded-lg">
              <CheckCircleIcon className="w-4 h-4 text-success-600" />
              <span className="text-xs font-bold text-success-700 uppercase tracking-widest">Connected</span>
            </div>
          )}
          <Button variant="secondary" size="sm" className="h-10 border-secondary-200" onClick={fetchEmailConfig} leftIcon={<ArrowPathIcon className="w-4 h-4" />}>
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-hidden">
        {/* Configuration Form */}
        <Card className="lg:col-span-2 flex flex-col h-full overflow-hidden border-none shadow-xl">
          <div className="px-6 py-4 border-b border-secondary-100 flex items-center justify-between bg-white bg-opacity-90 sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-6 bg-primary-600 rounded-full" />
              <h3 className="text-lg font-black text-secondary-900 uppercase tracking-tighter">Outlook Email Connector</h3>
            </div>
            <EnvelopeIcon className="w-5 h-5 text-secondary-400" />
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
            <div className="space-y-6">
              {/* Outlook Connection Status */}
              <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                      <EnvelopeIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-900">Microsoft Outlook</h4>
                      <p className="text-sm text-gray-600">Connect your Outlook account for secure email sending</p>
                    </div>
                  </div>
                  
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    oauthConnection && oauthConnection.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {oauthConnection && oauthConnection.isActive ? 'Connected' : 'Not Connected'}
                  </div>
                </div>

                {/* Connection Details */}
                {oauthConnection && oauthConnection.isActive && (
                  <div className="mb-4 p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-start gap-3">
                      <CheckCircleIcon className="w-5 h-5 text-green-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-green-900">Connected Account</p>
                        <p className="text-sm text-green-700">{oauthConnection.email}</p>
                        <p className="text-xs text-green-600 mt-1">
                          Connected on {oauthConnection.createdAt ? new Date(oauthConnection.createdAt).toLocaleDateString() : 'Recently'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  {!oauthConnection || !oauthConnection.isActive ? (
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={handleConnectOutlook}
                      isLoading={oauthLoading}
                      leftIcon={<ArrowTopRightOnSquareIcon className="w-5 h-5" />}
                      className="flex-1"
                    >
                      {oauthLoading ? 'Connecting...' : 'Connect to Outlook'}
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="secondary"
                        size="lg"
                        onClick={handleDisconnectOutlook}
                        isLoading={oauthLoading}
                        leftIcon={<TrashIcon className="w-5 h-5" />}
                        className="flex-1"
                      >
                        Disconnect Outlook
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Enable Notifications */}
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="enableNotifications"
                  checked={config.enableNotifications}
                  onChange={(e) => setConfig(prev => ({ ...prev, enableNotifications: e.target.checked }))}
                  className="w-4 h-4 text-primary-600 focus:ring-primary-500 rounded"
                />
                <label htmlFor="enableNotifications" className="text-sm font-medium text-gray-700">
                  Enable System Notifications
                </label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="px-6 py-4 bg-secondary-50 border-t border-secondary-100 flex items-center justify-between">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setConfig({ emailProvider: 'outlook-365', enableNotifications: true })}
              className="border-secondary-200"
            >
              Reset Settings
            </Button>
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleTestConnection}
                disabled={testLoading || !oauthConnection}
                isLoading={testLoading}
                leftIcon={<PaperAirplaneIcon className="w-4 h-4" />}
              >
                Test Connection
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveSettings}
                disabled={loading || !oauthConnection}
                isLoading={loading}
                leftIcon={<ShieldCheckIcon className="w-4 h-4" />}
              >
                Save Settings
              </Button>
            </div>
          </div>
        </Card>

        {/* Information Panel */}
        <div className="flex flex-col gap-6 overflow-y-auto no-scrollbar pb-10">
          <Card className="p-6 bg-gradient-to-br from-blue-600 to-blue-800 text-white border-none shadow-elevated">
            <h3 className="text-lg font-black tracking-tight mb-4 flex items-center gap-2">
              <GlobeAltIcon className="w-5 h-5 text-blue-200" />
              Outlook Setup Guide
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <CheckCircleIcon className="w-4 h-4 text-blue-200 mt-0.5 flex-shrink-0" />
                <p className="text-blue-100">Click "Connect to Outlook" to start the OAuth authentication</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircleIcon className="w-4 h-4 text-blue-200 mt-0.5 flex-shrink-0" />
                <p className="text-blue-100">Sign in with your Microsoft account</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircleIcon className="w-4 h-4 text-blue-200 mt-0.5 flex-shrink-0" />
                <p className="text-blue-100">Grant permission to send emails and access your profile</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircleIcon className="w-4 h-4 text-blue-200 mt-0.5 flex-shrink-0" />
                <p className="text-blue-100">Test connection and save configuration</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-none shadow-lg">
            <h3 className="text-sm font-black text-secondary-900 uppercase tracking-widest mb-4">Security Features</h3>
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                <div className="flex items-start gap-2">
                  <LockClosedIcon className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-blue-800">OAuth 2.0 Authentication</p>
                    <p className="text-xs text-blue-700 mt-1">Secure Microsoft authentication with encrypted tokens</p>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-green-50 rounded-xl border border-green-200">
                <div className="flex items-start gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-green-800">No Passwords Required</p>
                    <p className="text-xs text-green-700 mt-1">Uses secure OAuth tokens instead of SMTP credentials</p>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-purple-50 rounded-xl border border-purple-200">
                <div className="flex items-start gap-2">
                  <ShieldCheckIcon className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-purple-800">Auto Token Refresh</p>
                    <p className="text-xs text-purple-700 mt-1">Automatic token refresh for seamless operation</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-none shadow-lg">
            <h3 className="text-sm font-black text-secondary-900 uppercase tracking-widest mb-4">Email Features</h3>
            <div className="space-y-2">
              {[
                'Employee Registration Emails',
                'Leave Approval/Rejection',
                'Timesheet Reminders',
                'Reimbursement Updates',
                'Password Reset Emails',
                'System Notifications'
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-xs">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                  <span className="text-secondary-600">{feature}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Test Result Modal */}
      <Modal
        isOpen={showTestModal}
        onClose={() => setShowTestModal(false)}
        title={testResult?.success ? "Connection Successful" : "Connection Failed"}
        size="md"
      >
        <div className="text-center py-4">
          {testResult?.success ? (
            <div>
              <CheckCircleIcon className="w-16 h-16 text-success-500 mx-auto mb-4" />
              <p className="text-sm font-medium text-secondary-700 mb-4">{testResult?.message || 'Connection successful'}</p>
              {testResult?.details && (
                <div className="bg-success-50 p-4 rounded-lg text-left">
                  <h4 className="text-sm font-bold text-success-800 mb-2">Connection Details:</h4>
                  <div className="space-y-1 text-xs text-success-700">
                    <div><strong>Provider:</strong> {testResult.details?.provider || 'Outlook'}</div>
                    <div><strong>Email:</strong> {testResult.details?.email || 'Connected'}</div>
                    <div><strong>Connected At:</strong> {testResult.details?.connectedAt ? new Date(testResult.details.connectedAt).toLocaleString() : 'Just now'}</div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div>
              <ExclamationTriangleIcon className="w-16 h-16 text-danger-500 mx-auto mb-4" />
              <p className="text-sm font-medium text-secondary-700 mb-4">{testResult?.message || 'Connection failed'}</p>
              {testResult?.details && (
                <div className="space-y-3">
                  {testResult.details?.suggestion && (
                    <div className="bg-amber-50 p-4 rounded-lg text-left">
                      <h4 className="text-sm font-bold text-amber-800 mb-2">Suggested Solution:</h4>
                      <p className="text-xs text-amber-700">{testResult.details.suggestion}</p>
                    </div>
                  )}
                  {testResult.details?.error && (
                    <div className="bg-secondary-50 p-4 rounded-lg text-left">
                      <h4 className="text-sm font-bold text-secondary-800 mb-2">Technical Details:</h4>
                      <p className="text-xs text-secondary-600 font-mono">{testResult.details.error}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex justify-end mt-6">
          <Button variant="primary" size="sm" onClick={() => setShowTestModal(false)}>
            Close
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default EmailConfiguration;
