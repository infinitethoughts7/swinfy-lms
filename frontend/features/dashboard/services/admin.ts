/**
 * Admin Dashboard API service
 */
import { authenticatedFetch } from '@/shared/services/api-client';

export const adminDashboardApi = {
  getDashboardStats: async () => {
    const response = await authenticatedFetch('/api/auth/dashboard/');

    if (!response.ok) {
      throw new Error('Failed to fetch dashboard stats');
    }

    return response.json();
  },

  getPaymentsByStatus: async (
    status: 'paid' | 'verified' | 'rejected' | 'pending' = 'paid'
  ) => {
    const endpoint =
      status === 'paid'
        ? '/api/payments/admin/pending/'
        : `/api/payments/admin/history/?status=${status}`;

    const response = await authenticatedFetch(endpoint);

    if (!response.ok) {
      throw new Error('Failed to fetch payments');
    }

    return response.json();
  },

  verifyPayment: async (
    paymentId: number | string,
    action: 'approve' | 'reject',
    notes?: string
  ) => {
    const response = await authenticatedFetch(`/api/payments/admin/verify/${paymentId}/`, {
      method: 'POST',
      body: JSON.stringify({ action, notes: notes || '' }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to verify payment');
    }

    return response.json();
  },

  getPaymentAnalytics: async () => {
    const response = await authenticatedFetch('/api/payments/admin/analytics/');

    if (!response.ok) {
      throw new Error('Failed to fetch payment analytics');
    }

    return response.json();
  },

  getPaymentHistory: async (status?: string) => {
    const url = `/api/payments/admin/history/${status ? `?status=${status}` : ''}`;
    const response = await authenticatedFetch(url);

    if (!response.ok) {
      throw new Error('Failed to fetch payment history');
    }

    return response.json();
  },

  getCoursePerformanceAnalytics: async () => {
    const response = await authenticatedFetch('/api/courses/analytics/course-performance/');

    if (!response.ok) {
      throw new Error('Failed to fetch course performance analytics');
    }

    return response.json();
  },

  getTrainingPartnerCourses: async () => {
    const response = await authenticatedFetch('/api/courses/my-courses/');

    if (!response.ok) {
      throw new Error('Failed to fetch training partner courses');
    }

    return response.json();
  },

  createCourse: async (courseData: Record<string, unknown>) => {
    const response = await authenticatedFetch('/api/courses/create/', {
      method: 'POST',
      body: JSON.stringify(courseData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create course');
    }

    return response.json();
  },

  updateCourse: async (courseSlug: string, courseData: Record<string, unknown>) => {
    const response = await authenticatedFetch(`/api/courses/${courseSlug}/update/`, {
      method: 'PUT',
      body: JSON.stringify(courseData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update course');
    }

    return response.json();
  },

  deleteCourse: async (courseSlug: string) => {
    const response = await authenticatedFetch(`/api/courses/${courseSlug}/delete/`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete course');
    }

    return response.json();
  },
};

export default adminDashboardApi;
