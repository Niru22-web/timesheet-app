import React, { useState, useEffect } from 'react';
import API from '../api';
import { useAuth } from '../contexts/AuthContext';
import {
  CalendarIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  UserIcon,
  EyeIcon,
  PencilSquareIcon,
  TrashIcon,
  ChartBarIcon,
  BanknotesIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  AdjustmentsVerticalIcon,
  ChartPieIcon
} from '@heroicons/react/24/outline';

// UI Components
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Avatar from '../components/ui/Avatar';
import StatusBadge from '../components/ui/StatusBadge';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';

interface LeaveRecord {
  id: string;
  leaveId: string;
  type: 'Paid Leave' | 'Sick Leave' | 'Casual Leave' | 'Unpaid Leave';
  fromDate: string;
  toDate: string;
  duration: 'Full Day' | 'Half Day';
  totalDays: number;
  reason: string;
  status: 'pending' | 'manager_approved' | 'partner_approved' | 'auto_approved' | 'approved' | 'rejected';
  appliedDate: string;
  approvedBy?: string;
  approvedDate?: string;
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    officeEmail: string;
  };
}

interface LeaveBalance {
  accrued: number;
  used: number;
  adjustment: number;
  available: number;
  kpiScore: number;
}

const LeaveManagement: React.FC = () => {
  const { user } = useAuth();
  const [leaveRecords, setLeaveRecords] = useState<LeaveRecord[]>([]);
  const [leaveBalance, setLeaveBalance] = useState<LeaveBalance>({
    accrued: 0,
    used: 0,
    adjustment: 0,
    available: 0,
    kpiScore: 100
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [leaveTypeFilter, setLeaveTypeFilter] = useState('All Types');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);

  // Master data for employee filter
  const [employees, setEmployees] = useState<any[]>([]);

  // Form state for leave application
  const [formData, setFormData] = useState({
    type: 'Paid Leave',
    reason: '',
    duration: 'Full Day',
    fromDate: new Date().toISOString().split('T')[0],
    toDate: new Date().toISOString().split('T')[0],
    leaveHoursPerDay: 'Full Day'
  });

  const [employeeFilter, setEmployeeFilter] = useState('All Employees');

  // Adjust form state
  const [adjustData, setAdjustData] = useState({
    employeeId: '',
    amount: '',
    reason: ''
  });

  // Calculated total days
  const [totalDays, setTotalDays] = useState(1);

  useEffect(() => {
    fetchLeaveRecords();
    fetchLeaveBalance();
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      // Only fetch employees if user is Admin, Manager, or Partner
      if (user && ['Admin', 'Manager', 'Partner'].includes(user.role)) {
        const res = await API.get('/employees');
        
        // Handle standardized response format { success, data, message }
        setEmployees(res.data?.success ? res.data.data : res.data);
      }
    } catch (err) {
      console.error('Failed to fetch employees:', err);
      // Set empty array on error
      setEmployees([]);
    }
  };

  useEffect(() => {
    calculateTotalDays();
  }, [formData.fromDate, formData.toDate, formData.duration]);

  const fetchLeaveRecords = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (leaveTypeFilter !== 'All Types') params.type = leaveTypeFilter;
      if (statusFilter !== 'All Status') params.status = statusFilter;
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;
      if (employeeFilter !== 'All Employees') params.employeeId = employeeFilter;

      const res = await API.get('/leaves', { params });
      
      // Handle standardized response format { success, data, message }
      setLeaveRecords(res.data?.success ? res.data.data : res.data);
    } catch (err) {
      console.error('Failed to fetch leave records:', err);
      // Set empty array on error to show no records
      setLeaveRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaveBalance = async () => {
    try {
      console.log('Fetching leave balance...');
      const res = await API.get('/leaves/balance');
      console.log('Leave balance response:', res.data);
      
      // Handle standardized response format { success, data, message }
      setLeaveBalance(res.data?.success ? res.data.data : res.data);
    } catch (err: any) {
      console.error('Failed to fetch leave balance:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      // Set default balance if API fails
      setLeaveBalance({
        accrued: 0,
        used: 0,
        adjustment: 0,
        available: 0,
        kpiScore: 100
      });
    }
  };

  const calculateTotalDays = () => {
    if (!formData.fromDate || !formData.toDate) {
      setTotalDays(1);
      return;
    }

    const from = new Date(formData.fromDate);
    const to = new Date(formData.toDate);
    
    if (from > to) {
      setTotalDays(0);
      return;
    }

    const dayCount = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const calculatedDays = formData.duration === 'Half Day' ? dayCount * 0.5 : dayCount;
    setTotalDays(calculatedDays);
  };

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.reason.trim()) {
      alert('Please provide a reason for leave.');
      return;
    }

    if (totalDays <= 0) {
      alert('Invalid date range selected.');
      return;
    }

    try {
      const leaveData = {
        ...formData,
        totalDays,
        appliedDate: new Date().toISOString().split('T')[0]
      };

      await API.post('/leaves', leaveData);
      setShowApplyModal(false);
      setFormData({
        type: 'Paid Leave',
        reason: '',
        duration: 'Full Day',
        fromDate: new Date().toISOString().split('T')[0],
        toDate: new Date().toISOString().split('T')[0],
        leaveHoursPerDay: 'Full Day'
      });
      fetchLeaveRecords();
      fetchLeaveBalance();
    } catch (err: any) {
      console.error('Failed to apply leave:', err);
      alert(err?.response?.data?.error || 'Failed to submit leave request. Please try again.');
    }
  };

  const handleAdjustLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustData.employeeId || !adjustData.amount || !adjustData.reason) {
       alert('Please fill all fields');
       return;
    }
    try {
      await API.post('/leaves/adjust', {
         employeeId: adjustData.employeeId,
         amount: parseFloat(adjustData.amount),
         reason: adjustData.reason
      });
      setShowAdjustModal(false);
      setAdjustData({ employeeId: '', amount: '', reason: '' });
      fetchLeaveRecords();
      fetchLeaveBalance();
      alert('Leave balance adjusted successfully');
    } catch (err: any) {
      console.error('Failed to adjust leave:', err);
      alert(err?.response?.data?.error || 'Failed to adjust leave');
    }
  };

  const handleUpdateLeave = async (leaveId: string, status: 'approved' | 'rejected') => {
    // Check if user has permission to approve/reject
    const canApproveReject = user && ['Admin', 'Manager', 'Partner'].includes(user.role);
    if (!canApproveReject) {
      alert('You do not have permission to approve or reject leave requests.');
      return;
    }

    try {
      await API.put(`/leaves/${leaveId}`, { status });
      fetchLeaveRecords();
      fetchLeaveBalance();
    } catch (err) {
      console.error('Failed to update leave status:', err);
      alert('Failed to update leave status.');
    }
  };

  const handleCancelLeave = async (leaveId: string) => {
    if (!window.confirm('Are you sure you want to cancel this leave request?')) {
      return;
    }

    try {
      await API.delete(`/leaves/${leaveId}`);
      fetchLeaveRecords();
      fetchLeaveBalance();
    } catch (err) {
      console.error('Failed to cancel leave:', err);
      alert('Failed to cancel leave request.');
    }
  };

  // Check if user can perform actions based on role and leave status
  const canEditCancel = (record: LeaveRecord) => {
    if (!user) return false;
    
    // Users can edit/cancel their own pending requests
    if (record.employee.id === user.id && record.status === 'pending') {
      return true;
    }
    
    // Admins can edit/cancel any pending request
    if (user.role === 'Admin' && record.status === 'pending') {
      return true;
    }
    
    // Managers can edit/cancel pending requests of their team members
    if (user.role === 'Manager' && record.status === 'pending') {
      // This would need to check if the employee reports to this manager
      // For now, we'll allow it for all pending requests
      return true;
    }
    
    return false;
  };

  const canApprove = (record: LeaveRecord) => {
    if (!user) return false;
    
    // Admins can approve any pending/manager_approved
    if (user.role === 'Admin' && ['pending', 'manager_approved'].includes(record.status)) return true;
    
    // Managers can approve PENDING requests
    if (user.role === 'Manager' && record.status === 'pending') {
      return record.employee.id !== user.id; // Can't approve own requests
    }
    
    // Partners can approve pending/manager_approved
    if (['Partner', 'Owner'].includes(user.role) && ['pending', 'manager_approved'].includes(record.status)) {
      return record.employee.id !== user.id; // Can't approve own requests
    }
    
    return false;
  };

  const canReject = (record: LeaveRecord) => {
    if (!user) return false;
    if (user.role === 'Admin' && ['pending', 'manager_approved'].includes(record.status)) return true;
    if (user.role === 'Manager' && record.status === 'pending') return record.employee.id !== user.id;
    if (['Partner', 'Owner'].includes(user.role) && ['pending', 'manager_approved'].includes(record.status)) return record.employee.id !== user.id;
    return false;
  };

  const renderStatusBadge = (status: string) => {
     switch (status) {
        case 'pending':
           return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-full text-[10px] font-black uppercase tracking-wider">🟡 Pending</span>;
        case 'manager_approved':
           return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-[10px] font-black uppercase tracking-wider">🔵 Manager Approved</span>;
        case 'partner_approved':
        case 'approved':
           return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-black uppercase tracking-wider">🟢 Fully Approved</span>;
        case 'rejected':
           return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-full text-[10px] font-black uppercase tracking-wider">🔴 Rejected</span>;
        case 'auto_approved':
           return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-full text-[10px] font-black uppercase tracking-wider">⚡ Auto Approved</span>;
        default:
           return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 text-slate-700 border border-slate-200 rounded-full text-[10px] font-black uppercase tracking-wider">{status.replace('_', ' ')}</span>;
     }
  };

  const filteredRecords = leaveRecords.filter(record => {
    const matchesSearch = record.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.leaveId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = leaveTypeFilter === 'All Types' || record.type === leaveTypeFilter;
    const matchesStatus = statusFilter === 'All Status' || record.status === statusFilter;
    const matchesDateRange = (!dateFrom || record.fromDate >= dateFrom) &&
                           (!dateTo || record.toDate <= dateTo);
    const matchesEmployee = employeeFilter === 'All Employees' || record.employee.id === employeeFilter;
    
    return matchesSearch && matchesType && matchesStatus && matchesDateRange && matchesEmployee;
  });

  useEffect(() => {
    fetchLeaveRecords();
  }, [statusFilter, leaveTypeFilter, dateFrom, dateTo, employeeFilter]);

  const balanceStats = [
    {
      label: 'Accrued (YTD)',
      value: leaveBalance.accrued.toString(),
      icon: BanknotesIcon,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      label: 'Discipline KPI Score',
      value: `${leaveBalance.kpiScore}%`,
      icon: ChartPieIcon,
      color: 'text-rose-600',
      bg: 'bg-rose-50'
    },
    {
      label: 'Used Leave',
      value: leaveBalance.used.toString(),
      icon: ArrowTrendingDownIcon,
      color: 'text-orange-600',
      bg: 'bg-orange-50'
    },
    {
      label: 'Adjustments',
      value: leaveBalance.adjustment > 0 ? `+${leaveBalance.adjustment}` : leaveBalance.adjustment.toString(),
      icon: AdjustmentsVerticalIcon,
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    },
    {
      label: 'Available Balance',
      value: leaveBalance.available.toString(),
      icon: CheckCircleIcon,
      color: 'text-green-600',
      bg: 'bg-green-50'
    }
  ];

  return (
    <div className="h-full flex flex-col space-y-6 animate-fade-in max-h-[calc(100vh-120px)] overflow-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 flex-none">
        <div>
          <h1 className="text-3xl font-extrabold text-secondary-900 tracking-tight">Leave Management</h1>
          <p className="text-sm font-medium text-secondary-500 mt-1">Manage your leave requests and track leave balance.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="secondary" 
            size="sm" 
            className="h-10" 
            onClick={fetchLeaveRecords}
            title="Refresh Records"
            aria-label="Refresh Records"
          >
            <ArrowPathIcon className="w-4 h-4" />
          </Button>
          {user && ['Admin', 'Manager', 'Partner'].includes(user.role) && (
            <Button
              variant="secondary"
              size="sm"
              className="h-10 px-4 font-bold whitespace-nowrap"
              onClick={() => setShowAdjustModal(true)}
              leftIcon={<AdjustmentsVerticalIcon className="w-4 h-4" />}
            >
              Adjust Balance
            </Button>
          )}
          <Button
            variant="primary"
            size="sm"
            className="h-10 px-6 font-bold whitespace-nowrap"
            onClick={() => setShowApplyModal(true)}
            leftIcon={<PlusIcon className="w-4 h-4" />}
          >
            Apply Leave
          </Button>
        </div>
      </div>

      {/* Leave Balance Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-none">
        {balanceStats.map((stat, i) => (
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

      {/* Filters */}
      <Card className="p-4 flex flex-col md:flex-row gap-4 flex-none">
        <div className="flex-1 relative group">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400 group-focus-within:text-primary-500 transition-colors" />
          <input
            type="text"
            placeholder="Search by reason or leave ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-secondary-50/50 border border-secondary-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
          />
        </div>
        
        {user && ['Admin', 'Manager', 'Partner'].includes(user.role) && (
          <Select
            value={employeeFilter}
            onChange={(e) => setEmployeeFilter(e.target.value)}
            className="w-48"
          >
            <option>All Employees</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>
                {emp.firstName} {emp.lastName}
              </option>
            ))}
          </Select>
        )}

        <Select
          value={leaveTypeFilter}
          onChange={(e) => setLeaveTypeFilter(e.target.value)}
          className="w-48"
        >
          <option>All Types</option>
          <option>Paid Leave</option>
          <option>Sick Leave</option>
          <option>Casual Leave</option>
          <option>Unpaid Leave</option>
        </Select>

        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-48"
        >
          <option>All Status</option>
          <option value="pending">Pending</option>
          <option value="manager_approved">Manager Approved</option>
          <option value="partner_approved">Fully Approved</option>
          <option value="auto_approved">Auto Approved</option>
          <option value="rejected">Rejected</option>
        </Select>

        <div className="flex gap-2">
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            placeholder="From Date"
            className="w-40"
          />
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            placeholder="To Date"
            className="w-40"
          />
        </div>
      </Card>

      {/* Leave Records Table */}
      <Card className="flex-1 flex flex-col overflow-hidden shadow-lg">
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <table className="w-full text-left">
            <thead className="bg-secondary-50/50 sticky top-0 z-10">
              <tr>
                {(user && ['Admin', 'Manager', 'Partner'].includes(user.role)) && (
                  <th className="px-6 py-4 text-[10px] font-bold text-secondary-500 uppercase tracking-widest">Employee</th>
                )}
                <th className="px-6 py-4 text-[10px] font-bold text-secondary-500 uppercase tracking-widest">Leave ID</th>
                <th className="px-6 py-4 text-[10px] font-bold text-secondary-500 uppercase tracking-widest">Type</th>
                <th className="px-6 py-4 text-[10px] font-bold text-secondary-500 uppercase tracking-widest">From Date</th>
                <th className="px-6 py-4 text-[10px] font-bold text-secondary-500 uppercase tracking-widest">To Date</th>
                <th className="px-6 py-4 text-[10px] font-bold text-secondary-500 uppercase tracking-widest">Duration</th>
                <th className="px-6 py-4 text-[10px] font-bold text-secondary-500 uppercase tracking-widest">Total Days</th>
                <th className="px-6 py-4 text-[10px] font-bold text-secondary-500 uppercase tracking-widest">Reason</th>
                <th className="px-6 py-4 text-[10px] font-bold text-secondary-500 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-secondary-500 uppercase tracking-widest">Applied Date</th>
                <th className="px-6 py-4 text-[10px] font-bold text-secondary-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-50">
              {loading ? (
                <tr>
                  <td colSpan={user && ['Admin', 'Manager', 'Partner'].includes(user.role) ? 11 : 10} className="py-20 text-center">
                    <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : filteredRecords.length > 0 ? (
                filteredRecords.map(record => (
                  <tr key={record.id} className="hover:bg-primary-50/20 group transition-colors">
                    {(user && ['Admin', 'Manager', 'Partner'].includes(user.role)) && (
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={record.employee.firstName} size="sm" />
                          <div>
                            <p className="text-sm font-bold text-secondary-900 group-hover:text-primary-600 transition-colors">
                              {record.employee.firstName} {record.employee.lastName}
                            </p>
                            <p className="text-[10px] font-bold text-secondary-400 mt-0.5">{record.employee.officeEmail}</p>
                          </div>
                        </div>
                      </td>
                    )}
                    <td className="px-6 py-4">
                      <span className="text-sm font-mono font-bold text-secondary-900">{record.leaveId}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-black text-secondary-500 bg-secondary-100 px-2 py-0.5 rounded uppercase tracking-tighter">{record.type}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-secondary-600">{new Date(record.fromDate).toLocaleDateString()}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-secondary-600">{new Date(record.toDate).toLocaleDateString()}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-secondary-600">{record.duration}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-secondary-900">{record.totalDays}</span>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <p className="text-sm text-secondary-600 truncate">{record.reason}</p>
                    </td>
                    <td className="px-6 py-4">
                      {renderStatusBadge(record.status)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-secondary-600">{new Date(record.appliedDate).toLocaleDateString()}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          className="p-1.5 text-secondary-400 hover:text-primary-600 rounded border border-transparent hover:border-secondary-100 hover:bg-white transition-all"
                          title="View Details"
                          aria-label="View Details"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        
                        {canEditCancel(record) && (
                          <>
                            <button 
                              className="p-1.5 text-secondary-400 hover:text-warning-600 rounded border border-transparent hover:border-secondary-100 hover:bg-white transition-all"
                              title="Edit Leave Request"
                              aria-label="Edit Leave"
                            >
                              <PencilSquareIcon className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleCancelLeave(record.id)}
                              className="p-1.5 text-secondary-400 hover:text-danger-600 rounded border border-transparent hover:border-secondary-100 hover:bg-white transition-all"
                              title="Cancel Leave Request"
                              aria-label="Cancel Leave"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        
                        {canApprove(record) && (
                          <button 
                            onClick={() => handleUpdateLeave(record.id, 'approved')}
                            className="p-1.5 text-secondary-400 hover:text-success-600 rounded border border-transparent hover:border-secondary-100 hover:bg-white transition-all flex items-center gap-1"
                            title={['Partner', 'Admin', 'Owner'].includes(user?.role || '') ? "Final Approve" : "Manager Approve"}
                            aria-label="Approve Leave"
                          >
                            <CheckCircleIcon className="w-4 h-4" />
                            <span className="hidden xl:inline text-[10px] font-bold uppercase tracking-widest">{['Partner', 'Admin', 'Owner'].includes(user?.role || '') ? "Final Approve" : "Approve"}</span>
                          </button>
                        )}
                        
                        {canReject(record) && (
                          <button 
                            onClick={() => handleUpdateLeave(record.id, 'rejected')}
                            className="p-1.5 text-secondary-400 hover:text-danger-600 rounded border border-transparent hover:border-secondary-100 hover:bg-white transition-all flex items-center gap-1"
                            title="Reject Leave Request"
                            aria-label="Reject Leave"
                          >
                            <XCircleIcon className="w-4 h-4" />
                            <span className="hidden xl:inline text-[10px] font-bold uppercase tracking-widest">Reject</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={user && ['Admin', 'Manager', 'Partner'].includes(user.role) ? 11 : 10} className="py-20 text-center text-secondary-400 font-bold uppercase text-[10px] tracking-widest">No leave records found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Apply Leave Modal */}
      <Modal
        isOpen={showApplyModal}
        onClose={() => setShowApplyModal(false)}
        title="Apply for Leave"
        size="md"
      >
        <form onSubmit={handleApplyLeave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <Input
                type="date"
                value={new Date().toISOString().split('T')[0]}
                disabled
                className="rounded-lg border-gray-200 bg-gray-50"
              />
            </div>
            <Select
              label="Type of Leave"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              required
              className="rounded-lg border-gray-200"
            >
              <option value="Paid Leave">Paid Leave</option>
              <option value="Sick Leave">Sick Leave</option>
              <option value="Casual Leave">Casual Leave</option>
              <option value="Unpaid Leave">Unpaid Leave</option>
            </Select>
          </div>

          <Input
            label="Reason for Leave"
            placeholder="Please provide a reason for your leave request..."
            multiline
            rows={3}
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            required
            className="rounded-lg border-gray-200"
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Leave Duration"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              required
              className="rounded-lg border-gray-200"
            >
              <option value="Full Day">Full Day</option>
              <option value="Half Day">Half Day</option>
            </Select>

            <Select
              label="Leave Hours Per Day"
              value={formData.leaveHoursPerDay}
              onChange={(e) => setFormData({ ...formData, leaveHoursPerDay: e.target.value })}
              required
              className="rounded-lg border-gray-200"
            >
              <option value="Full Day">Full Day</option>
              <option value="First Half">First Half</option>
              <option value="Second Half">Second Half</option>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="From Date"
              type="date"
              value={formData.fromDate}
              onChange={(e) => setFormData({ ...formData, fromDate: e.target.value })}
              required
              className="rounded-lg border-gray-200"
            />
            <Input
              label="To Date"
              type="date"
              value={formData.toDate}
              onChange={(e) => setFormData({ ...formData, toDate: e.target.value })}
              required
              min={formData.fromDate}
              className="rounded-lg border-gray-200"
            />
          </div>

          <div className="bg-secondary-50 border border-secondary-200 rounded-lg p-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-secondary-700">Total Leave Days:</span>
              <span className="text-lg font-bold text-primary-600">{totalDays}</span>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowApplyModal(false)}
              className="px-6 py-2"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="px-6 py-2"
            >
              Submit Request
            </Button>
          </div>
        </form>
      </Modal>

      {/* Adjust Leave Balance Modal (Admin/Manager/Partner) */}
      <Modal
        isOpen={showAdjustModal}
        onClose={() => setShowAdjustModal(false)}
        title="Adjust Leave Balance"
        size="sm"
      >
        <form onSubmit={handleAdjustLeave} className="space-y-4">
          <Select
            label="Employee"
            value={adjustData.employeeId}
            onChange={(e) => setAdjustData({ ...adjustData, employeeId: e.target.value })}
            required
            className="rounded-lg border-gray-200"
          >
            <option value="" disabled>Select Employee</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>
                {emp.firstName} {emp.lastName} ({emp.officeEmail})
              </option>
            ))}
          </Select>

          <Input
            label="Adjustment Amount (Points/Days)"
            type="number"
            step="0.5"
            placeholder="e.g. 2 for bonus, -1 for deduction"
            value={adjustData.amount}
            onChange={(e) => setAdjustData({ ...adjustData, amount: e.target.value })}
            required
            className="rounded-lg border-gray-200"
          />

          <Input
            label="Reason for Adjustment"
            placeholder="e.g. Extra worked weekend, manual correction..."
            value={adjustData.reason}
            onChange={(e) => setAdjustData({ ...adjustData, reason: e.target.value })}
            required
            className="rounded-lg border-gray-200"
          />

          <div className="pt-4 flex gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowAdjustModal(false)}
              className="px-6 py-2"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="px-6 py-2"
            >
              Adjust Balance
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default LeaveManagement;
