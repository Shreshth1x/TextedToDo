const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export async function getVapidKey(): Promise<string | null> {
  try {
    const response = await fetch(`${API_URL}/api/vapid-key`);
    if (!response.ok) {
      throw new Error('Failed to get VAPID key');
    }
    const data = await response.json();
    return data.publicKey;
  } catch (error) {
    console.error('Error getting VAPID key:', error);
    return null;
  }
}

export async function registerPushSubscription(subscription: PushSubscription): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/api/subscriptions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ subscription }),
    });
    return response.ok;
  } catch (error) {
    console.error('Error registering push subscription:', error);
    return false;
  }
}

export async function unregisterPushSubscription(endpoint: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/api/subscriptions`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ endpoint }),
    });
    return response.ok;
  } catch (error) {
    console.error('Error unregistering push subscription:', error);
    return false;
  }
}

export async function subscribeToPush(): Promise<PushSubscription | null> {
  try {
    // Check if service workers are supported
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push notifications not supported');
      return null;
    }

    // Get VAPID public key
    const vapidKey = await getVapidKey();
    if (!vapidKey) {
      console.error('Could not get VAPID key');
      return null;
    }

    // Register service worker
    const registration = await navigator.serviceWorker.register('/sw.js');
    await navigator.serviceWorker.ready;

    // Subscribe to push
    const applicationServerKey = urlBase64ToUint8Array(vapidKey);
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: applicationServerKey.buffer as ArrayBuffer,
    });

    // Register subscription with server
    const success = await registerPushSubscription(subscription);
    if (!success) {
      throw new Error('Failed to register subscription with server');
    }

    return subscription;
  } catch (error) {
    console.error('Error subscribing to push:', error);
    return null;
  }
}

export async function unsubscribeFromPush(): Promise<boolean> {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      // Unregister from server
      await unregisterPushSubscription(subscription.endpoint);
      // Unsubscribe locally
      await subscription.unsubscribe();
    }

    return true;
  } catch (error) {
    console.error('Error unsubscribing from push:', error);
    return false;
  }
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}
