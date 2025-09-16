"use client";

import { useState, useEffect } from 'react';
import { isAuthenticated, logout, safeJsonParse } from '@/lib/auth';
import { authenticatedFetch } from '@/lib/auth';
import { User, Mail, Calendar, Award, BookOpen, Users, Clock } from 'lucide-react';

interface UserProfile {
  user: {
    id: string;
    full_name: string;
    email: string;
    role: string;
    created_at: string;
    is_verified: boolean;
    is_approved: boolean;
  };
  profile: {
    bio?: string;
    profile_picture?: string;
    phone_number?: string;
    title?: string;
    years_of_experience?: number;
    highest_education?: string;
    certifications?: string;
    specializations?: string;
    technologies?: string;
    languages_spoken?: string;
    linkedin_url?: string;
    is_available?: boolean;
  };
  has_profile: boolean;
}

export default function InstructorProfilePage() {
  // const [user, setUser] = useState(getCurrentUser());
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    phone_number: '',
    bio: '',
    title: '',
    linkedin_url: '',
    specializations: '',
    technologies: '',
    years_of_experience: 0,
    highest_education: '',
    certifications: '',
    languages_spoken: 'English',
    is_available: true,
  });


  useEffect(() => {
    if (!isAuthenticated()) {
      logout();
      return;
    }
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authenticatedFetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/profile/detail/`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch profile: ${response.status} ${response.statusText}`);
      }
      
      const data = await safeJsonParse(response) as UserProfile;
      console.log('Profile data received:', data);
      
      setProfile(data);
      
      // Map API response to form data - API returns {user: {...}, profile: {...}}
      const profileData = data.profile || {};
      setFormData({
        phone_number: profileData.phone_number || '',
        bio: profileData.bio || '',
        title: profileData.title || '',
        linkedin_url: profileData.linkedin_url || '',
        specializations: profileData.specializations || '',
        technologies: profileData.technologies || '',
        years_of_experience: profileData.years_of_experience || 0,
        highest_education: profileData.highest_education || '',
        certifications: profileData.certifications || '',
        languages_spoken: profileData.languages_spoken || 'English',
        is_available: profileData.is_available !== undefined ? profileData.is_available : true,
      });
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      
      // Prepare data for API - only profile data (user data is not editable here)
      const updateData = {
        profile_data: {
          bio: formData.bio,
          phone_number: formData.phone_number,
          title: formData.title,
          linkedin_url: formData.linkedin_url,
          specializations: formData.specializations,
          technologies: formData.technologies,
          years_of_experience: formData.years_of_experience,
          highest_education: formData.highest_education,
          certifications: formData.certifications,
          languages_spoken: formData.languages_spoken,
          is_available: formData.is_available,
        }
      };
      
      console.log('Saving profile data:', updateData);
      
      const response = await authenticatedFetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/profile/detail/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      
      if (!response.ok) {
        let errorMessage = 'Failed to update profile';
        try {
          const errorData = await safeJsonParse(response) as { error?: string; message?: string };
          console.error('Profile update error:', errorData);
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          errorMessage = `Failed to update profile: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }
      
      const updatedProfile = await safeJsonParse(response) as UserProfile;
      console.log('Profile updated successfully:', updatedProfile);
      
      setProfile(updatedProfile);
      setIsEditing(false);
      
      // Show success message
      alert('Profile updated successfully!');
      
    } catch (err) {
      console.error('Error saving profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      const profileData = profile.profile || {};
      setFormData({
        phone_number: profileData.phone_number || '',
        bio: profileData.bio || '',
        title: profileData.title || '',
        linkedin_url: profileData.linkedin_url || '',
        specializations: profileData.specializations || '',
        technologies: profileData.technologies || '',
        years_of_experience: profileData.years_of_experience || 0,
        highest_education: profileData.highest_education || '',
        certifications: profileData.certifications || '',
        languages_spoken: profileData.languages_spoken || 'English',
        is_available: profileData.is_available !== undefined ? profileData.is_available : true,
      });
    }
    setIsEditing(false);
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
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={fetchProfile}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!profile) {
    return <div className="text-center py-12">Profile not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Profile Settings</h1>
              <p className="text-gray-600 mt-2 text-lg">Manage your instructor profile and personal information</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold shadow-lg hover:shadow-xl"
              >
                Edit Profile
              </button>
            ) : (
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleCancel}
                  className="px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-semibold shadow-lg hover:shadow-xl disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Basic Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name
                </label>
                <p className="text-gray-900 font-medium">{profile?.user?.full_name || 'Not available'}</p>
                <p className="text-xs text-gray-500 mt-1">Contact admin to change your name</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <p className="text-gray-900 font-medium">{profile?.user?.email || 'Not available'}</p>
                <p className="text-xs text-gray-500 mt-1">Contact admin to change your email</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={formData.phone_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone_number: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="+1 (555) 123-4567"
                  />
                ) : (
                  <p className="text-gray-900 font-medium">{profile?.profile?.phone_number || 'Not provided'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Job Title
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="e.g., Senior Software Engineer"
                  />
                ) : (
                  <p className="text-gray-900 font-medium">{profile?.profile?.title || 'Not provided'}</p>
                )}
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Bio
              </label>
              {isEditing ? (
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Tell us about yourself..."
                />
                ) : (
                  <p className="text-gray-900">{profile?.profile?.bio || 'No bio provided'}</p>
                )}
            </div>
          </div>

          {/* Professional Information */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <Award className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Professional Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Years of Experience
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    min="0"
                    value={formData.years_of_experience}
                    onChange={(e) => setFormData(prev => ({ ...prev, years_of_experience: parseInt(e.target.value) || 0 }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                ) : (
                  <p className="text-gray-900 font-medium">{profile?.profile?.years_of_experience || 0} years</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Highest Education
                </label>
                {isEditing ? (
                  <select
                    value={formData.highest_education}
                    onChange={(e) => setFormData(prev => ({ ...prev, highest_education: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="">Select education level</option>
                    <option value="bachelor">Bachelor&apos;s Degree</option>
                    <option value="master">Master&apos;s Degree</option>
                    <option value="phd">PhD</option>
                    <option value="professional">Professional Certification</option>
                    <option value="self_taught">Self-Taught</option>
                  </select>
                ) : (
                  <p className="text-gray-900 font-medium">
                    {profile?.profile?.highest_education ? 
                      profile.profile.highest_education.charAt(0).toUpperCase() + profile.profile.highest_education.slice(1).replace('_', ' ') : 
                      'Not provided'
                    }
                  </p>
                )}
              </div>
            </div>

            {/* Specializations */}
            <div className="mt-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Specializations
              </label>
              {isEditing ? (
                <textarea
                  value={formData.specializations}
                  onChange={(e) => setFormData(prev => ({ ...prev, specializations: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="e.g., Web Development, Machine Learning, Data Science (comma-separated)"
                />
              ) : (
                <p className="text-gray-900">{profile?.profile?.specializations || 'Not provided'}</p>
              )}
            </div>

            {/* Technologies */}
            <div className="mt-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Technologies
              </label>
              {isEditing ? (
                <textarea
                  value={formData.technologies}
                  onChange={(e) => setFormData(prev => ({ ...prev, technologies: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="e.g., JavaScript, Python, React, Node.js (comma-separated)"
                />
              ) : (
                <p className="text-gray-900">{profile?.profile?.technologies || 'Not provided'}</p>
              )}
            </div>

            {/* Certifications */}
            <div className="mt-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Certifications
              </label>
              {isEditing ? (
                <textarea
                  value={formData.certifications}
                  onChange={(e) => setFormData(prev => ({ ...prev, certifications: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="List your professional certifications (one per line or comma-separated)"
                />
              ) : (
                <p className="text-gray-900">{profile?.profile?.certifications || 'Not provided'}</p>
              )}
            </div>

            {/* Languages Spoken */}
            <div className="mt-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Languages Spoken
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.languages_spoken}
                  onChange={(e) => setFormData(prev => ({ ...prev, languages_spoken: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="e.g., English, Spanish, French"
                />
              ) : (
                <p className="text-gray-900">{profile?.profile?.languages_spoken || 'Not provided'}</p>
              )}
            </div>
          </div>

          {/* Social Links */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Mail className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Social Links</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  LinkedIn Profile
                </label>
                {isEditing ? (
                  <input
                    type="url"
                    value={formData.linkedin_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, linkedin_url: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                ) : (
                  <p className="text-gray-900 font-medium">{profile?.profile?.linkedin_url || 'Not provided'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Availability Status
                </label>
                {isEditing ? (
                  <select
                    value={formData.is_available ? 'available' : 'unavailable'}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_available: e.target.value === 'available' }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="available">Available for Teaching</option>
                    <option value="unavailable">Currently Unavailable</option>
                  </select>
                ) : (
                  <p className="text-gray-900 font-medium">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-sm ${
                      profile?.profile?.is_available 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {profile?.profile?.is_available ? 'Available' : 'Unavailable'}
                    </span>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Stats & Info */}
        <div className="space-y-6">
          {/* Account Stats */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Account Information</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Member since</p>
                  <p className="font-semibold text-gray-900">{profile?.user?.created_at ? new Date(profile.user.created_at).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Last login</p>
                  <p className="font-semibold text-gray-900">Never</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${profile?.user?.is_verified ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="font-semibold text-gray-900">{profile?.user?.is_verified ? 'Verified' : 'Not Verified'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Teaching Stats</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <BookOpen className="h-5 w-5 text-blue-500" />
                  <span className="text-gray-600">Courses</span>
                </div>
                <span className="font-bold text-gray-900">12</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5 text-green-500" />
                  <span className="text-gray-600">Students</span>
                </div>
                <span className="font-bold text-gray-900">1,234</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Award className="h-5 w-5 text-yellow-500" />
                  <span className="text-gray-600">Rating</span>
                </div>
                <span className="font-bold text-gray-900">4.8/5</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
