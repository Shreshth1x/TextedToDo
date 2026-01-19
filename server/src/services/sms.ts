import cron from 'node-cron';
import { getSupabase, getTwilioClient, isTwilioConfigured } from '../lib/clients.js';

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

interface GroupedTodos {
  today: Todo[];
  tomorrow: Todo[];
  upcoming: Todo[];
  overdue: Todo[];
}

/**
 * Format todos into a readable daily summary message
 */
function formatTodosMessage(grouped: GroupedTodos): string {
  const sections: string[] = [];
  
  // Overdue tasks
  if (grouped.overdue.length > 0) {
    const lines = grouped.overdue.map((todo, i) => {
      const emoji = priorityEmoji[todo.priority];
      const className = todo.classes?.name ? ` [${todo.classes.name}]` : '';
      return `  ${i + 1}. ${emoji} ${todo.title}${className}`;
    }).join('\n');
    sections.push(`🚨 OVERDUE:\n${lines}`);
  }
  
  // Today's tasks
  if (grouped.today.length > 0) {
    const lines = grouped.today.map((todo, i) => {
      const emoji = priorityEmoji[todo.priority];
      const className = todo.classes?.name ? ` [${todo.classes.name}]` : '';
      return `  ${i + 1}. ${emoji} ${todo.title}${className}`;
    }).join('\n');
    sections.push(`📅 TODAY:\n${lines}`);
  }
  
  // Tomorrow's tasks
  if (grouped.tomorrow.length > 0) {
    const lines = grouped.tomorrow.map((todo, i) => {
      const emoji = priorityEmoji[todo.priority];
      const className = todo.classes?.name ? ` [${todo.classes.name}]` : '';
      return `  ${i + 1}. ${emoji} ${todo.title}${className}`;
    }).join('\n');
    sections.push(`📆 TOMORROW:\n${lines}`);
  }
  
  // Upcoming tasks (next 5 days)
  if (grouped.upcoming.length > 0) {
    const lines = grouped.upcoming.map((todo, i) => {
      const emoji = priorityEmoji[todo.priority];
      const className = todo.classes?.name ? ` [${todo.classes.name}]` : '';
      const dueDate = todo.due_date ? new Date(todo.due_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : '';
      return `  ${i + 1}. ${emoji} ${todo.title}${className} - ${dueDate}`;
    }).join('\n');
    sections.push(`🗓️ UPCOMING:\n${lines}`);
  }
  
  const totalTasks = grouped.overdue.length + grouped.today.length + grouped.tomorrow.length + grouped.upcoming.length;
  
  if (totalTasks === 0) {
    return '📋 TextedToDo\n\n✨ No tasks coming up!\n\nEnjoy your free time! 🎉';
  }
  
  const highPriority = [...grouped.overdue, ...grouped.today].filter(t => t.priority === 'high').length;
  const urgentNote = highPriority > 0 ? `\n⚠️ ${highPriority} high priority today!` : '';
  
  return `📋 TextedToDo Daily Summary\n\n${sections.join('\n\n')}${urgentNote}\n\nHave a productive day! 💪`;
}

/**
 * Send a WhatsApp message via Twilio
 */
export async function sendWhatsApp(to: string, message: string): Promise<boolean> {
  const twilioClient = getTwilioClient();
  if (!twilioClient) {
    console.error('Twilio client not initialized. Check TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN.');
    return false;
  }

  const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER;
  if (!whatsappNumber) {
    console.error('TWILIO_WHATSAPP_NUMBER not configured.');
    return false;
  }

  try {
    console.log(`Attempting to send WhatsApp from ${whatsappNumber} to ${to}`);
    const result = await twilioClient.messages.create({
      body: message,
      from: `whatsapp:${whatsappNumber}`,
      to: `whatsapp:${to}`,
    });
    console.log(`WhatsApp sent successfully. SID: ${result.sid}`);
    return true;
  } catch (error: unknown) {
    console.error('Error sending WhatsApp:', error);
    if (error && typeof error === 'object') {
      const twilioError = error as { code?: number; message?: string; moreInfo?: string };
      console.error('Twilio Error Code:', twilioError.code);
      console.error('Twilio Error Message:', twilioError.message);
      console.error('More Info:', twilioError.moreInfo);
    }
    return false;
  }
}

/**
 * Send an SMS message via Twilio (fallback, may be blocked by A2P)
 */
export async function sendSMS(to: string, message: string): Promise<boolean> {
  const twilioClient = getTwilioClient();
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
    console.log(`Attempting to send SMS from ${fromNumber} to ${to}`);
    const result = await twilioClient.messages.create({
      body: message,
      from: fromNumber,
      to: to,
    });
    console.log(`SMS sent successfully. SID: ${result.sid}`);
    return true;
  } catch (error: unknown) {
    console.error('Error sending SMS:', error);
    if (error && typeof error === 'object') {
      const twilioError = error as { code?: number; message?: string; moreInfo?: string };
      console.error('Twilio Error Code:', twilioError.code);
      console.error('Twilio Error Message:', twilioError.message);
      console.error('More Info:', twilioError.moreInfo);
    }
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
 * Get todos grouped by today, tomorrow, upcoming, and overdue
 */
async function getGroupedTodos(): Promise<GroupedTodos> {
  const now = new Date();

  // Define date boundaries
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);
  const tomorrowEnd = new Date(todayEnd);
  tomorrowEnd.setDate(tomorrowEnd.getDate() + 1);
  const upcomingEnd = new Date(todayStart);
  upcomingEnd.setDate(upcomingEnd.getDate() + 7); // Next 7 days

  // Get all incomplete todos with due dates within the next week or overdue
  const { data: todos, error } = await getSupabase()
    .from('todos')
    .select('id, title, priority, due_date, classes(name)')
    .eq('completed', false)
    .not('due_date', 'is', null)
    .lte('due_date', upcomingEnd.toISOString())
    .order('due_date', { ascending: true })
    .order('priority', { ascending: true });

  if (error) {
    console.error('Error fetching todos for summary:', error);
    return { today: [], tomorrow: [], upcoming: [], overdue: [] };
  }

  const grouped: GroupedTodos = { today: [], tomorrow: [], upcoming: [], overdue: [] };

  for (const todo of todos || []) {
    if (!todo.due_date) continue;
    
    const dueDate = new Date(todo.due_date);
    
    // Handle classes relation
    const classData = todo.classes;
    const classInfo = classData && typeof classData === 'object' && 'name' in classData
      ? { name: String(classData.name) }
      : null;
    
    const mappedTodo: Todo = {
      id: todo.id as string,
      title: todo.title as string,
      priority: todo.priority as 'high' | 'medium' | 'low',
      due_date: todo.due_date as string,
      classes: classInfo,
    };

    if (dueDate < todayStart) {
      grouped.overdue.push(mappedTodo);
    } else if (dueDate >= todayStart && dueDate <= todayEnd) {
      grouped.today.push(mappedTodo);
    } else if (dueDate >= tomorrowStart && dueDate <= tomorrowEnd) {
      grouped.tomorrow.push(mappedTodo);
    } else {
      grouped.upcoming.push(mappedTodo);
    }
  }

  return grouped;
}

/**
 * Check if it's time to send a summary to a user based on their scheduled time
 */
function isTimeToSend(userTime: string): boolean {
  const now = new Date();
  const currentHour = now.getHours().toString().padStart(2, '0');
  const currentMinute = now.getMinutes().toString().padStart(2, '0');
  const currentTime = `${currentHour}:${currentMinute}`;
  
  // userTime is in format "HH:MM:SS", we compare "HH:MM"
  const scheduledTime = userTime.slice(0, 5);
  
  return currentTime === scheduledTime;
}

/**
 * Send daily SMS summary to users whose scheduled time matches current time
 */
async function checkAndSendDailySummaries() {
  // Get user settings where SMS is enabled
  const { data: settings, error: settingsError } = await getSupabase()
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
    return; // No users with SMS enabled
  }

  // Check each user's scheduled time
  for (const user of settings as UserSettings[]) {
    if (user.phone_number && user.daily_sms_time && isTimeToSend(user.daily_sms_time)) {
      console.log(`⏰ Time to send daily summary to ${user.phone_number} (scheduled: ${user.daily_sms_time})`);
      
      // Get grouped todos
      const groupedTodos = await getGroupedTodos();
      const message = formatTodosMessage(groupedTodos);
      
      const success = await sendWhatsApp(user.phone_number, message);
      if (success) {
        console.log(`✓ Daily WhatsApp sent to ${user.phone_number}`);
      } else {
        console.log(`✗ Failed to send WhatsApp to ${user.phone_number}`);
      }
    }
  }
}

