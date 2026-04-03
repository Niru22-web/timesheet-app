import React, { useState, useEffect, useMemo, Suspense } from 'react';
import API from '../api';
import { useAuth } from '../contexts/AuthContext';
import {
  Calendar,
  Table,
  Plus,
  Filter as FilterIcon,
  RefreshCw,
  Search,
  Zap,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';

// UI Components
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import FAB from '../components/FAB';

// Refined Feature Components
import TimesheetListView from '../components/timesheet/TimesheetListView';
import TeamTimesheetListView from '../components/timesheet/TeamTimesheetListView';
import TimesheetDrawer from '../components/timesheet/TimesheetDrawer';
import FilterPanel from '../components/timesheet/FilterPanel';
import DailyEntriesModal from '../components/timesheet/DailyEntriesModal';

// Lazy loaded for optimization
const TimesheetCalendar = React.lazy(() => import('../components/timesheet/TimesheetCalendar'));

const Timesheet: React.FC = () => {
  const { user } = useAuth();

  // UX State
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isDailyModalOpen, setIsDailyModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'my' | 'team'>('my');

  // Data State
  const [entries, setEntries] = useState<any[]>([]);
  const [editingEntry, setEditingEntry] = useState<any | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  // Filter State
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    employeeId: '',
    projectId: '',
    status: ''
  });
  const [searchQuery, setSearchQuery] = useState('');

  // Master Data
  const [employees, setEmployees] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);

  const isManagerial = ['Admin', 'Manager', 'Partner', 'Owner'].includes(user?.role || '');

  // Fetching logic
  useEffect(() => {
    fetchLogs();
    if (isManagerial) {
      fetchFilterData();
    }
  }, [filters, isManagerial, activeTab]);

  const fetchLogs = async () => {
    try {
      setLoading(true);

      // Clean up empty params
      const params: any = {};
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== '') {
          params[key] = value;
        }
      });

      const endpoint = activeTab === 'team' ? '/api/timelogs/team' : '/api/timelogs/my';
      const res = await API.get(endpoint, { params });
      setEntries(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (err) {
      console.error('Failed to fetch logs:', err);
      toast.error('Failed to sync timesheets');
    } finally {
      setLoading(false);
    }
  };

  const fetchFilterData = async () => {
    try {
      const [empRes, projRes] = await Promise.all([
        API.get('/employees'),
        API.get('/projects')
      ]);
      setEmployees(empRes.data?.data || []);
      setProjects(projRes.data?.data || []);
    } catch (err) {
      console.error('Failed to fetch filter metadata:', err);
    }
  };

  // Interactions
  const handleEdit = (entry: any) => {
    setEditingEntry(entry);
    setSelectedDate(undefined);
    setIsDrawerOpen(true);
  };

  const handleCreate = () => {
    setEditingEntry(null);
    setSelectedDate(undefined);
    setIsDrawerOpen(true);
  };

  const handleSelectCalendarDate = (date: Date) => {
    setSelectedDate(date);
    setEditingEntry(null);
    setIsDailyModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    // We could use a custom modal here, but confirm is okay for MVP
    if (window.confirm('Delete this record permanently? This cannot be undone.')) {
      try {
        await API.delete(`/timelogs/${id}`);
        toast.info('Record eradicated');
        fetchLogs();
      } catch (err) {
        toast.error('Deletion failed');
      }
    }
  };

  const handleSubmitLog = async (id: string) => {
    try {
      await API.patch(`/timelogs/${id}/submit`);
      toast.success('Submitted for approval protocol');
      fetchLogs();
    } catch (err) {
      toast.error('Submission rejected by server');
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await API.put(`/timelogs/${id}/approve`);
      toast.success('Timesheet approved');
      fetchLogs();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Approval failed');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await API.put(`/timelogs/${id}/reject`);
      toast.warning('Timesheet rejected');
      fetchLogs();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Rejection failed');
    }
  };

  // Derived Data
  const filteredEntries = useMemo(() => {
    if (!searchQuery) return entries;
    const query = searchQuery.toLowerCase();
    return entries.filter(e =>
      e.description?.toLowerCase().includes(query) ||
      e.workItem?.toLowerCase().includes(query) ||
      e.job?.name?.toLowerCase().includes(query) ||
      e.job?.project?.name?.toLowerCase().includes(query)
    );
  }, [entries, searchQuery]);

  const activeFilterCount = Object.values(filters).filter(v => v !== '').length;
  const totalHours = filteredEntries.reduce((acc, curr) => acc + curr.hours, 0);

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8 pb-4 md:pb-12 h-full flex flex-col">
      {/* SaaS Premium Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 relative z-10 shrink-0"
      >
        <div className="flex flex-col gap-1 sm:gap-2">
          <div className="hidden sm:flex items-center gap-2 text-[10px] font-[1000] uppercase text-primary-500 tracking-[0.25em]">
            <Zap className="w-3.5 h-3.5 fill-primary-500" />
            Execution Engine
          </div>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-[1000] text-slate-900 tracking-tight leading-none bg-clip-text">Timesheet</h1>
          <p className="text-xs sm:text-sm font-bold text-slate-500 max-w-lg mt-0.5 sm:mt-1 tracking-wide hidden sm:block">
            Chronicle your productivity. Sync daily engagements to firm-wide projects.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* View Toggle */}
          <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-200/60">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2 sm:py-2.5 rounded-xl transition-all duration-300 font-[1000] text-xs uppercase tracking-widest ${viewMode === 'list' ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/10' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
            >
              <Table className="w-4 h-4" />
              <span className="hidden sm:inline">List</span>
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2 sm:py-2.5 rounded-xl transition-all duration-300 font-[1000] text-xs uppercase tracking-widest ${viewMode === 'calendar' ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/10' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
            >
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Calendar</span>
            </button>
          </div>

          {/* Desktop only - use FAB on mobile */}
          <Button
            variant="primary"
            onClick={handleCreate}
            className="hidden sm:flex h-[44px] px-8 rounded-2xl shadow-xl shadow-primary-500/25 font-[1000] text-xs uppercase tracking-widest items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Plus className="w-5 h-5" />
            Log Session
          </Button>
        </div>
      </motion.div>

      {/* Tabs for Managers */}
      {isManagerial && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex space-x-1 border-b border-slate-200"
        >
          <button
            onClick={() => setActiveTab('my')}
            className={`py-3 px-6 font-[1000] text-sm tracking-wider uppercase transition-colors relative ${activeTab === 'my' ? 'text-primary-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            My Timesheet
            {activeTab === 'my' && (
              <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-1 bg-primary-600 rounded-t-lg" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('team')}
            className={`py-3 px-6 font-[1000] text-sm tracking-wider uppercase transition-colors relative ${activeTab === 'team' ? 'text-primary-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Team Timesheets
            {activeTab === 'team' && (
              <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-1 bg-primary-600 rounded-t-lg" />
            )}
          </button>
        </motion.div>
      )}

      {/* Smart Control Bar */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="sticky top-0 z-20 shrink-0"
      >
        <Card className="p-4 border-none shadow-2xl shadow-slate-200/40 bg-white/90 backdrop-blur-xl ring-1 ring-slate-100 flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 group w-full">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-primary-500 transition-colors duration-300" />
            <input
              type="text"
              placeholder="Search by task, project, or description..."
              className="w-full bg-slate-50/50 hover:bg-slate-50 border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold placeholder:text-slate-300 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-hide shrink-0">
            <Button
              variant="secondary"
              onClick={() => setIsFilterOpen(true)}
              className={`h-[46px] px-5 rounded-2xl border flex items-center gap-2 font-[1000] text-xs uppercase tracking-widest transition-all ${activeFilterCount > 0 ? 'bg-primary-50 text-primary-600 border-primary-200 hover:bg-primary-100 shadow-sm shadow-primary-500/10' : 'text-slate-500 border-slate-200 bg-white hover:bg-slate-50'}`}
            >
              <FilterIcon className="w-4 h-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-primary-600 text-white flex items-center justify-center text-[10px] ml-1">
                  {activeFilterCount}
                </span>
              )}
            </Button>

            <div className="w-px h-8 bg-slate-200 mx-2 hidden md:block" />

            <div className="flex items-center gap-4 bg-slate-50 px-5 py-2.5 rounded-2xl border border-slate-100">
              <div className="flex flex-col items-end">
                <span className="text-[9px] font-[1000] text-slate-400 uppercase tracking-widest">Aggregate</span>
                <span className="text-sm font-[1000] text-slate-900 leading-none mt-0.5">{totalHours.toFixed(1)}h</span>
              </div>
              <button
                onClick={fetchLogs}
                className="p-1.5 hover:bg-slate-200 rounded-xl transition-colors text-slate-400 hover:text-slate-600"
                title="Force sync"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-primary-500' : ''}`} />
              </button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Main Orchestration Area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={viewMode}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {viewMode === 'list' ? (
            <Card className="p-0 border-none shadow-2xl shadow-slate-200/50 bg-white overflow-hidden ring-1 ring-slate-100 min-h-[500px]">
              {activeTab === 'team' ? (
                <TeamTimesheetListView
                  entries={filteredEntries}
                  loading={loading}
                  onApprove={handleApprove}
                  onReject={handleReject}
                />
              ) : (
                <TimesheetListView
                  entries={filteredEntries}
                  loading={loading}
                  userRole="Employee"
                  currentUserId={user?.id || ''}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onSubmit={handleSubmitLog}
                />
              )}
            </Card>
          ) : (
            <Suspense fallback={
              <div className="h-[600px] flex flex-col items-center justify-center bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
                <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-xs font-[1000] text-slate-400 uppercase tracking-[0.2em] animate-pulse">Initializing Calendar Matrix...</p>
              </div>
            }>
              <TimesheetCalendar
                entries={filteredEntries}
                onSelectDate={handleSelectCalendarDate}
                onSelectEvent={(e) => {
                  // Find the corresponding entry logic if calendar groups them
                  // For MVP, if calendar returns raw event data:
                  // handleEdit(e.resource);
                }}
              />
            </Suspense>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Drawers and Panels */}
      <TimesheetDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSuccess={fetchLogs}
        editingEntry={editingEntry}
        selectedDate={selectedDate}
      />

      <FilterPanel
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        setFilters={setFilters}
        employees={employees}
        projects={projects}
        isManagerial={isManagerial}
      />

      <DailyEntriesModal
        isOpen={isDailyModalOpen}
        onClose={() => setIsDailyModalOpen(false)}
        date={selectedDate || null}
        entries={filteredEntries}
        onAdd={(date) => {
          setSelectedDate(date);
          setEditingEntry(null);
          setIsDrawerOpen(true);
        }}
        onEdit={(entry) => {
          setEditingEntry(entry);
          setSelectedDate(undefined);
          setIsDrawerOpen(true);
        }}
        onDelete={handleDelete}
        onSubmit={handleSubmitLog}
      />

      {/* Mobile FAB for creating new entry */}
      <FAB onClick={handleCreate} label="Log Timesheet" />
    </div>
  );
};

export default Timesheet;
