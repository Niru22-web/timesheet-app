import React from 'react';
import { User, Briefcase, Clock, CheckCircle, Clock3, AlertCircle, Check, X } from 'lucide-react';
import Button from '../ui/Button';

interface Timelog {
  id: string;
  hours: number;
  description: string;
  date: string;
  workItem?: string;
  billableStatus?: string;
  submissionStatus?: string;
  employee: {
     id: string;
     firstName: string;
     lastName: string;
     officeEmail: string;
  };
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

interface TeamTimesheetListViewProps {
  entries: Timelog[];
  loading: boolean;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

const TeamTimesheetListView: React.FC<TeamTimesheetListViewProps> = ({ 
  entries, 
  loading, 
  onApprove, 
  onReject
}) => {
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'rejected': return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'submitted': return 'bg-sky-50 text-sky-600 border-sky-100';
      default: return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved': return <CheckCircle className="w-3.5 h-3.5" />;
      case 'submitted': return <Clock3 className="w-3.5 h-3.5" />;
      case 'rejected': return <AlertCircle className="w-3.5 h-3.5" />;
      default: return <Clock className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="overflow-x-auto overflow-y-auto custom-scrollbar table-container relative max-h-[calc(100vh-280px)]">
      <table className="w-full text-left whitespace-nowrap">
        <thead className="bg-secondary-50/50 sticky top-0 z-10 backdrop-blur-md">
          <tr>
            <th className="px-6 py-4 text-[10px] font-black text-secondary-400 uppercase tracking-widest">Employee Name</th>
            <th className="px-6 py-4 text-[10px] font-black text-secondary-400 uppercase tracking-widest">Date</th>
            <th className="px-6 py-4 text-[10px] font-black text-secondary-400 uppercase tracking-widest">Project</th>
            <th className="px-6 py-4 text-[10px] font-black text-secondary-400 uppercase tracking-widest text-center">Hours</th>
            <th className="px-6 py-4 text-[10px] font-black text-secondary-400 uppercase tracking-widest">Status</th>
            <th className="px-6 py-4 text-[10px] font-black text-secondary-400 uppercase tracking-widest text-right">Approval Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-secondary-50">
          {loading ? (
            <tr>
              <td colSpan={6} className="py-24 text-center">
                <div className="flex flex-col items-center">
                   <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-3" />
                   <p className="text-sm font-black text-secondary-400 uppercase tracking-widest">Loading Team Records...</p>
                </div>
              </td>
            </tr>
          ) : entries.length > 0 ? (
            entries.map(entry => {
              const dateObj = new Date(entry.date);
              
              return (
                <tr key={entry.id} className="hover:bg-primary-50/30 group transition-all duration-300">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-secondary-100 rounded-full flex items-center justify-center text-secondary-500">
                         <User className="w-4 h-4" />
                      </div>
                      <div>
                         <p className="text-sm font-black text-secondary-900 leading-tight">{entry.employee.firstName} {entry.employee.lastName}</p>
                         <p className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest mt-0.5">{entry.employee.officeEmail}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white border border-secondary-100 rounded-xl flex flex-col items-center justify-center shadow-sm">
                        <span className="text-[9px] font-black text-primary-600 leading-none uppercase">{dateObj.toLocaleString('default', { month: 'short' })}</span>
                        <span className="text-sm font-black text-secondary-900 leading-tight">{dateObj.getDate()}</span>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-5">
                    <div>
                      <p className="text-sm font-black text-secondary-800">{entry.job.project.client.name}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                         <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                         <p className="text-xs font-bold text-secondary-500">{entry.job.project.name}</p>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-5 text-center">
                    <div className="flex flex-col items-center">
                       <span className="text-sm font-black text-secondary-900">{entry.hours.toFixed(2)}h</span>
                       <span className="text-[9px] font-bold text-secondary-400 mt-0.5 max-w-[120px] truncate" title={entry.description}>{entry.description}</span>
                    </div>
                  </td>
                  
                  <td className="px-6 py-5">
                     <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider ${getStatusColor(entry.submissionStatus || 'pending')}`}>
                        {getStatusIcon(entry.submissionStatus || 'pending')}
                        {entry.submissionStatus || 'Draft'}
                     </div>
                  </td>
                  
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                       {entry.submissionStatus !== 'approved' && (
                         <button 
                           onClick={() => onApprove(entry.id)}
                           className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors font-bold text-xs"
                         >
                           <Check className="w-4 h-4" /> Approve
                         </button>
                       )}
                       {entry.submissionStatus !== 'rejected' && (
                         <button 
                           onClick={() => onReject(entry.id)}
                           className="flex items-center gap-1 px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors font-bold text-xs"
                         >
                           <X className="w-4 h-4" /> Reject
                         </button>
                       )}
                    </div>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={6} className="py-32 text-center">
                 <div className="flex flex-col items-center opacity-30">
                    <div className="w-16 h-16 bg-secondary-50 rounded-full flex items-center justify-center mb-4">
                       <Briefcase className="w-8 h-8 text-secondary-300" />
                    </div>
                    <p className="text-sm font-black text-secondary-900 uppercase tracking-widest">No Team Records</p>
                    <p className="text-xs font-bold text-secondary-500 mt-2">All team members are caught up.</p>
                 </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TeamTimesheetListView;
