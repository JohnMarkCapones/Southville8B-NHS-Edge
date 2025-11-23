import { supabase } from "@/lib/supabase-client";
import { setAuthToken } from "./auth-token";
import {
  saveTokens,
  loadTokens,
  clearTokens,
  type StoredTokens,
} from "@/lib/storage/token-storage";

export type TokenListener = (tokens: StoredTokens | null) => void;

const listeners = new Set<TokenListener>();

function notify(tokens: StoredTokens | null): void {
  listeners.forEach((listener) => {
    try {
      listener(tokens);
    } catch (error) {
      console.warn("[token-manager] listener failed", error);
    }
  });
}

export function subscribeToTokenChanges(listener: TokenListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export async function persistTokens(tokens: StoredTokens): Promise<void> {
  await saveTokens(tokens);
  setAuthToken(tokens.accessToken);
  notify(tokens);
}

export async function restoreTokensFromStorage(): Promise<StoredTokens | null> {
  const tokens = await loadTokens();

  if (!tokens?.accessToken) {
    setAuthToken(null);
    return null;
  }

  setAuthToken(tokens.accessToken);
  return tokens;
}

export async function clearStoredTokens(): Promise<void> {
  await clearTokens();
  setAuthToken(null);
  notify(null);
}

let refreshPromise: Promise<StoredTokens | null> | null = null;

async function runRefresh(): Promise<StoredTokens | null> {
  const tokens = await loadTokens();
  if (!tokens?.refreshToken) {
    return null;
  }

  if (!supabase?.auth?.refreshSession) {
    console.warn("[token-manager] Supabase client unavailable for refresh");
    return null;
  }

  const { data, error } = await supabase.auth.refreshSession({
    refresh_token: tokens.refreshToken,
  });

  if (error || !data.session) {
    console.warn("[token-manager] Token refresh failed", error?.message);
    return null;
  }

  const nextTokens: StoredTokens = {
    accessToken: data.session.access_token,
    refreshToken: data.session.refresh_token ?? tokens.refreshToken,
  };

  await persistTokens(nextTokens);
  return nextTokens;
}

export async function refreshTokensWithSupabase(): Promise<StoredTokens | null> {
  if (!refreshPromise) {
    refreshPromise = runRefresh().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}
