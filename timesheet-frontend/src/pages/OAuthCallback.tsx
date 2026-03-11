import React, { useEffect } from 'react';

interface OAuthCallbackProps {}

const OAuthCallback: React.FC<OAuthCallbackProps> = () => {
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
          <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 50px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; text-align: center;">
            <h2 style="color: #28a745; margin-bottom: 20px;">✅ Email Connected Successfully!</h2>
            <p style="color: #666; margin-bottom: 15px;">Your email account has been connected to the Timesheet System.</p>
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px; margin: 20px 0;">
              <p style="color: #155724; margin: 0; font-size: 14px;">
                <strong>Connected Account:</strong><br>
                ${event.data.email || 'Connected Account'}
              </p>
            </div>
            <p style="color: #666; font-size: 12px; margin-top: 15px;">This window will close automatically in 3 seconds...</p>
          </div>
        `;
        
        // Close popup after 3 seconds
        setTimeout(() => {
          window.close();
        }, 3000);
      }
    };
    
    window.addEventListener('message', messageHandler);
    
    // Handle errors
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    if (error) {
      document.body.innerHTML = `
        <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 50px auto; padding: 20px; border: 1px solid #dc3545; border-radius: 8px; text-align: center;">
          <h2 style="color: #dc3545; margin-bottom: 20px;">❌ Authentication Failed</h2>
          <p style="color: #666; margin-bottom: 15px;">${decodeURIComponent(error || 'Unknown error')}</p>
          <p style="color: #666; font-size: 12px;">Please try again or contact your administrator.</p>
          <div style="margin-top: 20px;">
            <button onclick="window.close()" style="background-color: #6c757d; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer;">Close Window</button>
          </div>
        </div>
      `;
    }
  }, []);
  
  return (
    <div style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* Loading message */}
      {!urlParams.get('code') && !urlParams.get('error') && (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          <div style={{ 
            display: 'inline-block', 
            padding: '20px', 
            border: '4px solid #f3f4f6', 
            borderRadius: '8px'
          }}>
            <div style={{ 
              border: '4px solid #e5e7eb', 
              borderRadius: '4px', 
              padding: '10px 20px', 
              backgroundColor: '#fff'
            }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                borderTop: '4px solid #f3f4f6', 
                borderRadius: '4px', 
                padding: '10px 20px', 
                backgroundColor: '#fff',
                animation: 'spin 1s linear infinite'
              }}></div>
            </div>
            <p style={{ marginTop: '15px', color: '#666' }}>Processing authentication...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default OAuthCallback;
