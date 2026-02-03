/**
 * User management API service
 */
import { authenticatedFetch, authenticatedFetchWithRefresh } from '@/shared/services/api-client';
import type { InstructorCreateData, InstructorUpdateData } from '@/shared/types';

export const userApi = {
  getProfile: async () => {
    const response = await authenticatedFetch('/api/auth/profile/detail/');

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Profile fetch failed:', response.status, errorText);
      throw new Error(`Failed to fetch user profile: ${response.status}`);
    }

    return response.json();
  },

  updateProfile: async (profileData: Record<string, unknown>) => {
    const response = await authenticatedFetch('/api/auth/profile/detail/', {
      method: 'PATCH',
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update profile');
    }

    return response.json();
  },

  updateProfileWithFile: async (formData: FormData) => {
    const response = await authenticatedFetchWithRefresh('/api/auth/profile/detail/', {
      method: 'PATCH',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();

      // Check if response is HTML (Django error page)
      if (errorText.trim().startsWith('<!DOCTYPE') || errorText.trim().startsWith('<html')) {
        const match =
          errorText.match(/<title>([^<]+)<\/title>/i) || errorText.match(/RuntimeError[^<]*/i);
        const errorMessage = match ? match[1] || match[0] : 'An error occurred on the server';
        throw new Error(`Server error: ${errorMessage}. Please check the server logs for details.`);
      }

      // Try to parse as JSON
      let error;
      try {
        error = JSON.parse(errorText);
      } catch {
        throw new Error(errorText || 'Failed to update profile');
      }

      // Check for field-specific validation errors
      const fieldErrors = Object.entries(error)
        .filter(
          ([key, value]) => Array.isArray(value) && value.length > 0 && key !== 'non_field_errors'
        )
        .map(([field, errors]) => `${field}: ${(errors as string[]).join(', ')}`)
        .join('; ');

      if (fieldErrors) {
        throw new Error(fieldErrors);
      }

      const errorMessage = error.error || error.message || error.detail || JSON.stringify(error);
      throw new Error(errorMessage || 'Failed to update profile');
    }

    return response.json();
  },

  getDashboardStats: async () => {
    const response = await authenticatedFetch('/api/auth/dashboard/');

    if (!response.ok) {
      throw new Error('Failed to fetch dashboard stats');
    }

    return response.json();
  },

  // KP Instructor Management
  instructors: {
    list: async (params?: { search?: string; available?: boolean }) => {
      const searchParams = new URLSearchParams();
      if (params?.search) searchParams.append('search', params.search);
      if (params?.available !== undefined)
        searchParams.append('available', params.available.toString());

      const response = await authenticatedFetchWithRefresh(
        `/api/auth/kp/instructors/?${searchParams}`,
        { method: 'GET' }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch instructors');
      }

      return response.json();
    },

    create: async (instructorData: InstructorCreateData) => {
      const requestPayload = {
        ...instructorData,
        confirm_password: instructorData.confirm_password || instructorData.password,
      };

      const response = await authenticatedFetchWithRefresh(`/api/auth/kp/instructors/`, {
        method: 'POST',
        body: JSON.stringify(requestPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const fieldErrors = Object.entries(errorData)
          .filter(([, value]) => Array.isArray(value) && value.length > 0)
          .map(([field, errors]) => `${field}: ${(errors as string[]).join(', ')}`)
          .join('; ');

        throw new Error(
          fieldErrors || errorData.detail || errorData.message || 'Failed to create instructor'
        );
      }

      return response.json();
    },

    get: async (instructorId: string) => {
      const response = await authenticatedFetchWithRefresh(
        `/api/auth/kp/instructors/${instructorId}/`,
        { method: 'GET' }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch instructor details');
      }

      return response.json();
    },

    update: async (instructorId: string, updateData: Partial<InstructorUpdateData>) => {
      const response = await authenticatedFetchWithRefresh(
        `/api/auth/kp/instructors/${instructorId}/`,
        {
          method: 'PATCH',
          body: JSON.stringify(updateData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || errorData.detail || 'Failed to update instructor'
        );
      }

      return response.json();
    },

    delete: async (instructorId: string) => {
      const response = await authenticatedFetchWithRefresh(
        `/api/auth/kp/instructors/${instructorId}/`,
        { method: 'DELETE' }
      );

      if (!response.ok) {
        throw new Error('Failed to delete instructor');
      }

      return response.status === 204;
    },
  },
};

export default userApi;
