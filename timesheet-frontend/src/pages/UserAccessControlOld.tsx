import React, { useState, useEffect } from 'react';
import API from '../api';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { Search, Users, Shield, Settings, ChevronDown, ChevronUp, Save, RotateCcw, Plus, Filter, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface User {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  officeEmail: string;
  designation: string;
  department: string;
  role: string;
  status: string;
}

interface Permission {
  moduleName: string;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

interface PermissionSummary {
  totalModules: number;
  grantedModules: number;
  partialAccess: boolean;
}

type AccessType = 'role' | 'user';

const UserAccessControl: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [accessType, setAccessType] = useState<AccessType>('user');
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [bulkAction, setBulkAction] = useState<'grant' | 'revoke' | ''>('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showBulkMode, setShowBulkMode] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['core']));
  const [filterRole, setFilterRole] = useState<string>('all');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');

  const moduleDisplayNames: { [key: string]: string } = {
    dashboard: 'Dashboard',
    timesheet: 'Timesheet',
    projects: 'Projects',
    reports: 'Reports',
    employees: 'Employees',
    clients: 'Clients',
    jobs: 'Jobs',
    email_templates: 'Email Templates',
    admin_panel: 'Admin Panel'
  };

  const moduleCategories: { [key: string]: string[] } = {
    core: ['dashboard', 'timesheet'],
    management: ['projects', 'clients', 'jobs'],
    reporting: ['reports'],
    administration: ['employees', 'admin_panel', 'email_templates']
  };

  const categoryDisplayNames: { [key: string]: string } = {
    core: 'Core Features',
    management: 'Management',
    reporting: 'Reporting',
    administration: 'Administration'
  };

  const roles = ['Admin', 'Partner', 'Employee', 'Manager', 'Owner'];

  // Toast notification
  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Toggle section expansion
  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  // Filter users by role and search term
  const filteredUsers = users.filter(user => {
    const matchesSearch = `${user.firstName} ${user.lastName}`.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                          user.officeEmail.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                          user.role.toLowerCase().includes(userSearchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  // Get role badge color
  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'partner': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'manager': return 'bg-green-100 text-green-800 border-green-200';
      case 'employee': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    return status.toLowerCase() === 'active' ? 'text-green-600' : 'text-red-600';
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (accessType === 'user' && selectedUserId) {
      fetchUserPermissions(selectedUserId);
    } else if (accessType === 'role' && selectedRole) {
      fetchRolePermissions(selectedRole);
    }
  }, [selectedUserId, selectedRole, accessType]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await API.get('/admin/users');
      if (response.data.success) {
        setUsers(response.data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setErrorMessage('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPermissions = async (userId: string) => {
    try {
      setLoading(true);
      setErrorMessage('');
      const response = await API.get(`/admin/user-permissions/${userId}`);
      if (response.data.success) {
        setPermissions(response.data.permissions);
      }
    } catch (error) {
      console.error('Error fetching permissions:', error);
      setErrorMessage('Failed to fetch user permissions');
    } finally {
      setLoading(false);
    }
  };

  const fetchRolePermissions = async (role: string) => {
    try {
      setLoading(true);
      setErrorMessage('');
      const response = await API.get(`/admin/role-permissions/${role}`);
      if (response.data.success) {
        setPermissions(response.data.permissions);
      }
    } catch (error) {
      console.error('Error fetching role permissions:', error);
      setErrorMessage('Failed to fetch role permissions');
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionChange = (moduleName: string, permissionType: keyof Permission, value: boolean) => {
    setPermissions(prev => 
      prev.map(p => 
        p.moduleName === moduleName 
          ? { ...p, [permissionType]: value }
          : p
      )
    );
  };

  const handleSavePermissions = async () => {
    if (accessType === 'user' && !selectedUserId) {
      showNotification('Please select a user first', 'error');
      return;
    }
    
    if (accessType === 'role' && !selectedRole) {
      showNotification('Please select a role first', 'error');
      return;
    }

    try {
      setSaving(true);
      setErrorMessage('');
      setSuccessMessage('');

      const endpoint = accessType === 'user' ? '/admin/user-permissions' : '/admin/role-permissions';
      const payload = accessType === 'user' 
        ? { userId: selectedUserId, permissions }
        : { role: selectedRole, permissions };

      const response = await API.post(endpoint, payload);

      if (response.data.success) {
        showNotification(`${accessType === 'user' ? 'User' : 'Role'} permissions updated successfully!`, 'success');
      }
    } catch (error) {
      console.error('Error saving permissions:', error);
      showNotification('Failed to save permissions', 'error');
    } finally {
      setSaving(false);
    }
  };

  const getPermissionSummary = (permissions: Permission[]): PermissionSummary => {
    const totalModules = permissions.length;
    const grantedModules = permissions.filter(p => p.canView || p.canCreate || p.canEdit || p.canDelete).length;
    const partialAccess = permissions.some(p => 
      (p.canView || p.canCreate || p.canEdit || p.canDelete) && 
      !(p.canView && p.canCreate && p.canEdit && p.canDelete)
    );
    
    return { totalModules, grantedModules, partialAccess };
  };

  const handleBulkPermissionChange = (action: 'grant' | 'revoke') => {
    setBulkAction(action);
    const updatedPermissions = permissions.map(permission => {
      if (action === 'grant') {
        return {
          ...permission,
          canView: true,
          canCreate: true,
          canEdit: true,
          canDelete: true
        };
      } else {
        return {
          ...permission,
          canView: false,
          canCreate: false,
          canEdit: false,
          canDelete: false
        };
      }
    });
    setPermissions(updatedPermissions);
  };

  const handleUserSelection = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const handleBulkApplyToUsers = async () => {
    if (selectedUsers.length === 0) {
      setErrorMessage('Please select at least one user');
      return;
    }

    try {
      setSaving(true);
      setErrorMessage('');
      
      const promises = selectedUsers.map(userId => 
        API.post('/admin/user-permissions', { userId, permissions })
      );
      
      await Promise.all(promises);
      
      setSuccessMessage(`Permissions applied to ${selectedUsers.length} user(s) successfully!`);
      setSelectedUsers([]);
      setShowBulkMode(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error applying bulk permissions:', error);
      setErrorMessage('Failed to apply bulk permissions');
    } finally {
      setSaving(false);
    }
  };

  const clonePermissionsFromRole = async (role: string) => {
    try {
      setLoading(true);
      setErrorMessage('');
      
      const response = await API.get(`/admin/role-permissions/${role}`);
      if (response.data.success) {
        setPermissions(response.data.permissions);
        setSuccessMessage(`Permissions cloned from ${role} role successfully!`);
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error cloning permissions:', error);
      setErrorMessage('Failed to clone permissions');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await API.get('/admin/users');
      if (response.data.success) {
        setUsers(response.data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setErrorMessage('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPermissions = async (userId: string) => {
    try {
      setLoading(true);
      setErrorMessage('');
      const response = await API.get(`/admin/user-permissions/${userId}`);
      if (response.data.success) {
        setPermissions(response.data.permissions);
      }
    } catch (error) {
      console.error('Error fetching permissions:', error);
      setErrorMessage('Failed to fetch user permissions');
    } finally {
      setLoading(false);
    }
  };

  const fetchRolePermissions = async (role: string) => {
    try {
      setLoading(true);
      setErrorMessage('');
      const response = await API.get(`/admin/role-permissions/${role}`);
      if (response.data.success) {
        setPermissions(response.data.permissions);
      }
    } catch (error) {
      console.error('Error fetching role permissions:', error);
      setErrorMessage('Failed to fetch role permissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (accessType === 'user' && selectedUserId) {
      fetchUserPermissions(selectedUserId);
    } else if (accessType === 'role' && selectedRole) {
      fetchRolePermissions(selectedRole);
    }
  }, [selectedUserId, selectedRole, accessType]);

  const selectedUser = users.find(u => u.id === selectedUserId);
  const permissionSummary = getPermissionSummary(permissions);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-indigo-600 mr-3" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">User Access Control</h1>
                <p className="text-sm text-gray-500">Manage permissions and access rights</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="secondary" size="sm" className="flex items-center">
                <Plus className="h-4 w-4 mr-2" />
                Add Role
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Access Type Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              <button
                onClick={() => {
                  setAccessType('user');
                  setSelectedRole('');
                  setPermissions([]);
                  setShowBulkMode(false);
                }}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  accessType === 'user'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  User Access
                </div>
              </button>
              <button
                onClick={() => {
                  setAccessType('role');
                  setSelectedUserId('');
                  setPermissions([]);
                  setShowBulkMode(false);
                }}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  accessType === 'role'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <Shield className="h-4 w-4 mr-2" />
                  Role Access
                </div>
              </button>
              <button
                onClick={() => {
                  setShowBulkMode(!showBulkMode);
                  setAccessType('user');
                  setSelectedUserId('');
                  setSelectedRole('');
                  setPermissions([]);
                }}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  showBulkMode
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <Settings className="h-4 w-4 mr-2" />
                  Bulk Operations
                </div>
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* User-Based Access */}
            {!showBulkMode && accessType === 'user' && (
              <div className="space-y-6">
                {/* Search and Filter */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search users by name, email, or role..."
                      value={userSearchTerm}
                      onChange={(e) => setUserSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Filter className="h-4 w-4 text-gray-400" />
                    <select
                      value={filterRole}
                      onChange={(e) => setFilterRole(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="all">All Roles</option>
                      {roles.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Users Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredUsers.map(user => (
                    <div
                      key={user.id}
                      onClick={() => setSelectedUserId(user.id)}
                      className={`p-4 border rounded-xl cursor-pointer transition-all hover:shadow-md ${
                        selectedUserId === user.id
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center">
                          <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                            <span className="text-indigo-600 font-medium">
                              {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                            </span>
                          </div>
                          <div className="ml-3">
                            <h3 className="font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </h3>
                            <p className="text-sm text-gray-500">{user.designation}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getRoleBadgeColor(user.role)}`}>
                          {user.role}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="text-gray-600">{user.officeEmail}</div>
                        <div className="flex items-center">
                          <span className="text-gray-500">Status:</span>
                          <span className={`ml-1 font-medium ${getStatusColor(user.status)}`}>
                            {user.status}
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium">Total Modules:</span> {permissionSummary.totalModules}
              </div>
              <div>
                <span className="font-medium">Accessible:</span> {permissionSummary.grantedModules}
              </div>
              <div>
                <span className="font-medium">Access Level:</span> 
                <span className={`ml-1 px-2 py-1 rounded-full text-xs ${
                  permissionSummary.grantedModules === 0 
                    ? 'bg-red-100 text-red-800'
                    : permissionSummary.grantedModules === permissionSummary.totalModules 
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {permissionSummary.grantedModules === 0 
                    ? 'No Access'
                    : permissionSummary.grantedModules === permissionSummary.totalModules 
                    ? 'Full Access'
                    : 'Partial Access'}
                </span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Permissions Table */}
      {((!showBulkMode && accessType === 'user' && selectedUserId) || 
        (!showBulkMode && accessType === 'role' && selectedRole) || 
        (showBulkMode && permissions.length > 0)) && (
        <Card>
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Module Permissions - {!showBulkMode && accessType === 'user' ? `${selectedUser?.firstName} ${selectedUser?.lastName}` : selectedRole}
              {showBulkMode && 'Bulk Operations'}
            </h2>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Module</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">View</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">Create</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">Edit</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">Delete</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {permissions.map((permission) => {
                    const hasAnyAccess = permission.canView || permission.canCreate || permission.canEdit || permission.canDelete;
                    const hasFullAccess = permission.canView && permission.canCreate && permission.canEdit && permission.canDelete;
                    
                    return (
                      <tr key={permission.moduleName} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-gray-900">
                          {moduleDisplayNames[permission.moduleName] || permission.moduleName}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={permission.canView}
                            onChange={(e) => handlePermissionChange(permission.moduleName, 'canView', e.target.checked)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            disabled={showBulkMode}
                          />
                        </td>
                        <td className="py-3 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={permission.canCreate}
                            onChange={(e) => handlePermissionChange(permission.moduleName, 'canCreate', e.target.checked)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            disabled={showBulkMode}
                          />
                        </td>
                        <td className="py-3 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={permission.canEdit}
                            onChange={(e) => handlePermissionChange(permission.moduleName, 'canEdit', e.target.checked)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            disabled={showBulkMode}
                          />
                        </td>
                        <td className="py-3 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={permission.canDelete}
                            onChange={(e) => handlePermissionChange(permission.moduleName, 'canDelete', e.target.checked)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            disabled={showBulkMode}
                          />
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            !hasAnyAccess 
                              ? 'bg-red-100 text-red-800'
                              : hasFullAccess 
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {!hasAnyAccess ? 'No Access' : hasFullAccess ? 'Full Access' : 'Partial'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {!showBulkMode && (
            <div className="flex justify-end">
              <Button
                onClick={handleSavePermissions}
                disabled={saving}
                isLoading={saving}
                variant="primary"
              >
                {saving ? 'Saving...' : `Update ${accessType === 'user' ? 'User' : 'Role'} Permissions`}
              </Button>
            </div>
          )}
        </Card>
      )}

      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      )}
    </div>
  );
};

export default UserAccessControl;
