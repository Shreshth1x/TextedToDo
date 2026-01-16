import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { subscriptionRoutes } from './routes/subscriptions.js';
import { startReminderCron } from './services/reminder.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api', subscriptionRoutes);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);

  // Start the reminder cron job
  startReminderCron();
});
