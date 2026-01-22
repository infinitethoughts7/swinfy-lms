/**
 * Centralized API configuration
 * Use this instead of hardcoding URLs throughout the app
 */

// Ensure API_BASE_URL always ends with /api
const getApiBaseUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  return envUrl.endsWith('/api') ? envUrl : `${envUrl}/api`;
};

export const API_BASE_URL = getApiBaseUrl();

/**
 * Get the full API URL for an endpoint
 * @param endpoint - The API endpoint (e.g., '/auth/login/' - without /api prefix)
 * @returns Full URL
 */
export const getApiUrl = (endpoint: string): string => {
  // Ensure endpoint starts with /
  let cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  // Strip /api/ prefix if present (API_BASE_URL already includes /api)
  if (cleanEndpoint.startsWith('/api/')) {
    cleanEndpoint = cleanEndpoint.slice(4);
  }
  return `${API_BASE_URL}${cleanEndpoint}`;
};

/**
 * Common API headers
 */
export const getApiHeaders = (includeAuth = false): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (includeAuth && typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
};

/**
 * Helper function to replace all the hardcoded URLs
 * Use this instead of: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
 */
export const getBaseApiUrl = (): string => API_BASE_URL;
