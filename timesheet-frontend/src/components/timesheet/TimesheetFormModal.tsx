import React, { useState, useEffect, useMemo } from 'react';
import { X, Clock, Zap, RefreshCw } from 'lucide-react';
import { Switch } from '@headlessui/react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import API from '../../api';
import { toast } from 'react-toastify';

interface Timelog {
  id: string;
  hours: number;
  description: string;
  date: string;
  workItem?: string;
  billableStatus?: string;
  job: {
    id: string;
    jobId: string;
    name: string;
    project: {
      id: string;
      name: string;
      clientId: string;
      client: { id: string, name: string };
    }
  };
}

interface TimesheetFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingEntry: Timelog | null;
  selectedDate?: Date;
}

const TimesheetFormModal: React.FC<TimesheetFormModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  editingEntry,
  selectedDate
}) => {
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    clientId: '',
    projectId: '',
    jobId: '',
    workItem: '',
    hours: '',
    hoursInputMethod: 'totalHours',
    description: '',
    date: new Date().toISOString().split('T')[0],
    isBillable: true
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset/Initialize form when modal opens or editingEntry changes
  useEffect(() => {
    if (isOpen) {
      if (editingEntry) {
        setFormData({
          clientId: editingEntry.job.project.client.id,
          projectId: editingEntry.job.project.id,
          jobId: editingEntry.job.id,
          workItem: editingEntry.workItem || '',
          hours: editingEntry.hours.toFixed(2),
          hoursInputMethod: 'totalHours',
          description: editingEntry.description,
          date: editingEntry.date.split('T')[0],
          isBillable: editingEntry.billableStatus !== 'non_billable'
        });
      } else {
        setFormData({
          clientId: '',
          projectId: '',
          jobId: '',
          workItem: '',
          hours: '',
          hoursInputMethod: 'totalHours',
          description: '',
          date: selectedDate ? selectedDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          isBillable: true
        });
      }
      setErrors({});
      fetchMasters();
    }
  }, [isOpen, editingEntry, selectedDate]);

  const fetchMasters = async () => {
    try {
      const clientsRes = await API.get('/clients');
      setClients(clientsRes.data?.data || []);
      
      const projectsRes = await API.get('/projects');
      setProjects(projectsRes.data?.data || []);
      
      const jobsRes = await API.get('/jobs');
      setJobs(jobsRes.data?.data || []);
    } catch (err) {
      console.error('Failed to fetch master data', err);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.clientId) newErrors.clientId = 'Client is required';
    if (!formData.projectId) newErrors.projectId = 'Project is required';
    if (!formData.jobId) newErrors.jobId = 'Job is required';
    if (!formData.hours) newErrors.hours = 'Log duration is required';
    
    // Max 24 hours per day
    const hoursNum = parseFloat(formData.hours);
    if (isNaN(hoursNum) || hoursNum <= 0) newErrors.hours = 'Enter valid hours';
    if (hoursNum > 24) newErrors.hours = 'Max 24 hours allowed';
    
    if (!formData.description) newErrors.description = 'Summary is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      if (editingEntry) {
        await API.put(`/timelogs/${editingEntry.id}`, formData);
        toast.success('Time entry updated!');
      } else {
        await API.post('/timelogs', formData);
        toast.success('Time log committed!');
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to save entry');
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = useMemo(() => {
    if (!formData.clientId) return [];
    return projects.filter(p => p.clientId === formData.clientId);
  }, [formData.clientId, projects]);

  const filteredJobs = useMemo(() => {
    if (!formData.projectId) return [];
    return jobs.filter(j => j.projectId === formData.projectId);
  }, [formData.projectId, jobs]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingEntry ? 'Edit Time Entry' : 'Add Time Entry'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-5 pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input 
            label="Date"
            type="date"
            value={formData.date}
            onChange={(e) => handleInputChange('date', e.target.value)}
            required
          />
          <div className="flex flex-col space-y-1.5">
            <label className="text-xs font-bold text-secondary-500 uppercase tracking-widest pl-1">Duration (Hours)</label>
            <Input 
              placeholder="e.g. 8.5"
              value={formData.hours}
              error={errors.hours}
              onChange={(e) => handleInputChange('hours', e.target.value)}
              className="font-mono font-bold"
            />
          </div>
        </div>

        <Select
          label="Client"
          value={formData.clientId}
          error={errors.clientId}
          onChange={(e) => handleInputChange('clientId', e.target.value)}
          required
        >
          <option value="">Select Client</option>
          {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </Select>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Project"
            value={formData.projectId}
            error={errors.projectId}
            onChange={(e) => handleInputChange('projectId', e.target.value)}
            disabled={!formData.clientId}
            required
          >
            <option value="">Select Project</option>
            {filteredProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </Select>

          <Select
            label="Job / Task Type"
            value={formData.jobId}
            error={errors.jobId}
            onChange={(e) => handleInputChange('jobId', e.target.value)}
            disabled={!formData.projectId}
            required
          >
            <option value="">Select Job</option>
            {filteredJobs.map(j => <option key={j.id} value={j.id}>{j.name}</option>)}
          </Select>
        </div>

        <Input 
          label="Task Summary"
          placeholder="Brief title of what you did..."
          value={formData.workItem}
          onChange={(e) => handleInputChange('workItem', e.target.value)}
        />

        <Input 
          label="Detailed Description"
          placeholder="What exactly did you work on?"
          multiline
          rows={3}
          error={errors.description}
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          required
        />

        <div className="flex items-center justify-between p-3 bg-secondary-50 rounded-xl">
          <div className="flex items-center gap-2">
            <Zap className={`w-4 h-4 ${formData.isBillable ? 'text-primary-500' : 'text-secondary-300'}`} />
            <span className="text-sm font-bold text-secondary-700">Billable to Client</span>
          </div>
          <Switch
            checked={formData.isBillable}
            onChange={(val) => handleInputChange('isBillable', val)}
            className={`${formData.isBillable ? 'bg-primary-600' : 'bg-secondary-200'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none`}
          >
            <span className={`${formData.isBillable ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
          </Switch>
        </div>

        <div className="pt-4 flex gap-3">
          <Button type="button" variant="secondary" fullWidth onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" fullWidth isLoading={loading}>
            {editingEntry ? 'Update Entry' : 'Log Time'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default TimesheetFormModal;
