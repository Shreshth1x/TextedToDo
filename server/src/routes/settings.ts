import { Router } from 'express';
import { getSupabase, getTwilioClient } from '../lib/clients.js';
import { sendSMS, sendWhatsApp, triggerDailySMS } from '../services/sms.js';

const router = Router();
const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID || '';

// Default user settings ID (single-user app pattern)
const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000001';

/**
 * Format phone number to E.164 format
 */
function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // If it's a 10-digit US number, add +1
  if (digits.length === 10) {
    return `+1${digits}`;
  }
  
  // If it already has country code
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`;
  }
  
  // Otherwise, assume it needs a +
  if (!phone.startsWith('+')) {
    return `+${digits}`;
  }
  
  return phone;
}

// GET /api/settings - Get user settings
router.get('/settings', async (_req, res) => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('id', DEFAULT_USER_ID)
      .single();

    if (error) {
      // If no settings exist, create default
      if (error.code === 'PGRST116') {
        const { data: newSettings, error: insertError } = await supabase
          .from('user_settings')
          .insert({ id: DEFAULT_USER_ID })
          .select()
          .single();

        if (insertError) {
          return res.status(500).json({ error: 'Failed to create settings' });
        }
        return res.json(newSettings);
      }
      return res.status(500).json({ error: error.message });
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/settings - Update user settings
router.put('/settings', async (req, res) => {
  try {
    const { daily_sms_enabled, daily_sms_time, timezone } = req.body;

    const updates: Record<string, unknown> = {};
    if (typeof daily_sms_enabled === 'boolean') updates.daily_sms_enabled = daily_sms_enabled;
    if (daily_sms_time) updates.daily_sms_time = daily_sms_time;
    if (timezone) updates.timezone = timezone;

    const { data, error } = await getSupabase()
      .from('user_settings')
      .update(updates)
      .eq('id', DEFAULT_USER_ID)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json(data);
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/settings/phone/send-code - Send verification code to phone using Twilio Verify
router.post('/settings/phone/send-code', async (req, res) => {
  try {
    const { phone_number } = req.body;

    if (!phone_number) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    if (!verifyServiceSid) {
      return res.status(500).json({ error: 'Twilio Verify not configured' });
    }

    const formattedPhone = formatPhoneNumber(phone_number);
    const twilioClient = getTwilioClient();

    if (!twilioClient) {
      return res.status(500).json({ error: 'Twilio not configured' });
    }

    // Send verification code using Twilio Verify API
    const verification = await twilioClient.verify.v2
      .services(verifyServiceSid)
      .verifications.create({
        to: formattedPhone,
        channel: 'sms',
      });

    console.log('Twilio Verify status:', verification.status);

    // Update phone number in database (but not verified yet)
    await getSupabase()
      .from('user_settings')
      .update({ phone_number: formattedPhone, phone_verified: false })
      .eq('id', DEFAULT_USER_ID);

    res.json({ message: 'Verification code sent', phone_number: formattedPhone });
  } catch (error: unknown) {
    console.error('Error sending verification code:', error);
    const errMsg = error instanceof Error ? error.message : 'Failed to send code';
    res.status(500).json({ error: errMsg });
  }
});

// POST /api/settings/phone/verify - Verify the code using Twilio Verify
router.post('/settings/phone/verify', async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Verification code is required' });
    }

    if (!verifyServiceSid) {
      return res.status(500).json({ error: 'Twilio Verify not configured' });
    }

    const twilioClient = getTwilioClient();
    if (!twilioClient) {
      return res.status(500).json({ error: 'Twilio not configured' });
    }

    // Get the current phone number from settings
    const { data: settings } = await getSupabase()
      .from('user_settings')
      .select('phone_number')
      .eq('id', DEFAULT_USER_ID)
      .single();

    if (!settings?.phone_number) {
      return res.status(400).json({ error: 'No phone number to verify' });
    }

    // Verify code using Twilio Verify API
    const verificationCheck = await twilioClient.verify.v2
      .services(verifyServiceSid)
      .verificationChecks.create({
        to: settings.phone_number,
        code: code,
      });

    console.log('Twilio Verify check status:', verificationCheck.status);

    if (verificationCheck.status !== 'approved') {
      return res.status(400).json({ error: 'Invalid verification code' });
    }

    // Code is valid - mark phone as verified
    const { data, error } = await getSupabase()
      .from('user_settings')
      .update({ phone_verified: true })
      .eq('id', DEFAULT_USER_ID)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ message: 'Phone number verified successfully', settings: data });
  } catch (error: unknown) {
    console.error('Error verifying code:', error);
    const errMsg = error instanceof Error ? error.message : 'Invalid code';
    res.status(500).json({ error: errMsg });
  }
});

// DELETE /api/settings/phone - Remove phone number
router.delete('/settings/phone', async (_req, res) => {
  try {
    const { data, error } = await getSupabase()
      .from('user_settings')
      .update({
        phone_number: null,
        phone_verified: false,
        daily_sms_enabled: false
      })
      .eq('id', DEFAULT_USER_ID)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ message: 'Phone number removed', settings: data });
  } catch (error) {
    console.error('Error removing phone:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/settings/test-sms - Send a test WhatsApp message
router.post('/settings/test-sms', async (_req, res) => {
  try {
    // Get current settings
    const { data: settings } = await getSupabase()
      .from('user_settings')
      .select('phone_number, phone_verified')
      .eq('id', DEFAULT_USER_ID)
      .single();

    if (!settings?.phone_number) {
      return res.status(400).json({ error: 'No phone number configured' });
    }

    if (!settings.phone_verified) {
      return res.status(400).json({ error: 'Phone number not verified' });
    }

    const sent = await sendWhatsApp(
      settings.phone_number,
      '✅ TextedToDo Test Message\n\nYour WhatsApp notifications are working! You\'ll receive daily summaries at your scheduled time.'
    );

    if (!sent) {
      return res.status(500).json({ error: 'Failed to send test WhatsApp' });
    }

    res.json({ message: 'Test WhatsApp sent successfully' });
  } catch (error) {
    console.error('Error sending test WhatsApp:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/settings/trigger-daily - Manually trigger daily SMS (for testing)
router.post('/settings/trigger-daily', async (_req, res) => {
  try {
    const result = await triggerDailySMS();
    if (result.success) {
      res.json({ message: result.message });
    } else {
      res.status(500).json({ error: result.message });
    }
  } catch (error) {
    console.error('Error triggering daily SMS:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as settingsRoutes };

