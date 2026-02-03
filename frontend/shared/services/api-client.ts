/**
 * Base API client with authentication and token refresh
 */

// Get base URL and ensure it includes /api path
const getApiBaseUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  if (!envUrl.endsWith('/api')) {
    return `${envUrl}/api`;
  }
  return envUrl;
};

export const API_BASE_URL = getApiBaseUrl();

// Helper function for backward compatibility
export const getBaseApiUrl = (): string => API_BASE_URL;

// Debug logging in browser
if (typeof window !== 'undefined') {
  console.log('[API Config] API_BASE_URL:', API_BASE_URL);
}

// Token management
export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token');
};

export const getRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('refresh_token');
};

export const setTokens = (access: string, refresh: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('access_token', access);
  localStorage.setItem('refresh_token', refresh);
};

export const clearTokens = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('currentUser');
};

// Refresh access token using refresh token
const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('access_token', data.access);
      return data.access;
    }
  } catch {
    // Token refresh failed silently
  }

  return null;
};

// Clean URL helper - strips /api/ prefix if present
const cleanUrl = (url: string): string => {
  return url.startsWith('/api/') ? url.slice(4) : url;
};

// Basic authenticated fetch
export const authenticatedFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = getAuthToken();
  const cleanedUrl = cleanUrl(url);

  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  return fetch(`${API_BASE_URL}${cleanedUrl}`, config);
};

// Authenticated fetch with automatic token refresh
export const authenticatedFetchWithRefresh = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = getAuthToken();
  const cleanedUrl = cleanUrl(url);

  const makeRequest = async (authToken: string | null) => {
    const headers: HeadersInit = {
      ...(authToken && { Authorization: `Bearer ${authToken}` }),
      ...options.headers,
    };

    // Only set Content-Type if body is not FormData
    if (!(options.body instanceof FormData)) {
      (headers as Record<string, string>)['Content-Type'] = 'application/json';
    }

    return fetch(`${API_BASE_URL}${cleanedUrl}`, {
      ...options,
      headers,
    });
  };

  // First attempt with current token
  let response = await makeRequest(token);

  // If unauthorized and we have a refresh token, try to refresh
  if (response.status === 401 && getRefreshToken()) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      response = await makeRequest(newToken);
    }
  }

  return response;
};

// Generic API methods for simple requests
export const apiClient = {
  get: (url: string) => authenticatedFetch(url),

  post: (url: string, data: Record<string, unknown>) =>
    authenticatedFetch(url, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  put: (url: string, data: Record<string, unknown>) =>
    authenticatedFetch(url, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  patch: (url: string, data: Record<string, unknown>) =>
    authenticatedFetch(url, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (url: string) =>
    authenticatedFetch(url, {
      method: 'DELETE',
    }),
};

export default apiClient;
