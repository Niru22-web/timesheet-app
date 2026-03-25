import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../contexts/PermissionsContext';
import AccessDenied from './AccessDenied';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string | string[];
  moduleName?: string;
  permissionType?: 'canView' | 'canCreate' | 'canEdit' | 'canDelete';
  requireAnyPermission?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole,
  moduleName,
  permissionType = 'canView',
  requireAnyPermission = false 
}) => {
  const { isAuthenticated, user } = useAuth();
  const { hasPermission, hasAnyPermission, loading } = usePermissions();
  const location = useLocation();

  // Show loading spinner while permissions are being fetched (only if moduleName is specified)
  if (moduleName && loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Admin role bypasses permission checks
  if (user?.role?.toLowerCase() === 'admin') {
    return <>{children}</>;
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

  // Check permission-based access if moduleName is specified
  if (moduleName) {
    if (requireAnyPermission) {
      if (!hasAnyPermission(moduleName)) {
        return <AccessDenied />;
      }
    } else {
      if (!hasPermission(moduleName, permissionType)) {
        return <AccessDenied />;
      }
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
