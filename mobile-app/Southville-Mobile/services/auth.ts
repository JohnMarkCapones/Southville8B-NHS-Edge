import { apiRequest, setAuthToken } from '@/lib/api-client';
import { clearTokens, loadTokens, saveTokens, type StoredTokens } from '@/lib/storage/token-storage';

export type LoginRequest = {
  email: string;
  password: string;
};

type LoginSession = {
  access_token?: string;
  refresh_token?: string;
  [key: string]: unknown;
};

export type LoginResponse = {
  accessToken?: string;
  refreshToken?: string;
  access_token?: string;
  refresh_token?: string;
  session?: LoginSession | null;
  user?: Record<string, unknown>;
  [key: string]: unknown;
};

function pickFirstToken(tokens: (string | undefined | null)[]): string | null {
  for (const token of tokens) {
    if (typeof token === 'string' && token.length > 0) {
      return token;
    }
  }

  return null;
}

function ensureTokens(response: LoginResponse): StoredTokens {
  const accessToken = pickFirstToken([
    response.accessToken,
    response.access_token,
    response.session?.access_token,
  ]);

  if (!accessToken) {
    throw new Error('Login response did not include an access token.');
  }

  const refreshToken = pickFirstToken([
    response.refreshToken,
    response.refresh_token,
    response.session?.refresh_token,
  ]);

  return refreshToken ? { accessToken, refreshToken } : { accessToken };
}

async function persistTokens(tokens: StoredTokens): Promise<void> {
  await saveTokens(tokens);
  setAuthToken(tokens.accessToken);
}

export async function login(request: LoginRequest): Promise<LoginResponse> {
  const response = await apiRequest<LoginResponse>('/auth/login', {
    method: 'POST',
    body: request,
  });

  const tokens = ensureTokens(response);
  await persistTokens(tokens);

  return response;
}

export async function restoreAuthSession(): Promise<StoredTokens | null> {
  const tokens = await loadTokens();

  if (!tokens) {
    setAuthToken(null);
    return null;
  }

  setAuthToken(tokens.accessToken);
  return tokens;
}

export async function clearAuthSession(): Promise<void> {
  await clearTokens();
  setAuthToken(null);
}

export type ChangePasswordRequest = {
  currentPassword: string;
  newPassword: string;
};

export type ChangePasswordResponse = {
  message?: string;
};

export async function changePassword(
  request: ChangePasswordRequest
): Promise<ChangePasswordResponse> {
  // Ensure auth header is set from persisted session
  const tokens = await loadTokens();
  if (tokens?.accessToken) {
    setAuthToken(tokens.accessToken);
  }

  return await apiRequest<ChangePasswordResponse>('/auth/change-password', {
    method: 'POST',
    body: {
      currentPassword: request.currentPassword,
      newPassword: request.newPassword,
    },
  });
}