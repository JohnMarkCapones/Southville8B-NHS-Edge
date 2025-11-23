import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import type { LoginRequest, LoginResponse } from "@/services/auth";
import {
  clearAuthSession,
  login as loginService,
  restoreAuthSession,
} from "@/services/auth";
// import { recordLogin } from "@/services/user";
import type { StoredTokens } from "@/lib/storage/token-storage";
import { subscribeToTokenChanges } from "@/lib/auth/token-manager";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthSessionContextValue = {
  status: AuthStatus;
  tokens: StoredTokens | null;
  signIn: (payload: LoginRequest) => Promise<LoginResponse>;
  signOut: () => void;
  handleTokenExpiration: (error: any) => boolean;
  isLoggingOut: boolean;
  setIsLoggingOut: (value: boolean) => void;
};

const AuthSessionContext = createContext<AuthSessionContextValue | undefined>(
  undefined
);

export function AuthSessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [tokens, setTokens] = useState<StoredTokens | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    restoreAuthSession()
      .then((restoredTokens) => {
        if (restoredTokens) {
          setTokens(restoredTokens);
          setStatus("authenticated");
          return;
        }

        setTokens(null);
        setStatus("unauthenticated");
      })
      .catch((error) => {
        console.warn("[AuthSessionProvider] Failed to restore session", error);
        setTokens(null);
        setStatus("unauthenticated");
      });
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToTokenChanges((nextTokens) => {
      setTokens(nextTokens);
      if (nextTokens) {
        setStatus("authenticated");
      } else {
        setStatus((prev) =>
          prev === "loading" ? "loading" : "unauthenticated"
        );
      }
    });

    return unsubscribe;
  }, []);

  const signIn = useCallback(async (payload: LoginRequest) => {
    try {
      const response = await loginService(payload);
      const restoredTokens = await restoreAuthSession();

      if (restoredTokens) {
        setTokens(restoredTokens);
        setStatus("authenticated");

        // Backend already records daily login; skip client backup call to avoid 404s
      } else {
        setTokens(null);
        setStatus("unauthenticated");
      }

      return response;
    } catch (error) {
      setTokens(null);
      setStatus("unauthenticated");
      throw error;
    }
  }, []);

  const signOut = useCallback(() => {
    console.log(
      "[AuthSession] Signing out - clearing stored tokens and auth state"
    );
    clearAuthSession().catch((error) =>
      console.warn("[AuthSession] Failed to clear auth session", error)
    );
    setStatus("unauthenticated");
    setTokens(null);
  }, []);

  const handleTokenExpiration = useCallback(
    (error: any): boolean => {
      if (!error) return false;

      const errorStr = error.toString().toLowerCase();

      // Check for authentication-related errors
      const isAuthError =
        errorStr.includes("unauthorized") ||
        errorStr.includes("token") ||
        errorStr.includes("expired") ||
        errorStr.includes("invalid") ||
        errorStr.includes("401") ||
        errorStr.includes("403") ||
        errorStr.includes("forbidden") ||
        errorStr.includes("jwt") ||
        errorStr.includes("authentication") ||
        errorStr.includes("no authentication token");

      if (isAuthError) {
        console.log(
          "[AuthSession] Token expired/invalid - clearing auth state automatically"
        );
        signOut(); // Immediately clear auth state
        return true; // Indicates that auth state was cleared
      }

      return false; // Not an auth error
    },
    [signOut]
  );

  const value = useMemo<AuthSessionContextValue>(() => {
    return {
      status,
      tokens,
      signIn,
      signOut,
      handleTokenExpiration,
      isLoggingOut,
      setIsLoggingOut,
    };
  }, [
    status,
    tokens?.accessToken,
    tokens?.refreshToken,
    signOut,
    handleTokenExpiration,
    isLoggingOut,
  ]);

  return (
    <AuthSessionContext.Provider value={value}>
      {children}
    </AuthSessionContext.Provider>
  );
}

export function useAuthSession(): AuthSessionContextValue {
  const context = useContext(AuthSessionContext);

  if (!context) {
    throw new Error(
      "useAuthSession must be used within an AuthSessionProvider."
    );
  }

  return context;
}
