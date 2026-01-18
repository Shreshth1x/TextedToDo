import { useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { ClassCard } from './ClassCard';
import { useClasses, useCreateClass } from '../../hooks/useClasses';

const DEFAULT_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4',
  '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899',
];

const DEFAULT_ICONS = ['📚', '🔬', '📐', '🎨', '🏃', '💻', '📝', '🌍', '🎵'];

export function ClassesSidebar() {
  const { data: classes = [], isLoading } = useClasses();
  const createClass = useCreateClass();
  const [showForm, setShowForm] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [selectedColor, setSelectedColor] = useState(DEFAULT_COLORS[0]);
  const [selectedIcon, setSelectedIcon] = useState(DEFAULT_ICONS[0]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;

    await createClass.mutateAsync({
      name: newClassName.trim(),
      color: selectedColor,
    });

    setNewClassName('');
    setShowForm(false);
  };

  return (
    <div className="h-full flex flex-col p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Classes</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
          aria-label="Add class"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* Quick add form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-4 p-3 bg-gray-50 rounded-lg space-y-3">
          <input
            type="text"
            value={newClassName}
            onChange={(e) => setNewClassName(e.target.value)}
            placeholder="Class name"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            autoFocus
          />

          {/* Color picker */}
          <div className="flex flex-wrap gap-2">
            {DEFAULT_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setSelectedColor(color)}
                className={`w-6 h-6 rounded-full transition-transform ${
                  selectedColor === color ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110' : ''
                }`}
                style={{ backgroundColor: color }}
                aria-label={`Select color ${color}`}
              />
            ))}
          </div>

          {/* Icon picker */}
          <div className="flex flex-wrap gap-1">
            {DEFAULT_ICONS.map((icon) => (
              <button
                key={icon}
                type="button"
                onClick={() => setSelectedIcon(icon)}
                className={`w-8 h-8 text-lg rounded-lg transition-colors ${
                  selectedIcon === icon
                    ? 'bg-indigo-100 ring-2 ring-indigo-500'
                    : 'hover:bg-gray-100'
                }`}
              >
                {icon}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={!newClassName.trim() || createClass.isPending}
              className="flex-1 px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createClass.isPending ? 'Adding...' : 'Add Class'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Drag instruction */}
      <p className="text-xs text-gray-500 mb-3">
        Drag a class to the timeline to create a task
      </p>

      {/* Class list */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : classes.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500">No classes yet</p>
            <p className="text-xs text-gray-400 mt-1">Add a class to get started</p>
          </div>
        ) : (
          classes.map((classItem) => (
            <ClassCard
              key={classItem.id}
              classItem={classItem}
              isDragging={false}
            />
          ))
        )}
      </div>
    </div>
  );
}
