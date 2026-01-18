# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

TextedToDo is a minimalist todo app that sends SMS/WhatsApp notifications to remind users of their tasks. It's a single-user application (no authentication) with real-time updates via Supabase.

## Commands

```bash
# Install all dependencies (root, client, server)
npm run install:all

# Run both client and server in development mode
npm run dev

# Run only client (Vite dev server on port 5173)
npm run dev:client

# Run only server (Express on port 3001)
npm run dev:server

# Build everything
npm run build

# Lint client code
cd client && npm run lint
```

## Architecture

**Monorepo structure:**
- `/client` - React 19 frontend with Vite, TailwindCSS 4, React Query
- `/server` - Express.js backend with Twilio and Web Push
- `/supabase/migrations` - Database schema migrations

**Data flow:**
- Frontend uses React Query + Supabase JS client for direct database access (todos, classes)
- Server handles settings/SMS features requiring Twilio and service role access
- Real-time updates via Supabase subscriptions (`useRealtime.ts`)

**Key patterns:**
- Hooks in `/client/src/hooks/` encapsulate all data operations (useTodos, useClasses, useSettings, useNotifications)
- API functions in `/client/src/api/` abstract HTTP calls
- Server routes in `/server/src/routes/` with services in `/server/src/services/`
- Single user pattern: hardcoded `DEFAULT_USER_ID` UUID used throughout

**Database tables:**
- `todos` - Tasks with priority, due dates, recurrence, and class assignment
- `classes` - Categories with name, color, sort order
- `push_subscriptions` - Web Push endpoint storage
- `user_settings` - Phone number, SMS preferences, timezone

## Server Endpoints

- `GET/PUT /api/settings` - User settings management
- `POST /api/settings/phone/send-code` - Send Twilio Verify code
- `POST /api/settings/phone/verify` - Verify phone code
- `POST /api/settings/test-sms` - Send test WhatsApp message
- `POST /api/settings/trigger-daily` - Manually trigger daily summary
- `GET /api/vapid-key` - Get Web Push public key
- `POST/DELETE /api/subscriptions` - Web Push subscription management

## Environment Variables

**Client (.env):**
- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` - Supabase connection
- `VITE_API_URL` - Server URL (default: http://localhost:3001)

**Server (.env):**
- `PORT`, `FRONTEND_URL` - Server config and CORS origin
- `SUPABASE_URL`, `SUPABASE_SERVICE_KEY` - Supabase with service role
- `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` - Web Push keys
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` - Twilio SMS
- `TWILIO_WHATSAPP_NUMBER`, `TWILIO_VERIFY_SERVICE_SID` - Twilio WhatsApp/Verify

## Type Definitions

Core types in `/client/src/types/index.ts`:
- `Todo` - Full todo with id, title, due_date, priority, recurrence, class_id
- `Class` - Category with name, color, sort_order
- `UserSettings` - Phone, SMS preferences, timezone
- `Priority` - 'high' | 'medium' | 'low'
- `RecurrenceType` - 'daily' | 'weekly' | 'monthly'
- `FilterPreset` - 'all' | 'today' | 'upcoming' | 'completed'
