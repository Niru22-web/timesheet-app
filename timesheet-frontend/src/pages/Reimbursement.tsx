import React, { useState, useEffect } from 'react';
import API from '../api';
import { useAuth } from '../contexts/AuthContext';
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
  TrashIcon
} from '@heroicons/react/24/outline';

// UI Components
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Avatar from '../components/ui/Avatar';
import StatusBadge from '../components/ui/StatusBadge';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';

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
    fetchMasterData();
  }, [statusFilter]);

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
      const res = await API.get('/reimbursements', {
        params: { status: statusFilter }
      });
      
      // Handle standardized response format { success, data, message }
      setClaims(res.data?.success ? res.data.data : res.data);
    } catch (err) {
      console.error('Failed to fetch claims:', err);
      setClaims([]);
    } finally {
      setLoading(false);
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
    { label: 'Pending Claims', value: claims.filter(c => c.status === 'pending').length.toString(), icon: ClockIcon, color: 'text-warning-600', bg: 'bg-warning-50' },
    { label: 'Approved', value: claims.filter(c => c.status === 'approved').length.toString(), icon: CheckCircleIcon, color: 'text-success-600', bg: 'bg-success-50' },
    { label: 'Total Value', value: `₹${claims.reduce((acc, c) => acc + c.amount, 0).toLocaleString()}`, icon: CurrencyDollarIcon, color: 'text-primary-600', bg: 'bg-primary-50' },
    { label: 'Integrity', value: '100%', icon: ShieldCheckIcon, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ];

  const filteredClaims = claims.filter(c => {
    const matchSearch = (c.employee.firstName + ' ' + c.employee.lastName).toLowerCase().includes(searchTerm.toLowerCase()) || c.claimId.toLowerCase().includes(searchTerm.toLowerCase());
    return matchSearch;
  });

  return (
    <div className="h-full flex flex-col space-y-6 animate-fade-in max-h-[calc(100vh-120px)] overflow-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 flex-none">
        <div>
          <h1 className="text-3xl font-extrabold text-secondary-900 tracking-tight">Expense Registry</h1>
          <p className="text-sm font-medium text-secondary-500 mt-1 italic">Corporate disbursement and reimbursement management.</p>
        </div>
        <div className="flex items-center gap-3">
           <Button 
            variant="secondary" 
            size="sm" 
            className="h-10" 
            onClick={fetchClaims}
            title="Refresh Claims"
            aria-label="Refresh Claims"
          >
            <ArrowPathIcon className="w-4 h-4" />
          </Button>
          <Button
            variant="primary"
            size="sm"
            className="h-10 px-6 font-bold"
            onClick={() => setShowSubmitModal(true)}
            leftIcon={<PlusIcon className="w-4 h-4" />}
          >
            New Requisition
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-none">
        {stats.map((stat, i) => (
          <Card key={i} className="px-5 py-4 transition-all hover:-translate-y-1">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-lg ${stat.bg} ${stat.color} flex items-center justify-center shadow-sm`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-secondary-500 uppercase tracking-widest leading-none">{stat.label}</p>
                <p className="text-xl font-bold text-secondary-900 leading-none mt-1.5">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Filters/Table */}
      <Card className="flex-1 flex flex-col overflow-hidden shadow-lg border-none">
        <div className="p-4 bg-white border-b border-secondary-100 flex flex-col md:flex-row gap-3 flex-none">
          <div className="flex-1 relative group">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400 group-focus-within:text-primary-500 transition-colors" />
            <input
              type="text"
              placeholder="Search by ID or employee..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-secondary-50/50 border border-secondary-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
            />
          </div>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-48"
          >
            <option>All Status</option>
            <option>Pending</option>
            <option>Approved</option>
            <option>Rejected</option>
          </Select>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <table className="w-full text-left">
            <thead className="bg-secondary-50/50 sticky top-0 z-10">
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
            <tbody className="divide-y divide-secondary-50">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-20 text-center">
                    <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : filteredClaims.length > 0 ? (
                filteredClaims.map(claim => (
                  <tr key={claim.id} className="hover:bg-primary-50/20 group transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={claim.employee.firstName} size="sm" />
                        <div>
                          <p className="text-sm font-bold text-secondary-900 group-hover:text-primary-600 transition-colors">{claim.employee.firstName} {claim.employee.lastName}</p>
                          <p className="text-[10px] font-bold text-secondary-400 mt-0.5">{claim.claimId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-secondary-700">{claim.client?.name || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-secondary-700">{claim.project?.name || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-secondary-700">{claim.job?.name || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-black text-secondary-500 bg-secondary-100 px-2 py-0.5 rounded uppercase tracking-tighter">{claim.category}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-black text-secondary-900">₹{claim.amount.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-secondary-600">{new Date(claim.date).toLocaleDateString()}</span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={claim.status as any} />
                    </td>
                    <td className="px-6 py-4">
                      {claim.attachments && claim.attachments.length > 0 ? (
                        <div className="flex items-center gap-1">
                          <PaperClipIcon className="w-4 h-4 text-secondary-400" />
                          <span className="text-xs text-secondary-600">{claim.attachments.length}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-secondary-400">None</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          className="p-1.5 text-secondary-400 hover:text-primary-600 rounded border border-transparent hover:border-secondary-100 hover:bg-white transition-all"
                          title="View Claim Details"
                          aria-label="View Details"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        {claim.status === 'pending' && (
                          <>
                            <button 
                              className="p-1.5 text-secondary-400 hover:text-warning-600 rounded border border-transparent hover:border-secondary-100 hover:bg-white transition-all"
                              title="Edit Claim"
                              aria-label="Edit Claim"
                            >
                              <PencilSquareIcon className="w-4 h-4" />
                            </button>
                            <button 
                              className="p-1.5 text-secondary-400 hover:text-danger-600 rounded border border-transparent hover:border-secondary-100 hover:bg-white transition-all"
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
    </div>
  );
};

export default Reimbursement;
