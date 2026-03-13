import React, { useState, useEffect } from 'react';
import API from '../api';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

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

const UserAccessControl: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const moduleDisplayNames: { [key: string]: string } = {
    dashboard: 'Dashboard',
    timesheet: 'Timesheet',
    projects: 'Projects',
    reports: 'Reports',
    email_templates: 'Email Templates',
    admin_panel: 'Admin Panel'
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      fetchUserPermissions(selectedUserId);
    }
  }, [selectedUserId]);

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
    if (!selectedUserId) {
      setErrorMessage('Please select a user first');
      return;
    }

    try {
      setSaving(true);
      setErrorMessage('');
      setSuccessMessage('');

      const response = await API.post('/admin/user-permissions', {
        userId: selectedUserId,
        permissions
      });

      if (response.data.success) {
        setSuccessMessage('Permissions updated successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error saving permissions:', error);
      setErrorMessage('Failed to save permissions');
    } finally {
      setSaving(false);
    }
  };

  const selectedUser = users.find(u => u.id === selectedUserId);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">User Access Control</h1>
        <p className="text-gray-600">Manage which modules each user can access</p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800">{successMessage}</p>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{errorMessage}</p>
        </div>
      )}

      {/* User Selection */}
      <Card className="mb-6">
        <div className="mb-4">
          <label htmlFor="user-select" className="block text-sm font-medium text-gray-700 mb-2">
            Select User
          </label>
          <select
            id="user-select"
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          >
            <option value="">Choose a user...</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.firstName} {user.lastName} - {user.designation} ({user.role})
              </option>
            ))}
          </select>
        </div>

        {selectedUser && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">User Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Name:</span> {selectedUser.firstName} {selectedUser.lastName}
              </div>
              <div>
                <span className="font-medium">Email:</span> {selectedUser.officeEmail}
              </div>
              <div>
                <span className="font-medium">Role:</span> <span className="capitalize">{selectedUser.role}</span>
              </div>
              <div>
                <span className="font-medium">Department:</span> {selectedUser.department}
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Permissions Table */}
      {selectedUserId && permissions.length > 0 && (
        <Card>
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Module Permissions</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Module</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">View</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">Create</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">Edit</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {permissions.map((permission) => (
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
                        />
                      </td>
                      <td className="py-3 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={permission.canCreate}
                          onChange={(e) => handlePermissionChange(permission.moduleName, 'canCreate', e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </td>
                      <td className="py-3 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={permission.canEdit}
                          onChange={(e) => handlePermissionChange(permission.moduleName, 'canEdit', e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </td>
                      <td className="py-3 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={permission.canDelete}
                          onChange={(e) => handlePermissionChange(permission.moduleName, 'canDelete', e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleSavePermissions}
              disabled={saving}
              isLoading={saving}
              variant="primary"
            >
              {saving ? 'Saving...' : 'Update Permissions'}
            </Button>
          </div>
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
