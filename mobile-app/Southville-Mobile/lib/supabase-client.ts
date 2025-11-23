import Constants from "expo-constants";

// Dynamically import Supabase client (only if package is installed)
let supabaseClient: any = null;

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createClient } = require("@supabase/supabase-js");

  const supabaseUrl =
    Constants.expoConfig?.extra?.supabaseUrl ||
    process.env.EXPO_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey =
    Constants.expoConfig?.extra?.supabaseAnonKey ||
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

  // Validate configuration
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("[Supabase] Missing environment variables:", {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseAnonKey,
      urlSource: supabaseUrl
        ? "found"
        : Constants.expoConfig?.extra?.supabaseUrl
        ? "expoConfig"
        : "env",
    });
    console.warn(
      "[Supabase] Realtime subscriptions will not work. Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in your .env file."
    );
  } else {
    console.log(
      "[Supabase] Initializing client with URL:",
      supabaseUrl.substring(0, 30) + "..."
    );
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
        heartbeatIntervalMs: 30000, // Send heartbeat every 30s
        reconnectAfterMs: (tries: number) => Math.min(tries * 1000, 30000), // Exponential backoff for reconnects
      },
    });
    console.log("[Supabase] Client initialized successfully");
  }
} catch (error) {
  console.error(
    "[Supabase] Failed to initialize client:",
    error instanceof Error ? error.message : error
  );
  console.warn(
    "@supabase/supabase-js is not installed. Realtime subscriptions will not work. Install with: npm install @supabase/supabase-js"
  );
}

export const supabase = supabaseClient;
