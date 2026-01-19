import { supabase } from '../lib/supabase';
import type { Todo, TodoFormData, Priority, FilterPreset, SortOption } from '../types';
import { startOfDay, endOfDay, addDays } from 'date-fns';

export async function getTodos(
  filter?: FilterPreset,
  classId?: string,
  priority?: Priority,
  sortBy: SortOption = 'due_date'
): Promise<Todo[]> {
  let query = supabase
    .from('todos')
    .select('*, classes(*)');

  // Apply filter presets
  if (filter === 'today') {
    const today = new Date();
    query = query
      .gte('due_date', startOfDay(today).toISOString())
      .lte('due_date', endOfDay(today).toISOString())
      .eq('completed', false);
  } else if (filter === 'upcoming') {
    const today = new Date();
    const nextWeek = addDays(today, 7);
    query = query
      .gte('due_date', startOfDay(today).toISOString())
      .lte('due_date', endOfDay(nextWeek).toISOString())
      .eq('completed', false);
  } else if (filter === 'completed') {
    query = query.eq('completed', true);
  }

  // Apply class filter
  if (classId) {
    query = query.eq('class_id', classId);
  }

  // Apply priority filter
  if (priority) {
    query = query.eq('priority', priority);
  }

  // Apply sorting
  if (sortBy === 'due_date') {
    query = query.order('due_date', { ascending: true, nullsFirst: false });
  } else if (sortBy === 'priority') {
    // Priority order: high > medium > low
    query = query.order('priority', { ascending: true });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return data as Todo[];
}

export async function getTodoById(id: string): Promise<Todo | null> {
  const { data, error } = await supabase
    .from('todos')
    .select('*, classes(*)')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(error.message);
  }

  return data as Todo;
}

export async function createTodo(todo: TodoFormData): Promise<Todo> {
  const { data, error } = await supabase
    .from('todos')
    .insert({
      title: todo.title,
      description: todo.description || null,
      due_date: todo.due_date || null,
      reminder_time: todo.reminder_time || null,
      class_id: todo.class_id || null,
      priority: todo.priority,
      recurrence_type: todo.recurrence_type || null,
      recurrence_interval: todo.recurrence_interval || 1,
      recurrence_end_date: todo.recurrence_end_date || null,
    })
    .select('*, classes(*)')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Todo;
}

export async function updateTodo(id: string, updates: Partial<TodoFormData & { completed: boolean }>): Promise<Todo> {
  const { data, error } = await supabase
    .from('todos')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*, classes(*)')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Todo;
}

export async function toggleTodoComplete(id: string, completed: boolean): Promise<Todo> {
  return updateTodo(id, { completed });
}

export async function deleteTodo(id: string): Promise<void> {
  const { error } = await supabase
    .from('todos')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
}

export async function createRecurringTodo(todo: Todo): Promise<Todo | null> {
  if (!todo.recurrence_type || !todo.due_date) {
    return null;
  }

  const dueDate = new Date(todo.due_date);
  let nextDueDate: Date;

  switch (todo.recurrence_type) {
    case 'daily':
      nextDueDate = addDays(dueDate, todo.recurrence_interval);
      break;
    case 'weekly':
      nextDueDate = addDays(dueDate, 7 * todo.recurrence_interval);
      break;
    case 'monthly':
      nextDueDate = new Date(dueDate);
      nextDueDate.setMonth(nextDueDate.getMonth() + todo.recurrence_interval);
      break;
    default:
      return null;
  }

  // Check if we've passed the end date
  if (todo.recurrence_end_date && nextDueDate > new Date(todo.recurrence_end_date)) {
    return null;
  }

  // Calculate new reminder time if original had one
  let newReminderTime: string | null = null;
  if (todo.reminder_time && todo.due_date) {
    const reminderOffset = new Date(todo.due_date).getTime() - new Date(todo.reminder_time).getTime();
    newReminderTime = new Date(nextDueDate.getTime() - reminderOffset).toISOString();
  }

  const { data, error } = await supabase
    .from('todos')
    .insert({
      title: todo.title,
      description: todo.description,
      due_date: nextDueDate.toISOString(),
      reminder_time: newReminderTime,
      class_id: todo.class_id,
      priority: todo.priority,
      recurrence_type: todo.recurrence_type,
      recurrence_interval: todo.recurrence_interval,
      recurrence_end_date: todo.recurrence_end_date,
    })
    .select('*, classes(*)')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Todo;
}

export async function getUndatedTodos(): Promise<Todo[]> {
  const { data, error } = await supabase
    .from('todos')
    .select('*, classes(*)')
    .is('due_date', null)
    .eq('completed', false)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data as Todo[];
}
