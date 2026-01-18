import { useState } from 'react';
import { X, Clock } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useCreateTodo } from '../../hooks/useTodos';
import type { Class, Priority } from '../../types';

interface QuickTaskFormProps {
  classItem: Class;
  dropDate: string;
  onClose: () => void;
}

export function QuickTaskForm({ classItem, dropDate, onClose }: QuickTaskFormProps) {
  const createTodo = useCreateTodo();
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');

  const parsedDate = parseISO(dropDate);
  const formattedTime = format(parsedDate, 'h:mm a');
  const formattedDate = format(parsedDate, 'EEEE, MMMM d');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    await createTodo.mutateAsync({
      title: title.trim(),
      due_date: dropDate,
      class_id: classItem.id,
      priority,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: classItem.color }}
            />
            <span className="font-medium text-gray-900">
              {classItem.icon || '📚'} {classItem.name}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Time display */}
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
            <Clock size={16} />
            <span>{formattedTime}</span>
            <span className="text-gray-400">·</span>
            <span>{formattedDate}</span>
          </div>

          {/* Task title */}
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What do you need to do?"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
              autoFocus
            />
          </div>

          {/* Priority selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
            <div className="flex gap-2">
              {(['low', 'medium', 'high'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`
                    flex-1 px-3 py-2 text-sm font-medium rounded-lg border transition-colors
                    ${priority === p
                      ? p === 'high'
                        ? 'bg-red-100 border-red-300 text-red-700'
                        : p === 'medium'
                        ? 'bg-amber-100 border-amber-300 text-amber-700'
                        : 'bg-gray-100 border-gray-300 text-gray-700'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }
                  `}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || createTodo.isPending}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {createTodo.isPending ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
