/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
} from 'date-fns';

interface DatePickerProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function DatePicker({ selectedDate, onDateChange, isOpen, onClose }: DatePickerProps) {
  const [currentMonth, setCurrentMonth] = useState(() => selectedDate);
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset current month when the picker opens
  useEffect(() => {
    if (isOpen) {
      setCurrentMonth(selectedDate);
    }
  }, [isOpen, selectedDate]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days: Date[] = [];
  let day = startDate;
  while (day <= endDate) {
    days.push(day);
    day = addDays(day, 1);
  }

  const handleDateClick = (date: Date) => {
    onDateChange(date);
    onClose();
  };

  return (
    <div
      ref={containerRef}
      className="absolute top-full left-0 mt-2 z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft size={18} />
        </button>
        <span className="font-semibold text-gray-900">
          {format(currentMonth, 'MMMM yyyy')}
        </span>
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
          <div key={day} className="w-8 h-8 flex items-center justify-center text-xs text-gray-500 font-medium">
            {day}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isSelected = isSameDay(day, selectedDate);
          const isTodayDate = isToday(day);

          return (
            <button
              key={index}
              onClick={() => handleDateClick(day)}
              className={`
                w-8 h-8 flex items-center justify-center text-sm rounded-lg transition-colors
                ${!isCurrentMonth ? 'text-gray-300' : 'text-gray-900'}
                ${isSelected ? 'bg-indigo-600 text-white' : ''}
                ${isTodayDate && !isSelected ? 'bg-indigo-100 text-indigo-600 font-semibold' : ''}
                ${!isSelected && isCurrentMonth ? 'hover:bg-gray-100' : ''}
              `}
            >
              {format(day, 'd')}
            </button>
          );
        })}
      </div>

      {/* Today button */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <button
          onClick={() => handleDateClick(new Date())}
          className="w-full px-3 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
        >
          Go to Today
        </button>
      </div>
    </div>
  );
}
