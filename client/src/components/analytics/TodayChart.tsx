import { lazy, Suspense } from 'react';

const TodayChartImpl = lazy(() => import('./TodayChartImpl'));

interface TodayChartProps {
  completedCount: number;
  pendingCount: number;
  completionRate: number;
}

function ChartSkeleton() {
  return (
    <div className="flex flex-col items-center py-8">
      <div className="w-32 h-32 rounded-full border-4 border-gray-200 animate-pulse" />
      <div className="flex items-center gap-4 mt-4">
        <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
        <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
      </div>
    </div>
  );
}

export function TodayChart({ completedCount, pendingCount, completionRate }: TodayChartProps) {
  const total = completedCount + pendingCount;

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="w-24 h-24 rounded-full border-4 border-gray-200 flex items-center justify-center">
          <span className="text-2xl text-gray-400">0</span>
        </div>
        <p className="text-sm text-gray-500 mt-3">No tasks scheduled</p>
      </div>
    );
  }

  return (
    <Suspense fallback={<ChartSkeleton />}>
      <TodayChartImpl
        completedCount={completedCount}
        pendingCount={pendingCount}
        completionRate={completionRate}
      />
    </Suspense>
  );
}
