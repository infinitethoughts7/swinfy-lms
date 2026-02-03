/**
 * Authentication API service
 */
import { API_BASE_URL, clearTokens } from '@/shared/services/api-client';
import { getErrorMessage, parseErrorResponse, enhancedFetch } from '@/lib/utils/error';
import type {
  LoginCredentials,
  LoginResponse,
  RegistrationData,
  RegistrationResponse,
} from '@/shared/types';

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    try {
      const response = await enhancedFetch(`${API_BASE_URL}/auth/login/`, {
        method: 'POST',
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorMessage = await parseErrorResponse(response);
        throw new Error(errorMessage);
      }

      return response.json();
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  register: async (userData: RegistrationData): Promise<RegistrationResponse> => {
    try {
      const response = await enhancedFetch(`${API_BASE_URL}/auth/register/`, {
        method: 'POST',
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorMessage = await parseErrorResponse(response);
        throw new Error(errorMessage);
      }

      return response.json();
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  forgotPassword: async (data: { email: string }): Promise<{ message: string }> => {
    try {
      const response = await enhancedFetch(`${API_BASE_URL}/auth/forgot-password/`, {
        method: 'POST',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorMessage = await parseErrorResponse(response);
        throw new Error(errorMessage);
      }

      return response.json();
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  verifyResetOTP: async (data: { email: string; otp_code: string }): Promise<{ message: string }> => {
    try {
      const response = await enhancedFetch(`${API_BASE_URL}/auth/verify-reset-otp/`, {
        method: 'POST',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorMessage = await parseErrorResponse(response);
        throw new Error(errorMessage);
      }

      return response.json();
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  resetPassword: async (data: {
    email: string;
    otp_code: string;
    new_password: string;
  }): Promise<{ message: string }> => {
    try {
      const response = await enhancedFetch(`${API_BASE_URL}/auth/reset-password/`, {
        method: 'POST',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorMessage = await parseErrorResponse(response);
        throw new Error(errorMessage);
      }

      return response.json();
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  refreshToken: async (refreshToken: string): Promise<{ access: string }> => {
    const response = await fetch(`${API_BASE_URL}/auth/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Token refresh failed');
    }

    return data;
  },

  getProfile: async (): Promise<Record<string, unknown>> => {
    const { authenticatedFetch } = await import('@/shared/services/api-client');
    const response = await authenticatedFetch('/api/auth/profile/');

    if (!response.ok) {
      throw new Error('Failed to fetch profile');
    }

    return response.json();
  },

  logout: async (): Promise<void> => {
    if (typeof window === 'undefined') return;

    const refreshToken = localStorage.getItem('refresh_token');

    if (refreshToken) {
      try {
        await fetch(`${API_BASE_URL}/auth/logout/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh: refreshToken }),
        });
      } catch {
        // Ignore logout errors
      }
    }

    clearTokens();
  },
};

export default authApi;
