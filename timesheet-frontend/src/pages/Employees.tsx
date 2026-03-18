import React, { useState, useEffect, useRef } from 'react';
import { APP_CONFIG } from '../config/appConfig';
import API from '../api';
import {
  UsersIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  TrashIcon,
  PlusIcon,
  FunnelIcon,
  EyeIcon,
  PaperAirplaneIcon,
  DocumentIcon,
  FolderOpenIcon,
  ArrowDownTrayIcon,
  CloudArrowUpIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// UI Components
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import StatusBadge from '../components/ui/StatusBadge';
import Modal from '../components/ui/Modal';
import Avatar from '../components/ui/Avatar';
import ResponsiveTable from '../components/ui/ResponsiveTable';

interface EmployeeDocument {
  id: string;
  employeeId: string;
  title: string;
  category: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
  uploadedBy?: string;
}

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
  reportingPartner?: string;
  reportingManager?: string;
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
  role: string;
  department: string;
  designation: string;
  status: string;
  createdAt: string;
  reportingPartner?: string;
  reportingManager?: string;
  profile?: {
    dob?: string;
    doj?: string;
    education?: string;
    maritalStatus?: string;
    gender?: string;
    permanentAddress?: string;
    currentAddress?: string;
    pan?: string;
    aadhaar?: string;
    panFileUrl?: string;
    aadhaarFileUrl?: string;
    currentPinCode?: string;
    guardianAddress?: string;
    guardianName?: string;
    guardianNumber?: string;
    personalEmail?: string;
    personalMobile?: string;
    employeePhotoUrl?: string;
    accountHolderName?: string;
    bankAccountNumber?: string;
    bankName?: string;
    branchName?: string;
    ifscCode?: string;
    bankStatementFileUrl?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    emergencyContactRelation?: string;
  };
  reportingPartnerDetails?: {
    id: string;
    employeeId: string;
    firstName: string;
    lastName: string;
    officeEmail: string;
    role: string;
  };
  reportingManagerDetails?: {
    id: string;
    employeeId: string;
    firstName: string;
    lastName: string;
    officeEmail: string;
    role: string;
  };
  hasActiveRegistrationToken?: boolean;
  registrationTokenExpiry?: string;
}

