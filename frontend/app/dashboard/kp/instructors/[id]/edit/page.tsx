"use client";

import { useState, useEffect } from 'react';
import { ArrowLeft, Save, AlertCircle, User, Briefcase } from 'lucide-react';
import { userApi, InstructorDetail, InstructorUpdateData } from '@/lib/api';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

interface FormData {
  user_email: string;
  user_full_name: string;
  bio: string;
  title: string;
  highest_education: 'bachelor' | 'master' | 'phd' | 'self_taught';
  specializations: string;
  technologies: string;
  years_of_experience: number;
  certifications: string;
  languages_spoken: string;
  linkedin_url: string;
  is_available: boolean;
  availability_notes: string;
}

interface FormErrors {
  [key: string]: string;
}

export default function EditInstructorPage() {
  const params = useParams();
  const router = useRouter();
  const instructorId = params.id as string;
  
  const [instructor, setInstructor] = useState<InstructorDetail | null>(null);
  const [formData, setFormData] = useState<FormData>({
    user_email: '',
    user_full_name: '',
    bio: '',
    title: '',
    highest_education: 'bachelor',
    specializations: '',
    technologies: '',
    years_of_experience: 0,
    certifications: '',
    languages_spoken: '',
    linkedin_url: '',
    is_available: true,
    availability_notes: '',
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    fetchInstructorDetails();
  }, [instructorId]);

  const fetchInstructorDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userApi.instructors.get(instructorId);
      setInstructor(data);
      
      // Populate form with current data
      setFormData({
        user_email: data.user.email,
        user_full_name: data.user.full_name,
        bio: data.bio,
        title: data.title,
        highest_education: data.highest_education as 'bachelor' | 'master' | 'phd' | 'self_taught',
        specializations: data.specializations,
        technologies: data.technologies,
        years_of_experience: data.years_of_experience,
        certifications: data.certifications || '',
        languages_spoken: data.languages_spoken,
        linkedin_url: data.linkedin_url || '',
        is_available: data.is_available,
        availability_notes: data.availability_notes || '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load instructor details');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Email validation
    if (!formData.user_email) {
      newErrors.user_email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.user_email)) {
      newErrors.user_email = 'Invalid email format';
    }
    
    // Full name validation
    if (!formData.user_full_name) {
      newErrors.user_full_name = 'Full name is required';
    } else if (formData.user_full_name.length < 2) {
      newErrors.user_full_name = 'Full name must be at least 2 characters';
    }
    
    // Bio validation
    if (!formData.bio) {
      newErrors.bio = 'Bio is required';
    } else if (formData.bio.length < 10) {
      newErrors.bio = 'Bio must be at least 10 characters';
    }
    
    // Title validation
    if (!formData.title) {
      newErrors.title = 'Job title is required';
    }
    
    // Specializations validation
    if (!formData.specializations) {
      newErrors.specializations = 'Specializations are required';
    }
    
    // Technologies validation
    if (!formData.technologies) {
      newErrors.technologies = 'Technologies are required';
    }
    
    // Languages validation
    if (!formData.languages_spoken) {
      newErrors.languages_spoken = 'Languages spoken is required';
    }
    
    // Years of experience validation
    if (formData.years_of_experience < 0) {
      newErrors.years_of_experience = 'Years of experience cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setSaving(true);
    setSaveError(null);

    try {
      const updateData: InstructorUpdateData = {
        user_email: formData.user_email,
        user_full_name: formData.user_full_name,
        bio: formData.bio,
        title: formData.title,
        highest_education: formData.highest_education,
        specializations: formData.specializations,
        technologies: formData.technologies,
        years_of_experience: formData.years_of_experience,
        certifications: formData.certifications || undefined,
        languages_spoken: formData.languages_spoken,
        linkedin_url: formData.linkedin_url || undefined,
        is_available: formData.is_available,
        availability_notes: formData.availability_notes || undefined,
      };

      await userApi.instructors.update(instructorId, updateData);
      
      // Redirect back to instructor detail page
      router.push(`/dashboard/kp/instructors/${instructorId}`);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to update instructor');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof FormData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/kp/instructors"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Edit Instructor</h1>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href={`/dashboard/kp/instructors/${instructorId}`}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Instructor</h1>
          <p className="text-gray-600">Update instructor information and profile</p>
        </div>
      </div>

      {/* Error Message */}
      {saveError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-700">{saveError}</span>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* User Information */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center mb-6">
            <User className="h-5 w-5 text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">User Information</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                value={formData.user_full_name}
                onChange={(e) => handleChange('user_full_name', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.user_full_name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter full name"
              />
              {errors.user_full_name && <p className="text-red-500 text-sm mt-1">{errors.user_full_name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                value={formData.user_email}
                onChange={(e) => handleChange('user_email', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.user_email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="instructor@example.com"
              />
              {errors.user_email && <p className="text-red-500 text-sm mt-1">{errors.user_email}</p>}
            </div>
          </div>
        </div>

        {/* Professional Information */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center mb-6">
            <Briefcase className="h-5 w-5 text-green-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Professional Information</h2>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio *
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => handleChange('bio', e.target.value)}
                rows={4}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.bio ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Describe professional background and expertise..."
              />
              {errors.bio && <p className="text-red-500 text-sm mt-1">{errors.bio}</p>}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Senior Developer, Data Scientist"
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Highest Education *
                </label>
                <select
                  value={formData.highest_education}
                  onChange={(e) => handleChange('highest_education', e.target.value as 'bachelor' | 'master' | 'phd' | 'self_taught')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="bachelor">Bachelor's Degree</option>
                  <option value="master">Master's Degree</option>
                  <option value="phd">PhD</option>
                  <option value="self_taught">Self-Taught</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Years of Experience *
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.years_of_experience}
                  onChange={(e) => handleChange('years_of_experience', parseInt(e.target.value) || 0)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.years_of_experience ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0"
                />
                {errors.years_of_experience && <p className="text-red-500 text-sm mt-1">{errors.years_of_experience}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Languages Spoken *
                </label>
                <input
                  type="text"
                  value={formData.languages_spoken}
                  onChange={(e) => handleChange('languages_spoken', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.languages_spoken ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., English, Spanish, French"
                />
                {errors.languages_spoken && <p className="text-red-500 text-sm mt-1">{errors.languages_spoken}</p>}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specializations *
                </label>
                <input
                  type="text"
                  value={formData.specializations}
                  onChange={(e) => handleChange('specializations', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.specializations ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Web Development, Machine Learning"
                />
                {errors.specializations && <p className="text-red-500 text-sm mt-1">{errors.specializations}</p>}
                <p className="text-sm text-gray-500 mt-1">Separate multiple specializations with commas</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Technologies *
                </label>
                <input
                  type="text"
                  value={formData.technologies}
                  onChange={(e) => handleChange('technologies', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.technologies ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., React, Python, AWS"
                />
                {errors.technologies && <p className="text-red-500 text-sm mt-1">{errors.technologies}</p>}
                <p className="text-sm text-gray-500 mt-1">Separate multiple technologies with commas</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Certifications
                </label>
                <textarea
                  value={formData.certifications}
                  onChange={(e) => handleChange('certifications', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="List relevant certifications..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  LinkedIn URL
                </label>
                <input
                  type="url"
                  value={formData.linkedin_url}
                  onChange={(e) => handleChange('linkedin_url', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Availability */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Availability Settings</h2>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_available"
                checked={formData.is_available}
                onChange={(e) => handleChange('is_available', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="is_available" className="ml-2 block text-sm text-gray-900">
                Currently available for new assignments
              </label>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Availability Notes
              </label>
              <textarea
                value={formData.availability_notes}
                onChange={(e) => handleChange('availability_notes', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Add any notes about availability, preferred schedule, etc..."
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-4">
          <Link
            href={`/dashboard/kp/instructors/${instructorId}`}
            className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
