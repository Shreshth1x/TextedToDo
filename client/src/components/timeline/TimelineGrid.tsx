import { HourSlot } from './HourSlot';
import { CurrentTimeIndicator } from './CurrentTimeIndicator';
import type { TimeSlot, Todo } from '../../types';

interface TimelineGridProps {
  timeSlots: TimeSlot[];
  selectedDate: Date;
  onEditTodo: (todo: Todo) => void;
}

// Show all hours from midnight to 11 PM
const START_HOUR = 0;
const END_HOUR = 23;

export function TimelineGrid({ timeSlots, selectedDate, onEditTodo }: TimelineGridProps) {
  const currentHour = new Date().getHours();

  return (
    <div className="relative flex-1 flex flex-col glass rounded-2xl shadow-xl overflow-hidden border border-white/20">
      <CurrentTimeIndicator selectedDate={selectedDate} startHour={START_HOUR} />
      
      {/* Scrollable grid showing all hours */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col">
          {timeSlots.map((slot) => (
            <HourSlot
              key={slot.hour}
              slot={slot}
              selectedDate={selectedDate}
              onEditTodo={onEditTodo}
              isCurrentHour={slot.hour === currentHour}
              compact={false}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
