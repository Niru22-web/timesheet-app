import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { format } from 'date-fns';
import { X, Clock, Briefcase, Zap, Save, ChevronRight, Hash, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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

interface TimesheetDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingEntry: Timelog | null;
  selectedDate?: Date;
}

const TimesheetDrawer: React.FC<TimesheetDrawerProps> = ({ 
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
    description: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    isBillable: true
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      if (editingEntry) {
        setFormData({
          clientId: editingEntry.job.project.client.id,
          projectId: editingEntry.job.project.id,
          jobId: editingEntry.job.id,
          workItem: editingEntry.workItem || '',
          hours: editingEntry.hours.toFixed(2),
          description: editingEntry.description,
          date: editingEntry.date.split('T')[0],
          isBillable: editingEntry.billableStatus !== 'non_billable'
        });
      } else {
        const lastProject = localStorage.getItem('last_project_id');
        const lastClient = localStorage.getItem('last_client_id');
        
        setFormData({
          clientId: lastClient || '',
          projectId: lastProject || '',
          jobId: '',
          workItem: '',
          hours: '',
          description: '',
          date: format(selectedDate || new Date(), 'yyyy-MM-dd'),
          isBillable: true
        });
      }
      setErrors({});
      fetchMasters();
    }
  }, [isOpen, editingEntry, selectedDate]);

  const fetchMasters = async () => {
    try {
      const [cRes, pRes, jRes] = await Promise.all([
        API.get('/clients'),
        API.get('/projects'),
        API.get('/jobs')
      ]);
      setClients(cRes.data?.data || []);
      setProjects(pRes.data?.data || []);
      setJobs(jRes.data?.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const validateForm = () => {
    const nextErrors: Record<string, string> = {};
    if (!formData.clientId) nextErrors.clientId = 'Required';
    if (!formData.projectId) nextErrors.projectId = 'Required';
    if (!formData.jobId) nextErrors.jobId = 'Required';
    if (!formData.hours || isNaN(parseFloat(formData.hours))) nextErrors.hours = 'Invalid';
    if (parseFloat(formData.hours) > 24) nextErrors.hours = 'Max 24h';
    if (!formData.description) nextErrors.description = 'Summary required';
    
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      if (editingEntry) {
        await API.put(`/timelogs/${editingEntry.id}`, formData);
        toast.success('Log updated');
      } else {
        await API.post('/timelogs', formData);
        localStorage.setItem('last_project_id', formData.projectId);
        localStorage.setItem('last_client_id', formData.clientId);
        toast.success('Time logged successfully');
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Transition.Root show={isOpen} as={React.Fragment}>
      <Dialog as="div" className="relative z-[999]" onClose={onClose}>
        <Transition.Child
          as={React.Fragment}
          enter="ease-in-out duration-500"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-500"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 md:pl-16">
              <Transition.Child
                as={React.Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                   <div className="flex h-full flex-col overflow-y-auto bg-white shadow-xl">
                      <div className="px-6 py-4 border-b flex items-center justify-between">
                        <Dialog.Title className="text-xl font-bold">
                          {editingEntry ? 'Edit Timelog' : 'Add Timelog'}
                        </Dialog.Title>
                        <button type="button" onClick={onClose} aria-label="Close" className="p-2 text-gray-500 hover:text-gray-700">
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                      
                      <div className="flex-1 p-6">
                        <form className="space-y-4">
                           <div className="space-y-1">
                             <label htmlFor="clientId" className="text-sm font-medium text-gray-700">Client</label>
                             <select 
                               id="clientId"
                               className="w-full border p-2 rounded text-sm bg-white"
                               value={formData.clientId}
                               onChange={(e) => {
                                 const clientId = e.target.value;
                                 setFormData({...formData, clientId, projectId: '', jobId: ''});
                               }}
                             >
                                <option value="">Select Client</option>
                                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                             </select>
                             {errors.clientId && <p className="text-xs text-red-500 mt-1">{errors.clientId}</p>}
                           </div>

                           <div className="space-y-1">
                             <label htmlFor="projectId" className="text-sm font-medium text-gray-700">Project <span className="text-red-500">*</span></label>
                             <select 
                               id="projectId"
                               className="w-full border p-2 rounded text-sm bg-white"
                               value={formData.projectId}
                               disabled={!formData.clientId && clients.length > 0}
                               onChange={(e) => {
                                 const projectId = e.target.value;
                                 setFormData({...formData, projectId, jobId: ''});
                               }}
                             >
                                <option value="">Select Project</option>
                                {projects.filter(p => !formData.clientId || p.clientId === formData.clientId).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                             </select>
                             {errors.projectId && <p className="text-xs text-red-500 mt-1">{errors.projectId}</p>}
                           </div>

                           <div className="space-y-1">
                             <label htmlFor="jobId" className="text-sm font-medium text-gray-700">Job <span className="text-red-500">*</span></label>
                             <select 
                               id="jobId"
                               className="w-full border p-2 rounded text-sm bg-white"
                               value={formData.jobId}
                               disabled={!formData.projectId}
                               onChange={(e) => setFormData({...formData, jobId: e.target.value})}
                             >
                                <option value="">Select Job</option>
                                {jobs.filter(j => j.projectId === formData.projectId).map(j => <option key={j.id} value={j.id}>{j.name}</option>)}
                             </select>
                             {errors.jobId && <p className="text-xs text-red-500 mt-1">{errors.jobId}</p>}
                           </div>

                           <div className="flex gap-4">
                             <div className="space-y-1 flex-1">
                               <label htmlFor="date" className="text-sm font-medium text-gray-700">Date <span className="text-red-500">*</span></label>
                               <input 
                                 id="date"
                                 type="date"
                                 className="w-full border p-2 rounded text-sm"
                                 value={formData.date}
                                 onChange={(e) => setFormData({...formData, date: e.target.value})}
                               />
                             </div>
                             
                             <div className="space-y-1 flex-1">
                               <label htmlFor="hours" className="text-sm font-medium text-gray-700">Hours <span className="text-red-500">*</span></label>
                               <input 
                                 id="hours"
                                 type="text" 
                                 placeholder="e.g. 8.5"
                                 className="w-full border p-2 rounded text-sm"
                                 value={formData.hours}
                                 onChange={(e) => setFormData({...formData, hours: e.target.value})}
                               />
                               {errors.hours && <p className="text-xs text-red-500 mt-1">{errors.hours}</p>}
                             </div>
                           </div>

                           <div className="space-y-1">
                             <label htmlFor="description" className="text-sm font-medium text-gray-700">Work Description <span className="text-red-500">*</span></label>
                             <textarea 
                               id="description"
                               placeholder="Work Description"
                               className="w-full border p-2 rounded text-sm min-h-[100px]"
                               value={formData.description}
                               onChange={(e) => setFormData({...formData, description: e.target.value})}
                             />
                             {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
                           </div>

                           <div className="flex items-center gap-2 mt-4">
                              <input 
                                type="checkbox" 
                                id="billable" 
                                checked={formData.isBillable}
                                onChange={(e) => setFormData({...formData, isBillable: e.target.checked})}
                                className="h-4 w-4 rounded border-gray-300 text-blue-600"
                              />
                              <label htmlFor="billable" className="text-sm text-gray-700">Yes, it's billable</label>
                           </div>
                        </form>
                      </div>

                      <div className="p-4 border-t flex justify-end gap-3 bg-white">
                        <button
                          type="button"
                          className="px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50"
                          onClick={onClose}
                        >
                          Cancel
                        </button>
                        <button 
                          type="button" 
                          onClick={handleSave} 
                          className="bg-blue-600 text-white px-6 py-2 rounded text-sm hover:bg-blue-700"
                          disabled={loading}
                        >
                          {loading ? 'Saving...' : 'Submit'}
                        </button>
                      </div>
                   </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default TimesheetDrawer;
