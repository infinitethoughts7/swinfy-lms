'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import Logo from '@/components/shared/Logo';
import { getAccessToken } from '@/lib/auth-utils';

interface ProfileCompletionScreenProps {
  userRole: 'student' | 'tutor' | 'admin';
  userEmail: string;
  onComplete: () => void;
  onSkip: () => void;
}

interface FormData {
  // Student fields
  bio?: string;
  education_level?: string;
  field_of_study?: string;
  current_institution?: string;
  learning_goals?: string;
  
  // Tutor fields
  title?: string;
  years_of_experience?: number;
  highest_education?: string;
  specializations?: string;
  technologies?: string;
  certifications?: string;
  hourly_rate?: number;
  
  // Admin fields
  job_title?: string;
  department?: string;
  
  // Common fields
  phone_number?: string;
  date_of_birth?: string;
}

export default function ProfileCompletionScreen({ 
  userRole, 
  userEmail, 
  onComplete, 
  onSkip 
}: ProfileCompletionScreenProps) {
  const [formData, setFormData] = useState<FormData>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (userRole === 'tutor') {
      // Required fields for tutors
      if (!formData.bio?.trim()) {
        newErrors.bio = 'Professional bio is required for tutors';
      }
      if (!formData.title?.trim()) {
        newErrors.title = 'Job title is required for tutors';
      }
      if (!formData.highest_education) {
        newErrors.highest_education = 'Education level is required for tutors';
      }
      if (!formData.specializations?.trim()) {
        newErrors.specializations = 'Specializations are required for tutors';
      }
      if (!formData.technologies?.trim()) {
        newErrors.technologies = 'Technologies are required for tutors';
      }
    } else if (userRole === 'admin') {
      // Required fields for admins
      if (!formData.job_title?.trim()) {
        newErrors.job_title = 'Job title is required for admins';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // Get token from localStorage (set during login/registration)
      let token = getAccessToken();
      
      // For demo purposes, if no token exists, create a mock one
      // TODO: Remove this when actual login/registration stores real tokens
      if (!token) {
        // Try to login with the user's email and a default password to get token
        console.log('No token found, attempting to get authentication token...');
        
        try {
          const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
          const loginResponse = await fetch(`${API_BASE_URL}/api/auth/login/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: userEmail,
              password: 'rockyg07' // Using the unified password
            })
          });

          if (loginResponse.ok) {
            const loginData = await loginResponse.json();
            token = loginData.tokens.access;
            // Store tokens for future use
            localStorage.setItem('access_token', loginData.tokens.access);
            localStorage.setItem('refresh_token', loginData.tokens.refresh);
          } else {
            throw new Error('Unable to authenticate user');
          }
        } catch (authError) {
          throw new Error('Authentication required. Please login again.');
        }
      }

      // Prepare the request body based on user role
      const requestBody = {
        [`${userRole}_profile`]: formData
      };

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${API_BASE_URL}/api/auth/profile/complete/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save profile');
      }

      const result = await response.json();
      
      if (result.success) {
        console.log('Profile saved successfully:', result.message);
        onComplete();
      } else {
        throw new Error('Profile save failed');
      }
      
    } catch (error) {
      console.error('Error submitting profile:', error);
      // Show user-friendly error message
      setErrors({ 
        general: error instanceof Error ? error.message : 'Failed to save profile. Please try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = async () => {
    try {
      // Get token from localStorage
      const token = getAccessToken();
      
      if (token) {
        // Send skip request to backend
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        await fetch(`${API_BASE_URL}/api/auth/profile/complete/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            skip_profile: true
          })
        });
      }
      
      onSkip();
    } catch (error) {
      console.error('Error skipping profile:', error);
      // Even if skip fails, still proceed
      onSkip();
    }
  };

  const renderStudentFields = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tell us about yourself
        </label>
        <textarea
          value={formData.bio || ''}
          onChange={(e) => handleInputChange('bio', e.target.value)}
          placeholder="Share a bit about your background and interests..."
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900 focus:bg-gray-50 transition-all duration-200"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Education Level
        </label>
        <select
          value={formData.education_level || ''}
          onChange={(e) => handleInputChange('education_level', e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900 focus:bg-gray-50 transition-all duration-200"
        >
          <option value="">Select your education level</option>
          <option value="high_school">High School</option>
          <option value="bachelor">Bachelor&apos;s Degree</option>
          <option value="master">Master&apos;s Degree</option>
          <option value="phd">PhD</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Field of Study
        </label>
        <input
          type="text"
          value={formData.field_of_study || ''}
          onChange={(e) => handleInputChange('field_of_study', e.target.value)}
          placeholder="e.g., Computer Science, Business, etc."
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900 focus:bg-gray-50 transition-all duration-200"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Current Institution
        </label>
        <input
          type="text"
          value={formData.current_institution || ''}
          onChange={(e) => handleInputChange('current_institution', e.target.value)}
          placeholder="Name of your school/university"
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900 focus:bg-gray-50 transition-all duration-200"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Learning Goals
        </label>
        <textarea
          value={formData.learning_goals || ''}
          onChange={(e) => handleInputChange('learning_goals', e.target.value)}
          placeholder="What do you hope to achieve through your learning journey?"
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900 focus:bg-gray-50 transition-all duration-200"
          rows={3}
        />
      </div>
    </div>
  );

  const renderTutorFields = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Professional Bio <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.bio || ''}
          onChange={(e) => handleInputChange('bio', e.target.value)}
          placeholder="Tell students about your professional background and teaching approach..."
          className={`w-full p-3 border rounded-lg focus:outline-none focus:border-gray-900 focus:bg-gray-50 transition-all duration-200 ${
            errors.bio ? 'border-red-500' : 'border-gray-300'
          }`}
          rows={4}
        />
        {errors.bio && <p className="text-red-500 text-sm mt-1">{errors.bio}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Job Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.title || ''}
          onChange={(e) => handleInputChange('title', e.target.value)}
          placeholder="e.g., Senior Software Engineer, Data Scientist"
          className={`w-full p-3 border rounded-lg focus:outline-none focus:border-gray-900 focus:bg-gray-50 transition-all duration-200 ${
            errors.title ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Highest Education <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.highest_education || ''}
          onChange={(e) => handleInputChange('highest_education', e.target.value)}
          className={`w-full p-3 border rounded-lg focus:outline-none focus:border-gray-900 focus:bg-gray-50 transition-all duration-200 ${
            errors.highest_education ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="">Select your highest education</option>
          <option value="bachelor">Bachelor&apos;s Degree</option>
          <option value="master">Master&apos;s Degree</option>
          <option value="phd">PhD</option>
          <option value="professional">Professional Certification</option>
          <option value="self_taught">Self-Taught</option>
        </select>
        {errors.highest_education && <p className="text-red-500 text-sm mt-1">{errors.highest_education}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Specializations <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.specializations || ''}
          onChange={(e) => handleInputChange('specializations', e.target.value)}
          placeholder="e.g., Web Development, Machine Learning, Data Science"
          className={`w-full p-3 border rounded-lg focus:outline-none focus:border-gray-900 focus:bg-gray-50 transition-all duration-200 ${
            errors.specializations ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.specializations && <p className="text-red-500 text-sm mt-1">{errors.specializations}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Technologies <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.technologies || ''}
          onChange={(e) => handleInputChange('technologies', e.target.value)}
          placeholder="e.g., React, Python, Django, PostgreSQL"
          className={`w-full p-3 border rounded-lg focus:outline-none focus:border-gray-900 focus:bg-gray-50 transition-all duration-200 ${
            errors.technologies ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.technologies && <p className="text-red-500 text-sm mt-1">{errors.technologies}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Years of Experience
        </label>
        <input
          type="number"
          value={formData.years_of_experience || ''}
          onChange={(e) => handleInputChange('years_of_experience', parseInt(e.target.value) || 0)}
          placeholder="Number of years"
          min="0"
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900 focus:bg-gray-50 transition-all duration-200"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Hourly Rate (₹)
        </label>
        <input
          type="number"
          value={formData.hourly_rate || ''}
          onChange={(e) => handleInputChange('hourly_rate', parseInt(e.target.value) || 0)}
          placeholder="Your hourly teaching rate"
          min="0"
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900 focus:bg-gray-50 transition-all duration-200"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Certifications
        </label>
        <textarea
          value={formData.certifications || ''}
          onChange={(e) => handleInputChange('certifications', e.target.value)}
          placeholder="List your professional certifications..."
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900 focus:bg-gray-50 transition-all duration-200"
          rows={3}
        />
      </div>
    </div>
  );

  const renderAdminFields = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Job Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.job_title || ''}
          onChange={(e) => handleInputChange('job_title', e.target.value)}
          placeholder="e.g., Director of Education, Training Manager"
          className={`w-full p-3 border rounded-lg focus:outline-none focus:border-gray-900 focus:bg-gray-50 transition-all duration-200 ${
            errors.job_title ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.job_title && <p className="text-red-500 text-sm mt-1">{errors.job_title}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Department
        </label>
        <input
          type="text"
          value={formData.department || ''}
          onChange={(e) => handleInputChange('department', e.target.value)}
          placeholder="e.g., Human Resources, Learning & Development"
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900 focus:bg-gray-50 transition-all duration-200"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          About Your Role
        </label>
        <textarea
          value={formData.bio || ''}
          onChange={(e) => handleInputChange('bio', e.target.value)}
          placeholder="Tell us about your role and responsibilities..."
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900 focus:bg-gray-50 transition-all duration-200"
          rows={3}
        />
      </div>
    </div>
  );

  const getRoleDisplayName = () => {
    switch (userRole) {
      case 'student': return 'Student';
      case 'tutor': return 'Tutor';
      case 'admin': return 'Organization Admin';
      default: return 'User';
    }
  };

  const getRoleDescription = () => {
    switch (userRole) {
      case 'student': 
        return 'Help us personalize your learning experience by sharing some details about your educational background and goals.';
      case 'tutor': 
        return 'Create your teaching profile to help students find you. Share your expertise and professional background.';
      case 'admin': 
        return 'Set up your administrator profile to manage your organization and oversee educational programs.';
      default: 
        return 'Complete your profile to get started.';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center items-center">
          <Logo size="md" showText={true} href="" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">
            Complete Your {getRoleDisplayName()} Profile
          </h2>
          <p className="text-gray-600 max-w-md mx-auto">
            {getRoleDescription()}
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-gray-50 rounded-xl p-6 space-y-6">
        <div className="flex items-center space-x-3 pb-4 border-b border-gray-200">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-semibold text-sm">2</span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Profile Information</h3>
            <p className="text-sm text-gray-600">
              {userRole === 'student' ? 'All fields are optional' : 
               userRole === 'tutor' ? 'Fields marked with * are required' :
               'Please provide your job title at minimum'}
            </p>
          </div>
        </div>

        {/* General error message */}
        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 text-sm">{errors.general}</p>
          </div>
        )}

        {/* Role-specific fields */}
        {userRole === 'student' && renderStudentFields()}
        {userRole === 'tutor' && renderTutorFields()}
        {userRole === 'admin' && renderAdminFields()}

        {/* Common fields */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            value={formData.phone_number || ''}
            onChange={(e) => handleInputChange('phone_number', e.target.value)}
            placeholder="+91 98765 43210"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900 focus:bg-gray-50 transition-all duration-200"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isSubmitting ? 'Saving Profile...' : 'Complete Profile'}
        </Button>
        
        <Button
          onClick={handleSkip}
          variant="outline"
          className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-3 px-6 rounded-lg transition-all duration-200"
        >
          Skip for Now - I&apos;ll Complete Later
        </Button>
      </div>

      {/* Skip info */}
      <div className="text-center">
        <p className="text-sm text-gray-500">
          Don&apos;t worry! You can always complete your profile from your dashboard later.
        </p>
      </div>
    </div>
  );
}
