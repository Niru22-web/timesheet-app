import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string | string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access if requiredRole is specified
  if (requiredRole) {
    const requiredRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    
    if (!user?.role || !requiredRoles.includes(user.role)) {
      return (
        <div style={{ 
          padding: '2rem', 
          textAlign: 'center',
          backgroundColor: '#fef2f2',
          color: '#dc2626',
          borderRadius: '0.5rem',
          margin: '2rem auto',
          maxWidth: '400px'
        }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            Access Denied
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            You don't have permission to access this page.
          </p>
          <p>
            Required roles: <strong>{requiredRoles.join(', ')}</strong><br />
            Your role: <strong>{user?.role || 'Not specified'}</strong>
          </p>
        </div>
      );
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
