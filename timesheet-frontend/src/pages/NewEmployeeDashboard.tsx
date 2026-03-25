import React from 'react';
import CommonDashboard from '../components/CommonDashboard';

const EmployeeDashboard: React.FC = () => {
    return (
        <CommonDashboard 
            userRole="employee"
            title="Employee Dashboard"
            subtitle="My personal view and tasks"
        />
    );
};

export default EmployeeDashboard;
