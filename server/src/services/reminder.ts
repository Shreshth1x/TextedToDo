import cron from 'node-cron';
import webpush from 'web-push';
import { getSupabase } from '../lib/clients.js';

interface Todo {
  id: string;
  title: string;
  due_date: string;
  reminder_time: string;
}

interface PushSubscription {
  endpoint: string;
  p256dh: string;
  auth: string;
}

// Smart scheduling: cache next reminder time to skip unnecessary DB queries
let nextReminderCheck: Date | null = null;

async function sendReminders() {
  try {
    const supabase = getSupabase();
    const now = new Date();

    // Skip DB query if we know no reminders are due yet
    if (nextReminderCheck && now < nextReminderCheck) {
      return;
    }

    // Find todos with reminder_time that is due and not yet sent
    const { data: todos, error: todosError } = await supabase
      .from('todos')
      .select('id, title, due_date, reminder_time')
      .eq('reminder_sent', false)
      .eq('completed', false)
      .not('reminder_time', 'is', null)
      .lte('reminder_time', now.toISOString());

    if (todosError) {
      console.error('Error fetching todos:', todosError);
      return;
    }

    if (!todos || todos.length === 0) {
      // No due reminders - find next upcoming reminder to schedule next check
      const { data: nextReminder } = await supabase
        .from('todos')
        .select('reminder_time')
        .eq('reminder_sent', false)
        .eq('completed', false)
        .not('reminder_time', 'is', null)
        .gt('reminder_time', now.toISOString())
        .order('reminder_time', { ascending: true })
        .limit(1);

      if (nextReminder?.[0]?.reminder_time) {
        nextReminderCheck = new Date(nextReminder[0].reminder_time);
      } else {
        // No upcoming reminders, check again in 5 minutes
        nextReminderCheck = new Date(now.getTime() + 5 * 60 * 1000);
      }
      return;
    }

    // Reset next check since we found reminders to send
    nextReminderCheck = null;

    // Get all push subscriptions
    const { data: subscriptions, error: subsError } = await supabase
      .from('push_subscriptions')
      .select('endpoint, p256dh, auth');

    if (subsError) {
      console.error('Error fetching subscriptions:', subsError);
      return;
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log('No push subscriptions found');
      return;
    }

    // Send notifications for each due todo
    for (const todo of todos as Todo[]) {
      const payload = JSON.stringify({
        title: 'Task Reminder',
        body: todo.title,
        data: {
          todoId: todo.id,
          url: '/',
        },
      });

      // Send to all subscriptions
      const sendPromises = (subscriptions as PushSubscription[]).map(async (sub) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: {
                p256dh: sub.p256dh,
                auth: sub.auth,
              },
            },
            payload
          );
        } catch (error: unknown) {
          // If subscription is invalid (410 Gone), remove it
          if (error && typeof error === 'object' && 'statusCode' in error && error.statusCode === 410) {
            await getSupabase()
              .from('push_subscriptions')
              .delete()
              .eq('endpoint', sub.endpoint);
            console.log('Removed invalid subscription:', sub.endpoint);
          } else {
            console.error('Error sending notification:', error);
          }
        }
      });

      await Promise.all(sendPromises);

      // Mark reminder as sent
      await supabase
        .from('todos')
        .update({ reminder_sent: true })
        .eq('id', todo.id);

      console.log(`Sent reminder for: ${todo.title}`);
    }
  } catch (error) {
    console.error('Error in sendReminders:', error);
  }
}

// Reset the next reminder check (call this when todos are created/updated)
export function resetReminderSchedule() {
  nextReminderCheck = null;
}

export function startReminderCron() {
  // Run every minute to check for due reminders (but smart scheduling skips unnecessary queries)
  cron.schedule('* * * * *', () => {
    sendReminders();
  });

  console.log('Reminder cron job started (with smart scheduling)');
}
