import React, { useMemo } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Clock, CheckCircle, Clock3, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';

const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface Timelog {
  id: string;
  hours: number;
  description: string;
  date: string;
  submissionStatus?: string;
}

interface TimesheetCalendarProps {
  entries: Timelog[];
  onSelectDate: (date: Date) => void;
  onSelectEvent: (event: any) => void;
}

const TimesheetCalendar: React.FC<TimesheetCalendarProps> = ({ 
  entries, 
  onSelectDate, 
  onSelectEvent 
}) => {
  // Aggregate hours by date
  const events = useMemo(() => {
    const dailyData: Record<string, { hours: number, status: string }> = {};
    
    entries.forEach(entry => {
      const dateKey = entry.date.split('T')[0];
      if (!dailyData[dateKey]) {
        dailyData[dateKey] = { hours: 0, status: entry.submissionStatus || 'pending' };
      }
      dailyData[dateKey].hours += entry.hours;
      
      // If any entry is pending/draft, the day is pending
      if (entry.submissionStatus === 'pending' || !entry.submissionStatus) {
        dailyData[dateKey].status = 'pending';
      }
    });
    
    return Object.entries(dailyData).map(([date, data]) => ({
      id: date,
      title: `${data.hours.toFixed(1)}h`,
      start: new Date(date),
      end: new Date(date),
      allDay: true,
      resource: data
    }));
  }, [entries]);

  const eventStyleGetter = (event: any) => {
    const status = event.resource.status;
    let backgroundColor = '#f1f5f9'; // default slate-100
    let color = '#475569'; // slate-600
    let borderColor = '#e2e8f0'; // slate-200
    
    if (status === 'approved') {
      backgroundColor = '#ecfdf5'; // emerald-50
      color = '#059669'; // emerald-600
      borderColor = '#d1fae5'; // emerald-100
    } else if (status === 'submitted') {
      backgroundColor = '#f0f9ff'; // sky-50
      color = '#0284c7'; // sky-600
      borderColor = '#e0f2fe'; // sky-100
    } else if (status === 'rejected') {
      backgroundColor = '#fef2f2'; // rose-50
      color = '#dc2626'; // rose-600
      borderColor = '#fee2e2'; // rose-100
    }
    
    return {
      style: {
        backgroundColor,
        color,
        borderRadius: '8px',
        border: `1px solid ${borderColor}`,
        display: 'block',
        fontSize: '11px',
        fontWeight: '900',
        padding: '4px 8px',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
        textAlign: 'center' as const,
        margin: '2px 0'
      }
    };
  };

  const customStyles = `
    .saas-calendar .rbc-month-view,
    .saas-calendar .rbc-time-view,
    .saas-calendar .rbc-agenda-view {
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      overflow: hidden;
      background: #fff;
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.02);
    }
    .saas-calendar .rbc-header {
      border-bottom: 1px solid #e2e8f0;
      border-left: 1px solid #e2e8f0;
      padding: 16px 0;
      font-weight: 900;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #64748b;
      background: #f8fafc;
    }
    .saas-calendar .rbc-header:first-child {
      border-left: none;
    }
    .saas-calendar .rbc-month-row {
      border-top: 1px solid #e2e8f0;
    }
    .saas-calendar .rbc-day-bg {
      border-left: 1px solid #e2e8f0;
      transition: all 0.2s ease;
      cursor: pointer;
    }
    .saas-calendar .rbc-day-bg:first-child {
      border-left: none;
    }
    .saas-calendar .rbc-day-bg:hover {
      background-color: #f1f5f9;
    }
    .saas-calendar .rbc-today {
      background-color: #f0f9ff;
    }
    .saas-calendar .rbc-off-range-bg {
      background-color: #f8fafc;
    }
    .saas-calendar .rbc-date-cell {
      padding: 10px 12px;
      font-size: 13px;
      font-weight: 800;
      color: #334155;
    }
    .saas-calendar .rbc-off-range .rbc-date-cell {
      color: #cbd5e1;
    }
    .saas-calendar .rbc-event {
      background: transparent;
      padding: 0;
    }
    .saas-calendar .rbc-show-more {
      color: #0284c7;
      font-weight: 800;
      font-size: 11px;
    }
  `;

  return (
    <div className="h-[750px] p-6 bg-white rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 animate-fade-in saas-calendar flex flex-col">
      <style>{customStyles}</style>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        views={[Views.MONTH, Views.WEEK]}
        defaultView={Views.MONTH}
        onSelectSlot={(slotInfo) => onSelectDate(slotInfo.start)}
        onSelectEvent={(event) => onSelectDate(event.start)}
        selectable
        eventPropGetter={eventStyleGetter}
        components={{
          toolbar: (props: any) => (
             <div className="flex flex-col sm:flex-row items-center justify-between mb-6 px-1 gap-4">
                <div className="flex items-center gap-4">
                   <div className="flex bg-slate-100 p-1 rounded-xl items-center shadow-sm border border-slate-200/50">
                      <button onClick={() => props.onNavigate('PREV')} className="p-1.5 hover:bg-white rounded-lg transition-colors text-slate-500 hover:text-primary-600 hover:shadow-sm" aria-label="Previous">
                         <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button onClick={() => props.onNavigate('TODAY')} className="px-3 py-1.5 hover:bg-white rounded-lg transition-colors text-slate-700 font-[1000] text-xs uppercase tracking-widest hover:shadow-sm">
                         Today
                      </button>
                      <button onClick={() => props.onNavigate('NEXT')} className="p-1.5 hover:bg-white rounded-lg transition-colors text-slate-500 hover:text-primary-600 hover:shadow-sm" aria-label="Next">
                         <ChevronRight className="w-5 h-5" />
                      </button>
                   </div>
                   <h2 className="text-xl font-[1000] text-slate-800 leading-none sm:ml-2">
                     {props.label}
                   </h2>
                </div>

                <div className="flex items-center gap-4">
                   <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/50 shadow-sm">
                      <button 
                        onClick={() => props.onView('month')}
                        className={`px-4 py-1.5 rounded-lg text-xs font-[1000] uppercase tracking-widest transition-all ${props.view === 'month' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
                      >
                         Month
                      </button>
                      <button 
                        onClick={() => props.onView('week')}
                        className={`px-4 py-1.5 rounded-lg text-xs font-[1000] uppercase tracking-widest transition-all ${props.view === 'week' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
                      >
                         Week
                      </button>
                   </div>
                </div>
             </div>
          )
        }}
      />
      
      {/* Legend */}
      <div className="mt-6 flex flex-wrap gap-6 px-2 justify-center border-t border-slate-100 pt-6 shrink-0">
         <div className="flex items-center gap-2 text-[11px] font-[1000] uppercase text-slate-500 tracking-widest">
            <div className="w-4 h-4 rounded-md bg-emerald-50 border border-emerald-200 shadow-sm" />
            Approved
         </div>
         <div className="flex items-center gap-2 text-[11px] font-[1000] uppercase text-slate-500 tracking-widest">
            <div className="w-4 h-4 rounded-md bg-sky-50 border border-sky-200 shadow-sm" />
            Submitted
         </div>
         <div className="flex items-center gap-2 text-[11px] font-[1000] uppercase text-slate-500 tracking-widest">
            <div className="w-4 h-4 rounded-md bg-slate-50 border border-slate-200 shadow-sm" />
            Pending / Draft
         </div>
         <div className="flex items-center gap-2 text-[11px] font-[1000] uppercase text-slate-500 tracking-widest">
            <div className="w-4 h-4 rounded-md bg-rose-50 border border-rose-200 shadow-sm" />
            Rejected
         </div>
      </div>
    </div>
  );
};

export default TimesheetCalendar;
