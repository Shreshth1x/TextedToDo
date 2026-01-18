import { Bell, BellOff, Settings, Menu, X } from 'lucide-react';

interface NewHeaderProps {
  notificationsEnabled: boolean;
  onToggleNotifications: () => void;
  onOpenSettings: () => void;
  leftSidebarOpen: boolean;
  rightSidebarOpen: boolean;
  onToggleLeftSidebar: () => void;
  onToggleRightSidebar: () => void;
}

export function NewHeader({
  notificationsEnabled,
  onToggleNotifications,
  onOpenSettings,
  leftSidebarOpen,
  rightSidebarOpen,
  onToggleLeftSidebar,
  onToggleRightSidebar,
}: NewHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      {/* Left section */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleLeftSidebar}
          className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label={leftSidebarOpen ? 'Close classes sidebar' : 'Open classes sidebar'}
        >
          {leftSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <h1 className="text-xl font-bold text-gray-900">
          <span className="text-indigo-600">Texted</span>ToDo
        </h1>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleNotifications}
          className={`p-2 rounded-lg transition-colors ${
            notificationsEnabled
              ? 'text-indigo-600 hover:bg-indigo-50'
              : 'text-gray-400 hover:bg-gray-100'
          }`}
          aria-label={notificationsEnabled ? 'Disable notifications' : 'Enable notifications'}
          title={notificationsEnabled ? 'Notifications enabled' : 'Notifications disabled'}
        >
          {notificationsEnabled ? <Bell size={20} /> : <BellOff size={20} />}
        </button>

        <button
          onClick={onOpenSettings}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Settings"
          title="SMS & Notification Settings"
        >
          <Settings size={20} />
        </button>

        <button
          onClick={onToggleRightSidebar}
          className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label={rightSidebarOpen ? 'Close analytics' : 'Open analytics'}
        >
          <span className="text-sm font-medium">Stats</span>
        </button>
      </div>
    </header>
  );
}
