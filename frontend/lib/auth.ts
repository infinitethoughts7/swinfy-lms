// Authentication utilities for client-side auth management

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'learner' | 'knowledge_partner_instructor' | 'knowledge_partner_admin' | 'student' | 'tutor' | 'admin';
  is_verified: boolean;
  knowledge_partner?: {
    id: string;
    name: string;
    type: string;
  };
}

// Get current user from localStorage
export const getCurrentUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
};

// Set current user in localStorage
export const setCurrentUser = (user: User): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('currentUser', JSON.stringify(user));
};

// Get access token
export const getAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token');
};

// Get refresh token
export const getRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('refresh_token');
};

// Set tokens
export const setTokens = (accessToken: string, refreshToken: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('access_token', accessToken);
  localStorage.setItem('refresh_token', refreshToken);
};

// Remove current user and tokens from localStorage
export const logout = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('currentUser');
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return getCurrentUser() !== null && getAccessToken() !== null;
};

// Check if token is expired (basic check)
export const isTokenExpired = (token: string): boolean => {
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch {
    return true;
  }
};

// Get dashboard route based on user role
export const getDashboardRoute = (role: string): string => {
  return `/dashboard/${role}`;
};

// Check if current user has permission
export const hasPermission = (permission: string): boolean => {
  const user = getCurrentUser();
  if (!user) return false;

  switch (permission) {
    case 'create_courses':
      return user.canCreateCourses;
    case 'manage_organization':
      return user.canManageOrganization;
    case 'admin_access':
      return user.role === 'admin';
    case 'tutor_access':
      return user.role === 'tutor' || user.role === 'admin';
    default:
      return false;
  }
};
