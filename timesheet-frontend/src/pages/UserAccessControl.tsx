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

  // Get permission summary
  const getPermissionSummary = (permissions: Permission[]): PermissionSummary => {
    const totalModules = permissions.length;
    const grantedModules = permissions.filter(p => p.canView || p.canCreate || p.canEdit || p.canDelete).length;
    const partialAccess = permissions.some(p => 
      (p.canView || p.canCreate || p.canEdit || p.canDelete) && 
      !(p.canView && p.canCreate && p.canEdit && p.canDelete)
    );
    
    return { totalModules, grantedModules, partialAccess };
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
      showNotification('Failed to fetch users', 'error');
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
      showNotification('Failed to fetch user permissions', 'error');
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
      showNotification('Failed to fetch role permissions', 'error');
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

  const clonePermissionsFromRole = async (role: string) => {
    try {
      setLoading(true);
      setErrorMessage('');
      
      const response = await API.get(`/admin/role-permissions/${role}`);
      if (response.data.success) {
        setPermissions(response.data.permissions);
        showNotification(`Permissions cloned from ${role} role successfully!`, 'success');
      }
    } catch (error) {
      console.error('Error cloning permissions:', error);
      showNotification('Failed to clone permissions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const selectedUser = users.find(u => u.id === selectedUserId);
  const permissionSummary = getPermissionSummary(permissions);

  // Toggle switch component
  const ToggleSwitch = ({ checked, onChange, disabled = false }: { checked: boolean; onChange: (checked: boolean) => void; disabled?: boolean }) => (
    <button
      type="button"
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? 'bg-indigo-600' : 'bg-gray-200'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

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
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Role-Based Access */}
            {!showBulkMode && accessType === 'role' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Role
                  </label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    disabled={loading}
                  >
                    <option value="">Choose a role...</option>
                    {roles.map(role => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Bulk Operations */}
            {showBulkMode && (
              <div className="space-y-6">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-amber-600 mr-2" />
                    <p className="text-amber-800">
                      Bulk operations allow you to apply permissions to multiple users at once.
                    </p>
                  </div>
                </div>

                {/* Clone from Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Clone Permissions from Role
                  </label>
                  <div className="flex space-x-3">
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      disabled={loading}
                    >
                      <option value="">Select role to clone...</option>
                      {roles.map(role => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                    <Button
                      onClick={() => selectedRole && clonePermissionsFromRole(selectedRole)}
                      disabled={!selectedRole || loading}
                      variant="secondary"
                    >
                      Clone Permissions
                    </Button>
                  </div>
                </div>

                {/* Quick Actions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quick Actions
                  </label>
                  <div className="flex space-x-3">
                    <Button
                      onClick={() => handleBulkPermissionChange('grant')}
                      variant="secondary"
                      className={bulkAction === 'grant' ? 'bg-green-100 text-green-800 border-green-200' : ''}
                    >
                      Grant All Access
                    </Button>
                    <Button
                      onClick={() => handleBulkPermissionChange('revoke')}
                      variant="secondary"
                      className={bulkAction === 'revoke' ? 'bg-red-100 text-red-800 border-red-200' : ''}
                    >
                      Revoke All Access
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Permission Summary */}
        {permissions.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Permission Summary</h3>
              <div className="flex items-center space-x-4">
                <div className="text-sm">
                  <span className="text-gray-500">Total Modules:</span>
                  <span className="ml-2 font-medium text-gray-900">{permissionSummary.totalModules}</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-500">Accessible:</span>
                  <span className="ml-2 font-medium text-green-600">{permissionSummary.grantedModules}</span>
                </div>
                <div className="text-sm">
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                    {permissionSummary.grantedModules === 0 
                      ? 'No Access'
                      : permissionSummary.grantedModules === permissionSummary.totalModules 
                      ? 'Full Access'
                      : 'Partial Access'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Permissions Matrix */}
        {((!showBulkMode && accessType === 'user' && selectedUserId) || 
          (!showBulkMode && accessType === 'role' && selectedRole) || 
          (showBulkMode && permissions.length > 0)) && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Module Permissions - {!showBulkMode && accessType === 'user' ? `${selectedUser?.firstName} ${selectedUser?.lastName}` : selectedRole}
                  {showBulkMode && 'Bulk Operations'}
                </h2>
                {!showBulkMode && (
                  <div className="flex space-x-3">
                    <Button
                      onClick={handleSavePermissions}
                      disabled={saving}
                      isLoading={saving}
                      variant="primary"
                      className="flex items-center"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button
                      variant="secondary"
                      className="flex items-center"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Reset
                    </Button>
                  </div>
                )}
              </div>

              {/* Permission Categories */}
              <div className="space-y-6">
                {Object.entries(moduleCategories).map(([category, modules]) => {
                  const categoryPermissions = permissions.filter(p => modules.includes(p.moduleName));
                  if (categoryPermissions.length === 0) return null;

                  return (
                    <div key={category} className="border border-gray-200 rounded-lg">
                      <button
                        onClick={() => toggleSection(category)}
                        className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
                      >
                        <h3 className="font-medium text-gray-900">
                          {categoryDisplayNames[category]}
                        </h3>
                        {expandedSections.has(category) ? (
                          <ChevronUp className="h-4 w-4 text-gray-500" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-gray-500" />
                        )}
                      </button>
                      
                      {expandedSections.has(category) && (
                        <div className="p-4">
                          <div className="overflow-x-auto">
                            <table className="w-full">
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
                                {categoryPermissions.map((permission) => {
                                  const hasAnyAccess = permission.canView || permission.canCreate || permission.canEdit || permission.canDelete;
                                  const hasFullAccess = permission.canView && permission.canCreate && permission.canEdit && permission.canDelete;
                                  
                                  return (
                                    <tr key={permission.moduleName} className="border-b border-gray-100 hover:bg-gray-50">
                                      <td className="py-3 px-4 font-medium text-gray-900">
                                        {moduleDisplayNames[permission.moduleName] || permission.moduleName}
                                      </td>
                                      <td className="py-3 px-4 text-center">
                                        <ToggleSwitch
                                          checked={permission.canView}
                                          onChange={(checked) => handlePermissionChange(permission.moduleName, 'canView', checked)}
                                          disabled={showBulkMode}
                                        />
                                      </td>
                                      <td className="py-3 px-4 text-center">
                                        <ToggleSwitch
                                          checked={permission.canCreate}
                                          onChange={(checked) => handlePermissionChange(permission.moduleName, 'canCreate', checked)}
                                          disabled={showBulkMode}
                                        />
                                      </td>
                                      <td className="py-3 px-4 text-center">
                                        <ToggleSwitch
                                          checked={permission.canEdit}
                                          onChange={(checked) => handlePermissionChange(permission.moduleName, 'canEdit', checked)}
                                          disabled={showBulkMode}
                                        />
                                      </td>
                                      <td className="py-3 px-4 text-center">
                                        <ToggleSwitch
                                          checked={permission.canDelete}
                                          onChange={(checked) => handlePermissionChange(permission.moduleName, 'canDelete', checked)}
                                          disabled={showBulkMode}
                                        />
                                      </td>
                                      <td className="py-3 px-4 text-center">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
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
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <span className="ml-3 text-gray-600">Loading...</span>
          </div>
        )}
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className={`fixed bottom-4 right-4 max-w-sm w-full bg-white rounded-lg shadow-lg border p-4 z-50 ${
          toastType === 'success' ? 'border-green-200' : 
          toastType === 'error' ? 'border-red-200' : 'border-blue-200'
        }`}>
          <div className="flex items-center">
            {toastType === 'success' && <CheckCircle className="h-5 w-5 text-green-500 mr-3" />}
            {toastType === 'error' && <XCircle className="h-5 w-5 text-red-500 mr-3" />}
            {toastType === 'info' && <AlertCircle className="h-5 w-5 text-blue-500 mr-3" />}
            <p className={`text-sm font-medium ${
              toastType === 'success' ? 'text-green-800' : 
              toastType === 'error' ? 'text-red-800' : 'text-blue-800'
            }`}>
              {toastMessage}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserAccessControl;
