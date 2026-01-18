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
  { hex: '#6366f1', name: 'Indigo' },
  { hex: '#ec4899', name: 'Pink' },
  { hex: '#10b981', name: 'Emerald' },
  { hex: '#f59e0b', name: 'Amber' },
  { hex: '#3b82f6', name: 'Blue' },
  { hex: '#8b5cf6', name: 'Violet' },
  { hex: '#ef4444', name: 'Red' },
  { hex: '#06b6d4', name: 'Cyan' },
];

export function ClassList({
  classes,
  isLoading,
  selectedClassId,
  onClassSelect,
}: ClassListProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [selectedColor, setSelectedColor] = useState(DEFAULT_COLORS[0].hex);
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
      setSelectedColor(DEFAULT_COLORS[0].hex);
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
          <label htmlFor="new-class-name" className="sr-only">Class name</label>
          <input
            id="new-class-name"
            type="text"
            value={newClassName}
            onChange={(e) => setNewClassName(e.target.value)}
            placeholder="Class name"
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            autoFocus
            aria-required="true"
          />
          <fieldset>
            <legend className="sr-only">Select a color</legend>
            <div className="flex flex-wrap gap-1" role="radiogroup" aria-label="Class color">
              {DEFAULT_COLORS.map((color) => (
                <button
                  key={color.hex}
                  type="button"
                  onClick={() => setSelectedColor(color.hex)}
                  className={`w-5 h-5 rounded-full border-2 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 ${
                    selectedColor === color.hex ? 'border-gray-800' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color.hex }}
                  aria-label={color.name}
                  aria-pressed={selectedColor === color.hex}
                  role="radio"
                  aria-checked={selectedColor === color.hex}
                />
              ))}
            </div>
          </fieldset>
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
                <label htmlFor={`edit-class-${cls.id}`} className="sr-only">Edit class name</label>
                <input
                  id={`edit-class-${cls.id}`}
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  autoFocus
                  aria-required="true"
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
                    onKeyDown={(e) => {
                      if (e.key === 'Escape' && menuOpenId === cls.id) {
                        setMenuOpenId(null);
                      }
                    }}
                    className="p-1.5 text-gray-400 hover:text-gray-600 focus:text-gray-600 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                    aria-label={`Options for ${cls.name}`}
                    aria-expanded={menuOpenId === cls.id}
                    aria-haspopup="menu"
                  >
                    <MoreHorizontal size={16} />
                  </button>

                  {menuOpenId === cls.id && (
                    <>
                      <div
                        className="fixed inset-0"
                        onClick={() => setMenuOpenId(null)}
                        aria-hidden="true"
                      />
                      <div
                        className="absolute right-0 top-full mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-10"
                        role="menu"
                        aria-label={`${cls.name} actions`}
                        onKeyDown={(e) => {
                          if (e.key === 'Escape') {
                            setMenuOpenId(null);
                          }
                        }}
                      >
                        <button
                          onClick={() => startEditing(cls)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                          role="menuitem"
                        >
                          <Pencil size={14} aria-hidden="true" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClass(cls.id)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 focus:bg-red-50 focus:outline-none"
                          role="menuitem"
                        >
                          <Trash2 size={14} aria-hidden="true" />
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
