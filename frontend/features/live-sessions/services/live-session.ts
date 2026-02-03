/**
 * Live Session API for learners
 */
import { authenticatedFetchWithRefresh } from '@/shared/services/api-client';
import type { LiveSession, LiveSessionApprovalData } from '@/shared/types';

export const liveSessionApi = {
  list: async (): Promise<LiveSession[]> => {
    const response = await authenticatedFetchWithRefresh(
      '/api/courses/live-sessions/learner/live-sessions/',
      { method: 'GET' }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch live sessions');
    }

    const data = await response.json();
    return data.results || data;
  },

  upcoming: async (): Promise<LiveSession[]> => {
    const response = await authenticatedFetchWithRefresh(
      '/api/courses/live-sessions/learner/live-sessions/upcoming/',
      { method: 'GET' }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch upcoming sessions');
    }

    return response.json();
  },

  liveNow: async (): Promise<LiveSession[]> => {
    const response = await authenticatedFetchWithRefresh(
      '/api/courses/live-sessions/learner/live-sessions/live_now/',
      { method: 'GET' }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch live sessions');
    }

    return response.json();
  },

  past: async (): Promise<LiveSession[]> => {
    const response = await authenticatedFetchWithRefresh(
      '/api/courses/live-sessions/learner/live-sessions/past/',
      { method: 'GET' }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch past sessions');
    }

    return response.json();
  },

  get: async (sessionId: string): Promise<LiveSession> => {
    const response = await authenticatedFetchWithRefresh(
      `/api/courses/live-sessions/learner/live-sessions/${sessionId}/`,
      { method: 'GET' }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch live session');
    }

    return response.json();
  },
};

export const trainingPartnerLiveSessionApi = {
  list: async (): Promise<LiveSession[]> => {
    const response = await authenticatedFetchWithRefresh(
      '/api/courses/live-sessions/training-partner/live-sessions/',
      { method: 'GET' }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch live sessions: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.results || data;
  },

  approve: async (sessionId: string, approvalData: LiveSessionApprovalData): Promise<LiveSession> => {
    const response = await authenticatedFetchWithRefresh(
      `/api/courses/live-sessions/training-partner/live-sessions/${sessionId}/approve/`,
      {
        method: 'POST',
        body: JSON.stringify(approvalData),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to approve/reject session');
    }

    const data = await response.json();
    return data.session || data;
  },

  get: async (sessionId: string): Promise<LiveSession> => {
    const response = await authenticatedFetchWithRefresh(
      `/api/courses/live-sessions/training-partner/live-sessions/${sessionId}/`,
      { method: 'GET' }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch live session');
    }

    return response.json();
  },
};

export default liveSessionApi;
