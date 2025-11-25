# Alert Integration Setup

## Prerequisites

For real-time alert notifications to work, you need to install the Supabase client:

```bash
npm install @supabase/supabase-js
```

## Environment Variables

Add these to your `.env` file or `app.json`:

```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## How It Works

1. **Desktop App Creates Alert**: Admin creates alert via desktop app → saved to Supabase `alerts` table
2. **Mobile App Receives**: Mobile app subscribes to Supabase Realtime → receives alert immediately when created
3. **Alert Display**: Mobile app shows appropriate modal based on alert type:
   - `warning` → Weather Alert Modal
   - `error` → Emergency Alert Modal
   - `info` → Class Suspension Modal

## Alert Type Mapping

Desktop app UI types map to Supabase types:

- "Weather" → `warning`
- "Emergency" → `error`
- "Class Suspension" → `info`

## Fallback Behavior

If Supabase client is not installed or Realtime fails, the app will automatically fallback to polling every 30 seconds to fetch new alerts.
