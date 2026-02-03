/**
 * Instructor course management API service
 */
import {
  API_BASE_URL,
  getAuthToken,
  authenticatedFetchWithRefresh,
} from '@/shared/services/api-client';
import type {
  Course,
  CourseCreateData,
  Module,
  ModuleCreateData,
  Lesson,
  LessonCreateData,
  InstructorStats,
  LiveSession,
  LiveSessionCreateData,
  LiveSessionUpdateData,
  LiveSessionStatusUpdateData,
} from '@/shared/types';

export const instructorApi = {
  getDashboardStats: async (): Promise<InstructorStats> => {
    const response = await authenticatedFetchWithRefresh(
      '/api/courses/instructor/dashboard/stats/',
      { method: 'GET' }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch dashboard stats');
    }

    return response.json();
  },

  courses: {
    list: async (): Promise<Course[]> => {
      const response = await authenticatedFetchWithRefresh('/api/courses/instructor/courses/', {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch courses');
      }

      const data = await response.json();
      return data.results || data;
    },

    create: async (courseData: CourseCreateData): Promise<Course> => {
      const token = getAuthToken();

      const formData = new FormData();
      Object.entries(courseData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (value instanceof File) {
            formData.append(key, value);
          } else {
            formData.append(key, value.toString());
          }
        }
      });

      const response = await fetch(`${API_BASE_URL}/courses/instructor/courses/`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const fieldErrors = Object.entries(errorData)
          .filter(([, value]) => Array.isArray(value) && value.length > 0)
          .map(([field, errors]) => `${field}: ${(errors as string[]).join(', ')}`)
          .join('; ');

        throw new Error(
          fieldErrors || errorData.error || errorData.message || 'Failed to create course'
        );
      }

      return response.json();
    },

    get: async (courseSlug: string): Promise<Course> => {
      const response = await authenticatedFetchWithRefresh(
        `/api/courses/instructor/courses/${courseSlug}/`,
        { method: 'GET' }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch course');
      }

      return response.json();
    },

    update: async (courseSlug: string, courseData: Partial<CourseCreateData>): Promise<Course> => {
      const token = getAuthToken();

      const formData = new FormData();
      Object.entries(courseData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (value instanceof File) {
            formData.append(key, value);
          } else {
            formData.append(key, value.toString());
          }
        }
      });

      const response = await fetch(`${API_BASE_URL}/courses/instructor/courses/${courseSlug}/`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const fieldErrors = Object.entries(errorData)
          .filter(([, value]) => Array.isArray(value) && value.length > 0)
          .map(([field, errors]) => `${field}: ${(errors as string[]).join(', ')}`)
          .join('; ');

        throw new Error(
          fieldErrors || errorData.error || errorData.message || 'Failed to update course'
        );
      }

      return response.json();
    },

    delete: async (courseSlug: string): Promise<void> => {
      const token = getAuthToken();

      const response = await fetch(`${API_BASE_URL}/courses/instructor/courses/${courseSlug}/`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete course');
      }
    },
  },

  modules: {
    list: async (courseSlug: string): Promise<Module[]> => {
      const token = getAuthToken();

      const response = await fetch(
        `${API_BASE_URL}/courses/instructor/courses/${courseSlug}/modules/`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch modules');
      }

      const data = await response.json();
      return data.results || data;
    },

    create: async (courseSlug: string, moduleData: ModuleCreateData): Promise<Module> => {
      const token = getAuthToken();

      const response = await fetch(
        `${API_BASE_URL}/courses/instructor/courses/${courseSlug}/modules/`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(moduleData),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to create module');
      }

      return response.json();
    },

    update: async (moduleId: string, moduleData: Partial<ModuleCreateData>): Promise<Module> => {
      const token = getAuthToken();

      const response = await fetch(`${API_BASE_URL}/courses/instructor/modules/${moduleId}/`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(moduleData),
      });

      if (!response.ok) {
        throw new Error('Failed to update module');
      }

      return response.json();
    },

    delete: async (moduleId: string): Promise<void> => {
      const token = getAuthToken();

      const response = await fetch(`${API_BASE_URL}/courses/instructor/modules/${moduleId}/`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete module');
      }
    },
  },

  lessons: {
    list: async (courseSlug: string, moduleId: string): Promise<Lesson[]> => {
      const token = getAuthToken();

      const response = await fetch(
        `${API_BASE_URL}/courses/instructor/courses/${courseSlug}/modules/${moduleId}/lessons/`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch lessons');
      }

      const data = await response.json();
      return data.results || data;
    },

    create: async (
      courseSlug: string,
      moduleId: string,
      lessonData: LessonCreateData
    ): Promise<Lesson> => {
      const token = getAuthToken();

      const formData = new FormData();
      Object.entries(lessonData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (value instanceof File) {
            formData.append(key, value);
          } else {
            formData.append(key, value.toString());
          }
        }
      });

      const response = await fetch(
        `${API_BASE_URL}/courses/instructor/courses/${courseSlug}/modules/${moduleId}/lessons/`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('Failed to create lesson');
      }

      return response.json();
    },

    update: async (lessonId: string, lessonData: Partial<LessonCreateData>): Promise<Lesson> => {
      const token = getAuthToken();

      const formData = new FormData();
      Object.entries(lessonData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (value instanceof File) {
            formData.append(key, value);
          } else {
            formData.append(key, value.toString());
          }
        }
      });

      const response = await fetch(`${API_BASE_URL}/courses/instructor/lessons/${lessonId}/`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to update lesson');
      }

      return response.json();
    },

    delete: async (lessonId: string): Promise<void> => {
      const token = getAuthToken();

      const response = await fetch(`${API_BASE_URL}/courses/instructor/lessons/${lessonId}/`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete lesson');
      }
    },
  },

  resources: {
    list: async (courseSlug: string) => {
      const token = getAuthToken();
      const response = await fetch(
        `${API_BASE_URL}/courses/instructor/courses/${courseSlug}/resources/`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      if (!response.ok) {
        throw new Error('Failed to fetch resources');
      }
      const data = await response.json();
      return data.results || data;
    },

    create: async (
      courseSlug: string,
      payload: {
        title: string;
        description?: string;
        resource_type: string;
        url?: string;
        is_public?: boolean;
        order?: number;
        file?: File | null;
      }
    ) => {
      const token = getAuthToken();

      const mapType = (t: string) => {
        switch (t) {
          case 'pdf':
          case 'document':
          case 'reference':
            return 'reference';
          case 'link':
            return 'link';
          case 'tool':
            return 'tool';
          case 'syllabus':
            return 'syllabus';
          case 'schedule':
            return 'schedule';
          case 'certificate_template':
            return 'certificate_template';
          default:
            return 'other';
        }
      };

      const formData = new FormData();
      formData.append('title', payload.title);
      if (payload.description) formData.append('description', payload.description);
      formData.append('resource_type', mapType(payload.resource_type));
      if (payload.url) formData.append('url', payload.url);
      if (payload.is_public !== undefined) formData.append('is_public', String(payload.is_public));
      if (payload.order !== undefined) formData.append('order', String(payload.order));
      if (payload.file) formData.append('file', payload.file);

      const response = await fetch(
        `${API_BASE_URL}/courses/instructor/courses/${courseSlug}/resources/`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );
      if (!response.ok) {
        const err = await response.json().catch(() => ({} as Record<string, unknown>));
        const detail =
          (err as { error?: string }).error ||
          (err as { detail?: string }).detail ||
          JSON.stringify(err);
        throw new Error(detail || 'Failed to create resource');
      }
      return response.json();
    },

    update: async (
      resourceId: string,
      payload: Partial<{
        title: string;
        description: string;
        resource_type: string;
        url: string;
        is_public: boolean;
        order: number;
        file: File | null;
      }>
    ) => {
      const token = getAuthToken();

      const mapType = (t?: string) => {
        if (!t) return undefined;
        switch (t) {
          case 'pdf':
          case 'document':
          case 'reference':
            return 'reference';
          case 'link':
            return 'link';
          case 'tool':
            return 'tool';
          case 'syllabus':
            return 'syllabus';
          case 'schedule':
            return 'schedule';
          case 'certificate_template':
            return 'certificate_template';
          default:
            return 'other';
        }
      };

      const formData = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === 'resource_type') {
            const mapped = mapType(value as string);
            if (mapped) formData.append('resource_type', mapped);
          } else if (value instanceof File) {
            formData.append('file', value);
          } else {
            formData.append(key, String(value));
          }
        }
      });

      const response = await fetch(`${API_BASE_URL}/courses/instructor/resources/${resourceId}/`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({} as Record<string, unknown>));
        const detail =
          (err as { error?: string }).error ||
          (err as { detail?: string }).detail ||
          JSON.stringify(err);
        throw new Error(detail || 'Failed to update resource');
      }
      return response.json();
    },

    delete: async (resourceId: string) => {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/courses/instructor/resources/${resourceId}/`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to delete resource');
      }
      return true;
    },
  },

  liveSessions: {
    list: async (): Promise<LiveSession[]> => {
      const response = await authenticatedFetchWithRefresh(
        '/api/courses/live-sessions/instructor/live-sessions/',
        { method: 'GET' }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch live sessions');
      }

      const data = await response.json();
      return data.results || data;
    },

    create: async (sessionData: LiveSessionCreateData): Promise<LiveSession> => {
      const response = await authenticatedFetchWithRefresh(
        '/api/courses/live-sessions/instructor/live-sessions/',
        {
          method: 'POST',
          body: JSON.stringify(sessionData),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create live session');
      }

      return response.json();
    },

    get: async (sessionId: string): Promise<LiveSession> => {
      const response = await authenticatedFetchWithRefresh(
        `/api/courses/live-sessions/instructor/live-sessions/${sessionId}/`,
        { method: 'GET' }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch live session');
      }

      return response.json();
    },

    update: async (sessionId: string, sessionData: LiveSessionUpdateData): Promise<LiveSession> => {
      const response = await authenticatedFetchWithRefresh(
        `/api/courses/live-sessions/instructor/live-sessions/${sessionId}/`,
        {
          method: 'PATCH',
          body: JSON.stringify(sessionData),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update live session');
      }

      return response.json();
    },

    delete: async (sessionId: string): Promise<void> => {
      const response = await authenticatedFetchWithRefresh(
        `/api/courses/live-sessions/instructor/live-sessions/${sessionId}/`,
        { method: 'DELETE' }
      );

      if (!response.ok) {
        throw new Error('Failed to delete live session');
      }
    },

    updateStatus: async (
      sessionId: string,
      statusData: LiveSessionStatusUpdateData
    ): Promise<LiveSession> => {
      const response = await authenticatedFetchWithRefresh(
        `/api/courses/live-sessions/instructor/live-sessions/${sessionId}/update_status/`,
        {
          method: 'POST',
          body: JSON.stringify(statusData),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update session status');
      }

      return response.json();
    },

    sendReminder: async (sessionId: string): Promise<void> => {
      const response = await authenticatedFetchWithRefresh(
        `/api/courses/live-sessions/instructor/live-sessions/${sessionId}/send_reminder/`,
        { method: 'POST' }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send reminder');
      }
    },
  },
};

export default instructorApi;
