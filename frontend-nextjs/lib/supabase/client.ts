/**
 * Supabase Client for Realtime Subscriptions
 *
 * Initializes and exports a singleton Supabase client instance
 * configured for realtime subscriptions with authentication.
 *
 * IMPORTANT: For Realtime subscriptions to work with custom JWTs,
 * we must use supabase.realtime.setAuth() instead of static headers.
 * Static headers in global config don't work for Realtime connections.
 */

"use client";

import { createClient, SupabaseClient } from "@supabase/supabase-js";

let supabaseClient: SupabaseClient | null = null;

/**
 * Get auth token from cookie
 */
function getTokenFromCookie(): string | null {
  if (typeof window === "undefined") return null;

  const match = document.cookie.match(/sb-access-token=([^;]+)/);
  if (match) {
    return decodeURIComponent(match[1]);
  }
  return null;
}

/**
 * Get or create Supabase client instance
 * Uses NEXT_PUBLIC environment variables for configuration
 *
 * IMPORTANT: This function ensures the auth token is set for Realtime
 * subscriptions. The token is read dynamically each time to ensure
 * it's always fresh.
 */
export function getSupabaseClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }

  // Create client if it doesn't exist
  if (!supabaseClient) {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
        heartbeatIntervalMs: 30000,
        reconnectAfterMs: (tries: number) => Math.min(tries * 1000, 30000),
      },
      auth: {
        persistSession: false, // We're using cookies from the backend
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });
  }

  // CRITICAL: Set auth token for Realtime subscriptions
  // This must be called dynamically each time to ensure fresh token
  // Static headers don't work for Realtime connections
  const accessToken = getTokenFromCookie();
  if (accessToken) {
    // Decode JWT to verify it has the correct structure for Supabase
    try {
      const payload = JSON.parse(atob(accessToken.split(".")[1]));
      console.log("[Supabase Client] JWT payload structure:", {
        hasSub: !!payload.sub,
        sub: payload.sub,
        hasRole: !!payload.role,
        role: payload.role,
        aud: payload.aud,
        exp: payload.exp,
        iat: payload.iat,
      });
    } catch (e) {
      console.warn("[Supabase Client] Could not decode JWT payload:", e);
    }

    supabaseClient.realtime.setAuth(accessToken);
    console.log("[Supabase Client] ✅ Auth token set for Realtime");
  } else {
    // Clear auth if no token (logout scenario)
    supabaseClient.realtime.setAuth(null);
    console.warn(
      "[Supabase Client] ⚠️ No auth token found, Realtime will use anonymous access"
    );
  }

  return supabaseClient;
}

/**
 * Check if Supabase client is available
 */
export function isSupabaseAvailable(): boolean {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    return !!url && !!key;
  } catch {
    return false;
  }
}
