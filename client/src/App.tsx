import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { TodoList } from './components/TodoList';
import { TodoForm } from './components/TodoForm';
import { TodoFilters } from './components/TodoFilters';
import { useTodos } from './hooks/useTodos';
import { useClasses } from './hooks/useClasses';
import { useNotifications } from './hooks/useNotifications';
import { useRealtimeSubscription } from './hooks/useRealtime';
import type { Todo, FilterPreset, Priority, SortOption } from './types';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterPreset>('all');
  const [selectedClassId, setSelectedClassId] = useState<string | undefined>();
  const [priorityFilter, setPriorityFilter] = useState<Priority | undefined>();
  const [sortBy, setSortBy] = useState<SortOption>('due_date');
  const [showCompleted, setShowCompleted] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);

  // Determine filter based on showCompleted toggle
  const effectiveFilter = showCompleted ? 'completed' : activeFilter === 'completed' ? 'all' : activeFilter;

  const { data: todos = [], isLoading: isLoadingTodos } = useTodos(
    effectiveFilter,
    selectedClassId,
    priorityFilter,
    sortBy
  );
  const { data: classes = [], isLoading: isLoadingClasses } = useClasses();
  const { isEnabled: notificationsEnabled, toggle: toggleNotifications } = useNotifications();

  // Enable real-time updates from Supabase
  useRealtimeSubscription();

  // Filter out completed todos unless showCompleted is true or we're on the completed filter
  const filteredTodos = showCompleted || activeFilter === 'completed'
    ? todos
    : todos.filter((todo) => !todo.completed);

  const handleEditTodo = (todo: Todo) => {
    setEditingTodo(todo);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingTodo(null);
  };

  const getFilterTitle = () => {
    if (selectedClassId) {
      const cls = classes.find((c) => c.id === selectedClassId);
      return cls?.name || 'Tasks';
    }
    switch (activeFilter) {
      case 'today':
        return 'Today';
      case 'upcoming':
        return 'Upcoming';
      case 'completed':
        return 'Completed';
      default:
        return 'All Tasks';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header
        notificationsEnabled={notificationsEnabled}
        onToggleNotifications={toggleNotifications}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex h-[calc(100vh-57px)]">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          selectedClassId={selectedClassId}
          onClassSelect={setSelectedClassId}
          classes={classes}
          isLoadingClasses={isLoadingClasses}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-3xl mx-auto">
            {/* Header with title and add button */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-gray-900">
                {getFilterTitle()}
              </h2>
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Plus size={18} />
                <span className="hidden sm:inline">Add Task</span>
              </button>
            </div>

            {/* Filters */}
            <div className="mb-4">
              <TodoFilters
                priorityFilter={priorityFilter}
                onPriorityFilterChange={setPriorityFilter}
                sortBy={sortBy}
                onSortChange={setSortBy}
                showCompleted={showCompleted}
                onShowCompletedChange={setShowCompleted}
              />
            </div>

            {/* Todo form (collapsible) */}
            {showForm && (
              <div className="mb-6">
                <TodoForm
                  editingTodo={editingTodo}
                  onClose={handleCloseForm}
                  classes={classes}
                />
              </div>
            )}

            {/* Todo list */}
            <TodoList
              todos={filteredTodos}
              isLoading={isLoadingTodos}
              onEditTodo={handleEditTodo}
            />
          </div>
        </main>
      </div>
    </div>
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
