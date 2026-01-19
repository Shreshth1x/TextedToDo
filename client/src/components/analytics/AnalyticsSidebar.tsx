import { Loader2, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { TodayChart } from './TodayChart';
import { MissedScheduleSection } from './MissedScheduleSection';
import { ChecklistSection } from './ChecklistSection';
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
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-4 space-y-4">
      {/* Today's Progress */}
      <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <TrendingUp size={16} className="text-white" />
          </div>
          <h2 className="text-base font-bold text-gray-800">Today's Progress</h2>
        </div>
        <TodayChart
          completedCount={completedToday}
          pendingCount={pendingToday}
          completionRate={completionRate}
        />
      </div>

      {/* Missed/Overdue Section */}
      <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-100">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
            <AlertTriangle size={16} className="text-white" />
          </div>
          <h3 className="text-sm font-bold text-gray-800">Schedule Status</h3>
        </div>
        <MissedScheduleSection missedTasks={missedTasks} onTaskClick={onTaskClick} />
      </div>

      {/* Quick Checklist Section */}
      <div className="flex-1 p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
            <CheckCircle size={16} className="text-white" />
          </div>
          <h3 className="text-sm font-bold text-gray-800">Quick Checklist</h3>
        </div>
        <ChecklistSection onTaskClick={onTaskClick} />
      </div>
    </div>
  );
}
