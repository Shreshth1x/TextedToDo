import { Bell, BellOff, Settings, Menu, X, BarChart3, Plus, Sparkles } from 'lucide-react';

interface NewHeaderProps {
  notificationsEnabled: boolean;
  onToggleNotifications: () => void;
  onOpenSettings: () => void;
  onOpenNewTask: () => void;
  leftSidebarOpen: boolean;
  rightSidebarOpen: boolean;
  onToggleLeftSidebar: () => void;
  onToggleRightSidebar: () => void;
}

export function NewHeader({
  notificationsEnabled,
  onToggleNotifications,
  onOpenSettings,
  onOpenNewTask,
  leftSidebarOpen,
  rightSidebarOpen,
  onToggleLeftSidebar,
  onToggleRightSidebar,
}: NewHeaderProps) {
  return (
    <header className="glass border-b border-white/20 px-4 py-3 flex items-center justify-between shadow-lg">
      {/* Left section */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleLeftSidebar}
          className="lg:hidden p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label={leftSidebarOpen ? 'Close classes sidebar' : 'Open classes sidebar'}
        >
          {leftSidebarOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
            <Sparkles size={16} className="text-white" />
          </div>
          <h1 className="text-xl font-bold">
            <span className="gradient-text">Texted</span>
            <span className="text-gray-800">ToDo</span>
          </h1>
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-1">
        <button
          onClick={onOpenNewTask}
          className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium text-sm shadow-lg hover:shadow-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          aria-label="Add new task"
          title="Add new task"
        >
          <Plus size={18} aria-hidden="true" />
          <span className="hidden sm:inline">New Task</span>
        </button>

        <button
          onClick={onToggleNotifications}
          className={`p-2.5 rounded-xl transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            notificationsEnabled
              ? 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100 shadow-inner'
              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
          }`}
          aria-label={notificationsEnabled ? 'Disable notifications' : 'Enable notifications'}
          aria-pressed={notificationsEnabled}
          title={notificationsEnabled ? 'Notifications enabled' : 'Notifications disabled'}
        >
          {notificationsEnabled ? <Bell size={20} aria-hidden="true" /> : <BellOff size={20} aria-hidden="true" />}
        </button>

        <button
          onClick={onOpenSettings}
          className="p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label="Open settings"
          title="SMS & Notification Settings"
        >
          <Settings size={20} aria-hidden="true" />
        </button>

        <button
          onClick={onToggleRightSidebar}
          className="lg:hidden p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label={rightSidebarOpen ? 'Close analytics sidebar' : 'Open analytics sidebar'}
          title="View analytics"
        >
          {rightSidebarOpen ? <X size={20} aria-hidden="true" /> : <BarChart3 size={20} aria-hidden="true" />}
        </button>
      </div>
    </header>
  );
}
