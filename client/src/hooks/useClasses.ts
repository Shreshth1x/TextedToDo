import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
} from '../api/classes';
import type { ClassFormData } from '../types';

export function useClasses() {
  return useQuery({
    queryKey: ['classes'],
    queryFn: getClasses,
  });
}

export function useClass(id: string) {
  return useQuery({
    queryKey: ['classes', id],
    queryFn: () => getClassById(id),
    enabled: !!id,
  });
}

export function useCreateClass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (classData: ClassFormData) => createClass(classData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
    },
  });
}

export function useUpdateClass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<ClassFormData> }) =>
      updateClass(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
    },
  });
}

export function useDeleteClass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteClass(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
}
