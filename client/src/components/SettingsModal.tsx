/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';
import { X, Phone, Check, MessageSquare, Send, Clock, Loader2 } from 'lucide-react';
import {
  useSettings,
  useUpdateSettings,
  useSendVerificationCode,
  useVerifyPhoneCode,
  useRemovePhoneNumber,
  useSendTestSMS,
} from '../hooks/useSettings';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { data: settings, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();
  const sendVerificationCode = useSendVerificationCode();
  const verifyPhoneCode = useVerifyPhoneCode();
  const removePhoneNumber = useRemovePhoneNumber();
  const sendTestSMS = useSendTestSMS();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showVerification, setShowVerification] = useState(false);
  const [smsTime, setSmsTime] = useState('08:00');
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Sync state with fetched settings
  useEffect(() => {
    if (settings) {
      setSmsEnabled(settings.daily_sms_enabled);
      if (settings.daily_sms_time) {
        setSmsTime(settings.daily_sms_time.slice(0, 5));
      }
    }
  }, [settings]);

  // Clear message after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  if (!isOpen) return null;

  const handleSendCode = async () => {
    if (!phoneNumber.trim()) {
      setMessage({ type: 'error', text: 'Please enter a phone number' });
      return;
    }

    try {
      await sendVerificationCode.mutateAsync(phoneNumber);
      setShowVerification(true);
      setMessage({ type: 'success', text: 'Verification code sent!' });
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to send code' });
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode.trim()) {
      setMessage({ type: 'error', text: 'Please enter the verification code' });
      return;
    }

    try {
      await verifyPhoneCode.mutateAsync(verificationCode);
      setShowVerification(false);
      setVerificationCode('');
      setMessage({ type: 'success', text: 'Phone number verified!' });
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Invalid code' });
    }
  };

  const handleRemovePhone = async () => {
    if (!confirm('Remove your phone number? You will stop receiving SMS notifications.')) {
      return;
    }

    try {
      await removePhoneNumber.mutateAsync();
      setPhoneNumber('');
      setShowVerification(false);
      setMessage({ type: 'success', text: 'Phone number removed' });
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to remove phone' });
    }
  };

  const handleToggleSMS = async (enabled: boolean) => {
    setSmsEnabled(enabled);
    try {
      await updateSettings.mutateAsync({ daily_sms_enabled: enabled });
      setMessage({ type: 'success', text: enabled ? 'Daily SMS enabled!' : 'Daily SMS disabled' });
    } catch (error) {
      setSmsEnabled(!enabled); // Revert on error
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to update' });
    }
  };

  const handleTimeChange = async (time: string) => {
    setSmsTime(time);
    try {
      await updateSettings.mutateAsync({ daily_sms_time: `${time}:00` });
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to update time' });
    }
  };

  const handleSendTestSMS = async () => {
    try {
      await sendTestSMS.mutateAsync();
      setMessage({ type: 'success', text: 'Test SMS sent!' });
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to send test' });
    }
  };

  const formatPhoneDisplay = (phone: string | null) => {
    if (!phone) return '';
    // Format as (XXX) XXX-XXXX for US numbers
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 11 && digits.startsWith('1')) {
      return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
    }
    return phone;
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <MessageSquare size={22} className="text-indigo-600" />
              SMS Settings
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              aria-label="Close settings"
            >
              <X size={20} aria-hidden="true" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6">
            {/* Message banner */}
            {message && (
              <div
                role="alert"
                aria-live="polite"
                className={`p-3 rounded-lg text-sm ${
                  message.type === 'success'
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {message.text}
              </div>
            )}

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="animate-spin text-indigo-600" size={32} />
              </div>
            ) : (
              <>
                {/* Phone Number Section */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Phone size={16} />
                    Phone Number
                  </label>

                  {settings?.phone_verified ? (
                    // Verified phone display
                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Check size={18} className="text-green-600" />
                        <span className="text-green-800 font-medium">
                          {formatPhoneDisplay(settings.phone_number)}
                        </span>
                      </div>
                      <button
                        onClick={handleRemovePhone}
                        disabled={removePhoneNumber.isPending}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  ) : showVerification ? (
                    // Verification code input
                    <div className="space-y-3">
                      <label htmlFor="verification-code" className="text-sm text-gray-600">
                        Enter the 6-digit code sent to your phone:
                      </label>
                      <div className="flex gap-2">
                        <input
                          id="verification-code"
                          type="text"
                          inputMode="numeric"
                          autoComplete="one-time-code"
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          placeholder="000000"
                          maxLength={6}
                          className="flex-1 px-4 py-2 text-center text-lg tracking-widest border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          aria-describedby="verification-hint"
                        />
                        <button
                          onClick={handleVerifyCode}
                          disabled={verifyPhoneCode.isPending || verificationCode.length !== 6}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {verifyPhoneCode.isPending ? (
                            <Loader2 size={18} className="animate-spin" aria-hidden="true" />
                          ) : (
                            <Check size={18} aria-hidden="true" />
                          )}
                          Verify
                        </button>
                      </div>
                      <p id="verification-hint" className="sr-only">Enter the 6 digit numeric code</p>
                      <button
                        onClick={() => setShowVerification(false)}
                        className="text-sm text-gray-500 hover:text-gray-700"
                      >
                        ← Change number
                      </button>
                    </div>
                  ) : (
                    // Phone input
                    <div className="flex gap-2">
                      <label htmlFor="phone-number" className="sr-only">Phone number</label>
                      <input
                        id="phone-number"
                        type="tel"
                        autoComplete="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="(555) 123-4567"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <button
                        onClick={handleSendCode}
                        disabled={sendVerificationCode.isPending}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
                      >
                        {sendVerificationCode.isPending ? (
                          <Loader2 size={18} className="animate-spin" aria-hidden="true" />
                        ) : (
                          <Send size={18} aria-hidden="true" />
                        )}
                        Send Code
                      </button>
                    </div>
                  )}
                </div>

                {/* Daily SMS Toggle */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span id="sms-toggle-label" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <MessageSquare size={16} aria-hidden="true" />
                      Daily SMS Summary
                    </span>
                    <button
                      onClick={() => handleToggleSMS(!smsEnabled)}
                      disabled={!settings?.phone_verified || updateSettings.isPending}
                      role="switch"
                      aria-checked={smsEnabled}
                      aria-labelledby="sms-toggle-label"
                      aria-disabled={!settings?.phone_verified}
                      className={`
                        relative w-12 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                        ${smsEnabled ? 'bg-indigo-600' : 'bg-gray-300'}
                        ${!settings?.phone_verified ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                      `}
                    >
                      <span
                        className={`
                          absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform
                          ${smsEnabled ? 'translate-x-6' : 'translate-x-0'}
                        `}
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                  {!settings?.phone_verified && (
                    <p className="text-xs text-gray-500">
                      Verify your phone number to enable daily SMS summaries.
                    </p>
                  )}
                </div>

                {/* Time Picker */}
                {settings?.phone_verified && (
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Clock size={16} />
                      Send daily summary at
                    </label>
                    <input
                      type="time"
                      value={smsTime}
                      onChange={(e) => handleTimeChange(e.target.value)}
                      disabled={!smsEnabled}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500">
                      You'll receive a text with today's tasks at this time.
                    </p>
                  </div>
                )}

                {/* Test SMS Button */}
                {settings?.phone_verified && (
                  <div className="pt-4 border-t border-gray-200">
                    <button
                      onClick={handleSendTestSMS}
                      disabled={sendTestSMS.isPending}
                      className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {sendTestSMS.isPending ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <Send size={18} />
                      )}
                      Send Test SMS
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
            <p className="text-xs text-gray-500 text-center">
              Standard SMS rates may apply. Powered by Twilio.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

