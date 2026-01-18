import { useRef, useEffect } from 'react';
import { HourSlot } from './HourSlot';
import { CurrentTimeIndicator } from './CurrentTimeIndicator';
import type { TimeSlot, Todo } from '../../types';

interface TimelineGridProps {
  timeSlots: TimeSlot[];
  selectedDate: Date;
  onEditTodo: (todo: Todo) => void;
}

export function TimelineGrid({ timeSlots, selectedDate, onEditTodo }: TimelineGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const currentHour = new Date().getHours();

  // Scroll to current hour on mount
  useEffect(() => {
    if (containerRef.current) {
      const scrollTo = Math.max(0, (currentHour - 2) * 80); // 80px per hour, show 2 hours before
      containerRef.current.scrollTop = scrollTo;
    }
  }, [currentHour]);

  return (
    <div
      ref={containerRef}
      className="relative flex-1 overflow-y-auto bg-white rounded-lg shadow-sm"
    >
      <CurrentTimeIndicator selectedDate={selectedDate} />
      <div className="py-2">
        {timeSlots.map((slot) => (
          <HourSlot
            key={slot.hour}
            slot={slot}
            selectedDate={selectedDate}
            onEditTodo={onEditTodo}
            isCurrentHour={slot.hour === currentHour}
          />
        ))}
      </div>
    </div>
  );
}
