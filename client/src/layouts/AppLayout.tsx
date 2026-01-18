import type { ReactNode } from 'react';

interface AppLayoutProps {
  header: ReactNode;
  leftSidebar: ReactNode;
  main: ReactNode;
  rightSidebar: ReactNode;
  leftSidebarOpen: boolean;
  rightSidebarOpen: boolean;
  onCloseLeftSidebar: () => void;
  onCloseRightSidebar: () => void;
}

export function AppLayout({
  header,
  leftSidebar,
  main,
  rightSidebar,
  leftSidebarOpen,
  rightSidebarOpen,
  onCloseLeftSidebar,
  onCloseRightSidebar,
}: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      {header}

      <div className="flex h-[calc(100vh-57px)]">
        {/* Mobile overlay for left sidebar */}
        {leftSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/20 z-20 lg:hidden"
            onClick={onCloseLeftSidebar}
            aria-hidden="true"
          />
        )}

        {/* Left Sidebar - Classes */}
        <aside
          className={`
            fixed lg:static inset-y-0 left-0 z-30
            w-72 bg-white border-r border-gray-200
            transform transition-transform duration-200 ease-in-out
            ${leftSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            overflow-y-auto
          `}
        >
          {leftSidebar}
        </aside>

        {/* Main Content - Timeline */}
        <main className="flex-1 overflow-hidden p-4 lg:p-6">
          {main}
        </main>

        {/* Mobile overlay for right sidebar */}
        {rightSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/20 z-20 lg:hidden"
            onClick={onCloseRightSidebar}
            aria-hidden="true"
          />
        )}

        {/* Right Sidebar - Analytics */}
        <aside
          className={`
            fixed lg:static inset-y-0 right-0 z-30
            w-72 bg-white border-l border-gray-200
            transform transition-transform duration-200 ease-in-out
            ${rightSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
            overflow-y-auto
          `}
        >
          {rightSidebar}
        </aside>
      </div>
    </div>
  );
}
