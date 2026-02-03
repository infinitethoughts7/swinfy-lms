/**
 * Payments API service
 */
import { authenticatedFetch } from '@/shared/services/api-client';

export const paymentsApi = {
  createOrder: async (courseSlug: string) => {
    const response = await authenticatedFetch('/api/payments/create-order/', {
      method: 'POST',
      body: JSON.stringify({ course_slug: courseSlug }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create payment order');
    }

    return response.json();
  },

  getPaidPayments: async () => {
    const response = await authenticatedFetch('/api/payments/admin/pending/');
    if (!response.ok) {
      throw new Error('Failed to fetch paid payments');
    }
    return response.json();
  },

  adminVerify: async (
    paymentId: string,
    action: 'approve' | 'reject',
    notes?: string
  ) => {
    const response = await authenticatedFetch(`/api/payments/admin/verify/${paymentId}/`, {
      method: 'POST',
      body: JSON.stringify({ action, notes: notes || '' }),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({} as Record<string, unknown>));
      throw new Error(
        (error as { error?: string; detail?: string }).error ||
        (error as { error?: string; detail?: string }).detail ||
        'Failed to verify payment'
      );
    }
    return response.json();
  },

  verifyPayment: async (paymentData: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => {
    const response = await authenticatedFetch('/api/payments/verify/', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Payment verification failed');
    }

    return response.json();
  },

  getPaymentStatus: async (orderId: string) => {
    const response = await authenticatedFetch(`/api/payments/status/${orderId}/`);

    if (!response.ok) {
      throw new Error('Failed to fetch payment status');
    }

    return response.json();
  },

  getPaymentHistory: async () => {
    const response = await authenticatedFetch('/api/payments/history/');

    if (!response.ok) {
      throw new Error('Failed to fetch payment history');
    }

    return response.json();
  },

  checkEnrollment: async (courseSlug: string) => {
    const response = await authenticatedFetch(`/api/courses/${courseSlug}/enrollment-status/`);

    if (!response.ok) {
      throw new Error('Failed to check enrollment status');
    }

    return response.json();
  },
};

export default paymentsApi;
