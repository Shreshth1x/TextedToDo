import cron from 'node-cron';
import twilio from 'twilio';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
);

// Initialize Twilio client (will be null if credentials not configured)
const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

interface Todo {
  id: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  due_date: string | null;
  classes: { name: string } | null;
}

interface UserSettings {
  id: string;
  phone_number: string | null;
  phone_verified: boolean;
  daily_sms_enabled: boolean;
  daily_sms_time: string;
  timezone: string;
}

// Priority emoji mapping
const priorityEmoji = {
  high: '🔴',
  medium: '🟡',
  low: '🟢',
};

/**
 * Format todos into a readable SMS message
 */
function formatTodosMessage(todos: Todo[]): string {
  if (todos.length === 0) {
    return '📋 TextedToDo\n\n✨ No tasks due today!\n\nEnjoy your free day! 🎉';
  }

  const taskLines = todos.map((todo, index) => {
    const emoji = priorityEmoji[todo.priority];
    const className = todo.classes?.name ? ` [${todo.classes.name}]` : '';
    return `${index + 1}. ${emoji} ${todo.title}${className}`;
  }).join('\n');

  const highPriority = todos.filter(t => t.priority === 'high').length;
  const urgentNote = highPriority > 0 ? `\n\n⚠️ ${highPriority} high priority!` : '';

  return `📋 TextedToDo Daily Summary\n\nYou have ${todos.length} task(s) today:\n\n${taskLines}${urgentNote}\n\nGet it done! 💪`;
}

/**
 * Send an SMS message via Twilio
 */
export async function sendSMS(to: string, message: string): Promise<boolean> {
  if (!twilioClient) {
    console.error('Twilio client not initialized. Check TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN.');
    return false;
  }

  const fromNumber = process.env.TWILIO_PHONE_NUMBER;
  if (!fromNumber) {
    console.error('TWILIO_PHONE_NUMBER not configured.');
    return false;
  }

  try {
    const result = await twilioClient.messages.create({
      body: message,
      from: fromNumber,
      to: to,
    });
    console.log(`SMS sent successfully. SID: ${result.sid}`);
    return true;
  } catch (error) {
    console.error('Error sending SMS:', error);
    return false;
  }
}

/**
 * Send a verification code to a phone number
 */
export async function sendVerificationCode(phoneNumber: string, code: string): Promise<boolean> {
  const message = `Your TextedToDo verification code is: ${code}\n\nThis code expires in 10 minutes.`;
  return sendSMS(phoneNumber, message);
}

/**
 * Get today's todos for SMS summary
 */
async function getTodaysTodos(): Promise<Todo[]> {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

  // Get todos due today OR todos with no due date that are incomplete
  const { data: todos, error } = await supabase
    .from('todos')
    .select('id, title, priority, due_date, classes(name)')
    .eq('completed', false)
    .or(`due_date.gte.${startOfDay.toISOString()},due_date.lte.${endOfDay.toISOString()}`)
    .order('priority', { ascending: true })
    .order('due_date', { ascending: true, nullsFirst: false });

  if (error) {
    console.error('Error fetching todos for SMS:', error);
    return [];
  }

  // Filter to only include todos due today (the OR query above isn't perfect)
  const todaysTodos = (todos || []).filter(todo => {
    if (!todo.due_date) return false;
    const dueDate = new Date(todo.due_date);
    return dueDate >= startOfDay && dueDate <= endOfDay;
  }).map(todo => {
    // Handle classes relation - Supabase returns object for single relation
    const classData = todo.classes;
    const classInfo = classData && typeof classData === 'object' && 'name' in classData
      ? { name: String(classData.name) }
      : null;
    
    return {
      id: todo.id as string,
      title: todo.title as string,
      priority: todo.priority as 'high' | 'medium' | 'low',
      due_date: todo.due_date as string | null,
      classes: classInfo,
    };
  });

  return todaysTodos;
}

/**
 * Send daily SMS summary to all users with SMS enabled
 */
async function sendDailySMSSummaries() {
  console.log('Starting daily SMS summary job...');

  // Get user settings where SMS is enabled
  const { data: settings, error: settingsError } = await supabase
    .from('user_settings')
    .select('*')
    .eq('daily_sms_enabled', true)
    .eq('phone_verified', true)
    .not('phone_number', 'is', null);

  if (settingsError) {
    console.error('Error fetching user settings:', settingsError);
    return;
  }

  if (!settings || settings.length === 0) {
    console.log('No users with SMS enabled and verified.');
    return;
  }

  // Get today's todos
  const todos = await getTodaysTodos();
  const message = formatTodosMessage(todos);

  // Send to each user
  for (const user of settings as UserSettings[]) {
    if (user.phone_number) {
      console.log(`Sending daily summary to ${user.phone_number}...`);
      const success = await sendSMS(user.phone_number, message);
      if (success) {
        console.log(`✓ Daily SMS sent to ${user.phone_number}`);
      } else {
        console.log(`✗ Failed to send SMS to ${user.phone_number}`);
      }
    }
  }

  console.log('Daily SMS summary job completed.');
}

/**
 * Start the daily SMS cron job
 * Runs every day at 8:00 AM server time
 */
export function startDailySMSCron() {
  if (!twilioClient) {
    console.log('⚠️ Twilio not configured. Daily SMS cron job will not send messages.');
    console.log('   Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER to enable.');
  }

  // Run every day at 8:00 AM
  cron.schedule('0 8 * * *', () => {
    console.log('⏰ Daily SMS cron triggered');
    sendDailySMSSummaries();
  });

  console.log('📱 Daily SMS cron job scheduled for 8:00 AM');
}

/**
 * Manually trigger a daily SMS (for testing)
 */
export async function triggerDailySMS(): Promise<{ success: boolean; message: string }> {
  try {
    await sendDailySMSSummaries();
    return { success: true, message: 'Daily SMS summary sent successfully' };
  } catch (error) {
    return { success: false, message: `Failed to send daily SMS: ${error}` };
  }
}

