import { useState, useEffect, useCallback } from 'react';
import { subscribeToPush, unsubscribeFromPush } from '../api/notifications';

function checkPushSupport() {
  return typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window;
}

export function useNotifications() {
  const [isSupported] = useState(() => checkPushSupport());
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check current permission status
    if (isSupported && Notification.permission === 'granted') {
      // Check if we have an active subscription
      navigator.serviceWorker.ready.then((registration) => {
        registration.pushManager.getSubscription().then((subscription) => {
          setIsEnabled(!!subscription);
        });
      });
    }
  }, [isSupported]);

  const enable = useCallback(async () => {
    if (!isSupported) {
      return false;
    }

    setIsLoading(true);

    try {
      // Request permission if not granted
      if (Notification.permission !== 'granted') {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          setIsLoading(false);
          return false;
        }
      }

      // Subscribe to push
      const subscription = await subscribeToPush();
      if (subscription) {
        setIsEnabled(true);
        setIsLoading(false);
        return true;
      }

      setIsLoading(false);
      return false;
    } catch (error) {
      console.error('Error enabling notifications:', error);
      setIsLoading(false);
      return false;
    }
  }, [isSupported]);

  const disable = useCallback(async () => {
    setIsLoading(true);

    try {
      await unsubscribeFromPush();
      setIsEnabled(false);
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Error disabling notifications:', error);
      setIsLoading(false);
      return false;
    }
  }, []);

  const toggle = useCallback(async () => {
    if (isEnabled) {
      return disable();
    }
    return enable();
  }, [isEnabled, enable, disable]);

  return {
    isSupported,
    isEnabled,
    isLoading,
    enable,
    disable,
    toggle,
  };
}
