import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { startOfDay, endOfDay, parseISO, getHours } from 'date-fns';
import type { Todo, TimeSlot } from '../types';

async function getTodosByDate(date: Date): Promise<Todo[]> {
  const { data, error } = await supabase
    .from('todos')
    .select('*, classes(*)')
    .gte('due_date', startOfDay(date).toISOString())
    .lte('due_date', endOfDay(date).toISOString())
    .order('due_date', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data as Todo[];
}

export function useTodosByDate(date: Date) {
  return useQuery({
    queryKey: ['todos', 'byDate', date.toISOString().split('T')[0]],
    queryFn: () => getTodosByDate(date),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function useTimelineTodos(date: Date) {
  const { data: todos = [], isLoading, isError } = useTodosByDate(date);

  const timeSlots = useMemo(() => {
    const slots: TimeSlot[] = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      todos: [],
    }));

    todos.forEach((todo) => {
      if (todo.due_date) {
        const hour = getHours(parseISO(todo.due_date));
        if (hour >= 0 && hour < 24) {
          slots[hour].todos.push(todo);
        }
      }
    });

    return slots;
  }, [todos]);

  return { timeSlots, todos, isLoading, isError };
}
