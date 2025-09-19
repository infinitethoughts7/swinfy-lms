const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export interface RegisterRequest {
  full_name: string;
  email: string;
  password: string;
  confirm_password: string;
  role: 'learner' | 'tutor' | 'admin';
  organization_id?: string;
  organization_details?: {
    name: string;
    type: 'company' | 'organization' | 'university' | 'institute' | 'bootcamp';
    location: string;
    website: string;
    description: string;
    address: string;
    contact_email: string;
    contact_phone: string;
    logo?: File | null;
    linkedin_url?: string;
  };
}

export interface RegisterResponse {
  message: string;
  user: {
    id: number;
    email: string;
    full_name: string;
    role: string;
    is_verified: boolean;
    is_approved: boolean;
    organization?: {
      id: number;
      name: string;
      type: string;
    };
  };
  tokens?: {
    access: string;
    refresh: string;
  };
}

export interface VerifyEmailRequest {
  email: string;
  verification_code: string;
}

export interface VerifyEmailResponse {
  message: string;
  user: {
    id: number;
    email: string;
    full_name: string;
    role: string;
    is_verified: boolean;
    is_approved: boolean;
  };
  tokens: {
    access: string;
    refresh: string;
  };
}

export interface ProfileCompletionRequest {
  profile_data: Record<string, any>;
  skip?: boolean;
}

export interface ProfileCompletionResponse {
  success: boolean;
  profile_created: boolean;
  message: string;
  redirect_to_dashboard: boolean;
}

export class AuthAPI {
  private static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.details || 'An error occurred');
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  static async register(data: RegisterRequest): Promise<RegisterResponse> {
    // Convert FormData to JSON for registration
    const payload = {
      full_name: data.full_name,
      email: data.email,
      password: data.password,
      confirm_password: data.confirm_password,
      role: data.role,
      organization_id: data.organization_id || null,
      organization_details: data.organization_details || null,
    };

    return this.request<RegisterResponse>('/auth/register/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  static async verifyEmail(data: VerifyEmailRequest): Promise<VerifyEmailResponse> {
    return this.request<VerifyEmailResponse>('/auth/verify-email/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async completeProfile(
    data: ProfileCompletionRequest,
    token: string
  ): Promise<ProfileCompletionResponse> {
    return this.request<ProfileCompletionResponse>('/auth/profile/complete/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
  }

  static async getTrainingPartners() {
    return this.request('/auth/training-partners/', {
      method: 'GET',
    });
  }
}
