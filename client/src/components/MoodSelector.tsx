import { useState, useRef, useEffect } from 'react';
import { Palette, Check } from 'lucide-react';

type ThemeOption = {
  id: string;
  name: string;
  primary: string;
  accent: string;
};

const themes: ThemeOption[] = [
  { id: 'default', name: 'Indigo', primary: '#6366f1', accent: '#4f46e5' },
  { id: 'ocean', name: 'Ocean', primary: '#0ea5e9', accent: '#0284c7' },
  { id: 'forest', name: 'Forest', primary: '#22c55e', accent: '#16a34a' },
  { id: 'sunset', name: 'Sunset', primary: '#f97316', accent: '#ea580c' },
  { id: 'rose', name: 'Rose', primary: '#ec4899', accent: '#db2777' },
  { id: 'purple', name: 'Purple', primary: '#a855f7', accent: '#9333ea' },
];

interface MoodSelectorProps {
  currentTheme: string;
  onThemeChange: (themeId: string) => void;
}

export function MoodSelector({ currentTheme, onThemeChange }: MoodSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const selectedTheme = themes.find((t) => t.id === currentTheme) || themes[0];

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Change theme"
      >
        <Palette size={18} />
        <div
          className="w-4 h-4 rounded-full"
          style={{ backgroundColor: selectedTheme.primary }}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-3 w-48">
          <p className="text-xs font-medium text-gray-500 mb-2">Theme</p>
          <div className="space-y-1">
            {themes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => {
                  onThemeChange(theme.id);
                  setIsOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-2 py-2 rounded-lg transition-colors
                  ${currentTheme === theme.id ? 'bg-gray-100' : 'hover:bg-gray-50'}
                `}
              >
                <div
                  className="w-5 h-5 rounded-full"
                  style={{ backgroundColor: theme.primary }}
                />
                <span className="text-sm text-gray-700 flex-1 text-left">{theme.name}</span>
                {currentTheme === theme.id && (
                  <Check size={16} className="text-indigo-600" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
