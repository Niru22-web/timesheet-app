import React, { useState, useEffect } from 'react';
import API from '../api';
import { useAuth } from '../contexts/AuthContext';
import {
  ChartBarIcon,
  UsersIcon,
  BriefcaseIcon,
  ListBulletIcon,
  ArrowPathIcon,
  CalendarIcon,
  ChevronDownIcon,
  FunnelIcon,
  TableCellsIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

// UI Components
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const Reports: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<any>(null);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const isManagement = ['Manager', 'Admin', 'Partner', 'Owner', 'manager', 'admin', 'partner', 'owner'].includes(user?.role || '');

  useEffect(() => {
    if (isManagement) fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (dateFrom) params.fromDate = dateFrom;
      if (dateTo) params.toDate = dateTo;

      const res = await API.get('/reports/summary', { params });
      setReportData(res.data);
    } catch (err) {
      console.error('Failed to fetch report:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isManagement) {
    return (
      <div className="h-full flex items-center justify-center p-6 text-center">
        <Card className="max-w-md p-8 border-t-4 border-danger-500">
          <ChartBarIcon className="w-16 h-16 text-danger-200 mx-auto mb-4" />
          <h2 className="text-xl font-black text-secondary-900 mb-2">Access Restricted</h2>
          <p className="text-sm text-secondary-500 font-medium">Reporting modules are restricted to Management, Partners, and Owners. Please contact your administrator if you believe this is an error.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-6 animate-fade-in max-h-[calc(100vh-120px)] overflow-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 flex-none">
        <div>
          <h1 className="text-3xl font-extrabold text-secondary-900 tracking-tight">Management Intelligence</h1>
          <p className="text-sm font-medium text-secondary-500 mt-1">Cross-sectional analysis of human capital and billable hours.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" className="h-10 border-secondary-200" onClick={fetchReport}>
            <ArrowPathIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Date Filters */}
      <Card className="p-4 flex flex-col md:flex-row items-center gap-4 border-l-4 border-primary-500 flex-none">
        <div className="flex-1 flex items-center gap-4 w-full">
          <div className="flex-1">
            <label className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest block mb-1">Observation Start</label>
            <Input type="date" className="h-9 text-xs" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          </div>
          <div className="flex-1">
            <label className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest block mb-1">Observation End</label>
            <Input type="date" className="h-9 text-xs" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </div>
        </div>
        <Button variant="primary" size="sm" className="h-9 mt-5 px-6 font-bold" onClick={fetchReport}>Generate Intelligence</Button>
      </Card>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm font-bold text-secondary-400">Synthesizing data models...</p>
        </div>
      ) : reportData ? (
        <div className="flex-1 overflow-y-auto no-scrollbar pb-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* High Level Metrics */}
            <div className="lg:col-span-12 grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-5 flex items-center gap-4 border-b-2 border-primary-400">
                <div className="p-3 bg-primary-50 text-primary-600 rounded-xl">
                  <ClockIcon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest">Gross Hours</p>
                  <p className="text-2xl font-black text-secondary-900">{reportData.totalHours.toFixed(2)}</p>
                </div>
              </Card>
              <Card className="p-5 flex items-center gap-4 border-b-2 border-indigo-400">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                  <UsersIcon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest">Active Personnel</p>
                  <p className="text-2xl font-black text-secondary-900">{Object.keys(reportData.byEmployee).length}</p>
                </div>
              </Card>
              <Card className="p-5 flex items-center gap-4 border-b-2 border-emerald-400">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                  <BriefcaseIcon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest">Engagements</p>
                  <p className="text-2xl font-black text-secondary-900">{Object.keys(reportData.byProject).length}</p>
                </div>
              </Card>
              <Card className="p-5 flex items-center gap-4 border-b-2 border-amber-400">
                <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                  <ListBulletIcon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest">Unit Tasks</p>
                  <p className="text-2xl font-black text-secondary-900">{Object.keys(reportData.byJob).length}</p>
                </div>
              </Card>
            </div>

            {/* By Employee Table */}
            <Card className="lg:col-span-6 flex flex-col h-[400px]">
              <div className="px-5 py-4 border-b border-secondary-100 flex items-center gap-2">
                <UsersIcon className="w-4 h-4 text-primary-500" />
                <h3 className="text-sm font-black text-secondary-900 uppercase tracking-tight">Employee Utilization</h3>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
                <table className="w-full text-left">
                  <thead className="bg-secondary-50/50 sticky top-0">
                    <tr>
                      <th className="px-5 py-3 text-[10px] font-bold text-secondary-400 uppercase tracking-wider">Employee Name</th>
                      <th className="px-5 py-3 text-[10px] font-bold text-secondary-400 uppercase tracking-wider text-right">Hours</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-secondary-50">
                    {Object.entries(reportData.byEmployee).map(([name, hours]: any) => (
                      <tr key={name} className="hover:bg-primary-50/30">
                        <td className="px-5 py-3 text-xs font-bold text-secondary-700">{name}</td>
                        <td className="px-5 py-3 text-xs font-black text-primary-600 text-right">{hours.toFixed(2)}h</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* By Project Table */}
            <Card className="lg:col-span-6 flex flex-col h-[400px]">
              <div className="px-5 py-4 border-b border-secondary-100 flex items-center gap-2">
                <BriefcaseIcon className="w-4 h-4 text-indigo-500" />
                <h3 className="text-sm font-black text-secondary-900 uppercase tracking-tight">Project Burn Rate</h3>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
                <table className="w-full text-left">
                  <thead className="bg-secondary-50/50 sticky top-0">
                    <tr>
                      <th className="px-5 py-3 text-[10px] font-bold text-secondary-400 uppercase tracking-wider">Engagement</th>
                      <th className="px-5 py-3 text-[10px] font-bold text-secondary-400 uppercase tracking-wider text-right">Hours</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-secondary-50">
                    {Object.entries(reportData.byProject).map(([name, hours]: any) => (
                      <tr key={name} className="hover:bg-indigo-50/30">
                        <td className="px-5 py-3 text-xs font-bold text-secondary-700">{name}</td>
                        <td className="px-5 py-3 text-xs font-black text-indigo-600 text-right">{hours.toFixed(2)}h</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* By Job Table */}
            <Card className="lg:col-span-12 flex flex-col max-h-[400px]">
              <div className="px-5 py-4 border-b border-secondary-100 flex items-center gap-2">
                <ListBulletIcon className="w-4 h-4 text-emerald-500" />
                <h3 className="text-sm font-black text-secondary-900 uppercase tracking-tight">Granular Job Analysis</h3>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
                <table className="w-full text-left">
                  <thead className="bg-secondary-50/50 sticky top-0">
                    <tr>
                      <th className="px-5 py-3 text-[10px] font-bold text-secondary-400 uppercase tracking-wider">Job / Cost Center Unit</th>
                      <th className="px-5 py-3 text-[10px] font-bold text-secondary-400 uppercase tracking-wider text-right">Total Aggregate Hours</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-secondary-50">
                    {Object.entries(reportData.byJob).map(([name, hours]: any) => (
                      <tr key={name} className="hover:bg-emerald-50/30 text-emerald-900 font-bold">
                        <td className="px-5 py-3 text-xs">{name}</td>
                        <td className="px-5 py-3 text-xs font-black text-right">{hours.toFixed(2)}h</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-3xl border-2 border-dashed border-secondary-100 p-12">
          <TableCellsIcon className="w-16 h-16 text-secondary-100 mb-4" />
          <p className="text-secondary-400 font-bold">Initiate Intelligence Generation to view reports.</p>
        </div>
      )}
    </div>
  );
};

export default Reports;
