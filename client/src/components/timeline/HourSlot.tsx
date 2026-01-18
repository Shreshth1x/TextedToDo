import { useDroppable } from '@dnd-kit/core';
import { format } from 'date-fns';
import { TimelineTaskCard } from './TimelineTaskCard';
import type { TimeSlot, Todo } from '../../types';

interface HourSlotProps {
  slot: TimeSlot;
  selectedDate: Date;
  onEditTodo: (todo: Todo) => void;
  isCurrentHour: boolean;
}

export function HourSlot({ slot, selectedDate, onEditTodo, isCurrentHour }: HourSlotProps) {
  const dropDate = new Date(selectedDate);
  dropDate.setHours(slot.hour, 0, 0, 0);

  const { setNodeRef, isOver } = useDroppable({
    id: `hour-${slot.hour}`,
    data: {
      hour: slot.hour,
      date: dropDate.toISOString(),
    },
  });

  const formattedHour = format(new Date().setHours(slot.hour, 0), 'h a');

  return (
    <div
      ref={setNodeRef}
      className={`
        group flex min-h-[80px] border-b border-gray-100
        ${isOver ? 'bg-indigo-50' : ''}
        ${isCurrentHour ? 'bg-red-50/30' : ''}
      `}
    >
      {/* Time label */}
      <div className="w-16 md:w-20 flex-shrink-0 py-2 px-2 text-right">
        <span
          className={`text-xs font-medium ${
            isCurrentHour ? 'text-red-600' : 'text-gray-500'
          }`}
        >
          {formattedHour}
        </span>
      </div>

      {/* Task area */}
      <div
        className={`
          flex-1 py-2 px-2 border-l border-gray-200
          transition-colors
          ${isOver ? 'border-l-indigo-400 border-l-2' : ''}
        `}
      >
        <div className="space-y-2">
          {slot.todos.map((todo) => (
            <TimelineTaskCard key={todo.id} todo={todo} onEdit={onEditTodo} />
          ))}
        </div>

        {/* Drop indicator when empty */}
        {isOver && slot.todos.length === 0 && (
          <div className="h-12 border-2 border-dashed border-indigo-300 rounded-lg flex items-center justify-center">
            <span className="text-sm text-indigo-500">Drop to create task</span>
          </div>
        )}
      </div>
    </div>
  );
}
