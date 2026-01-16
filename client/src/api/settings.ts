import type { UserSettings, UserSettingsUpdate } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Get user settings
 */
export async function getSettings(): Promise<UserSettings> {
  const response = await fetch(`${API_URL}/api/settings`);
  if (!response.ok) {
    throw new Error('Failed to fetch settings');
  }
  return response.json();
}

/**
 * Update user settings
 */
export async function updateSettings(updates: UserSettingsUpdate): Promise<UserSettings> {
  const response = await fetch(`${API_URL}/api/settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update settings');
  }
  return response.json();
}

/**
 * Send verification code to phone number
 */
export async function sendPhoneVerificationCode(phone_number: string): Promise<{ message: string; phone_number: string }> {
  const response = await fetch(`${API_URL}/api/settings/phone/send-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone_number }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to send verification code');
  }
  return response.json();
}

/**
 * Verify phone number with code
 */
export async function verifyPhoneCode(code: string): Promise<{ message: string; settings: UserSettings }> {
  const response = await fetch(`${API_URL}/api/settings/phone/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to verify code');
  }
  return response.json();
}

/**
 * Remove phone number
 */
export async function removePhoneNumber(): Promise<{ message: string; settings: UserSettings }> {
  const response = await fetch(`${API_URL}/api/settings/phone`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to remove phone number');
  }
  return response.json();
}

/**
 * Send a test SMS
 */
export async function sendTestSMS(): Promise<{ message: string }> {
  const response = await fetch(`${API_URL}/api/settings/test-sms`, {
    method: 'POST',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to send test SMS');
  }
  return response.json();
}

/**
 * Manually trigger daily SMS summary (for testing)
 */
export async function triggerDailySMS(): Promise<{ message: string }> {
  const response = await fetch(`${API_URL}/api/settings/trigger-daily`, {
    method: 'POST',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to trigger daily SMS');
  }
  return response.json();
}

