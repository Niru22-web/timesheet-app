# 🚨 404 Error Fix - Complete Backend Setup Guide

## 📋 Issue: "Failed to load resource: the server responded with a status of 404 (Not Found)"

This error means the **backend server is not running** or not accessible.

## 🛠️ Quick Fix - Start the Backend Server

### **Method 1: Use the Created Scripts**

#### **Option A: Batch File (Windows)**
1. Navigate to: `c:\Users\Niranjan\Desktop\Web app\timesheet-backend`
2. Double-click: `start-server.bat`
3. Wait for server to start

#### **Option B: PowerShell Script**
1. Open PowerShell as Administrator
2. Navigate to backend directory:
   ```powershell
   cd "c:\Users\Niranjan\Desktop\Web app\timesheet-backend"
   ```
3. Run the script:
   ```powershell
   .\start-server.ps1
   ```

#### **Option C: Manual Start**
1. Open Command Prompt or PowerShell
2. Navigate to backend directory:
   ```bash
   cd "c:\Users\Niranjan\Desktop\Web app\timesheet-backend"
   ```
3. Start the server:
   ```bash
   npm run dev
   ```

### **Method 2: Use Existing Batch File**
The project already has a batch file:
```bash
# Navigate to project root
cd "c:\Users\Niranjan\Desktop\Web app"

# Run the existing script
.\create-timesheet-backend.bat
```

## ✅ Expected Server Output

When the server starts successfully, you should see:
```
🔧 Environment variables loaded:
JWT_SECRET: SET
Server is running on port 5000
Database connected successfully
API endpoints ready:
  POST /api/auth/login
  POST /api/auth/forgot-password
  POST /api/auth/register
  GET /api/health
```

## 🔍 Verify Server is Running

### **Test 1: Health Check**
Open in browser: `http://localhost:5000/api/health`

**Expected Response:**
```json
{
  "status": "Server is running",
  "timestamp": "2024-03-18T...",
  "port": 5000,
  "environment": "development"
}
```

### **Test 2: Forgot Password Endpoint**
```bash
curl -X POST http://localhost:5000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "If this email exists in our system, a password reset link has been sent."
}
```

## 🚨 Common Issues & Solutions

### **Issue 1: Port 5000 Already in Use**
**Error:** `EADDRINUSE: address already in use :::5000`

**Solution:** The `npm run dev` script automatically kills port 5000. If it still fails:
```bash
# Manually kill the port
npx kill-port 5000

# Then start server
npm run dev
```

### **Issue 2: Node Modules Not Found**
**Error:** `Cannot find module 'express'`

**Solution:** Install dependencies:
```bash
cd "c:\Users\Niranjan\Desktop\Web app\timesheet-backend"
npm install
```

### **Issue 3: TypeScript Compilation Error**
**Error:** `TS2307: Cannot find module`

**Solution:** Use fallback script:
```bash
npm run dev:fallback
```

### **Issue 4: Database Connection Error**
**Error:** Database connection failed

**Solution:** Check database configuration in `.env` file:
```bash
# Create .env file in backend directory
DATABASE_URL="postgresql://username:password@localhost:5432/timesheet_db"
JWT_SECRET="your-secret-key"
FRONTEND_URL="http://localhost:5173"
```

### **Issue 5: PowerShell Execution Policy**
**Error:** `Scripts are disabled on this system`

**Solution:** Run PowerShell as Administrator and execute:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## 🎯 Frontend Configuration

### **Check Frontend API URL**
Ensure frontend is configured to connect to the correct backend URL.

In `src/api/index.ts` or similar:
```typescript
const API_BASE_URL = 'http://localhost:5000/api';
```

### **CORS Configuration**
Backend CORS should include frontend URL:
```typescript
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"],
  credentials: true
}));
```

## 🔧 Complete Setup Checklist

### **Backend Setup:**
- [ ] Node.js installed (v16 or higher)
- [ ] Navigate to `timesheet-backend` directory
- [ ] Run `npm install` (first time only)
- [ ] Start server with `npm run dev`
- [ ] Verify server runs on `http://localhost:5000`
- [ ] Test forgot password endpoint

### **Frontend Setup:**
- [ ] Frontend running on `http://localhost:5173`
- [ ] API configured for `http://localhost:5000/api`
- [ ] No CORS errors in browser console

### **Testing:**
- [ ] Visit `/forgot-password` in frontend
- [ ] Enter email address
- [ ] Should see success message or proper error
- [ ] Check browser network tab for API calls

## 🚀 After Server is Running

Once the backend server is running, the forgot password functionality should work:

1. **Frontend** → Makes API call to `/api/auth/forgot-password`
2. **Backend** → Receives request, generates token
3. **Email** → Sends password reset email (if configured)
4. **User** → Receives email with reset link
5. **Success** → Frontend shows success message

## 📞 Still Having Issues?

If the server still won't start:

1. **Check Node.js Version:**
   ```bash
   node --version  # Should be v16 or higher
   ```

2. **Clear Node Modules:**
   ```bash
   cd "c:\Users\Niranjan\Desktop\Web app\timesheet-backend"
   rmdir /s node_modules
   npm install
   npm run dev
   ```

3. **Check for Port Conflicts:**
   ```bash
   netstat -ano | findstr :5000
   ```

4. **Check Firewall/Antivirus:**
   - Ensure Node.js is allowed through firewall
   - Temporarily disable antivirus if blocking

The server should start successfully and resolve the 404 errors!
