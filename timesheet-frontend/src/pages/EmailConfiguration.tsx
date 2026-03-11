import React, { useState, useEffect } from 'react';
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
  LockClosedIcon
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
}

interface EmailConfig {
  emailProvider: string;
  senderName: string;
  senderEmail: string;
  smtpHost: string;
  smtpPort: string;
  smtpUsername: string;
  smtpPassword: string;
  encryptionType: 'TLS' | 'SSL';
  oauthConnection?: OAuthConnection;
}

interface ProviderConfig {
  id: string;
  name: string;
  smtpHost: string;
  smtpPort: string;
  encryptionType: 'TLS' | 'SSL';
  authNote: string;
}

const EmailConfiguration: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; details?: any } | null>(null);
  
  const [config, setConfig] = useState<EmailConfig>({
    emailProvider: 'gmail',
    senderName: '',
    senderEmail: '',
    smtpHost: 'smtp.gmail.com',
    smtpPort: '587',
    smtpUsername: '',
    smtpPassword: '',
    encryptionType: 'TLS'
  });

  const [savedConfig, setSavedConfig] = useState<EmailConfig | null>(null);
  const [providerConfigs, setProviderConfigs] = useState<ProviderConfig[]>([]);
  const [selectedProviderInfo, setSelectedProviderInfo] = useState<ProviderConfig | null>(null);
  const [oauthConnection, setOAuthConnection] = useState<OAuthConnection | null>(null);
  const [oauthLoading, setOAuthLoading] = useState(false);

  // Check if user is admin, if not redirect to dashboard
  useEffect(() => {
    if (user && user.role !== 'admin' && user.role !== 'Admin') {
      window.location.href = '/dashboard';
    }
  }, [user]);

  useEffect(() => {
    fetchEmailConfig();
    fetchProviderConfigs();
    checkOAuthStatus();
  }, []);

  const checkOAuthStatus = async () => {
    try {
      const response = await API.get('/api/admin/oauth/status', { 
        params: { provider: config.emailProvider } 
      });
      if (response?.data?.success && response.data.connected) {
        setOAuthConnection(response.data.connection);
      } else {
        setOAuthConnection(null);
      }
    } catch (err) {
      console.error('Failed to check OAuth status:', err);
      setOAuthConnection(null);
    }
  };

  const fetchProviderConfigs = async () => {
    try {
      const response = await API.get('/api/admin/provider-configurations');
      if (response?.data && Array.isArray(response.data)) {
        setProviderConfigs(response.data);
        const defaultProvider = response.data.find((p: ProviderConfig) => p.id === 'gmail');
        setSelectedProviderInfo(defaultProvider || null);
      } else {
        setProviderConfigs([]);
        setSelectedProviderInfo(null);
      }
    } catch (err) {
      console.error('Failed to fetch provider configurations:', err);
      setProviderConfigs([]);
      setSelectedProviderInfo(null);
    }
  };

  const fetchEmailConfig = async () => {
    try {
      setLoading(true);
      const response = await API.get('/api/admin/email-configuration');
      if (response?.data && typeof response.data === 'object') {
        setConfig(response.data);
        setSavedConfig(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch email configuration:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleProviderChange = (provider: string) => {
    const providerConfig = providerConfigs.find(p => p.id === provider);
    setSelectedProviderInfo(providerConfig || null);
    
    setConfig(prev => ({
      ...prev,
      emailProvider: provider,
      smtpHost: providerConfig?.smtpHost || '',
      smtpPort: providerConfig?.smtpPort || '587',
      encryptionType: providerConfig?.encryptionType || 'TLS'
    }));

    // Check OAuth status for the new provider
    checkOAuthStatusForProvider(provider);
  };

  const checkOAuthStatusForProvider = async (provider: string) => {
    try {
      const response = await API.get('/api/admin/oauth/status', { 
        params: { provider } 
      });
      if (response?.data?.success && response.data.connected) {
        setOAuthConnection(response.data.connection);
      } else {
        setOAuthConnection(null);
      }
    } catch (err) {
      console.error('Failed to check OAuth status:', err);
      setOAuthConnection(null);
    }
  };

  const handleConnectOAuth = async () => {
    try {
      setOAuthLoading(true);
      const response = await API.get('/api/admin/oauth/auth-url', {
        params: { provider: config.emailProvider }
      });
      
      if (response?.data?.success && response.data.url) {
        // Store state in sessionStorage for verification
        sessionStorage.setItem('oauth_state', response.data.state);
        sessionStorage.setItem('oauth_provider', config.emailProvider);
        
        // Redirect to OAuth provider
        window.location.href = response.data.url;
      } else {
        const errorMessage = response?.data?.message || 'Failed to generate OAuth authorization URL';
        const isConfigError = errorMessage.includes('not configured') || errorMessage.includes('Missing required environment variables');
        
        setTestResult({
          success: false,
          message: errorMessage,
          details: { 
            error: isConfigError ? 'Configuration Error' : 'Server Error',
            provider: config.emailProvider,
            suggestion: isConfigError 
              ? 'Please configure the OAuth credentials in the backend environment variables'
              : 'Please check the server logs and try again'
          }
        });
        setShowTestModal(true);
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err?.response?.data?.message || 'Failed to initiate OAuth connection',
        details: { 
          error: err.message || 'Network error',
          provider: config.emailProvider,
          suggestion: 'Please check your internet connection and try again'
        }
      });
      setShowTestModal(true);
    } finally {
      setOAuthLoading(false);
    }
  };

  const handleDisconnectOAuth = async () => {
    try {
      setOAuthLoading(true);
      await API.post('/api/admin/oauth/disconnect', {
        provider: config.emailProvider
      });
      
      setOAuthConnection(null);
      setTestResult({
        success: true,
        message: 'OAuth connection disconnected successfully',
        details: null
      });
      setShowTestModal(true);
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err?.response?.data?.message || 'Failed to disconnect OAuth connection',
        details: null
      });
      setShowTestModal(true);
    } finally {
      setOAuthLoading(false);
    }
  };

  // Check for OAuth callback on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const error = urlParams.get('error');
    const storedState = sessionStorage.getItem('oauth_state');
    const storedProvider = sessionStorage.getItem('oauth_provider');

    if ((code || error) && state && storedState === state && storedProvider) {
      handleOAuthCallback(storedProvider, code, error);
      // Clean URL parameters and session storage
      window.history.replaceState({}, document.title, window.location.pathname);
      sessionStorage.removeItem('oauth_state');
      sessionStorage.removeItem('oauth_provider');
    }
  }, []);

  const handleOAuthCallback = async (provider: string, code: string | null, error: string | null) => {
    try {
      if (error) {
        setTestResult({
          success: false,
          message: `OAuth authorization failed: ${error}`,
          details: { 
            error: error,
            provider: provider,
            suggestion: 'Please try again or check your account permissions'
          }
        });
        setShowTestModal(true);
        return;
      }

      if (!code) {
        setTestResult({
          success: false,
          message: 'Invalid OAuth callback: missing authorization code',
          details: { 
            error: 'Missing authorization code',
            provider: provider,
            suggestion: 'Please complete the authorization process and try again'
          }
        });
        setShowTestModal(true);
        return;
      }

      const response = await API.post('/api/admin/oauth/callback', {
        provider,
        code,
        state: sessionStorage.getItem('oauth_state')
      });

      if (response?.data?.success) {
        setOAuthConnection(response.data.connection);
        setTestResult({
          success: true,
          message: 'OAuth connection successful!',
          details: {
            ...response.data.connection,
            connectedAt: new Date().toISOString()
          }
        });
        setShowTestModal(true);
      } else {
        setTestResult({
          success: false,
          message: response?.data?.message || 'Failed to complete OAuth connection',
          details: {
            error: response?.data?.error || 'Unknown error',
            provider: provider,
            suggestion: 'Please check your OAuth app configuration and try again'
          }
        });
        setShowTestModal(true);
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err?.response?.data?.message || 'Failed to handle OAuth callback',
        details: {
          error: err.message || 'Network error',
          provider: provider,
          suggestion: 'Please check your internet connection and try again'
        }
      });
      setShowTestModal(true);
    }
  };

  const handleTestConnection = async () => {
    try {
      setTestLoading(true);
      const response = await API.post('/api/admin/test-email-configuration', config);
      
      if (response?.data) {
        const responseData = response.data;
        setTestResult({ 
          success: responseData.success === true, 
          message: responseData.message || 'Test completed successfully',
          details: responseData.details 
        });
      } else {
        setTestResult({ 
          success: false, 
          message: 'Unable to process test request. Please check SMTP settings.',
          details: null 
        });
      }
      setShowTestModal(true);
    } catch (err: any) {
      const errorData = err?.response?.data;
      setTestResult({ 
        success: false, 
        message: errorData?.message || 'Failed to send test email. Please check your configuration.',
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
      await API.post('/api/admin/email-configuration', config);
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

  const handleResetSettings = () => {
    setConfig({
      emailProvider: 'gmail',
      senderName: '',
      senderEmail: '',
      smtpHost: 'smtp.gmail.com',
      smtpPort: '587',
      smtpUsername: '',
      smtpPassword: '',
      encryptionType: 'TLS'
    });
  };

  const isOAuthProvider = (provider: string) => {
  return ['gmail', 'outlook', 'zoho'].includes(provider);
};

const isConfigured = savedConfig && savedConfig.senderEmail && savedConfig.smtpHost;

  return (
    <div className="h-full flex flex-col space-y-6 animate-fade-in max-h-[calc(100vh-120px)] overflow-hidden">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 flex-none">
        <div>
          <h1 className="text-3xl font-extrabold text-secondary-900 tracking-tight">Email Configuration</h1>
          <p className="text-sm font-medium text-secondary-500 mt-1 italic">Configure SMTP settings for system emails and notifications.</p>
        </div>
        <div className="flex items-center gap-3">
          {isConfigured && (
            <div className="flex items-center gap-2 px-3 py-2 bg-success-50 border border-success-200 rounded-lg">
              <CheckCircleIcon className="w-4 h-4 text-success-600" />
              <span className="text-xs font-bold text-success-700 uppercase tracking-widest">Configured</span>
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
              <h3 className="text-lg font-black text-secondary-900 uppercase tracking-tighter">SMTP Settings</h3>
            </div>
            <EnvelopeIcon className="w-5 h-5 text-secondary-400" />
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
            <div className="space-y-6">
              {/* Email Provider */}
              <div>
                <label className="block text-sm font-bold text-secondary-700 mb-2">Email Provider</label>
                <select
                  value={config.emailProvider}
                  onChange={(e) => handleProviderChange(e.target.value)}
                  className="w-full px-4 py-3 border border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-sm font-medium"
                >
                  {providerConfigs.map(provider => (
                    <option key={provider.id} value={provider.id}>
                      {provider.name}
                    </option>
                  ))}
                </select>
                
                {/* OAuth Connection Status */}
                {isOAuthProvider(config.emailProvider) && (
                  <div className="mt-4 p-4 bg-secondary-50 rounded-xl border border-secondary-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {oauthConnection && oauthConnection.isActive ? (
                          <>
                            <CheckCircleIcon className="w-5 h-5 text-success-600" />
                            <div>
                              <p className="text-sm font-bold text-success-800">Connected</p>
                              <p className="text-xs text-success-600">{oauthConnection.email}</p>
                            </div>
                          </>
                        ) : (
                          <>
                            <ExclamationTriangleIcon className="w-5 h-5 text-amber-600" />
                            <div>
                              <p className="text-sm font-bold text-amber-800">Not Connected</p>
                              <p className="text-xs text-amber-600">Click below to connect your account</p>
                            </div>
                          </>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {oauthConnection && oauthConnection.isActive ? (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={handleDisconnectOAuth}
                            isLoading={oauthLoading}
                            className="text-xs"
                          >
                            Disconnect
                          </Button>
                        ) : (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={handleConnectOAuth}
                            isLoading={oauthLoading}
                            leftIcon={<GlobeAltIcon className="w-4 h-4" />}
                            className="text-xs"
                          >
                            Connect {selectedProviderInfo?.name || 'Account'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                {selectedProviderInfo && selectedProviderInfo.authNote && !oauthConnection && (
                  <p className="mt-2 text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
                    <ExclamationTriangleIcon className="w-3 h-3 inline mr-1" />
                    {selectedProviderInfo.authNote}
                  </p>
                )}
              </div>

              {/* Sender Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-secondary-700 mb-2">Sender Name</label>
                  <Input
                    type="text"
                    value={config.senderName}
                    onChange={(e) => setConfig(prev => ({ ...prev, senderName: e.target.value }))}
                    placeholder="Company Name"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-secondary-700 mb-2">Sender Email Address</label>
                  <Input
                    type="email"
                    value={config.senderEmail}
                    onChange={(e) => setConfig(prev => ({ ...prev, senderEmail: e.target.value }))}
                    placeholder="noreply@company.com"
                    className="w-full"
                  />
                </div>
              </div>

              {/* SMTP Configuration */}
              <div className="space-y-4">
                <h4 className="text-sm font-black text-secondary-900 uppercase tracking-widest">Server Configuration</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-secondary-700 mb-2">SMTP Host</label>
                    <Input
                      type="text"
                      value={config.smtpHost}
                      onChange={(e) => setConfig(prev => ({ ...prev, smtpHost: e.target.value }))}
                      placeholder="smtp.gmail.com"
                      disabled={config.emailProvider !== 'custom' || !!(oauthConnection && oauthConnection.isActive)}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-secondary-700 mb-2">SMTP Port</label>
                    <Input
                      type="text"
                      value={config.smtpPort}
                      onChange={(e) => setConfig(prev => ({ ...prev, smtpPort: e.target.value }))}
                      placeholder="587"
                      disabled={config.emailProvider !== 'custom' || !!(oauthConnection && oauthConnection.isActive)}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-secondary-700 mb-2">SMTP Username</label>
                    <Input
                      type="text"
                      value={config.smtpUsername}
                      onChange={(e) => setConfig(prev => ({ ...prev, smtpUsername: e.target.value }))}
                      placeholder="your-email@gmail.com"
                      disabled={config.emailProvider !== 'custom' || !!(oauthConnection && oauthConnection.isActive)}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-secondary-700 mb-2">SMTP Password</label>
                    <Input
                      type="password"
                      value={config.smtpPassword}
                      onChange={(e) => setConfig(prev => ({ ...prev, smtpPassword: e.target.value }))}
                      placeholder="App password or SMTP password"
                      disabled={config.emailProvider !== 'custom' || !!(oauthConnection && oauthConnection.isActive)}
                      className="w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-secondary-700 mb-2">Encryption Type</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value="TLS"
                        checked={config.encryptionType === 'TLS'}
                        onChange={(e) => setConfig(prev => ({ ...prev, encryptionType: e.target.value as 'TLS' | 'SSL' }))}
                        disabled={config.emailProvider !== 'custom' || !!(oauthConnection && oauthConnection.isActive)}
                        className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm font-medium text-secondary-700">TLS</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value="SSL"
                        checked={config.encryptionType === 'SSL'}
                        onChange={(e) => setConfig(prev => ({ ...prev, encryptionType: e.target.value as 'TLS' | 'SSL' }))}
                        disabled={config.emailProvider !== 'custom' || !!(oauthConnection && oauthConnection.isActive)}
                        className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm font-medium text-secondary-700">SSL</span>
                    </label>
                  </div>
                </div>

                {/* OAuth Status Message */}
                {oauthConnection && oauthConnection.isActive && isOAuthProvider(config.emailProvider) && (
                  <div className="bg-success-50 p-4 rounded-xl border border-success-200">
                    <div className="flex items-center gap-3">
                      <CheckCircleIcon className="w-5 h-5 text-success-600" />
                      <div>
                        <p className="text-sm font-bold text-success-800">OAuth Authentication Active</p>
                        <p className="text-xs text-success-600">
                          SMTP fields are disabled because authentication is handled by OAuth.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="px-6 py-4 bg-secondary-50 border-t border-secondary-100 flex items-center justify-between">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleResetSettings}
              className="border-secondary-200"
            >
              Reset Settings
            </Button>
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleTestConnection}
                disabled={testLoading || (!oauthConnection && (!config.senderEmail || !config.smtpUsername || !config.smtpPassword))}
                isLoading={testLoading}
                leftIcon={<PaperAirplaneIcon className="w-4 h-4" />}
              >
                Test Connection
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveSettings}
                disabled={loading || (!oauthConnection && (!config.senderEmail || !config.smtpUsername || !config.smtpPassword))}
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
          <Card className="p-6 bg-gradient-to-br from-primary-600 to-primary-800 text-white border-none shadow-elevated">
            <h3 className="text-lg font-black tracking-tight mb-4 flex items-center gap-2">
              <GlobeAltIcon className="w-5 h-5 text-primary-200" />
              Setup Guide
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <CheckCircleIcon className="w-4 h-4 text-primary-200 mt-0.5 flex-shrink-0" />
                <p className="text-primary-100">Choose your email provider from the dropdown</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircleIcon className="w-4 h-4 text-primary-200 mt-0.5 flex-shrink-0" />
                <p className="text-primary-100">Enter sender details and SMTP credentials</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircleIcon className="w-4 h-4 text-primary-200 mt-0.5 flex-shrink-0" />
                <p className="text-primary-100">Test connection before saving settings</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircleIcon className="w-4 h-4 text-primary-200 mt-0.5 flex-shrink-0" />
                <p className="text-primary-100">Save configuration to enable automated emails</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-none shadow-lg">
            <h3 className="text-sm font-black text-secondary-900 uppercase tracking-widest mb-4">Security Notes</h3>
            <div className="space-y-3">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                <div className="flex items-start gap-2">
                  <ExclamationTriangleIcon className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-amber-800">Use App Passwords</p>
                    <p className="text-xs text-amber-700 mt-1">For Gmail/Outlook, use app-specific passwords instead of your main password.</p>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                <div className="flex items-start gap-2">
                  <LockClosedIcon className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-blue-800">Encrypted Storage</p>
                    <p className="text-xs text-blue-700 mt-1">All SMTP credentials are encrypted and stored securely.</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-none shadow-lg">
            <h3 className="text-sm font-black text-secondary-900 uppercase tracking-widest mb-4">Supported Events</h3>
            <div className="space-y-2">
              {[
                'Employee Registration',
                'Leave Approval/Rejection',
                'Timesheet Reminders',
                'Reimbursement Updates',
                'Password Reset'
              ].map((event, index) => (
                <div key={index} className="flex items-center gap-2 text-xs">
                  <div className="w-1.5 h-1.5 bg-primary-500 rounded-full" />
                  <span className="text-secondary-600">{event}</span>
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
                    <div><strong>Provider:</strong> {testResult.details?.provider || 'Unknown'}</div>
                    <div><strong>Host:</strong> {testResult.details?.host || 'Unknown'}</div>
                    <div><strong>Port:</strong> {testResult.details?.port || 'Unknown'}</div>
                    <div><strong>Encryption:</strong> {testResult.details?.encryption || 'Unknown'}</div>
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
                  {testResult.details?.guidance && (
                    <div className="bg-amber-50 p-4 rounded-lg text-left">
                      <h4 className="text-sm font-bold text-amber-800 mb-2">Recommended Solution:</h4>
                      <p className="text-xs text-amber-700">{testResult.details.guidance}</p>
                    </div>
                  )}
                  {testResult.details?.authNote && (
                    <div className="bg-blue-50 p-4 rounded-lg text-left">
                      <h4 className="text-sm font-bold text-blue-800 mb-2">Authentication Note:</h4>
                      <p className="text-xs text-blue-700">{testResult.details.authNote}</p>
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
