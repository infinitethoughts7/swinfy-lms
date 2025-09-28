// API service for backend communication
import { getErrorMessage, parseErrorResponse, enhancedFetch } from './error-utils';
import { productionDebug } from './production-debug';

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
  role: 'learner';
  knowledge_partner_id?: string; // For learner KP association
}

export interface RegistrationResponse {
  message: string;
  user: {
    id: string;
    email: string;
    full_name: string;
    role: 'learner';
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
    role: 'learner';
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
  profile_picture?: string;
  phone_number?: string;
  title: string;
  highest_education: string;
  specializations: string;
  technologies: string;
  years_of_experience: number;
  certifications?: string;
  languages_spoken: string;
  linkedin_url?: string;
  is_available: boolean;
  created_at: string;
}

// Get auth token from localStorage
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token');
};

// Get refresh token from localStorage
const getRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('refresh_token');
};

// Refresh access token using refresh token
const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/token/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });
    
    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('access_token', data.access);
      return data.access;
    }
  } catch (error) {
    console.error('Token refresh failed:', error);
  }
  
  return null;
};

// Enhanced authenticated fetch with automatic token refresh
const authenticatedFetchWithRefresh = async (url: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  
  // Debug logs for production
  console.log('=== AUTHENTICATED FETCH DEBUG ===');
  console.log('Request URL:', `${API_BASE_URL}${url}`);
  console.log('Token available:', !!token);
  console.log('Request method:', options.method || 'GET');
  console.log('Request body:', options.body);
  
  const makeRequest = async (authToken: string | null) => {
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(authToken && { Authorization: `Bearer ${authToken}` }),
        ...options.headers,
      },
    };
    
    // Debug the request configuration
    productionDebug.debugApiRequest(`${API_BASE_URL}${url}`, config, authToken);
    
    return fetch(`${API_BASE_URL}${url}`, config);
  };
  
  // First attempt with current token
  console.log('Making first request with token:', token ? `${token.substring(0, 20)}...` : 'No token');
  let response = await makeRequest(token);
  
  // Debug the response
  productionDebug.debugApiResponse(`${API_BASE_URL}${url}`, response.clone());
  console.log('First response status:', response.status);
  
  // If unauthorized and we have a refresh token, try to refresh
  if (response.status === 401 && getRefreshToken()) {
    console.log('Got 401, attempting token refresh...');
    const newToken = await refreshAccessToken();
    if (newToken) {
      console.log('Token refreshed successfully, retrying request...');
      // Retry with new token
      response = await makeRequest(newToken);
      console.log('Retry response status:', response.status);
      productionDebug.debugApiResponse(`${API_BASE_URL}${url}`, response.clone());
    } else {
      console.log('Token refresh failed');
    }
  }
  
  console.log('=== AUTHENTICATED FETCH COMPLETED ===');
  return response;
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
    try {
      const response = await enhancedFetch(`${API_BASE_URL}/api/auth/login/`, {
        method: 'POST',
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorMessage = await parseErrorResponse(response);
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // Register user
  register: async (userData: RegistrationData): Promise<RegistrationResponse> => {
    try {
      const response = await enhancedFetch(`${API_BASE_URL}/api/auth/register/`, {
        method: 'POST',
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorMessage = await parseErrorResponse(response);
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // Forgot password - send OTP
  forgotPassword: async (data: { email: string }): Promise<{ message: string }> => {
    try {
      const response = await enhancedFetch(`${API_BASE_URL}/api/auth/forgot-password/`, {
        method: 'POST',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorMessage = await parseErrorResponse(response);
        throw new Error(errorMessage);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // Verify reset OTP
  verifyResetOTP: async (data: { email: string; otp_code: string }): Promise<{ message: string }> => {
    try {
      const response = await enhancedFetch(`${API_BASE_URL}/api/auth/verify-reset-otp/`, {
        method: 'POST',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorMessage = await parseErrorResponse(response);
        throw new Error(errorMessage);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // Reset password
  resetPassword: async (data: { email: string; otp_code: string; new_password: string }): Promise<{ message: string }> => {
    try {
      const response = await enhancedFetch(`${API_BASE_URL}/api/auth/reset-password/`, {
        method: 'POST',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorMessage = await parseErrorResponse(response);
        throw new Error(errorMessage);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
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
    if (typeof window === 'undefined') return;
    
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

  // Admin: list paid payments awaiting verification
  getPaidPayments: async () => {
    const response = await authenticatedFetch('/api/payments/admin/pending/');
    if (!response.ok) {
      throw new Error('Failed to fetch paid payments');
    }
    return response.json();
  },

  // Admin: verify or reject a payment
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
      throw new Error(error.error || error.detail || 'Failed to verify payment');
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

// Learner Dashboard API methods
export const learnerDashboardApi = {
  // Get learner's enrolled courses with progress
  getMyCourses: async () => {
    const response = await authenticatedFetch('/api/courses/my-courses/');
    
    if (!response.ok) {
      throw new Error('Failed to fetch enrolled courses');
    }
    
    return response.json();
  },

  // Get learner progress analytics
  getProgressAnalytics: async () => {
    const response = await authenticatedFetch('/api/courses/analytics/learner-progress/');
    
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

  // Get detailed course information for enrolled learners
  getCourseDetail: async (courseSlug: string) => {
    const response = await authenticatedFetch(`/api/courses/${courseSlug}/`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch course details');
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

  // Get learner distribution analytics
  getLearnerDistribution: async () => {
    const response = await authenticatedFetch('/api/courses/analytics/learner-distribution/');
    
    if (!response.ok) {
      throw new Error('Failed to fetch learner distribution data');
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

  // Get payments by status for admin (default paid)
  getPaymentsByStatus: async (status: 'paid' | 'verified' | 'rejected' | 'pending' = 'paid') => {
    // For KP admins, use the pending payments endpoint for paid status
    const endpoint = status === 'paid' ? '/api/payments/admin/pending/' : `/api/payments/admin/history/?status=${status}`;
    const response = await authenticatedFetch(endpoint);
    if (!response.ok) {
      throw new Error('Failed to fetch payments');
    }
    return response.json();
  },

  // Verify/approve payment
  verifyPayment: async (paymentId: number | string, action: 'approve' | 'reject', notes?: string) => {
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
    const response = await authenticatedFetch('/api/auth/profile/detail/');
    
    if (!response.ok) {
      throw new Error('Failed to fetch user profile');
    }
    
    return response.json();
  },

  // Update user profile
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

  // Update user profile with file upload
  updateProfileWithFile: async (formData: FormData) => {
    const token = getAuthToken();
    
    const response = await fetch(`${API_BASE_URL}/api/auth/profile/detail/`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
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
      const searchParams = new URLSearchParams();
      if (params?.search) searchParams.append('search', params.search);
      if (params?.available !== undefined) searchParams.append('available', params.available.toString());
      
      const response = await authenticatedFetchWithRefresh(`/api/auth/kp/instructors/?${searchParams}`, {
        method: 'GET',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch instructors');
      }
      
      return response.json();
    },

    // Create new instructor
    create: async (instructorData: InstructorCreateData) => {
      console.log('=== FRONTEND DEBUG: Instructor Creation Request ===');
      console.log('Form data:', instructorData);
      
      // Add confirm_password if not present
      const requestPayload = {
        ...instructorData,
        confirm_password: instructorData.confirm_password || instructorData.password,
      };
      
      console.log('Request payload:', requestPayload);
      console.log('Request URL:', `${API_BASE_URL}/api/auth/kp/instructors/`);
      console.log('Expected backend fields: email, full_name, password, confirm_password');
      
      // Debug tokens before request
      productionDebug.debugTokens();
      
      console.log('===============================================');
      
      const response = await authenticatedFetchWithRefresh(`/api/auth/kp/instructors/`, {
        method: 'POST',
        body: JSON.stringify(requestPayload),
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorData = await response.json();
        console.log('Error data:', errorData);
        throw new Error(errorData.detail || errorData.message || 'Failed to create instructor');
      }
      
      const responseData = await response.json();
      console.log('Success response:', responseData);
      return responseData;
    },

    // Get instructor details
    get: async (instructorId: string) => {
      const response = await authenticatedFetchWithRefresh(`/api/auth/kp/instructors/${instructorId}/`, {
        method: 'GET',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch instructor details');
      }
      
      return response.json();
    },

    // Update instructor
    update: async (instructorId: string, updateData: Partial<InstructorUpdateData>) => {
      const response = await authenticatedFetchWithRefresh(`/api/auth/kp/instructors/${instructorId}/`, {
        method: 'PATCH',
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
      const response = await authenticatedFetchWithRefresh(`/api/auth/kp/instructors/${instructorId}/`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete instructor');
      }
      
      return response.status === 204;
    },
  },
};

// Course management interfaces
export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  short_description: string;
  price: number;
  duration_weeks: number;
  category: string;
  category_display: string;
  level: string;
  level_display: string;
  tags?: string;
  tags_list?: string[];
  learning_outcomes?: string;
  prerequisites?: string;
  thumbnail?: string;
  thumbnail_url?: string;
  banner_image?: string;
  banner_image_url?: string;
  demo_video?: string;
  demo_video_url?: string;
  approval_status: string;
  approval_status_display: string;
  is_published: boolean;
  is_active: boolean;
  is_private: boolean;
  requires_admin_enrollment: boolean;
  max_enrollments?: number;
  modules_count: number;
  lessons_count: number;
  total_duration_minutes: number;
  enrollment_count: number;
  approval_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CourseCreateData {
  title: string;
  description: string;
  short_description: string;
  price?: number;
  duration_weeks: number;
  category: string;
  level: string;
  learning_outcomes?: string;
  prerequisites?: string;
  thumbnail?: File;
  banner_image?: File;
  demo_video?: File;
  is_private: boolean;
  requires_admin_enrollment: boolean;
  max_enrollments?: number;
}

export interface Module {
  id: string;
  title: string;
  slug: string;
  order: number;
  lessons_count: number;
  total_duration_minutes: number;
  created_at: string;
  updated_at: string;
}

export interface ModuleCreateData {
  title: string;
  order: number;
}

export interface Lesson {
  id: string;
  title: string;
  slug: string;
  lesson_type: string;
  lesson_type_display: string;
  order: number;
  content?: string;
  video_file?: string;
  video_url?: string;
  duration_minutes: number;
  duration_formatted: string;
  has_video_content: boolean;
  is_preview: boolean;
  is_mandatory: boolean;
  total_materials_count: number;
  module_title: string;
  course_title: string;
  created_at: string;
  updated_at: string;
}

export interface LessonCreateData {
  title: string;
  lesson_type: string;
  order: number;
  content?: string;
  video_file?: File;
  duration_minutes?: number;
  is_preview: boolean;
  is_mandatory: boolean;
}

export interface InstructorStats {
  total_courses: number;
  published_courses: number;
  draft_courses: number;
  pending_approval_courses: number;
  total_enrollments: number;
  total_modules: number;
  total_lessons: number;
  total_duration_hours: number;
  avg_course_rating: number;
  recent_courses: Course[];
}

// Instructor course management API
export const instructorApi = {
  // Dashboard
  getDashboardStats: async (): Promise<InstructorStats> => {
    const response = await authenticatedFetchWithRefresh('/api/courses/instructor/dashboard/stats/', {
      method: 'GET',
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch dashboard stats');
    }
    
    return response.json();
  },

  // Courses
  courses: {
    list: async (): Promise<Course[]> => {
      const response = await authenticatedFetchWithRefresh('/api/courses/instructor/courses/', {
        method: 'GET',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch courses');
      }
      
      const data = await response.json();
      return data.results || data; // Handle paginated response
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

      const response = await fetch(`${API_BASE_URL}/api/courses/instructor/courses/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to create course');
      }
      
      return response.json();
    },

    get: async (courseSlug: string): Promise<Course> => {
      const response = await authenticatedFetchWithRefresh(`/api/courses/instructor/courses/${courseSlug}/`, {
        method: 'GET',
      });
      
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

      const response = await fetch(`${API_BASE_URL}/api/courses/instructor/courses/${courseSlug}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to update course');
      }
      
      return response.json();
    },

    delete: async (courseSlug: string): Promise<void> => {
      const token = getAuthToken();
      
      const response = await fetch(`${API_BASE_URL}/api/courses/instructor/courses/${courseSlug}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete course');
      }
    },
  },

  // Modules
  modules: {
    list: async (courseSlug: string): Promise<Module[]> => {
      const token = getAuthToken();
      
      const response = await fetch(`${API_BASE_URL}/api/courses/instructor/courses/${courseSlug}/modules/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch modules');
      }
      
      const data = await response.json();
      return data.results || data; // Handle paginated response
    },

    create: async (courseSlug: string, moduleData: ModuleCreateData): Promise<Module> => {
      const token = getAuthToken();
      
      const response = await fetch(`${API_BASE_URL}/api/courses/instructor/courses/${courseSlug}/modules/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(moduleData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create module');
      }
      
      return response.json();
    },

    update: async (moduleId: string, moduleData: Partial<ModuleCreateData>): Promise<Module> => {
      const token = getAuthToken();
      
      const response = await fetch(`${API_BASE_URL}/api/courses/instructor/modules/${moduleId}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
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
      
      const response = await fetch(`${API_BASE_URL}/api/courses/instructor/modules/${moduleId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete module');
      }
    },
  },

  // Lessons
  lessons: {
    list: async (courseSlug: string, moduleId: string): Promise<Lesson[]> => {
      const token = getAuthToken();
      
      const response = await fetch(`${API_BASE_URL}/api/courses/instructor/courses/${courseSlug}/modules/${moduleId}/lessons/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch lessons');
      }
      
      const data = await response.json();
      return data.results || data; // Handle paginated response
    },

    create: async (courseSlug: string, moduleId: string, lessonData: LessonCreateData): Promise<Lesson> => {
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

      const response = await fetch(`${API_BASE_URL}/api/courses/instructor/courses/${courseSlug}/modules/${moduleId}/lessons/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      
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

      const response = await fetch(`${API_BASE_URL}/api/courses/instructor/lessons/${lessonId}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to update lesson');
      }
      
      return response.json();
    },

    delete: async (lessonId: string): Promise<void> => {
      const token = getAuthToken();
      
      const response = await fetch(`${API_BASE_URL}/api/courses/instructor/lessons/${lessonId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete lesson');
      }
    },
  },

  // Resources
  resources: {
    list: async (courseSlug: string) => {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/api/courses/instructor/courses/${courseSlug}/resources/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch resources');
      }
      const data = await response.json();
      return data.results || data;
    },

    create: async (courseSlug: string, payload: { title: string; description?: string; resource_type: string; url?: string; is_public?: boolean; order?: number; file?: File | null; }) => {
      const token = getAuthToken();

      // Map UI resource types to backend choices
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

      const response = await fetch(`${API_BASE_URL}/api/courses/instructor/courses/${courseSlug}/resources/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({} as Record<string, unknown>));
        // surface DRF field errors if available
        const detail = err.error || err.detail || JSON.stringify(err);
        throw new Error(detail || 'Failed to create resource');
      }
      return response.json();
    },

    update: async (resourceId: string, payload: Partial<{ title: string; description: string; resource_type: string; url: string; is_public: boolean; order: number; file: File | null; }>) => {
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
      const response = await fetch(`${API_BASE_URL}/api/courses/instructor/resources/${resourceId}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({} as Record<string, unknown>));
        const detail = err.error || err.detail || JSON.stringify(err);
        throw new Error(detail || 'Failed to update resource');
      }
      return response.json();
    },

    delete: async (resourceId: string) => {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/api/courses/instructor/resources/${resourceId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to delete resource');
      }
      return true;
    },
  },
};

export default api;
