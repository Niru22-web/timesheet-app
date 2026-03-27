import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import API from '../api';
import { useAuth } from './AuthContext';

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
  const { user, isAuthenticated } = useAuth();
  const [permissions, setPermissions] = useState<Permissions>({});
  const [loading, setLoading] = useState(false);

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      const response = await API.get('/admin/my-permissions');
      console.log('🔐 Permissions fetched:', response.data.permissions);
      if (response.data.success) {
        setPermissions(response.data.permissions);
      } else {
        console.error('Failed to fetch permissions:', response.data);
        // Set empty permissions on error
        setPermissions({});
      }
    } catch (error: any) {
      console.warn('⚠️ Could not fetch permissions (Server may be down):', error.message);
      // Set empty permissions on error - allows app to continue with restricted access
      setPermissions({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('🔄 Permissions check - Authenticated:', isAuthenticated, 'User role:', user?.role);
    if (isAuthenticated && user) {
      fetchPermissions();
    } else {
      setPermissions({});
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  const hasPermission = (moduleName: string, permissionType: keyof Permission): boolean => {
    // Admin override
    if (user?.role?.toLowerCase() === 'admin' || user?.role?.toLowerCase() === 'owner') {
      return true;
    }
    
    const hasPerm = permissions[moduleName]?.[permissionType] || false;
    // console.log(`🔍 Checking permission: ${moduleName}.${permissionType} = ${hasPerm}`);
    return hasPerm;
  };

  const hasAnyPermission = (moduleName: string): boolean => {
    // Admin override
    if (user?.role?.toLowerCase() === 'admin' || user?.role?.toLowerCase() === 'owner') {
      return true;
    }

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
