-- User settings table for SMS notifications and preferences
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number TEXT,
  phone_verified BOOLEAN DEFAULT FALSE,
  daily_sms_enabled BOOLEAN DEFAULT FALSE,
  daily_sms_time TIME DEFAULT '08:00:00',
  timezone TEXT DEFAULT 'America/New_York',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- We'll use a single-row pattern since this is a single-user app
-- Insert default settings row
INSERT INTO user_settings (id) 
VALUES ('00000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_user_settings_updated_at ON user_settings;
CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Index for quick lookup
CREATE INDEX IF NOT EXISTS idx_user_settings_sms_enabled 
  ON user_settings(daily_sms_enabled) 
  WHERE daily_sms_enabled = TRUE;

