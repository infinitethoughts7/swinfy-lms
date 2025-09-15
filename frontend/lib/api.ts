// API service for backend communication

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegistrationData {
  email: string;
  full_name: string;
  password: string;
  confirm_password: string;
  role: 'learner' | 'knowledge_partner_instructor' | 'knowledge_partner_admin';
  organization_id?: string; // Backend field name
  organization_details?: { // Backend field name
    name: string;
    type: 'company' | 'organization' | 'university' | 'institute' | 'bootcamp';
    location: string;
    website?: string;
    description: string;
    address?: string;
    contact_email?: string;
    contact_phone?: string;
    linkedin_url?: string;
  };
}

export interface RegistrationResponse {
  message: string;
  user: {
    id: string;
    email: string;
    full_name: string;
    role: 'learner' | 'knowledge_partner_instructor' | 'knowledge_partner_admin';
    is_verified: boolean;
    is_approved: boolean;
  };
  tokens?: {
    access: string;
    refresh: string;
  };
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
    role: 'learner' | 'knowledge_partner_instructor' | 'knowledge_partner_admin';
    is_verified: boolean;
    knowledge_partner?: {
      id: string;
      name: string;
      type: string;
    };
  };
}

export interface ApiError {
  error: string;
  details?: Record<string, unknown>;
}

// Instructor Management Interfaces
export interface InstructorCreateData {
  email: string;
  full_name: string;
  password: string;
  confirm_password: string;
}

export interface InstructorUpdateData {
  bio?: string;
  title?: string;
  highest_education?: 'bachelor' | 'master' | 'phd' | 'self_taught';
  specializations?: string;
  technologies?: string;
  years_of_experience?: number;
  certifications?: string;
  languages_spoken?: string;
  linkedin_url?: string;
  is_available?: boolean;
  availability_notes?: string;
  user_email?: string;
  user_full_name?: string;
}

export interface InstructorListItem {
  id: string;
  full_name: string;
  email: string;
  title: string;
  specializations: string;
  technologies: string;
  years_of_experience: number;
  is_available: boolean;
  is_active: boolean;
  is_approved: boolean;
}

