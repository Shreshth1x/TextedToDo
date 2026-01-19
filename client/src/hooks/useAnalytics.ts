import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { startOfDay, endOfDay, isBefore } from 'date-fns';
import type { Todo } from '../types';

async function getTodosForAnalytics(): Promise<Todo[]> {
  // Fetch all todos - simpler query that won't hang
  const { data, error } = await supabase
    .from('todos')
    .select('id, title, due_date, completed, priority, class_id, classes(id, name, color)')
    .order('due_date', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data as Todo[];
}

export function useAnalytics(selectedDate: Date) {
  const { data: allTodos = [], isLoading } = useQuery({
    queryKey: ['todos', 'analytics'],
    queryFn: getTodosForAnalytics,
    staleTime: 1000 * 60 * 10, // 10 minutes - analytics can be slightly stale
  });

  const analytics = useMemo(() => {
    const now = new Date();
    const dayStart = startOfDay(selectedDate);
    const dayEnd = endOfDay(selectedDate);

    // Today's tasks
    const todaysTasks = allTodos.filter((todo) => {
      if (!todo.due_date) return false;
      const dueDate = new Date(todo.due_date);
      return dueDate >= dayStart && dueDate <= dayEnd;
    });

    const completedToday = todaysTasks.filter((t) => t.completed).length;
    const totalToday = todaysTasks.length;
    const pendingToday = totalToday - completedToday;

    // Overdue/missed tasks (past due date and not completed)
    const missedTasks = allTodos.filter((todo) => {
      if (todo.completed || !todo.due_date) return false;
      const dueDate = new Date(todo.due_date);
      return isBefore(dueDate, now);
    });

    // Completion percentage
    const completionRate = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0;

    // Chart data for pie chart
    const chartData = [
      { name: 'Completed', value: completedToday, fill: '#22c55e' },
      { name: 'Pending', value: pendingToday, fill: '#e5e7eb' },
    ];

    return {
      todaysTasks,
      completedToday,
      pendingToday,
      totalToday,
      missedTasks,
      completionRate,
      chartData,
    };
  }, [allTodos, selectedDate]);

  return { ...analytics, isLoading };
}
