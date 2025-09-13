// API service for backend communication

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  tokens: {
    access: string;
    refresh: string;
  };
  user: {
    id: string;
    email: string;
    full_name: string;
    role: 'student' | 'tutor' | 'admin';
    is_verified: boolean;
    organization?: {
      id: string;
      name: string;
      type: string;
    };
    can_create_courses: boolean;
    can_manage_organization: boolean;
  };
}

export interface ApiError {
  error: string;
  details?: any;
}

// Get auth token from localStorage
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token');
};

// Create authenticated fetch request
const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  return fetch(`${API_BASE_URL}${url}`, config);
};

// Authentication API methods
export const authApi = {
  // Login user
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }

    return data;
  },

  // Register user
  register: async (userData: any): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/api/auth/register/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Registration failed');
    }

    return data;
  },

  // Refresh token
  refreshToken: async (refreshToken: string): Promise<{ access: string }> => {
    const response = await fetch(`${API_BASE_URL}/api/auth/token/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Token refresh failed');
    }

    return data;
  },

  // Get current user profile
  getProfile: async (): Promise<any> => {
    const response = await authenticatedFetch('/api/auth/profile/');
    
    if (!response.ok) {
      throw new Error('Failed to fetch profile');
    }

    return response.json();
  },

  // Logout (invalidate tokens on backend if needed)
  logout: async (): Promise<void> => {
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (refreshToken) {
      try {
        await fetch(`${API_BASE_URL}/api/auth/logout/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refresh: refreshToken }),
        });
      } catch (error) {
        // Ignore logout errors, clear local storage anyway
        console.warn('Logout request failed:', error);
      }
    }

    // Clear local storage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('currentUser');
  },
};

// Generic API methods
export const api = {
  get: (url: string) => authenticatedFetch(url),
  post: (url: string, data: any) => authenticatedFetch(url, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  put: (url: string, data: any) => authenticatedFetch(url, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (url: string) => authenticatedFetch(url, {
    method: 'DELETE',
  }),
};

// Courses API methods
export const coursesApi = {
  // Get all courses with filtering
  getCourses: async (params?: {
    category?: string;
    level?: string;
    org_type?: string;
    search?: string;
    featured?: boolean;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const url = `/api/courses/${queryParams.toString() ? `?${queryParams}` : ''}`;
    const response = await fetch(`${API_BASE_URL}${url}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch courses');
    }
    
    return response.json();
  },

  // Get course details by slug
  getCourse: async (slug: string) => {
    const response = await fetch(`${API_BASE_URL}/api/courses/${slug}/`);
    
    if (!response.ok) {
      throw new Error('Course not found');
    }
    
    return response.json();
  },

  // Get course modules
  getCourseModules: async (slug: string) => {
    const response = await fetch(`${API_BASE_URL}/api/courses/${slug}/modules/`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch course modules');
    }
    
    return response.json();
  },

  // Get module lessons
  getModuleLessons: async (slug: string, moduleId: string) => {
    const response = await fetch(`${API_BASE_URL}/api/courses/${slug}/modules/${moduleId}/lessons/`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch module lessons');
    }
    
    return response.json();
  },

  // Get featured courses
  getFeaturedCourses: async () => {
    const response = await fetch(`${API_BASE_URL}/api/courses/featured/`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch featured courses');
    }
    
    return response.json();
  },

  // Get course statistics
  getCourseStats: async () => {
    const response = await fetch(`${API_BASE_URL}/api/courses/stats/`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch course stats');
    }
    
    return response.json();
  },

  // Enroll in course
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

  // Get user enrollments
  getMyEnrollments: async () => {
    const response = await authenticatedFetch('/api/courses/enrollments/my/');
    
    if (!response.ok) {
      throw new Error('Failed to fetch enrollments');
    }
    
    return response.json();
  },
};

// Payment API methods
export const paymentsApi = {
  // Create payment order
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

  // Verify payment
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

  // Get payment status
  getPaymentStatus: async (orderId: string) => {
    const response = await authenticatedFetch(`/api/payments/status/${orderId}/`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch payment status');
    }
    
    return response.json();
  },

  // Get payment history
  getPaymentHistory: async () => {
    const response = await authenticatedFetch('/api/payments/history/');
    
    if (!response.ok) {
      throw new Error('Failed to fetch payment history');
    }
    
    return response.json();
  },

  // Check enrollment status
  checkEnrollment: async (courseSlug: string) => {
    const response = await authenticatedFetch(`/api/courses/${courseSlug}/enrollment-status/`);
    
    if (!response.ok) {
      throw new Error('Failed to check enrollment status');
    }
    
    return response.json();
  },
};

// Student Dashboard API methods
export const studentDashboardApi = {
  // Get student's enrolled courses with progress
  getMyCourses: async () => {
    const response = await authenticatedFetch('/api/courses/my-courses/');
    
    if (!response.ok) {
      throw new Error('Failed to fetch enrolled courses');
    }
    
    return response.json();
  },

  // Get student progress analytics
  getProgressAnalytics: async () => {
    const response = await authenticatedFetch('/api/courses/analytics/student-progress/');
    
    if (!response.ok) {
      throw new Error('Failed to fetch progress analytics');
    }
    
    return response.json();
  },

  // Get course progress for a specific course
  getCourseProgress: async (courseSlug: string) => {
    const response = await authenticatedFetch(`/api/courses/${courseSlug}/progress/`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch course progress');
    }
    
    return response.json();
  },

  // Get study sessions
  getStudySessions: async () => {
    const response = await authenticatedFetch('/api/courses/study-sessions/');
    
    if (!response.ok) {
      throw new Error('Failed to fetch study sessions');
    }
    
    return response.json();
  },

  // Get notifications
  getNotifications: async () => {
    const response = await authenticatedFetch('/api/courses/notifications/');
    
    if (!response.ok) {
      throw new Error('Failed to fetch notifications');
    }
    
    return response.json();
  },

  // Mark notification as read
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

  // Complete a lesson
  completeLesson: async (lessonId: number) => {
    const response = await authenticatedFetch(`/api/courses/lessons/${lessonId}/complete/`, {
      method: 'POST',
    });
    
    if (!response.ok) {
      throw new Error('Failed to complete lesson');
    }
    
    return response.json();
  },

  // Start a study session
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

  // End a study session
  endStudySession: async (sessionId: number, progressMade: number) => {
    const response = await authenticatedFetch(`/api/courses/study-sessions/${sessionId}/`, {
      method: 'PATCH',
      body: JSON.stringify({ 
        ended_at: new Date().toISOString(),
        progress_made: progressMade 
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to end study session');
    }
    
    return response.json();
  },
};

export default api;
