# Environment Setup Guide

## What is the .env file?

The `.env` file contains **environment variables** that your chat service needs to connect to your Supabase database. These are **secret credentials** that should never be committed to git.

## Required Environment Variables

Your chat service needs these Supabase credentials and optional CORS configuration:

1. **`SUPABASE_URL`** - Your Supabase project URL
2. **`SUPABASE_ANON_KEY`** - Public anonymous key (safe for client-side)
3. **`SUPABASE_SERVICE_ROLE_KEY`** - Service role key (server-side only, bypasses RLS)
4. **`SUPABASE_JWT_SECRET`** - JWT secret for token verification (optional but recommended)
5. **`CORS_ORIGIN`** - Frontend origin for CORS (optional, defaults to localhost:3000 in development)

## How to Get These Values

### Option 1: Use the Same Credentials as Your Main API

If your main API layer (`core-api-layer`) already has Supabase configured, you can **copy the same values**:

1. Go to your main API's `.env` file
2. Copy the `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` values
3. Paste them into `southville-chat-service/.env`

### Option 2: Get from Supabase Dashboard

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Copy these values:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** key → `SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`
   - **JWT Secret** (from Settings → API → JWT Settings) → `SUPABASE_JWT_SECRET`

## Setup Steps

1. **Create the .env file** in `southville-chat-service/` directory:

   ```bash
   cd southville-chat-service
   copy .env.example .env
   ```

2. **Edit the .env file** and fill in your actual Supabase credentials:

   ```env
   SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   SUPABASE_JWT_SECRET=your-jwt-secret-here
   PORT=3001
   NODE_ENV=development
   CORS_ORIGIN=http://localhost:3000
   ```

3. **Restart the service** for changes to take effect

## Why These Credentials?

- **SUPABASE_URL**: Tells the service where your database is hosted
- **SUPABASE_ANON_KEY**: Used for authenticated requests with user context (respects RLS)
- **SUPABASE_SERVICE_ROLE_KEY**: Used for admin operations that bypass RLS (creating conversations, etc.)
- **SUPABASE_JWT_SECRET**: Used to verify JWT tokens from authenticated users
- **CORS_ORIGIN**: Frontend URL that can make requests (e.g., http://localhost:3000). In development, defaults to localhost:3000. Required when using credentials: true (cannot use wildcard '\*')

## Security Note

⚠️ **NEVER commit the `.env` file to git!** It's already in `.gitignore`, but double-check that your actual credentials are never pushed to the repository.

## Testing the Connection

After setting up the .env file, restart the service. If credentials are missing or incorrect, you'll see errors like:

- `SUPABASE_URL is required but not set in environment variables`
- Connection errors when trying to access the database

If the service starts successfully, the credentials are correct! ✅
