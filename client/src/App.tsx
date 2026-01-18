import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppLayout } from './layouts/AppLayout';
import { NewHeader } from './components/NewHeader';
import { TimelineView } from './components/timeline/TimelineView';
import { QuickTaskForm } from './components/timeline/QuickTaskForm';
import { ClassesSidebar } from './components/classes/ClassesSidebar';
import { AnalyticsSidebar } from './components/analytics/AnalyticsSidebar';
import { TodoForm } from './components/TodoForm';
import { SettingsModal } from './components/SettingsModal';
import { DragDropProvider } from './context/DragDropContext';
import { useClasses } from './hooks/useClasses';
import { useNotifications } from './hooks/useNotifications';
import { useRealtimeSubscription } from './hooks/useRealtime';
import type { Todo, Class } from './types';

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
          <AnalyticsSidebar
            selectedDate={selectedDate}
            onTaskClick={handleEditTodo}
          />
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
