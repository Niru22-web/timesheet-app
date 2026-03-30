import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
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
    date: new Date().toISOString().split('T')[0],
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
                   <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-2xl">
                      <div className="px-4 py-6 sm:px-6 bg-slate-50 border-b border-slate-100">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <Dialog.Title className="text-xl font-[1000] text-slate-900 tracking-tight">
                              {editingEntry ? 'Refine Session' : 'Commit Engagement'}
                            </Dialog.Title>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
                              Synchronizing with audit trail
                            </p>
                          </div>
                          <div className="ml-3 flex h-7 items-center">
                            <button
                              type="button"
                              className="rounded-xl bg-white p-2 text-slate-400 hover:text-slate-500 border border-slate-200 shadow-sm transition-all hover:scale-105 active:scale-95"
                              onClick={onClose}
                              aria-label="Close Drawer"
                            >
                              <X className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="relative flex-1 px-4 py-8 sm:px-8">
                        <form onSubmit={handleSave} className="space-y-8">
                           {/* Quick Stepper for Hours */}
                           <div className="space-y-3">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Duration</label>
                              <div className="flex items-center gap-4">
                                 <div className="relative flex-1 group">
                                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-primary-500 transition-colors" />
                                    <input 
                                      type="text" 
                                      placeholder="Hrs (e.g. 8.5)"
                                      className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 text-2xl font-black font-mono placeholder:text-slate-200 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all shadow-inner"
                                      value={formData.hours}
                                      onChange={(e) => setFormData({...formData, hours: e.target.value})}
                                    />
                                 </div>
                                 <div className="flex flex-col gap-1">
                                    <button type="button" onClick={() => setFormData({...formData, hours: (parseFloat(formData.hours || '0') + 0.5).toFixed(1)})} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 font-black text-xs">+</button>
                                    <button type="button" onClick={() => setFormData({...formData, hours: Math.max(0, parseFloat(formData.hours || '0') - 0.5).toFixed(1)})} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 font-black text-xs">-</button>
                                 </div>
                              </div>
                              {errors.hours && <p className="text-[10px] font-bold text-rose-500 px-1">{errors.hours}</p>}
                           </div>

                           <div className="space-y-6">
                              <Input 
                                label="Execution Date"
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({...formData, date: e.target.value})}
                              />

                              <Select
                                label="Project Master"
                                value={formData.projectId}
                                error={errors.projectId}
                                onChange={(e) => setFormData({...formData, projectId: e.target.value})}
                              >
                                 <option value="">Select Project</option>
                                 {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                              </Select>

                              <Select
                                label="Job Allocation"
                                value={formData.jobId}
                                error={errors.jobId}
                                disabled={!formData.projectId}
                                onChange={(e) => setFormData({...formData, jobId: e.target.value})}
                              >
                                 <option value="">Select Job</option>
                                 {jobs.filter(j => j.projectId === formData.projectId).map(j => <option key={j.id} value={j.id}>{j.name}</option>)}
                              </Select>

                              <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Activity Detail</label>
                                <textarea 
                                  placeholder="Describe the outcomes of this session..."
                                  className="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 text-sm font-bold min-h-[120px] focus:ring-4 focus:ring-primary-500/10 outline-none transition-all"
                                  value={formData.description}
                                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                                />
                                {errors.description && <p className="text-[10px] font-bold text-rose-500 px-1">{errors.description}</p>}
                              </div>

                              <div className="flex items-center justify-between p-4 bg-primary-50/50 rounded-2xl border border-primary-100/50 group hover:border-primary-200 transition-colors">
                                 <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white rounded-xl shadow-sm">
                                       <Zap className={`h-4 w-4 ${formData.isBillable ? 'text-primary-600 fill-primary-600' : 'text-slate-300'}`} />
                                    </div>
                                    <div className="flex flex-col">
                                       <span className="text-xs font-black text-slate-900 leading-none">Billable Entry</span>
                                       <span className="text-[10px] font-bold text-slate-500 mt-0.5">Attribute this to the client invoice</span>
                                    </div>
                                 </div>
                                 <button
                                   type="button"
                                   aria-label="Toggle Billable Status"
                                   onClick={() => setFormData({...formData, isBillable: !formData.isBillable})}
                                   className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${formData.isBillable ? 'bg-primary-600' : 'bg-slate-200'}`}
                                 >
                                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${formData.isBillable ? 'translate-x-5' : 'translate-x-0'}`} />
                                 </button>
                              </div>
                           </div>
                        </form>
                      </div>

                      <div className="flex flex-shrink-0 justify-between items-center px-4 py-6 sm:px-8 border-t border-slate-100 bg-white">
                        <button
                          type="button"
                          className="px-6 py-2.5 text-sm font-black text-slate-400 hover:text-slate-900 transition-colors"
                          onClick={onClose}
                        >
                          Cancel
                        </button>
                        <Button 
                          type="submit" 
                          variant="primary" 
                          onClick={handleSave} 
                          className="h-12 px-8 rounded-2xl shadow-xl shadow-primary-500/20 font-black"
                          isLoading={loading}
                        >
                          <Save className="w-4 h-4 mr-2" />
                          {editingEntry ? 'Commit Changes' : 'Post Timelog'}
                        </Button>
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
