import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import API from '../api';

interface Permission {
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

interface Permissions {
  [moduleName: string]: Permission;
}

interface PermissionsContextType {
  permissions: Permissions;
  loading: boolean;
  hasPermission: (moduleName: string, permissionType: keyof Permission) => boolean;
  hasAnyPermission: (moduleName: string) => boolean;
  refreshPermissions: () => Promise<void>;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

interface PermissionsProviderProps {
  children: ReactNode;
}

export const PermissionsProvider: React.FC<PermissionsProviderProps> = ({ children }) => {
  const [permissions, setPermissions] = useState<Permissions>({});
  const [loading, setLoading] = useState(false);

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      const response = await API.get('/admin/my-permissions');
      if (response.data.success) {
        setPermissions(response.data.permissions);
      } else {
        console.error('Failed to fetch permissions:', response.data);
        // Set empty permissions on error
        setPermissions({});
        // Show user-friendly error message
        const errorMessage = response.data?.error || 'Failed to fetch permissions';
        alert(`❌ ${errorMessage}`);
      }
    } catch (error: any) {
      console.error('Error fetching permissions:', error);
      
      // Handle network errors specifically
      if (error.code === 'ERR_NETWORK' || error.message?.includes('ERR_CONNECTION_REFUSED')) {
        alert('❌ Network connection failed. Please check if the backend server is running and accessible.');
      } else if (error.code === 'ECONNREFUSED' || error.message?.includes('ECONNREFUSED')) {
        alert('❌ Connection refused. The server may be down or not accepting connections.');
      } else if (error.response?.status === 500) {
        alert('❌ Server error occurred. Please try again later.');
      } else {
        // Generic error handling
        const errorMessage = error.response?.data?.error || error.message || 'Failed to fetch permissions';
        alert(`❌ ${errorMessage}`);
      }
      
      setPermissions({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch permissions if user is authenticated
    const token = localStorage.getItem('authToken');
    if (token) {
      fetchPermissions();
    } else {
      // Clear permissions if not authenticated
      setPermissions({});
      setLoading(false);
    }
  }, []);

  const hasPermission = (moduleName: string, permissionType: keyof Permission): boolean => {
    return permissions[moduleName]?.[permissionType] || false;
  };

  const hasAnyPermission = (moduleName: string): boolean => {
    const modulePermissions = permissions[moduleName];
    if (!modulePermissions) return false;
    
    return modulePermissions.canView || 
           modulePermissions.canCreate || 
           modulePermissions.canEdit || 
           modulePermissions.canDelete;
  };

  const refreshPermissions = async () => {
    await fetchPermissions();
  };

  const value: PermissionsContextType = {
    permissions,
    loading,
    hasPermission,
    hasAnyPermission,
    refreshPermissions
  };

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  );
};

export const usePermissions = (): PermissionsContextType => {
  const context = useContext(PermissionsContext);
  if (context === undefined) {
    throw new Error('usePermissions must be used within a PermissionsProvider');
  }
  return context;
};
