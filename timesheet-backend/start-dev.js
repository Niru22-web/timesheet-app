// Simple development server bypass
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Basic middleware
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176"]
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Test endpoint
app.get("/api/test", (req, res) => {
  res.json({ message: "Backend working!" });
});

// Simple auth endpoint for testing
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  
  // Mock authentication - replace with real logic
  if (email === 'admin@company.com' && password === 'admin') {
    res.json({
      token: 'mock-jwt-token',
      user: {
        id: '1',
        email: 'admin@company.com',
        name: 'Admin User',
        role: 'admin'
      }
    });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Mock reports endpoint
app.get("/api/reports/summary", (req, res) => {
  res.json({
    totalEmployees: 10,
    activeProjects: 5,
    totalHours: 160,
    totalClients: 8,
    totalDisbursed: 50000
  });
});

// Mock employees endpoint
app.get("/api/employees", (req, res) => {
  res.json([
    {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@company.com',
      role: 'employee'
    }
  ]);
});

// Mock pending approvals endpoint
app.get("/api/admin/pending-approvals", (req, res) => {
  res.json([]);
});

// Email connector endpoints (mock)
app.get("/api/email/auth/urls", (req, res) => {
  res.json({
    success: true,
    data: {
      google: {
        authUrl: 'https://accounts.google.com/oauth/authorize?mock=true',
        provider: 'gmail',
        name: 'Gmail'
      },
      microsoft: {
        authUrl: 'https://login.microsoftonline.com/oauth/authorize?mock=true',
        provider: 'outlook',
        name: 'Outlook'
      }
    }
  });
});

app.get("/api/email/status", (req, res) => {
  res.json({
    success: true,
    data: {
      gmail: { connected: false },
      outlook: { connected: false }
    }
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Development server running on port ${PORT}`);
  console.log(`📊 Frontend should connect to: http://localhost:${PORT}`);
  console.log(`🔧 This is a mock server - TypeScript errors bypassed`);
});

module.exports = app;
