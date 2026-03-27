import React from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Filter, User, Briefcase, Calendar, ChevronRight, Check } from 'lucide-react';
import Button from '../ui/Button';

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  filters: {
    dateFrom: string;
    dateTo: string;
    employeeId: string;
    projectId: string;
    status: string;
  };
  setFilters: (filters: any) => void;
  employees: any[];
  projects: any[];
  isManagerial: boolean;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  isOpen,
  onClose,
  filters,
  setFilters,
  employees,
  projects,
  isManagerial
}) => {
  const handleReset = () => {
    setFilters({
      dateFrom: '',
      dateTo: '',
      employeeId: '',
      projectId: '',
      status: ''
    });
  };

  const statusOptions = ['Draft', 'Submitted', 'Approved', 'Rejected'];

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
          <div className="fixed inset-0 bg-slate-900/10 backdrop-blur-sm transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={React.Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-sm">
                  <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                    <div className="px-6 py-8 bg-slate-50 border-b border-slate-100">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Dialog.Title className="text-xl font-[1000] text-slate-900 tracking-tight flex items-center gap-2">
                             <Filter className="w-5 h-5 text-primary-600" />
                             Refine Audit
                          </Dialog.Title>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Engagement Filtering</p>
                        </div>
                        <button
                          type="button"
                          className="rounded-xl bg-white p-2 text-slate-400 hover:text-slate-500 border border-slate-200 transition-all hover:scale-105 active:scale-95 shadow-sm"
                          onClick={onClose}
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    <div className="relative flex-1 px-6 py-8 space-y-10">
                       {/* Date Range Selection */}
                       <div className="space-y-4">
                          <label className="text-[11px] font-[1000] text-slate-500 uppercase tracking-widest pl-1 flex items-center gap-2">
                            <Calendar className="w-3 h-3" />
                            Reporting Window
                          </label>
                          <div className="grid grid-cols-2 gap-3">
                             <div className="space-y-2">
                                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest pl-1">Starts On</p>
                                <input 
                                  type="date" 
                                  className="w-full bg-slate-50/50 border-none rounded-xl p-3 text-xs font-black outline-none focus:ring-2 focus:ring-primary-500/20"
                                  value={filters.dateFrom}
                                  onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                                />
                             </div>
                             <div className="space-y-2">
                                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest pl-1">Finishes On</p>
                                <input 
                                  type="date" 
                                  className="w-full bg-slate-50/50 border-none rounded-xl p-3 text-xs font-black outline-none focus:ring-2 focus:ring-primary-500/20"
                                  value={filters.dateTo}
                                  onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                                />
                             </div>
                          </div>
                       </div>

                       {/* Project Filter */}
                       <div className="space-y-4">
                          <label className="text-[11px] font-[1000] text-slate-500 uppercase tracking-widest pl-1 flex items-center gap-2">
                            <Briefcase className="w-3 h-3" />
                            Asset Allocation
                          </label>
                          <select 
                            className="w-full bg-slate-50/50 border-none rounded-xl p-4 text-xs font-black outline-none focus:ring-4 focus:ring-primary-500/10 transition-all cursor-pointer"
                            value={filters.projectId}
                            onChange={(e) => setFilters({...filters, projectId: e.target.value})}
                          >
                             <option value="">Full Portfolio View</option>
                             {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                          </select>
                       </div>

                       {/* Employee Selection (Role Protected) */}
                       {isManagerial && (
                         <div className="space-y-4">
                            <label className="text-[11px] font-[1000] text-slate-500 uppercase tracking-widest pl-1 flex items-center gap-2">
                              <User className="w-3 h-3" />
                              Personnel Filter
                            </label>
                            <select 
                              className="w-full bg-slate-50/50 border-none rounded-xl p-4 text-xs font-black outline-none focus:ring-4 focus:ring-primary-500/10 transition-all cursor-pointer"
                              value={filters.employeeId}
                              onChange={(e) => setFilters({...filters, employeeId: e.target.value})}
                            >
                               <option value="">Unified Team Aggregate</option>
                               {employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
                            </select>
                         </div>
                       )}

                       {/* Status selector using grid for premium feel */}
                       <div className="space-y-4">
                          <label className="text-[11px] font-[1000] text-slate-500 uppercase tracking-widest pl-1">Approval Phase</label>
                          <div className="grid grid-cols-2 gap-2">
                             {statusOptions.map(status => {
                               const isActive = filters.status === status;
                               return (
                                 <button
                                   key={status}
                                   type="button"
                                   onClick={() => setFilters({...filters, status: isActive ? '' : status})}
                                   className={`flex items-center justify-between px-4 py-3 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all shadow-sm ${isActive ? 'bg-primary-600 text-white border-primary-600 scale-[1.02] shadow-primary-500/20' : 'bg-white text-slate-400 border-slate-100 hover:bg-slate-50 hover:border-slate-200'}`}
                                 >
                                   {status}
                                   {isActive && <Check className="w-3 h-3" />}
                                 </button>
                               );
                             })}
                          </div>
                       </div>
                    </div>

                    <div className="px-6 py-8 border-t border-slate-100 bg-slate-50">
                       <div className="flex items-center gap-3">
                          <button
                            type="button"
                            className="flex-1 px-6 py-3 text-xs font-black text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest"
                            onClick={handleReset}
                          >
                            Reset Registry
                          </button>
                          <Button 
                            variant="primary" 
                            onClick={onClose} 
                            className="flex-1 h-12 rounded-2xl shadow-xl shadow-primary-500/20 font-black uppercase tracking-widest text-[10px]"
                          >
                            Apply Filters
                          </Button>
                       </div>
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

export default FilterPanel;
