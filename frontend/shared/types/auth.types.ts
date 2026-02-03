/**
 * Authentication related types
 */

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
  knowledge_partner_id?: string;
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
