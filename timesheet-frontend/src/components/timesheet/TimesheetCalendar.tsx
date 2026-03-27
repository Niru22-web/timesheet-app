import React, { useMemo } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Clock, CheckCircle, Clock3, AlertCircle } from 'lucide-react';

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
        padding: '2px 6px',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
        textAlign: 'center' as const
      }
    };
  };

  return (
    <div className="h-[600px] p-4 bg-white rounded-2xl shadow-sm border border-secondary-100 animate-fade-in">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        views={[Views.MONTH]}
        defaultView={Views.MONTH}
        onSelectSlot={(slotInfo) => onSelectDate(slotInfo.start)}
        onSelectEvent={(event) => onSelectDate(event.start)}
        selectable
        eventPropGetter={eventStyleGetter}
        components={{
          toolbar: (props: any) => (
             <div className="flex items-center justify-between mb-6 px-1">
                <h2 className="text-xl font-black text-secondary-900 leading-none">
                  {format(props.date, 'MMMM yyyy')}
                </h2>
                <div className="flex gap-2">
                   <button onClick={() => props.onNavigate('PREV')} className="p-2 hover:bg-secondary-100 rounded-lg transition-colors text-secondary-600 font-bold">Prev</button>
                   <button onClick={() => props.onNavigate('TODAY')} className="px-4 py-2 hover:bg-secondary-100 rounded-lg transition-colors text-secondary-800 font-black text-sm uppercase">Today</button>
                   <button onClick={() => props.onNavigate('NEXT')} className="p-2 hover:bg-secondary-100 rounded-lg transition-colors text-secondary-600 font-bold">Next</button>
                </div>
             </div>
          )
        }}
      />
      
      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 px-2">
         <div className="flex items-center gap-2 text-[10px] font-black uppercase text-secondary-400">
            <div className="w-3 h-3 rounded bg-emerald-50 border border-emerald-200" />
            Approved
         </div>
         <div className="flex items-center gap-2 text-[10px] font-black uppercase text-secondary-400">
            <div className="w-3 h-3 rounded bg-sky-50 border border-sky-200" />
            Submitted
         </div>
         <div className="flex items-center gap-2 text-[10px] font-black uppercase text-secondary-400">
            <div className="w-3 h-3 rounded bg-slate-50 border border-slate-200" />
            Pending / Draft
         </div>
         <div className="flex items-center gap-2 text-[10px] font-black uppercase text-secondary-400">
            <div className="w-3 h-3 rounded bg-rose-50 border border-rose-200" />
            Rejected
         </div>
      </div>
    </div>
  );
};

export default TimesheetCalendar;
