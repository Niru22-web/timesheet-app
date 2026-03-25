import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon,
  UserIcon,
  DocumentTextIcon,
  BanknotesIcon,
  PhotoIcon,
  IdentificationIcon,
  AcademicCapIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import StatusBadge from '../components/ui/StatusBadge';
import Avatar from '../components/ui/Avatar';
import Modal from '../components/ui/Modal';
import API from '../api';
import { useAuth } from '../contexts/AuthContext';

interface EmployeeDetails {
  // Personal Details
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  officeEmail: string;
  personalEmail?: string;
  phone?: string;
  address?: string;
  dob?: string;
  gender?: string;
  
  // Identity Details
  panNumber?: string;
  aadhaarNumber?: string;
  
  // Guardian Details
  guardianName?: string;
  guardianPhone?: string;
  guardianRelation?: string;
  
  // Education Details
  qualification?: string;
  university?: string;
  passingYear?: string;
  
  // Bank Details
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  branchName?: string;
  
  // Employment Details
  role: string;
  designation: string;
  department: string;
  reportingPartner?: string;
  reportingManager?: string;
  status: string;
  joiningDate?: string;
  
  // Attachments
  profile?: {
    panFileUrl?: string;
    aadhaarFileUrl?: string;
    employeePhotoUrl?: string;
    bankStatementFileUrl?: string;
  };
  
  // Reporting details
  reportingPartnerDetails?: {
    id: string;
    firstName: string;
    lastName: string;
    officeEmail: string;
    role: string;
  };
  reportingManagerDetails?: {
    id: string;
    firstName: string;
    lastName: string;
    officeEmail: string;
    role: string;
  };
}

