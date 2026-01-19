import { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { GripVertical, Trash2, X } from 'lucide-react';
import { useDeleteClass } from '../../hooks/useClasses';
import type { Class } from '../../types';

interface ClassCardProps {
  classItem: Class;
  isDragging?: boolean;
}

export function ClassCard({ classItem, isDragging }: ClassCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const deleteClass = useDeleteClass();

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `class-${classItem.id}`,
    data: {
      type: 'class',
      class: classItem,
    },
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteClass.mutateAsync(classItem.id);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Failed to delete class:', error);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(false);
  };

  if (showDeleteConfirm) {
    return (
      <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl border-2 border-red-200 animate-pulse">
        <span className="text-sm text-red-700 flex-1 font-medium">Delete "{classItem.name}"?</span>
        <button
          onClick={handleDelete}
          disabled={deleteClass.isPending}
          className="px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-red-500 to-pink-500 rounded-xl hover:from-red-600 hover:to-pink-600 disabled:opacity-50 transition-all active:scale-95 shadow-md"
        >
          {deleteClass.isPending ? '...' : 'Delete'}
        </button>
        <button
          onClick={handleCancelDelete}
          className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-white rounded-lg transition-all"
        >
          <X size={14} />
        </button>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        background: `linear-gradient(135deg, ${classItem.color}15 0%, ${classItem.color}05 100%)`,
        borderColor: `${classItem.color}40`,
      }}
      role="button"
      aria-label={`Drag ${classItem.name} to timeline to create task`}
      aria-grabbed={isDragging}
      tabIndex={0}
      className={`
        group flex items-center gap-3 p-3 rounded-2xl border-2
        cursor-grab active:cursor-grabbing
        hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
        ${isDragging ? 'shadow-xl opacity-90 ring-2 ring-indigo-500 scale-105' : ''}
      `}
      {...listeners}
      {...attributes}
    >
      <div
        className="w-4 h-4 rounded-lg flex-shrink-0 shadow-sm"
        style={{ backgroundColor: classItem.color }}
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-base">{classItem.icon || '📚'}</span>
          <p className="text-sm font-semibold text-gray-800 truncate">
            {classItem.name}
          </p>
        </div>
        {classItem.description && (
          <p className="text-xs text-gray-500 truncate mt-0.5">
            {classItem.description}
          </p>
        )}
      </div>

      {/* Delete button - shows on hover */}
      <button
        onClick={handleDeleteClick}
        onPointerDown={(e) => e.stopPropagation()}
        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
        aria-label={`Delete ${classItem.name}`}
      >
        <Trash2 size={14} />
      </button>

      <GripVertical
        size={16}
        aria-hidden="true"
        className="text-gray-300 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity flex-shrink-0"
      />
    </div>
  );
}

export function ClassCardDragOverlay({ classItem }: { classItem: Class }) {
  return (
    <div 
      className="flex items-center gap-3 p-3 bg-white rounded-2xl border-2 shadow-2xl ring-2 ring-indigo-500"
      style={{ borderColor: classItem.color }}
    >
      <div
        className="w-4 h-4 rounded-lg flex-shrink-0"
        style={{ backgroundColor: classItem.color }}
      />
      <div className="flex items-center gap-2">
        <span className="text-base">{classItem.icon || '📚'}</span>
        <p className="text-sm font-semibold text-gray-800">{classItem.name}</p>
      </div>
    </div>
  );
}
