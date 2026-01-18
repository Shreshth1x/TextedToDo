import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
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
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <button
          onClick={goToPreviousDay}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Previous day"
        >
          <ChevronLeft size={20} />
        </button>

        <button
          onClick={onOpenDatePicker}
          className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Calendar size={18} className="text-gray-500" />
          <div className="text-left">
            <p className="text-lg font-semibold text-gray-900">
              {format(selectedDate, 'EEEE')}
            </p>
            <p className="text-sm text-gray-500">
              {format(selectedDate, 'MMMM d, yyyy')}
            </p>
          </div>
        </button>

        <button
          onClick={goToNextDay}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Next day"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {!isTodaySelected && (
        <button
          onClick={goToToday}
          className="px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
        >
          Today
        </button>
      )}
    </div>
  );
}
