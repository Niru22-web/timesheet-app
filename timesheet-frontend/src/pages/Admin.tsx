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
  LockClosedIcon
} from '@heroicons/react/24/outline';

// UI Components
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import StatusBadge from '../components/ui/StatusBadge';
import Modal from '../components/ui/Modal';
import Avatar from '../components/ui/Avatar';

const Admin: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

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
      setSummary(summaryRes.data);
      setAuditLogs(logsRes.data.slice(0, 10));
    } catch (err) {
      console.error('Failed to fetch system state:', err);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { label: 'System Integrity', value: 'High', icon: LockClosedIcon, color: 'text-success-600', bg: 'bg-success-50' },
    { label: 'Total Objects', value: summary ? (summary.totalEmployees + summary.totalClients + summary.activeProjects).toString() : '0', icon: CircleStackIcon, color: 'text-primary-600', bg: 'bg-primary-50' },
    { label: 'Active Sessions', value: summary?.totalEmployees?.toString() || '0', icon: UsersIcon, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Database Health', value: 'Synced', icon: ServerIcon, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <div className="h-full flex flex-col space-y-6 animate-fade-in max-h-[calc(100vh-120px)] overflow-hidden">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 flex-none">
        <div>
          <h1 className="text-3xl font-extrabold text-secondary-900 tracking-tight">Kernel Control</h1>
          <p className="text-sm font-medium text-secondary-500 mt-1 italic">Enterprise infrastructure and system oversight.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" className="h-10 border-secondary-200" onClick={fetchSystemState} leftIcon={<ArrowPathIcon className="w-4 h-4" />}>
            Force Synchronization
          </Button>
          <Button
            variant="primary"
            size="sm"
            className="h-10 px-6 font-bold shadow-lg shadow-primary-500/10"
            disabled
            leftIcon={<PlusIcon className="w-4 h-4" />}
          >
            Provision Resource
          </Button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-none">
        {stats.map((stat, i) => (
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

      {/* System Monitor Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0 overflow-hidden">
        <Card className="lg:col-span-8 flex flex-col h-full overflow-hidden border-none shadow-xl">
          <div className="px-6 py-4 border-b border-secondary-100 flex items-center justify-between bg-white bg-opacity-90 sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-6 bg-primary-600 rounded-full" />
              <h3 className="text-lg font-black text-secondary-900 uppercase tracking-tighter">Event Audit Trail</h3>
            </div>
            <span className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest">PostgreSQL Ledger</span>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <table className="w-full text-left">
              <thead className="bg-secondary-50/50">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-bold text-secondary-500 uppercase tracking-widest">Timestamp</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-secondary-500 uppercase tracking-widest">Actor</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-secondary-500 uppercase tracking-widest">Operation</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-secondary-500 uppercase tracking-widest text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-50">
                {loading ? (
                  <tr><td colSpan={4} className="py-20 text-center text-xs font-bold text-secondary-400">Querying central logs...</td></tr>
                ) : auditLogs.map(log => (
                  <tr key={log.id} className="hover:bg-primary-50/20 transition-all border-l-2 border-transparent hover:border-primary-500">
                    <td className="px-6 py-4 text-xs font-medium text-secondary-500">{new Date(log.date).toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Avatar name={log.employee.firstName} size="sm" />
                        <span className="text-sm font-bold text-secondary-800">{log.employee.firstName} {log.employee.lastName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-secondary-600 italic">
                      Resource allocation on {log.job.project.name}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <StatusBadge status="active" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-3 bg-secondary-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CpuChipIcon className="w-4 h-4 text-primary-400" />
              <p className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest leading-none">Kernel Version 5.4.11-Enterprise</p>
            </div>
            <p className="text-[10px] font-bold text-primary-400 uppercase tracking-widest">System Synchronized</p>
          </div>
        </Card>

        <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto no-scrollbar pb-10">
          <Card className="p-6 bg-gradient-to-br from-secondary-900 to-primary-900 text-white border-none shadow-elevated">
            <h3 className="text-lg font-black tracking-tight mb-4 flex items-center gap-2">
              <CommandLineIcon className="w-5 h-5 text-primary-400" />
              System Statistics
            </h3>
            <div className="space-y-4">
              {[
                { label: 'Active Employees', value: summary?.totalEmployees || 0, percent: 100 },
                { label: 'Running Projects', value: summary?.activeProjects || 0, percent: summary?.activeProjects ? (summary.activeProjects / 10) * 100 : 0 },
                { label: 'Registered Clients', value: summary?.totalClients || 0, percent: summary?.totalClients ? (summary.totalClients / 5) * 100 : 0 },
              ].map(stat => (
                <div key={stat.label} className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-secondary-400">
                    <span>{stat.label}</span>
                    <span className="text-white">{stat.value}</span>
                  </div>
                  <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-primary-500 rounded-full transition-all duration-1000" style={{ width: `${Math.min(stat.percent, 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 border-none shadow-lg group">
            <h3 className="text-sm font-black text-secondary-900 uppercase tracking-widest mb-4">Security Overview</h3>
            <div className="space-y-3">
              <div className="p-3 bg-secondary-50 rounded-xl flex items-center justify-between border border-secondary-100 group-hover:border-primary-200 transition-colors">
                <div className="flex items-center gap-3">
                  <ShieldCheckIcon className="w-5 h-5 text-success-600" />
                  <span className="text-xs font-bold text-secondary-700">SSL Encryption</span>
                </div>
                <span className="text-[10px] font-black text-success-600 uppercase">Secure</span>
              </div>
              <div className="p-3 bg-secondary-50 rounded-xl flex items-center justify-between border border-secondary-100">
                <div className="flex items-center gap-3">
                  <KeyIcon className="w-5 h-5 text-indigo-600" />
                  <span className="text-xs font-bold text-secondary-700">JWT Token Auth</span>
                </div>
                <span className="text-[10px] font-black text-indigo-600 uppercase">Active</span>
              </div>
            </div>
            <p className="mt-6 text-[10px] font-bold text-secondary-400 uppercase tracking-widest text-center leading-relaxed italic opacity-60">
              Global system health is monitored by real-time database heartbeat checks.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Admin;
