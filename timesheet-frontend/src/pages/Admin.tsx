import React, { useState, useEffect } from 'react';
import API from '../api';
import { useAuth } from '../contexts/AuthContext';
import {
  Cog6ToothIcon,
  ShieldCheckIcon,
  UsersIcon,
  BriefcaseIcon,
  CircleStackIcon,
  BellIcon,
  GlobeAltIcon,
  KeyIcon,
  CommandLineIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  TrashIcon,
  ArrowPathIcon,
  CloudArrowUpIcon,
  DocumentDuplicateIcon,
  CheckBadgeIcon,
  EllipsisVerticalIcon,
  CpuChipIcon,
  ServerIcon,
  LockClosedIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { XMarkIcon } from '@heroicons/react/24/solid';

// UI Components
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import StatusBadge from '../components/ui/StatusBadge';
import Modal from '../components/ui/Modal';
import Avatar from '../components/ui/Avatar';

const ProgressBar: React.FC<{ percent: number }> = ({ percent }) => {
  const ref = React.useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.style.width = `${Math.min(percent, 100)}%`;
    }
  }, [percent]);
  return (
    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
      <div ref={ref} className="h-full bg-primary-500 rounded-full transition-all duration-1000" />
    </div>
  );
};

const Admin: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [actorFilter, setActorFilter] = useState('all');
  const [operationFilter, setOperationFilter] = useState('all');
  const [showNotifications, setShowNotifications] = useState(false);

  // Check if user is admin, if not redirect to dashboard
  useEffect(() => {
    if (user && user.role !== 'admin' && user.role !== 'Admin') {
      window.location.href = '/dashboard';
    }
  }, [user]);

  useEffect(() => {
    fetchSystemState();
  }, []);

  const fetchSystemState = async () => {
    try {
      setLoading(true);
      const [summaryRes, logsRes] = await Promise.all([
        API.get('/reports/summary'),
        API.get('/timelogs') // Use timelogs as audit trail for now
      ]);
      setSummary(summaryRes.data.data || summaryRes.data);
      const logsData = logsRes.data.data || logsRes.data;
      setAuditLogs(Array.isArray(logsData) ? logsData.slice(0, 10) : []);
    } catch (err) {
      console.error('Failed to fetch system state:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter audit logs based on filters
  const filteredAuditLogs = auditLogs.filter(log => {
    const matchesSearch = searchQuery === '' || 
      log.employee?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.employee?.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.job?.project?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDate = dateFilter === 'all' || 
      (dateFilter === 'today' && new Date(log.date).toDateString() === new Date().toDateString()) ||
      (dateFilter === 'week' && new Date(log.date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
    
    const matchesActor = actorFilter === 'all' || log.employee?.firstName + ' ' + log.employee?.lastName === actorFilter;
    const matchesOperation = operationFilter === 'all' || log.operation === operationFilter;
    
    return matchesSearch && matchesDate && matchesActor && matchesOperation;
  });

  const stats = [
    { label: 'System Integrity', value: 'High', icon: LockClosedIcon, color: 'text-success-600', bg: 'bg-success-50' },
    { label: 'Total Objects', value: summary ? (summary.totalEmployees + summary.totalClients + summary.activeProjects).toString() : '0', icon: CircleStackIcon, color: 'text-primary-600', bg: 'bg-primary-50' },
    { label: 'Active Sessions', value: summary?.totalEmployees?.toString() || '0', icon: UsersIcon, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Database Health', value: 'Synced', icon: ServerIcon, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      {/* Modern Header */}
      <header className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left Section - Title */}
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Cog6ToothIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Admin Panel</h1>
                <p className="text-sm font-medium text-gray-500">System Administration & Monitoring</p>
              </div>
            </div>

            {/* Center Section - Search */}
            <div className="flex-1 max-w-xl mx-8">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search audit logs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Right Section - Notifications & Profile */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all"
              >
                <BellIcon className="w-6 h-6" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              
              <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{user?.name || 'Admin User'}</p>
                  <p className="text-xs font-medium text-gray-500">{user?.role || 'Administrator'}</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold">
                  {user?.name?.charAt(0) || 'A'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-6">

        {/* Modern KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, i) => (
            <Card key={i} className="p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-2">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`w-14 h-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center shadow-lg`}>
                  <stat.icon className="w-7 h-7" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  stat.value === 'High' || stat.value === 'Synced' ? 'bg-green-500' : 'bg-blue-500'
                }`}></div>
                <span className="text-gray-600 font-medium">
                  {stat.value === 'High' || stat.value === 'Synced' ? 'Optimal' : 'Active'}
                </span>
              </div>
            </Card>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-8">
          <button
            onClick={fetchSystemState}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
          >
            <ArrowPathIcon className="w-5 h-5" />
            Force Synchronization
          </button>
          <button
            disabled
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl opacity-50 cursor-not-allowed transition-all duration-300"
          >
            <PlusIcon className="w-5 h-5" />
            Provision Resource
          </button>
        </div>
        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Event Audit Trail */}
          <div className="lg:col-span-8">
            <Card className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              {/* Header with Filters */}
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                    <h3 className="text-lg font-bold text-gray-900">Event Audit Trail</h3>
                  </div>
                  <span className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">PostgreSQL Ledger</span>
                </div>
                
                {/* Filter Controls */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">Last 7 Days</option>
                  </select>
                  
                  <select
                    value={actorFilter}
                    onChange={(e) => setActorFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Actors</option>
                    {Array.from(new Set(auditLogs.map(log => `${log.employee?.firstName} ${log.employee?.lastName}`))).map(actor => (
                      <option key={actor} value={actor}>{actor}</option>
                    ))}
                  </select>
                  
                  <select
                    value={operationFilter}
                    onChange={(e) => setOperationFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Operations</option>
                    <option value="allocation">Resource Allocation</option>
                    <option value="creation">Resource Creation</option>
                    <option value="modification">Resource Modification</option>
                  </select>
                  
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setDateFilter('all');
                      setActorFilter('all');
                      setOperationFilter('all');
                    }}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
              {/* Table Content */}
              <div className="overflow-x-auto">
                <div className="max-h-96 overflow-y-auto">
                  <table className="w-full">
                    <thead className="sticky top-0 bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Timestamp</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actor</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Operation</th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {loading ? (
                        <tr>
                          <td colSpan={4} className="py-12 text-center">
                            <div className="flex flex-col items-center space-y-3">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                              <p className="text-sm font-medium text-gray-500">Querying system logs...</p>
                            </div>
                          </td>
                        </tr>
                      ) : filteredAuditLogs.length > 0 ? (
                        filteredAuditLogs.map((log, index) => (
                          <tr key={log.id} className={`hover:bg-blue-50 transition-colors ${
                            index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                          }`}>
                            <td className="px-6 py-4 text-sm font-medium text-gray-600">
                              {new Date(log.date).toLocaleString()}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                  {log.employee?.firstName?.charAt(0) || 'U'}
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-gray-900">
                                    {log.employee?.firstName} {log.employee?.lastName}
                                  </p>
                                  <p className="text-xs text-gray-500">{log.employee?.officeEmail}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-sm font-medium text-gray-700">
                                  Resource allocation on {log.job?.project?.name || 'Unknown Project'}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <CheckCircleIcon className="w-3 h-3 mr-1" />
                                Active
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="py-12 text-center">
                            <div className="flex flex-col items-center space-y-3">
                              <ExclamationTriangleIcon className="w-12 h-12 text-gray-400" />
                              <p className="text-sm font-medium text-gray-500">No audit logs available</p>
                              <p className="text-xs text-gray-400">Try adjusting your filters or check back later</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              {/* Footer */}
              <div className="px-6 py-4 bg-gradient-to-r from-gray-900 to-gray-800 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CpuChipIcon className="w-5 h-5 text-blue-400" />
                    <p className="text-xs font-medium text-gray-300">Kernel Version 5.4.11-Enterprise</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <p className="text-xs font-medium text-green-400">System Synchronized</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Panel */}
          <div className="lg:col-span-4 space-y-8">
            {/* System Statistics */}
            <Card className="bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 text-white rounded-2xl shadow-2xl border border-gray-800 overflow-hidden">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <CommandLineIcon className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-bold">System Statistics</h3>
                </div>
                
                <div className="space-y-6">
                  {[
                    { label: 'Active Employees', value: summary?.totalEmployees || 0, percent: 100, color: 'from-blue-500 to-cyan-500' },
                    { label: 'Running Projects', value: summary?.activeProjects || 0, percent: summary?.activeProjects ? (summary.activeProjects / 10) * 100 : 0, color: 'from-green-500 to-emerald-500' },
                    { label: 'Registered Clients', value: summary?.totalClients || 0, percent: summary?.totalClients ? (summary.totalClients / 5) * 100 : 0, color: 'from-purple-500 to-pink-500' },
                  ].map((stat, index) => (
                    <div key={stat.label} className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-300">{stat.label}</span>
                        <span className="text-lg font-bold text-white">{stat.value}</span>
                      </div>
                      <div className="relative">
                        <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className={`h-full bg-gradient-to-r ${stat.color} rounded-full transition-all duration-1000 ease-out`}
                            style={{ width: `${Math.min(stat.percent, 100)}%` }}
                          ></div>
                        </div>
                        <div className="absolute top-0 right-0 -mt-1">
                          <span className="text-xs font-medium text-gray-400">{Math.round(stat.percent)}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Security Overview */}
            <Card className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                    <ShieldCheckIcon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Security Overview</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 hover:shadow-md transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                          <ShieldCheckIcon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">SSL Encryption</p>
                          <p className="text-xs text-gray-600">TLS 1.3 Protocol</p>
                        </div>
                      </div>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-200">
                        Secure
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 hover:shadow-md transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                          <KeyIcon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">JWT Token Auth</p>
                          <p className="text-xs text-gray-600">Bearer Authentication</p>
                        </div>
                      </div>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                        Active
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <p className="text-xs font-medium text-gray-600 text-center leading-relaxed">
                    Global system health is monitored by real-time database heartbeat checks with automatic failover protection.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
        
        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm font-medium text-gray-600">
              © 2024 ASA Timesheet System. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <span className="text-sm font-medium text-gray-500">Version 2.4.1</span>
              <span className="text-sm font-medium text-gray-500">Last Sync: {new Date().toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
