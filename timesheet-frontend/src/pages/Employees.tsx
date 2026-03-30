import React, { useState, useEffect, useRef } from 'react';
import { APP_CONFIG } from '../config/appConfig';
import API from '../api';
import { useToast } from '../contexts/ToastContext';
import { getSuccessMessage, getErrorMessage } from '../utils/messageUtils';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
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
  CloudArrowUpIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  MapPinIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  BriefcaseIcon,
  BuildingOfficeIcon,
  AcademicCapIcon,
  IdentificationIcon,
  PhotoIcon
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
import StatusToggle from '../components/ui/StatusToggle';
import { TableSkeleton, Skeleton } from '../components/ui/Skeleton';

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
  officeEmail?: string;
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
    doj?: string;
    education?: string;
    maritalStatus?: string;
    gender?: string;
    permanentAddress?: string;
    currentAddress?: string;
    currentPinCode?: string;
    pan?: string;
    aadhaar?: string;
    personalEmail?: string;
    personalMobile?: string;
    guardianNumber?: string;
    guardianAddress?: string;
    guardianName?: string;
    accountHolderName?: string;
    bankAccountNumber?: string;
    bankName?: string;
    branchName?: string;
    ifscCode?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    emergencyContactRelation?: string;
    salary?: number;
    seniorityLevel?: string;
    experience?: string;
    employmentType?: string;
    skills?: string[];
    joining_date?: string;
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
  const toast = useToast();
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
  
  // New state for selected employee in right panel
  const [rightPanelEmployee, setRightPanelEmployee] = useState<Employee | null>(null);
  
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
  const [managers, setManagers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [partnersLoading, setPartnersLoading] = useState(true);
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
  const [originalReportingManager, setOriginalReportingManager] = useState<string>('');

  // Filtered partners (for Add/Edit Modal)
  const filteredPartners = partners;

  // Filtered managers based on selected partner (for Add/Edit Modal)
  const filteredManagers = managers.filter(
    (m) => m.reportingPartner === reportingPartner
  );

  // Derived state for details modal filtering
  const detailsFilteredPartners = partners;

  const detailsFilteredManagers = managers.filter(
    (m) => m.reportingPartner === detailsReportingPartner
  );

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
      
      const names = `${editingEmployee?.firstName || ''} ${editingEmployee?.lastName || ''}`.trim().split(' ');
      setFirstName(names[0] || '');
      setLastName(names.slice(1).join(' ') || '');
      setEmail(editingEmployee.officeEmail || editingEmployee.email || ''); 
      setRole(editingEmployee.role);
      setDesignation(editingEmployee.designation);
      setDepartment(editingEmployee.department || 'Accounting');
      
      const reportingPartnerId = editingEmployee.reportingPartner || '';
      const reportingManagerId = editingEmployee.reportingManager || '';
      
      setReportingPartner(reportingPartnerId);
      if (reportingManagerId) {
        setOriginalReportingManager(reportingManagerId);
        setReportingManager(reportingManagerId);
      }
      
      setEmployeeCode(editingEmployee.employeeId || '');
    }
  }, [editingEmployee, partners, partnersLoading]);

  // Fetch all users once for reporting structure
  const fetchPartners = async () => {
    try {
      setUsersLoading(true);
      setPartnersLoading(true);
      console.log('🔍 Fetching all users for reporting structure...');
      const response = await API.get('/employees');
      
      let allUsers = [];
      if (response.data?.success && Array.isArray(response.data.data)) {
        allUsers = response.data.data;
      } else if (Array.isArray(response.data)) {
        allUsers = response.data;
      }

      setPartners(allUsers.filter((u: any) => u.role === 'Partner'));
      setManagers(allUsers.filter((u: any) => u.role === 'Manager'));
      console.log('✅ Partners and managers loaded');
    } catch (err) {
      console.error('❌ Error fetching users:', err);
    } finally {
      setUsersLoading(false);
      setPartnersLoading(false);
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

  // No longer needed: Managers are derived from global managers list

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
    }
  }, [enhancedEmployeeDetails, isEditMode]);

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
      const response = await API.get('/employees/pending-approvals');
      if (response.data?.data && Array.isArray(response.data.data)) {
        setPendingApprovals(response.data.data);
      } else {
        setPendingApprovals([]);
      }
    } catch (error) {
      console.error('Error fetching pending approvals:', error);
      setPendingApprovals([]);
    }
  };

  const [approvingEmployee, setApprovingEmployee] = useState<string | null>(null);
  const [rejectingEmployee, setRejectingEmployee] = useState<string | null>(null);

  const handleApproveEmployee = async (employeeId: string) => {
    console.log('Approve employee clicked:', employeeId);
    setApprovingEmployee(employeeId);
    try {
      await API.post(`/employees/approve-employee/${employeeId}`);
      
      // Remove from pending approvals instantly
      setPendingApprovals(prev => prev.filter(emp => emp.id !== employeeId));
      
      // Show success toast
      toast.success('Employee approved successfully');
      
      // Refresh employees list
      fetchEmployees();
    } catch (err) {
      console.error('Failed to approve employee:', err);
      toast.error('Failed to approve employee');
    } finally {
      setApprovingEmployee(null);
    }
  };

  const handleRejectEmployee = async (employeeId: string) => {
    console.log('Reject employee clicked:', employeeId);
    if (window.confirm('Are you sure you want to reject this employee? This action cannot be undone.')) {
      setRejectingEmployee(employeeId);
      try {
        await API.post(`/employees/reject-employee/${employeeId}`, { reason: 'Rejected by administrator' });
        
        // Remove from pending approvals instantly
        setPendingApprovals(prev => prev.filter(emp => emp.id !== employeeId));
        
        // Show success toast
        toast.success('Employee rejected successfully');
        
        // Refresh employees list
        fetchEmployees();
      } catch (err) {
        console.error('Failed to reject employee:', err);
        toast.error('Failed to reject employee');
      } finally {
        setRejectingEmployee(null);
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
      toast.error('Please fill all mandatory fields.');
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
          toast.success(`✅ ${message}`);
        } else if (emailStatus === 'skipped') {
          toast.warning(`⚠️ ${message}\n\nPlease configure email settings to send registration emails.`);
        } else if (emailStatus === 'failed') {
          toast.warning(`⚠️ ${message}\n\nPlease check email configuration and try again.`);
        } else {
          toast.success(`✅ Employee created successfully!`);
        }
      } else {
        toast.warning('Employee created but there might be an issue with email sending.');
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
      toast.error(`❌ ${errorMessage}`);
    }
  };

  const handleUpdateEmployee = async () => {
    if (!editingEmployee) return;

    // Validation
    if (!firstName || !lastName || !email || !designation || !role || !department) {
      toast.error('Please fill all mandatory fields.');
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
      toast.error('Failed to update employee');
    }
  };

  const handleDeleteEmployee = async (id: string, employeeName: string) => {
    console.log('Delete employee clicked:', id, employeeName);
    if (window.confirm(`Are you sure you want to delete ${employeeName}? This action cannot be undone and will remove all associated data including timelogs, projects, and reimbursements.`)) {
      try {
        await API.delete(`/employees/${id}`);
        refreshAfterAction();
        toast.success('Employee deleted successfully');
      } catch (err: any) {
        console.error('Error deleting employee:', err);
        const errorMessage = err.response?.data?.error || err.message || 'Failed to delete employee. Please try again.';
        toast.error(`Delete failed: ${errorMessage}`);
      }
    }
  };

  const toggleEmployeeStatus = async (employeeId: string) => {
    try {
      const response = await API.patch(`/employees/${employeeId}/toggle-status`);
      if (response.data.success) {
        toast.success(response.data.message || 'Employee status updated successfully');
        fetchEmployees();
      }
    } catch (err: any) {
      console.error('Failed to toggle employee status:', err);
      const errorMsg = err.response?.data?.error || err.message || 'Error updating employee status.';
      toast.error(errorMsg);
    }
  };

  const handleViewDetails = (employee: Employee) => {
    console.log("Opening employee details modal for:", employee);
    setSelectedEmployee(employee);
    setEditedEmployeeData(employee);
    setShowDetailsModal(true);
    // Also set right panel employee
    setRightPanelEmployee(employee);
    // Fetch full employee details to ensure complete data is available
    if (employee.id) {
      fetchFullEmployeeDetails(employee.id);
    }
  };

  const handleSelectEmployee = (employee: Employee) => {
    setRightPanelEmployee(employee);
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
      toast.error('Failed to fetch employee details');
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
      toast.error('No employee data available to save');
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
        toast.success('✅ Employee details updated successfully');
        // Re-fetch the entire record to get updated names and details
        if (editedEmployeeData.id) {
          fetchFullEmployeeDetails(editedEmployeeData.id);
        }
        setIsEditMode(false);
        refreshAfterAction();
      } else {
        toast.error('❌ Failed to update employee details');
      }
    } catch (error) {
      console.error('❌ Error updating employee:', error);
      toast.error('❌ Failed to update employee details');
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
      toast.error('Failed to fetch documents');
    }
  };

  const handleUploadDocument = async () => {
    if (!selectedEmployee || !documentTitle || !selectedFile || !documentCategory) {
      toast.error('Please fill all fields and select a category');
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
        toast.success('Document uploaded successfully');
        setShowUploadDocumentModal(false);
        setDocumentTitle('');
        setSelectedFile(null);
        setDocumentCategory('Other');
        // Refresh documents list
        handleViewDocuments(selectedEmployee);
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Failed to upload document');
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
      toast.error('Failed to download document');
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      const response = await API.delete(`/employees/documents/${documentId}`);
      if (response.data.success) {
        toast.success('Document deleted successfully');
        // Refresh documents list
        if (selectedEmployee) {
          handleViewDocuments(selectedEmployee);
        }
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete document');
    }
  };

  const handleDownloadAllAttachments = (employee: Employee) => {
    if (!employee.attachments) {
      toast.error('No attachments available for this employee');
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
      toast.error('No attachments available for this employee');
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
          toast.success('✅ Registration email sent successfully.');
          refreshAfterAction(); // Refresh to update token status
        } else {
          toast.error('❌ Failed to send registration email');
        }
      } catch (err: any) {
        console.error('Error resending registration email:', err);
        const errorMessage = err.response?.data?.error || err.message || 'Failed to resend registration email';
        toast.error(`❌ ${errorMessage}`);
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
          toast.success('✅ Registration email sent successfully.');
          refreshAfterAction(); // Refresh to update token status
        } else {
          toast.error('❌ Failed to send registration email');
        }
      } catch (err: any) {
        console.error('Error resending registration email:', err);
        const errorMessage = err.response?.data?.error || err.message || 'Failed to resend registration email';
        toast.error(`❌ ${errorMessage}`);
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
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      window.open(`${API_BASE_URL}${attachmentUrl}`, '_blank');
    } else {
      toast.error('No attachment available');
    }
  };

  const handleViewFullProfile = async (employeeId: string) => {
    try {
      const response = await API.get(`/employees/${employeeId}`);
      if (response.data.success) {
        setEnhancedEmployeeDetails(response.data.data);
        setShowProfileModal(true);
      } else {
        toast.error('Failed to fetch employee details');
      }
    } catch (err: any) {
      console.error('Error fetching employee details:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch employee details';
      toast.error(`❌ ${errorMessage}`);
    }
  };

  const handleDownloadAttachment = async (filename: string) => {
    try {
      // Create download URL
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      const downloadUrl = `${API_BASE_URL}/employees/download/${filename}`;
      
      // Create temporary link and trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Attachment downloaded successfully');
    } catch (error: any) {
      console.error('Error downloading attachment:', error);
      toast.error('Failed to download attachment');
    }
  };

  const handleProfilePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPEG, JPG and PNG files are allowed');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('profilePhoto', file);

      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      const response = await fetch(`${API_BASE_URL}/employees/profile-photo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (response.ok) {
        const result = await response.json();
        toast.success('Profile photo uploaded successfully');
        
        // Refresh the employee details to show the new photo
        if (enhancedEmployeeDetails) {
          await handleViewFullProfile(enhancedEmployeeDetails.id);
        }
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to upload profile photo');
      }
    } catch (error: any) {
      console.error('Error uploading profile photo:', error);
      toast.error('Failed to upload profile photo');
    }

    // Reset the file input
    event.target.value = '';
  };

  const handleDownloadExcel = async () => {
    try {
      // Show info toast for loading
      toast.info('Generating Employee Register...');
      
      // Call backend Employee Register export endpoint
                      const response = await API.get('/employees/export-employees', {
        responseType: 'blob'
      });
      
      // Create blob from response
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      
      // Create download URL
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Employee_Register.xlsx');
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      // Show success message
      toast.success('Employee Register downloaded successfully!');
      
    } catch (error: any) {
      console.error('Error downloading Employee Register:', error);
      
      // Handle specific error cases
      if (error.response?.status === 403) {
        toast.error('❌ Access denied: You don\'t have permission to download employee data. Only Admin, Partner, Owner, and Manager roles can export employees.');
        return;
      }
      
      // If backend fails (404, 500, etc.), use frontend fallback
      if (error.response?.status === 404 || error.response?.status === 500 || error.code === 'NETWORK_ERROR') {
        toast.info('Backend export unavailable, using frontend fallback...');
        handleFrontendExcelExport();
        return;
      }
      
      const errorMessage = error.response?.data?.message || error.message || 'Failed to download Employee Register';
      toast.error(`❌ ${errorMessage}`);
    }
  };

  // Frontend fallback Excel export - Employee Register Format
  const handleFrontendExcelExport = () => {
    try {
      // Helper function to calculate age
      const calculateAge = (dob: string) => {
        if (!dob) return '';
        const today = new Date();
        const birthDate = new Date(dob);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        return age;
      };

      const formattedData = employees.map(emp => ({
        // 👤 BASIC DETAILS
        "Employee ID": emp.employeeId || '',
        "Full Name": `${emp.firstName || ''} ${emp.lastName || ''}`.trim(),
        "First Name": emp.firstName || '',
        "Last Name": emp.lastName || '',
        "Office Email": emp.officeEmail || '',
        "Personal Email": emp.profile?.personalEmail || '',
        "Phone": '', // Phone field not in schema
        "Personal Mobile": emp.profile?.personalMobile || '',

        // 💼 PROFESSIONAL DETAILS
        "Role": emp.role || '',
        "Department": emp.department || '',
        "Designation": emp.designation || '',
        "Status": emp.status || '',
        "Date of Joining": emp.profile?.doj ? new Date(emp.profile.doj).toLocaleDateString() : '',
        "Employment Type": emp.profile?.employmentType || '',
        "Work Location": '', // Work location field not in schema

        // 👥 REPORTING
        "Reporting Manager Name": emp.reportingManager || '',
        "Reporting Partner Name": emp.reportingPartner || '',

        // 📅 PERSONAL DETAILS
        "DOB": emp.profile?.dob ? new Date(emp.profile.dob).toLocaleDateString() : '',
        "Age": emp.profile?.dob ? calculateAge(emp.profile.dob) : '',
        "Gender": emp.profile?.gender || '',
        "Marital Status": emp.profile?.maritalStatus || '',
        "Education": emp.profile?.education || '',

        // 🏠 ADDRESS
        "Permanent Address": emp.profile?.permanentAddress || '',
        "Current Address": emp.profile?.currentAddress || '',
        "Pin Code": emp.profile?.currentPinCode || '',

        // 🆔 DOCUMENTS
        "PAN": emp.profile?.pan || '',
        "Aadhaar": emp.profile?.aadhaar || '',

        // 👨‍👩‍👧 GUARDIAN
        "Guardian Name": emp.profile?.guardianName || '',
        "Guardian Phone": emp.profile?.guardianNumber || '',
        "Guardian Address": emp.profile?.guardianAddress || '',

        // 🏦 BANK DETAILS
        "Account Holder Name": emp.profile?.accountHolderName || '',
        "Bank Name": emp.profile?.bankName || '',
        "Account Number": emp.profile?.bankAccountNumber || '',
        "IFSC Code": emp.profile?.ifscCode || '',
        "Branch Name": emp.profile?.branchName || '',

        // 🚨 EMERGENCY
        "Emergency Contact Name": emp.profile?.emergencyContactName || '',
        "Emergency Contact Phone": emp.profile?.emergencyContactPhone || '',
        "Emergency Relation": emp.profile?.emergencyContactRelation || '',

        // 📸 PROFILE
        "Skills": emp.profile?.skills ? (Array.isArray(emp.profile.skills) ? emp.profile.skills.join(', ') : emp.profile.skills) : '',
        "Experience": emp.profile?.experience || '',
        "Salary": emp.profile?.salary || '',
        "Seniority Level": emp.profile?.seniorityLevel || '',

        // ⚙️ SYSTEM
        "Created At": emp.createdAt ? new Date(emp.createdAt).toLocaleDateString() : '',
        "Updated At": '', // updatedAt field not in schema
      }));

      const worksheet = XLSX.utils.json_to_sheet(formattedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Employee Register");

      // Auto-size columns with minimum width
      const colWidths = Object.keys(formattedData[0] || {}).map(key => ({
        wch: Math.max(key.length, 20)
      }));
      worksheet['!cols'] = colWidths;

      // Freeze header row
      worksheet['!freeze'] = { xSplit: 0, ySplit: 1 };

      XLSX.writeFile(workbook, "Employee_Register_Frontend.xlsx");
      toast.success('Employee Register generated successfully (frontend fallback)!');
      
    } catch (error: any) {
      console.error('Frontend Employee Register export error:', error);
      toast.error('Failed to generate Employee Register');
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

  if (loading && employees.length === 0) {
    return (
      <div className="flex flex-col space-y-4 animate-fade-in min-h-screen">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 flex-none">
          <div className="space-y-2">
            <Skeleton variant="rectangular" height={32} width={200} />
            <Skeleton variant="rectangular" height={16} width={150} />
          </div>
          <Skeleton variant="rectangular" height={40} width={120} />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-none">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-4 bg-white border border-secondary-200 rounded-xl">
              <div className="flex items-center gap-4">
                <Skeleton variant="circular" width={40} height={40} />
                <div className="flex-1">
                  <Skeleton variant="text" width="40%" />
                  <Skeleton variant="text" width="60%" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <TableSkeleton rows={8} columns={5} />
      </div>
    );
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
    <div className="flex flex-col h-screen bg-gray-50 animate-fade-in">
      {/* Top Header Section */}
      <div className="flex-none px-6 py-4 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Employee Database</h1>
            <p className="text-sm text-gray-500 font-medium mt-1">Manage your team members</p>
          </div>

          <div className="flex items-center gap-3">
            {pendingApprovals.length > 0 && (
              <Button
                variant="secondary"
                size="sm"
                className="h-10 border-amber-200 text-amber-700 hover:bg-amber-50 bg-white"
                onClick={() => setShowPendingApprovals(!showPendingApprovals)}
                leftIcon={<PlusIcon className="w-4 h-4" />}
              >
                {showPendingApprovals ? 'Hide' : 'Show'} Pending ({pendingApprovals.length})
              </Button>
            )}
            <Button
              variant="secondary"
              size="sm"
              className="h-10 border-green-200 text-green-700 hover:bg-green-50 bg-white"
              onClick={handleDownloadExcel}
              leftIcon={<ArrowDownTrayIcon className="w-4 h-4" />}
            >
              Employee Register
            </Button>
            {canEditEmployee() && (
              <Button
                variant="primary"
                size="sm"
                className="h-10 px-6 font-medium bg-blue-600 hover:bg-blue-700 border-blue-600"
                onClick={() => setShowAddModal(true)}
                leftIcon={<PlusIcon className="w-4 h-4" />}
              >
                Add Employee
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* KPI Cards Section */}
      <div className="flex-none px-6 py-4 bg-gray-50">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {kpis.map((kpi, i) => (
            <div key={i} className="bg-white rounded-xl px-5 py-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl ${kpi.bg} ${kpi.color} flex items-center justify-center`}>
                  <kpi.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{kpi.label}</p>
                  <p className="text-2xl font-bold text-gray-900 leading-none mt-1">{kpi.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area - Split Layout */}
      <div className="main-layout flex-col lg:flex-row">
        <style>{`
          .main-layout {
            display: flex;
            width: 100%;
            overflow-x: hidden;
            gap: 16px;
            min-height: 0;
            flex: 1;
          }
          .left-section {
            width: 65%;
            box-sizing: border-box;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.05);
            flex-shrink: 0;
            display: flex;
            flex-direction: column;
            background-color: white;
            overflow: hidden;
            border: 1px solid #f3f4f6;
          }
          .right-section {
            width: 35%;
            min-width: 320px;
            max-width: 420px;
            box-sizing: border-box;
            position: relative;
            flex-shrink: 0;
            display: flex;
            flex-direction: column;
          }
          .right-panel-card {
            flex: 1;
            background-color: white;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.05);
            border: 1px solid #f3f4f6;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            height: calc(100vh - 280px);
            overflow-y: auto;
          }
          .profile-header-container {
            width: 100%;
            border-radius: 12px 12px 0 0;
            position: relative;
            background: linear-gradient(to bottom right, #3b82f6, #4f46e5);
            overflow: hidden;
          }
          .profile-header-content {
            display: flex;
            flex-direction: column;
            items-align: center;
            padding: 32px 24px;
            text-align: center;
          }
          .profile-details-scroll {
            padding: 20px;
            height: calc(100% - 280px);
            overflow-y: auto;
          }
          .detail-section-margin {
            margin-bottom: 16px;
          }
          .detail-header-margin {
            margin-bottom: 12px;
          }
          @media (max-width: 1024px) {
            .main-layout {
              flex-direction: column;
            }
            .left-section {
              width: 100% !important;
            }
            .right-section {
              width: 100% !important;
              max-width: none !important;
              min-width: auto !important;
            }
          }
        `}</style>
        {/* Left Section - Employee Table (65%) */}
        <div className="left-section">
          {/* Search and Filter Bar */}
          <div className="flex-none px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative group">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Search employees..."
                  aria-label="Search employees"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                />
              </div>

              <div className="relative group">
                <FunnelIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <select
                  aria-label="Filter by role"
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="pl-10 pr-8 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none appearance-none font-medium text-gray-700 cursor-pointer hover:border-gray-300"
                >
                  <option>All Roles</option>
                  <option>Admin</option>
                  <option>Manager</option>
                  <option>User</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table Area */}
          <div className="flex-1 overflow-hidden flex flex-col">
            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : error ? (
              <div className="flex-1 flex items-center justify-center text-red-600">
                <div className="text-center">
                  <div className="text-lg font-medium mb-2">Error loading employees</div>
                  <div className="text-sm">{error}</div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Modern Table */}
                <div className="flex-1 overflow-x-auto">
                  <table className="w-full min-w-full">
                    <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Employee</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Department</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {filteredEmployees.map((employee, index) => (
                        <tr
                          key={employee.id}
                          className={`hover:bg-blue-50 cursor-pointer transition-colors ${
                            rightPanelEmployee?.id === employee.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                          } ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}
                          onClick={() => handleSelectEmployee(employee)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center min-w-0">
                              <Avatar
                                name={`${employee.firstName || ''} ${employee.lastName || ''}`}
                                size="sm"
                                className="flex-shrink-0"
                              />
                              <div className="ml-4 min-w-0 flex-1">
                                <div className="text-sm font-medium text-gray-900 truncate">
                                  {employee.firstName && employee.lastName ? `${employee.firstName} ${employee.lastName}` :
                                   employee.firstName || employee.lastName || employee.name || 'No name'}
                                </div>
                                <div className="text-sm text-gray-500 truncate">{employee.email}</div>
                                <div className="text-xs text-gray-400 mt-1">ID: {employee.employeeId}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {employee.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            <div className="truncate">{employee.designation}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {(() => {
                              const statusConfig: Record<string, { variant: 'success' | 'danger' | 'warning' | 'secondary'; label: string }> = {
                                'Active': { variant: 'success', label: 'Active' },
                                'active': { variant: 'success', label: 'Active' },
                                'Inactive': { variant: 'danger', label: 'Inactive' },
                                'On Leave': { variant: 'warning', label: 'On Leave' },
                                'pending': { variant: 'warning', label: 'Pending' },
                                'rejected': { variant: 'danger', label: 'Rejected' }
                              };
                              const config = statusConfig[employee.status] || { variant: 'secondary', label: employee.status };
                              return <StatusBadge status={config.variant} text={config.label} />;
                            })()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleViewEmployee(employee)}
                                className="text-gray-400 hover:text-blue-600"
                              >
                                <EyeIcon className="w-4 h-4" />
                              </Button>
                              {canEditEmployee() && (
                                <>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => handleEditEmployee(employee)}
                                    className="text-gray-400 hover:text-blue-600"
                                  >
                                    <PencilSquareIcon className="w-4 h-4" />
                                  </Button>
                                  <StatusToggle
                                    id={employee.id}
                                    status={employee.status}
                                    onUpdate={fetchEmployees}
                                    type="employee"
                                  />
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => handleViewDocuments(employee)}
                                    className="text-gray-400 hover:text-purple-600"
                                  >
                                    <FolderOpenIcon className="w-4 h-4" />
                                  </Button>
                                </>
                              )}
                              {isAdmin() && (
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => handleDeleteEmployee(employee.id, `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || 'Unknown')}
                                  className="text-gray-400 hover:text-red-600"
                                >
                                  <TrashIcon className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {filteredEmployees.length === 0 && (
                  <div className="flex-1 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <UsersIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium">No employees found</p>
                      <p className="text-sm mt-2">Try adjusting your search or filters</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Table Footer */}
          <div className="flex-none px-6 py-3 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <p className="text-xs font-medium text-gray-500">
              Showing {filteredEmployees.length} of {employees.length} employees
            </p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span className="text-xs font-medium text-gray-500">Live data</span>
            </div>
          </div>
        </div>

        {/* Right Section - Employee Details Panel (35%) */}
        <div className="right-section">
          {rightPanelEmployee ? (
            <div className="right-panel-card">
              {/* Employee Profile Header */}
              <div className="profile-header-container">
                <div className="profile-header-content">
                  <Avatar
                    name={`${rightPanelEmployee.firstName || ''} ${rightPanelEmployee.lastName || ''}`}
                    size="xl"
                    className="ring-4 ring-white/20"
                  />
                  <h3 className="mt-4 text-xl font-bold text-white">
                    {rightPanelEmployee.firstName && rightPanelEmployee.lastName 
                      ? `${rightPanelEmployee.firstName} ${rightPanelEmployee.lastName}` 
                      : 'Unknown'}
                  </h3>
                  <p className="text-blue-100 text-sm font-medium mt-1">
                    {rightPanelEmployee.designation || 'No designation'}
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <StatusBadge 
                      status={rightPanelEmployee.status === 'Active' || rightPanelEmployee.status === 'active' ? 'success' : 'secondary'} 
                      text={rightPanelEmployee.status || 'Unknown'} 
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="px-6 py-4 border-b border-gray-100">
                <div className="flex justify-center gap-3">
                  <button aria-label="Send Email" className="p-2.5 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group">
                    <EnvelopeIcon className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                  </button>
                  <button aria-label="Call Employee" className="p-2.5 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group">
                    <PhoneIcon className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                  </button>
                  <button aria-label="Chat with Employee" className="p-2.5 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group">
                    <ChatBubbleLeftRightIcon className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                  </button>
                </div>
              </div>

              {/* Employee Details */}
              <div className="profile-details-scroll">
                {/* About Section */}
                <div className="detail-section-margin">
                  <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2 detail-header-margin">
                    <UserGroupIcon className="w-4 h-4 text-blue-600" />
                    About
                  </h4>
                  <div className="space-y-3 detail-section-margin">
                    <div className="flex justify-between items-center py-2 border-b border-gray-50">
                      <span className="text-sm text-gray-500">Age / Gender</span>
                      <span className="text-sm font-medium text-gray-900">
                        {enhancedEmployeeDetails?.profile?.dob 
                          ? `${new Date().getFullYear() - new Date(enhancedEmployeeDetails.profile.dob).getFullYear()} years / ${enhancedEmployeeDetails.profile.gender || 'Not specified'}`
                          : 'Not specified'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-50">
                      <span className="text-sm text-gray-500">Date of Birth</span>
                      <span className="text-sm font-medium text-gray-900">
                        {enhancedEmployeeDetails?.profile?.dob 
                          ? new Date(enhancedEmployeeDetails.profile.dob).toLocaleDateString()
                          : 'Not specified'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-50">
                      <span className="text-sm text-gray-500">Address</span>
                      <span className="text-sm font-medium text-gray-900 text-right max-w-[60%]">
                        {enhancedEmployeeDetails?.profile?.permanentAddress || 'Not specified'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Work Section */}
                <div className="detail-section-margin">
                  <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2 detail-header-margin">
                    <BriefcaseIcon className="w-4 h-4 text-blue-600" />
                    Work
                  </h4>
                  <div className="space-y-3 detail-section-margin">
                    <div className="flex justify-between items-center py-2 border-b border-gray-50">
                      <span className="text-sm text-gray-500">Employee ID</span>
                      <span className="text-sm font-medium text-gray-900">{rightPanelEmployee.employeeId}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-50">
                      <span className="text-sm text-gray-500">Department</span>
                      <span className="text-sm font-medium text-gray-900">{rightPanelEmployee.department}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-50">
                      <span className="text-sm text-gray-500">Email</span>
                      <span className="text-sm font-medium text-gray-900 text-right max-w-[60%] break-words">
                        {rightPanelEmployee.email}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Team Section */}
                <div className="detail-section-margin">
                  <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2 detail-header-margin">
                    <BuildingOfficeIcon className="w-4 h-4 text-blue-600" />
                    Team
                  </h4>
                  <div className="space-y-3 detail-section-margin">
                    {rightPanelEmployee.reportingPartner && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Avatar name="Partner" size="sm" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">Reporting Partner</p>
                          <p className="text-xs text-gray-500">{rightPanelEmployee.reportingPartner}</p>
                        </div>
                      </div>
                    )}
                    {rightPanelEmployee.reportingManager && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Avatar name="Manager" size="sm" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">Reporting Manager</p>
                          <p className="text-xs text-gray-500">{rightPanelEmployee.reportingManager}</p>
                        </div>
                      </div>
                    )}
                    {!rightPanelEmployee.reportingPartner && !rightPanelEmployee.reportingManager && (
                      <p className="text-sm text-gray-500 text-center py-4">No team members assigned</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="right-panel-card items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UsersIcon className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select an Employee</h3>
                <p className="text-sm text-gray-500 px-8">
                  Click on any employee from the table to view their detailed profile
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pending Approvals Section - Overlay */}
      {showPendingApprovals && pendingApprovals.length > 0 && (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                    <PlusIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Pending Employee Approvals</h2>
                    <p className="text-sm text-gray-500">Review and approve new employee registrations</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPendingApprovals(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <span className="text-gray-400">✕</span>
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="space-y-4">
                {pendingApprovals.map((employee) => (
                  <div key={employee.id} className="bg-white border border-blue-200 rounded-xl p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar 
                          name={`${employee?.firstName || ''} ${employee?.lastName || ''}`}
                          size="lg" 
                          src={(() => {
                            const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
                            return employee?.profile?.employeePhotoUrl ? `${API_BASE_URL}${employee.profile.employeePhotoUrl}` : undefined;
                          })()}
                        />
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg">
                            {employee?.firstName && employee?.lastName 
                              ? `${employee.firstName} ${employee.lastName}` 
                              : employee?.officeEmail || 'No name available'}
                          </h3>
                          <p className="text-sm text-gray-600">{employee?.officeEmail || 'No email available'}</p>
                          <p className="text-xs text-gray-500 mt-1">{employee?.designation || 'No designation'} • {employee?.employeeId || 'No ID'}</p>
                        </div>
                      </div>
                      

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Registered</p>
                          <p className="text-sm text-gray-500">
                            {new Date(employee.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            className="h-9 px-4 text-blue-700 border-blue-200 hover:bg-blue-50"
                            onClick={() => handleApproveEmployee(employee.id)}
                            disabled={approvingEmployee === employee.id}
                          >
                            {approvingEmployee === employee.id ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent mr-2" />
                                Approving...
                              </>
                            ) : (
                              'Approve'
                            )}
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="h-9 px-4 text-red-700 border-red-200 hover:bg-red-50"
                            onClick={() => handleRejectEmployee(employee.id)}
                            disabled={rejectingEmployee === employee.id}
                          >
                            {rejectingEmployee === employee.id ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-600 border-t-transparent mr-2" />
                                Rejecting...
                              </>
                            ) : (
                              'Reject'
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    {employee.profile && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                          <div>
                            <span className="font-medium text-gray-500">Education:</span>
                            <p className="text-gray-700 mt-1">{employee?.profile?.education || 'Not specified'}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-500">Mobile:</span>
                            <p className="text-gray-700 mt-1">{employee?.profile?.personalMobile || 'Not specified'}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-500">PAN:</span>
                            <p className="text-gray-700 mt-1">{employee?.profile?.pan || 'Not specified'}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-500">Documents:</span>
                            <p className="text-gray-700 mt-1">
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
            </div>
          </div>
        </div>
      )}

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
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
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
          <div className="grid grid-cols-2 gap-3">
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
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="role-select" className="text-sm font-medium text-secondary-700 block ml-0.5">Software Role</label>
              <select
                id="role-select"
                aria-label="Software Role"
                className="w-full px-3 py-2 h-9 bg-white border border-secondary-200 rounded outline-none transition-all duration-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 hover:border-secondary-300 text-sm font-medium disabled:bg-gray-100"
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
              <label htmlFor="dept-select" className="text-sm font-medium text-secondary-700 block ml-0.5">Department</label>
              <select
                id="dept-select"
                aria-label="Department"
                className="w-full px-3 py-2 h-9 bg-white border border-secondary-200 rounded outline-none transition-all duration-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 hover:border-secondary-300 text-sm font-medium disabled:bg-gray-100"
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
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="partner-select" className="text-sm font-medium text-secondary-700 block ml-0.5">Reporting Partner</label>
              {partnersLoading ? (
                <div className="w-full px-3 py-2 h-9 bg-gray-50 border border-secondary-200 rounded text-sm text-gray-500">
                  Loading partners...
                </div>
              ) : (
                <select
                  id="partner-select"
                  aria-label="Reporting Partner"
                  className={`w-full px-3 py-2 h-9 bg-white border border-secondary-200 rounded outline-none transition-all duration-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 hover:border-secondary-300 text-sm font-medium ${role === 'Partner' ? 'bg-gray-100 cursor-not-allowed' : ''} ${!canEditEmployee() && editingEmployee !== null ? 'disabled:bg-gray-100' : ''}`}
                  value={reportingPartner}
                  onChange={(e) => {
                    console.log('🔄 Reporting Partner changed to:', e.target.value);
                    setReportingPartner(e.target.value);
                  }}
                  disabled={role === 'Partner' || !canEditEmployee()}
                >
                  <option value="">Select Partner...</option>
                  {usersLoading ? (
                    <option value="" disabled>Loading partners...</option>
                  ) : filteredPartners.length > 0 ? (
                    filteredPartners.map(partner => (
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
              <label htmlFor="manager-select" className="text-sm font-medium text-secondary-700 block ml-0.5">Reporting Manager</label>
              {managersLoading ? (
                <div className="w-full px-3 py-2 h-9 bg-gray-50 border border-secondary-200 rounded text-sm text-gray-500">
                  Loading managers...
                </div>
              ) : (
                <select
                  id="manager-select"
                  aria-label="Reporting Manager"
                  className={`w-full px-3 py-2 h-9 bg-white border border-secondary-200 rounded outline-none transition-all duration-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 hover:border-secondary-300 text-sm font-medium ${role === 'Partner' || role === 'Manager' ? 'bg-gray-100 cursor-not-allowed' : ''} ${!canEditEmployee() && editingEmployee !== null ? 'disabled:bg-gray-100' : ''}`}
                  value={reportingManager}
                  onChange={(e) => {
                    console.log('🔄 Reporting Manager changed to:', e.target.value);
                    setReportingManager(e.target.value);
                  }}
                  disabled={role === 'Partner' || role === 'Manager' || !canEditEmployee()}
                >
                  <option value="">Select Manager...</option>
                  {usersLoading ? (
                    <option value="" disabled>Loading managers...</option>
                  ) : role === 'Employee' && filteredManagers.length > 0 ? (
                    filteredManagers.map(manager => (
                      <option key={manager.id} value={manager.id}>
                        {manager.firstName} {manager.lastName}
                      </option>
                    ))
                  ) : role === 'Employee' && filteredManagers.length === 0 && reportingPartner ? (
                    // Show partners as fallback managers when no managers exist under selected partner
                    partners.filter(p => p.id === reportingPartner).map(partner => (
                      <option key={partner.id} value={partner.id}>
                        {partner.firstName} {partner.lastName} (Partner)
                      </option>
                    ))
                  ) : role === 'Employee' ? (
                    <option value="" disabled>No managers available under this partner</option>
                  ) : role === 'Manager' ? (
                    // For managers, show selected partner as their manager
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
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Employee Code"
              value={employeeCode}
              disabled
              placeholder="Auto-generated by system"
            />
          </div>
          
          {/* Resend Registration Email Button for Edit Mode */}
          {editingEmployee && canEditEmployee() && (
            <div className="pt-3 border-t border-secondary-200">
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
          
          <div className="pt-3 flex gap-3">
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
                  <label htmlFor="details-gender-select" className="text-sm font-medium text-secondary-500 block mb-1">Gender</label>
                  {isEditMode && canEditEmployee() ? (
                    <select
                      id="details-gender-select"
                      aria-label="Gender"
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
                  <label htmlFor="details-address-area" className="text-sm font-medium text-secondary-500 block mb-1">Address</label>
                  {isEditMode && canEditEmployee() ? (
                    <textarea
                      id="details-address-area"
                      placeholder="Enter permanent address"
                      aria-label="Permanent Address"
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
                  <label htmlFor="details-role-select" className="text-sm font-medium text-secondary-500 block mb-1">Role</label>
                  {isEditMode && canEditEmployee() ? (
                    <select
                      id="details-role-select"
                      aria-label="Software Role"
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
                  <label htmlFor="details-dept-select" className="text-sm font-medium text-secondary-500 block mb-1">Department</label>
                  {isEditMode && canEditEmployee() ? (
                    <select
                      id="details-dept-select"
                      aria-label="Department"
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
                  <label htmlFor="details-partner-select" className="text-sm font-medium text-secondary-500 block mb-1">Reporting Partner</label>
                  {isEditMode && canEditEmployee() ? (
                    <>
                    <select
                      id="details-partner-select"
                      aria-label="Reporting Partner"
                      value={detailsReportingPartner || ''}
                      onChange={(e) => {
                        const pId = e.target.value;
                        console.log('🔄 Details Reporting Partner changed to:', pId);
                        setDetailsReportingPartner(pId);
                        
                        // For employees, clear manager when partner changes
                        if (editedEmployeeData.role === 'Employee') {
                          handleFieldChange('reportingManager', '');
                        }
                        
                        // Update the employee data
                        handleFieldChange('reportingPartner', pId);
                        
                        // If role is manager, auto-set their manager to the partner
                        if (editedEmployeeData.role === 'Manager') {
                          handleFieldChange('reportingManager', pId);
                        }
                      }}
                      className={`w-full px-3 py-2 border border-secondary-200 rounded-lg text-sm ${editedEmployeeData.role === 'Partner' ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                      disabled={editedEmployeeData.role === 'Partner' || !canEditEmployee()}
                    >
                      <option value="">Select Partner...</option>
                      {usersLoading ? (
                        <option disabled>Loading...</option>
                      ) : detailsFilteredPartners.length > 0 ? (
                        detailsFilteredPartners.map(p => (
                          <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>
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
                  <label htmlFor="details-manager-select" className="text-sm font-medium text-secondary-500 block mb-1">Reporting Manager</label>
                  {isEditMode && canEditEmployee() ? (
                    <>
                      <select
                        id="details-manager-select"
                        aria-label="Reporting Manager"
                        value={editedEmployeeData.reportingManager || ''}
                        onChange={(e) => {
                          console.log('🔄 Details Reporting Manager changed to:', e.target.value);
                          handleFieldChange('reportingManager', e.target.value);
                        }}
                        className={`w-full px-3 py-2 border border-secondary-200 rounded-lg text-sm ${(editedEmployeeData.role === 'Partner' || editedEmployeeData.role === 'Manager') ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                        disabled={editedEmployeeData.role === 'Partner' || editedEmployeeData.role === 'Manager' || !canEditEmployee()}
                      >
                        <option value="">Select Manager...</option>
                        {usersLoading ? (
                          <option disabled>Loading...</option>
                        ) : (editedEmployeeData.role === 'Employee' && detailsFilteredManagers.length > 0) ? (
                          detailsFilteredManagers.map((m: any) => (
                            <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>
                          ))
                        ) : (editedEmployeeData.role === 'Employee' && detailsFilteredManagers.length === 0 && detailsReportingPartner) ? (
                          // Fallback: Partner as manager
                          partners.filter((p: any) => p.id === detailsReportingPartner).map((p: any) => (
                            <option key={p.id} value={p.id}>{p.firstName} {p.lastName} (Partner)</option>
                          ))
                        ) : editedEmployeeData.role === 'Manager' ? (
                          // Manager reports to partner
                          partners.filter((p: any) => p.id === detailsReportingPartner).map((p: any) => (
                            <option key={p.id} value={p.id}>{p.firstName} {p.lastName} (Partner)</option>
                          ))
                        ) : (
                          <option value="" disabled>No managers available</option>
                        )}
                      </select>
                      {(editedEmployeeData.role === 'Partner' || editedEmployeeData.role === 'Manager') && (
                        <p className="text-[10px] text-gray-500 mt-1">
                          {editedEmployeeData.role === 'Partner' ? 'Partners cannot have reporting structure' : 'Managers report to selected Partner'}
                        </p>
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
                  <label htmlFor="details-marital-select" className="text-sm font-medium text-secondary-500 block mb-1">Marital Status</label>
                  {isEditMode && canEditEmployee() ? (
                    <select
                      id="details-marital-select"
                      aria-label="Marital Status"
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
                  <label htmlFor="details-status-select" className="text-sm font-medium text-secondary-500 block mb-1">Account Status</label>
                  {isEditMode && canEditEmployee() ? (
                    <select
                      id="details-status-select"
                      aria-label="Account Status"
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
            {/* Profile Photo Section */}
            <div className="bg-white border border-secondary-200 rounded-lg p-6">
              <h3 className="text-lg font-bold text-secondary-900 mb-4 flex items-center gap-2">
                <PhotoIcon className="w-5 h-5 text-primary-600" />
                Profile Photo
              </h3>
              <div className="flex items-center gap-6">
                <div className="relative">
                  <img
                    src={
                      enhancedEmployeeDetails?.profile?.employeePhotoUrl
                        ? (() => {
                            const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
                            return `${API_BASE_URL}${enhancedEmployeeDetails.profile.employeePhotoUrl}?t=${new Date().getTime()}`;
                          })()
                        : "/default-avatar.png"
                    }
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border-4 border-secondary-200"
                    onError={(e) => {
                      e.currentTarget.src = "/default-avatar.png";
                    }}
                  />
                  <label htmlFor="profilePhotoUpload" aria-label="Upload profile photo" className="absolute bottom-0 right-0 bg-primary-600 text-white p-2 rounded-full cursor-pointer hover:bg-primary-700 transition-colors">
                    <PencilSquareIcon className="w-4 h-4" />
                  </label>
                  <input
                    id="profilePhotoUpload"
                    type="file"
                    accept="image/*"
                    aria-label="Upload profile photo"
                    title="Upload profile photo"
                    className="hidden"
                    onChange={handleProfilePhotoUpload}
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-secondary-600 mb-2">
                    Upload a professional profile photo. Recommended size: 200x200px, max 5MB.
                  </p>
                  <p className="text-xs text-secondary-500">
                    Supported formats: JPEG, JPG, PNG
                  </p>
                </div>
              </div>
            </div>

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
            <label htmlFor="doc-category-select" className="text-sm font-medium text-secondary-700 block ml-0.5">Document Category</label>
            <select
              id="doc-category-select"
              className="w-full px-4 py-2.5 bg-white border border-secondary-200 rounded-lg outline-none transition-all duration-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 hover:border-secondary-300 text-sm font-medium"
              value={documentCategory}
              aria-label="Document Category"
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
            <label htmlFor="file-upload-input" className="text-sm font-medium text-secondary-700">Select File</label>
            <input
              id="file-upload-input"
              type="file"
              aria-label="Select file to upload"
              title="Select file"
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
