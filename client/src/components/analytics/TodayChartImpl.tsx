import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface TodayChartImplProps {
  completedCount: number;
  pendingCount: number;
  completionRate: number;
}

export default function TodayChartImpl({ completedCount, pendingCount, completionRate }: TodayChartImplProps) {
  const data = [
    { name: 'Completed', value: completedCount, color: '#22c55e' },
    { name: 'Pending', value: pendingCount, color: '#e5e7eb' },
  ];

  const total = completedCount + pendingCount;

  return (
    <div className="flex flex-col items-center" role="figure" aria-label={`Today's progress: ${completionRate}% complete, ${completedCount} of ${total} tasks done`}>
      <div className="relative w-32 h-32">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={35}
              outerRadius={50}
              paddingAngle={2}
              dataKey="value"
              strokeWidth={0}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-gray-900">{completionRate}%</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4" role="list" aria-label="Task completion breakdown">
        <div className="flex items-center gap-1.5" role="listitem">
          <div className="w-3 h-3 rounded-full bg-green-500" aria-hidden="true" />
          <span className="text-xs text-gray-600">
            <span className="sr-only">Completed: </span>{completedCount} done
          </span>
        </div>
        <div className="flex items-center gap-1.5" role="listitem">
          <div className="w-3 h-3 rounded-full bg-gray-200" aria-hidden="true" />
          <span className="text-xs text-gray-600">
            <span className="sr-only">Remaining: </span>{pendingCount} left
          </span>
        </div>
      </div>
    </div>
  );
}
