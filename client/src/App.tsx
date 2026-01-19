import { useState, lazy, Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppLayout } from './layouts/AppLayout';
import { NewHeader } from './components/NewHeader';
import { TimelineView } from './components/timeline/TimelineView';
import { QuickTaskForm } from './components/timeline/QuickTaskForm';
import { ClassesSidebar } from './components/classes/ClassesSidebar';
import { TodoForm } from './components/TodoForm';
import { SettingsModal } from './components/SettingsModal';
import { DragDropProvider } from './context/DragDropContext';
import { useClasses } from './hooks/useClasses';
import { useNotifications } from './hooks/useNotifications';
import { useRealtimeSubscription } from './hooks/useRealtime';
import type { Todo, Class } from './types';

// Lazy load the heavy AnalyticsSidebar (contains recharts)
const AnalyticsSidebar = lazy(() =>
  import('./components/analytics/AnalyticsSidebar').then((m) => ({
    default: m.AnalyticsSidebar,
  }))
);

// Simple loading placeholder for analytics sidebar
function AnalyticsSidebarFallback() {
  return (
    <div className="p-4 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-24 mb-4" />
      <div className="h-32 bg-gray-200 rounded mb-4" />
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
      </div>
    </div>
  );
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

interface QuickTaskData {
  classItem: Class;
  dropDate: string;
}

function AppContent() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showNewTask, setShowNewTask] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [quickTaskData, setQuickTaskData] = useState<QuickTaskData | null>(null);

  const { data: classes = [] } = useClasses();
  const { isEnabled: notificationsEnabled, toggle: toggleNotifications } = useNotifications();

  // Enable real-time updates from Supabase
  useRealtimeSubscription();

  const handleEditTodo = (todo: Todo) => {
    setEditingTodo(todo);
  };

  const handleCloseEditForm = () => {
    setEditingTodo(null);
  };

  const handleClassDropped = (classItem: Class, dropData: { hour: number; date: string }) => {
    setQuickTaskData({ classItem, dropDate: dropData.date });
  };

  const handleCloseQuickTask = () => {
    setQuickTaskData(null);
  };

  return (
    <DragDropProvider onClassDropped={handleClassDropped}>
      <AppLayout
        leftSidebarOpen={leftSidebarOpen}
        rightSidebarOpen={rightSidebarOpen}
        onCloseLeftSidebar={() => setLeftSidebarOpen(false)}
        onCloseRightSidebar={() => setRightSidebarOpen(false)}
        header={
          <NewHeader
            notificationsEnabled={notificationsEnabled}
            onToggleNotifications={toggleNotifications}
            onOpenSettings={() => setShowSettings(true)}
            onOpenNewTask={() => setShowNewTask(true)}
            leftSidebarOpen={leftSidebarOpen}
            rightSidebarOpen={rightSidebarOpen}
            onToggleLeftSidebar={() => setLeftSidebarOpen(!leftSidebarOpen)}
            onToggleRightSidebar={() => setRightSidebarOpen(!rightSidebarOpen)}
          />
        }
        leftSidebar={<ClassesSidebar />}
        main={
          <TimelineView
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            onEditTodo={handleEditTodo}
          />
        }
        rightSidebar={
          <Suspense fallback={<AnalyticsSidebarFallback />}>
            <AnalyticsSidebar
              selectedDate={selectedDate}
              onTaskClick={handleEditTodo}
            />
          </Suspense>
        }
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />

      {/* Edit Todo Form Modal */}
      {editingTodo && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg">
            <TodoForm
              editingTodo={editingTodo}
              onClose={handleCloseEditForm}
              classes={classes}
            />
          </div>
        </div>
      )}

      {/* New Todo Form Modal */}
      {showNewTask && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg">
            <TodoForm
              onClose={() => setShowNewTask(false)}
              classes={classes}
            />
          </div>
        </div>
      )}

      {/* Quick Task Form Modal */}
      {quickTaskData && (
        <QuickTaskForm
          classItem={quickTaskData.classItem}
          dropDate={quickTaskData.dropDate}
          onClose={handleCloseQuickTask}
        />
      )}
    </DragDropProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

export default App;
