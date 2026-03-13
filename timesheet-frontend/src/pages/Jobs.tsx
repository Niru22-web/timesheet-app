import React, { useState, useEffect } from 'react';
import API from '../api';
import { useAuth } from '../contexts/AuthContext';
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
    const [jobs, setJobs] = useState<Job[]>([]);
    const [clients, setClients] = useState<any[]>([]);
    const [projects, setProjects] = useState<any[]>([]);
    const [filteredProjects, setFilteredProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);

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
    }, []);

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
            const [jobsRes, clientsRes, projectsRes] = await Promise.all([
                API.get('/jobs'),
                API.get('/clients'),
                API.get('/projects')
            ]);
            setJobs(jobsRes.data);
            setClients(clientsRes.data);
            setProjects(projectsRes.data);
        } catch (err) {
            console.error('Failed to fetch jobs data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateJob = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isManager) return;

        if (!formData.name || !formData.projectId || !formData.status) {
            alert('Job Name, Project, and Status are mandatory.');
            return;
        }

        try {
            await API.post('/jobs', formData);
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
        } catch (err) {
            console.error('Failed to create job:', err);
            alert('Error creating job record.');
        }
    };

    const handleEditJob = (job: Job) => {
        if (!isManager) return;
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
        if (!isManager || !editingJob) return;

        if (!formData.name || !formData.projectId || !formData.status) {
            alert('Job Name, Project, and Status are mandatory.');
            return;
        }

        try {
            await API.put(`/jobs/${editingJob.id}`, formData);
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
        if (!isManager) return;
        
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

    const filteredJobs = jobs.filter(j =>
        j.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        j.jobId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        j.project?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="h-full flex flex-col space-y-6 animate-fade-in max-h-[calc(100vh-120px)] overflow-hidden">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 flex-none">
                <div>
                    <h1 className="text-3xl font-extrabold text-secondary-900 tracking-tight">Job Master</h1>
                    <p className="text-sm font-medium text-secondary-500 mt-1">Define granular deliverables and cost centers for project execution.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="secondary" size="sm" className="h-10 border-secondary-200" onClick={fetchData}>
                        Refresh Masters
                    </Button>
                    {isManager && (
                        <Button
                            variant="primary"
                            size="sm"
                            className="h-10 px-6 font-bold"
                            onClick={() => setShowAddModal(true)}
                            leftIcon={<PlusIcon className="w-4 h-4" />}
                        >
                            Configure Job
                        </Button>
                    )}
                </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-none">
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
            </div>

            <Card className="flex-1 flex flex-col overflow-hidden min-h-0 shadow-lg">
                <div className="p-4 border-b border-secondary-100 flex items-center gap-4">
                    <div className="flex-1 relative group">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400 group-focus-within:text-primary-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search by Job ID, name or project..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-secondary-50/50 border border-secondary-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
                        />
                    </div>
                </div>

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
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
                                            <p className="text-sm font-bold text-secondary-400">Loading master jobs...</p>
                                        </div>
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
                                                    <p className="text-xs font-bold text-secondary-800">{job.project?.name}</p>
                                                    <p className="text-[10px] font-bold text-secondary-400 uppercase">{job.project?.client?.name}</p>
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
                                                <button 
                                                    onClick={() => handleEditJob(job)}
                                                    className="p-2 text-secondary-400 hover:text-primary-600 rounded-lg border border-transparent hover:border-secondary-100 hover:bg-white shadow-sm transition-all focus:outline-none"
                                                >
                                                    <PencilSquareIcon className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteJob(job.id)}
                                                    className="p-2 text-secondary-400 hover:text-danger-600 rounded-lg border border-transparent hover:border-secondary-100 hover:bg-white shadow-sm transition-all focus:outline-none"
                                                >
                                                    <TrashIcon className="w-4 h-4" />
                                                </button>
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
                            <option value="">Select a Client...</option>
                            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </Select>
                        <Select
                            label="Linked Project Master *"
                            value={formData.projectId}
                            onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                            required
                            disabled={!formData.clientId}
                        >
                            <option value="">Select a Project...</option>
                            {filteredProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
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
        </div>
    );
};

export default Jobs;
