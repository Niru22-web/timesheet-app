const express = require('express');
const cors = require('cors');

const app = express();

// Test CORS configuration
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176"],
  credentials: true
}));

app.get('/api/test', (req, res) => {
  console.log('🔍 Test endpoint called from:', req.headers.origin);
  console.log('📋 Request headers:', req.headers);
  res.json({ 
    message: "CORS test working!",
    timestamp: new Date().toISOString(),
    origin: req.headers.origin
  });
});

app.post('/api/auth/login', (req, res) => {
  console.log('🔐 Login endpoint called from:', req.headers.origin);
  console.log('📋 Request body:', req.body);
  
  // Simulate login response
  res.json({
    token: "test-token-123",
    user: {
      id: "test-id",
      name: "Test User",
      email: req.body.email,
      role: "admin"
    }
  });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Test server running on port ${PORT}`);
  console.log(`📡 Test endpoints:`);
  console.log(`   GET  http://localhost:${PORT}/api/test`);
  console.log(`   POST http://localhost:${PORT}/api/auth/login`);
  console.log(`🌐 CORS configured for: http://localhost:5173`);
});
