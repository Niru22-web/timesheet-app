import React from 'react';
import CommonDashboard from '../components/CommonDashboard';

const AdminDashboard: React.FC = () => {
  console.log("NewAdminDashboard component loaded!");
  return (
    <CommonDashboard 
      userRole="admin"
      title="Admin Dashboard"
      subtitle="System administration and overview"
    />
  );
};

export default AdminDashboard;
