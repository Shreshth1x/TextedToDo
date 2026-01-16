import { useState, useEffect, useCallback } from 'react';
import { subscribeToPush, unsubscribeFromPush } from '../api/notifications';

export function useNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if push notifications are supported
    const supported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
    setIsSupported(supported);

    // Check current permission status
    if (supported && Notification.permission === 'granted') {
      // Check if we have an active subscription
      navigator.serviceWorker.ready.then((registration) => {
        registration.pushManager.getSubscription().then((subscription) => {
          setIsEnabled(!!subscription);
        });
      });
    }
  }, []);

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
