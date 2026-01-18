import { TodoItem } from './TodoItem';
import { ClipboardList, AlertCircle } from 'lucide-react';
import type { Todo } from '../types';

interface TodoListProps {
  todos: Todo[];
  isLoading: boolean;
  isError?: boolean;
  onEditTodo: (todo: Todo) => void;
}

export function TodoList({ todos, isLoading, isError, onEditTodo }: TodoListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3" aria-busy="true" aria-label="Loading tasks">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-24 bg-gray-100 rounded-lg animate-pulse"
            aria-hidden="true"
          />
        ))}
        <span className="sr-only">Loading tasks...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12" role="alert">
        <AlertCircle className="mx-auto h-12 w-12 text-red-400" aria-hidden="true" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">Failed to load tasks</h3>
        <p className="mt-2 text-sm text-gray-500">
          Please check your connection and try again.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (todos.length === 0) {
    return (
      <div className="text-center py-12">
        <ClipboardList className="mx-auto h-12 w-12 text-gray-400" aria-hidden="true" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">No tasks</h3>
        <p className="mt-2 text-sm text-gray-500">
          Add a new task to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} onEdit={onEditTodo} />
      ))}
    </div>
  );
}
