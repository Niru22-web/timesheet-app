import React, { useEffect } from 'react';

interface OAuthCallbackProps {}

const OAuthCallback: React.FC<OAuthCallbackProps> = () => {
  const urlParams = new URLSearchParams(window.location.search);
  
  useEffect(() => {
    // Handle OAuth callback from popup window
    const messageHandler = (event: MessageEvent) => {
      if (event.data.type === 'OAUTH_SUCCESS') {
        // OAuth was successful
        console.log('OAuth authentication successful:', event.data);
        
        // Close the popup window
        if (window.opener) {
          window.opener.postMessage({ type: 'OAUTH_SUCCESS', data: event.data }, '*');
        }
        
        // Show success message to user
        document.body.innerHTML = `
          <div class="oauth-success-container">
            <h2 class="oauth-success-title">✅ Email Connected Successfully!</h2>
            <p class="oauth-footer-text">Your email account has been connected to the Timesheet System.</p>
            <div class="oauth-info-box">
              <p class="oauth-info-text">
                <strong>Connected Account:</strong><br>
                ${event.data.email || 'Connected Account'}
              </p>
            </div>
            <p class="oauth-footer-text">This window will close automatically in 3 seconds...</p>
          </div>
        `;
        
        // Close popup after 3 seconds
        setTimeout(() => {
          if (window.opener) {
            window.close();
          }
        }, 3000);
      }
    };
    
    window.addEventListener('message', messageHandler);
    
    // Handle errors
    const error = urlParams.get('error');
    if (error) {
      document.body.innerHTML = `
        <div class="oauth-error-container">
          <h2 class="oauth-error-title">❌ Authentication Failed</h2>
          <p class="oauth-footer-text">${decodeURIComponent(error || 'Unknown error')}</p>
          <p class="oauth-footer-text">Please try again or contact your administrator.</p>
          <div style="margin-top: 20px;">
            <button onclick="window.close()" class="oauth-error-button">Close Window</button>
          </div>
        </div>
      `;
    }

    return () => window.removeEventListener('message', messageHandler);
  }, []);
  
  const oauthStyles = `
    .oauth-callback-container {
      font-family: Arial, sans-serif;
    }
    .oauth-loading-wrapper {
      text-align: center;
      margin-top: 50px;
    }
    .oauth-card {
      display: inline-block;
      padding: 20px;
      border: 1px solid #f3f4f6;
      border-radius: 8px;
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
    }
    .oauth-loading-text {
      margin-top: 15px;
      color: #666;
    }
    /* Styles for injected HTML */
    .oauth-success-container {
      font-family: Arial, sans-serif;
      max-width: 400px;
      margin: 50px auto;
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 8px;
      text-align: center;
    }
    .oauth-success-title {
      color: #28a745;
      margin-bottom: 20px;
    }
    .oauth-info-box {
      background-color: #f8f9fa;
      padding: 15px;
      border-radius: 4px;
      margin: 20px 0;
    }
    .oauth-info-text {
      color: #155724;
      margin: 0;
      font-size: 14px;
    }
    .oauth-footer-text {
      color: #666;
      font-size: 12px;
      margin-top: 15px;
    }
    .oauth-error-container {
      font-family: Arial, sans-serif;
      max-width: 400px;
      margin: 50px auto;
      padding: 20px;
      border: 1px solid #dc3545;
      border-radius: 8px;
      text-align: center;
    }
    .oauth-error-title {
      color: #dc3545;
      margin-bottom: 20px;
    }
    .oauth-error-button {
      background-color: #6c757d;
      color: white;
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
  `;

  return (
    <div className="oauth-callback-container">
      <style>{oauthStyles}</style>
      {/* Loading message */}
      {!urlParams.get('code') && !urlParams.get('error') && !urlParams.get('outlook') && (
        <div className="oauth-loading-wrapper">
          <div className="oauth-card">
            <p className="oauth-loading-text">Processing authentication...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default OAuthCallback;