export interface InstructorDetail {
  id: string;
  user: {
    id: string;
    email: string;
    full_name: string;
    is_active: boolean;
    is_approved: boolean;
  };
  bio: string;
  title: string;
  highest_education: string;
  specializations: string;
  technologies: string;
  years_of_experience: number;
  certifications?: string;
  languages_spoken: string;
  linkedin_url?: string;
  is_available: boolean;
  availability_notes?: string;
  created_at: string;
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
  register: async (userData: RegistrationData): Promise<RegistrationResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/auth/register/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle validation errors
      if (data.details) {
        const errorMessages = Object.values(data.details).flat();
        throw new Error(errorMessages.join(', '));
      }
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
  getProfile: async (): Promise<Record<string, unknown>> => {
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
  post: (url: string, data: Record<string, unknown>) => authenticatedFetch(url, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  put: (url: string, data: Record<string, unknown>) => authenticatedFetch(url, {
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

  // Alias for getAllCourses
  getAllCourses: async (params?: {
    category?: string;
    level?: string;
    org_type?: string;
    search?: string;
    featured?: boolean;
  }) => {
    return coursesApi.getCourses(params);
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
    const response = await authenticatedFetch('/api/courses/user-sessions/');
    
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

  // Get weekly activity analytics
  getWeeklyActivity: async () => {
    const response = await authenticatedFetch('/api/courses/analytics/weekly-activity/');
    
    if (!response.ok) {
      throw new Error('Failed to fetch weekly activity data');
    }
    
    return response.json();
  },

  // Get student distribution analytics
  getStudentDistribution: async () => {
    const response = await authenticatedFetch('/api/courses/analytics/student-distribution/');
    
    if (!response.ok) {
      throw new Error('Failed to fetch student distribution data');
    }
    
    return response.json();
  },
};

// Admin Dashboard API methods
export const adminDashboardApi = {
  // Get dashboard stats
  getDashboardStats: async () => {
    const response = await authenticatedFetch('/api/auth/dashboard/');
    
    if (!response.ok) {
      throw new Error('Failed to fetch dashboard stats');
    }
    
    return response.json();
  },

  // Get pending payments for admin approval
  getPendingPayments: async () => {
    const response = await authenticatedFetch('/api/payments/admin/pending/');
    
    if (!response.ok) {
      throw new Error('Failed to fetch pending payments');
    }
    
    return response.json();
  },

  // Verify/approve payment
  verifyPayment: async (paymentId: number, action: 'approve' | 'reject', notes?: string) => {
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

  // Get payment analytics
  getPaymentAnalytics: async () => {
    const response = await authenticatedFetch('/api/payments/admin/analytics/');
    
    if (!response.ok) {
      throw new Error('Failed to fetch payment analytics');
    }
    
    return response.json();
  },

  // Get payment history for admin
  getPaymentHistory: async (status?: string) => {
    const url = `/api/payments/admin/history/${status ? `?status=${status}` : ''}`;
    const response = await authenticatedFetch(url);
    
    if (!response.ok) {
      throw new Error('Failed to fetch payment history');
    }
    
    return response.json();
  },

  // Get course performance analytics
  getCoursePerformanceAnalytics: async () => {
    const response = await authenticatedFetch('/api/courses/analytics/course-performance/');
    
    if (!response.ok) {
      throw new Error('Failed to fetch course performance analytics');
    }
    
    return response.json();
  },

  // Get training partner courses (admin can manage their own courses)
  getTrainingPartnerCourses: async () => {
    const response = await authenticatedFetch('/api/courses/my-courses/');
    
    if (!response.ok) {
      throw new Error('Failed to fetch training partner courses');
    }
    
    return response.json();
  },

  // Create new course
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

  // Update course
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

  // Delete course
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

// User management API methods
export const userApi = {
  // Get user profile
  getProfile: async () => {
    const response = await authenticatedFetch('/api/auth/profile/');
    
    if (!response.ok) {
      throw new Error('Failed to fetch user profile');
    }
    
    return response.json();
  },

  // Update user profile
  updateProfile: async (profileData: Record<string, unknown>) => {
    const response = await authenticatedFetch('/api/auth/profile/', {
      method: 'PATCH',
      body: JSON.stringify(profileData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update profile');
    }
    
    return response.json();
  },

  // Get dashboard stats based on user role
  getDashboardStats: async () => {
    const response = await authenticatedFetch('/api/auth/dashboard/');
    
    if (!response.ok) {
      throw new Error('Failed to fetch dashboard stats');
    }
    
    return response.json();
  },

  // KP Instructor Management
  instructors: {
    // List all instructors for KP admin
    list: async (params?: { search?: string; available?: boolean }) => {
      const token = getAuthToken();
      const searchParams = new URLSearchParams();
      if (params?.search) searchParams.append('search', params.search);
      if (params?.available !== undefined) searchParams.append('available', params.available.toString());
      
      const response = await fetch(`${API_BASE_URL}/api/auth/kp/instructors/?${searchParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch instructors');
      }
      
      return response.json();
    },

    // Create new instructor
    create: async (instructorData: InstructorCreateData) => {
      const token = getAuthToken();
      
      const response = await fetch(`${API_BASE_URL}/api/auth/kp/instructors/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(instructorData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create instructor');
      }
      
      return response.json();
    },

    // Get instructor details
    get: async (instructorId: string) => {
      const token = getAuthToken();
      
      const response = await fetch(`${API_BASE_URL}/api/auth/kp/instructors/${instructorId}/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch instructor details');
      }
      
      return response.json();
    },

    // Update instructor
    update: async (instructorId: string, updateData: Partial<InstructorUpdateData>) => {
      const token = getAuthToken();
      
      const response = await fetch(`${API_BASE_URL}/api/auth/kp/instructors/${instructorId}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update instructor');
      }
      
      return response.json();
    },

    // Delete instructor
    delete: async (instructorId: string) => {
      const token = getAuthToken();
      
      const response = await fetch(`${API_BASE_URL}/api/auth/kp/instructors/${instructorId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete instructor');
      }
      
      return response.status === 204;
    },
  },
};

export default api;
