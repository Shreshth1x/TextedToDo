import { ArrowUpDown, Filter } from 'lucide-react';
import type { Priority, SortOption } from '../types';

interface TodoFiltersProps {
  priorityFilter: Priority | undefined;
  onPriorityFilterChange: (priority: Priority | undefined) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  showCompleted: boolean;
  onShowCompletedChange: (show: boolean) => void;
}

const priorities: { value: Priority; label: string }[] = [
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'due_date', label: 'Due Date' },
  { value: 'priority', label: 'Priority' },
  { value: 'created_at', label: 'Created' },
];

export function TodoFilters({
  priorityFilter,
  onPriorityFilterChange,
  sortBy,
  onSortChange,
  showCompleted,
  onShowCompletedChange,
}: TodoFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 text-sm">
      {/* Priority filter */}
      <div className="flex items-center gap-2">
        <Filter size={16} className="text-gray-400" />
        <select
          value={priorityFilter || ''}
          onChange={(e) =>
            onPriorityFilterChange(e.target.value as Priority | undefined || undefined)
          }
          className="px-2 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All priorities</option>
          {priorities.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      {/* Sort */}
      <div className="flex items-center gap-2">
        <ArrowUpDown size={16} className="text-gray-400" />
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          className="px-2 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Show completed toggle */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={showCompleted}
          onChange={(e) => onShowCompletedChange(e.target.checked)}
          className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
        />
        <span className="text-gray-600">Show completed</span>
      </label>
    </div>
  );
}
