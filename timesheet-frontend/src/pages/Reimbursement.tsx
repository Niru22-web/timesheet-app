import React, { useState, useEffect } from 'react';
import API from '../api';
import { useAuth } from '../contexts/AuthContext';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import {
  CurrencyDollarIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  DocumentTextIcon,
  EllipsisVerticalIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  CalendarIcon,
  ArrowRightIcon,
  DocumentArrowUpIcon,
  CommandLineIcon,
  ShieldCheckIcon,
  BoltIcon,
  ArrowPathIcon,
  PaperClipIcon,
  XMarkIcon,
  EyeIcon,
  PencilSquareIcon,
  TrashIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

// UI Components
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Avatar from '../components/ui/Avatar';
import StatusBadge from '../components/ui/StatusBadge';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import TableToolbar from '../components/ui/TableToolbar';
import ActionBar from '../components/ui/ActionBar';
import FAB from '../components/FAB';

interface ReimbursementClaim {
  id: string;
  claimId: string;
  category: string;
  amount: number;
  date: string;
  status: 'pending' | 'approved' | 'rejected' | 'active';
  description: string;
  clientId?: string;
  projectId?: string;
  jobId?: string;
  attachments?: string[];
  employee: {
    firstName: string;
    lastName: string;
  };
  client?: {
    id: string;
    name: string;
  };
  project?: {
    id: string;
    name: string;
  };
  job?: {
    id: string;
    name: string;
  };
}

const Reimbursement: React.FC = () => {
  const { user } = useAuth();
  const [claims, setClaims] = useState<ReimbursementClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Bulk Upload states
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<any>(null);
  
  // KPI state
  const [kpis, setKpis] = useState({
    totalSubmitted: 0,
    approvalRate: 0,
    rejectedVsApproved: 0,
    approvedCount: 0,
    rejectedCount: 0
  });

  // Filter states
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [employeeOptions, setEmployeeOptions] = useState<any[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    clientId: '',
    projectId: '',
    jobId: '',
    category: 'Travel',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    attachments: [] as File[]
  });

  // Master data for hierarchy
  const [clients, setClients] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);

  // Attachment management
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [attachmentPreviews, setAttachmentPreviews] = useState<{file: File, preview: string}[]>([]);

  useEffect(() => {
    fetchClaims();
    fetchKPIs();
    if (!clients.length) fetchMasterData();
    if (['Admin', 'Partner', 'Owner'].includes(user?.role || '') && !employeeOptions.length) fetchEmployees();
  }, [statusFilter, searchTerm, selectedMonth, selectedYear, selectedEmployeeId]);

  const fetchEmployees = async () => {
    try {
      const res = await API.get('/employees');
      setEmployeeOptions(res.data?.success ? res.data.data : res.data);
    } catch (err) {
      console.error('Failed to fetch employees:', err);
    }
  };

  const fetchKPIs = async () => {
    try {
      const res = await API.get('/reimbursements/kpis', {
        params: {
          month: selectedMonth,
          year: selectedYear,
          employeeId: selectedEmployeeId
        }
      });
      if (res.data?.success) {
        setKpis(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch KPIs:', err);
    }
  };

  const fetchMasterData = async () => {
    try {
      const [clientsRes, projectsRes, jobsRes] = await Promise.all([
        API.get('/clients'),
        API.get('/projects'),
        API.get('/jobs')
      ]);
      
      // Handle standardized response format { success, data, message }
      setClients(clientsRes.data?.success ? clientsRes.data.data : clientsRes.data);
      setProjects(projectsRes.data?.success ? projectsRes.data.data : projectsRes.data);
      setJobs(jobsRes.data?.success ? jobsRes.data.data : jobsRes.data);
    } catch (err) {
      console.error('Failed to fetch master data:', err);
      // Fallback to empty arrays
      setClients([]);
      setProjects([]);
      setJobs([]);
    }
  };

  const fetchClaims = async () => {
    try {
      setLoading(true);
      
      const monthStart = startOfMonth(new Date(selectedYear, selectedMonth - 1));
      const monthEnd = endOfMonth(monthStart);

      // Validate dates
      if (isNaN(monthStart.getTime()) || isNaN(monthEnd.getTime())) {
        console.error('Invalid date selection:', { selectedMonth, selectedYear });
        setClaims([]);
        return;
      }

      const res = await API.get('/reimbursements', {
        params: { 
          status: statusFilter !== 'All Status' ? statusFilter.toLowerCase() : undefined,
          q: searchTerm,
          startDate: monthStart.toISOString(),
          endDate: monthEnd.toISOString(),
          employeeId: selectedEmployeeId
        }
      });
      
      setClaims(res.data?.success ? res.data.data : res.data || []);
    } catch (err) {
      console.error('Failed to fetch claims:', err);
      setClaims([]); // Fallback
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await API.get('/reimbursements/export', {
        params: { 
          status: statusFilter !== 'All Status' ? statusFilter.toLowerCase() : undefined,
          q: searchTerm
        },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'reimbursements_export.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  const handleBulkUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      const res = await API.post('/reimbursements/bulk-upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUploadResult(res.data.data);
      fetchClaims();
    } catch (err) {
      console.error('Bulk upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleCreateClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append('clientId', formData.clientId);
      submitData.append('projectId', formData.projectId);
      submitData.append('jobId', formData.jobId);
      submitData.append('category', formData.category);
      submitData.append('amount', formData.amount);
      submitData.append('date', formData.date);
      submitData.append('description', formData.description);
      
      // Append attachments
      formData.attachments.forEach((file, index) => {
        submitData.append(`attachments`, file);
      });

      await API.post('/reimbursements', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setShowSubmitModal(false);
      setFormData({
        clientId: '',
        projectId: '',
        jobId: '',
        category: 'Travel',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
        attachments: []
      });
      setUploadedFiles([]);
      setAttachmentPreviews([]);
      fetchClaims();
    } catch (err) {
      console.error('Failed to submit claim:', err);
      alert('Submission failed. Check your network or permissions.');
    }
  };

  // Attachment handling functions
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      return validTypes.includes(file.type);
    });

    if (validFiles.length !== files.length) {
      alert('Only PDF, JPG, PNG, and DOC files are allowed.');
    }

    const newAttachments = [...formData.attachments, ...validFiles];
    setFormData({ ...formData, attachments: newAttachments });

    // Create previews for images
    const newPreviews = validFiles.map(file => {
      const preview = file.type.startsWith('image/') ? URL.createObjectURL(file) : '';
      return { file, preview };
    });
    setAttachmentPreviews([...attachmentPreviews, ...newPreviews]);
  };

  const removeAttachment = (index: number) => {
    const newAttachments = formData.attachments.filter((_, i) => i !== index);
    const newPreviews = attachmentPreviews.filter((_, i) => i !== index);
    
    // Revoke object URL for image previews
    if (attachmentPreviews[index]?.preview) {
      URL.revokeObjectURL(attachmentPreviews[index].preview);
    }
    
    setFormData({ ...formData, attachments: newAttachments });
    setAttachmentPreviews(newPreviews);
  };

  // Filter functions for hierarchy
  const filteredProjects = projects.filter(p => p.clientId === formData.clientId);
  const filteredJobs = jobs.filter(j => j.projectId === formData.projectId);

  const stats = [
    { label: 'Monthly Requests', value: kpis.totalSubmitted.toString(), icon: ClockIcon, color: 'text-primary-600', bg: 'bg-primary-50' },
    { label: 'Approval Rate', value: `${kpis.approvalRate}%`, icon: CheckCircleIcon, color: 'text-success-600', bg: 'bg-success-50' },
    { label: 'Rejection/Appr', value: kpis.rejectedVsApproved.toString(), icon: XCircleIcon, color: 'text-rose-600', bg: 'bg-rose-50' },
    { label: 'Value (Pending)', value: `₹${claims.filter(c => c.status === 'pending').reduce((acc, c) => acc + c.amount, 0).toLocaleString()}`, icon: CurrencyDollarIcon, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  const filteredClaims = claims; // Backend handles filtering

  return (
    <div className="h-full flex flex-col space-y-6 animate-fade-in max-h-[calc(100vh-120px)] overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-none px-4 sm:px-0">
        <div>
          <h1 className="text-xl sm:text-3xl font-extrabold text-secondary-900 tracking-tight">Expense Registry</h1>
          <p className="text-xs sm:text-sm font-medium text-secondary-500 mt-1 italic">Corporate disbursement and reimbursement management.</p>
        </div>
        <div className="hidden sm:block">
          <ActionBar
            onAdd={() => setShowSubmitModal(true)}
            addLabel="New Requisition"
            onUpload={user?.role === 'Manager' || user?.role === 'Admin' ? () => setShowBulkModal(true) : undefined}
            onDownload={handleExport}
            showTemplate={false}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 flex-none px-4 sm:px-0">
        {stats.map((stat, i) => (
          <Card key={i} className="px-3 py-3 sm:px-5 sm:py-4 transition-all hover:-translate-y-1 hover:shadow-md">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg ${stat.bg} ${stat.color} flex items-center justify-center shadow-sm`}>
                <stat.icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] sm:text-[10px] font-bold text-secondary-500 uppercase tracking-widest leading-none truncate">{stat.label}</p>
                <p className="text-lg sm:text-xl font-bold text-secondary-900 leading-none mt-1 sm:mt-1.5 truncate">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Filters/Table */}
      <Card className="flex-1 flex flex-col overflow-hidden shadow-lg border-none">
        <TableToolbar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          showFilters={showAdvancedFilters}
          setShowFilters={setShowAdvancedFilters}
          placeholder="Search by ID or employee name..."
          filters={
            <>
              <Select
                label="Month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              >
                {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((name, i) => (
                  <option key={name} value={i + 1}>{name}</option>
                ))}
              </Select>

              <Select
                label="Year"
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              >
                {[2023, 2024, 2025, 2026].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </Select>

              <Select
                label="Status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option>All Status</option>
                <option>Pending</option>
                <option>Approved</option>
                <option>Rejected</option>
              </Select>

              {['Admin', 'Partner', 'Owner'].includes(user?.role || '') && (
                <Select
                  label="Employee"
                  value={selectedEmployeeId}
                  onChange={(e) => setSelectedEmployeeId(e.target.value)}
                >
                  <option value="">All Employees</option>
                  {employeeOptions.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
                  ))}
                </Select>
              )}
            </>
          }
        />

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <table className="w-full text-left border-collapse responsive-table">
            <thead className="bg-secondary-50/50 sticky top-0 z-10 hidden sm:table-header-group">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold text-secondary-500 uppercase tracking-widest">Requester / ID</th>
                <th className="px-6 py-4 text-[10px] font-bold text-secondary-500 uppercase tracking-widest">Client</th>
                <th className="px-6 py-4 text-[10px] font-bold text-secondary-500 uppercase tracking-widest">Project</th>
                <th className="px-6 py-4 text-[10px] font-bold text-secondary-500 uppercase tracking-widest">Job</th>
                <th className="px-6 py-4 text-[10px] font-bold text-secondary-500 uppercase tracking-widest">Expense Head</th>
                <th className="px-6 py-4 text-[10px] font-bold text-secondary-500 uppercase tracking-widest">Amount</th>
                <th className="px-6 py-4 text-[10px] font-bold text-secondary-500 uppercase tracking-widest">Submission Date</th>
                <th className="px-6 py-4 text-[10px] font-bold text-secondary-500 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-secondary-500 uppercase tracking-widest">Attachments</th>
                <th className="px-6 py-4 text-[10px] font-bold text-secondary-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-50 sm:bg-white text-sm">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-20 text-center">
                    <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : filteredClaims.length > 0 ? (
                filteredClaims.map(claim => (
                  <tr key={claim.id} className="hover:bg-primary-50/20 group transition-colors">
                    <td className="px-6 py-4" data-label="Requester / ID">
                      <div className="flex items-center gap-3">
                        <Avatar name={claim.employee.firstName} size="sm" />
                        <div className="text-left sm:text-left">
                          <p className="text-sm font-bold text-secondary-900 group-hover:text-primary-600 transition-colors uppercase sm:normal-case">{claim.employee.firstName} {claim.employee.lastName}</p>
                          <p className="text-[10px] font-bold text-secondary-400 mt-0.5">{claim.claimId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right sm:text-left" data-label="Client">
                      <span className="text-sm font-medium text-secondary-700">{claim.client?.name || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4 text-right sm:text-left" data-label="Project">
                      <span className="text-sm font-medium text-secondary-700">{claim.project?.name || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4 text-right sm:text-left" data-label="Job">
                      <span className="text-sm font-medium text-secondary-700">{claim.job?.name || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4 text-right sm:text-left" data-label="Expense Head">
                      <span className="text-[10px] font-black text-secondary-500 bg-secondary-100 px-2 py-0.5 rounded uppercase tracking-tighter">{claim.category}</span>
                    </td>
                    <td className="px-6 py-4 text-right sm:text-left" data-label="Amount">
                      <span className="text-sm font-black text-secondary-900">₹{claim.amount.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4 text-right sm:text-left" data-label="Submission Date">
                      <span className="text-sm text-secondary-600">{new Date(claim.date).toLocaleDateString()}</span>
                    </td>
                    <td className="px-6 py-4 justify-end sm:justify-start" data-label="Status">
                      <div className="flex justify-end sm:justify-start">
                        <StatusBadge status={claim.status as any} />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right sm:text-left" data-label="Attachments">
                      <div className="flex items-center justify-end sm:justify-start gap-1">
                        {claim.attachments && claim.attachments.length > 0 ? (
                          <>
                            <PaperClipIcon className="w-4 h-4 text-secondary-400" />
                            <span className="text-xs text-secondary-600">{claim.attachments.length}</span>
                          </>
                        ) : (
                          <span className="text-xs text-secondary-400">None</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right" data-label="Actions">
                      <div className="flex items-center justify-end gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button 
                          className="p-1.5 text-secondary-400 hover:text-primary-600 rounded border border-transparent hover:border-secondary-100 hover:bg-white transition-all min-w-[36px] min-h-[36px] flex items-center justify-center"
                          title="View Claim Details"
                          aria-label="View Details"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        {claim.status === 'pending' && (
                          <>
                            <button 
                              className="p-1.5 text-secondary-400 hover:text-warning-600 rounded border border-transparent hover:border-secondary-100 hover:bg-white transition-all min-w-[36px] min-h-[36px] flex items-center justify-center"
                              title="Edit Claim"
                              aria-label="Edit Claim"
                            >
                              <PencilSquareIcon className="w-4 h-4" />
                            </button>
                            <button 
                              className="p-1.5 text-secondary-400 hover:text-danger-600 rounded border border-transparent hover:border-secondary-100 hover:bg-white transition-all min-w-[36px] min-h-[36px] flex items-center justify-center"
                              title="Delete Claim"
                              aria-label="Delete Claim"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="py-20 text-center text-secondary-400 font-bold uppercase text-[10px] tracking-widest">Zero disbursement records found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal */}
      <Modal
        isOpen={showSubmitModal}
        onClose={() => {
          setShowSubmitModal(false);
          // Clear attachment previews
          attachmentPreviews.forEach(preview => {
            if (preview.preview) {
              URL.revokeObjectURL(preview.preview);
            }
          });
          setAttachmentPreviews([]);
        }}
        title="Submit Reimbursement Request"
        size="lg"
      >
        <form onSubmit={handleCreateClaim} className="space-y-6">
          {/* Client, Project, Job Fields */}
          <div className="space-y-4">
            <Select
              label="Client Name"
              value={formData.clientId}
              onChange={(e) => setFormData({ ...formData, clientId: e.target.value, projectId: '', jobId: '' })}
              required
              className="rounded-lg border-gray-200"
            >
              <option value="">Select client...</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
            
            <Select
              label="Project Name"
              value={formData.projectId}
              onChange={(e) => setFormData({ ...formData, projectId: e.target.value, jobId: '' })}
              required
              disabled={!formData.clientId}
              className="rounded-lg border-gray-200"
            >
              <option value="">Select project...</option>
              {filteredProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </Select>
            
            <Select
              label="Job Name"
              value={formData.jobId}
              onChange={(e) => setFormData({ ...formData, jobId: e.target.value })}
              required
              disabled={!formData.projectId}
              className="rounded-lg border-gray-200"
            >
              <option value="">Select job...</option>
              {filteredJobs.map(j => <option key={j.id} value={j.id}>{j.name}</option>)}
            </Select>
          </div>

          {/* Expense Head and Amount */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Expense Head"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
              className="rounded-lg border-gray-200"
            >
              <option value="Travel">Travel</option>
              <option value="Food">Food</option>
              <option value="Accommodation">Accommodation</option>
              <option value="Office Supplies">Office Supplies</option>
              <option value="Other">Other</option>
            </Select>
            
            <Input
              label="Amount (₹)"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
              className="rounded-lg border-gray-200"
            />
          </div>

          {/* Description */}
          <div>
            <Input
              label="Description"
              placeholder="Describe the expense details..."
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              className="rounded-lg border-gray-200"
            />
          </div>

          {/* Attachments */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Attachments</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-gray-500">
                  PDF, JPG, PNG, DOC up to 10MB each
                </p>
              </label>
            </div>

            {/* Attachment Previews */}
            {attachmentPreviews.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium text-gray-700">Uploaded Files:</p>
                {attachmentPreviews.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {item.preview ? (
                        <img src={item.preview} alt={item.file.name} className="w-10 h-10 object-cover rounded" />
                      ) : (
                        <PaperClipIcon className="w-10 h-10 text-gray-400" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900">{item.file.name}</p>
                        <p className="text-xs text-gray-500">{(item.file.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAttachment(index)}
                      className="p-1 text-red-500 hover:text-red-700 transition-colors"
                      title="Remove Attachment"
                      aria-label="Remove Attachment"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowSubmitModal(false);
                // Clear attachment previews
                attachmentPreviews.forEach(preview => {
                  if (preview.preview) {
                    URL.revokeObjectURL(preview.preview);
                  }
                });
                setAttachmentPreviews([]);
              }}
              className="px-6 py-2"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="px-6 py-2"
            >
              Submit
            </Button>
          </div>
        </form>
      </Modal>

      {/* Bulk Upload Modal */}
      <Modal
        isOpen={showBulkModal}
        onClose={() => {
          setShowBulkModal(false);
          setUploadResult(null);
          setSelectedFile(null);
        }}
        title="Bulk Reimbursement Import"
        size="lg"
      >
        <div className="space-y-4 pt-4">
          {!uploadResult ? (
            <div className="space-y-4">
              <div className="p-4 bg-primary-50 rounded-lg flex items-start gap-3">
                <DocumentArrowUpIcon className="w-5 h-5 text-primary-600 mt-0.5" />
                <div className="text-sm text-primary-800">
                  <p className="font-bold mb-1">Import Guidelines:</p>
                  <ul className="list-disc ml-4 space-y-1">
                    <li>Required columns: <strong>employeeName, clientName, projectName, jobName, Amount, Date</strong></li>
                    <li>Optional: category, description</li>
                    <li>Ensure Master data exists before importing.</li>
                  </ul>
                </div>
              </div>
              <input
                type="file"
                accept=".xlsx"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="w-full p-3 border-2 border-dashed border-primary-200 rounded-xl"
                title="Select Reimbursement Excel File"
                aria-label="Upload Reimbursement Template"
              />
              <div className="flex gap-4">
                <Button variant="secondary" fullWidth onClick={() => setShowBulkModal(false)}>Cancel</Button>
                <Button 
                  variant="primary" 
                  fullWidth 
                  onClick={handleBulkUpload}
                  disabled={!selectedFile || uploading}
                >
                  {uploading ? 'Processing...' : 'Start Import'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircleIcon className="w-5 h-5 text-emerald-600" />
                    <span className="text-xs font-bold text-emerald-800 uppercase">Success</span>
                  </div>
                  <p className="text-2xl font-bold text-emerald-700">{uploadResult.successCount}</p>
                </div>
                <div className="p-4 bg-rose-50 rounded-xl border border-rose-100">
                  <div className="flex items-center gap-2 mb-1">
                    <ExclamationTriangleIcon className="w-5 h-5 text-rose-600" />
                    <span className="text-xs font-bold text-rose-800 uppercase">Errors</span>
                  </div>
                  <p className="text-2xl font-bold text-rose-700">{uploadResult.errors.length}</p>
                </div>
              </div>

              {uploadResult.errors.length > 0 && (
                <div className="max-h-40 overflow-y-auto p-3 bg-secondary-50 rounded-lg border border-secondary-200">
                  {uploadResult.errors.map((err: any, i: number) => (
                    <p key={i} className="text-xs text-rose-600 mb-1 leading-tight">
                      <strong>Row {i + 1}:</strong> {err.error}
                    </p>
                  ))}
                </div>
              )}

              <Button variant="primary" fullWidth onClick={() => {
                setShowBulkModal(false);
                setUploadResult(null);
                setSelectedFile(null);
              }}>Done</Button>
            </div>
          )}
        </div>
      </Modal>

      {/* Mobile FAB */}
      <FAB
        onClick={() => setShowSubmitModal(true)}
        label="New Requisition"
      />
    </div>
  );
};

export default Reimbursement;
