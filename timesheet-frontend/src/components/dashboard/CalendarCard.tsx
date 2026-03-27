import React, { useState } from 'react';
import { CalendarIcon, UserCircleIcon, BriefcaseIcon } from '@heroicons/react/24/outline';

interface CalendarEvent {
  id: string;
  date: number;
  title: string;
  type: 'meeting' | 'onboarding' | 'reminder';
  time: string;
}

const CalendarCard: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date().getDate());

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const events: CalendarEvent[] = [
    { id: '1', date: 5, title: 'Team Standup', type: 'meeting', time: '10:00 AM' },
    { id: '2', date: 8, title: 'New Employee Onboarding', type: 'onboarding', time: '2:00 PM' },
    { id: '3', date: 12, title: 'Project Review', type: 'meeting', time: '3:00 PM' },
    { id: '4', date: 15, title: 'Client Meeting', type: 'meeting', time: '11:00 AM' },
    { id: '5', date: 18, title: 'Training Session', type: 'onboarding', time: '9:00 AM' },
    { id: '6', date: 22, title: 'Sprint Planning', type: 'meeting', time: '2:30 PM' },
    { id: '7', date: 26, title: 'Performance Review', type: 'reminder', time: '4:00 PM' },
  ];

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDayOfMonth = getFirstDayOfMonth(currentDate);
  const today = new Date().getDate();
  const isCurrentMonth = currentDate.getMonth() === new Date().getMonth() && 
                        currentDate.getFullYear() === new Date().getFullYear();

  const getEventsForDate = (date: number) => {
    return events.filter(event => event.date === date);
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'meeting':
        return <UserCircleIcon className="w-3 h-3" />;
      case 'onboarding':
        return <BriefcaseIcon className="w-3 h-3" />;
      default:
        return <CalendarIcon className="w-3 h-3" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'meeting':
        return 'bg-blue-500';
      case 'onboarding':
        return 'bg-purple-500';
      default:
        return 'bg-green-500';
    }
  };

  const selectedDateEvents = getEventsForDate(selectedDate);

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-blue-600" />
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            ←
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
          >
            Today
          </button>
          <button
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            →
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="mb-6">
        {/* Days of Week */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {daysOfWeek.map(day => (
            <div key={day} className="text-center text-xs font-medium text-slate-600 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells for days before month starts */}
          {[...Array(firstDayOfMonth)].map((_, index) => (
            <div key={`empty-${index}`} className="aspect-square"></div>
          ))}

          {/* Days of the month */}
          {[...Array(daysInMonth)].map((_, index) => {
            const date = index + 1;
            const dayEvents = getEventsForDate(date);
            const isSelected = date === selectedDate;
            const isToday = isCurrentMonth && date === today;

            return (
              <div
                key={date}
                onClick={() => setSelectedDate(date)}
                className={`aspect-square flex flex-col items-center justify-center rounded-xl cursor-pointer transition-all duration-200 relative ${
                  isSelected 
                    ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg scale-105' 
                    : isToday
                      ? 'bg-blue-100 text-blue-700 font-bold hover:bg-blue-200'
                      : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                <span className="text-sm font-medium">{date}</span>
                {dayEvents.length > 0 && (
                  <div className="flex gap-0.5 mt-1">
                    {dayEvents.slice(0, 2).map((event, eventIndex) => (
                      <div
                        key={eventIndex}
                        className={`w-1.5 h-1.5 rounded-full ${
                          isSelected ? 'bg-white' : getEventColor(event.type)
                        }`}
                      ></div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        isSelected ? 'bg-white' : 'bg-slate-400'
                      }`}></div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Events for Selected Date */}
      <div className="border-t border-slate-200 pt-4">
        <h4 className="text-sm font-bold text-slate-800 mb-3">
          {monthNames[currentDate.getMonth()]} {selectedDate}, {currentDate.getFullYear()}
        </h4>
        
        {selectedDateEvents.length > 0 ? (
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {selectedDateEvents.map(event => (
              <div
                key={event.id}
                className="flex items-center gap-3 p-3 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200 hover:shadow-md transition-all duration-200"
              >
                <div className={`p-2 rounded-lg ${getEventColor(event.type)} bg-opacity-20`}>
                  <div className={`${getEventColor(event.type)} text-white`}>
                    {getEventIcon(event.type)}
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-800">{event.title}</p>
                  <p className="text-xs text-slate-600">{event.time}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <CalendarIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No events scheduled</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarCard;
