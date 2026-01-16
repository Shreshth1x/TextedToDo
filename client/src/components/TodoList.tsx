import { TodoItem } from './TodoItem';
import { ClipboardList } from 'lucide-react';
import type { Todo } from '../types';

interface TodoListProps {
  todos: Todo[];
  isLoading: boolean;
  onEditTodo: (todo: Todo) => void;
}

export function TodoList({ todos, isLoading, onEditTodo }: TodoListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-24 bg-gray-100 rounded-lg animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (todos.length === 0) {
    return (
      <div className="text-center py-12">
        <ClipboardList className="mx-auto h-12 w-12 text-gray-400" />
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
