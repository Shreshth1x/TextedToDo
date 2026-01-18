import { Bell, BellOff, Menu, MessageSquare } from 'lucide-react';

interface HeaderProps {
  notificationsEnabled: boolean;
  onToggleNotifications: () => void;
  onToggleSidebar: () => void;
  onOpenSettings: () => void;
}

export function Header({
  notificationsEnabled,
  onToggleNotifications,
  onToggleSidebar,
  onOpenSettings,
}: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label="Toggle sidebar"
        >
          <Menu size={20} aria-hidden="true" />
        </button>
        <h1 className="text-xl font-semibold text-gray-900">TextedToDo</h1>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onOpenSettings}
          className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
          aria-label="SMS Settings"
          title="SMS Settings"
        >
          <MessageSquare size={20} aria-hidden="true" />
        </button>
        <button
          onClick={onToggleNotifications}
          className={`p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 ${
            notificationsEnabled
              ? 'text-indigo-600 hover:bg-indigo-50'
              : 'text-gray-400 hover:bg-gray-100'
          }`}
          aria-label={notificationsEnabled ? 'Disable notifications' : 'Enable notifications'}
          title={notificationsEnabled ? 'Notifications enabled' : 'Notifications disabled'}
        >
          {notificationsEnabled ? <Bell size={20} aria-hidden="true" /> : <BellOff size={20} aria-hidden="true" />}
        </button>
      </div>
    </header>
  );
}
