// Auth utility functions for token management

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'learner' | 'tutor' | 'admin' | 'knowledge_partner_instructor' | 'knowledge_partner' | 'super_admin';
  role_display?: string;
}

// Get tokens from localStorage (SSR safe)
export const getTokens = (): AuthTokens | null => {
  try {
    if (typeof window === 'undefined') return null;
    
    const access = localStorage.getItem('access_token');
    const refresh = localStorage.getItem('refresh_token');
    
    if (access && refresh) {
      return { access, refresh };
    }
    return null;
  } catch (error) {
    console.error('Error getting tokens:', error);
    return null;
  }
};

// Save tokens to localStorage
export const saveTokens = (tokens: AuthTokens): void => {
  try {
    localStorage.setItem('access_token', tokens.access);
    localStorage.setItem('refresh_token', tokens.refresh);
  } catch (error) {
    console.error('Error saving tokens:', error);
  }
};

// Clear tokens and user data from localStorage
export const clearTokens = (): void => {
  try {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  } catch (error) {
    console.error('Error clearing tokens:', error);
  }
};

// Check if token is expired
export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true;
  }
};

// Refresh access token using refresh token
export const refreshAccessToken = async (): Promise<string | null> => {
  try {
    const tokens = getTokens();
    if (!tokens) {
      console.log('No refresh token available');
      return null;
    }

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const response = await fetch(`${API_BASE_URL}/api/auth/token/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: tokens.refresh }),
    });

    if (!response.ok) {
      console.log('Failed to refresh token - refresh token expired');
      clearTokens();
      return null;
    }

    const data = await response.json();
    const newTokens = { access: data.access, refresh: tokens.refresh };
    saveTokens(newTokens);
    
    return data.access;
  } catch (error) {
    console.error('Error refreshing token:', error);
    clearTokens();
    return null;
  }
};

// Get valid access token (refresh if needed)
export const getValidAccessToken = async (): Promise<string | null> => {
  try {
    const tokens = getTokens();
    if (!tokens) {
      console.log('No tokens available');
      return null;
    }

    // Check if access token is expired
    if (isTokenExpired(tokens.access)) {
      console.log('Access token expired, refreshing...');
      const newAccessToken = await refreshAccessToken();
      if (!newAccessToken) {
        console.log('Failed to refresh token - user needs to login again');
        return null;
      }
      return newAccessToken;
    }

    return tokens.access;
  } catch (error) {
    console.error('Error getting valid access token:', error);
    return null;
  }
};

// Make authenticated API request with automatic token refresh
export const authenticatedFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  try {
    const accessToken = await getValidAccessToken();
    
    if (!accessToken) {
      console.log('No valid access token available, redirecting to login');
      // Don't logout immediately, let the component handle the error
      throw new Error('No valid access token available');
    }

    // Build headers. If body is FormData, let the browser set the multipart boundary
    const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${accessToken}`,
      ...(options.headers as Record<string, string> | undefined),
    };
    if (!isFormData) {
      headers['Content-Type'] = headers['Content-Type'] || 'application/json';
    } else {
      // Ensure we don't force JSON for file uploads
      if ('Content-Type' in headers) delete headers['Content-Type'];
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    // If still unauthorized after refresh, throw error but don't logout immediately
    if (response.status === 401) {
      console.log('401 Unauthorized - user needs to login again');
      throw new Error('Authentication failed - please log in again');
    }

    return response;
  } catch (error) {
    // Only logout if it's a specific authentication error, not general errors
    if (error instanceof Error && error.message.includes('No valid access token available')) {
      throw error;
    }
    if (error instanceof Error && error.message.includes('Authentication failed')) {
      throw error;
    }
    // For other errors, just throw them without logging out
    throw error;
  }
};

// Get current user from localStorage (SSR safe)
export const getCurrentUser = (): User | null => {
  try {
    if (typeof window === 'undefined') return null;
    
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

// Save user to localStorage
export const saveUser = (user: User): void => {
  try {
    localStorage.setItem('user', JSON.stringify(user));
  } catch (error) {
    console.error('Error saving user:', error);
  }
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  const tokens = getTokens();
  if (!tokens) {
    return false;
  }
  
  // Check if access token is not expired
  return !isTokenExpired(tokens.access);
};

// Logout function
export const logout = (): void => {
  clearTokens();
  window.location.href = '/';
};

/**
 * Safely parse JSON response with error handling
 * @param response - Fetch response object
 * @returns Parsed JSON data or throws appropriate error
 */
export const safeJsonParse = async (response: Response): Promise<unknown> => {
  try {
    return await response.json();
  } catch {
    // If JSON parsing fails, it might be a binary response or HTML error page
    throw new Error(`Invalid response format: ${response.status} ${response.statusText}`);
  }
};