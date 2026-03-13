import React, { useState, useEffect } from 'react';
import { APP_CONFIG } from '../config/appConfig';
import API from '../api';
import {
  UsersIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  TrashIcon,
  PlusIcon,
  FunnelIcon,
  ArrowPathIcon,
  EyeIcon,
  PaperAirplaneIcon,
  DocumentIcon,
  FolderOpenIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';

// UI Components
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import StatusBadge from '../components/ui/StatusBadge';
import Modal from '../components/ui/Modal';
import Avatar from '../components/ui/Avatar';

interface Employee {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  designation: string;
  department: string;
  status: 'Active' | 'Inactive' | 'On Leave' | 'active' | 'pending' | 'rejected';
  joinDate: string;
  joining_date?: string;
  createdAt: string;
  profile?: {
    employeePhotoUrl?: string;
    dob?: string;
    education?: string;
    maritalStatus?: string;
    gender?: string;
    permanentAddress?: string;
    currentAddress?: string;
    pan?: string;
    aadhaar?: string;
    personalEmail?: string;
    personalMobile?: string;
  };
  attachments?: {
    panFile?: string;
    aadhaarFile?: string;
    employeePhoto?: string;
    bankStatement?: string;
  };
  hasActiveRegistrationToken?: boolean;
  registrationTokenExpiry?: string;
}

interface EnhancedEmployeeDetails {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  officeEmail: string;
  phone?: string;
  address?: string;
  date_of_birth?: string;
  gender?: string;
  personalDetails: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    address?: string;
    date_of_birth?: string;
    gender?: string;
  };
  identityDetails: {
    pan_number?: string;
    aadhaar_number?: string;
  };
  guardianDetails: {
    guardian_name?: string;
    guardian_phone?: string;
    guardian_relation?: string;
  };
  educationDetails: {
    qualification?: string;
    university?: string;
    passing_year?: string;
    grade?: string;
  };
  bankDetails: {
    bank_name?: string;
    account_number?: string;
    ifsc_code?: string;
    branch_name?: string;
  };
  employmentDetails: {
    employee_id: string;
    department: string;
    designation: string;
    joining_date: string;
    role: string;
    status: string;
  };
  attachments: {
    pan_card_file?: string;
    aadhaar_card_file?: string;
    education_certificate?: string;
    profile_photo?: string;
    other_documents?: string;
  };
  hasActiveRegistrationToken?: boolean;
  registrationTokenExpiry?: string;
}

