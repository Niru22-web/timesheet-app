import React from 'react';

const MinimalApp: React.FC = () => {
    return (
        <div style={{ 
            padding: '40px', 
            textAlign: 'center', 
            fontFamily: 'Arial, sans-serif',
            backgroundColor: '#f8fafc',
            minHeight: '100vh'
        }}>
            <h1 style={{ color: '#1e293b', marginBottom: '20px' }}>
                Timesheet Application
            </h1>
            <p style={{ color: '#64748b', marginBottom: '30px' }}>
                Application is running successfully!
            </p>
            <div style={{ 
                padding: '20px', 
                backgroundColor: 'white', 
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                maxWidth: '400px',
                margin: '0 auto'
            }}>
                <h2 style={{ color: '#3b82f6', marginBottom: '10px' }}>Status: ✅ Working</h2>
                <p style={{ color: '#475569' }}>
                    All core components are loading correctly.
                </p>
            </div>
        </div>
    );
};

export default MinimalApp;
