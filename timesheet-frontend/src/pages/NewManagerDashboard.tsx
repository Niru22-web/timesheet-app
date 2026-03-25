import React from 'react';
import CommonDashboard from '../components/CommonDashboard';

const ManagerDashboard: React.FC = () => {
  return (
    <CommonDashboard 
      userRole="manager"
      title="Manager Dashboard"
      subtitle="Team management and project oversight"
    />
  );
};

export default ManagerDashboard;
