import { useState } from 'react';
import { Plus, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { useCreateClass, useUpdateClass, useDeleteClass } from '../hooks/useClasses';
import type { Class } from '../types';

interface ClassListProps {
  classes: Class[];
  isLoading: boolean;
  selectedClassId: string | undefined;
  onClassSelect: (classId: string | undefined) => void;
}

const DEFAULT_COLORS = [
  '#6366f1', // indigo
  '#ec4899', // pink
  '#10b981', // emerald
  '#f59e0b', // amber
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ef4444', // red
  '#06b6d4', // cyan
];

export function ClassList({
  classes,
  isLoading,
  selectedClassId,
  onClassSelect,
}: ClassListProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [selectedColor, setSelectedColor] = useState(DEFAULT_COLORS[0]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const createClass = useCreateClass();
  const updateClass = useUpdateClass();
  const deleteClass = useDeleteClass();

  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;

    try {
      await createClass.mutateAsync({
        name: newClassName.trim(),
        color: selectedColor,
      });
      setNewClassName('');
      setSelectedColor(DEFAULT_COLORS[0]);
      setIsAdding(false);
    } catch (error) {
      console.error('Failed to create class:', error);
    }
  };

  const handleEditClass = async (id: string) => {
    if (!editingName.trim()) return;

    try {
      await updateClass.mutateAsync({
        id,
        updates: { name: editingName.trim() },
      });
      setEditingId(null);
      setEditingName('');
    } catch (error) {
      console.error('Failed to update class:', error);
    }
  };

  const handleDeleteClass = async (id: string) => {
    if (confirm('Delete this class? Tasks in this class will be unassigned.')) {
      try {
        await deleteClass.mutateAsync(id);
        if (selectedClassId === id) {
          onClassSelect(undefined);
        }
      } catch (error) {
        console.error('Failed to delete class:', error);
      }
    }
    setMenuOpenId(null);
  };

  const startEditing = (cls: Class) => {
    setEditingId(cls.id);
    setEditingName(cls.name);
    setMenuOpenId(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
        <div className="h-8 bg-gray-200 rounded animate-pulse" />
        <div className="h-8 bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Classes
        </h3>
        <button
          onClick={() => setIsAdding(true)}
          className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
          aria-label="Add class"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Add class form */}
      {isAdding && (
        <form onSubmit={handleAddClass} className="mb-2 space-y-2">
          <input
            type="text"
            value={newClassName}
            onChange={(e) => setNewClassName(e.target.value)}
            placeholder="Class name"
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            autoFocus
          />
          <div className="flex flex-wrap gap-1">
            {DEFAULT_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setSelectedColor(color)}
                className={`w-5 h-5 rounded-full border-2 ${
                  selectedColor === color ? 'border-gray-800' : 'border-transparent'
                }`}
                style={{ backgroundColor: color }}
                aria-label={`Select color ${color}`}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={createClass.isPending}
              className="flex-1 px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setNewClassName('');
              }}
              className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Class list */}
      <ul className="space-y-1">
        {classes.map((cls) => (
          <li key={cls.id} className="relative">
            {editingId === cls.id ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleEditClass(cls.id);
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-2 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setEditingId(null)}
                  className="px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded"
                >
                  Cancel
                </button>
              </form>
            ) : (
              <div className="flex items-center group">
                <button
                  onClick={() => onClassSelect(selectedClassId === cls.id ? undefined : cls.id)}
                  className={`
                    flex-1 flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
                    transition-colors text-left
                    ${
                      selectedClassId === cls.id
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: cls.color }}
                  />
                  <span className="truncate">{cls.name}</span>
                </button>

                <div className="relative">
                  <button
                    onClick={() => setMenuOpenId(menuOpenId === cls.id ? null : cls.id)}
                    className="p-1.5 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Class options"
                  >
                    <MoreHorizontal size={16} />
                  </button>

                  {menuOpenId === cls.id && (
                    <>
                      <div
                        className="fixed inset-0"
                        onClick={() => setMenuOpenId(null)}
                      />
                      <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                        <button
                          onClick={() => startEditing(cls)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <Pencil size={14} />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClass(cls.id)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>

      {classes.length === 0 && !isAdding && (
        <p className="text-sm text-gray-500 text-center py-4">
          No classes yet. Add one to organize your tasks.
        </p>
      )}
    </div>
  );
}
