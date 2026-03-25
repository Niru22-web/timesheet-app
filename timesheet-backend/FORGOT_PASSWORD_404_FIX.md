# 🔧 Forgot Password API 404 Error - Fix Guide

## 🚨 Issue Identified

The error `api/auth/forgot-password:1 Failed to load resource: the server responded with a status of 404 (Not Found)` indicates that:

1. **Backend server is not running** OR
2. **API route is not properly mounted** OR
3. **CORS configuration issue**

## 🛠️ Solutions Applied

### **1. Frontend Error Handling Fixed**

#### **Problem:**
```tsx
const data = await response.json(); // ❌ Fails on empty response
```

#### **Solution:**
```tsx
// Check if response is empty or not JSON
const text = await response.text();
let data;

try {
  data = text ? JSON.parse(text) : {};
} catch (jsonError) {
  console.error('Failed to parse JSON response:', text);
  data = { success: false, message: 'Invalid server response' };
}

if (response.ok && data.success) {
  // Success handling
} else {
  const errorMessage = data?.message || `Server error (${response.status})`;
  toast.error('Request failed', errorMessage);
}
```

### **2. Network Error Detection**

#### **Enhanced Error Handling:**
```tsx
} catch (err) {
  console.error('Forgot password error:', err);
  
  if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
    toast.error('Connection error', 'Unable to connect to the server. Please check if the server is running.');
  } else {
    toast.error('Request failed', 'An unexpected error occurred. Please try again.');
  }
}
```

## 🔍 Troubleshooting Steps

### **Step 1: Verify Backend Server is Running**

```bash
# Navigate to backend directory
cd "c:\Users\Niranjan\Desktop\Web app\timesheet-backend"

# Start the server
npm run dev
# or
npm start
```

**Expected Output:**
```
🔧 Environment variables loaded:
JWT_SECRET: SET
Server is running on port 5000
```

### **Step 2: Test API Endpoint Directly**

```bash
# Test the forgot password endpoint
curl -X POST http://localhost:5000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Password reset link has been sent to your email address."
}
```

### **Step 3: Check Server Logs**

Look for these logs in the backend console:
```
🔐 Forgot password request received for: test@example.com
✅ User found: test@example.com
✅ Reset token stored in database for user: 123
📧 Attempting to send password reset email...
```

### **Step 4: Verify Route Configuration**

The route should be properly mounted in `server.ts`:
```typescript
// Authentication routes
app.use("/api/auth", authRoutes);
```

And in `auth.routes.ts`:
```typescript
router.post("/forgot-password", forgotPassword);
```

## 🚀 Common Issues & Solutions

### **Issue 1: Backend Server Not Running**

**Symptoms:**
- 404 error on all API calls
- "Failed to fetch" error

**Solution:**
```bash
# Start the backend server
cd timesheet-backend
npm run dev
```

### **Issue 2: Port Mismatch**

**Symptoms:**
- CORS errors
- Connection refused

**Solution:**
Ensure frontend is configured for the correct backend port (default: 5000).

### **Issue 3: CORS Configuration**

**Symptoms:**
- CORS policy errors in browser console

**Solution:**
Backend CORS should include frontend URL:
```typescript
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174"],
  credentials: true
}));
```

### **Issue 4: Empty Response**

**Symptoms:**
- "Unexpected end of JSON input" error

**Solution:**
Frontend now handles empty responses gracefully with the enhanced error handling.

## ✅ Fixed Components

### **1. ForgotPassword3DLayout.tsx**
- ✅ Enhanced error handling
- ✅ Network error detection
- ✅ Empty response handling
- ✅ User-friendly error messages

### **2. MobileForgotPasswordLayout.tsx**
- ✅ Same enhanced error handling
- ✅ Mobile-optimized error messages
- ✅ Proper loading states

## 🎯 Expected Behavior After Fix

### **When Server is Running:**
1. User enters email → API call succeeds
2. Backend processes request → Token generated
3. Email sent (if configured) → Success message shown
4. User receives email → Can reset password

### **When Server is Not Running:**
1. User enters email → Network error detected
2. Clear error message: "Unable to connect to the server"
3. User knows to check server status

### **When API Fails:**
1. User enters email → API returns error
2. Specific error message shown
3. User knows what went wrong

## 🚀 Next Steps

1. **Start Backend Server**: `npm run dev` in timesheet-backend directory
2. **Test API Endpoint**: Use curl or Postman to verify it works
3. **Test Frontend**: Try forgot password form
4. **Check Email Configuration**: Set up SMTP or OAuth for actual email sending

The error handling is now robust and will provide clear feedback about what's happening!