const EditEmployee: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const isAdmin = () => {
    const role = user?.role?.toLowerCase() || '';
    return role === 'admin' || role === 'owner';
  };

  const isManagement = () => {
    const role = user?.role?.toLowerCase() || '';
    return ['manager', 'admin', 'partner', 'owner'].includes(role);
  };
  
  const [employee, setEmployee] = useState<EmployeeDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{type: string; employeeName: string; employeeId: string} | null>(null);

  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [selectedPartner, setSelectedPartner] = useState<string>('');
  const [selectedManager, setSelectedManager] = useState<string>('');
  const [partners, setPartners] = useState<any[]>([]);
  const [managers, setManagers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);

  useEffect(() => {
    fetchEmployeeDetails();
  }, [id]);

  const fetchEmployeeDetails = async () => {
    try {
      setLoading(true);
      const response = await API.get(`/employees/${id}`);
      
      if (response.data.success) {
        const empData = response.data.data;
        setEmployee(empData);
        
        console.log('📋 Employee data loaded:', {
          department: empData.department,
          partnerId: empData.reportingPartner,
          managerId: empData.reportingManager
        });
        
        // Fetch all users for dropdowns if admin/management
        if (isManagement()) {
          fetchUsers();
        }
      } else {
        setError('Failed to fetch employee details');
      }
    } catch (err: any) {
      setError('Error fetching employee details: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      console.log('🔍 Fetching all employees for dropdowns...');
      const response = await API.get('/employees');
      
      let allUsers = [];
      if (response.data?.success && Array.isArray(response.data.data)) {
        allUsers = response.data.data;
      } else if (Array.isArray(response.data)) {
        allUsers = response.data;
      }

      const pts = allUsers.filter((u: any) => u.role === 'Partner');
      const mgs = allUsers.filter((u: any) => u.role === 'Manager');
      
      setPartners(pts);
      setManagers(mgs);
      console.log(`✅ Loaded ${pts.length} partners and ${mgs.length} managers`);
      
      // Debug: Log manager reportingPartner values
      console.log('📋 Manager reporting structure:', mgs.map(m => ({
        name: `${m.firstName} ${m.lastName}`,
        id: m.id || m._id,
        department: m.department,
        reportingPartner: m.reportingPartner
      })));
    } catch (err) {
      console.error('❌ Error fetching users:', err);
    } finally {
      setUsersLoading(false);
    }
  };

  // Filter partners based on selected department
  const filteredPartners = partners.filter(
    (p) => p.department === (selectedDepartment || employee?.department)
  );

  // Filter managers based on:
  // - selected department
  // - selected partner (managers who report to this partner)
  const filteredManagers = managers.filter(
    (m) => {
      const matchesDepartment = m.department === (selectedDepartment || employee?.department);
      const matchesPartner = m.reportingPartner === selectedPartner;
      
      console.log(`Edit Mode - Manager ${m.firstName} ${m.lastName}:`, {
        department: m.department,
        matchesDepartment,
        reportingPartner: m.reportingPartner,
        selectedPartner: selectedPartner,
        matchesPartner
      });
      
      return matchesDepartment && matchesPartner;
    }
  );

  // Edit Mode: Pre-fill values ONLY after data is loaded
  useEffect(() => {
    if (employee && !usersLoading && partners.length > 0) {
      console.log('🔄 Pre-filling dropdown values in edit mode');
      setSelectedDepartment(employee.department || '');
      setSelectedPartner(employee.reportingPartner || '');
      setSelectedManager(employee.reportingManager || '');
    }
  }, [employee, usersLoading, partners]);

  // Debug logs
  useEffect(() => {
    if (isManagement()) {
      console.log("Partners:", partners);
      console.log("Filtered Partners:", filteredPartners);
      console.log("Selected Partner:", selectedPartner);
      console.log("Filtered Managers:", filteredManagers);
      console.log("Selected Manager:", selectedManager);
    }
  }, [selectedDepartment, selectedPartner, selectedManager, partners, managers]);

  const handleSave = async () => {
    if (!employee) return;
    
    try {
      setSaving(true);
      
      // Only allow editing of certain fields
      const updateData = {
        firstName: employee.firstName,
        lastName: employee.lastName,
        officeEmail: employee.officeEmail,
        personalEmail: employee.personalEmail,
        phone: employee.phone,
        address: employee.address,
        gender: employee.gender,
        guardianName: employee.guardianName,
        guardianPhone: employee.guardianPhone,
        guardianRelation: employee.guardianRelation,
        qualification: employee.qualification,
        university: employee.university,
        passingYear: employee.passingYear,
        bankName: employee.bankName,
        accountNumber: employee.accountNumber,
        ifscCode: employee.ifscCode,
        branchName: employee.branchName,
        // Allow editing of these fields for admins
        role: employee.role,
        department: employee.department,
        designation: employee.designation,
        reportingPartner: selectedPartner || null,
        reportingManager: selectedManager || null,
        status: employee.status
      };
      
      const response = await API.put(`/employees/${id}`, updateData);
      
      if (response.data) {
        alert('Employee updated successfully!');
        navigate('/employees');
      } else {
        setError('Failed to update employee');
      }
    } catch (err: any) {
      setError('Error updating employee: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleResendRegistrationEmail = async (employeeId: string, employeeName: string) => {
    setConfirmAction({ type: 'resend-email', employeeId, employeeName });
    setShowConfirmDialog(true);
  };

  const handleConfirmAction = async () => {
    if (!confirmAction) return;
    
    if (confirmAction.type === 'resend-email') {
      try {
        const response = await API.post(`/employees/resend-registration/${confirmAction.employeeId}`);
        if (response.data.success) {
          alert('✅ Registration email sent successfully.');
        } else {
          alert('❌ Failed to send registration email');
        }
      } catch (err: any) {
        console.error('Error resending registration email:', err);
        const errorMessage = err.response?.data?.error || err.message || 'Failed to resend registration email';
        alert(`❌ ${errorMessage}`);
      }
    }
    
    setShowConfirmDialog(false);
    setConfirmAction(null);
  };

  const handleDownloadAttachment = (url: string, filename: string) => {
    if (url) {
      const link = document.createElement('a');
      link.href = `${import.meta.env.VITE_API_BASE_URL}${url}`;
      link.download = filename;
      link.click();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading employee details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <div className="text-center p-8">
            <div className="text-red-600 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
            <p className="text-gray-600">{error}</p>
            <Button 
              onClick={() => navigate('/employees')}
              className="mt-6"
            >
              Back to Employees
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!employee) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <Button
            onClick={() => navigate('/employees')}
            variant="secondary"
            className="mb-4"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Employees
          </Button>
          
          {isAdmin() && (
            <Button
              onClick={() => handleResendRegistrationEmail(employee.id, `${employee.firstName} ${employee.lastName}`)}
              variant="secondary"
              className="mb-4"
              leftIcon={<EnvelopeIcon className="w-4 h-4" />}
            >
              Resend Registration Email
            </Button>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Edit Employee</h1>
            <p className="text-gray-600">
              Editing: {employee.firstName} {employee.lastName} ({employee.employeeId})
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <StatusBadge status={employee.status} className="capitalize" />
            {isAdmin() && (
              <select
                className="text-xs border rounded px-2 py-1 bg-gray-50"
                value={employee.status}
                onChange={(e) => setEmployee({...employee, status: e.target.value})}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            )}
          </div>
        </div>

        {/* Personal Information */}
        <Card className="mb-8">
          <div className="flex items-center mb-4">
            <UserIcon className="w-5 h-5 text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <Input
                label="First Name"
                value={employee.firstName}
                onChange={(e) => setEmployee({...employee, firstName: e.target.value})}
                required
              />
            </div>
            
            <div>
              <Input
                label="Last Name"
                value={employee.lastName}
                onChange={(e) => setEmployee({...employee, lastName: e.target.value})}
                required
              />
            </div>
            
            <div>
              <Input
                label="Office Email"
                type="email"
                value={employee.officeEmail || ''}
                onChange={(e) => setEmployee({...employee, officeEmail: e.target.value})}
                required
              />
            </div>
            
            <div>
              <Input
                label="Personal Email"
                type="email"
                value={employee.personalEmail || ''}
                onChange={(e) => setEmployee({...employee, personalEmail: e.target.value})}
              />
            </div>
            
            <div>
              <Input
                label="Phone"
                value={employee.phone || ''}
                onChange={(e) => setEmployee({...employee, phone: e.target.value})}
              />
            </div>
            
            <div>
              <Input
                label="Address"
                value={employee.address || ''}
                onChange={(e) => setEmployee({...employee, address: e.target.value})}
              />
            </div>
            
            <div>
              <Input
                label="Date of Birth"
                type="date"
                value={employee.dob ? employee.dob.split('T')[0] : ''}
                onChange={(e) => setEmployee({...employee, dob: e.target.value})}
              />
            </div>
            
            <div>
              <Input
                label="Gender"
                value={employee.gender || ''}
                onChange={(e) => setEmployee({...employee, gender: e.target.value})}
              />
            </div>
          </div>
        </Card>

        {/* Identity Documents */}
        <Card className="mb-8">
          <div className="flex items-center mb-4">
            <IdentificationIcon className="w-5 h-5 text-green-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Identity Documents</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Input
                label="PAN Number"
                value={employee.panNumber || ''}
                onChange={(e) => setEmployee({...employee, panNumber: e.target.value})}
              />
            </div>
            
            <div>
              <Input
                label="Aadhaar Number"
                value={employee.aadhaarNumber || ''}
                onChange={(e) => setEmployee({...employee, aadhaarNumber: e.target.value})}
              />
            </div>
          </div>
          
          {/* Attachments */}
          <div className="mt-6">
            <h3 className="text-md font-medium text-gray-900 mb-4">Document Attachments</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {employee.profile?.panFileUrl && (
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">PAN Card</span>
                    <Button
                      onClick={() => handleDownloadAttachment(employee.profile!.panFileUrl!, 'pan-card.pdf')}
                      variant="secondary"
                      size="sm"
                    >
                      Download
                    </Button>
                  </div>
                </div>
              )}
              
              {employee.profile?.aadhaarFileUrl && (
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Aadhaar Card</span>
                    <Button
                      onClick={() => handleDownloadAttachment(employee.profile!.aadhaarFileUrl!, 'aadhaar-card.pdf')}
                      variant="secondary"
                      size="sm"
                    >
                      Download
                    </Button>
                  </div>
                </div>
              )}
              
              {employee.profile?.employeePhotoUrl && (
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Employee Photo</span>
                    <Button
                      onClick={() => handleDownloadAttachment(employee.profile!.employeePhotoUrl!, 'employee-photo.jpg')}
                      variant="secondary"
                      size="sm"
                    >
                      Download
                    </Button>
                  </div>
                  <img 
                    src={`${import.meta.env.VITE_API_BASE_URL}${employee.profile!.employeePhotoUrl}`}
                    alt="Employee Photo" 
                    className="mt-2 w-20 h-20 rounded object-cover"
                  />
                </div>
              )}
              
              {employee.profile?.bankStatementFileUrl && (
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Bank Statement</span>
                    <Button
                      onClick={() => handleDownloadAttachment(employee.profile!.bankStatementFileUrl!, 'bank-statement.pdf')}
                      variant="secondary"
                      size="sm"
                    >
                      Download
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Guardian Details */}
        <Card className="mb-8">
          <div className="flex items-center mb-4">
            <UserGroupIcon className="w-5 h-5 text-purple-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Guardian Details</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <Input
                label="Guardian Name"
                value={employee.guardianName || ''}
                onChange={(e) => setEmployee({...employee, guardianName: e.target.value})}
              />
            </div>
            
            <div>
              <Input
                label="Guardian Phone"
                value={employee.guardianPhone || ''}
                onChange={(e) => setEmployee({...employee, guardianPhone: e.target.value})}
              />
            </div>
            
            <div>
              <Input
                label="Guardian Relation"
                value={employee.guardianRelation || ''}
                onChange={(e) => setEmployee({...employee, guardianRelation: e.target.value})}
              />
            </div>
          </div>
        </Card>

        {/* Education Details */}
        <Card className="mb-8">
          <div className="flex items-center mb-4">
            <AcademicCapIcon className="w-5 h-5 text-indigo-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Education Details</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <Input
                label="Qualification"
                value={employee.qualification || ''}
                onChange={(e) => setEmployee({...employee, qualification: e.target.value})}
              />
            </div>
            
            <div>
              <Input
                label="University"
                value={employee.university || ''}
                onChange={(e) => setEmployee({...employee, university: e.target.value})}
              />
            </div>
            
            <div>
              <Input
                label="Passing Year"
                value={employee.passingYear || ''}
                onChange={(e) => setEmployee({...employee, passingYear: e.target.value})}
              />
            </div>
          </div>
        </Card>

        {/* Bank Details */}
        <Card className="mb-8">
          <div className="flex items-center mb-4">
            <BanknotesIcon className="w-5 h-5 text-green-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Bank Details</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <Input
                label="Bank Name"
                value={employee.bankName || ''}
                onChange={(e) => setEmployee({...employee, bankName: e.target.value})}
              />
            </div>
            
            <div>
              <Input
                label="Account Number"
                value={employee.accountNumber || ''}
                onChange={(e) => setEmployee({...employee, accountNumber: e.target.value})}
              />
            </div>
            
            <div>
              <Input
                label="IFSC Code"
                value={employee.ifscCode || ''}
                onChange={(e) => setEmployee({...employee, ifscCode: e.target.value})}
              />
            </div>
            
            <div>
              <Input
                label="Branch Name"
                value={employee.branchName || ''}
                onChange={(e) => setEmployee({...employee, branchName: e.target.value})}
              />
            </div>
          </div>
        </Card>

        <Card className="mb-20">
          <div className="flex items-center mb-4">
            <BuildingOfficeIcon className="w-5 h-5 text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Employment Details</h2>
            {!isAdmin() && <span className="ml-4 text-sm text-amber-600 bg-amber-50 px-2 py-1 rounded">Read-only</span>}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Software Role</label>
              {isAdmin() ? (
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={employee.role}
                  onChange={(e) => {
                    const newRole = e.target.value;
                    console.log('🔄 Role changed to:', newRole);
                    let updates: any = { role: newRole };
                    if (newRole === 'Partner') {
                      updates.reportingPartner = '';
                      updates.reportingManager = '';
                      setSelectedPartner('');
                      setSelectedManager('');
                    } else if (newRole === 'Manager' && employee.reportingPartner) {
                      updates.reportingManager = employee.reportingPartner;
                      setSelectedManager(employee.reportingPartner);
                    } else if (newRole === 'Employee') {
                      // Keep existing partner/manager for employees
                      setSelectedManager(employee.reportingManager || '');
                    }
                    setEmployee({...employee, ...updates});
                  }}
                >
                  <option value="Employee">Employee</option>
                  <option value="Manager">Manager</option>
                  <option value="Partner">Partner</option>
                  <option value="Admin">Admin</option>
                </select>
              ) : (
                <Input value={employee.role} disabled className="bg-gray-100" />
              )}
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Designation</label>
              <Input
                value={employee.designation}
                onChange={(e) => setEmployee({...employee, designation: e.target.value})}
                disabled={!isAdmin()}
                className={!isAdmin() ? "bg-gray-100" : ""}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Department</label>
              {isAdmin() ? (
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={selectedDepartment || employee.department}
                  onChange={(e) => {
                    const dept = e.target.value;
                    setSelectedDepartment(dept);
                    setSelectedPartner(''); // Reset partner when department changes
                    setSelectedManager(''); // Reset manager when department changes
                    setEmployee({...employee, department: dept, reportingPartner: '', reportingManager: ''});
                  }}
                >
                  <option value="Accounting">Accounting</option>
                  <option value="Operations">Operations</option>
                  <option value="Internal Audit">Internal Audit</option>
                  <option value="Automations">Automations</option>
                  <option value="Statutory Audit">Statutory Audit</option>
                </select>
              ) : (
                <Input value={employee.department} disabled className="bg-gray-100" />
              )}
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Reporting Partner</label>
              {isAdmin() && employee.role !== 'Partner' ? (
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={selectedPartner || ""}
                  onChange={(e) => {
                    const pId = e.target.value;
                    console.log('🔄 Partner selected:', pId);
                    setSelectedPartner(pId);
                    setSelectedManager(''); // Reset manager when partner changes
                    
                    let updates: any = { reportingPartner: pId };
                    if (employee.role === 'Manager') {
                      updates.reportingManager = pId;
                      setSelectedManager(pId);
                    } else if (employee.role === 'Employee') {
                      updates.reportingManager = '';
                      setSelectedManager('');
                    }
                    setEmployee({...employee, ...updates});
                  }}
                >
                  <option value="">Select Partner...</option>
                  {usersLoading ? (
                    <option disabled>Loading partners...</option>
                  ) : filteredPartners.length > 0 ? (
                    filteredPartners.map(p => (
                      <option key={p.id || p._id} value={p.id || p._id}>{p.firstName} {p.lastName}</option>
                    ))
                  ) : (
                    <option disabled>No partners available for this department</option>
                  )}
                </select>
              ) : (
                <Input
                  value={employee.reportingPartnerDetails ? 
                    `${employee.reportingPartnerDetails.firstName} ${employee.reportingPartnerDetails.lastName}` : 'None'}
                  disabled
                  className="bg-gray-100"
                />
              )}
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Reporting Manager</label>
              {isAdmin() && employee.role === 'Employee' ? (
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={selectedManager || ""}
                  onChange={(e) => {
                    const mId = e.target.value;
                    console.log('🔄 Manager selected:', mId);
                    setSelectedManager(mId);
                    setEmployee({...employee, reportingManager: mId});
                  }}
                >
                  <option value="">Select Manager...</option>
                  {usersLoading ? (
                    <option disabled>Loading managers...</option>
                  ) : filteredManagers.length > 0 ? (
                    filteredManagers.map(m => (
                      <option key={m.id || m._id} value={m.id || m._id}>{m.firstName} {m.lastName}</option>
                    ))
                  ) : selectedPartner ? (
                    // Show partners as fallback managers when no managers exist under selected partner
                    partners.filter(p => (p.id || p._id) === selectedPartner).map(partner => (
                      <option key={partner.id || partner._id} value={partner.id || partner._id}>
                        {partner.firstName} {partner.lastName} (Partner)
                      </option>
                    ))
                  ) : (
                    <option disabled>Select a partner first</option>
                  )}
                </select>
              ) : isAdmin() && employee.role === 'Manager' ? (
                <div className="px-3 py-2 bg-gray-50 border rounded-md text-sm text-gray-600">
                  {selectedPartner ? 
                    `${partners.find(p => (p.id || p._id) === selectedPartner)?.firstName || ''} ${partners.find(p => (p.id || p._id) === selectedPartner)?.lastName || ''} (Partner)` 
                    : 'Select Partner first'}
                </div>
              ) : (
                <Input
                  value={employee.reportingManagerDetails ? 
                    `${employee.reportingManagerDetails.firstName} ${employee.reportingManagerDetails.lastName}` : 'None'}
                  disabled
                  className="bg-gray-100"
                />
              )}
            </div>
            
            <div>
              <Input
                label="Joining Date"
                type="date"
                value={employee.joiningDate ? employee.joiningDate.split('T')[0] : ''}
                onChange={(e) => setEmployee({...employee, joiningDate: e.target.value})}
                disabled={!isAdmin()}
                className={!isAdmin() ? "bg-gray-100" : ""}
              />
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 mb-8">
          <Button
            onClick={() => navigate('/employees')}
            variant="secondary"
          >
            Cancel
          </Button>
          
          <Button
            onClick={handleSave}
            disabled={saving}
            className="min-w-32"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="fixed bottom-4 right-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-lg max-w-md">
            <div className="flex">
              <span className="text-sm font-medium">{error}</span>
              <button
                onClick={() => setError('')}
                className="ml-auto text-red-400 hover:text-red-600"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Confirmation Dialog */}
        <Modal
          isOpen={showConfirmDialog}
          onClose={() => {
            setShowConfirmDialog(false);
            setConfirmAction(null);
          }}
          title="Confirm Action"
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-secondary-700">
              {confirmAction?.type === 'resend-email' ? `Do you want to resend the registration email to ${confirmAction.employeeName}?` : ''}
            </p>
            <div className="flex gap-3 pt-4">
              <Button 
                variant="secondary" 
                onClick={() => {
                  setShowConfirmDialog(false);
                  setConfirmAction(null);
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleConfirmAction}
              >
                Confirm
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default EditEmployee;
