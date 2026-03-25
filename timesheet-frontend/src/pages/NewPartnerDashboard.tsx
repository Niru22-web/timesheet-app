import React from 'react';
import CommonDashboard from '../components/CommonDashboard';

const PartnerDashboard: React.FC = () => {
  return (
    <CommonDashboard 
      userRole="partner"
      title="Partner Dashboard"
      subtitle="Client relations and business development"
    />
  );
};

export default PartnerDashboard;
