import { createContext, useState, type ReactNode } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import { ClassCardDragOverlay } from '../components/classes/ClassCard';
import type { Class } from '../types';

interface DragDropContextValue {
  activeClass: Class | null;
}

const DragDropCtx = createContext<DragDropContextValue | null>(null);

interface DragDropProviderProps {
  children: ReactNode;
  onClassDropped: (classItem: Class, dropData: { hour: number; date: string }) => void;
}

export function DragDropProvider({ children, onClassDropped }: DragDropProviderProps) {
  const [activeClass, setActiveClass] = useState<Class | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const data = active.data.current;

    if (data?.type === 'class') {
      setActiveClass(data.class as Class);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { over } = event;

    if (over && activeClass) {
      const dropData = over.data.current as { hour: number; date: string } | undefined;
      if (dropData?.hour !== undefined && dropData?.date) {
        onClassDropped(activeClass, dropData);
      }
    }

    setActiveClass(null);
  };

  const handleDragCancel = () => {
    setActiveClass(null);
  };

  return (
    <DragDropCtx.Provider value={{ activeClass }}>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        {children}
        <DragOverlay>
          {activeClass && <ClassCardDragOverlay classItem={activeClass} />}
        </DragOverlay>
      </DndContext>
    </DragDropCtx.Provider>
  );
}