const Employees: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [enhancedEmployeeDetails, setEnhancedEmployeeDetails] = useState<EnhancedEmployeeDetails | null>(null);

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [partners, setPartners] = useState<any[]>([]);
  const [managers, setManagers] = useState<any[]>([]);
  const [showPendingApprovals, setShowPendingApprovals] = useState(false);

  // Check if user is admin or manager, if not redirect to dashboard
  useEffect(() => {
    if (user) {
      const userRole = user.role.toLowerCase();
      const allowedRoles = ['admin', 'manager', 'partner', 'owner'];
      if (!allowedRoles.includes(userRole)) {
        window.location.href = '/dashboard';
      }
    }
  }, [user]);

  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Employee');
  const [designation, setDesignation] = useState('');
  const [department, setDepartment] = useState('Accounting');
  const [dateOfJoining, setDateOfJoining] = useState('');
  const [reportingPartner, setReportingPartner] = useState('');
  const [reportingManager, setReportingManager] = useState('');
  const [employeeCode, setEmployeeCode] = useState('');

  // Auto-populate Reporting Manager when Role changes to Manager
  useEffect(() => {
    if (role === 'Manager' && reportingPartner) {
      const selectedPartner = partners.find(p => p.id === reportingPartner);
      if (selectedPartner) {
        setReportingManager(selectedPartner.id);
      }
    } else if (role !== 'Manager') {
      setReportingManager('');
    }
  }, [role, reportingPartner, partners]);

  // Populate form when editing employee
  useEffect(() => {
    if (editingEmployee) {
      const names = editingEmployee.name.split(' ');
      setFirstName(names[0] || '');
      setLastName(names.slice(1).join(' ') || '');
      setEmail(editingEmployee.email);
      setRole(editingEmployee.role);
      setDesignation(editingEmployee.designation);
      setDepartment('Accounting'); // Default
      setDateOfJoining(editingEmployee.joinDate);
      setEmployeeCode(editingEmployee.employeeId);
      setShowEditModal(true);
    }
  }, [editingEmployee]);

  useEffect(() => {
    fetchEmployees();
    fetchPendingApprovals();
  }, []);

  const fetchPendingApprovals = async () => {
    try {
      const res = await API.get('/admin/pending-approvals');
      setPendingApprovals(res.data);
    } catch (err) {
      console.error('Failed to fetch pending approvals:', err);
    }
  };

  const handleApproveEmployee = async (employeeId: string) => {
    try {
      await API.post(`/admin/approve-employee/${employeeId}`);
      fetchPendingApprovals();
      fetchEmployees();
    } catch (err) {
      console.error('Failed to approve employee:', err);
      alert('Failed to approve employee');
    }
  };

  const handleRejectEmployee = async (employeeId: string) => {
    if (window.confirm('Are you sure you want to reject this employee? This action cannot be undone.')) {
      try {
        await API.post(`/admin/reject-employee/${employeeId}`, { reason: 'Rejected by administrator' });
        fetchPendingApprovals();
        fetchEmployees();
      } catch (err) {
        console.error('Failed to reject employee:', err);
        alert('Failed to reject employee');
      }
    }
  };

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await API.get('/employees');
      const mapped = res.data.map((emp: any) => ({
        id: emp.id,
        employeeId: emp.employeeId,
        firstName: emp.firstName,
        lastName: emp.lastName,
        name: `${emp.firstName} ${emp.lastName}`,
        email: emp.officeEmail,
        phone: emp.phone || null,
        role: emp.role,
        designation: emp.designation,
        department: emp.department,
        status: (emp.status === 'active' || emp.status === 'Active') ? 'Active' : (emp.status === 'On Leave' ? 'On Leave' : (emp.status === 'pending' ? 'Pending' : (emp.status === 'rejected' ? 'Rejected' : 'Inactive'))),
        joinDate: new Date(emp.createdAt).toISOString().split('T')[0],
        joining_date: emp.joining_date ? new Date(emp.joining_date).toISOString().split('T')[0] : new Date(emp.createdAt).toISOString().split('T')[0],
        createdAt: emp.createdAt,
        profile: emp.profile,
        attachments: emp.attachments,
        hasActiveRegistrationToken: emp.hasActiveRegistrationToken || false,
        registrationTokenExpiry: emp.registrationTokenExpiry || null
      }));
      
      // Filter partners and managers
      const partnersList = res.data.filter((emp: any) => emp.role === 'Partner');
      const managersList = res.data.filter((emp: any) => emp.role === 'Manager');
      
      setEmployees(mapped);
      setPartners(partnersList);
      setManagers(managersList);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch employees:', err);
      setError('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEmployee = async () => {
    // Validation
    if (!firstName || !lastName || !email || !designation || !role || !department) {
      alert('Please fill all mandatory fields.');
      return;
    }

    try {
      // Generate unique employee code
      const employeeCount = employees.length;
      const generatedCode = `EMP${String(employeeCount + 1).padStart(4, '0')}`;
      
      const response = await API.post('/employees', {
        firstName,
        lastName,
        officeEmail: email,
        role,
        designation,
        department,
        status: 'active',
        reportingPartner: reportingPartner || null,
        reportingManager: reportingManager || null,
        employeeId: generatedCode
      });
      
      // Handle response based on email status
      if (response.data.success) {
        const { emailStatus, message } = response.data;
        
        if (emailStatus === 'sent') {
          alert(`✅ ${message}`);
        } else if (emailStatus === 'skipped') {
          alert(`⚠️ ${message}\n\nPlease configure email settings to send registration emails.`);
        } else if (emailStatus === 'failed') {
          alert(`⚠️ ${message}\n\nPlease check email configuration and try again.`);
        } else {
          alert(`✅ Employee created successfully!`);
        }
      } else {
        alert('Employee created but there might be an issue with email sending.');
      }
      
      setShowAddModal(false);
      // Reset form
      setFirstName('');
      setLastName('');
      setEmail('');
      setRole('Employee');
      setDesignation('');
      setDepartment('Accounting');
      setDateOfJoining('');
      setReportingPartner('');
      setReportingManager('');
      setEmployeeCode('');
      
      // Refresh employee list
      fetchEmployees();
    } catch (err: any) {
      console.error('Failed to create employee:', err);
      const errorMessage = err?.response?.data?.error || err?.response?.data?.message || 'Failed to create employee';
      setError(errorMessage);
      alert(`❌ ${errorMessage}`);
    }
  };

  const handleUpdateEmployee = async () => {
    if (!editingEmployee) return;

    // Validation
    if (!firstName || !lastName || !email || !designation || !role || !department) {
      alert('Please fill all mandatory fields.');
      return;
    }

    try {
      await API.put(`/employees/${editingEmployee.id}`, {
        firstName,
        lastName,
        officeEmail: email,
        role,
        designation,
        department,
        status: 'active',
        reportingPartner: reportingPartner || null,
        reportingManager: reportingManager || null,
        employeeId: editingEmployee.employeeId
      });
      
      setEditingEmployee(null);
      setShowEditModal(false);
      // Reset form
      setFirstName('');
      setLastName('');
      setEmail('');
      setRole('Employee');
      setDesignation('');
      setDepartment('Accounting');
      setDateOfJoining('');
      setReportingPartner('');
      setReportingManager('');
      setEmployeeCode('');
      
      // Refresh employee list
      fetchEmployees();
    } catch (err) {
      console.error('Failed to update employee:', err);
      alert('Failed to update employee');
    }
  };

  const handleDeleteEmployee = async (id: string, employeeName: string) => {
    if (window.confirm(`Are you sure you want to delete ${employeeName}? This action cannot be undone and will remove all associated data including timelogs, projects, and reimbursements.`)) {
      try {
        await API.delete(`/employees/${id}`);
        fetchEmployees();
        fetchPendingApprovals();
        alert('Employee deleted successfully');
      } catch (err: any) {
        console.error('Error deleting employee:', err);
        const errorMessage = err.response?.data?.error || err.message || 'Failed to delete employee. Please try again.';
        alert(`Delete failed: ${errorMessage}`);
      }
    }
  };

  const handleViewDetails = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowDetailsModal(true);
  };

  const handleResendRegistrationEmail = async (employeeId: string, employeeName: string) => {
    if (window.confirm(`Are you sure you want to resend the registration email to ${employeeName}?`)) {
      try {
        const response = await API.post(`/employees/resend-registration/${employeeId}`);
        if (response.data.success) {
          alert('✅ Registration email sent successfully!');
          fetchEmployees(); // Refresh to update token status
        } else {
          alert('❌ Failed to send registration email');
        }
      } catch (err: any) {
        console.error('Error resending registration email:', err);
        const errorMessage = err.response?.data?.error || err.message || 'Failed to resend registration email';
        alert(`❌ ${errorMessage}`);
      }
    }
  };

  const handleViewAttachment = (attachmentUrl: string, fileName: string) => {
    if (attachmentUrl) {
      window.open(`http://localhost:3001${attachmentUrl}`, '_blank');
    } else {
      alert('No attachment available');
    }
  };

  const handleViewFullProfile = async (employeeId: string) => {
    try {
      const response = await API.get(`/employees/${employeeId}`);
      if (response.data.success) {
        setEnhancedEmployeeDetails(response.data.data);
        setShowProfileModal(true);
      } else {
        alert('Failed to fetch employee details');
      }
    } catch (err: any) {
      console.error('Error fetching employee details:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch employee details';
      alert(`❌ ${errorMessage}`);
    }
  };

  const handleDownloadAttachment = async (filename: string) => {
    try {
      // Create download URL
      const downloadUrl = `http://localhost:5000/api/employees/download/${filename}`;
      
      // Create a temporary link element to trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      link.style.display = 'none';
      
      // Add authorization header
      const token = localStorage.getItem('token');
      if (token) {
        link.setAttribute('data-token', token);
      }
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Alternative: Use fetch with blob
      const response = await fetch(downloadUrl, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        throw new Error('Download failed');
      }
    } catch (err: any) {
      console.error('Error downloading attachment:', err);
      alert('Failed to download attachment');
    }
  };

  const kpis = [
    { label: 'Total Employees', value: employees.length, icon: UsersIcon, color: 'text-primary-600', bg: 'bg-primary-50' },
    { label: 'Active Employees', value: employees.filter(e => e.status === 'Active').length, icon: UsersIcon, color: 'text-success-600', bg: 'bg-success-50' },
    { label: 'Pending Approvals', value: pendingApprovals.length, icon: PlusIcon, color: 'text-warning-600', bg: 'bg-warning-50' },
    { label: 'On Leave', value: employees.filter(e => e.status === 'On Leave').length, icon: UsersIcon, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ];

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'All Roles' || emp.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="flex flex-col space-y-4 animate-fade-in min-h-screen">
      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 flex-none">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 tracking-tight">{APP_CONFIG.COMPANY_NAME}</h1>
          <p className="text-sm text-secondary-500 font-medium">Employee Management</p>
        </div>

        <div className="flex items-center gap-2">
          {pendingApprovals.length > 0 && (
            <Button
              variant="secondary"
              size="sm"
              className="h-10 border-warning-200 text-warning-700 hover:bg-warning-50"
              onClick={() => setShowPendingApprovals(!showPendingApprovals)}
              leftIcon={<PlusIcon className="w-4 h-4" />}
            >
              {showPendingApprovals ? 'Hide' : 'Show'} Pending ({pendingApprovals.length})
            </Button>
          )}
          <Button
            variant="secondary"
            size="sm"
            className="h-10 border-secondary-200"
            onClick={fetchEmployees}
            leftIcon={<ArrowPathIcon className="w-4 h-4" />}
          >
            Refresh List
          </Button>
          <Button
            variant="primary"
            size="sm"
            className="h-10 px-6 font-bold"
            onClick={() => setShowAddModal(true)}
            leftIcon={<PlusIcon className="w-4 h-4" />}
          >
            Add Employee
          </Button>
        </div>
      </div>

      {/* KPI Cards Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-none">
        {kpis.map((kpi, i) => (
          <Card key={i} className="px-5 py-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-lg ${kpi.bg} ${kpi.color} flex items-center justify-center shadow-sm`}>
                <kpi.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-secondary-500 uppercase tracking-wider">{kpi.label}</p>
                <p className="text-xl font-bold text-secondary-900 leading-none mt-1">{kpi.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Pending Approvals Section */}
      {showPendingApprovals && pendingApprovals.length > 0 && (
        <Card className="p-6 border-warning-200 bg-warning-50/30">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-warning-100 text-warning-600 flex items-center justify-center shadow-sm">
              <PlusIcon className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-secondary-900 tracking-tight">Pending Employee Approvals</h2>
            <div className="ml-auto">
              <span className="text-sm font-bold text-warning-700 bg-warning-100 px-3 py-1 rounded-full">
                {pendingApprovals.length} Waiting
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {pendingApprovals.map((employee) => (
              <div key={employee.id} className="bg-white rounded-lg p-4 border border-warning-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar 
                      name={`${employee.firstName} ${employee.lastName}`} 
                      size="sm" 
                      src={employee.profile?.employeePhotoUrl ? `http://localhost:3001${employee.profile.employeePhotoUrl}` : undefined}
                    />
                    <div>
                      <h3 className="font-bold text-secondary-900">{employee.firstName} {employee.lastName}</h3>
                      <p className="text-sm text-secondary-600">{employee.officeEmail}</p>
                      <p className="text-xs text-secondary-500">{employee.designation} • {employee.employeeId}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs font-bold text-warning-600 uppercase tracking-wider">Registered</p>
                      <p className="text-sm text-secondary-500">
                        {new Date(employee.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="h-8 px-3 text-success-700 border-success-200 hover:bg-success-50"
                        onClick={() => handleApproveEmployee(employee.id)}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="h-8 px-3 text-danger-700 border-danger-200 hover:bg-danger-50"
                        onClick={() => handleRejectEmployee(employee.id)}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
                
                {employee.profile && (
                  <div className="mt-4 pt-4 border-t border-secondary-100">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                      <div>
                        <span className="font-bold text-secondary-500">Education:</span>
                        <p className="text-secondary-700">{employee.profile.education || 'Not specified'}</p>
                      </div>
                      <div>
                        <span className="font-bold text-secondary-500">Mobile:</span>
                        <p className="text-secondary-700">{employee.profile.personalMobile || 'Not specified'}</p>
                      </div>
                      <div>
                        <span className="font-bold text-secondary-500">PAN:</span>
                        <p className="text-secondary-700">{employee.profile.pan || 'Not specified'}</p>
                      </div>
                      <div>
                        <span className="font-bold text-secondary-500">Documents:</span>
                        <p className="text-secondary-700">
                          {employee.profile.panFileUrl ? '✓ PAN' : ''}
                          {employee.profile.aadhaarFileUrl ? ' ✓ Aadhaar' : ''}
                          {employee.profile.employeePhotoUrl ? ' ✓ Photo' : ''}
                          {employee.profile.bankStatementFileUrl ? ' ✓ Bank Statement' : ''}
                          {!employee.profile.panFileUrl && !employee.profile.aadhaarFileUrl && !employee.profile.employeePhotoUrl && !employee.profile.bankStatementFileUrl ? 'None' : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Main Content Area: Search and Filter */}
      <Card className="flex flex-col flex-1 overflow-hidden min-h-0">
        <div className="p-4 bg-white border-b border-secondary-100 flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative group">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400 group-focus-within:text-primary-500 transition-colors" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-secondary-50/50 border border-secondary-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
            />
          </div>

          <div className="relative group">
            <FunnelIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400 group-focus-within:text-primary-500 transition-colors" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="pl-10 pr-8 py-2 bg-secondary-50/50 border border-secondary-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none appearance-none font-medium text-secondary-700 cursor-pointer"
            >
              <option>All Roles</option>
              <option>Admin</option>
              <option>Manager</option>
              <option>User</option>
            </select>
          </div>
        </div>

        {/* Table Area: Scrollable and Compact */}
        <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0">
          {loading ? (
            <div className="h-40 flex items-center justify-center">
              <ArrowPathIcon className="w-8 h-8 text-primary-500 animate-spin" />
            </div>
          ) : error ? (
            <div className="h-40 flex items-center justify-center text-danger-500 font-bold">
              {error}
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-secondary-50/80 backdrop-blur-sm z-10">
                <tr className="border-b border-secondary-100/50">
                  <th className="px-6 py-3 text-xs font-bold text-secondary-500 uppercase tracking-widest">Name</th>
                  <th className="px-6 py-3 text-xs font-bold text-secondary-500 uppercase tracking-widest">Email</th>
                  <th className="px-6 py-3 text-xs font-bold text-secondary-500 uppercase tracking-widest">Role</th>
                  <th className="px-6 py-3 text-xs font-bold text-secondary-500 uppercase tracking-widest">Department</th>
                  <th className="px-6 py-3 text-xs font-bold text-secondary-500 uppercase tracking-widest">Attachments</th>
                  <th className="px-6 py-3 text-xs font-bold text-secondary-500 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-3 text-xs font-bold text-secondary-500 uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-50">
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-primary-50/20 group transition-colors">
                    <td className="px-6 py-2.5">
                      <div className="flex items-center gap-3">
                        <Avatar 
                          name={emp.name} 
                          size="sm" 
                          src={emp.profile?.employeePhotoUrl ? `http://localhost:3001${emp.profile.employeePhotoUrl}` : undefined}
                        />
                        <span className="text-sm font-bold text-secondary-900">{emp.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-2.5">
                      <span className="text-sm text-secondary-600 font-medium">{emp.email}</span>
                    </td>
                    <td className="px-6 py-2.5">
                      <span className="text-xs font-bold px-2 py-0.5 bg-secondary-100 text-secondary-700 rounded-full border border-secondary-200 uppercase tracking-tight">
                        {emp.role}
                      </span>
                    </td>
                    <td className="px-6 py-2.5">
                      <span className="text-sm text-secondary-600">{emp.designation}</span>
                    </td>
                    <td className="px-6 py-2.5">
                      <span className="text-sm text-secondary-600">{emp.department}</span>
                    </td>
                    <td className="px-6 py-2.5">
                      <div className="flex items-center gap-2">
                        {emp.attachments?.panFile && (
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleViewAttachment(emp.attachments!.panFile!, 'PAN Card')}
                              className="p-1 text-secondary-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-all"
                              title="View PAN Card"
                            >
                              <EyeIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDownloadAttachment(emp.attachments!.panFile!.split('/').pop() || 'pan-card.pdf')}
                              className="p-1 text-secondary-400 hover:text-success-600 hover:bg-success-50 rounded transition-all"
                              title="Download PAN Card"
                            >
                              <ArrowDownTrayIcon className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                        {emp.attachments?.aadhaarFile && (
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleViewAttachment(emp.attachments!.aadhaarFile!, 'Aadhaar Card')}
                              className="p-1 text-secondary-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-all"
                              title="View Aadhaar Card"
                            >
                              <EyeIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDownloadAttachment(emp.attachments!.aadhaarFile!.split('/').pop() || 'aadhaar-card.pdf')}
                              className="p-1 text-secondary-400 hover:text-success-600 hover:bg-success-50 rounded transition-all"
                              title="Download Aadhaar Card"
                            >
                              <ArrowDownTrayIcon className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                        {emp.attachments?.employeePhoto && (
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleViewAttachment(emp.attachments!.employeePhoto!, 'Employee Photo')}
                              className="p-1 text-secondary-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-all"
                              title="View Employee Photo"
                            >
                              <EyeIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDownloadAttachment(emp.attachments!.employeePhoto!.split('/').pop() || 'employee-photo.jpg')}
                              className="p-1 text-secondary-400 hover:text-success-600 hover:bg-success-50 rounded transition-all"
                              title="Download Employee Photo"
                            >
                              <ArrowDownTrayIcon className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                        {emp.attachments?.bankStatement && (
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleViewAttachment(emp.attachments!.bankStatement!, 'Bank Statement')}
                              className="p-1 text-secondary-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-all"
                              title="View Bank Statement"
                            >
                              <EyeIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDownloadAttachment(emp.attachments!.bankStatement!.split('/').pop() || 'bank-statement.pdf')}
                              className="p-1 text-secondary-400 hover:text-success-600 hover:bg-success-50 rounded transition-all"
                              title="Download Bank Statement"
                            >
                              <ArrowDownTrayIcon className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                        {!emp.attachments?.panFile && !emp.attachments?.aadhaarFile && !emp.attachments?.employeePhoto && !emp.attachments?.bankStatement && (
                          <span className="text-xs text-secondary-400">None</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-2.5">
                      <StatusBadge status={emp.status} className="h-6" />
                    </td>
                    <td className="px-6 py-2.5 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleViewFullProfile(emp.id)}
                          className="p-1.5 text-secondary-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
                          title="View Full Profile"
                        >
                          <UsersIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleViewDetails(emp)}
                          className="p-1.5 text-secondary-400 hover:text-info-600 hover:bg-info-50 rounded-lg transition-all"
                          title="View Details"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleResendRegistrationEmail(emp.id, emp.name)}
                          className="p-1.5 text-secondary-400 hover:text-warning-600 hover:bg-warning-50 rounded-lg transition-all"
                          title="Resend Registration Email"
                        >
                          <PaperAirplaneIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingEmployee(emp)}
                          className="p-1.5 text-secondary-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                          title="Edit Employee"
                        >
                          <PencilSquareIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteEmployee(emp.id, emp.name)}
                          className="p-1.5 text-secondary-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-all"
                          title="Delete Employee"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredEmployees.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-2 opacity-40">
                        <UsersIcon className="w-10 h-10 text-secondary-300" />
                        <p className="text-sm font-bold text-secondary-500">No employees found matching your search</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Action Footer for Table (Optional) */}
        <div className="px-6 py-2 border-t border-secondary-100 bg-secondary-50/30 flex items-center justify-between flex-none">
          <p className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest">Showing {filteredEmployees.length} of {employees.length} Active Profiles</p>
          <div className="flex items-center gap-2 opacity-60">
            <span className="w-2 h-2 rounded-full bg-success-500" />
            <span className="text-[10px] font-bold text-secondary-500 uppercase tracking-wider">Database Synchronized</span>
          </div>
        </div>
      </Card>

      {/* Add/Edit Modal (Simple Language) */}
      <Modal
        isOpen={showAddModal || showEditModal}
        onClose={() => { 
          setShowAddModal(false); 
          setShowEditModal(false); 
          setEditingEmployee(null); 
        }}
        title={editingEmployee ? 'Edit Employee Details' : 'Add New Employee'}
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First Name"
              placeholder="e.g. Rahul"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
            <Input
              label="Last Name"
              placeholder="e.g. Varma"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>
          <Input
            label="Email ID"
            type="email"
            placeholder="rahul@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Designation"
              placeholder="e.g. Tax Associate"
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              required
            />
            <Input
              label="Date of Joining"
              type="date"
              value={dateOfJoining}
              onChange={(e) => setDateOfJoining(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-secondary-700 block ml-0.5">Software Role</label>
              <select
                className="w-full px-4 py-2.5 bg-white border border-secondary-200 rounded-lg outline-none transition-all duration-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 hover:border-secondary-300 text-sm font-medium"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
              >
                <option value="Employee">Employee</option>
                <option value="Manager">Manager</option>
                <option value="Admin">Admin</option>
                <option value="Partner">Partner</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-secondary-700 block ml-0.5">Department</label>
              <select
                className="w-full px-4 py-2.5 bg-white border border-secondary-200 rounded-lg outline-none transition-all duration-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 hover:border-secondary-300 text-sm font-medium"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                required
              >
                <option value="Accounting">Accounting</option>
                <option value="Operations">Operations</option>
                <option value="Internal Audit">Internal Audit</option>
                <option value="Automations">Automations</option>
                <option value="Statutory Audit">Statutory Audit</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-secondary-700 block ml-0.5">Reporting Partner</label>
              <select
                className="w-full px-4 py-2.5 bg-white border border-secondary-200 rounded-lg outline-none transition-all duration-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 hover:border-secondary-300 text-sm font-medium"
                value={reportingPartner}
                onChange={(e) => setReportingPartner(e.target.value)}
              >
                <option value="">Select Partner...</option>
                {partners.map(partner => (
                  <option key={partner.id} value={partner.id}>
                    {partner.firstName} {partner.lastName}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-secondary-700 block ml-0.5">Reporting Manager</label>
              <select
                className="w-full px-4 py-2.5 bg-white border border-secondary-200 rounded-lg outline-none transition-all duration-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 hover:border-secondary-300 text-sm font-medium"
                value={reportingManager}
                onChange={(e) => setReportingManager(e.target.value)}
              >
                <option value="">Select Manager...</option>
                {managers.map(manager => (
                  <option key={manager.id} value={manager.id}>
                    {manager.firstName} {manager.lastName}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Employee Code"
              value={employeeCode}
              disabled
              placeholder="Auto-generated by system"
            />
          </div>
          <div className="pt-4 flex gap-3">
            <Button variant="secondary" fullWidth onClick={() => { 
              setShowAddModal(false); 
              setShowEditModal(false); 
              setEditingEmployee(null); 
            }}>Cancel</Button>
            <Button variant="primary" fullWidth onClick={editingEmployee ? handleUpdateEmployee : handleCreateEmployee}>
              {editingEmployee ? 'Update Employee' : 'Add Employee'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Employee Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedEmployee(null);
        }}
        title="Employee Details"
        size="xl"
      >
        {selectedEmployee && (
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="bg-secondary-50 rounded-lg p-4">
              <h3 className="text-lg font-bold text-secondary-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-secondary-500">Employee ID:</span>
                  <p className="text-sm font-bold text-secondary-900">{selectedEmployee.employeeId}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-secondary-500">Full Name:</span>
                  <p className="text-sm font-bold text-secondary-900">{selectedEmployee.name}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-secondary-500">Office Email:</span>
                  <p className="text-sm font-bold text-secondary-900">{selectedEmployee.email}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-secondary-500">Phone:</span>
                  <p className="text-sm font-bold text-secondary-900">{selectedEmployee.phone || 'Not provided'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-secondary-500">Department:</span>
                  <p className="text-sm font-bold text-secondary-900">{selectedEmployee.department}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-secondary-500">Designation:</span>
                  <p className="text-sm font-bold text-secondary-900">{selectedEmployee.designation}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-secondary-500">Role:</span>
                  <p className="text-sm font-bold text-secondary-900">{selectedEmployee.role}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-secondary-500">Status:</span>
                  <StatusBadge status={selectedEmployee.status} className="h-6" />
                </div>
                <div>
                  <span className="text-sm font-medium text-secondary-500">Date of Joining:</span>
                  <p className="text-sm font-bold text-secondary-900">{selectedEmployee.joining_date || selectedEmployee.joinDate}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-secondary-500">Created At:</span>
                  <p className="text-sm font-bold text-secondary-900">{new Date(selectedEmployee.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* Profile Information */}
            {selectedEmployee.profile && (
              <div className="bg-secondary-50 rounded-lg p-4">
                <h3 className="text-lg font-bold text-secondary-900 mb-4">Profile Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-secondary-500">Date of Birth:</span>
                    <p className="text-sm font-bold text-secondary-900">
                      {selectedEmployee.profile.dob ? new Date(selectedEmployee.profile.dob).toLocaleDateString() : 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-secondary-500">Education:</span>
                    <p className="text-sm font-bold text-secondary-900">{selectedEmployee.profile.education || 'Not provided'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-secondary-500">Marital Status:</span>
                    <p className="text-sm font-bold text-secondary-900">{selectedEmployee.profile.maritalStatus || 'Not provided'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-secondary-500">Gender:</span>
                    <p className="text-sm font-bold text-secondary-900">{selectedEmployee.profile.gender || 'Not provided'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-secondary-500">Personal Email:</span>
                    <p className="text-sm font-bold text-secondary-900">{selectedEmployee.profile.personalEmail || 'Not provided'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-secondary-500">Personal Mobile:</span>
                    <p className="text-sm font-bold text-secondary-900">{selectedEmployee.profile.personalMobile || 'Not provided'}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-sm font-medium text-secondary-500">Permanent Address:</span>
                    <p className="text-sm font-bold text-secondary-900">{selectedEmployee.profile.permanentAddress || 'Not provided'}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-sm font-medium text-secondary-500">Current Address:</span>
                    <p className="text-sm font-bold text-secondary-900">{selectedEmployee.profile.currentAddress || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Attachments */}
            <div className="bg-secondary-50 rounded-lg p-4">
              <h3 className="text-lg font-bold text-secondary-900 mb-4">Attachments</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-secondary-500">PAN Card:</span>
                  <div className="mt-1">
                    {selectedEmployee.attachments?.panFile ? (
                      <button
                        onClick={() => handleViewAttachment(selectedEmployee.attachments!.panFile!, 'PAN Card')}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium underline"
                      >
                        View PAN Card
                      </button>
                    ) : (
                      <p className="text-sm text-secondary-400">Not uploaded</p>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-sm font-medium text-secondary-500">Aadhaar Card:</span>
                  <div className="mt-1">
                    {selectedEmployee.attachments?.aadhaarFile ? (
                      <button
                        onClick={() => handleViewAttachment(selectedEmployee.attachments!.aadhaarFile!, 'Aadhaar Card')}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium underline"
                      >
                        View Aadhaar Card
                      </button>
                    ) : (
                      <p className="text-sm text-secondary-400">Not uploaded</p>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-sm font-medium text-secondary-500">Employee Photo:</span>
                  <div className="mt-1">
                    {selectedEmployee.attachments?.employeePhoto ? (
                      <button
                        onClick={() => handleViewAttachment(selectedEmployee.attachments!.employeePhoto!, 'Employee Photo')}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium underline"
                      >
                        View Employee Photo
                      </button>
                    ) : (
                      <p className="text-sm text-secondary-400">Not uploaded</p>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-sm font-medium text-secondary-500">Bank Statement:</span>
                  <div className="mt-1">
                    {selectedEmployee.attachments?.bankStatement ? (
                      <button
                        onClick={() => handleViewAttachment(selectedEmployee.attachments!.bankStatement!, 'Bank Statement')}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium underline"
                      >
                        View Bank Statement
                      </button>
                    ) : (
                      <p className="text-sm text-secondary-400">Not uploaded</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Registration Status */}
            <div className="bg-secondary-50 rounded-lg p-4">
              <h3 className="text-lg font-bold text-secondary-900 mb-4">Registration Status</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-secondary-500">Active Registration Token:</span>
                  <p className="text-sm font-bold text-secondary-900">
                    {selectedEmployee.hasActiveRegistrationToken ? 'Yes' : 'No'}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-secondary-500">Token Expiry:</span>
                  <p className="text-sm font-bold text-secondary-900">
                    {selectedEmployee.registrationTokenExpiry 
                      ? new Date(selectedEmployee.registrationTokenExpiry).toLocaleString()
                      : 'No active token'
                    }
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="secondary" fullWidth onClick={() => setShowDetailsModal(false)}>
                Close
              </Button>
              <Button 
                variant="primary" 
                fullWidth 
                onClick={() => handleResendRegistrationEmail(selectedEmployee.id, selectedEmployee.name)}
              >
                Resend Registration Email
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Enhanced Employee Profile Modal */}
      <Modal
        isOpen={showProfileModal}
        onClose={() => {
          setShowProfileModal(false);
          setEnhancedEmployeeDetails(null);
        }}
        title="Complete Employee Profile"
        size="full"
      >
        {enhancedEmployeeDetails && (
          <div className="space-y-6 max-h-[80vh] overflow-y-auto">
            {/* Section 1: Personal Information */}
            <div className="bg-white border border-secondary-200 rounded-lg p-6">
              <h3 className="text-lg font-bold text-secondary-900 mb-4 flex items-center gap-2">
                <UsersIcon className="w-5 h-5 text-primary-600" />
                Personal Information
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <span className="text-sm font-medium text-secondary-500">First Name:</span>
                  <p className="text-sm font-bold text-secondary-900">{enhancedEmployeeDetails.personalDetails.firstName}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-secondary-500">Last Name:</span>
                  <p className="text-sm font-bold text-secondary-900">{enhancedEmployeeDetails.personalDetails.lastName}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-secondary-500">Email:</span>
                  <p className="text-sm font-bold text-secondary-900">{enhancedEmployeeDetails.personalDetails.email}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-secondary-500">Phone:</span>
                  <p className="text-sm font-bold text-secondary-900">{enhancedEmployeeDetails.personalDetails.phone || 'Not provided'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-secondary-500">Date of Birth:</span>
                  <p className="text-sm font-bold text-secondary-900">
                    {enhancedEmployeeDetails.personalDetails.date_of_birth 
                      ? new Date(enhancedEmployeeDetails.personalDetails.date_of_birth).toLocaleDateString()
                      : 'Not provided'
                    }
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-secondary-500">Gender:</span>
                  <p className="text-sm font-bold text-secondary-900">{enhancedEmployeeDetails.personalDetails.gender || 'Not provided'}</p>
                </div>
                <div className="col-span-3">
                  <span className="text-sm font-medium text-secondary-500">Address:</span>
                  <p className="text-sm font-bold text-secondary-900">{enhancedEmployeeDetails.personalDetails.address || 'Not provided'}</p>
                </div>
              </div>
            </div>

            {/* Section 2: Guardian Information */}
            <div className="bg-white border border-secondary-200 rounded-lg p-6">
              <h3 className="text-lg font-bold text-secondary-900 mb-4 flex items-center gap-2">
                <UsersIcon className="w-5 h-5 text-info-600" />
                Guardian Information
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <span className="text-sm font-medium text-secondary-500">Guardian Name:</span>
                  <p className="text-sm font-bold text-secondary-900">{enhancedEmployeeDetails.guardianDetails.guardian_name || 'Not provided'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-secondary-500">Guardian Phone:</span>
                  <p className="text-sm font-bold text-secondary-900">{enhancedEmployeeDetails.guardianDetails.guardian_phone || 'Not provided'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-secondary-500">Guardian Relation:</span>
                  <p className="text-sm font-bold text-secondary-900">{enhancedEmployeeDetails.guardianDetails.guardian_relation || 'Not provided'}</p>
                </div>
              </div>
            </div>

            {/* Section 3: Education Details */}
            <div className="bg-white border border-secondary-200 rounded-lg p-6">
              <h3 className="text-lg font-bold text-secondary-900 mb-4 flex items-center gap-2">
                <DocumentIcon className="w-5 h-5 text-success-600" />
                Education Details
              </h3>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <span className="text-sm font-medium text-secondary-500">Qualification:</span>
                  <p className="text-sm font-bold text-secondary-900">{enhancedEmployeeDetails.educationDetails.qualification || 'Not provided'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-secondary-500">University:</span>
                  <p className="text-sm font-bold text-secondary-900">{enhancedEmployeeDetails.educationDetails.university || 'Not provided'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-secondary-500">Passing Year:</span>
                  <p className="text-sm font-bold text-secondary-900">{enhancedEmployeeDetails.educationDetails.passing_year || 'Not provided'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-secondary-500">Grade:</span>
                  <p className="text-sm font-bold text-secondary-900">{enhancedEmployeeDetails.educationDetails.grade || 'Not provided'}</p>
                </div>
              </div>
            </div>

            {/* Section 4: Bank Details */}
            <div className="bg-white border border-secondary-200 rounded-lg p-6">
              <h3 className="text-lg font-bold text-secondary-900 mb-4 flex items-center gap-2">
                <DocumentIcon className="w-5 h-5 text-warning-600" />
                Bank Details
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-secondary-500">Bank Name:</span>
                  <p className="text-sm font-bold text-secondary-900">{enhancedEmployeeDetails.bankDetails.bank_name || 'Not provided'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-secondary-500">Account Number:</span>
                  <p className="text-sm font-bold text-secondary-900">{enhancedEmployeeDetails.bankDetails.account_number || 'Not provided'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-secondary-500">IFSC Code:</span>
                  <p className="text-sm font-bold text-secondary-900">{enhancedEmployeeDetails.bankDetails.ifsc_code || 'Not provided'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-secondary-500">Branch Name:</span>
                  <p className="text-sm font-bold text-secondary-900">{enhancedEmployeeDetails.bankDetails.branch_name || 'Not provided'}</p>
                </div>
              </div>
            </div>

            {/* Section 5: Identity Documents */}
            <div className="bg-white border border-secondary-200 rounded-lg p-6">
              <h3 className="text-lg font-bold text-secondary-900 mb-4 flex items-center gap-2">
                <FolderOpenIcon className="w-5 h-5 text-indigo-600" />
                Identity Documents
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-secondary-500">PAN Number:</span>
                  <p className="text-sm font-bold text-secondary-900">{enhancedEmployeeDetails.identityDetails.pan_number || 'Not provided'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-secondary-500">Aadhaar Number:</span>
                  <p className="text-sm font-bold text-secondary-900">{enhancedEmployeeDetails.identityDetails.aadhaar_number || 'Not provided'}</p>
                </div>
              </div>
            </div>

            {/* Section 6: Attachments */}
            <div className="bg-white border border-secondary-200 rounded-lg p-6">
              <h3 className="text-lg font-bold text-secondary-900 mb-4 flex items-center gap-2">
                <DocumentIcon className="w-5 h-5 text-purple-600" />
                Attachments
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <span className="text-sm font-medium text-secondary-500">PAN Card:</span>
                  <div className="mt-2 flex gap-2">
                    {enhancedEmployeeDetails.attachments.pan_card_file && (
                      <>
                        <button
                          onClick={() => handleViewAttachment(enhancedEmployeeDetails.attachments.pan_card_file!, 'PAN Card')}
                          className="text-primary-600 hover:text-primary-700 text-sm font-medium underline"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDownloadAttachment(enhancedEmployeeDetails.attachments.pan_card_file!.split('/').pop() || 'pan-card.pdf')}
                          className="text-success-600 hover:text-success-700 text-sm font-medium underline"
                        >
                          Download
                        </button>
                      </>
                    )}
                    {!enhancedEmployeeDetails.attachments.pan_card_file && (
                      <p className="text-sm text-secondary-400">Not uploaded</p>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-sm font-medium text-secondary-500">Aadhaar Card:</span>
                  <div className="mt-2 flex gap-2">
                    {enhancedEmployeeDetails.attachments.aadhaar_card_file && (
                      <>
                        <button
                          onClick={() => handleViewAttachment(enhancedEmployeeDetails.attachments.aadhaar_card_file!, 'Aadhaar Card')}
                          className="text-primary-600 hover:text-primary-700 text-sm font-medium underline"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDownloadAttachment(enhancedEmployeeDetails.attachments.aadhaar_card_file!.split('/').pop() || 'aadhaar-card.pdf')}
                          className="text-success-600 hover:text-success-700 text-sm font-medium underline"
                        >
                          Download
                        </button>
                      </>
                    )}
                    {!enhancedEmployeeDetails.attachments.aadhaar_card_file && (
                      <p className="text-sm text-secondary-400">Not uploaded</p>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-sm font-medium text-secondary-500">Education Certificate:</span>
                  <div className="mt-2 flex gap-2">
                    {enhancedEmployeeDetails.attachments.education_certificate && (
                      <>
                        <button
                          onClick={() => handleViewAttachment(enhancedEmployeeDetails.attachments.education_certificate!, 'Education Certificate')}
                          className="text-primary-600 hover:text-primary-700 text-sm font-medium underline"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDownloadAttachment(enhancedEmployeeDetails.attachments.education_certificate!.split('/').pop() || 'education-certificate.pdf')}
                          className="text-success-600 hover:text-success-700 text-sm font-medium underline"
                        >
                          Download
                        </button>
                      </>
                    )}
                    {!enhancedEmployeeDetails.attachments.education_certificate && (
                      <p className="text-sm text-secondary-400">Not uploaded</p>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-sm font-medium text-secondary-500">Profile Photo:</span>
                  <div className="mt-2 flex gap-2">
                    {enhancedEmployeeDetails.attachments.profile_photo && (
                      <>
                        <button
                          onClick={() => handleViewAttachment(enhancedEmployeeDetails.attachments.profile_photo!, 'Profile Photo')}
                          className="text-primary-600 hover:text-primary-700 text-sm font-medium underline"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDownloadAttachment(enhancedEmployeeDetails.attachments.profile_photo!.split('/').pop() || 'profile-photo.jpg')}
                          className="text-success-600 hover:text-success-700 text-sm font-medium underline"
                        >
                          Download
                        </button>
                      </>
                    )}
                    {!enhancedEmployeeDetails.attachments.profile_photo && (
                      <p className="text-sm text-secondary-400">Not uploaded</p>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-sm font-medium text-secondary-500">Other Documents:</span>
                  <div className="mt-2 flex gap-2">
                    {enhancedEmployeeDetails.attachments.other_documents && (
                      <>
                        <button
                          onClick={() => handleViewAttachment(enhancedEmployeeDetails.attachments.other_documents!, 'Other Documents')}
                          className="text-primary-600 hover:text-primary-700 text-sm font-medium underline"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDownloadAttachment(enhancedEmployeeDetails.attachments.other_documents!.split('/').pop() || 'other-documents.pdf')}
                          className="text-success-600 hover:text-success-700 text-sm font-medium underline"
                        >
                          Download
                        </button>
                      </>
                    )}
                    {!enhancedEmployeeDetails.attachments.other_documents && (
                      <p className="text-sm text-secondary-400">Not uploaded</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="secondary" fullWidth onClick={() => setShowProfileModal(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Employees;
