import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export function useRealtimeSubscription() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Subscribe to todos changes
    const todosChannel = supabase
      .channel('todos-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'todos',
        },
        () => {
          // Invalidate todos queries to refetch
          queryClient.invalidateQueries({ queryKey: ['todos'] });
        }
      )
      .subscribe();

    // Subscribe to classes changes
    const classesChannel = supabase
      .channel('classes-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'classes',
        },
        () => {
          // Invalidate classes queries to refetch
          queryClient.invalidateQueries({ queryKey: ['classes'] });
        }
      )
      .subscribe();

    // Cleanup subscriptions on unmount
    return () => {
      supabase.removeChannel(todosChannel);
      supabase.removeChannel(classesChannel);
    };
  }, [queryClient]);
}
