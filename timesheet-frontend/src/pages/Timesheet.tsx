import React, { useState, useEffect, useMemo } from 'react';
import API from '../api';
import { useAuth } from '../contexts/AuthContext';
import {
  CalendarIcon,
  ClockIcon,
  BriefcaseIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  ListBulletIcon,
  TagIcon,
  IdentificationIcon,
  CheckCircleIcon,
  PencilSquareIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

// UI Components
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import StatusBadge from '../components/ui/StatusBadge';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';

interface Timelog {
  id: string;
  hours: number;
  description: string;
  date: string;
  job: {
    id: string;
    jobId: string;
    name: string;
    project: {
      id: string;
      name: string;
      client: { id: string, name: string };
    }
  };
}

const Timesheet: React.FC = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<Timelog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLogModal, setShowLogModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<Timelog | null>(null);

  // Filter states
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Master data
  const [clients, setClients] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);

  // Form states
  const [formData, setFormData] = useState({
    clientId: '',
    projectId: '',
    jobId: '',
    workItem: '',
    hours: '', // Will support HH:MM
    startTime: '',
    endTime: '',
    hoursInputMethod: 'totalHours', // 'totalHours', 'startEnd', 'timer'
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Timer state
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerInterval, setTimerInterval] = useState<number | null>(null);

  // Timer functions
  const startTimer = () => {
    setTimerRunning(true);
    const interval = setInterval(() => {
      setTimerSeconds(prev => prev + 1);
    }, 1000);
    setTimerInterval(interval);
  };

  const stopTimer = () => {
    setTimerRunning(false);
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
    // Convert seconds to HH:MM format
    const hours = Math.floor(timerSeconds / 3600);
    const minutes = Math.floor((timerSeconds % 3600) / 60);
    const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    setFormData({ ...formData, hours: formattedTime });
  };

  const resetTimer = () => {
    stopTimer();
    setTimerSeconds(0);
    setFormData({ ...formData, hours: '' });
  };

  const formatTimerDisplay = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    fetchLogs();
    fetchMasters();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (dateFrom) params.fromDate = dateFrom;
      if (dateTo) params.toDate = dateTo;

      const res = await API.get('/api/timelogs', { params });
      setEntries(res.data);
    } catch (err) {
      console.error('Failed to fetch logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMasters = async () => {
    try {
      const [clientsRes, projectsRes, jobsRes] = await Promise.all([
        API.get('/api/clients'),
        API.get('/api/projects'),
        API.get('/api/jobs')
      ]);
      setClients(clientsRes.data);
      setProjects(projectsRes.data);
      setJobs(jobsRes.data);
    } catch (err) {
      console.error('Failed to fetch master data:', err);
    }
  };

  const handleLogTime = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.jobId || !formData.hours || !formData.description || !formData.date) {
      alert('All fields are mandatory.');
      return;
    }

    try {
      await API.post('/api/timelogs', formData);
      setShowLogModal(false);
      setFormData({
        clientId: '',
        projectId: '',
        jobId: '',
        workItem: '',
        hours: '',
        startTime: '',
        endTime: '',
        hoursInputMethod: 'totalHours',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
      fetchLogs();
    } catch (err) {
      console.error('Error logging time:', err);
      alert('Failed to log time. Please check your inputs.');
    }
  };

  const handleEditEntry = (entry: Timelog) => {
    setEditingEntry(entry);
    setFormData({
      clientId: entry.job.project.client.id,
      projectId: entry.job.project.id,
      jobId: entry.job.id,
      workItem: '',
      hours: entry.hours.toString(),
      startTime: '',
      endTime: '',
      hoursInputMethod: 'totalHours',
      description: entry.description,
      date: entry.date
    });
    setShowEditModal(true);
  };

  const handleUpdateEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEntry) return;

    if (!formData.jobId || !formData.hours || !formData.description || !formData.date) {
      alert('All fields are mandatory.');
      return;
    }

    try {
      await API.put(`/api/timelogs/${editingEntry.id}`, formData);
      setShowEditModal(false);
      setEditingEntry(null);
      setFormData({
        clientId: '',
        projectId: '',
        jobId: '',
        workItem: '',
        hours: '',
        startTime: '',
        endTime: '',
        hoursInputMethod: 'totalHours',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
      fetchLogs();
    } catch (err) {
      console.error('Error updating timelog:', err);
      alert('Failed to update timelog. Please try again.');
    }
  };

  const handleDeleteEntry = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this timelog entry? This action cannot be undone.')) {
      try {
        await API.delete(`/api/timelogs/${id}`);
        fetchLogs();
      } catch (err) {
        console.error('Failed to delete timelog:', err);
        alert('Error deleting timelog entry. Please try again.');
      }
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

  const selectedJobDetails = useMemo(() => {
    return jobs.find(j => j.id === formData.jobId);
  }, [formData.jobId, jobs]);

  const totalHours = entries.reduce((acc, curr) => acc + curr.hours, 0);

  return (
    <div className="h-full flex flex-col space-y-6 animate-fade-in max-h-[calc(100vh-120px)] overflow-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 flex-none">
        <div>
          <h1 className="text-3xl font-extrabold text-secondary-900 tracking-tight">Time Ledger</h1>
          <p className="text-sm font-medium text-secondary-500 mt-1">Audit your daily efficiency and client commitments.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" className="h-10 border-secondary-200" onClick={fetchLogs}>
            <ArrowPathIcon className="w-4 h-4" />
          </Button>
          <Button
            variant="primary"
            size="sm"
            className="h-10 px-6 font-bold"
            onClick={() => setShowLogModal(true)}
            leftIcon={<PlusIcon className="w-4 h-4" />}
          >
            Log Session
          </Button>
        </div>
      </div>

      {/* Filters and Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-none">
        <Card className="lg:col-span-8 p-4 flex flex-col md:flex-row items-center gap-4 border-l-4 border-primary-500">
          <div className="flex-1 flex items-center gap-4 w-full">
            <div className="flex-1">
              <label className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest block mb-1">From Date</label>
              <Input
                type="date"
                className="h-9 text-xs"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest block mb-1">To Date</label>
              <Input
                type="date"
                className="h-9 text-xs"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>
          <Button variant="secondary" size="sm" className="h-9 mt-5" onClick={fetchLogs}>Filter Results</Button>
        </Card>

        <Card className="lg:col-span-4 p-4 flex items-center gap-4 bg-primary-600 text-white border-none shadow-lg shadow-primary-500/20">
          <div className="p-3 bg-white/10 rounded-xl">
            <ClockIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-primary-100 uppercase tracking-widest">Aggregate Hours</p>
            <p className="text-2xl font-black">{totalHours.toFixed(2)}h</p>
          </div>
        </Card>
      </div>

      {/* Main Table */}
      <Card className="flex-1 flex flex-col overflow-hidden min-h-0 shadow-lg">
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-secondary-50/90 backdrop-blur-sm z-10 border-b border-secondary-100">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold text-secondary-500 uppercase tracking-widest">Entry Date</th>
                <th className="px-6 py-4 text-[10px] font-bold text-secondary-500 uppercase tracking-widest">Project / Job</th>
                <th className="px-6 py-4 text-[10px] font-bold text-secondary-500 uppercase tracking-widest">Allocation</th>
                <th className="px-6 py-4 text-[10px] font-bold text-secondary-500 uppercase tracking-widest">Work description</th>
                <th className="px-6 py-4 text-[10px] font-bold text-secondary-500 uppercase tracking-widest text-right">Hours</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
                      <p className="text-sm font-bold text-secondary-400">Syncing time logs...</p>
                    </div>
                  </td>
                </tr>
              ) : entries.length > 0 ? (
                entries.map(entry => (
                  <tr key={entry.id} className="hover:bg-primary-50/20 group transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-white border border-secondary-100 rounded-lg flex flex-col items-center justify-center">
                          <span className="text-[10px] font-bold text-secondary-400 leading-none">{new Date(entry.date).toLocaleString('default', { month: 'short' })}</span>
                          <span className="text-sm font-black text-secondary-900 leading-tight">{new Date(entry.date).getDate()}</span>
                        </div>
                        <p className="text-xs font-bold text-secondary-600">{new Date(entry.date).toLocaleDateString()}</p>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div>
                        <p className="text-sm font-bold text-secondary-900 leading-tight">{entry.job.project.name}</p>
                        <p className="text-[10px] font-bold text-secondary-400 uppercase mt-0.5">{entry.job.name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-1.5">
                        <TagIcon className="w-3.5 h-3.5 text-secondary-400" />
                        <span className="text-[10px] font-black text-secondary-500 bg-secondary-100 px-2 py-0.5 rounded uppercase">{entry.job.jobId}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 max-w-xs">
                      <p className="text-xs text-secondary-600 truncate italic">{entry.description}</p>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleEditEntry(entry)}
                          className="p-2 text-secondary-400 hover:text-primary-600 rounded-lg border border-transparent hover:border-secondary-100 hover:bg-white shadow-sm transition-all focus:outline-none"
                        >
                          <PencilSquareIcon className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteEntry(entry.id)}
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
                  <td colSpan={5} className="py-24 text-center">
                    <div className="flex flex-col items-center opacity-30">
                      <ClockIcon className="w-12 h-12 text-secondary-300" />
                      <p className="text-sm font-bold mt-2">Zero log detection for selected period.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Log Modal */}
      <Modal
        isOpen={showLogModal}
        onClose={() => {
          setShowLogModal(false);
          resetTimer();
        }}
        title="Log Time"
        size="lg"
      >
        <form onSubmit={handleLogTime} className="space-y-6">
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

          {/* Work Item and Date Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Work Item"
              placeholder="Enter work item or task name"
              value={formData.workItem}
              onChange={(e) => setFormData({ ...formData, workItem: e.target.value })}
              className="rounded-lg border-gray-200"
            />
            
            <Input
              label="Date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
              className="rounded-lg border-gray-200"
            />
          </div>

          {/* Description Field */}
          <div>
            <Input
              label="Description"
              placeholder="Describe the work performed..."
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              className="rounded-lg border-gray-200"
            />
          </div>

          {/* Hours Input Method Selection */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">Hours</label>
            
            {/* Radio Buttons */}
            <div className="flex space-x-6 mb-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="hoursMethod"
                  value="totalHours"
                  checked={formData.hoursInputMethod === 'totalHours'}
                  onChange={(e) => setFormData({ ...formData, hoursInputMethod: e.target.value })}
                  className="mr-2"
                />
                <span className="text-sm font-medium">Total Hours</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="radio"
                  name="hoursMethod"
                  value="startEnd"
                  checked={formData.hoursInputMethod === 'startEnd'}
                  onChange={(e) => setFormData({ ...formData, hoursInputMethod: e.target.value })}
                  className="mr-2"
                />
                <span className="text-sm font-medium">Start and End Time</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="radio"
                  name="hoursMethod"
                  value="timer"
                  checked={formData.hoursInputMethod === 'timer'}
                  onChange={(e) => setFormData({ ...formData, hoursInputMethod: e.target.value })}
                  className="mr-2"
                />
                <span className="text-sm font-medium">Timer</span>
              </label>
            </div>

            {/* Hours Input Fields Based on Selection */}
            {formData.hoursInputMethod === 'totalHours' && (
              <Input
                placeholder="00:00"
                value={formData.hours}
                onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                required
                className="rounded-lg border-gray-200"
              />
            )}
            
            {formData.hoursInputMethod === 'startEnd' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Start Time"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  required
                  className="rounded-lg border-gray-200"
                />
                <Input
                  label="End Time"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  required
                  className="rounded-lg border-gray-200"
                />
              </div>
            )}
            
            {formData.hoursInputMethod === 'timer' && (
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <div className="text-2xl font-mono font-bold text-gray-900 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                    {formatTimerDisplay(timerSeconds)}
                  </div>
                </div>
                <div className="flex space-x-2">
                  {!timerRunning ? (
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={startTimer}
                      className="px-4"
                    >
                      Start
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={stopTimer}
                      className="px-4"
                    >
                      Stop
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={resetTimer}
                    className="px-4"
                  >
                    Reset
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowLogModal(false);
                resetTimer();
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
              Save
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Timesheet;
