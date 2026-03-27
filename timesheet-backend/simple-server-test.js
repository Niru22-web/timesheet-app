const express = require('express');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'Simple server working!' });
});

// Permissions endpoint
app.get('/api/admin/my-permissions', async (req, res) => {
  try {
    console.log('🔍 Permissions endpoint called');
    
    // Mock user for testing
    const mockUser = {
      id: '088b6a32-3cab-44d0-b99a-bf0d83be9944',
      role: 'Admin'
    };
    
    console.log('Mock user:', mockUser);
    
    // Return default permissions
    const defaultPermissions = {
      dashboard: { canView: true, canCreate: false, canEdit: false, canDelete: false },
      timesheet: { canView: true, canCreate: true, canEdit: true, canDelete: false },
      projects: { canView: true, canCreate: false, canEdit: false, canDelete: false },
      reports: { canView: true, canCreate: false, canEdit: false, canDelete: false },
      employees: { canView: true, canCreate: true, canEdit: true, canDelete: false },
      admin_panel: { canView: true, canCreate: true, canEdit: true, canDelete: false },
      email_templates: { canView: false, canCreate: false, canEdit: false, canDelete: false },
      clients: { canView: false, canCreate: false, canEdit: false, canDelete: false },
      jobs: { canView: false, canCreate: false, canEdit: false, canDelete: false }
    };

    res.json({
      success: true,
      permissions: defaultPermissions,
      hasCustomAccess: false
    });
  } catch (error) {
    console.error('❌ Permissions endpoint error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch permissions',
      error: error.message
    });
  }
});

// Notifications endpoint
app.get('/api/notifications', async (req, res) => {
  try {
    console.log('🔍 Notifications endpoint called');
    
    // Mock notifications for testing
    const mockNotifications = [
      {
        id: '1',
        title: 'Test Notification',
        message: 'This is a test notification',
        type: 'system',
        isRead: false,
        createdAt: new Date().toISOString(),
        userId: '088b6a32-3cab-44d0-b99a-bf0d83be9944'
      }
    ];

    res.json({
      success: true,
      data: mockNotifications,
      message: 'Notifications retrieved successfully'
    });
  } catch (error) {
    console.error('❌ Notifications endpoint error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message
    });
  }
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`🚀 Simple test server running on port ${PORT}`);
  console.log(`📡 Test endpoints available:`);
  console.log(`   GET http://localhost:${PORT}/api/test`);
  console.log(`   GET http://localhost:${PORT}/api/admin/my-permissions`);
  console.log(`   GET http://localhost:${PORT}/api/notifications`);
});
