import React, { useState, useEffect } from 'react';
import API from '../api';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../contexts/PermissionsContext';
import {
    WrenchScrewdriverIcon,
    BriefcaseIcon,
    UsersIcon,
    CalendarIcon,
    MagnifyingGlassIcon,
    PlusIcon,
    PencilSquareIcon,
    TrashIcon,
    ShieldCheckIcon,
    BookmarkIcon,
    ClockIcon,
    CurrencyDollarIcon,
    ListBulletIcon
} from '@heroicons/react/24/outline';

// UI Components
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import StatusBadge from '../components/ui/StatusBadge';
import Modal from '../components/ui/Modal';
import Select from '../components/ui/Select';
import { TableSkeleton, Skeleton } from '../components/ui/Skeleton';
import TableToolbar from '../components/ui/TableToolbar';
import ActionBar from '../components/ui/ActionBar';
import { DocumentArrowUpIcon, DocumentArrowDownIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface Job {
    id: string;
    jobId: string;
    name: string;
    description: string;
    status: string;
    startDate?: string;
    endDate?: string;
    billable: boolean;
    project: {
        id: string;
        name: string;
        client: { id: string, name: string };
    };
}

const Jobs: React.FC = () => {
    const { user } = useAuth();
    const { hasPermission } = usePermissions();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [clients, setClients] = useState<any[]>([]);
    const [projects, setProjects] = useState<any[]>([]);
    const [filteredProjects, setFilteredProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  
  // Advanced Filter states
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [billableFilter, setBillableFilter] = useState('all');
  const [clientFilter, setClientFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Bulk Upload states
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<any>(null);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        status: 'Started',
        startDate: '',
        endDate: '',
        billable: 'Billable',
        projectId: '',
        clientId: ''
    });

    const isManager = user?.role === 'Manager' || user?.role === 'Admin' || user?.role === 'manager' || user?.role === 'admin';

    useEffect(() => {
        fetchData();
    }, [searchTerm, statusFilter, billableFilter, clientFilter, projectFilter]);

    useEffect(() => {
        if (formData.clientId) {
            setFilteredProjects(projects.filter(p => p.clientId === formData.clientId));
            setFormData(prev => ({ ...prev, projectId: '' }));
        } else {
            setFilteredProjects([]);
        }
    }, [formData.clientId, projects]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const params: any = {
                q: searchTerm,
                status: statusFilter !== 'All Status' ? statusFilter : undefined,
                clientId: clientFilter !== 'all' ? clientFilter : undefined,
                projectId: projectFilter !== 'all' ? projectFilter : undefined
            };
            if (billableFilter !== 'all') params.billable = billableFilter === 'true';

            const [jobsRes, clientsRes, projectsRes] = await Promise.all([
                API.get('/jobs', { params }),
                API.get('/clients'),
                API.get('/projects')
            ]);
            
            const jobsArr = jobsRes.data?.success ? jobsRes.data.data : jobsRes.data;
            const clientsArr = clientsRes.data?.success ? clientsRes.data.data : clientsRes.data;
            const projectsArr = projectsRes.data?.success ? projectsRes.data.data : projectsRes.data;

            setJobs(Array.isArray(jobsArr) ? jobsArr : []);
            setClients(Array.isArray(clientsArr) ? clientsArr : []);
            setProjects(Array.isArray(projectsArr) ? projectsArr : []);
        } catch (err) {
            console.error('Failed to fetch jobs data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateJob = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!hasPermission('jobs', 'canCreate')) {
            alert('You do not have permission to configure jobs.');
            return;
        }

        if (!formData.name || !formData.projectId || !formData.status) {
            alert('Job Name, Project, and Status are mandatory.');
            return;
        }

        try {
            const jobData = {
                ...formData,
                billable: formData.billable === 'Billable',
                startDate: formData.startDate || null,
                endDate: formData.endDate || null
            };
            await API.post('/jobs', jobData);
            setShowAddModal(false);
            setFormData({
                name: '',
                description: '',
                status: 'Started',
                startDate: '',
                endDate: '',
                billable: 'Billable',
                projectId: '',
                clientId: ''
            });
            fetchData();
        } catch (err: any) {
            console.error('Failed to create job:', err);
            const errorMessage = err.response?.data?.error || err.message || 'Error creating job record.';
            alert(`Error: ${errorMessage}`);
        }
    };

    const handleEditJob = (job: Job) => {
        if (!hasPermission('jobs', 'canEdit')) {
            alert('You do not have permission to modify jobs.');
            return;
        }
        setEditingJob(job);
        setFormData({
            name: job.name,
            description: job.description,
            status: job.status,
            startDate: job.startDate || '',
            endDate: job.endDate || '',
            billable: job.billable ? 'Billable' : 'Non-Billable',
            projectId: job.project.id,
            clientId: job.project.client.id
        });
        setShowEditModal(true);
    };

    const handleUpdateJob = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!hasPermission('jobs', 'canEdit') || !editingJob) {
            alert('You do not have permission to update jobs.');
            return;
        }

        if (!formData.name || !formData.projectId || !formData.status) {
            alert('Job Name, Project, and Status are mandatory.');
            return;
        }

        try {
            const jobData = {
                ...formData,
                billable: formData.billable === 'Billable',
                startDate: formData.startDate || null,
                endDate: formData.endDate || null
            };
            await API.put(`/jobs/${editingJob.id}`, jobData);
            setShowEditModal(false);
            setEditingJob(null);
            setFormData({
                name: '',
                description: '',
                status: 'Started',
                startDate: '',
                endDate: '',
                billable: 'Billable',
                projectId: '',
                clientId: ''
            });
            fetchData();
        } catch (err) {
            console.error('Failed to update job:', err);
            alert('Error updating job record. Please try again.');
        }
    };

    const handleDeleteJob = async (id: string) => {
        if (!hasPermission('jobs', 'canDelete')) {
            alert('You do not have permission to delete jobs.');
            return;
        }
        
        if (window.confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
            try {
                await API.delete(`/jobs/${id}`);
                fetchData();
            } catch (err) {
                console.error('Failed to delete job:', err);
                alert('Error deleting job record. Please try again.');
            }
        }
    };

    const handleExport = async () => {
        try {
            const params: any = {
                q: searchTerm,
                status: statusFilter !== 'All Status' ? statusFilter : undefined,
                clientId: clientFilter !== 'all' ? clientFilter : undefined,
                projectId: projectFilter !== 'all' ? projectFilter : undefined
            };
            if (billableFilter !== 'all') params.billable = billableFilter === 'true';

            const response = await API.get('/jobs/export', {
                params,
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'jobs_export.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error('Export failed:', err);
        }
    };

    const downloadTemplate = async () => {
        try {
            const response = await API.get('/jobs/template/download', {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'job_template.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error('Template download failed:', err);
        }
    };

    const handleBulkUpload = async () => {
        if (!selectedFile) return;
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', selectedFile);
            const res = await API.post('/jobs/bulk-upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setUploadResult(res.data.data);
            fetchData();
        } catch (err) {
            console.error('Bulk upload failed:', err);
        } finally {
            setUploading(false);
        }
    };

    const filteredJobs = jobs; // Backend handles filtering

    return (
        <div className="h-full flex flex-col space-y-6 animate-fade-in max-h-[calc(100vh-120px)] overflow-hidden">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 flex-none">
                <div>
                    <h1 className="text-3xl font-extrabold text-secondary-900 tracking-tight">Job Master</h1>
                    <p className="text-sm font-medium text-secondary-500 mt-1">Define granular deliverables and cost centers for project execution.</p>
                </div>
                <ActionBar
                    onAdd={() => setShowAddModal(true)}
                    addLabel="Configure Job"
                    onUpload={isManager ? () => setShowBulkModal(true) : undefined}
                    onDownload={handleExport}
                    onDownloadTemplate={isManager ? downloadTemplate : undefined}
                />
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-none">
                {loading && jobs.length === 0 ? (
                    [1, 2, 3, 4].map((i) => (
                        <Card key={i} className="p-4 flex items-center gap-4 border-l-4 border-secondary-200">
                             <Skeleton variant="circular" width={48} height={48} />
                             <div className="flex-1">
                                <Skeleton variant="text" width="40%" />
                                <Skeleton variant="text" width="60%" />
                             </div>
                        </Card>
                    ))
                ) : (
                    <>
                        <Card className="p-4 flex items-center gap-4 border-l-4 border-primary-500">
                            <div className="p-3 bg-primary-50 text-primary-600 rounded-xl">
                                <ListBulletIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest">Active Jobs</p>
                                <p className="text-xl font-bold text-secondary-900">{jobs.length}</p>
                            </div>
                        </Card>
                        <Card className="p-4 flex items-center gap-4 border-l-4 border-indigo-500">
                            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                                <CurrencyDollarIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest">Billable Units</p>
                                <p className="text-xl font-bold text-secondary-900">{jobs.filter(j => j.billable).length}</p>
                            </div>
                        </Card>
                        <Card className="p-4 flex items-center gap-4 border-l-4 border-amber-500">
                            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                                <ClockIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest">In-Discussion</p>
                                <p className="text-xl font-bold text-secondary-900">{jobs.filter(j => j.status === 'In-Discussion').length}</p>
                            </div>
                        </Card>
                        <Card className="p-4 flex items-center gap-4 border-l-4 border-emerald-500">
                            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                                <ShieldCheckIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest">Managed Records</p>
                                <p className="text-xl font-bold text-secondary-900">Stable</p>
                            </div>
                        </Card>
                    </>
                )}
            </div>

            <Card className="flex-1 flex flex-col overflow-hidden min-h-0 shadow-lg">
                <TableToolbar
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    showFilters={showAdvancedFilters}
                    setShowFilters={setShowAdvancedFilters}
                    placeholder="Search by Job ID, name or project..."
                    filters={
                        <>
                            <Select
                                label="Status"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="All Status">All Status</option>
                                <option value="Started">Started</option>
                                <option value="In-Discussion">In-Discussion</option>
                                <option value="Completed">Completed</option>
                            </Select>
                            <Select
                                label="Billable"
                                value={billableFilter}
                                onChange={(e) => setBillableFilter(e.target.value)}
                            >
                                <option value="all">All Billing</option>
                                <option value="true">Billable Only</option>
                                <option value="false">Non-Billable Only</option>
                            </Select>
                            <Select
                                label="Client"
                                value={clientFilter}
                                onChange={(e) => setClientFilter(e.target.value)}
                            >
                                <option value="all">All Clients</option>
                                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </Select>
                            <Select
                                label="Project"
                                value={projectFilter}
                                onChange={(e) => setProjectFilter(e.target.value)}
                            >
                                <option value="all">All Projects</option>
                                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </Select>
                        </>
                    }
                />

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 bg-secondary-50/80 backdrop-blur-sm z-10 border-b border-secondary-100">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-bold text-secondary-500 uppercase tracking-widest">Job ID / Cost Center</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-secondary-500 uppercase tracking-widest">Deliverable Name</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-secondary-500 uppercase tracking-widest">Linked Project</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-secondary-500 uppercase tracking-widest">Taxation/Status</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-secondary-500 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-secondary-50">
                            {loading && jobs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-0">
                                        <TableSkeleton rows={10} columns={5} />
                                    </td>
                                </tr>
                            ) : filteredJobs.length > 0 ? (
                                filteredJobs.map((job) => (
                                    <tr key={job.id} className="hover:bg-primary-50/20 group transition-colors">
                                        <td className="px-6 py-5">
                                            <span className="text-xs font-bold text-secondary-900 bg-secondary-100 px-3 py-1.5 rounded-lg border border-secondary-200">{job.jobId}</span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <p className="text-sm font-bold text-secondary-900 leading-tight">{job.name}</p>
                                            <p className="text-[10px] text-secondary-400 font-medium truncate max-w-xs">{job.description || 'No description provided.'}</p>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 bg-indigo-50 text-indigo-600 rounded flex items-center justify-center text-[10px] font-bold">PR</div>
                                                <div>
                                                    <p className="text-xs font-bold text-secondary-800">{job.project?.name || 'N/A'}</p>
                                                    <p className="text-[10px] font-bold text-secondary-400 uppercase">{job.project?.client?.name || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="space-y-1.5">
                                                <StatusBadge status={job.status === 'Completed' ? 'active' : job.status === 'Started' ? 'active' : 'inactive'} />
                                                <p className="text-[10px] font-bold text-secondary-400 uppercase">{job.billable ? 'Billable' : 'Non-Billable'}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {hasPermission('jobs', 'canEdit') && (
                                                    <button 
                                                        onClick={() => handleEditJob(job)}
                                                        title="Edit Job"
                                                        aria-label="Edit Job"
                                                        className="p-2 text-secondary-400 hover:text-primary-600 rounded-lg border border-transparent hover:border-secondary-100 hover:bg-white shadow-sm transition-all focus:outline-none"
                                                    >
                                                        <PencilSquareIcon className="w-4 h-4" />
                                                    </button>
                                                )}
                                                {hasPermission('jobs', 'canDelete') && (
                                                    <button 
                                                        onClick={() => handleDeleteJob(job.id)}
                                                        title="Delete Job"
                                                        aria-label="Delete Job"
                                                        className="p-2 text-secondary-400 hover:text-danger-600 rounded-lg border border-transparent hover:border-secondary-100 hover:bg-white shadow-sm transition-all focus:outline-none"
                                                    >
                                                        <TrashIcon className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="py-20 text-center opacity-40 italic font-bold">
                                        No job masters discovered.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Add Job Modal */}
            <Modal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                title="Create Job Master Record"
                size="lg"
            >
                <form onSubmit={handleCreateJob} className="space-y-5 pt-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <Select
                            label="Select Client Registry *"
                            value={formData.clientId}
                            onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                            required
                        >
                            <option value="">{loading ? "Loading clients..." : "Select a Client..."}</option>
                            {clients.length > 0 ? (
                                clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)
                            ) : !loading && (
                                <option disabled>No clients found</option>
                            )}
                        </Select>
                        <Select
                            label="Linked Project Master *"
                            value={formData.projectId}
                            onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                            required
                            disabled={!formData.clientId || loading}
                        >
                            <option value="">{loading ? "Loading projects..." : "Select a Project..."}</option>
                            {filteredProjects.length > 0 ? (
                                filteredProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)
                            ) : !loading && formData.clientId && (
                                <option disabled>No projects found</option>
                            )}
                        </Select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <Input
                            label="Job / Deliverable Name *"
                            placeholder="e.g. Documentation Review"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                        <Select
                            label="Job Status *"
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            required
                        >
                            <option value="Started">Started</option>
                            <option value="In-Discussion">In-Discussion</option>
                            <option value="Completed">Completed</option>
                        </Select>
                    </div>

                    <Input
                        label="Detailed Job Description"
                        placeholder="Outline scope of work..."
                        multiline
                        rows={3}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <Input
                            label="Start Date"
                            type="date"
                            value={formData.startDate}
                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        />
                        <Input
                            label="End Date"
                            type="date"
                            value={formData.endDate}
                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        />
                        <Select
                            label="Billing Type *"
                            value={formData.billable}
                            onChange={(e) => setFormData({ ...formData, billable: e.target.value })}
                            required
                        >
                            <option value="Billable">Billable</option>
                            <option value="Non-Billable">Non-Billable</option>
                        </Select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                        <Input
                            label="Unique Job ID / Cost Center"
                            value="SYSTEM-GENERATED"
                            disabled
                        />
                    </div>

                    <div className="pt-6 flex gap-4">
                        <Button
                            type="button"
                            variant="secondary"
                            fullWidth
                            onClick={() => setShowAddModal(false)}
                            className="h-12 border-secondary-200"
                        >
                            Cancel Entry
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            fullWidth
                            className="h-12 font-extrabold shadow-md shadow-primary-500/10"
                        >
                            Establish Job Master
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
        title="Bulk Job Import"
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
                    <li>Required columns: <strong>name, projectName</strong></li>
                    <li>Optional: status (Started/Completed/In-Discussion), billable (Yes/No), startDate, description</li>
                    <li>Download the template to see the correct format.</li>
                  </ul>
                </div>
              </div>
              <input
                type="file"
                accept=".xlsx"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="w-full p-3 border-2 border-dashed border-primary-200 rounded-xl"
                title="Select Job Excel File"
                aria-label="Upload Job Template"
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
    </div>
  );
};

export default Jobs;
