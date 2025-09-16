// Auth utility functions for token management

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
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

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/token/refresh/`, {
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
      // No valid token available, logout immediately
      logout();
      throw new Error('No valid access token available');
    }

    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    // If still unauthorized after refresh, logout immediately
    if (response.status === 401) {
      logout();
      throw new Error('Authentication failed - please log in again');
    }

    return response;
  } catch (error) {
    // If any error occurs during authentication, logout
    if (error instanceof Error && error.message.includes('Authentication failed')) {
      throw error;
    }
    logout();
    throw new Error('Authentication failed - please log in again');
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