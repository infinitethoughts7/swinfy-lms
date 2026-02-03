/**
 * Learner Dashboard API service
 */
import { authenticatedFetch } from '@/shared/services/api-client';

export const learnerDashboardApi = {
  getMyCourses: async () => {
    const response = await authenticatedFetch('/api/courses/my-courses/');

    if (!response.ok) {
      throw new Error('Failed to fetch enrolled courses');
    }

    return response.json();
  },

  getProgressAnalytics: async () => {
    const response = await authenticatedFetch('/api/courses/analytics/learner-progress/');

    if (!response.ok) {
      throw new Error('Failed to fetch progress analytics');
    }

    return response.json();
  },

  getCourseProgress: async (courseSlug: string) => {
    const response = await authenticatedFetch(`/api/courses/${courseSlug}/progress/`);

    if (!response.ok) {
      throw new Error('Failed to fetch course progress');
    }

    return response.json();
  },

  getCourseDetail: async (courseSlug: string) => {
    const response = await authenticatedFetch(`/api/courses/${courseSlug}/`);

    if (!response.ok) {
      throw new Error('Failed to fetch course details');
    }

    return response.json();
  },

  getNotifications: async () => {
    const response = await authenticatedFetch('/api/courses/notifications/');

    if (!response.ok) {
      throw new Error('Failed to fetch notifications');
    }

    return response.json();
  },

  markNotificationAsRead: async (notificationId: number) => {
    const response = await authenticatedFetch(`/api/courses/notifications/${notificationId}/`, {
      method: 'PATCH',
      body: JSON.stringify({ is_read: true }),
    });

    if (!response.ok) {
      throw new Error('Failed to mark notification as read');
    }

    return response.json();
  },

  completeLesson: async (lessonId: number) => {
    const response = await authenticatedFetch(`/api/courses/lessons/${lessonId}/complete/`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('Failed to complete lesson');
    }

    return response.json();
  },

  startStudySession: async (courseId: string) => {
    const response = await authenticatedFetch('/api/courses/study-sessions/', {
      method: 'POST',
      body: JSON.stringify({ course: courseId }),
    });

    if (!response.ok) {
      throw new Error('Failed to start study session');
    }

    return response.json();
  },

  endStudySession: async (sessionId: number, progressMade: number) => {
    const response = await authenticatedFetch(`/api/courses/study-sessions/${sessionId}/`, {
      method: 'PATCH',
      body: JSON.stringify({
        ended_at: new Date().toISOString(),
        progress_made: progressMade,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to end study session');
    }

    return response.json();
  },

  getWeeklyActivity: async () => {
    const response = await authenticatedFetch('/api/courses/analytics/weekly-activity/');

    if (!response.ok) {
      throw new Error('Failed to fetch weekly activity data');
    }

    return response.json();
  },

  getLearnerDistribution: async () => {
    const response = await authenticatedFetch('/api/courses/analytics/learner-distribution/');

    if (!response.ok) {
      throw new Error('Failed to fetch learner distribution data');
    }

    return response.json();
  },
};

export default learnerDashboardApi;
