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
  const [loading, setLoading] = useState(true);

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      const response = await API.get('/admin/my-permissions');
      if (response.data.success) {
        setPermissions(response.data.permissions);
      }
    } catch (error) {
      console.error('Error fetching permissions:', error);
      // Set empty permissions on error
      setPermissions({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
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
