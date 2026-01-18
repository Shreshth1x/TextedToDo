import { Loader2 } from 'lucide-react';
import { TodayChart } from './TodayChart';
import { MissedScheduleSection } from './MissedScheduleSection';
import { useAnalytics } from '../../hooks/useAnalytics';
import type { Todo } from '../../types';

interface AnalyticsSidebarProps {
  selectedDate: Date;
  onTaskClick: (todo: Todo) => void;
}

export function AnalyticsSidebar({ selectedDate, onTaskClick }: AnalyticsSidebarProps) {
  const {
    completedToday,
    pendingToday,
    completionRate,
    missedTasks,
    isLoading,
  } = useAnalytics(selectedDate);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-4">
      {/* Today's Progress */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Today's Progress</h2>
        <TodayChart
          completedCount={completedToday}
          pendingCount={pendingToday}
          completionRate={completionRate}
        />
      </div>

      {/* Divider */}
      <div className="h-px bg-gray-200 mb-6" />

      {/* Missed/Overdue Section */}
      <div className="flex-1">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Schedule Status</h3>
        <MissedScheduleSection missedTasks={missedTasks} onTaskClick={onTaskClick} />
      </div>
    </div>
  );
}
