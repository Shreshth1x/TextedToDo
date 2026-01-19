import { ChevronLeft, ChevronRight, Calendar, Sparkles } from 'lucide-react';
import { format, addDays, subDays, isToday } from 'date-fns';

interface DayHeaderProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onOpenDatePicker: () => void;
}

export function DayHeader({ selectedDate, onDateChange, onOpenDatePicker }: DayHeaderProps) {
  const goToPreviousDay = () => onDateChange(subDays(selectedDate, 1));
  const goToNextDay = () => onDateChange(addDays(selectedDate, 1));
  const goToToday = () => onDateChange(new Date());

  const isTodaySelected = isToday(selectedDate);

  return (
    <div className="flex items-center justify-between mb-4 p-3 glass rounded-2xl shadow-lg border border-white/20">
      <div className="flex items-center gap-1">
        <button
          onClick={goToPreviousDay}
          className="p-2.5 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label={`Go to previous day, ${format(subDays(selectedDate, 1), 'EEEE, MMMM d')}`}
        >
          <ChevronLeft size={20} aria-hidden="true" />
        </button>

        <button
          onClick={onOpenDatePicker}
          className="flex items-center gap-3 px-4 py-2 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 rounded-xl transition-all duration-200 active:scale-98 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label={`Selected date: ${format(selectedDate, 'EEEE, MMMM d, yyyy')}. Click to open date picker`}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
            <Calendar size={18} className="text-white" aria-hidden="true" />
          </div>
          <div className="text-left">
            <p className="text-lg font-bold text-gray-800">
              {format(selectedDate, 'EEEE')}
            </p>
            <p className="text-sm text-gray-500 font-medium">
              {format(selectedDate, 'MMMM d, yyyy')}
            </p>
          </div>
        </button>

        <button
          onClick={goToNextDay}
          className="p-2.5 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label={`Go to next day, ${format(addDays(selectedDate, 1), 'EEEE, MMMM d')}`}
        >
          <ChevronRight size={20} aria-hidden="true" />
        </button>
      </div>

      {isTodaySelected ? (
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 rounded-xl border border-emerald-200">
          <Sparkles size={14} />
          <span className="text-sm font-semibold">Today</span>
        </div>
      ) : (
        <button
          onClick={goToToday}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl hover:from-indigo-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          aria-label="Jump to today's date"
        >
          <Sparkles size={14} />
          Go to Today
        </button>
      )}
    </div>
  );
}
