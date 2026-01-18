import { useDraggable } from '@dnd-kit/core';
import { GripVertical } from 'lucide-react';
import type { Class } from '../../types';

interface ClassCardProps {
  classItem: Class;
  isDragging?: boolean;
}

export function ClassCard({ classItem, isDragging }: ClassCardProps) {
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        group flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200
        cursor-grab active:cursor-grabbing
        hover:shadow-md transition-shadow
        ${isDragging ? 'shadow-lg opacity-90 ring-2 ring-indigo-500' : ''}
      `}
      {...listeners}
      {...attributes}
    >
      <div
        className="w-3 h-3 rounded-full flex-shrink-0"
        style={{ backgroundColor: classItem.color }}
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-base">{classItem.icon || '📚'}</span>
          <p className="text-sm font-medium text-gray-900 truncate">
            {classItem.name}
          </p>
        </div>
        {classItem.description && (
          <p className="text-xs text-gray-500 truncate mt-0.5">
            {classItem.description}
          </p>
        )}
      </div>

      <GripVertical
        size={16}
        className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
      />
    </div>
  );
}

export function ClassCardDragOverlay({ classItem }: { classItem: Class }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 shadow-lg ring-2 ring-indigo-500">
      <div
        className="w-3 h-3 rounded-full flex-shrink-0"
        style={{ backgroundColor: classItem.color }}
      />
      <div className="flex items-center gap-2">
        <span className="text-base">{classItem.icon || '📚'}</span>
        <p className="text-sm font-medium text-gray-900">{classItem.name}</p>
      </div>
    </div>
  );
}
