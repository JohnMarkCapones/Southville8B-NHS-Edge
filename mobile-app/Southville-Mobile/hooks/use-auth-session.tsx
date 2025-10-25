import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import type { LoginRequest, LoginResponse } from '@/services/auth';
import { login as loginService, restoreAuthSession } from '@/services/auth';
import type { StoredTokens } from '@/lib/storage/token-storage';


export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

type AuthSessionContextValue = {
  status: AuthStatus;
  tokens: StoredTokens | null;
  signIn: (payload: LoginRequest) => Promise<LoginResponse>;
};

const AuthSessionContext = createContext<AuthSessionContextValue | undefined>(undefined);

export function AuthSessionProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [tokens, setTokens] = useState<StoredTokens | null>(null);

  useEffect(() => {
    restoreAuthSession()
      .then((restoredTokens) => {
        if (restoredTokens) {
          setTokens(restoredTokens);
          setStatus('authenticated');
          return;
        }

        setTokens(null);
        setStatus('unauthenticated');
      })
      .catch((error) => {
        console.warn('[AuthSessionProvider] Failed to restore session', error);
        setTokens(null);
        setStatus('unauthenticated');
      });
  }, []);

  const signIn = useCallback(async (payload: LoginRequest) => {
    try {
      const response = await loginService(payload);
      const restoredTokens = await restoreAuthSession();

      if (restoredTokens) {
        setTokens(restoredTokens);
        setStatus('authenticated');
      } else {
        setTokens(null);
        setStatus('unauthenticated');
      }

      return response;
    } catch (error) {
      setTokens(null);
      setStatus('unauthenticated');
      throw error;
    }
  }, []);

  const value = useMemo<AuthSessionContextValue>(() => {
    return { status, tokens, signIn };
  }, [status, tokens?.accessToken, tokens?.refreshToken]);

  return <AuthSessionContext.Provider value={value}>{children}</AuthSessionContext.Provider>;
}

export function useAuthSession(): AuthSessionContextValue {
  const context = useContext(AuthSessionContext);

  if (!context) {
    throw new Error('useAuthSession must be used within an AuthSessionProvider.');
  }

  return context;
}
