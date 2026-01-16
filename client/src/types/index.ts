export type Priority = 'high' | 'medium' | 'low';
export type RecurrenceType = 'daily' | 'weekly' | 'monthly';

export interface Class {
  id: string;
  name: string;
  color: string;
  sort_order: number;
  created_at: string;
}

export interface Todo {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  due_date: string | null;
  reminder_time: string | null;
  reminder_sent: boolean;
  class_id: string | null;
  priority: Priority;
  recurrence_type: RecurrenceType | null;
  recurrence_interval: number;
  recurrence_end_date: string | null;
  created_at: string;
  updated_at: string;
  classes?: Class | null;
}

export interface TodoFormData {
  title: string;
  description?: string;
  due_date?: string;
  reminder_time?: string;
  class_id?: string;
  priority: Priority;
  recurrence_type?: RecurrenceType;
  recurrence_interval?: number;
  recurrence_end_date?: string;
}

export interface ClassFormData {
  name: string;
  color?: string;
}

export interface PushSubscription {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  created_at: string;
}

export interface UserSettings {
  id: string;
  phone_number: string | null;
  phone_verified: boolean;
  daily_sms_enabled: boolean;
  daily_sms_time: string;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface UserSettingsUpdate {
  daily_sms_enabled?: boolean;
  daily_sms_time?: string;
  timezone?: string;
}

export type FilterPreset = 'all' | 'today' | 'upcoming' | 'completed';
export type SortOption = 'due_date' | 'priority' | 'created_at';
