import { useState } from 'react';
import { CheckSquare, Square, ListTodo, Plus, Loader2, Trash2 } from 'lucide-react';
import { useUndatedTodos, useToggleTodoComplete, useCreateTodo, useDeleteTodo } from '../../hooks/useTodos';
import type { Todo } from '../../types';

interface ChecklistSectionProps {
  onTaskClick: (todo: Todo) => void;
}

export function ChecklistSection({ onTaskClick }: ChecklistSectionProps) {
  const { data: undatedTodos = [], isLoading } = useUndatedTodos();
  const toggleComplete = useToggleTodoComplete();
  const createTodo = useCreateTodo();
  const deleteTodo = useDeleteTodo();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const handleToggle = (e: React.MouseEvent, todo: Todo) => {
    e.stopPropagation();
    toggleComplete.mutate({ id: todo.id, completed: !todo.completed, todo });
  };

  const handleDelete = (e: React.MouseEvent, todoId: string) => {
    e.stopPropagation();
    deleteTodo.mutate(todoId);
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      await createTodo.mutateAsync({
        title: newTaskTitle.trim(),
        priority: 'medium',
      });
      setNewTaskTitle('');
      setShowAddForm(false);
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-indigo-600">
          <ListTodo size={18} />
          <span className="text-sm font-medium">
            Quick Tasks {undatedTodos.length > 0 && `(${undatedTodos.length})`}
          </span>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="p-1 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
          aria-label="Add quick task"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Quick add form */}
      {showAddForm && (
        <form onSubmit={handleAddTask} className="flex gap-2">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Add a quick task..."
            className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            autoFocus
          />
          <button
            type="submit"
            disabled={!newTaskTitle.trim() || createTodo.isPending}
            className="px-2 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {createTodo.isPending ? <Loader2 size={14} className="animate-spin" /> : 'Add'}
          </button>
        </form>
      )}

      {undatedTodos.length === 0 && !showAddForm ? (
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-400">No quick tasks yet. Click + to add one!</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {undatedTodos.map((task) => (
            <div
              key={task.id}
              onClick={() => onTaskClick(task)}
              className="group w-full text-left p-2 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors cursor-pointer flex items-start gap-2"
            >
              <button
                onClick={(e) => handleToggle(e, task)}
                className="mt-0.5 text-indigo-600 hover:text-indigo-800 transition-colors flex-shrink-0"
              >
                {task.completed ? <CheckSquare size={16} /> : <Square size={16} />}
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
                {task.classes && (
                  <span
                    className="inline-flex items-center px-1.5 py-0.5 rounded text-xs mt-1"
                    style={{
                      backgroundColor: `${task.classes.color}20`,
                      color: task.classes.color,
                    }}
                  >
                    {task.classes.name}
                  </span>
                )}
              </div>
              <button
                onClick={(e) => handleDelete(e, task.id)}
                className="mt-0.5 p-1 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                aria-label={`Delete ${task.title}`}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
