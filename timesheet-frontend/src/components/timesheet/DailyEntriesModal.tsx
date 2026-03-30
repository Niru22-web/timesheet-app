import React, { useMemo } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Plus, Clock, Briefcase, ChevronRight, PenSquare, Trash2, Calendar as CalendarIcon, Send } from 'lucide-react';
import { format } from 'date-fns';
import Button from '../ui/Button';

interface Timelog {
  id: string;
  hours: number;
  description: string;
  date: string;
  submissionStatus?: string;
  billableStatus?: string;
  job: {
    name: string;
    project: {
      name: string;
      client: { name: string };
    }
  };
}

interface DailyEntriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date | null;
  entries: Timelog[];
  onAdd: (date: Date) => void;
  onEdit: (entry: Timelog) => void;
  onDelete: (id: string) => void;
  onSubmit: (id: string) => void;
}

const DailyEntriesModal: React.FC<DailyEntriesModalProps> = ({
  isOpen,
  onClose,
  date,
  entries,
  onAdd,
  onEdit,
  onDelete,
  onSubmit
}) => {
  const dailyEntries = useMemo(() => {
    if (!date) return [];
    const dateStr = format(date, 'yyyy-MM-dd');
    return entries.filter(e => e.date.split('T')[0] === dateStr);
  }, [date, entries]);

  const totalHours = dailyEntries.reduce((acc, curr) => acc + curr.hours, 0);

  const getStatusBadge = (status?: string) => {
    switch(status) {
      case 'approved': return <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest border border-emerald-100">Approved</span>;
      case 'submitted': return <span className="px-2 py-0.5 rounded-full bg-sky-50 text-sky-600 text-[10px] font-black uppercase tracking-widest border border-sky-100">Submitted</span>;
      case 'rejected': return <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-widest border border-rose-100">Rejected</span>;
      default: return <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest border border-slate-200">Draft</span>;
    }
  };

  return (
    <Transition.Root show={isOpen} as={React.Fragment}>
      <Dialog as="div" className="relative z-[999]" onClose={onClose}>
        <Transition.Child
          as={React.Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-3xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-2xl border border-slate-100">
                <div className="bg-slate-50 px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm border border-slate-200 text-slate-600">
                      <CalendarIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <Dialog.Title as="h3" className="text-xl font-[1000] text-slate-900 leading-none">
                        {date ? format(date, 'EEEE, MMM do, yyyy') : 'Daily Entries'}
                      </Dialog.Title>
                      <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest flex items-center gap-2">
                         Total: <span className="text-primary-600">{totalHours.toFixed(1)} Hours</span>
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="rounded-xl bg-white p-2 text-slate-400 hover:text-slate-500 hover:bg-slate-100 transition-colors shadow-sm border border-slate-200"
                    onClick={onClose}
                    aria-label="Close"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="p-6 bg-white min-h-[300px] max-h-[60vh] overflow-y-auto space-y-4">
                  {dailyEntries.length === 0 ? (
                     <div className="flex flex-col items-center justify-center h-48 text-center bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                        <Clock className="w-10 h-10 text-slate-300 mb-3" />
                        <h4 className="text-sm font-black text-slate-600 uppercase tracking-widest">No entries found</h4>
                        <p className="text-xs font-bold text-slate-400 max-w-xs mt-1">There are no timelogs recorded for this date yet. Create one to get started.</p>
                     </div>
                  ) : (
                     dailyEntries.map(entry => (
                        <div 
                          key={entry.id} 
                          className="group relative flex flex-col sm:flex-row gap-5 p-5 rounded-2xl bg-white border border-slate-100 hover:border-primary-200 hover:shadow-xl hover:shadow-primary-500/5 transition-all duration-300 items-start sm:items-center overflow-hidden"
                        >
                           {/* Subtle gradient side border based on status */}
                           <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                               entry.submissionStatus === 'approved' ? 'bg-emerald-500' :
                               entry.submissionStatus === 'submitted' ? 'bg-sky-500' :
                               entry.submissionStatus === 'rejected' ? 'bg-rose-500' : 'bg-slate-300'
                           }`} />

                           <div className="flex-1 min-w-0 pl-1">
                              <div className="flex items-center gap-3 mb-2 flex-wrap">
                                 <h4 className="text-[15px] font-[1000] text-slate-900 truncate tracking-tight">
                                    {entry.job?.project?.name} <span className="text-slate-400 font-bold mx-1">/</span> {entry.job?.name}
                                 </h4>
                                 {getStatusBadge(entry.submissionStatus)}
                              </div>
                              <p className="text-[13px] font-bold text-slate-500 line-clamp-2 leading-relaxed bg-slate-50 rounded-xl p-3 border border-slate-100/50">
                                 {entry.description}
                              </p>
                              <div className="flex items-center gap-4 mt-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                                 <span className="flex items-center gap-1.5 bg-white"><Briefcase className="w-3.5 h-3.5 text-slate-300" /> Client: {entry.job?.project?.client?.name || 'N/A'}</span>
                                 <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                                 <span className="text-primary-700 bg-primary-50 px-2.5 py-1 rounded-lg border border-primary-100 shadow-sm shadow-primary-500/10 flex items-center gap-1.5">
                                    <Clock className="w-3 h-3" />
                                    {entry.hours.toFixed(1)}h logged
                                 </span>
                              </div>
                           </div>
                           
                           <div className="flex items-center gap-2 shrink-0 self-end sm:self-center bg-slate-50/50 p-1.5 rounded-2xl border border-slate-100 shadow-sm">
                              <button 
                                onClick={() => { onEdit(entry); onClose(); }} 
                                className="p-2.5 rounded-xl text-slate-400 hover:text-primary-600 hover:bg-white hover:shadow-sm hover:ring-1 hover:ring-slate-200 transition-all tooltip-trigger relative" 
                                aria-label="Edit entry"
                                title="Edit Entry"
                              >
                                <PenSquare className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => onDelete(entry.id)} 
                                className="p-2.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-white hover:shadow-sm hover:ring-1 hover:ring-slate-200 transition-all tooltip-trigger relative" 
                                aria-label="Delete entry"
                                title="Delete Entry"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                              
                              {/* If no submission status or pending, allow submit. */}
                              {(!entry.submissionStatus || entry.submissionStatus === 'pending') && (
                                <>
                                  <div className="w-px h-6 bg-slate-200 mx-1" />
                                  <Button
                                    variant="primary"
                                    onClick={() => onSubmit(entry.id)}
                                    className="h-9 px-4 ml-1 rounded-xl font-[1000] text-[10px] uppercase tracking-widest shadow-lg shadow-primary-500/20 hover:scale-105 transition-transform"
                                  >
                                    <Send className="w-3 h-3 mr-1.5" />
                                    Submit
                                  </Button>
                                </>
                              )}
                           </div>
                        </div>
                     ))
                  )}
                </div>

                <div className="bg-slate-50 px-6 py-4 flex items-center justify-between border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-400">
                     Viewing timeline for {date ? format(date, 'MMM do') : ''}
                  </span>
                  <Button
                     variant="primary"
                     onClick={() => {
                        if (date) onAdd(date);
                        onClose();
                     }}
                     className="h-10 px-6 rounded-xl font-[1000] text-xs uppercase tracking-widest flex items-center shadow-xl shadow-primary-500/20 hover:scale-[1.02] transition-transform"
                  >
                     <Plus className="w-4 h-4 mr-2" />
                     Add Entry
                  </Button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default DailyEntriesModal;
