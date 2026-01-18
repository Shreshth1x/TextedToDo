import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface TodayChartProps {
  completedCount: number;
  pendingCount: number;
  completionRate: number;
}

export function TodayChart({ completedCount, pendingCount, completionRate }: TodayChartProps) {
  const data = [
    { name: 'Completed', value: completedCount, color: '#22c55e' },
    { name: 'Pending', value: pendingCount, color: '#e5e7eb' },
  ];

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
    <div className="flex flex-col items-center">
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
      <div className="flex items-center gap-4 mt-4">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-xs text-gray-600">{completedCount} done</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-gray-200" />
          <span className="text-xs text-gray-600">{pendingCount} left</span>
        </div>
      </div>
    </div>
  );
}
