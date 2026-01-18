import { useEffect, useState } from 'react';
import { isSameDay } from 'date-fns';

interface CurrentTimeIndicatorProps {
  selectedDate: Date;
}

export function CurrentTimeIndicator({ selectedDate }: CurrentTimeIndicatorProps) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  if (!isSameDay(selectedDate, now)) {
    return null;
  }

  const hours = now.getHours();
  const minutes = now.getMinutes();
  const topPosition = (hours * 80) + (minutes / 60 * 80) + 8; // 80px per hour + 8px offset for padding

  return (
    <div
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
