# 🔧 ERR_CONNECTION_REFUSED - Complete Fix Guide

## 🚨 Issue: Frontend Cannot Connect to Backend

**Error:** `ERR_CONNECTION_REFUSED` and `Axios Network Error`

**Root Cause:** Backend server is not running or port mismatch between frontend and backend.

---

## 🛠️ **Step 1: Start the Backend Server**

### **Quick Start Options:**

#### **Option A: Use the Scripts I Created**
```bash
cd "c:\Users\Niranjan\Desktop\Web app\timesheet-backend"
.\start-server.bat
```

#### **Option B: Manual Start**
```bash
cd "c:\Users\Niranjan\Desktop\Web app\timesheet-backend"
npm run dev
```

#### **Option C: Fallback Start**
```bash
cd "c:\Users\Niranjan\Desktop\Web app\timesheet-backend"
npm run dev:fallback
```

### **Expected Server Output:**
```
🔧 Environment variables loaded:
JWT_SECRET: SET
Server is running on port 5000
🔧 Environment: development
🌐 API available at: http://localhost:5000/api
```

---

## 🔍 **Step 2: Verify Backend is Running**

### **Test Backend Directly:**
Open browser: `http://localhost:5000/api/health`

**Expected Response:**
```json
{
  "status": "Server is running",
  "timestamp": "2024-03-18T...",
  "port": 5000,
  "environment": "development"
}
```

### **Test Login API:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "test123"}'
```

---

## 📋 **Step 3: Check Frontend API Configuration**

### **Current Frontend API Setup:**
```typescript
// src/api.ts
const API: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true
});
```

### **Environment Variable (Optional):**
Create `.env` file in frontend root:
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🔧 **Step 4: Fix Port Mismatch Issues**

### **Backend Port Detection:**
The backend automatically detects port conflicts:
```
⚠️  Default port 5000 was busy, using port 5001
💡 Update your frontend API URL to: http://localhost:5001/api
```

### **If Backend Uses Different Port:**
Update frontend API URL accordingly:
```typescript
// If backend runs on port 5001
baseURL: "http://localhost:5001/api"
```

---

## 🌐 **Step 5: Add Vite Proxy Configuration**

### **Update vite.config.js:**
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    hmr: false,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        ws: true
      }
    }
  }
})
```

### **Update Frontend API Config:**
```typescript
// src/api.ts
const API: AxiosInstance = axios.create({
  baseURL: "/api", // Use proxy
  withCredentials: true
});
```

---

## 🔥 **Step 6: Fix CORS Configuration**

### **Backend CORS is Already Configured:**
```typescript
// src/server.ts
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176"],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### **Frontend Port (Vite):**
- Default: `http://localhost:5173`
- Already included in CORS configuration

---

## 🚨 **Step 7: Troubleshooting Common Issues**

### **Issue 1: Port Already in Use**
**Error:** `EADDRINUSE: address already in use :::5000`

**Solution:** Backend automatically handles this with port conflict resolution:
```bash
# The script automatically kills port 5000
npm run dev
```

### **Issue 2: Backend Crashes Silently**
**Symptoms:** Server starts then immediately stops

**Solutions:**
```bash
# Check Node.js version
node --version  # Should be v16 or higher

# Clear and reinstall dependencies
cd "c:\Users\Niranjan\Desktop\Web app\timesheet-backend"
rmdir /s node_modules
npm install
npm run dev
```

### **Issue 3: Database Connection Error**
**Error:** Database connection failed

**Solution:** Check `.env` file in backend:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/timesheet_db"
JWT_SECRET="your-secret-key"
FRONTEND_URL="http://localhost:5173"
```

### **Issue 4: Firewall/Antivirus Blocking**
**Symptoms:** Connection refused despite server running

**Solutions:**
- Allow Node.js through Windows Firewall
- Temporarily disable antivirus
- Check if port 5000 is blocked

### **Issue 5: Environment Variables Not Loaded**
**Error:** JWT_SECRET: NOT SET

**Solution:** Ensure `.env` file exists in backend directory and restart server.

---

## 🎯 **Step 8: Complete Testing Checklist**

### **Backend Tests:**
- [ ] Server starts without errors
- [ ] Health endpoint works: `http://localhost:5000/api/health`
- [ ] Login endpoint responds (even with wrong credentials)
- [ ] No CORS errors in browser console

### **Frontend Tests:**
- [ ] Login page loads without network errors
- [ ] API calls show in browser network tab
- [ ] No "ERR_CONNECTION_REFUSED" errors
- [ ] Proper error handling for failed requests

### **Integration Tests:**
- [ ] Login with valid credentials works
- [ ] Invalid credentials show proper error
- [ ] Forgot password works
- [ ] Auth tokens are stored/retrieved properly

---

## 🚀 **Quick Fix Summary**

### **Immediate Solution:**
1. **Start Backend:** `cd timesheet-backend && npm run dev`
2. **Verify Server:** Visit `http://localhost:5000/api/health`
3. **Test Frontend:** Try login - should work now

### **If Still Fails:**
1. **Check Port:** Note the actual port backend uses
2. **Update Frontend:** Change API URL to match backend port
3. **Add Proxy:** Use Vite proxy configuration
4. **Check Firewall:** Ensure port is not blocked

---

## 📞 **Still Having Issues?**

### **Debug Information to Collect:**
1. **Backend Console Output:** Server startup logs
2. **Browser Console:** Network tab errors
3. **Port Usage:** `netstat -ano | findstr :5000`
4. **Environment:** Node.js version, OS version

### **Common Resolution Paths:**
1. **Backend Not Running** → Start server
2. **Port Mismatch** → Update API URL or use proxy
3. **CORS Issues** → Already configured, should work
4. **Firewall Blocking** → Allow port through firewall

The connection should work once the backend server is running and accessible!
