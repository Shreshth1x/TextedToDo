import { createClient, SupabaseClient } from '@supabase/supabase-js';
import twilio from 'twilio';

// Singleton instances - lazy initialized
let _supabase: SupabaseClient | null = null;
let _twilioClient: ReturnType<typeof twilio> | null = null;
let _twilioInitialized = false;

/**
 * Get the shared Supabase client (singleton)
 * Lazy-initialized on first access
 */
export function getSupabase(): SupabaseClient {
  if (!_supabase) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_KEY;

    if (!url || !key) {
      throw new Error('SUPABASE_URL and SUPABASE_SERVICE_KEY must be configured');
    }

    _supabase = createClient(url, key);
  }
  return _supabase;
}

/**
 * Get the shared Twilio client (singleton)
 * Lazy-initialized on first access
 * Returns null if Twilio is not configured
 */
export function getTwilioClient(): ReturnType<typeof twilio> | null {
  if (!_twilioInitialized) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    if (accountSid && authToken) {
      _twilioClient = twilio(accountSid, authToken);
    }
    _twilioInitialized = true;
  }
  return _twilioClient;
}

/**
 * Check if Twilio is configured
 */
export function isTwilioConfigured(): boolean {
  return getTwilioClient() !== null;
}
