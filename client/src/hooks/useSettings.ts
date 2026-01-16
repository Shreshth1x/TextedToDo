import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getSettings,
  updateSettings,
  sendPhoneVerificationCode,
  verifyPhoneCode,
  removePhoneNumber,
  sendTestSMS,
  triggerDailySMS,
} from '../api/settings';
import type { UserSettingsUpdate } from '../types';

export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: getSettings,
    retry: 1,
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: UserSettingsUpdate) => updateSettings(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });
}

export function useSendVerificationCode() {
  return useMutation({
    mutationFn: (phone_number: string) => sendPhoneVerificationCode(phone_number),
  });
}

export function useVerifyPhoneCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (code: string) => verifyPhoneCode(code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });
}

export function useRemovePhoneNumber() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removePhoneNumber,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });
}

export function useSendTestSMS() {
  return useMutation({
    mutationFn: sendTestSMS,
  });
}

export function useTriggerDailySMS() {
  return useMutation({
    mutationFn: triggerDailySMS,
  });
}

