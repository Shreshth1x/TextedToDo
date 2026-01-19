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
  const hasTasks = slot.todos.length > 0;

  return (
    <div
      ref={setNodeRef}
      className={`
        group flex border-b border-gray-100 transition-colors
        min-h-[60px]
        ${isOver ? 'bg-indigo-50' : ''}
        ${isCurrentHour ? 'bg-red-50/30' : ''}
        hover:bg-gray-50/50
      `}
    >
      {/* Time label */}
      <div className="w-14 md:w-16 flex-shrink-0 px-2 py-2 text-right">
        <span
          className={`text-xs font-medium ${
            isCurrentHour ? 'text-red-600' : 'text-gray-400'
          }`}
        >
          {formattedHour}
        </span>
      </div>

      {/* Task area */}
      <div
        className={`
          flex-1 border-l border-gray-200 transition-colors overflow-hidden py-1 px-2
          ${isOver ? 'border-l-indigo-400 border-l-2' : ''}
        `}
      >
        {hasTasks ? (
          <div className="flex flex-col gap-1">
            {slot.todos.map((todo) => (
              <TimelineTaskCard key={todo.id} todo={todo} onEdit={onEditTodo} />
            ))}
          </div>
        ) : (
          /* Drop indicator when hovering over empty slot */
          isOver && (
            <div className="border-2 border-dashed border-indigo-300 rounded flex items-center justify-center h-10">
              <span className="text-indigo-500 text-sm">Drop to add</span>
            </div>
          )
        )}
      </div>
    </div>
  );
}
