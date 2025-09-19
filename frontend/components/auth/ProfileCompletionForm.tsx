'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AuthAPI, ProfileCompletionRequest } from '@/lib/api/auth';

interface ProfileCompletionFormProps {
  userRole: 'learner' | 'tutor' | 'admin';
  onComplete: () => void;
  onSkip: () => void;
}

interface ProfileData {
  bio?: string;
  profile_picture?: File | null;
  phone_number?: string;
  job_title?: string;
  department?: string;
  office_location?: string;
  office_phone?: string;
  emergency_contact?: string;
  linkedin_url?: string;
  professional_email?: string;
}

export default function ProfileCompletionForm({
  userRole,
  onComplete,
  onSkip
}: ProfileCompletionFormProps) {
  const [profileData, setProfileData] = useState<ProfileData>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'learner': return 'learner';
      case 'tutor': return 'Tutor';
      case 'admin': return 'Admin';
      default: return role;
    }
  };

  const getRequiredFields = (role: string) => {
    switch (role) {
      case 'admin': return ['job_title'];
      default: return [];
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, files } = e.target as HTMLInputElement;
    
    if (name === 'profile_picture' && files && files[0]) {
      setProfileData(prev => ({ ...prev, [name]: files[0] }));
    } else {
      setProfileData(prev => ({ ...prev, [name]: value }));
    }
  };

  const validateForm = (): boolean => {
    const requiredFields = getRequiredFields(userRole);
    
    for (const field of requiredFields) {
      if (!profileData[field as keyof ProfileData]) {
        setError(`${field.replace('_', ' ')} is required`);
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Get access token from localStorage
      const tokens = localStorage.getItem('auth_tokens');
      if (!tokens) {
        throw new Error('Authentication tokens not found');
      }

      const { access } = JSON.parse(tokens);
      
      const requestData: ProfileCompletionRequest = {
        profile_data: profileData,
        skip: false
      };

      await AuthAPI.completeProfile(requestData, access);
      onComplete();
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Profile completion failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const tokens = localStorage.getItem('auth_tokens');
      if (!tokens) {
        throw new Error('Authentication tokens not found');
      }

      const { access } = JSON.parse(tokens);
      
      const requestData: ProfileCompletionRequest = {
        profile_data: {},
        skip: true
      };

      await AuthAPI.completeProfile(requestData, access);
      onSkip();
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to skip profile completion');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Profile</h2>
        <p className="text-gray-600">
          Help us personalize your experience as a {getRoleDisplayName(userRole)}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {userRole === 'admin' && (
          <>
            <div>
              <label htmlFor="job_title" className="block text-sm font-medium text-gray-700 mb-2">
                Job Title *
              </label>
              <input
                type="text"
                id="job_title"
                name="job_title"
                value={profileData.job_title || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900 focus:bg-gray-50 transition-all duration-200"
                placeholder="e.g., CEO, Director, Manager"
                required
              />
            </div>

            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
                Department
              </label>
              <input
                type="text"
                id="department"
                name="department"
                value={profileData.department || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900 focus:bg-gray-50 transition-all duration-200"
                placeholder="e.g., Education, Technology, Operations"
              />
            </div>
          </>
        )}

        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            rows={4}
            value={profileData.bio || ''}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900 focus:bg-gray-50 transition-all duration-200 resize-none"
            placeholder="Tell us about yourself..."
          />
        </div>

        <div>
          <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            id="phone_number"
            name="phone_number"
            value={profileData.phone_number || ''}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900 focus:bg-gray-50 transition-all duration-200"
            placeholder="+1 (555) 123-4567"
          />
        </div>

        <div>
          <label htmlFor="linkedin_url" className="block text-sm font-medium text-gray-700 mb-2">
            LinkedIn Profile
          </label>
          <input
            type="url"
            id="linkedin_url"
            name="linkedin_url"
            value={profileData.linkedin_url || ''}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900 focus:bg-gray-50 transition-all duration-200"
            placeholder="https://linkedin.com/in/your-profile"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? 'Completing...' : 'Complete Profile'}
          </Button>
          
          <Button
            type="button"
            variant="outline"
            onClick={handleSkip}
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? 'Skipping...' : 'Skip for Now'}
          </Button>
        </div>

        <p className="text-xs text-gray-500 text-center">
          You can always complete your profile later in your account settings
        </p>
      </form>
    </div>
  );
}
