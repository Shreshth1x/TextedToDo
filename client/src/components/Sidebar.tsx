import { Calendar, CalendarDays, CheckCircle, List, X } from 'lucide-react';
import { ClassList } from './ClassList';
import type { FilterPreset, Class } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeFilter: FilterPreset;
  onFilterChange: (filter: FilterPreset) => void;
  selectedClassId: string | undefined;
  onClassSelect: (classId: string | undefined) => void;
  classes: Class[];
  isLoadingClasses: boolean;
}

const filterPresets = [
  { id: 'all' as const, label: 'All Tasks', icon: List },
  { id: 'today' as const, label: 'Today', icon: Calendar },
  { id: 'upcoming' as const, label: 'Upcoming', icon: CalendarDays },
  { id: 'completed' as const, label: 'Completed', icon: CheckCircle },
];

export function Sidebar({
  isOpen,
  onClose,
  activeFilter,
  onFilterChange,
  selectedClassId,
  onClassSelect,
  classes,
  isLoadingClasses,
}: SidebarProps) {
  const handleFilterClick = (filter: FilterPreset) => {
    onFilterChange(filter);
    onClassSelect(undefined);
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-20 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-30
          w-64 bg-gray-50 border-r border-gray-200
          transform transition-transform duration-200 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div className="h-full flex flex-col">
          {/* Mobile close button */}
          <div className="md:hidden flex justify-end p-2">
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
              aria-label="Close sidebar"
            >
              <X size={20} />
            </button>
          </div>

          {/* Filter presets */}
          <nav className="p-3">
            <ul className="space-y-1">
              {filterPresets.map((preset) => {
                const Icon = preset.icon;
                const isActive = activeFilter === preset.id && !selectedClassId;
                return (
                  <li key={preset.id}>
                    <button
                      onClick={() => handleFilterClick(preset.id)}
                      className={`
                        w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium
                        transition-colors
                        ${
                          isActive
                            ? 'bg-indigo-100 text-indigo-700'
                            : 'text-gray-700 hover:bg-gray-100'
                        }
                      `}
                    >
                      <Icon size={18} />
                      {preset.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Divider */}
          <div className="px-3">
            <div className="h-px bg-gray-200" />
          </div>

          {/* Classes */}
          <div className="flex-1 p-3 overflow-y-auto">
            <ClassList
              classes={classes}
              isLoading={isLoadingClasses}
              selectedClassId={selectedClassId}
              onClassSelect={onClassSelect}
            />
          </div>
        </div>
      </aside>
    </>
  );
}