const Employees: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{type: string; employeeId: string; employeeName: string} | null>(null);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [enhancedEmployeeDetails, setEnhancedEmployeeDetails] = useState<EnhancedEmployeeDetails | null>(null);
  const [employeeDocuments, setEmployeeDocuments] = useState<EmployeeDocument[]>([]);
  const [showDocumentsModal, setShowDocumentsModal] = useState(false);
  const [showUploadDocumentModal, setShowUploadDocumentModal] = useState(false);
  const [documentTitle, setDocumentTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentCategory, setDocumentCategory] = useState('Other');
  const [uploadingDocument, setUploadingDocument] = useState(false);
  
  // Document categories
  const documentCategories = [
    'Offer Letter',
    'Employment Contract', 
    'ID Proof',
    'Address Proof',
    'Salary Slip',
    'Experience Letter',
    'Educational Documents',
    'Other'
  ];
  
  // Enhanced modal states
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedEmployeeData, setEditedEmployeeData] = useState<any>(null);
  const [savingChanges, setSavingChanges] = useState(false);

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [partners, setPartners] = useState<any[]>([]);
  const [partnersLoading, setPartnersLoading] = useState(true);
  const [managers, setManagers] = useState<any[]>([]);
  const [managersLoading, setManagersLoading] = useState(false);
  const [showPendingApprovals, setShowPendingApprovals] = useState(false);

  // Check if user is admin or manager, if not redirect to dashboard
  useEffect(() => {
    if (user) {
      const userRole = user.role?.toLowerCase() || '';
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
  
  // Details modal states for partner/manager selection
  const [detailsReportingPartner, setDetailsReportingPartner] = useState('');
  const [detailsManagers, setDetailsManagers] = useState<any[]>([]);
  const [detailsManagersLoading, setDetailsManagersLoading] = useState(false);
  
  // Store original reporting manager to preserve during loading
  const [originalReportingManager, setOriginalReportingManager] = useState<string>('');

  // Auto-populate fields when Role changes
  useEffect(() => {
    if (role === 'Partner') {
      // Partner role: hide both reporting fields
      setReportingPartner('');
      setReportingManager('');
    } else if (role === 'Manager' && reportingPartner) {
      // Manager role: auto-populate manager with selected partner
      const selectedPartner = partners.find(p => p.id === reportingPartner);
      if (selectedPartner) {
        setReportingManager(selectedPartner.id);
      }
    } else if (role === 'Employee' && reportingPartner) {
      // Employee role: clear manager if partner changes
      setReportingManager('');
    } else {
      // Clear reporting fields for other roles
      setReportingManager('');
    }
  }, [role, reportingPartner, partners]);

  // Populate form when editing employee
  useEffect(() => {
    if (editingEmployee && !partnersLoading) {
      console.log('📝 Populating edit form with employee data:', editingEmployee);
      console.log('👥 Available partners:', partners);
      
      const names = `${editingEmployee?.firstName || ''} ${editingEmployee?.lastName || ''}`.trim().split(' ');
      setFirstName(names[0] || '');
      setLastName(names.slice(1).join(' ') || '');
      setEmail(editingEmployee.officeEmail || ''); // Fixed: use officeEmail
      setRole(editingEmployee.role);
      setDesignation(editingEmployee.designation);
      setDepartment(editingEmployee.department || 'Accounting');
      
      // Set reporting partner and trigger manager fetch
      const reportingPartnerId = editingEmployee.reportingPartner || '';
      const reportingManagerId = editingEmployee.reportingManager || '';
      console.log('🎯 Setting reporting values:', {
        reportingPartnerId,
        reportingManagerId,
        partnerExists: partners.some(p => p.id === reportingPartnerId)
      });
      
      setReportingPartner(reportingPartnerId);
      
      // Store the reporting manager ID to set after managers are loaded
      if (reportingManagerId) {
        console.log('💾 Storing reporting manager ID for later:', reportingManagerId);
        setOriginalReportingManager(reportingManagerId);
        // We'll set this after managers are loaded
      }
      
      // Managers will be fetched automatically when reportingPartner changes
      setEmployeeCode(editingEmployee.employeeId || '');
    }
  }, [editingEmployee, partners, partnersLoading]); // Added partnersLoading dependency

  // Fetch partners for dropdown
  const partnersApiCallLogged = useRef(false);
  const fetchPartners = async () => {
    try {
      setPartnersLoading(true);
      console.log('🔍 Fetching partners...');
      const response = await API.get('/employees/partners');
      console.log('📋 Partners response:', response.data);
      if (response.data && Array.isArray(response.data)) {
        setPartners(response.data);
        console.log(`✅ Found ${response.data.length} partners`);
      } else {
        setPartners([]);
      }
    } catch (error) {
      console.error('❌ Error fetching partners:', error);
      setPartners([]); // fallback
    } finally {
      setPartnersLoading(false);
    }
  };

  // Fetch managers based on selected partner
  const fetchManagersByPartner = async (partnerId: string, includeManagerId?: string) => {
    if (!partnerId) {
      console.log('🔄 No partnerId provided, clearing managers');
      setManagers([]);
      return;
    }
    
    try {
      setManagersLoading(true);
      console.log('🔍 Fetching managers for partner:', partnerId);
      const apiUrl = includeManagerId 
        ? `/employees/managers-by-partner?partnerId=${partnerId}&includeManagerId=${includeManagerId}`
        : `/employees/managers-by-partner?partnerId=${partnerId}`;
      const response = await API.get(apiUrl);
      console.log('📋 Managers API response status:', response.status);
      console.log('📋 Managers API response data:', response.data);
      console.log('📋 Managers API response headers:', response.headers);
      
      if (response.data && Array.isArray(response.data)) {
        console.log(`✅ Found ${response.data.length} managers under partner ${partnerId}`);
        response.data.forEach((manager, index) => {
          console.log(`  Manager ${index + 1}: ${manager.firstName} ${manager.lastName} (${manager.id})`);
        });
        setManagers(response.data);
      } else {
        console.log('❌ Invalid managers response:', response.data);
        setManagers([]);
      }
    } catch (error) {
      console.error('❌ Error fetching managers by partner:', error);
      console.error('❌ Error details:', error.response?.data || error.message);
      setManagers([]); // fallback
    } finally {
      setManagersLoading(false);
    }
  };
  
  // Fetch managers for details modal based on selected partner
  const fetchDetailsManagersByPartner = async (partnerId: string, includeManagerId?: string) => {
    if (!partnerId) {
      console.log('🔄 No partnerId provided for details, clearing managers');
      setDetailsManagers([]);
      return;
    }
    
    try {
      setDetailsManagersLoading(true);
      console.log('🔍 Fetching details managers for partner:', partnerId);
      const apiUrl = includeManagerId 
        ? `/employees/managers-by-partner?partnerId=${partnerId}&includeManagerId=${includeManagerId}`
        : `/employees/managers-by-partner?partnerId=${partnerId}`;
      const response = await API.get(apiUrl);
      console.log('📋 Details managers API response:', response.data);
      
      if (response.data && Array.isArray(response.data)) {
        console.log(`✅ Found ${response.data.length} details managers under partner ${partnerId}`);
        setDetailsManagers(response.data);
      } else {
        console.log('❌ Invalid details managers response:', response.data);
        setDetailsManagers([]);
      }
    } catch (error) {
      console.error('❌ Error fetching details managers by partner:', error);
      setDetailsManagers([]);
    } finally {
      setDetailsManagersLoading(false);
    }
  };

  // Fetch partners on component mount
  useEffect(() => {
    fetchPartners();
  }, []);

  // Log partners state for debugging
  useEffect(() => {
    console.log('👥 Partners state updated:', partners);
  }, [partners]);

  // Log managers state for debugging
  useEffect(() => {
    console.log('👨‍💼 Managers state updated:', managers);
  }, [managers]);

  // Fetch managers when reporting partner changes
  useEffect(() => {
    console.log('🔄 Reporting partner changed, fetching managers...', {
      reportingPartner,
      hasPartnerId: !!reportingPartner
    });
    
    if (reportingPartner) {
      // In edit mode, include the current manager ID to ensure it appears in dropdown
      const managerIdToInclude = editingEmployee?.reportingManager;
      fetchManagersByPartner(reportingPartner, managerIdToInclude);
    } else {
      console.log('🔄 No reporting partner selected, clearing managers');
      setManagers([]);
    }
  }, [reportingPartner, editingEmployee?.reportingManager]);
  
  // Fetch managers for details modal when partner changes
  useEffect(() => {
    console.log('🔄 Details reporting partner changed, fetching managers...', {
      detailsReportingPartner,
      hasPartnerId: !!detailsReportingPartner
    });
    
    if (detailsReportingPartner) {
      // In edit mode, include the current manager ID to ensure it appears in dropdown
      const managerIdToInclude = enhancedEmployeeDetails?.reportingManager;
      fetchDetailsManagersByPartner(detailsReportingPartner, managerIdToInclude);
    } else {
      console.log('🔄 No details reporting partner selected, clearing managers');
      setDetailsManagers([]);
    }
  }, [detailsReportingPartner, enhancedEmployeeDetails?.reportingManager]);

  // Set reporting manager when managers are loaded (for edit mode)
  useEffect(() => {
    if (editingEmployee && reportingPartner && !managersLoading) {
      const reportingManagerId = editingEmployee.reportingManager || '';
      console.log('🎯 Setting reporting manager from employee data:', {
        reportingManagerId,
        managersAvailable: managers.length,
        managerExists: managers.some(m => m.id === reportingManagerId),
        isEditMode: !!editingEmployee,
        originalReportingManager
      });
      
      // Only proceed if we have managers loaded or we're in edit mode with a valid manager
      if (reportingManagerId) {
        if (managers.some(m => m.id === reportingManagerId)) {
          console.log('✅ Setting reporting manager from employee data (found in managers list)');
          setReportingManager(reportingManagerId);
        } else if (managers.length === 0 && reportingPartner) {
          console.log('⚠️ No managers found for selected partner, checking if partner should be used as fallback');
          // Only use partner as fallback if the employee's reporting manager IS the partner
          const selectedPartner = partners.find(p => p.id === reportingPartner);
          if (selectedPartner && reportingManagerId === reportingPartner) {
            console.log('🔄 Employee reports directly to partner, setting partner as manager');
            setReportingManager(reportingPartner);
          } else {
            console.log('⚠️ Employee reporting manager not found in filtered managers list and is not the partner');
            // Don't clear the manager - keep the original value for debugging
            console.log('🔍 Keeping original manager ID for reference:', reportingManagerId);
            // Set the original manager as the value to preserve it
            setReportingManager(reportingManagerId);
          }
        } else {
          console.log('⚠️ Employee reporting manager not found in filtered managers list');
          // Don't clear - this might be a data issue or timing issue
          console.log('🔍 Available managers:', managers.map(m => ({ id: m.id, name: `${m.firstName} ${m.lastName}` })));
          // Preserve the original manager ID
          setReportingManager(reportingManagerId);
        }
      }
    }
  }, [editingEmployee, reportingPartner, managers, managersLoading, partners, originalReportingManager]);
  
  // Set reporting manager when managers are loaded and we have an original manager to set
  useEffect(() => {
    if (originalReportingManager && !managersLoading && managers.length > 0) {
      console.log('🔄 Setting original reporting manager after managers loaded:', {
        originalReportingManager,
        managersAvailable: managers.length,
        managerExists: managers.some(m => m.id === originalReportingManager)
      });
      
      if (managers.some(m => m.id === originalReportingManager)) {
        console.log('✅ Setting original reporting manager (found in managers list)');
        setReportingManager(originalReportingManager);
        // Clear the original after setting
        setOriginalReportingManager('');
      } else {
        console.log('⚠️ Original reporting manager not found in current managers list');
        // Still set it to preserve the value
        setReportingManager(originalReportingManager);
        // Clear the original after setting
        setOriginalReportingManager('');
      }
    }
  }, [originalReportingManager, managers, managersLoading]);
  
  // Initialize details modal states when enhanced employee data is loaded
  useEffect(() => {
    if (enhancedEmployeeDetails && isEditMode) {
      const partnerId = enhancedEmployeeDetails.reportingPartner || '';
      console.log('🎯 Initializing details modal states:', {
        partnerId,
        managerId: enhancedEmployeeDetails.reportingManager
      });
      
      setDetailsReportingPartner(partnerId);
      
      // Set manager after managers are loaded
      if (partnerId && !detailsManagersLoading) {
        fetchDetailsManagersByPartner(partnerId);
      }
    }
  }, [enhancedEmployeeDetails, isEditMode]);
  
  // Set details reporting manager when managers are loaded
  useEffect(() => {
    if (enhancedEmployeeDetails && detailsReportingPartner && !detailsManagersLoading) {
      const reportingManagerId = enhancedEmployeeDetails.reportingManager || '';
      console.log('🎯 Setting details reporting manager:', {
        reportingManagerId,
        managersAvailable: detailsManagers.length,
        managerExists: detailsManagers.some(m => m.id === reportingManagerId)
      });
      
      // Update the editedEmployeeData with the correct reporting manager
      if (detailsManagers.some(m => m.id === reportingManagerId)) {
        console.log('✅ Details reporting manager found in managers list');
        // Manager is already set in enhancedEmployeeDetails, no need to update
      } else if (detailsManagers.length === 0 && detailsReportingPartner) {
        console.log('⚠️ No details managers found, using partner as fallback');
        // Use partner as fallback if no managers exist
        setEditedEmployeeData(prev => ({
          ...prev,
          reportingManager: detailsReportingPartner
        }));
      } else {
        console.log('⚠️ Details reporting manager not found, clearing');
        setEditedEmployeeData(prev => ({
          ...prev,
          reportingManager: ''
        }));
      }
    }
  }, [enhancedEmployeeDetails, detailsReportingPartner, detailsManagers, detailsManagersLoading]);

  // Auto-populate fields when Role changes in Details Modal edit mode
  useEffect(() => {
    if (isEditMode && editedEmployeeData) {
      const currentRole = editedEmployeeData.role;
      const currentPartner = editedEmployeeData.reportingPartner;
      
      if (currentRole === 'Partner') {
        // Partner role: both reporting fields must be empty
        if (editedEmployeeData.reportingPartner !== '' || editedEmployeeData.reportingManager !== '') {
          console.log('🔄 Role changed to Partner, clearing reporting fields');
          setDetailsReportingPartner('');
          setEditedEmployeeData((prev: any) => ({
            ...prev,
            reportingPartner: '',
            reportingManager: ''
          }));
        }
      } else if (currentRole === 'Manager' && currentPartner) {
        // Manager role: manager MUST be the same as partner (direct report to partner)
        if (editedEmployeeData.reportingManager !== currentPartner) {
          console.log('🔄 Role is Manager, setting manager same as partner');
          setEditedEmployeeData((prev: any) => ({
            ...prev,
            reportingManager: currentPartner
          }));
        }
      } else if (currentRole === 'Employee' && currentPartner && !editedEmployeeData.reportingManager) {
          // If switching to Employee, maybe leave it empty for manual selection?
          // Or keep as is. In Add modal, it's cleared.
      }
    }
  }, [isEditMode, editedEmployeeData?.role, editedEmployeeData?.reportingPartner]);

  useEffect(() => {
    fetchEmployees();
    fetchPendingApprovals();
  }, []);

  const pendingApprovalsApiCallLogged = useRef(false);
  const fetchPendingApprovals = async () => {
    try {
      if (!pendingApprovalsApiCallLogged.current) {
        console.log('Pending approvals API call disabled due to 404 error');
        pendingApprovalsApiCallLogged.current = true;
      }
      // const response = await API.get('/employees/pending-approvals');
      // if (response.data?.data && Array.isArray(response.data.data)) {
      //   setPendingApprovals(response.data.data);
      // }
      setPendingApprovals([]); // Set empty array as fallback
    } catch (error) {
      if (!pendingApprovalsApiCallLogged.current) {
        console.error('Error fetching pending approvals:', error);
        pendingApprovalsApiCallLogged.current = true;
      }
      setPendingApprovals([]); // fallback
    }
  };

  const handleApproveEmployee = async (employeeId: string) => {
    console.log('Approve employee clicked:', employeeId);
    try {
      await API.post(`/employees/approve-employee/${employeeId}`);
      fetchPendingApprovals();
      fetchEmployees();
    } catch (err) {
      console.error('Failed to approve employee:', err);
      alert('Failed to approve employee');
    }
  };

  const handleRejectEmployee = async (employeeId: string) => {
    console.log('Reject employee clicked:', employeeId);
    if (window.confirm('Are you sure you want to reject this employee? This action cannot be undone.')) {
      try {
        await API.post(`/employees/reject-employee/${employeeId}`, { reason: 'Rejected by administrator' });
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
      setError(null);
      const response = await API.get('/employees');
      
      // Handle both wrapped response and direct array
      let employeeData = [];
      if (response.data?.success && Array.isArray(response.data.data)) {
        employeeData = response.data.data;
      } else if (Array.isArray(response.data)) {
        employeeData = response.data;
      } else {
        console.error('Invalid response format:', response.data);
        employeeData = [];
        setError('Failed to load employees: Invalid data format');
      }
      
      setEmployees(employeeData);
    } catch (error: any) {
      console.error('Error fetching employees:', error);
      setEmployees([]);
      setError(error.response?.data?.error || error.message || 'Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEmployee = async () => {
    console.log('Create employee clicked');
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
      refreshAfterAction();
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
      refreshAfterAction();
    } catch (err) {
      console.error('Failed to update employee:', err);
      alert('Failed to update employee');
    }
  };

  const handleDeleteEmployee = async (id: string, employeeName: string) => {
    console.log('Delete employee clicked:', id, employeeName);
    if (window.confirm(`Are you sure you want to delete ${employeeName}? This action cannot be undone and will remove all associated data including timelogs, projects, and reimbursements.`)) {
      try {
        await API.delete(`/employees/${id}`);
        refreshAfterAction();
        alert('Employee deleted successfully');
      } catch (err: any) {
        console.error('Error deleting employee:', err);
        const errorMessage = err.response?.data?.error || err.message || 'Failed to delete employee. Please try again.';
        alert(`Delete failed: ${errorMessage}`);
      }
    }
  };

  const handleViewDetails = (employee: Employee) => {
    console.log("Opening employee details modal for:", employee);
    setSelectedEmployee(employee);
    setEditedEmployeeData(employee);
    setShowDetailsModal(true);
    // Fetch full employee details to ensure complete data is available
    if (employee.id) {
      fetchFullEmployeeDetails(employee.id);
    }
  };

  const handleViewEmployee = (emp: Employee) => {
    console.log("View employee clicked:", emp);
    handleViewDetails(emp);
  };

  const handleEditEmployee = (employee: Employee) => {
    console.log('Edit employee clicked:', employee);
    setEditingEmployee(employee);
    setShowEditModal(true);
  };

  const fetchFullEmployeeDetails = async (employeeId: string) => {
    if (!employeeId) {
      console.error('Employee ID is required');
      return;
    }
    
    try {
      console.log('🔍 Fetching full employee details for:', employeeId);
      const response = await API.get(`/employees/${employeeId}`);
      console.log('📋 Full employee response:', response.data);
      if (response.data.success && response.data.data) {
        const employeeData = response.data.data;
        console.log('👤 Employee data structure:', {
          role: employeeData.role,
          department: employeeData.department,
          reportingPartner: employeeData.reportingPartner,
          reportingManager: employeeData.reportingManager,
          officeEmail: employeeData.officeEmail,
          profile: employeeData.profile
        });
        setEnhancedEmployeeDetails(employeeData);
        setEditedEmployeeData(employeeData);
      } else {
        console.error('Invalid response format:', response.data);
        setEnhancedEmployeeDetails(null);
        setEditedEmployeeData(null);
      }
    } catch (error) {
      console.error('Error fetching full employee details:', error);
      alert('Failed to fetch employee details');
      setEnhancedEmployeeDetails(null);
      setEditedEmployeeData(null);
    }
  };

  const handleEditToggle = () => {
    if (isEditMode) {
      // Cancel editing - reset to original data
      setEditedEmployeeData(enhancedEmployeeDetails);
      setIsEditMode(false);
    } else {
      // Enter edit mode
      setIsEditMode(true);
    }
  };

  const handleFieldChange = (field: string, value: any, section?: string) => {
    console.log(`🔄 Field change: ${field} = ${value}, section: ${section}`);
    if (section) {
      setEditedEmployeeData((prev: any) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }));
    } else {
      setEditedEmployeeData((prev: any) => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSaveChanges = async () => {
    console.log("💾 Save button clicked - editedEmployeeData:", editedEmployeeData);
    console.log("💾 Save button clicked - enhancedEmployeeDetails:", enhancedEmployeeDetails);
    
    if (!editedEmployeeData || !editedEmployeeData.id) {
      console.error('No employee data available to save');
      alert('No employee data available to save');
      return;
    }
    
    setSavingChanges(true);
    try {
      const payload = {
        firstName: editedEmployeeData.firstName || '',
        lastName: editedEmployeeData.lastName || '',
        officeEmail: editedEmployeeData.officeEmail || '',
        role: editedEmployeeData.role || 'Employee',
        designation: editedEmployeeData.designation || '',
        department: editedEmployeeData.department || '',
        status: editedEmployeeData.status || 'active',
        reportingPartner: editedEmployeeData.reportingPartner || null,
        reportingManager: editedEmployeeData.reportingManager || null,
        profile: editedEmployeeData.profile || null
      };
      
      console.log("📤 Payload being sent to backend:", payload);
      
      const response = await API.put(`/employees/${editedEmployeeData.id}`, payload);
      
      console.log("📥 Response from backend:", response.data);
      
      if (response.data.success) {
        alert('✅ Employee details updated successfully');
        // Re-fetch the entire record to get updated names and details
        if (editedEmployeeData.id) {
          fetchFullEmployeeDetails(editedEmployeeData.id);
        }
        setIsEditMode(false);
        refreshAfterAction();
      } else {
        alert('❌ Failed to update employee details');
      }
    } catch (error) {
      console.error('❌ Error updating employee:', error);
      alert('❌ Failed to update employee details');
    } finally {
      setSavingChanges(false);
    }
  };

  const handleViewDocuments = async (employee: Employee) => {
    try {
      const response = await API.get(`/employees/${employee.id}/documents`);
      if (response.data.success) {
        setEmployeeDocuments(response.data.data);
        setSelectedEmployee(employee);
        setShowDocumentsModal(true);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      alert('Failed to fetch documents');
    }
  };

  const handleUploadDocument = async () => {
    if (!selectedEmployee || !documentTitle || !selectedFile || !documentCategory) {
      alert('Please fill all fields and select a category');
      return;
    }

    setUploadingDocument(true);
    try {
      const formData = new FormData();
      formData.append('document', selectedFile);
      formData.append('title', documentTitle);
      formData.append('category', documentCategory);

      const response = await API.post(`/employees/${selectedEmployee.id}/documents`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        alert('Document uploaded successfully');
        setShowUploadDocumentModal(false);
        setDocumentTitle('');
        setSelectedFile(null);
        setDocumentCategory('Other');
        // Refresh documents list
        handleViewDocuments(selectedEmployee);
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      alert('Failed to upload document');
    } finally {
      setUploadingDocument(false);
    }
  };

  const handleDownloadDocument = async (documentId: string, fileName: string) => {
    try {
      const response = await API.get(`/employees/documents/${documentId}/download`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('Failed to download document');
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      const response = await API.delete(`/employees/documents/${documentId}`);
      if (response.data.success) {
        alert('Document deleted successfully');
        // Refresh documents list
        if (selectedEmployee) {
          handleViewDocuments(selectedEmployee);
        }
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Failed to delete document');
    }
  };

  const handleDownloadAllAttachments = (employee: Employee) => {
    if (!employee.attachments) {
      alert('No attachments available for this employee');
      return;
    }

    const attachments = [];
    
    if (employee.attachments.panFile) {
      attachments.push({
        name: 'PAN Card',
        filename: (employee.attachments?.panFile || '').split('/').pop() || 'pan-card.pdf'
      });
    }
    
    if (employee.attachments.aadhaarFile) {
      attachments.push({
        name: 'Aadhaar Card',
        filename: (employee.attachments?.aadhaarFile || '').split('/').pop() || 'aadhaar-card.pdf'
      });
    }
    
    if (employee.attachments.employeePhoto) {
      attachments.push({
        name: 'Employee Photo',
        filename: (employee.attachments?.employeePhoto || '').split('/').pop() || 'employee-photo.jpg'
      });
    }
    
    if (employee.attachments.bankStatement) {
      attachments.push({
        name: 'Bank Statement',
        filename: (employee.attachments?.bankStatement || '').split('/').pop() || 'bank-statement.pdf'
      });
    }

    if (attachments.length === 0) {
      alert('No attachments available for this employee');
      return;
    }

    // Download each attachment
    attachments.forEach(attachment => {
      handleDownloadAttachment(attachment.filename);
    });
  };

  const handleResendRegistrationEmail = async (employeeId: string, employeeName: string) => {
    if (window.confirm(`Are you sure you want to resend the registration email to ${employeeName}?`)) {
      try {
        const response = await API.post(`/employees/resend-registration/${employeeId}`);
        if (response.data.success) {
          alert('✅ Registration email sent successfully.');
          refreshAfterAction(); // Refresh to update token status
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

  const handleResendEmailWithConfirmation = (employeeId: string, employeeName: string) => {
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
          refreshAfterAction(); // Refresh to update token status
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

  const isAdmin = () => {
    return user?.role?.toLowerCase() === 'admin';
  };

  const canEditEmployee = () => {
    const userRole = user?.role?.toLowerCase() || '';
    return userRole === 'admin' || userRole === 'manager' || userRole === 'partner' || userRole === 'owner';
  };

  // Auto-refresh after actions
  const refreshAfterAction = () => {
    setTimeout(() => {
      fetchEmployees();
      fetchPendingApprovals();
    }, 1000);
  };

  const handleViewAttachment = (attachmentUrl: string, fileName: string) => {
    if (attachmentUrl) {
      window.open(`http://localhost:5000${attachmentUrl}`, '_blank');
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
    const fullName = `${emp.firstName || ''} ${emp.lastName || ''}`.trim();
    const matchesSearch = fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (emp.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'All Roles' || emp.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (!employees || loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }
  
  if (error) {
    return <div className="flex justify-center items-center h-64 text-red-600">Error: {error}</div>;
  }

  // Final safety check
  if (!Array.isArray(employees)) {
    console.error('Employees data is not an array:', employees);
    return <div className="flex justify-center items-center h-64 text-red-600">Error: Invalid data format</div>;
  }

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
          {canEditEmployee() && (
            <Button
              variant="primary"
              size="sm"
              className="h-10 px-6 font-bold"
              onClick={() => setShowAddModal(true)}
              leftIcon={<PlusIcon className="w-4 h-4" />}
            >
              Add Employee
            </Button>
          )}
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
                      name={`${employee?.firstName || ''} ${employee?.lastName || ''}`}
                      size="sm" 
                      src={employee?.profile?.employeePhotoUrl ? `http://localhost:3001${employee.profile.employeePhotoUrl}` : undefined}
                    />
                    <div>
                      <h3 className="font-bold text-secondary-900">
                        {employee?.firstName && employee?.lastName 
                          ? `${employee.firstName} ${employee.lastName}` 
                          : employee?.officeEmail || 'No name available'}
                      </h3>
                      <p className="text-sm text-secondary-600">{employee?.officeEmail || 'No email available'}</p>
                      <p className="text-xs text-secondary-500">{employee?.designation || 'No designation'} • {employee?.employeeId || 'No ID'}</p>
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
                        <p className="text-secondary-700">{employee?.profile?.education || 'Not specified'}</p>
                      </div>
                      <div>
                        <span className="font-bold text-secondary-500">Mobile:</span>
                        <p className="text-secondary-700">{employee?.profile?.personalMobile || 'Not specified'}</p>
                      </div>
                      <div>
                        <span className="font-bold text-secondary-500">PAN:</span>
                        <p className="text-secondary-700">{employee?.profile?.pan || 'Not specified'}</p>
                      </div>
                      <div>
                        <span className="font-bold text-secondary-500">Documents:</span>
                        <p className="text-secondary-700">
                          {employee?.profile?.panFileUrl ? '✓ PAN' : ''}
                          {employee?.profile?.aadhaarFileUrl ? ' ✓ Aadhaar' : ''}
                          {employee?.profile?.employeePhotoUrl ? ' ✓ Photo' : ''}
                          {employee?.profile?.bankStatementFileUrl ? ' ✓ Bank Statement' : ''}
                          {!employee?.profile?.panFileUrl && !employee?.profile?.aadhaarFileUrl && !employee?.profile?.employeePhotoUrl && !employee?.profile?.bankStatementFileUrl ? 'None' : ''}
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

        {/* Table Area: Responsive Table */}
        <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0">
          {loading ? (
            <div className="h-40 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-danger-600">
              <div className="text-lg font-medium mb-2">Error loading employees</div>
              <div className="text-sm">{error}</div>
            </div>
          ) : (
            <ResponsiveTable
              data={filteredEmployees}
              columns={[
                {
                  key: 'name',
                  label: 'Name',
                  render: (value: string, row: Employee) => (
                    <div className="flex items-center gap-3">
                      <Avatar name={`${row.firstName || ''} ${row.lastName || ''}`} size="sm" />
                      <div>
                        <div className="font-medium text-secondary-900">
                          {row.firstName && row.lastName ? `${row.firstName} ${row.lastName}` : 
                           row.firstName || row.lastName || row.name || 'No name'}
                        </div>
                        <div className="text-xs text-secondary-500">{row.email}</div>
                      </div>
                    </div>
                  )
                },
                {
                  key: 'role',
                  label: 'Role',
                  render: (value: string) => (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                      {value}
                    </span>
                  )
                },
                {
                  key: 'designation',
                  label: 'Designation'
                },
                {
                  key: 'department',
                  label: 'Department'
                },
                {
                  key: 'status',
                  label: 'Status',
                  render: (value: string) => {
                    const statusConfig: Record<string, { variant: 'success' | 'danger' | 'warning' | 'secondary'; label: string }> = {
                      'Active': { variant: 'success', label: 'Active' },
                      'active': { variant: 'success', label: 'Active' },
                      'Inactive': { variant: 'danger', label: 'Inactive' },
                      'On Leave': { variant: 'warning', label: 'On Leave' },
                      'pending': { variant: 'warning', label: 'Pending' },
                      'rejected': { variant: 'danger', label: 'Rejected' }
                    };
                    const config = statusConfig[value] || { variant: 'secondary', label: value };
                    return <StatusBadge status={config.variant} text={config.label} />;
                  }
                }
              ]}
              actions={(row: Employee) => {
                const handleEditEmployeeLocal = (employee: Employee) => {
                  console.log('Edit employee clicked:', employee);
                  setEditingEmployee(employee);
                  setShowEditModal(true);
                };
                
                return (
                  <>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleViewEmployee(row)}
                      touchFriendly
                    >
                      <EyeIcon className="w-4 h-4" />
                    </Button>
                    {canEditEmployee() && (
                      <>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleEditEmployeeLocal(row)}
                          touchFriendly
                        >
                          <PencilSquareIcon className="w-4 h-4" />
                        </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleViewDocuments(row)}
                        touchFriendly
                      >
                        <FolderOpenIcon className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                  {isAdmin() && (
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDeleteEmployee(row.id, `${row.firstName || ''} ${row.lastName || ''}`.trim() || 'Unknown')}
                      touchFriendly
                    >
                      <TrashIcon className="w-4 h-4" />
                    </Button>
                  )}
                </>
                );
              }}
              emptyMessage="No employees found"
            />
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
          console.log('🔒 Edit modal closed, resetting form');
          // Reset form fields
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
        }}
        title={editingEmployee ? 'Edit Employee Details' : 'Add New Employee'}
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="First Name"
              placeholder="e.g. Rahul"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              touchFriendly
              required
              disabled={!canEditEmployee() && editingEmployee !== null}
            />
            <Input
              label="Last Name"
              placeholder="e.g. Varma"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              touchFriendly
              required
              disabled={!canEditEmployee() && editingEmployee !== null}
            />
          </div>
          <Input
            label="Official Email ID"
            type="email"
            placeholder="rahul@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            touchFriendly
            required
            disabled={!canEditEmployee() && editingEmployee !== null}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Designation"
              placeholder="e.g. Tax Associate"
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              touchFriendly
              required
              disabled={!canEditEmployee() && editingEmployee !== null}
            />
            <Input
              label="Date of Joining"
              type="date"
              value={dateOfJoining}
              onChange={(e) => setDateOfJoining(e.target.value)}
              touchFriendly
              required
              disabled={!canEditEmployee() && editingEmployee !== null}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-secondary-700 block ml-0.5">Software Role</label>
              <select
                className="w-full px-4 py-2.5 bg-white border border-secondary-200 rounded-lg outline-none transition-all duration-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 hover:border-secondary-300 text-sm font-medium disabled:bg-gray-100"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
                disabled={!canEditEmployee() && editingEmployee !== null}
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
                className="w-full px-4 py-2.5 bg-white border border-secondary-200 rounded-lg outline-none transition-all duration-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 hover:border-secondary-300 text-sm font-medium disabled:bg-gray-100"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                required
                disabled={!canEditEmployee() && editingEmployee !== null}
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
              {partnersLoading ? (
                <div className="w-full px-4 py-2.5 bg-gray-50 border border-secondary-200 rounded-lg text-sm text-gray-500">
                  Loading partners...
                </div>
              ) : (
                <select
                  className={`w-full px-4 py-2.5 bg-white border border-secondary-200 rounded-lg outline-none transition-all duration-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 hover:border-secondary-300 text-sm font-medium ${role === 'Partner' ? 'bg-gray-100 cursor-not-allowed' : ''} ${!canEditEmployee() && editingEmployee !== null ? 'disabled:bg-gray-100' : ''}`}
                  value={reportingPartner}
                  onChange={(e) => {
                    console.log('🔄 Reporting Partner changed to:', e.target.value);
                    setReportingPartner(e.target.value);
                  }}
                  disabled={role === 'Partner' || !canEditEmployee()}
                >
                  <option value="">Select Partner...</option>
                  {partners.length > 0 ? (
                    partners.map(partner => (
                      <option key={partner.id} value={partner.id}>
                        {partner.firstName} {partner.lastName}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>No partners available</option>
                  )}
                </select>
              )}
              {role === 'Partner' && (
                <p className="text-xs text-gray-500 mt-1">Partners cannot have reporting structure</p>
              )}
              {reportingPartner && !partners.some(p => p.id === reportingPartner) && (
                <p className="text-xs text-orange-500 mt-1">⚠️ Selected partner not found in list</p>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-secondary-700 block ml-0.5">Reporting Manager</label>
              {managersLoading ? (
                <div className="w-full px-4 py-2.5 bg-gray-50 border border-secondary-200 rounded-lg text-sm text-gray-500">
                  Loading managers...
                </div>
              ) : (
                <select
                  className={`w-full px-4 py-2.5 bg-white border border-secondary-200 rounded-lg outline-none transition-all duration-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 hover:border-secondary-300 text-sm font-medium ${role === 'Partner' || role === 'Manager' ? 'bg-gray-100 cursor-not-allowed' : ''} ${!canEditEmployee() && editingEmployee !== null ? 'disabled:bg-gray-100' : ''}`}
                  value={reportingManager}
                  onChange={(e) => {
                    console.log('🔄 Reporting Manager changed to:', e.target.value);
                    setReportingManager(e.target.value);
                  }}
                  disabled={role === 'Partner' || role === 'Manager' || !canEditEmployee()}
                >
                  <option value="">Select Manager...</option>
                  {role === 'Employee' && managers.length > 0 ? (
                    managers.map(manager => (
                      <option key={manager.id} value={manager.id}>
                        {manager.firstName} {manager.lastName}
                      </option>
                    ))
                  ) : role === 'Employee' && managers.length === 0 && reportingPartner ? (
                    // Show partners as fallback managers when no managers exist under selected partner
                    partners.filter(p => p.id === reportingPartner).map(partner => (
                      <option key={partner.id} value={partner.id}>
                        {partner.firstName} {partner.lastName} (Partner)
                      </option>
                    ))
                  ) : role === 'Employee' ? (
                    <option value="" disabled>No managers available under this partner</option>
                  ) : role === 'Manager' ? (
                    // For managers, show the selected partner as their manager
                    partners.filter(p => p.id === reportingPartner).map(partner => (
                      <option key={partner.id} value={partner.id}>
                        {partner.firstName} {partner.lastName} (Partner)
                      </option>
                    ))
                  ) : null}
                  {/* Edge case: If the selected manager is not in the current list, show it anyway */}
                  {reportingManager && !managers.some(m => m.id === reportingManager) && !partners.some(p => p.id === reportingManager) && (
                    <option value={reportingManager} disabled>
                      ⚠️ Unknown Manager (ID: {reportingManager})
                    </option>
                  )}
                </select>
              )}
              {(role === 'Partner' || role === 'Manager') && (
                <p className="text-xs text-gray-500 mt-1">
                  {role === 'Partner' ? 'Partners cannot have reporting structure' : 'Managers report to selected Partner'}
                </p>
              )}
              {reportingManager && !managers.some(m => m.id === reportingManager) && (
                <p className="text-xs text-orange-500 mt-1">⚠️ Selected manager not found in list</p>
              )}
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
          
          {/* Resend Registration Email Button for Edit Mode */}
          {editingEmployee && canEditEmployee() && (
            <div className="pt-4 border-t border-secondary-200">
              <Button
                variant="secondary"
                fullWidth
                onClick={() => handleResendEmailWithConfirmation(editingEmployee.id, `${editingEmployee.firstName || ''} ${editingEmployee.lastName || ''}`.trim() || 'Unknown')}
                leftIcon={<PaperAirplaneIcon className="w-4 h-4" />}
              >
                Resend Registration Email
              </Button>
            </div>
          )}
          
          <div className="pt-4 flex gap-3">
            <Button variant="secondary" fullWidth onClick={() => { 
              setShowAddModal(false); 
              setShowEditModal(false); 
              setEditingEmployee(null); 
            }}>Cancel</Button>
            {canEditEmployee() && (
              <Button variant="primary" fullWidth onClick={editingEmployee ? handleUpdateEmployee : handleCreateEmployee}>
                {editingEmployee ? 'Update Employee' : 'Add Employee'}
              </Button>
            )}
          </div>
        </div>
      </Modal>

      {/* Employee Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => {
          console.log("Closing employee details modal");
          setShowDetailsModal(false);
          setSelectedEmployee(null);
          setEnhancedEmployeeDetails(null);
          setEditedEmployeeData(null);
          setIsEditMode(false);
        }}
        title="Employee Details"
        size="full"
      >
        {editedEmployeeData && editedEmployeeData.id ? (
          <div className="space-y-6 max-h-[80vh] overflow-y-auto">
            {/* Modal Header with Edit Button */}
            <div className="flex items-center justify-between border-b border-secondary-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <UsersIcon className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-secondary-900">
                    {editedEmployeeData?.firstName || ''} {editedEmployeeData?.lastName || ''}
                  </h2>
                  <p className="text-sm text-secondary-500">{editedEmployeeData?.employeeId || 'N/A'}</p>
                </div>
              </div>
              {canEditEmployee() && (
                <div className="flex gap-2">
                  {isEditMode && (
                    <>
                      <Button
                        variant="primary"
                        onClick={handleSaveChanges}
                        disabled={savingChanges}
                        leftIcon={savingChanges ? null : <PencilSquareIcon className="w-4 h-4" />}
                      >
                        {savingChanges ? 'Saving...' : 'Save Changes'}
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={handleEditToggle}
                      >
                        Cancel
                      </Button>
                    </>
                  )}
                  {!isEditMode && (
                    <Button
                      variant="primary"
                      onClick={handleEditToggle}
                      leftIcon={<PencilSquareIcon className="w-4 h-4" />}
                    >
                      Edit
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Personal Information Section */}
            <div className="bg-white border border-secondary-200 rounded-lg p-6">
              <h3 className="text-lg font-bold text-secondary-900 mb-4 flex items-center gap-2">
                <UsersIcon className="w-5 h-5 text-primary-600" />
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-secondary-500 block mb-1">First Name</label>
                  {isEditMode && canEditEmployee() ? (
                    <Input
                      value={editedEmployeeData?.firstName || ''}
                      onChange={(e) => handleFieldChange('firstName', e.target.value)}
                      className="w-full"
                    />
                  ) : (
                    <p className="text-sm font-bold text-secondary-900">{editedEmployeeData?.firstName || 'Not provided'}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-secondary-500 block mb-1">Last Name</label>
                  {isEditMode && canEditEmployee() ? (
                    <Input
                      value={editedEmployeeData?.lastName || ''}
                      onChange={(e) => handleFieldChange('lastName', e.target.value)}
                      className="w-full"
                    />
                  ) : (
                    <p className="text-sm font-bold text-secondary-900">{editedEmployeeData?.lastName || 'Not provided'}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-secondary-500 block mb-1">Email</label>
                  {isEditMode && canEditEmployee() ? (
                    <Input
                      type="email"
                      value={editedEmployeeData?.officeEmail || ''}
                      onChange={(e) => handleFieldChange('officeEmail', e.target.value)}
                      className="w-full"
                    />
                  ) : (
                    <p className="text-sm font-bold text-secondary-900">{editedEmployeeData?.officeEmail || 'Not provided'}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-secondary-500 block mb-1">Phone</label>
                  {isEditMode && canEditEmployee() ? (
                    <Input
                      value={editedEmployeeData.profile?.personalMobile || ''}
                      onChange={(e) => handleFieldChange('personalMobile', e.target.value, 'profile')}
                      className="w-full"
                    />
                  ) : (
                    <p className="text-sm font-bold text-secondary-900">{editedEmployeeData.profile?.personalMobile || 'Not provided'}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-secondary-500 block mb-1">Date of Birth</label>
                  {isEditMode && canEditEmployee() ? (
                    <Input
                      type="date"
                      value={editedEmployeeData.profile?.dob ? new Date(editedEmployeeData.profile.dob).toISOString().split('T')[0] : ''}
                      onChange={(e) => handleFieldChange('dob', e.target.value, 'profile')}
                      className="w-full"
                    />
                  ) : (
                    <p className="text-sm font-bold text-secondary-900">
                      {editedEmployeeData.profile?.dob ? new Date(editedEmployeeData.profile.dob).toLocaleDateString() : 'Not provided'}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-secondary-500 block mb-1">Gender</label>
                  {isEditMode && canEditEmployee() ? (
                    <select
                      value={editedEmployeeData.profile?.gender || 'Other'}
                      onChange={(e) => handleFieldChange('gender', e.target.value, 'profile')}
                      className="w-full px-3 py-2 border border-secondary-200 rounded-lg text-sm"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  ) : (
                    <p className="text-sm font-bold text-secondary-900">{editedEmployeeData.profile?.gender || 'Not provided'}</p>
                  )}
                </div>
                <div className="col-span-1 md:col-span-2 lg:col-span-3">
                  <label className="text-sm font-medium text-secondary-500 block mb-1">Address</label>
                  {isEditMode && canEditEmployee() ? (
                    <textarea
                      value={editedEmployeeData.profile?.permanentAddress || ''}
                      onChange={(e) => handleFieldChange('permanentAddress', e.target.value, 'profile')}
                      className="w-full px-3 py-2 border border-secondary-200 rounded-lg text-sm"
                      rows={2}
                    />
                  ) : (
                    <p className="text-sm font-bold text-secondary-900">{editedEmployeeData.profile?.permanentAddress || 'Not provided'}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Professional Information Section */}
            <div className="bg-white border border-secondary-200 rounded-lg p-6">
              <h3 className="text-lg font-bold text-secondary-900 mb-4 flex items-center gap-2">
                <DocumentIcon className="w-5 h-5 text-success-600" />
                Professional Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-secondary-500 block mb-1">Employee ID</label>
                  <p className="text-sm font-bold text-secondary-900 bg-gray-50 px-3 py-2 rounded">{editedEmployeeData.employeeId}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-secondary-500 block mb-1">Role</label>
                  {isEditMode && canEditEmployee() ? (
                    <select
                      value={editedEmployeeData.role || 'Employee'}
                      onChange={(e) => handleFieldChange('role', e.target.value)}
                      className="w-full px-3 py-2 border border-secondary-200 rounded-lg text-sm"
                    >
                      <option value="">Select Role...</option>
                      <option value="Employee">Employee</option>
                      <option value="Manager">Manager</option>
                      <option value="Admin">Admin</option>
                      <option value="Partner">Partner</option>
                    </select>
                  ) : (
                    <p className="text-sm font-bold text-secondary-900">{editedEmployeeData.role || 'Not provided'}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-secondary-500 block mb-1">Department</label>
                  {isEditMode && canEditEmployee() ? (
                    <select
                      value={editedEmployeeData.department || 'Accounting'}
                      onChange={(e) => handleFieldChange('department', e.target.value)}
                      className="w-full px-3 py-2 border border-secondary-200 rounded-lg text-sm"
                    >
                      <option value="">Select Department...</option>
                      <option value="Accounting">Accounting</option>
                      <option value="Operations">Operations</option>
                      <option value="Internal Audit">Internal Audit</option>
                      <option value="Automations">Automations</option>
                      <option value="Statutory Audit">Statutory Audit</option>
                    </select>
                  ) : (
                    <p className="text-sm font-bold text-secondary-900">{editedEmployeeData.department || 'Not provided'}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-secondary-500 block mb-1">Designation</label>
                  {isEditMode && canEditEmployee() ? (
                    <Input
                      value={editedEmployeeData.designation || ''}
                      onChange={(e) => handleFieldChange('designation', e.target.value)}
                      className="w-full"
                    />
                  ) : (
                    <p className="text-sm font-bold text-secondary-900">{editedEmployeeData.designation || 'Not provided'}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-secondary-500 block mb-1">Joining Date</label>
                  {isEditMode && canEditEmployee() ? (
                    <Input
                      type="date"
                      value={editedEmployeeData.profile?.doj ? new Date(editedEmployeeData.profile.doj).toISOString().split('T')[0] : ''}
                      onChange={(e) => handleFieldChange('doj', e.target.value, 'profile')}
                      className="w-full"
                    />
                  ) : (
                    <p className="text-sm font-bold text-secondary-900">
                      {editedEmployeeData.profile?.doj ? new Date(editedEmployeeData.profile.doj).toLocaleDateString() : 'Not provided'}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-secondary-500 block mb-1">Reporting Partner</label>
                  {isEditMode && canEditEmployee() ? (
                    <>
                    <select
                      value={detailsReportingPartner || ''}
                      onChange={(e) => {
                        console.log('🔄 Details Reporting Partner changed to:', e.target.value);
                        setDetailsReportingPartner(e.target.value);
                        // For employees, clear manager when partner changes
                        // For managers, the manager will be set to current partner in useEffect
                        if (editedEmployeeData.role === 'Employee') {
                          handleFieldChange('reportingManager', '');
                        }
                        handleFieldChange('reportingPartner', e.target.value);
                      }}
                      className={`w-full px-3 py-2 border border-secondary-200 rounded-lg text-sm ${editedEmployeeData.role === 'Partner' ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                      disabled={editedEmployeeData.role === 'Partner' || !canEditEmployee()}
                    >
                      <option value="">Select Partner...</option>
                      {partners.length > 0 ? (
                        partners.map(partner => (
                          <option key={partner.id} value={partner.id}>
                            {partner.firstName} {partner.lastName}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>No partners available</option>
                      )}
                    </select>
                    {editedEmployeeData.role === 'Partner' && (
                      <p className="text-[10px] text-gray-500 mt-1">Partners cannot have reporting structure</p>
                    )}
                    </>
                  ) : (
                    <p className="text-sm font-bold text-secondary-900">
                      {editedEmployeeData.reportingPartnerDetails ? 
                        `${editedEmployeeData.reportingPartnerDetails.firstName} ${editedEmployeeData.reportingPartnerDetails.lastName}` : 
                        'Not provided'
                      }
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-secondary-500 block mb-1">Reporting Manager</label>
                  {isEditMode && canEditEmployee() ? (
                    <>
                      {detailsManagersLoading ? (
                        <div className="w-full px-3 py-2 bg-gray-50 border border-secondary-200 rounded-lg text-sm text-gray-500">
                          Loading managers...
                        </div>
                      ) : (
                        <select
                          value={editedEmployeeData.reportingManager || ''}
                          onChange={(e) => {
                            console.log('🔄 Details Reporting Manager changed to:', e.target.value);
                            handleFieldChange('reportingManager', e.target.value);
                          }}
                          className={`w-full px-3 py-2 border border-secondary-200 rounded-lg text-sm ${(editedEmployeeData.role === 'Partner' || editedEmployeeData.role === 'Manager') ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                          disabled={editedEmployeeData.role === 'Partner' || editedEmployeeData.role === 'Manager' || !canEditEmployee()}
                        >
                          <option value="">Select Manager...</option>
                          {editedEmployeeData.role === 'Employee' && detailsManagers.length > 0 ? (
                            detailsManagers.map(manager => (
                              <option key={manager.id} value={manager.id}>
                                {manager.firstName} {manager.lastName}
                              </option>
                            ))
                          ) : editedEmployeeData.role === 'Employee' && detailsManagers.length === 0 && detailsReportingPartner ? (
                            // Show partner as fallback for employees when no managers exist
                            partners.filter(p => p.id === detailsReportingPartner).map(partner => (
                              <option key={partner.id} value={partner.id}>
                                {partner.firstName} {partner.lastName} (Partner)
                              </option>
                            ))
                          ) : editedEmployeeData.role === 'Manager' ? (
                            // For managers, show the partner as their manager
                            partners.filter(p => p.id === detailsReportingPartner).map(partner => (
                              <option key={partner.id} value={partner.id}>
                                {partner.firstName} {partner.lastName} (Partner)
                              </option>
                            ))
                          ) : (
                            <option value="" disabled>No managers available</option>
                          )}
                        </select>
                      )}
                      {(editedEmployeeData.role === 'Partner' || editedEmployeeData.role === 'Manager') && (
                        <p className="text-[10px] text-gray-500 mt-1">
                          {editedEmployeeData.role === 'Partner' ? 'Partners cannot have reporting structure' : 'Managers report to selected Partner'}
                        </p>
                      )}
                      {editedEmployeeData.reportingManager && !detailsManagers.some(m => m.id === editedEmployeeData.reportingManager) && !partners.some(p => p.id === editedEmployeeData.reportingManager) && (
                        <p className="text-xs text-orange-500 mt-1">⚠️ Selected manager not found in list</p>
                      )}
                    </>
                  ) : (
                    <p className="text-sm font-bold text-secondary-900">
                      {editedEmployeeData.reportingManagerDetails ? 
                        `${editedEmployeeData.reportingManagerDetails.firstName} ${editedEmployeeData.reportingManagerDetails.lastName}` : 
                        'Not provided'
                      }
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-secondary-500 block mb-1">Education</label>
                  {isEditMode && canEditEmployee() ? (
                    <Input
                      value={editedEmployeeData.profile?.education || ''}
                      onChange={(e) => handleFieldChange('education', e.target.value, 'profile')}
                      className="w-full"
                    />
                  ) : (
                    <p className="text-sm font-bold text-secondary-900">{editedEmployeeData.profile?.education || 'Not provided'}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-secondary-500 block mb-1">Marital Status</label>
                  {isEditMode && canEditEmployee() ? (
                    <select
                      value={editedEmployeeData.profile?.maritalStatus || 'Single'}
                      onChange={(e) => handleFieldChange('maritalStatus', e.target.value, 'profile')}
                      className="w-full px-3 py-2 border border-secondary-200 rounded-lg text-sm"
                    >
                      <option value="">Select Status</option>
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                      <option value="Divorced">Divorced</option>
                      <option value="Widowed">Widowed</option>
                    </select>
                  ) : (
                    <p className="text-sm font-bold text-secondary-900">{editedEmployeeData.profile?.maritalStatus || 'Not provided'}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Account Information Section */}
            <div className="bg-white border border-secondary-200 rounded-lg p-6">
              <h3 className="text-lg font-bold text-secondary-900 mb-4 flex items-center gap-2">
                <FolderOpenIcon className="w-5 h-5 text-indigo-600" />
                Account Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-secondary-500 block mb-1">Account Status</label>
                  {isEditMode && canEditEmployee() ? (
                    <select
                      value={editedEmployeeData.status || 'active'}
                      onChange={(e) => handleFieldChange('status', e.target.value)}
                      className="w-full px-3 py-2 border border-secondary-200 rounded-lg text-sm"
                    >
                      <option value="">Select Status...</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="pending">Pending</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  ) : (
                    <div className="flex items-center gap-2">
                      <StatusBadge status={editedEmployeeData.status} />
                      <span className="text-sm font-bold text-secondary-900 capitalize">
                        {editedEmployeeData.status || 'Unknown'}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-secondary-500 block mb-1">Registration Status</label>
                  <p className="text-sm font-bold text-secondary-900">
                    {editedEmployeeData.hasActiveRegistrationToken ? 'Pending' : 'Completed'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-secondary-500 block mb-1">Created At</label>
                  <p className="text-sm font-bold text-secondary-900">
                    {new Date(editedEmployeeData.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-secondary-500 block mb-1">Last Login</label>
                  <p className="text-sm font-bold text-secondary-900">Not available</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-secondary-500 block mb-1">Token Expiry</label>
                  <p className="text-sm font-bold text-secondary-900">
                    {editedEmployeeData.registrationTokenExpiry ? 
                      new Date(editedEmployeeData.registrationTokenExpiry).toLocaleDateString() : 
                      'No active token'
                    }
                  </p>
                </div>
                
                {/* Resend Registration Email Button */}
                {canEditEmployee() && editedEmployeeData.hasActiveRegistrationToken && (
                  <div className="col-span-1 md:col-span-2 lg:col-span-3">
                    <Button
                      variant="secondary"
                      onClick={() => handleResendEmailWithConfirmation(editedEmployeeData.id, `${editedEmployeeData.firstName} ${editedEmployeeData.lastName}`)}
                      leftIcon={<PaperAirplaneIcon className="w-4 h-4" />}
                      className="mt-2"
                    >
                      Resend Registration Email
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Banking Information Section */}
            {(editedEmployeeData?.profile || isEditMode) && (
              <div className="bg-white border border-secondary-200 rounded-lg p-6">
                <h3 className="text-lg font-bold text-secondary-900 mb-4 flex items-center gap-2">
                  <DocumentIcon className="w-5 h-5 text-warning-600" />
                  Banking Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-secondary-500 block mb-1">Account Holder Name</label>
                    {isEditMode && canEditEmployee() ? (
                      <Input
                        value={editedEmployeeData?.profile?.accountHolderName || ''}
                        onChange={(e) => handleFieldChange('accountHolderName', e.target.value, 'profile')}
                        className="w-full"
                      />
                    ) : (
                      <p className="text-sm font-bold text-secondary-900">{editedEmployeeData?.profile?.accountHolderName || 'Not provided'}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-secondary-500 block mb-1">Bank Name</label>
                    {isEditMode && canEditEmployee() ? (
                      <Input
                        value={editedEmployeeData?.profile?.bankName || ''}
                        onChange={(e) => handleFieldChange('bankName', e.target.value, 'profile')}
                        className="w-full"
                      />
                    ) : (
                      <p className="text-sm font-bold text-secondary-900">{editedEmployeeData?.profile?.bankName || 'Not provided'}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-secondary-500 block mb-1">Account Number</label>
                    {isEditMode && canEditEmployee() ? (
                      <Input
                        value={editedEmployeeData?.profile?.bankAccountNumber || ''}
                        onChange={(e) => handleFieldChange('bankAccountNumber', e.target.value, 'profile')}
                        className="w-full"
                      />
                    ) : (
                      <p className="text-sm font-bold text-secondary-900">{editedEmployeeData?.profile?.bankAccountNumber || 'Not provided'}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-secondary-500 block mb-1">IFSC Code</label>
                    {isEditMode && canEditEmployee() ? (
                      <Input
                        value={editedEmployeeData?.profile?.ifscCode || ''}
                        onChange={(e) => handleFieldChange('ifscCode', e.target.value, 'profile')}
                        className="w-full"
                      />
                    ) : (
                      <p className="text-sm font-bold text-secondary-900">{editedEmployeeData?.profile?.ifscCode || 'Not provided'}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-secondary-500 block mb-1">Branch Name</label>
                    {isEditMode && canEditEmployee() ? (
                      <Input
                        value={editedEmployeeData?.profile?.branchName || ''}
                        onChange={(e) => handleFieldChange('branchName', e.target.value, 'profile')}
                        className="w-full"
                      />
                    ) : (
                      <p className="text-sm font-bold text-secondary-900">{editedEmployeeData?.profile?.branchName || 'Not provided'}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Emergency Contact Section */}
            {(editedEmployeeData?.profile || isEditMode) && (
              <div className="bg-white border border-secondary-200 rounded-lg p-6">
                <h3 className="text-lg font-bold text-secondary-900 mb-4 flex items-center gap-2">
                  <UsersIcon className="w-5 h-5 text-info-600" />
                  Emergency Contact
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-secondary-500 block mb-1">Contact Name</label>
                    {isEditMode && canEditEmployee() ? (
                      <Input
                        value={editedEmployeeData?.profile?.emergencyContactName || ''}
                        onChange={(e) => handleFieldChange('emergencyContactName', e.target.value, 'profile')}
                        className="w-full"
                      />
                    ) : (
                      <p className="text-sm font-bold text-secondary-900">{editedEmployeeData?.profile?.emergencyContactName || 'Not provided'}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-secondary-500 block mb-1">Contact Phone</label>
                    {isEditMode && canEditEmployee() ? (
                      <Input
                        value={editedEmployeeData?.profile?.emergencyContactPhone || ''}
                        onChange={(e) => handleFieldChange('emergencyContactPhone', e.target.value, 'profile')}
                        className="w-full"
                      />
                    ) : (
                      <p className="text-sm font-bold text-secondary-900">{editedEmployeeData?.profile?.emergencyContactPhone || 'Not provided'}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-secondary-500 block mb-1">Relation</label>
                    {isEditMode && canEditEmployee() ? (
                      <Input
                        value={editedEmployeeData?.profile?.emergencyContactRelation || ''}
                        onChange={(e) => handleFieldChange('emergencyContactRelation', e.target.value, 'profile')}
                        className="w-full"
                      />
                    ) : (
                      <p className="text-sm font-bold text-secondary-900">{editedEmployeeData?.profile?.emergencyContactRelation || 'Not provided'}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Identity Documents Section */}
            {(editedEmployeeData?.profile || isEditMode) && (
              <div className="bg-white border border-secondary-200 rounded-lg p-6">
                <h3 className="text-lg font-bold text-secondary-900 mb-4 flex items-center gap-2">
                  <DocumentIcon className="w-5 h-5 text-indigo-600" />
                  Identity Documents
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-secondary-500 block mb-1">PAN Number</label>
                    {isEditMode && canEditEmployee() ? (
                      <Input
                        value={editedEmployeeData?.profile?.pan || ''}
                        onChange={(e) => handleFieldChange('pan', e.target.value, 'profile')}
                        className="w-full"
                      />
                    ) : (
                      <p className="text-sm font-bold text-secondary-900">{editedEmployeeData?.profile?.pan || 'Not provided'}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-secondary-500 block mb-1">Aadhaar Number</label>
                    {isEditMode && canEditEmployee() ? (
                      <Input
                        value={editedEmployeeData?.profile?.aadhaar || ''}
                        onChange={(e) => handleFieldChange('aadhaar', e.target.value, 'profile')}
                        className="w-full"
                      />
                    ) : (
                      <p className="text-sm font-bold text-secondary-900">{editedEmployeeData?.profile?.aadhaar || 'Not provided'}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Close Button for Non-Edit Mode */}
            {!isEditMode && (
              <div className="flex justify-end pt-4 border-t border-secondary-200">
                <Button variant="secondary" onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedEmployee(null);
                  setEnhancedEmployeeDetails(null);
                  setEditedEmployeeData(null);
                  setIsEditMode(false);
                }}>
                  Close
                </Button>
              </div>
            )}
          </div>
        ) :null}
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
                  <p className="text-sm font-bold text-secondary-900">{enhancedEmployeeDetails?.firstName || 'Not provided'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-secondary-500">Last Name:</span>
                  <p className="text-sm font-bold text-secondary-900">{enhancedEmployeeDetails?.lastName || 'Not provided'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-secondary-500">Email:</span>
                  <p className="text-sm font-bold text-secondary-900">{enhancedEmployeeDetails?.officeEmail || 'Not provided'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-secondary-500">Phone:</span>
                  <p className="text-sm font-bold text-secondary-900">{enhancedEmployeeDetails?.profile?.personalMobile || 'Not provided'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-secondary-500">Date of Birth:</span>
                  <p className="text-sm font-bold text-secondary-900">
                    {enhancedEmployeeDetails?.profile?.dob 
                      ? new Date(enhancedEmployeeDetails.profile.dob).toLocaleDateString()
                      : 'Not provided'
                    }
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-secondary-500">Gender:</span>
                  <p className="text-sm font-bold text-secondary-900">{enhancedEmployeeDetails?.profile?.gender || 'Not provided'}</p>
                </div>
                <div className="col-span-3">
                  <span className="text-sm font-medium text-secondary-500">Address:</span>
                  <p className="text-sm font-bold text-secondary-900">{enhancedEmployeeDetails?.profile?.permanentAddress || 'Not provided'}</p>
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
                  <p className="text-sm font-bold text-secondary-900">{enhancedEmployeeDetails?.profile?.guardianName || 'Not provided'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-secondary-500">Guardian Phone:</span>
                  <p className="text-sm font-bold text-secondary-900">{enhancedEmployeeDetails?.profile?.guardianNumber || 'Not provided'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-secondary-500">Guardian Relation:</span>
                  <p className="text-sm font-bold text-secondary-900">{enhancedEmployeeDetails?.profile?.emergencyContactRelation || 'Not provided'}</p>
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
                  <p className="text-sm font-bold text-secondary-900">{enhancedEmployeeDetails?.profile?.education || 'Not provided'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-secondary-500">University:</span>
                  <p className="text-sm font-bold text-secondary-900">{enhancedEmployeeDetails?.profile?.education || 'Not provided'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-secondary-500">Passing Year:</span>
                  <p className="text-sm font-bold text-secondary-900">{enhancedEmployeeDetails?.profile?.education || 'Not provided'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-secondary-500">Grade:</span>
                  <p className="text-sm font-bold text-secondary-900">{enhancedEmployeeDetails?.profile?.education || 'Not provided'}</p>
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
                  <p className="text-sm font-bold text-secondary-900">{enhancedEmployeeDetails?.profile?.bankName || 'Not provided'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-secondary-500">Account Number:</span>
                  <p className="text-sm font-bold text-secondary-900">{enhancedEmployeeDetails?.profile?.bankAccountNumber || 'Not provided'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-secondary-500">IFSC Code:</span>
                  <p className="text-sm font-bold text-secondary-900">{enhancedEmployeeDetails?.profile?.ifscCode || 'Not provided'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-secondary-500">Branch Name:</span>
                  <p className="text-sm font-bold text-secondary-900">{enhancedEmployeeDetails?.profile?.branchName || 'Not provided'}</p>
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
                  <p className="text-sm font-bold text-secondary-900">{enhancedEmployeeDetails?.profile?.pan || 'Not provided'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-secondary-500">Aadhaar Number:</span>
                  <p className="text-sm font-bold text-secondary-900">{enhancedEmployeeDetails?.profile?.aadhaar || 'Not provided'}</p>
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
                    {enhancedEmployeeDetails?.profile?.panFileUrl && (
                      <>
                        <button
                          onClick={() => handleViewAttachment(enhancedEmployeeDetails.profile!.panFileUrl!, 'PAN Card')}
                          className="text-primary-600 hover:text-primary-700 text-sm font-medium underline"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDownloadAttachment((enhancedEmployeeDetails.profile?.panFileUrl || '').split('/').pop() || 'pan-card.pdf')}
                          className="text-success-600 hover:text-success-700 text-sm font-medium underline"
                        >
                          Download
                        </button>
                      </>
                    )}
                    {!enhancedEmployeeDetails?.profile?.panFileUrl && (
                      <p className="text-sm text-secondary-400">Not uploaded</p>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-sm font-medium text-secondary-500">Aadhaar Card:</span>
                  <div className="mt-2 flex gap-2">
                    {enhancedEmployeeDetails?.profile?.aadhaarFileUrl && (
                      <>
                        <button
                          onClick={() => handleViewAttachment(enhancedEmployeeDetails.profile!.aadhaarFileUrl!, 'Aadhaar Card')}
                          className="text-primary-600 hover:text-primary-700 text-sm font-medium underline"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDownloadAttachment((enhancedEmployeeDetails.profile?.aadhaarFileUrl || '').split('/').pop() || 'aadhaar-card.pdf')}
                          className="text-success-600 hover:text-success-700 text-sm font-medium underline"
                        >
                          Download
                        </button>
                      </>
                    )}
                    {!enhancedEmployeeDetails?.profile?.aadhaarFileUrl && (
                      <p className="text-sm text-secondary-400">Not uploaded</p>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-sm font-medium text-secondary-500">Education Certificate:</span>
                  <div className="mt-2 flex gap-2">
                    <p className="text-sm text-secondary-400">Not uploaded</p>
                  </div>
                </div>
                <div>
                  <span className="text-sm font-medium text-secondary-500">Profile Photo:</span>
                  <div className="mt-2 flex gap-2">
                    <p className="text-sm text-secondary-400">Not uploaded</p>
                  </div>
                </div>
                <div>
                  <span className="text-sm font-medium text-secondary-500">Other Documents:</span>
                  <div className="mt-2 flex gap-2">
                    <p className="text-sm text-secondary-400">Not uploaded</p>
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

      {/* Documents Modal */}
      <Modal
        isOpen={showDocumentsModal}
        onClose={() => {
          setShowDocumentsModal(false);
          setEmployeeDocuments([]);
          setSelectedEmployee(null);
        }}
        title="Employee Documents"
        size="lg"
      >
        <div className="space-y-4">
          {selectedEmployee && (
            <div className="mb-4">
              <p className="text-sm text-secondary-600">
                Documents for <strong>{`${selectedEmployee.firstName || ''} ${selectedEmployee.lastName || ''}`.trim() || 'Unknown'}</strong> ({selectedEmployee.employeeId})
              </p>
            </div>
          )}
          
          {canEditEmployee() && (
            <div className="flex justify-end mb-4">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowUploadDocumentModal(true)}
                leftIcon={<CloudArrowUpIcon className="w-4 h-4" />}
              >
                Upload Document
              </Button>
            </div>
          )}
          
          {employeeDocuments.length === 0 ? (
            <div className="text-center py-8 text-secondary-500">
              <FolderOpenIcon className="w-12 h-12 mx-auto mb-4 text-secondary-300" />
              <p>No documents uploaded</p>
            </div>
          ) : (
            <div className="space-y-3">
              {employeeDocuments.map((doc) => (
                <div key={doc.id} className="border border-secondary-200 rounded-lg p-4 hover:bg-secondary-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                          {doc.category}
                        </span>
                      </div>
                      <h4 className="font-medium text-secondary-900">{doc.title}</h4>
                      <p className="text-sm text-secondary-500">{doc.fileName}</p>
                      <p className="text-xs text-secondary-400">
                        Uploaded on {new Date(doc.uploadedAt).toLocaleDateString()} • 
                        {(doc.fileSize / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDownloadDocument(doc.id, doc.fileName)}
                        leftIcon={<ArrowDownTrayIcon className="w-4 h-4" />}
                      >
                        Download
                      </Button>
                      {canEditEmployee() && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteDocument(doc.id)}
                          leftIcon={<TrashIcon className="w-4 h-4" />}
                          className="text-danger-600 hover:text-danger-700"
                        >
                          Delete
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="pt-4 flex justify-end">
            <Button variant="secondary" onClick={() => {
              setShowDocumentsModal(false);
              setEmployeeDocuments([]);
              setSelectedEmployee(null);
            }}>
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* Upload Document Modal */}
      <Modal
        isOpen={showUploadDocumentModal}
        onClose={() => {
          setShowUploadDocumentModal(false);
          setDocumentTitle('');
          setSelectedFile(null);
          setDocumentCategory('Other');
        }}
        title="Upload Document"
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Document Title"
            placeholder="e.g. Employment Contract"
            value={documentTitle}
            onChange={(e) => setDocumentTitle(e.target.value)}
            required
          />
          
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-secondary-700 block ml-0.5">Document Category</label>
            <select
              className="w-full px-4 py-2.5 bg-white border border-secondary-200 rounded-lg outline-none transition-all duration-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 hover:border-secondary-300 text-sm font-medium"
              value={documentCategory}
              onChange={(e) => setDocumentCategory(e.target.value)}
              required
            >
              {documentCategories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-secondary-700">Select File</label>
            <input
              type="file"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="w-full px-4 py-2.5 bg-white border border-secondary-200 rounded-lg outline-none transition-all duration-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 hover:border-secondary-300 text-sm"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt,.xls,.xlsx"
              required
            />
            <p className="text-xs text-secondary-500">
              Supported formats: PDF, DOC, DOCX, JPG, PNG, TXT, XLS, XLSX (Max 10MB)
            </p>
          </div>
          
          <div className="pt-4 flex gap-3">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => {
                setShowUploadDocumentModal(false);
                setDocumentTitle('');
                setSelectedFile(null);
                setDocumentCategory('Other');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              fullWidth
              onClick={handleUploadDocument}
              disabled={!documentTitle || !selectedFile || !documentCategory || uploadingDocument}
            >
              {uploadingDocument ? 'Uploading...' : 'Upload Document'}
            </Button>
          </div>
        </div>
      </Modal>

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
            {confirmAction?.type === 'resend-email' && (
              <>Do you want to resend the registration email to <strong>{confirmAction.employeeName}</strong>?</>
            )}
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
              variant="primary" 
              onClick={handleConfirmAction}
            >
              Send Email
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Employees;
