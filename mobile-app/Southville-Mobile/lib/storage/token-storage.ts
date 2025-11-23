import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export type StoredTokens = {
  accessToken: string;
  refreshToken?: string;
};

const ACCESS_TOKEN_KEY = 'southville-mobile.auth.accessToken';
const REFRESH_TOKEN_KEY = 'southville-mobile.auth.refreshToken';

const useSecureStore = Platform.OS !== 'web';

function getWebStorage(): Storage | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return window.localStorage;
  } catch (error) {
    console.warn('[token-storage] localStorage unavailable', error);
    return null;
  }
}

async function setItem(key: string, value: string): Promise<void> {
  if (useSecureStore) {
    try {
      await SecureStore.setItemAsync(key, value, {
        keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
      });
    } catch (error) {
      console.warn(`[token-storage] Failed to persist key ${key}`, error);
    }
    return;
  }

  const storage = getWebStorage();
  if (storage) {
    storage.setItem(key, value);
  }
}

async function getItem(key: string): Promise<string | null> {
  if (useSecureStore) {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.warn(`[token-storage] Failed to read key ${key}`, error);
      return null;
    }
  }

  const storage = getWebStorage();
  if (!storage) {
    return null;
  }

  return storage.getItem(key);
}

async function removeItem(key: string): Promise<void> {
  if (useSecureStore) {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.warn(`[token-storage] Failed to delete key ${key}`, error);
    }
    return;
  }

  const storage = getWebStorage();
  if (storage) {
    storage.removeItem(key);
  }
}

export async function saveTokens(tokens: StoredTokens): Promise<void> {
  await setItem(ACCESS_TOKEN_KEY, tokens.accessToken);

  if (tokens.refreshToken) {
    await setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
  } else {
    await removeItem(REFRESH_TOKEN_KEY);
  }
}

export async function loadTokens(): Promise<StoredTokens | null> {
  const accessToken = await getItem(ACCESS_TOKEN_KEY);

  if (!accessToken) {
    return null;
  }

  const refreshToken = await getItem(REFRESH_TOKEN_KEY);
  return refreshToken ? { accessToken, refreshToken } : { accessToken };
}

export async function clearTokens(): Promise<void> {
  await Promise.all([removeItem(ACCESS_TOKEN_KEY), removeItem(REFRESH_TOKEN_KEY)]);
}
