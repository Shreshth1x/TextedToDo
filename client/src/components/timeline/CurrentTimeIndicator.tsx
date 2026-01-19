import { useEffect, useState, useRef } from 'react';
import { isSameDay } from 'date-fns';

interface CurrentTimeIndicatorProps {
  selectedDate: Date;
  startHour?: number;
}

// Height of each hour slot in pixels (matches HourSlot min-height)
const HOUR_SLOT_HEIGHT = 60;

export function CurrentTimeIndicator({ selectedDate, startHour = 0 }: CurrentTimeIndicatorProps) {
  const [now, setNow] = useState(new Date());
  const indicatorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Scroll the indicator into view on mount and when date changes
  useEffect(() => {
    if (indicatorRef.current && isSameDay(selectedDate, now)) {
      indicatorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [selectedDate, now]);

  if (!isSameDay(selectedDate, now)) {
    return null;
  }

  const hours = now.getHours();
  const minutes = now.getMinutes();

  // Calculate position based on hour slot heights
  const topPosition = (hours - startHour) * HOUR_SLOT_HEIGHT + (minutes / 60) * HOUR_SLOT_HEIGHT;

  return (
    <div
      ref={indicatorRef}
      className="absolute left-0 right-0 z-10 pointer-events-none"
      style={{ top: `${topPosition}px` }}
    >
      <div className="flex items-center">
        <div className="w-2 h-2 rounded-full bg-red-500 -ml-1" />
        <div className="flex-1 h-0.5 bg-red-500" />
      </div>
    </div>
  );
}
