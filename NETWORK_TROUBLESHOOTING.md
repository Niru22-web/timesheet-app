# Network Connection Troubleshooting Guide 🔧

## ❌ Current Issue

**Frontend Error**: `net::ERR_CONNECTION_RESET`  
**Backend Status**: ✅ Running on port 5000  
**Frontend Status**: ✅ Running on port 5173  
**API Test**: ✅ Working from PowerShell  

## 🔍 Diagnosis

The backend API is working perfectly when tested directly, but frontend can't connect. This suggests:

1. **CORS Configuration** - Backend allows frontend origin
2. **API Configuration** - Frontend pointing to correct URL  
3. **Network Issues** - Possible firewall or proxy interference
4. **Browser Cache** - Stale connections causing issues

## 🛠️ Solutions to Try

### 1. Clear Browser Cache
```
Chrome: Ctrl+Shift+R (hard refresh)
Firefox: Ctrl+F5 (hard refresh)
Edge: Ctrl+F5 (hard refresh)
```

### 2. Check Browser DevTools
1. Open DevTools (F12)
2. Go to Network tab
3. Clear network log
4. Try login again
5. Check if request appears and what error it shows

### 3. Verify Frontend Environment
```bash
# In frontend directory
cat .env
# Should show:
VITE_API_URL=http://localhost:5000/api
```

### 4. Test API from Browser
Open browser and navigate to:
```
http://localhost:5000/api/test
```
Should return: `{"message":"Backend working!"}`

### 5. Test Login from Browser
Open browser and use this URL:
```
http://localhost:5000/api/auth/login
Method: POST
Headers: Content-Type: application/json
Body: {"email":"niranjan.mulam@asaind.co.in","password":"admin123"}
```

### 6. Check for Proxy/VPN
- Disable any VPN or proxy software
- Check if corporate firewall is blocking connections
- Try different browser

### 7. Restart Development Servers
```bash
# Stop both servers
# Kill all node processes

# Restart backend
cd timesheet-backend
npm run dev

# Restart frontend  
cd timesheet-frontend
npm run dev
```

## 📋 Current Configuration

**Backend (.env):**
```env
DATABASE_URL="postgresql://postgres:Niranjan@1093@localhost:5432/timesheetsystem"
```

**Frontend (.env):**
```env
VITE_API_URL=http://localhost:5000/api
```

**CORS (server.ts):**
```javascript
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176"],
  credentials: true
}));
```

## 🧪 Test Commands

### Backend API Test (Working ✅)
```bash
curl -X GET "http://localhost:5000/api/test"
# Returns: {"message":"Backend working!"}
```

### Login Test (Working ✅)
```bash
curl -X POST "http://localhost:5000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"niranjan.mulam@asaind.co.in","password":"admin123"}'
# Returns: {"token":"...", "user":{"role":"admin"}}
```

## 🎯 Most Likely Issues

1. **Browser Cache/Cookies** - Clear browser data
2. **Antivirus/Firewall** - Blocking localhost connections  
3. **Development Server Conflicts** - Multiple node processes
4. **Network Configuration** - Proxy settings interfering

## 🚀 Quick Fix Steps

1. **Clear Browser**: Hard refresh (Ctrl+Shift+R)
2. **Check DevTools**: Network tab for actual error
3. **Restart Servers**: Kill and restart both frontend/backend
4. **Try Different Browser**: Chrome/Firefox/Edge
5. **Check Windows Firewall**: Allow localhost connections

## 📞 If Issue Persists

1. **Check Console Errors**: Browser DevTools Console tab
2. **Network Tab**: See actual HTTP requests/failures
3. **Server Logs**: Check backend terminal for errors
4. **Frontend Logs**: Check frontend terminal for warnings

## ✅ Working Configuration

When everything is working, you should see:
- Backend: `🚀 Server running successfully on port 5000`
- Frontend: `Local:   http://localhost:5173/`
- Login: Successful authentication with admin role
- API: All endpoints accessible from frontend
