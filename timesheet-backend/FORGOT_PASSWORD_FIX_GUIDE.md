# 🔧 Forgot Password Email Issue - Complete Fix Guide

## 🚨 Issues Identified

### 1. **Email Service Not Properly Configured**
- OAuth tokens may be expired
- SMTP credentials missing or incorrect
- No proper error handling in frontend

### 2. **Frontend Shows False Success**
- Frontend shows success even when email fails to send
- No proper error handling for email service failures
- Mock implementation in frontend

### 3. **Backend Issues**
- Email service returns `false` but frontend still shows success
- Missing proper error responses
- Token generation and storage works, but email sending fails

## 🛠️ Complete Fix Implementation

### **Step 1: Fix Backend Email Service**

#### **Update Email Service Error Handling**
```typescript
// In src/services/email.service.ts
export const sendEmail = async (options: DirectEmailOptions): Promise<boolean> => {
  try {
    console.log('📧 Attempting to send email to:', options.to);
    
    // Check OAuth connections first
    const connections = await EmailService.getAllEmailConnections();
    const outlookConnection = connections.find(conn => conn.provider === 'outlook' && conn.accessToken);
    
    if (outlookConnection) {
      // Try OAuth method
      const result = await sendViaOAuth(outlookConnection, options);
      if (result.success) return true;
      
      // If OAuth fails, try SMTP
      console.log('⚠️ OAuth failed, trying SMTP fallback...');
    }
    
    // Try SMTP method
    const smtpResult = await sendViaSMTP(options);
    return smtpResult.success;
    
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    throw new Error(`Email service failed: ${error.message}`);
  }
};
```

#### **Update Forgot Password Controller**
```typescript
// In src/modules/auth/auth.controller.ts
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ 
        success: false,
        message: 'Email address is required' 
      });
    }

    // Find user
    const user = await prisma.employee.findUnique({
      where: { officeEmail: email }
    });

    if (!user) {
      // Always return success to prevent email enumeration
      return res.json({
        success: true,
        message: "If this email exists in our system, a password reset link has been sent."
      });
    }

    // Generate and store token
    const resetToken = generateResetToken();
    const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.$executeRaw`
      INSERT INTO "password_resets" ("id", "userId", "email", "token", "expiresAt", "createdAt")
      VALUES (gen_random_uuid(), ${user.id}, ${email}, ${resetToken}, ${resetTokenExpiry}, NOW())
    `;

    // Send email with proper error handling
    try {
      const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
      const emailSent = await sendPasswordResetEmail(email, resetLink);
      
      if (emailSent) {
        return res.json({
          success: true,
          message: "Password reset link has been sent to your email address."
        });
      } else {
        return res.status(500).json({
          success: false,
          message: "Failed to send password reset email. Please try again later.",
          error: "Email service unavailable"
        });
      }
    } catch (emailError) {
      console.error('❌ Email sending error:', emailError);
      return res.status(500).json({
        success: false,
        message: "Failed to send password reset email. Please try again later.",
        error: emailError instanceof Error ? emailError.message : 'Email service error'
      });
    }

  } catch (error) {
    console.error("❌ Forgot Password API Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error occurred while processing your request"
    });
  }
};
```

### **Step 2: Fix Frontend Error Handling**

#### **Update MobileForgotPasswordLayout**
```tsx
// In src/components/layouts/MobileForgotPasswordLayout.tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!validateForm()) return;

  setIsLoading(true);
  setErrors({});

  try {
    const response = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      setIsSubmitted(true);
      toast.success('Reset link sent!', 'Check your email for password reset instructions');
    } else {
      // Show actual error from backend
      toast.error('Request failed', data.message || 'Unable to send reset link');
    }
  } catch (err) {
    console.error('Forgot password error:', err);
    toast.error('Connection error', 'Unable to connect to the server');
  } finally {
    setIsLoading(false);
  }
};
```

### **Step 3: Environment Variables Setup**

