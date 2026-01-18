import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { DayHeader } from './DayHeader';
import { TimelineGrid } from './TimelineGrid';
import { useTimelineTodos } from '../../hooks/useTimelineTodos';
import type { Todo } from '../../types';

interface TimelineViewProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onEditTodo: (todo: Todo) => void;
}

export function TimelineView({ selectedDate, onDateChange, onEditTodo }: TimelineViewProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const { timeSlots, isLoading, isError } = useTimelineTodos(selectedDate);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-medium">Failed to load tasks</p>
          <p className="text-gray-500 text-sm mt-1">Please try again</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <DayHeader
        selectedDate={selectedDate}
        onDateChange={onDateChange}
        onOpenDatePicker={() => setShowDatePicker(!showDatePicker)}
      />
      <TimelineGrid
        timeSlots={timeSlots}
        selectedDate={selectedDate}
        onEditTodo={onEditTodo}
      />
    </div>
  );
}
