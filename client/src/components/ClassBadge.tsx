import type { Class } from '../types';

interface ClassBadgeProps {
  classInfo: Class | null | undefined;
  size?: 'sm' | 'md';
}

export function ClassBadge({ classInfo, size = 'sm' }: ClassBadgeProps) {
  if (!classInfo) return null;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${sizeClasses[size]}`}
      style={{
        backgroundColor: `${classInfo.color}15`,
        color: classInfo.color,
      }}
    >
      <span
        className="w-2 h-2 rounded-full"
        style={{ backgroundColor: classInfo.color }}
      />
      {classInfo.name}
    </span>
  );
}
