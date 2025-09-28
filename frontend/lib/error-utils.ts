/**
 * Error handling utilities for user-friendly error messages
 */

export interface ApiErrorResponse {
  error?: string;
  details?: Record<string, string[]>;
  message?: string;
  non_field_errors?: string[];
  // Django REST Framework validation errors
  [key: string]: string[] | string | undefined;
}

/**
 * Convert API errors to user-friendly messages
 */
export const getErrorMessage = (error: unknown): string => {
  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }

  // Handle Error objects
  if (error instanceof Error) {
    return error.message;
  }

  // Handle API error responses
  if (error && typeof error === 'object') {
    const apiError = error as ApiErrorResponse;

    // Check for specific error message
    if (apiError.error) {
      return formatApiError(apiError.error);
    }

    // Check for message field
    if (apiError.message) {
      return formatApiError(apiError.message);
    }

    // Handle Django REST Framework validation errors (field: [errors])
    const fieldErrors = Object.entries(apiError)
      .filter(([key, value]) => 
        key !== 'error' && 
        key !== 'message' && 
        key !== 'details' && 
        key !== 'non_field_errors' &&
        Array.isArray(value) && 
        value.length > 0
      );

    if (fieldErrors.length > 0) {
      const messages = fieldErrors
        .map(([field, errors]) => {
          const fieldName = formatFieldName(field);
          const errorMessages = errors.map(err => formatApiError(err)).join(', ');
          return `${fieldName}: ${errorMessages}`;
        })
        .join('; ');
      return messages || 'Please check your input and try again.';
    }

    // Handle validation errors in details field
    if (apiError.details) {
      const messages = Object.entries(apiError.details)
        .map(([field, errors]) => {
          const fieldName = formatFieldName(field);
          return `${fieldName}: ${errors.join(', ')}`;
        })
        .join('; ');
      return messages || 'Please check your input and try again.';
    }

    // Handle non-field errors
    if (apiError.non_field_errors) {
      return apiError.non_field_errors.join(', ');
    }
  }

  return 'Something went wrong. Please try again.';
};

/**
 * Format field names for better user experience
 */
const formatFieldName = (field: string): string => {
  const fieldMap: Record<string, string> = {
    'email': 'Email',
    'password': 'Password',
    'confirm_password': 'Password confirmation',
    'full_name': 'Full name',
    'first_name': 'First name',
    'last_name': 'Last name',
    'phone_number': 'Phone number',
    'organization_name': 'Organization name',
    'knowledge_partner_id': 'Organization',
    'non_field_errors': '',
  };

  return fieldMap[field] || field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

/**
 * Format API error messages for better user experience
 */
const formatApiError = (message: string): string => {
  const errorMap: Record<string, string> = {
    // Authentication errors
    'Invalid credentials': 'Invalid email or password. Please check your credentials and try again.',
    'Invalid email or password.': '❌ Invalid email or password. Please double-check your credentials and try again.',
    'Email and password are required.': '⚠️ Please enter both email and password to continue.',
    'User not found': '🔍 No account found with this email address.',
    'Account not verified': '📧 Please verify your email address before logging in.',
    'Account not approved': '⏳ Your account is pending approval. Please contact support.',
    'Token expired': '⏰ Your session has expired. Please log in again.',
    'Invalid token': '🔒 Invalid session. Please log in again.',
    
    // Registration errors
    'User already exists': '👤 An account with this email already exists. Please try logging in instead.',
    'User with this Email Address already exists': '👤 An account with this email already exists. Please try logging in instead.',
    'Email already registered': '📧 This email is already registered. Please try logging in or use a different email.',
    'Weak password': '🔐 Password is too weak. Please use a stronger password with letters, numbers, and symbols.',
    'Passwords do not match': '🔄 Passwords do not match. Please make sure both passwords are the same.',
    
    // Validation errors
    'This field is required': '⚠️ This field is required.',
    'Invalid email format': '📧 Please enter a valid email address.',
    'Invalid phone number': '📞 Please enter a valid phone number.',
    
    // Network errors
    'Network error': '🌐 Connection problem. Please check your internet connection and try again.',
    'Server error': '🔧 Server is temporarily unavailable. Please try again later.',
    'Timeout': '⏱️ Request timed out. Please try again.',
    
    // Permission errors
    'Permission denied': '🚫 You do not have permission to perform this action.',
    'Access denied': '🔒 Access denied. Please contact support if you believe this is an error.',
    'Unauthorized': '🔑 Please log in to continue.',
    
    // File upload errors
    'File too large': '📁 File is too large. Please choose a smaller file.',
    'Invalid file type': '📄 Invalid file type. Please choose a different file.',
    'Upload failed': '⬆️ File upload failed. Please try again.',
    
    // Course/Content errors
    'Course not found': 'Course not found. It may have been removed or you may not have access.',
    'Already enrolled': 'You are already enrolled in this course.',
    'Enrollment closed': 'Enrollment for this course is currently closed.',
    'Payment required': 'Payment is required to access this course.',
    
    // Organization errors
    'Organization not found': 'Organization not found. Please contact support.',
    'Application pending': 'Your application is still pending review.',
    'Application rejected': 'Your application was not approved. Please contact support for more information.',
  };

  // Check for exact matches first
  if (errorMap[message]) {
    return errorMap[message];
  }

  // Check for partial matches
  for (const [key, value] of Object.entries(errorMap)) {
    if (message.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }

  // Return the original message if no mapping found, but clean it up
  return message.charAt(0).toUpperCase() + message.slice(1);
};

/**
 * Handle network errors specifically
 */
export const handleNetworkError = (error: unknown): string => {
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return 'Connection problem. Please check your internet connection and try again.';
  }
  
  if (error instanceof Error && error.name === 'AbortError') {
    return 'Request was cancelled. Please try again.';
  }

  return getErrorMessage(error);
};

/**
 * Safe JSON parse for error responses
 */
export const safeJsonParse = (text: string): unknown => {
  try {
    return JSON.parse(text);
  } catch {
    return { error: text };
  }
};

/**
 * HTTP status code to user message mapping
 */
export const getHttpErrorMessage = (status: number, defaultMessage?: string): string => {
  const statusMap: Record<number, string> = {
    400: 'Invalid request. Please check your input and try again.',
    401: 'Please log in to continue.',
    403: 'You do not have permission to perform this action.',
    404: 'The requested resource was not found.',
    408: 'Request timed out. Please try again.',
    429: 'Too many requests. Please wait a moment and try again.',
    500: 'Server error. Please try again later.',
    502: 'Service temporarily unavailable. Please try again later.',
    503: 'Service temporarily unavailable. Please try again later.',
    504: 'Request timed out. Please try again later.',
  };

  return statusMap[status] || defaultMessage || 'Something went wrong. Please try again.';
};

/**
 * Enhanced fetch with better error handling
 */
export const enhancedFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    return response;
  } catch (error) {
    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Connection problem. Please check your internet connection and try again.');
    }

    // Handle other errors
    throw new Error(handleNetworkError(error));
  }
};

/**
 * Parse error response and return user-friendly message
 */
export const parseErrorResponse = async (response: Response): Promise<string> => {
  try {
    const data = await response.json();
    return getErrorMessage(data);
  } catch {
    // If JSON parsing fails, use HTTP status
    return getHttpErrorMessage(response.status);
  }
};
