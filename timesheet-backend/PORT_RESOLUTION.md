# Port Conflict Resolution System

## Overview
The backend now includes automatic port conflict resolution to prevent `EADDRINUSE` errors during development.

## Features

### 1. Automatic Port Detection
- Server starts on default port 5000
- If port 5000 is busy, automatically tries 5001, 5002, etc.
- Logs clearly show which port is being used

### 2. Enhanced Logging
- 🚀 Server startup success message
- 📡 API endpoint URL
- 🔧 Environment information
- ⚠️ Port conflict warnings
- 💡 Frontend configuration hints

### 3. Graceful Shutdown
- Handles SIGTERM and SIGINT signals
- Properly closes server connections
- Clean process termination

### 4. Development Scripts
- `npm run dev` - Kills port 5000 first, then starts server
- `npm run dev:fallback` - Starts server without port killing

## Usage

### Normal Development
```bash
npm run dev
```
This will:
1. Kill any process on port 5000
2. Start server on available port (5000, 5001, 5002, etc.)
3. Log the actual port being used

### Fallback Development
```bash
npm run dev:fallback
```
Starts server with automatic port conflict resolution only.

## Frontend Configuration

### Dynamic API URL
The frontend now supports dynamic backend port configuration via environment variable:

```env
# In frontend/.env
VITE_API_URL=http://localhost:5000/api
```

If backend runs on port 5001, update to:
```env
VITE_API_URL=http://localhost:5001/api
```

## Server Output Examples

### Port 5000 Available
```
🚀 Server running successfully on port 5000
📡 API available at: http://localhost:5000/api
🔧 Environment: development
```

### Port 5000 Busy, Using 5001
```
❌ Port 5000 is already in use
🔄 Trying next available port: 5001...
🚀 Server running successfully on port 5001
📡 API available at: http://localhost:5001/api
🔧 Environment: development
⚠️ Default port 5000 was busy, using port 5001
💡 Update your frontend API URL to: http://localhost:5001/api
```

## Troubleshooting

### If Port Still Conflicts
1. Check for zombie processes: `netstat -ano | findstr :5000`
2. Kill all Node processes: `taskkill /IM node.exe /F`
3. Use fallback script: `npm run dev:fallback`

### OAuth Integration
The OAuth endpoints work regardless of port:
- `/api/email/oauth/outlook` - Returns Microsoft OAuth URL
- `/api/admin/oauth/status` - Returns connection status
- All other API endpoints available on the detected port

## Benefits
✅ No more `EADDRINUSE` errors
✅ Automatic port conflict resolution
✅ Clear logging for debugging
✅ Graceful shutdown handling
✅ Frontend can connect to any port
✅ OAuth integration works on any port
