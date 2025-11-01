import React, { useState, useMemo } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from './icons';

interface CalendarViewProps {
  entries: string[];
  selectedDate: string;
  onDateSelect: (date: string) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ entries, selectedDate, onDateSelect }) => {
  const [currentDate, setCurrentDate] = useState(new Date(selectedDate));
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  const firstDayOfMonth = useMemo(() => new Date(currentDate.getFullYear(), currentDate.getMonth(), 1), [currentDate]);
  const daysInMonth = useMemo(() => new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate(), [currentDate]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const startingDay = firstDayOfMonth.getDay();

  const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <ChevronLeftIcon />
        </button>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h2>
        <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <ChevronRightIcon />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-2 text-center">
        {dayOfWeek.map(day => (
          <div key={day} className="text-xs font-bold text-gray-500 dark:text-gray-400">{day}</div>
        ))}
        {Array.from({ length: startingDay }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {days.map(day => {
          const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const hasEntry = entries.includes(dateStr);
          const isSelected = selectedDate === dateStr;
          const isToday = dateStr === todayStr;

          return (
            <button
              key={day}
              onClick={() => onDateSelect(dateStr)}
              className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors text-sm
                ${isSelected ? 'bg-indigo-500 text-white font-bold ring-2 ring-indigo-300' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}
                ${!isSelected && hasEntry ? 'bg-indigo-500/20 text-indigo-200' : ''}
                ${!isSelected && !hasEntry ? 'text-gray-700 dark:text-gray-300' : ''}
                ${!isSelected && isToday ? 'bg-gray-300/50 dark:bg-gray-500/30' : ''}
              `}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarView;