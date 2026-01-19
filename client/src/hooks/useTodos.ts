import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getTodos,
  getTodoById,
  createTodo,
  updateTodo,
  toggleTodoComplete,
  deleteTodo,
  createRecurringTodo,
  getUndatedTodos,
} from '../api/todos';
import type { Todo, TodoFormData, Priority, FilterPreset, SortOption } from '../types';

export function useTodos(
  filter?: FilterPreset,
  classId?: string,
  priority?: Priority,
  sortBy?: SortOption
) {
  return useQuery({
    queryKey: ['todos', filter, classId, priority, sortBy],
    queryFn: () => getTodos(filter, classId, priority, sortBy),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function useTodo(id: string) {
  return useQuery({
    queryKey: ['todos', id],
    queryFn: () => getTodoById(id),
    enabled: !!id,
  });
}

export function useCreateTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (todo: TodoFormData) => createTodo(todo),
    onSuccess: () => {
      // Invalidate all todo queries including undated and analytics
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
}

export function useUpdateTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<TodoFormData & { completed: boolean }> }) =>
      updateTodo(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
}

export function useToggleTodoComplete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, completed, todo }: { id: string; completed: boolean; todo?: Todo }) => {
      const updatedTodo = await toggleTodoComplete(id, completed);

      // If completing a recurring todo, create the next occurrence
      if (completed && todo && todo.recurrence_type) {
        await createRecurringTodo(todo);
      }

      return updatedTodo;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
}

export function useDeleteTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTodo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
}

export function useUndatedTodos() {
  return useQuery({
    queryKey: ['todos', 'undated'],
    queryFn: getUndatedTodos,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}
