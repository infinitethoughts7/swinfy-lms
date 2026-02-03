/**
 * User and Instructor related types
 */

export interface InstructorCreateData {
  email: string;
  full_name: string;
  password: string;
  confirm_password: string;
}

export interface InstructorUpdateData {
  user_email?: string;
  user_full_name?: string;
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
