import { supabase } from '../lib/supabase';
import type { Class, ClassFormData } from '../types';

export async function getClasses(): Promise<Class[]> {
  const { data, error } = await supabase
    .from('classes')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data as Class[];
}

export async function getClassById(id: string): Promise<Class | null> {
  const { data, error } = await supabase
    .from('classes')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(error.message);
  }

  return data as Class;
}

export async function createClass(classData: ClassFormData): Promise<Class> {
  // Get the max sort_order to add new class at the end
  const { data: existingClasses } = await supabase
    .from('classes')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1);

  const nextSortOrder = existingClasses && existingClasses.length > 0
    ? existingClasses[0].sort_order + 1
    : 0;

  const { data, error } = await supabase
    .from('classes')
    .insert({
      name: classData.name,
      color: classData.color || '#6366f1',
      icon: classData.icon || '📚',
      description: classData.description || null,
      sort_order: nextSortOrder,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Class;
}

export async function updateClass(id: string, updates: Partial<ClassFormData>): Promise<Class> {
  const { data, error } = await supabase
    .from('classes')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Class;
}

export async function deleteClass(id: string): Promise<void> {
  const { error } = await supabase
    .from('classes')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
}

export async function reorderClasses(classIds: string[]): Promise<void> {
  // Update sort_order for each class based on new position
  const updates = classIds.map((id, index) => ({
    id,
    sort_order: index,
  }));

  for (const update of updates) {
    const { error } = await supabase
      .from('classes')
      .update({ sort_order: update.sort_order })
      .eq('id', update.id);

    if (error) {
      throw new Error(error.message);
    }
  }
}