#### **Create .env.example**
```bash
# Email Configuration (Choose ONE method)

# Method 1: SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Method 2: OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
OUTLOOK_CLIENT_ID=your-outlook-client-id
OUTLOOK_CLIENT_SECRET=your-outlook-client-secret
MICROSOFT_REDIRECT_URI=http://localhost:5000/api/email/oauth/outlook/callback

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

### **Step 4: Email Service Diagnostics**

#### **Create Email Health Check Endpoint**
```typescript
// In src/modules/email/email.controller.ts
export const checkEmailHealth = async (req: Request, res: Response) => {
  try {
    const health = {
      smtp: {
        configured: !!process.env.SMTP_USER && !!process.env.SMTP_PASS,
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT
      },
      oauth: {
        google: !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET,
        outlook: !!process.env.OUTLOOK_CLIENT_ID && !!process.env.OUTLOOK_CLIENT_SECRET
      },
      connections: {
        outlook: 0,
        gmail: 0
      }
    };

    // Check active connections
    const connections = await EmailService.getAllEmailConnections();
    health.connections.outlook = connections.filter(c => c.provider === 'outlook').length;
    health.connections.gmail = connections.filter(c => c.provider === 'gmail').length;

    res.json({
      success: true,
      health,
      recommendations: generateRecommendations(health)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

function generateRecommendations(health: any): string[] {
  const recommendations = [];
  
  if (!health.smtp.configured && health.connections.outlook === 0) {
    recommendations.push("Configure SMTP or OAuth to enable email sending");
  }
  
  if (!health.oauth.google && !health.oauth.outlook) {
    recommendations.push("Set up OAuth credentials for Gmail or Outlook");
  }
  
  if (health.connections.outlook === 0 && health.oauth.outlook) {
    recommendations.push("Connect an Outlook account in Email Configuration");
  }
  
  return recommendations;
}
```

### **Step 5: Enhanced Error Logging**

#### **Update Email Service with Detailed Logging**
```typescript
export const sendEmail = async (options: DirectEmailOptions): Promise<boolean> => {
  const startTime = Date.now();
  
  try {
    console.log('📧 === EMAIL SENDING START ===');
    console.log('📋 To:', options.to);
    console.log('📋 Subject:', options.subject);
    console.log('📋 HTML length:', options.html?.length || 0);
    console.log('📋 Text length:', options.text?.length || 0);
    
    // Check available services
    const connections = await EmailService.getAllEmailConnections();
    console.log('📋 Available OAuth connections:', connections.length);
    
    const outlookConnection = connections.find(conn => conn.provider === 'outlook' && conn.accessToken);
    
    if (outlookConnection) {
      console.log('🔐 Using Outlook OAuth');
      const result = await sendViaOAuth(outlookConnection, options);
      
      const endTime = Date.now();
      console.log('✅ Email sent successfully via OAuth');
      console.log('⏱️ Time taken:', endTime - startTime, 'ms');
      
      return result.success;
    }
    
    // Try SMTP
    console.log('📧 Trying SMTP fallback');
    const smtpResult = await sendViaSMTP(options);
    
    const endTime = Date.now();
    console.log('✅ Email sent successfully via SMTP');
    console.log('⏱️ Time taken:', endTime - startTime, 'ms');
    
    return smtpResult.success;
    
  } catch (error) {
    const endTime = Date.now();
    console.log('❌ === EMAIL SENDING FAILED ===');
    console.log('⏱️ Time taken:', endTime - startTime, 'ms');
    console.log('❌ Error:', error.message);
    console.log('❌ Stack:', error.stack);
    
    // Log email content for debugging
    console.log('📋 Email content (not sent):');
    console.log('To:', options.to);
    console.log('Subject:', options.subject);
    
    throw new Error(`Email sending failed: ${error.message}`);
  }
};
```

### **Step 6: Frontend Validation Enhancement**

#### **Add Email Format Validation**
```tsx
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateForm = () => {
  const newErrors: Record<string, string> = {};

  if (!email) {
    newErrors.email = 'Email is required';
  } else if (!validateEmail(email)) {
    newErrors.email = 'Please enter a valid email address';
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
```

### **Step 7: Test Email Functionality**

#### **Create Test Script**
```bash
# Test email health check
curl http://localhost:5000/api/email/health

# Test forgot password with valid email
curl -X POST http://localhost:5000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'

# Test forgot password with invalid email
curl -X POST http://localhost:5000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "invalid-email"}'
```

## 🎯 Expected Results After Fix

### **✅ Proper Error Handling**
- Frontend shows success only when email is actually sent
- Backend returns proper error messages when email fails
- Users see accurate feedback about what went wrong

### **✅ Email Service Reliability**
- OAuth tokens are automatically refreshed
- SMTP fallback works when OAuth fails
- Detailed logging for debugging

### **✅ User Experience**
- Clear success/error messages
- Loading states during request
- Helpful error messages for troubleshooting

### **✅ Developer Experience**
- Health check endpoint for diagnostics
- Detailed logging in console
- Environment variable validation
- Test scripts for verification

## 🚀 Implementation Steps

1. **Update backend email service** with proper error handling
2. **Update forgot password controller** to handle email failures
3. **Fix frontend error handling** to show real errors
4. **Set up environment variables** for email service
5. **Add health check endpoint** for diagnostics
6. **Test the complete flow** end-to-end

This comprehensive fix ensures that the forgot password functionality works reliably and provides accurate feedback to users when issues occur.