/**
 * Send daily SMS summary immediately (for manual trigger/testing)
 */
async function sendDailySMSSummaries() {
  console.log('Starting daily SMS summary job (manual trigger)...');

  // Get user settings where SMS is enabled
  const { data: settings, error: settingsError } = await getSupabase()
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

  // Get grouped todos (today, tomorrow, upcoming, overdue)
  const groupedTodos = await getGroupedTodos();
  const message = formatTodosMessage(groupedTodos);

  // Send to each user via WhatsApp
  for (const user of settings as UserSettings[]) {
    if (user.phone_number) {
      console.log(`Sending daily summary via WhatsApp to ${user.phone_number}...`);
      const success = await sendWhatsApp(user.phone_number, message);
      if (success) {
        console.log(`✓ Daily WhatsApp sent to ${user.phone_number}`);
      } else {
        console.log(`✗ Failed to send WhatsApp to ${user.phone_number}`);
      }
    }
  }

  console.log('Daily SMS summary job completed.');
}

/**
 * Start the daily SMS cron job
 * Runs every minute to check if any user's scheduled time has arrived
 */
export function startDailySMSCron() {
  if (!isTwilioConfigured()) {
    console.log('⚠️ Twilio not configured. Daily SMS cron job will not send messages.');
    console.log('   Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER to enable.');
  }

  // Run every 5 minutes to check for scheduled times (reduces DB queries by 80%)
  cron.schedule('*/5 * * * *', () => {
    checkAndSendDailySummaries();
  });

  console.log('📱 Daily SMS cron job started (checks every 5 minutes for scheduled times)');
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

