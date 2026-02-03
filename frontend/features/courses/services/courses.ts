/**
 * Courses API service - Public course endpoints
 */
import { API_BASE_URL, authenticatedFetch } from '@/shared/services/api-client';
import { getErrorMessage, parseErrorResponse, enhancedFetch } from '@/lib/utils/error';

export const coursesApi = {
  getCourses: async (params?: {
    category?: string;
    level?: string;
    org_type?: string;
    search?: string;
    featured?: boolean;
  }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, value.toString());
          }
        });
      }

      const url = `/courses/${queryParams.toString() ? `?${queryParams}` : ''}`;
      const fullUrl = `${API_BASE_URL}${url}`;

      console.log('[coursesApi.getCourses] Fetching from:', fullUrl);
      const response = await enhancedFetch(fullUrl, { method: 'GET' });

      if (!response.ok) {
        const errorMessage = await parseErrorResponse(response);
        throw new Error(errorMessage);
      }

      return response.json();
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  getAllCourses: async (params?: {
    category?: string;
    level?: string;
    org_type?: string;
    search?: string;
    featured?: boolean;
  }) => {
    return coursesApi.getCourses(params);
  },

  getCourse: async (slug: string) => {
    try {
      const response = await enhancedFetch(`${API_BASE_URL}/courses/${slug}/`, {
        method: 'GET',
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

  getCourseModules: async (slug: string) => {
    try {
      const response = await enhancedFetch(`${API_BASE_URL}/courses/${slug}/modules/`, {
        method: 'GET',
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

  getModuleLessons: async (slug: string, moduleId: string) => {
    try {
      const response = await enhancedFetch(
        `${API_BASE_URL}/courses/${slug}/modules/${moduleId}/lessons/`,
        { method: 'GET' }
      );

      if (!response.ok) {
        const errorMessage = await parseErrorResponse(response);
        throw new Error(errorMessage);
      }

      return response.json();
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  getCourseModulesPreview: async (slug: string) => {
    try {
      const response = await enhancedFetch(`${API_BASE_URL}/courses/${slug}/preview/modules/`, {
        method: 'GET',
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

  getModuleLessonsPreview: async (slug: string, moduleId: string) => {
    try {
      const response = await enhancedFetch(
        `${API_BASE_URL}/courses/${slug}/preview/modules/${moduleId}/lessons/`,
        { method: 'GET' }
      );

      if (!response.ok) {
        const errorMessage = await parseErrorResponse(response);
        throw new Error(errorMessage);
      }

      return response.json();
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  getFeaturedCourses: async () => {
    try {
      const response = await enhancedFetch(`${API_BASE_URL}/courses/featured/`, {
        method: 'GET',
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

  getCourseStats: async () => {
    try {
      const response = await enhancedFetch(`${API_BASE_URL}/courses/stats/`, {
        method: 'GET',
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

  enrollInCourse: async (courseSlug: string) => {
    const response = await authenticatedFetch(`/api/courses/${courseSlug}/enroll/`, {
      method: 'POST',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Enrollment failed');
    }

    return response.json();
  },

  getMyEnrollments: async () => {
    const response = await authenticatedFetch('/api/courses/enrollments/my/');

    if (!response.ok) {
      throw new Error('Failed to fetch enrollments');
    }

    return response.json();
  },
};

export default coursesApi;
