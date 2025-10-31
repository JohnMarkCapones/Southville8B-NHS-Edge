import Constants from 'expo-constants';
import { Platform } from 'react-native';

export class APIError extends Error {
  status?: number;
  data?: unknown;

  constructor(message: string, status?: number, data?: unknown) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

function getDevelopmentHost(): string | null {
  const debuggerHost =
    Constants.expoGo?.debuggerHost ??
    Constants.expoGo?.hostUri ??
    Constants.manifest2?.extra?.expoGo?.debuggerHost ??
    Constants.manifest2?.extra?.expoGo?.hostUri ??
    null;

  if (!debuggerHost) {
    return null;
  }

  const [host] = debuggerHost.split(':');

  if (!host || host === 'localhost' || host === '127.0.0.1') {
    return null;
  }

  return host;
}

const resolveDefaultBaseUrl = () => {
  if (__DEV__) {
    const host = getDevelopmentHost();
    if (host) {
      return `http://${host}:3000/api/v1`;
    }

    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:3000/api/v1';
    }

    if (Platform.OS === 'ios') {
      return 'http://127.0.0.1:3000/api/v1';
    }
  }

  return 'http://localhost:3000/api/v1';
};


const DEFAULT_BASE_URL = resolveDefaultBaseUrl();

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? DEFAULT_BASE_URL;

let authToken: string | null = null;

const isDev = process.env.NODE_ENV !== 'production';

if (isDev) {
  console.log('[apiClient] Using base URL', API_BASE_URL);
}

function maskSensitiveFields(body: Record<string, unknown>): Record<string, unknown> {
  const clone: Record<string, unknown> = { ...body };

  if (typeof clone.password === 'string') {
    clone.password = '***';
  }

  if (typeof clone.token === 'string') {
    clone.token = '***';
  }

  return clone;
}

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: Record<string, unknown> | FormData;
};

export function setAuthToken(token: string | null): void {
  authToken = token;
}

export function getAuthToken(): string | null {
  return authToken;
}

export async function apiRequest<TResponse = unknown>(
  path: string,
  options: RequestOptions = {},
): Promise<TResponse> {
  const { body, headers, ...rest } = options;
  const url = `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;

  const isFormData = body instanceof FormData;
  const preparedHeaders = new Headers(headers);
  preparedHeaders.set('Accept', 'application/json');

  if (authToken && !preparedHeaders.has('Authorization')) {
    preparedHeaders.set('Authorization', `Bearer ${authToken}`);
  }

  let preparedBody: BodyInit | undefined;

  if (body !== undefined) {
    if (isFormData) {
      preparedBody = body;
    } else {
      preparedHeaders.set('Content-Type', 'application/json');
      preparedBody = JSON.stringify(body);
    }
  }

  const method = rest.method ?? (body ? 'POST' : 'GET');
  const requestLabel = `[apiRequest] ${method} ${url}`;

  if (isDev) {
    const debugBody =
      body === undefined ? undefined : isFormData ? 'FormData' : maskSensitiveFields(body as Record<string, unknown>);
    console.log(requestLabel, { body: debugBody, auth: authToken ? 'attached' : 'none' });
  }

  let response: Response;

  try {
    response = await fetch(url, {
      method,
      ...rest,
      headers: preparedHeaders,
      body: preparedBody,
    });
  } catch (error) {
    if (isDev) {
      console.error(`${requestLabel} network error`, error);
    }

    throw new APIError('Unable to reach the server. Check your network connection.', undefined, error);
  }

  const contentType = response.headers.get('content-type') ?? '';
  const isJson = contentType.includes('application/json');
  const payload = isJson ? await response.json().catch(() => undefined) : await response.text();

  if (isDev) {
    console.log(`${requestLabel} -> ${response.status}`, isJson ? payload : '[non-json response]');
  }

  if (!response.ok) {
    const message =
      (payload && typeof payload === 'object' && 'message' in payload && typeof payload.message === 'string'
        ? payload.message
        : undefined) || response.statusText || 'Request failed';

    if (isDev) {
      console.error(`${requestLabel} failed`, payload);
    }

    throw new APIError(message, response.status, payload);
  }

  return payload as TResponse;
}
