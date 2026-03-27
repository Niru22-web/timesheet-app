import React, { useState, useEffect } from 'react';
import API from '../api';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../contexts/PermissionsContext';
import {
  BriefcaseIcon,
  UsersIcon,
  CalendarIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  IdentificationIcon,
  CurrencyDollarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

// UI Components
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import StatusBadge from '../components/ui/StatusBadge';
import Modal from '../components/ui/Modal';
import Select from '../components/ui/Select';
import Avatar from '../components/ui/Avatar';
import { TableSkeleton, Skeleton } from '../components/ui/Skeleton';

interface Project {
  id: string;
  projectId: string;
  name: string;
  status: string;
  startDate: string;
  billable: boolean;
  contactPerson: string;
  createdBy: string;
  clientId: string;
  client: { name: string };
  users: Array<{ employee: { id: string, name: string } }>;
}

const Projects: React.FC = () => {
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]); // For team assignment (filtered)
  const [allEmployees, setAllEmployees] = useState<any[]>([]); // For dropdown (all employees)
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [generatedProjectId, setGeneratedProjectId] = useState<string>('');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    clientId: '',
    status: 'Started',
    startDate: new Date().toISOString().split('T')[0],
    billable: 'Billable',
    contactPerson: '',
    assignedUsers: [] as string[]
  });

  const isManager = user?.role === 'Manager' || user?.role === 'Admin' || user?.role === 'manager' || user?.role === 'admin';

  useEffect(() => {
    fetchData();
  }, []);

  const generateProjectId = async () => {
    try {
      const response = await API.get('/projects');
      const projectList = response.data?.success ? response.data.data : response.data;
      const projectCount = Array.isArray(projectList) ? projectList.length : 0;
      const newId = `PRJ${String(projectCount + 1).padStart(4, '0')}`;
      setGeneratedProjectId(newId);
    } catch (err) {
      console.error('Failed to generate project ID:', err);
      setGeneratedProjectId('PRJ0001');
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('Fetching project data...');
      const [projectsRes, clientsRes, employeesRes, allEmployeesRes] = await Promise.all([
        API.get('/projects'),
        API.get('/clients'),
        API.get('/employees'), // Filtered by user role
        API.get('/employees?all=true') // For dropdown (all employees in the firm)
      ]);
      console.log('API responses:', {
        projects: projectsRes.data,
        clients: clientsRes.data,
        employees: employeesRes.data,
        allEmployees: allEmployeesRes.data
      });
      const projectsArr = projectsRes.data?.success ? projectsRes.data.data : projectsRes.data;
      const clientsArr = clientsRes.data?.success ? clientsRes.data.data : clientsRes.data;
      const employeesArr = employeesRes.data?.success ? employeesRes.data.data : employeesRes.data;
      const allEmployeesArr = allEmployeesRes.data?.success ? allEmployeesRes.data.data : allEmployeesRes.data;

      setProjects(Array.isArray(projectsArr) ? projectsArr : []);
      setClients(Array.isArray(clientsArr) ? clientsArr : []);
      setEmployees(Array.isArray(employeesArr) ? employeesArr : []);
      setAllEmployees(Array.isArray(allEmployeesArr) ? allEmployeesArr : []);
    } catch (err) {
      console.error('Failed to fetch project data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasPermission('projects', 'canCreate')) {
      alert('You do not have permission to initiate projects.');
      return;
    }

    // Validation
    if (!formData.name || !formData.clientId || !formData.startDate) {
      alert('Please fill all mandatory fields.');
      return;
    }

    try {
      const projectData = {
        ...formData,
        billable: formData.billable === 'Billable',
        projectId: generatedProjectId
      };
      const response = await API.post('/projects', projectData);
      console.log('Project creation response:', response.data);
      setShowAddModal(false);
      setFormData({
        name: '',
        clientId: '',
        status: 'Started',
        startDate: new Date().toISOString().split('T')[0],
        billable: 'Billable',
        contactPerson: '',
        assignedUsers: []
      });
      setGeneratedProjectId(''); // Reset project ID
      fetchData(); // Refresh data immediately
    } catch (err) {
      console.error('Failed to create project:', err);
      alert('Error creating project. Ensure all mandatory fields are correctly filled.');
    }
  };

  const handleEditProject = (project: Project) => {
    if (!hasPermission('projects', 'canEdit')) {
      alert('You do not have permission to modify projects.');
      return;
    }
    setEditingProject(project);
    setFormData({
      name: project.name,
      clientId: project.clientId,
      status: project.status,
      startDate: project.startDate,
      billable: project.billable ? 'Billable' : 'Non-Billable',
      contactPerson: project.contactPerson,
      assignedUsers: project.users?.map(u => u.employee.id) || []
    });
    setShowEditModal(true);
  };

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasPermission('projects', 'canEdit') || !editingProject) {
      alert('You do not have permission to update projects.');
      return;
    }

    // Validation
    if (!formData.name || !formData.clientId || !formData.startDate) {
      alert('Please fill all mandatory fields.');
      return;
    }

    try {
      const projectData = {
        ...formData,
        billable: formData.billable === 'Billable',
        projectId: editingProject.projectId
      };
      await API.put(`/projects/${editingProject.id}`, projectData);
      setShowEditModal(false);
      setEditingProject(null);
      setFormData({
        name: '',
        clientId: '',
        status: 'Started',
        startDate: new Date().toISOString().split('T')[0],
        billable: 'Billable',
        contactPerson: '',
        assignedUsers: []
      });
      fetchData(); // Refresh data immediately
    } catch (err) {
      console.error('Failed to update project:', err);
      alert('Error updating project. Please try again.');
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!hasPermission('projects', 'canDelete')) {
      alert('You do not have permission to delete projects.');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      try {
        await API.delete(`/projects/${id}`);
        fetchData(); // Refresh data immediately
      } catch (err) {
        console.error('Failed to delete project:', err);
        alert('Error deleting project. Please try again.');
      }
    }
  };

  const filteredProjects = projects.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.projectId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col space-y-6 animate-fade-in max-h-[calc(100vh-120px)] overflow-hidden">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 flex-none">
        <div>
          <h1 className="text-3xl font-extrabold text-secondary-900 tracking-tight">Project Master</h1>
          <p className="text-sm font-medium text-secondary-500 mt-1">Configure enterprise engagements and core delivery teams.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" className="h-10 border-secondary-200" onClick={fetchData}>
            Refresh Database
          </Button>
          {hasPermission('projects', 'canCreate') && (
            <Button
              variant="primary"
              size="sm"
              className="h-10 px-6 font-bold"
              onClick={() => {
                generateProjectId();
                setShowAddModal(true);
              }}
              leftIcon={<PlusIcon className="w-4 h-4" />}
            >
              Initiate Project
            </Button>
          )}
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-none">
        {loading && projects.length === 0 ? (
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
                <BriefcaseIcon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest">Active Projects</p>
                <p className="text-xl font-bold text-secondary-900">{projects.length}</p>
              </div>
            </Card>
            <Card className="p-4 flex items-center gap-4 border-l-4 border-indigo-500">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                <UserGroupIcon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest">Billable Teams</p>
                <p className="text-xl font-bold text-secondary-900">{projects.filter(p => p.billable).length}</p>
              </div>
            </Card>
            <Card className="p-4 flex items-center gap-4 border-l-4 border-amber-500">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                <ClockIcon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest">In-Discussion</p>
                <p className="text-xl font-bold text-secondary-900">{projects.filter(p => p.status === 'In-Discussion').length}</p>
              </div>
            </Card>
            <Card className="p-4 flex items-center gap-4 border-l-4 border-emerald-500">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <ShieldCheckIcon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest">Completed</p>
                <p className="text-xl font-bold text-secondary-900">{projects.filter(p => p.status === 'Completed').length}</p>
              </div>
            </Card>
          </>
        )}
      </div>

      {/* Search and Table */}
      <Card className="flex-1 flex flex-col overflow-hidden min-h-0 shadow-lg">
        <div className="p-4 border-b border-secondary-100">
          <div className="relative group">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400 group-focus-within:text-primary-500 transition-colors" />
            <input
              type="text"
              placeholder="Search by project name, ID or client..."
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
                <th className="px-6 py-4 text-[10px] font-bold text-secondary-500 uppercase tracking-widest">Project / Client</th>
                <th className="px-6 py-4 text-[10px] font-bold text-secondary-500 uppercase tracking-widest">Status / Billing</th>
                <th className="px-6 py-4 text-[10px] font-bold text-secondary-500 uppercase tracking-widest">Team Allocation</th>
                <th className="px-6 py-4 text-[10px] font-bold text-secondary-500 uppercase tracking-widest">Timeline</th>
                <th className="px-6 py-4 text-[10px] font-bold text-secondary-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-50">
              {loading && projects.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-0">
                    <TableSkeleton rows={10} columns={5} />
                  </td>
                </tr>
              ) : filteredProjects.length > 0 ? (
                filteredProjects.map((project) => (
                  <tr key={project.id} className="hover:bg-primary-50/20 group transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center font-bold text-xs">
                          {project.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-secondary-900 leading-tight">{project.name}</p>
                          <p className="text-[10px] font-bold text-secondary-400 uppercase tracking-wider">{project.projectId} • {project.client.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="space-y-1.5">
                        <StatusBadge status={project.status === 'Completed' ? 'active' : project.status === 'Started' ? 'active' : 'inactive'} />
                        <p className="text-[10px] font-bold text-secondary-400 uppercase">{project.billable ? 'Billable Resource' : 'Non-Billable'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex -space-x-2">
                        {project.users?.slice(0, 3).map((u, i) => (
                          <Avatar key={i} name={u.employee.name} size="sm" border />
                        ))}
                        {project.users?.length > 3 && (
                          <div className="w-7 h-7 rounded-full bg-secondary-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-secondary-600">
                            +{project.users.length - 3}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-xs font-bold text-secondary-700">Started {new Date(project.startDate).toLocaleDateString()}</p>
                      <p className="text-[10px] font-bold text-secondary-400 uppercase mt-0.5">Contact: {project.contactPerson || 'N/A'}</p>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {hasPermission('projects', 'canEdit') && (
                          <button 
                            onClick={() => handleEditProject(project)}
                            className="p-2 text-secondary-400 hover:text-primary-600 rounded-lg border border-transparent hover:border-secondary-100 hover:bg-white shadow-sm transition-all focus:outline-none"
                          >
                            <PencilSquareIcon className="w-4 h-4" />
                          </button>
                        )}
                        {hasPermission('projects', 'canDelete') && (
                          <button 
                            onClick={() => handleDeleteProject(project.id)}
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
                    No matching project masters detected.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Project Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Initiate Project Master"
        size="lg"
      >
        <form onSubmit={handleCreateProject} className="space-y-3 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Select Client *"
              value={formData.clientId}
              onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
              required
            >
              <option value="">{loading ? "Loading clients..." : "Choose a Client Registry"}</option>
              {clients.length > 0 ? (
                clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)
              ) : !loading && (
                <option disabled>No clients found</option>
              )}
            </Select>
            <Input
              label="Project Title *"
              placeholder="e.g. Statutory Audit FY 2024-25"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Select
              label="Project Status *"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              required
            >
              <option value="Started">Started</option>
              <option value="In-Discussion">In-Discussion</option>
              <option value="Completed">Completed</option>
            </Select>
            <Input
              label="Start Date *"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              required
            />
            <Select
              label="Billing Category *"
              value={formData.billable}
              onChange={(e) => setFormData({ ...formData, billable: e.target.value })}
              required
            >
              <option value="Billable">Billable</option>
              <option value="Non-Billable">Non-Billable</option>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Client Contact Person"
              placeholder="Primary Point of Contact"
              value={formData.contactPerson}
              onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
              leftIcon={<IdentificationIcon />}
            />
            <Input
              label="Commissioned By"
              value={user?.name || 'System User'}
              disabled
              placeholder="Captured from session"
              leftIcon={<ShieldCheckIcon />}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-secondary-700 block ml-0.5">Assign Delivery Team (Optional)</label>
            <Select
              value=""
              onChange={(e) => {
                if (e.target.value && !formData.assignedUsers.includes(e.target.value)) {
                  setFormData(prev => ({
                    ...prev,
                    assignedUsers: [...prev.assignedUsers, e.target.value]
                  }));
                }
              }}
            >
              <option value="" disabled>Choose team members...</option>
              {allEmployees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.firstName} {emp.lastName} ({emp.employeeId})
                </option>
              ))}
            </Select>
            
            {/* Show selected team members */}
            <div className="mt-2 flex flex-wrap gap-2">
              {formData.assignedUsers.map(userId => {
                const emp = allEmployees.find(e => e.id === userId);
                return emp ? (
                  <div key={userId} className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-medium">
                    {emp.firstName} {emp.lastName}
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          assignedUsers: prev.assignedUsers.filter(id => id !== userId)
                        }));
                      }}
                      className="ml-1 text-primary-500 hover:text-primary-700"
                    >
                      ×
                    </button>
                  </div>
                ) : null;
              })}
            </div>
            <p className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest pl-1">{formData.assignedUsers.length} Resource(s) Allocated</p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <Input
              label="Unique Project ID"
              value={generatedProjectId || 'Click "Initiate Project" to generate ID'}
              disabled
              placeholder="PRJ-0001 format (auto-generated)"
            />
          </div>

          <div className="pt-3 flex gap-3">
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={() => setShowAddModal(false)}
              className="h-9 border-secondary-200"
            >
              Cancel Setup
            </Button>
            <Button
              type="submit"
              variant="primary"
              fullWidth
              className="h-9 font-extrabold shadow-md shadow-primary-500/10"
            >
              Initiate Project Record
            </Button>
          </div>
        </form>
      </Modal>
      
      {/* Edit Project Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingProject(null);
          setFormData({
            name: '',
            clientId: '',
            status: 'Started',
            startDate: new Date().toISOString().split('T')[0],
            billable: 'Billable',
            contactPerson: '',
            assignedUsers: []
          });
        }}
        title="Modify Project Master"
        size="lg"
      >
        <form onSubmit={handleUpdateProject} className="space-y-3 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Select Client *"
              value={formData.clientId}
              onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
              required
            >
              <option value="">{loading ? "Loading clients..." : "Choose a Client Registry"}</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
            <Input
              label="Project Title *"
              placeholder="e.g. Statutory Audit FY 2024-25"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Select
              label="Project Status *"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              required
            >
              <option value="Started">Started</option>
              <option value="In-Discussion">In-Discussion</option>
              <option value="Completed">Completed</option>
            </Select>
            <Input
              label="Start Date *"
              type="date"
              value={formData.startDate ? formData.startDate.split('T')[0] : ''}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              required
            />
            <Select
              label="Billing Category *"
              value={formData.billable}
              onChange={(e) => setFormData({ ...formData, billable: e.target.value })}
              required
            >
              <option value="Billable">Billable</option>
              <option value="Non-Billable">Non-Billable</option>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Client Contact Person"
              placeholder="Primary Point of Contact"
              value={formData.contactPerson}
              onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
              leftIcon={<IdentificationIcon />}
            />
            <Input
              label="Commissioned By"
              value={user?.name || 'System User'}
              disabled
              placeholder="Captured from session"
              leftIcon={<ShieldCheckIcon />}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-secondary-700 block ml-0.5">Assign Delivery Team (Optional)</label>
            <Select
              value=""
              onChange={(e) => {
                if (e.target.value && !formData.assignedUsers.includes(e.target.value)) {
                  setFormData(prev => ({
                    ...prev,
                    assignedUsers: [...prev.assignedUsers, e.target.value]
                  }));
                }
              }}
            >
              <option value="" disabled>Choose team members...</option>
              {allEmployees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.firstName} {emp.lastName} ({emp.employeeId})
                </option>
              ))}
            </Select>
            
            {/* Show selected team members */}
            <div className="mt-2 flex flex-wrap gap-2">
              {formData.assignedUsers.map(userId => {
                const emp = allEmployees.find(e => e.id === userId);
                return emp ? (
                  <div key={userId} className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-medium">
                    {emp.firstName} {emp.lastName}
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          assignedUsers: prev.assignedUsers.filter(id => id !== userId)
                        }));
                      }}
                      className="ml-1 text-primary-500 hover:text-primary-700"
                    >
                      ×
                    </button>
                  </div>
                ) : null;
              })}
            </div>
            <p className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest pl-1">{formData.assignedUsers.length} Resource(s) Allocated</p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <Input
              label="Unique Project ID"
              value={editingProject?.projectId || ''}
              disabled
              placeholder="Auto-assigned ID"
            />
          </div>

          <div className="pt-3 flex gap-3">
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={() => {
                setShowEditModal(false);
                setEditingProject(null);
              }}
              className="h-9 border-secondary-200"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              fullWidth
              className="h-9 font-extrabold shadow-md shadow-primary-500/10"
            >
              Update Project Record
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Projects;
