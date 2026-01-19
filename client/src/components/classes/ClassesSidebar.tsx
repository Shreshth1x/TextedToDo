import { useState } from 'react';
import { Plus, Loader2, AlertCircle } from 'lucide-react';
import { ClassCard } from './ClassCard';
import { useClasses, useCreateClass } from '../../hooks/useClasses';

const DEFAULT_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4',
  '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899',
];

export function ClassesSidebar() {
  const { data: classes = [], isLoading } = useClasses();
  const createClass = useCreateClass();
  const [showForm, setShowForm] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [selectedColor, setSelectedColor] = useState(DEFAULT_COLORS[0]);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;

    setError(null);

    try {
      await createClass.mutateAsync({
        name: newClassName.trim(),
        color: selectedColor,
      });

      setNewClassName('');
      setShowForm(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create class';
      // Check for unique constraint violation
      if (message.includes('duplicate') || message.includes('unique') || message.includes('already exists')) {
        setError('A class with this name already exists');
      } else {
        setError(message);
      }
    }
  };

  return (
    <div className="h-full flex flex-col p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-6 rounded-full bg-gradient-to-b from-indigo-500 to-purple-600" />
          <h2 className="text-lg font-bold text-gray-800">Classes</h2>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className={`p-2 rounded-xl transition-all duration-200 active:scale-95 ${
            showForm 
              ? 'bg-gray-200 text-gray-600 rotate-45' 
              : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg hover:shadow-xl'
          }`}
          aria-label="Add class"
        >
          <Plus size={18} />
        </button>
      </div>

      {/* Quick add form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-4 p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl space-y-4 border border-indigo-100">
          {/* Error message */}
          {error && (
            <div className="flex items-center gap-2 p-3 text-sm text-red-700 bg-red-50 rounded-xl border border-red-200">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label htmlFor="new-class-name" className="block text-xs font-semibold text-gray-700 mb-1.5">
              Class name
            </label>
            <input
              id="new-class-name"
              type="text"
              value={newClassName}
              onChange={(e) => {
                setNewClassName(e.target.value);
                setError(null);
              }}
              placeholder="e.g., Math 101"
              className={`w-full px-4 py-2.5 text-sm border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
                error ? 'border-red-300' : 'border-gray-200'
              }`}
              autoFocus
            />
          </div>

          {/* Color picker */}
          <fieldset>
            <legend className="block text-xs font-semibold text-gray-700 mb-2">Pick a color</legend>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Select class color">
              {DEFAULT_COLORS.map((color, index) => {
                const colorNames = ['Red', 'Orange', 'Yellow', 'Green', 'Cyan', 'Blue', 'Indigo', 'Purple', 'Pink'];
                return (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    role="radio"
                    aria-checked={selectedColor === color}
                    className={`w-8 h-8 rounded-xl transition-all duration-200 active:scale-90 focus:outline-none shadow-sm hover:shadow-md ${
                      selectedColor === color ? 'ring-2 ring-offset-2 ring-gray-800 scale-110 shadow-lg' : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                    aria-label={colorNames[index] || color}
                  />
                );
              })}
            </div>
          </fieldset>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={!newClassName.trim() || createClass.isPending}
              className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-98 shadow-lg hover:shadow-xl"
            >
              {createClass.isPending ? 'Adding...' : 'Add Class'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2.5 text-sm font-medium text-gray-600 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200 active:scale-98"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Drag instruction */}
      <div className="flex items-center gap-2 px-3 py-2 mb-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
        <span className="text-amber-500">💡</span>
        <p className="text-xs text-amber-700 font-medium">
          Drag a class to the timeline to create a task
        </p>
      </div>

      {/* Class list */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
          </div>
        ) : classes.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
              <span className="text-3xl">📚</span>
            </div>
            <p className="text-sm font-medium text-gray-600">No classes yet</p>
            <p className="text-xs text-gray-400 mt-1">Add your first class to get started!</p>
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
