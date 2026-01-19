import { Router } from 'express';
import webpush from 'web-push';
import { getSupabase } from '../lib/clients.js';

const router = Router();

// Initialize web-push with VAPID keys (lazy, only if configured)
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';
let vapidConfigured = false;

function ensureVapidConfigured() {
  if (!vapidConfigured && VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(
      'mailto:notifications@textedtodo.app',
      VAPID_PUBLIC_KEY,
      VAPID_PRIVATE_KEY
    );
    vapidConfigured = true;
  }
}

// GET /api/vapid-key - Get the VAPID public key
router.get('/vapid-key', (_req, res) => {
  if (!VAPID_PUBLIC_KEY) {
    return res.status(500).json({ error: 'VAPID key not configured' });
  }
  res.json({ publicKey: VAPID_PUBLIC_KEY });
});

// POST /api/subscriptions - Register a push subscription
router.post('/subscriptions', async (req, res) => {
  try {
    ensureVapidConfigured();
    const { subscription } = req.body;

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return res.status(400).json({ error: 'Invalid subscription data' });
    }

    const { endpoint, keys } = subscription;
    const { p256dh, auth } = keys;

    // Store the subscription in Supabase
    const { error } = await getSupabase()
      .from('push_subscriptions')
      .upsert(
        { endpoint, p256dh, auth },
        { onConflict: 'endpoint' }
      );

    if (error) {
      console.error('Error saving subscription:', error);
      return res.status(500).json({ error: 'Failed to save subscription' });
    }

    res.status(201).json({ message: 'Subscription registered' });
  } catch (error) {
    console.error('Error registering subscription:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/subscriptions - Unregister a push subscription
router.delete('/subscriptions', async (req, res) => {
  try {
    const { endpoint } = req.body;

    if (!endpoint) {
      return res.status(400).json({ error: 'Endpoint required' });
    }

    const { error } = await getSupabase()
      .from('push_subscriptions')
      .delete()
      .eq('endpoint', endpoint);

    if (error) {
      console.error('Error deleting subscription:', error);
      return res.status(500).json({ error: 'Failed to delete subscription' });
    }

    res.json({ message: 'Subscription removed' });
  } catch (error) {
    console.error('Error unregistering subscription:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as subscriptionRoutes };
