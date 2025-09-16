/**
 * Centralized API configuration
 * Use this instead of hardcoding URLs throughout the app
 */

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Get the full API URL for an endpoint
 * @param endpoint - The API endpoint (e.g., '/api/auth/login/')
 * @returns Full URL
 */
export const getApiUrl = (endpoint: string): string => {
  // Ensure endpoint starts with /
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
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
