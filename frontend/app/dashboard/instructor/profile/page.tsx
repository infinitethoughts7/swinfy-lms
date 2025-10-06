"use client";

import { useState, useEffect } from 'react';
import { isAuthenticated, logout, safeJsonParse } from '@/lib/auth';
import { authenticatedFetch } from '@/lib/auth';
import { User, Mail, Calendar, Award, Lock, X } from 'lucide-react';
import ChangePasswordForm from '@/components/dashboard/ChangePasswordForm';

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
  const [showPasswordModal, setShowPasswordModal] = useState(false);

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
      setProfile(data);
      
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
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          errorMessage = `Failed to update profile: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }
      
      // Refresh the profile data to show updated information
      await fetchProfile();
      setIsEditing(false);
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
    <div className="max-w-6xl mx-auto">
      {/* Compact Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-sm text-gray-600 mt-1">Manage your instructor profile and personal information</p>
        </div>
        <div className="flex items-center space-x-3">
          {!isEditing ? (
            <>
              <button
                onClick={() => setShowPasswordModal(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium flex items-center"
              >
                <Lock className="h-4 w-4 mr-2" />
                Update Password
              </button>
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Edit Profile
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Profile Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Personal Information */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center space-x-2 mb-4 pb-3 border-b border-gray-200">
              <User className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
                <p className="text-sm text-gray-900 font-medium">{profile?.user?.full_name || 'Not available'}</p>
                <p className="text-xs text-gray-500 mt-0.5">Contact admin to change</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Email</label>
                <p className="text-sm text-gray-900 font-medium">{profile?.user?.email || 'Not available'}</p>
                <p className="text-xs text-gray-500 mt-0.5">Contact admin to change</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Phone</label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={formData.phone_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone_number: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="+1 (555) 123-4567"
                  />
                ) : (
                  <p className="text-sm text-gray-900 font-medium">{profile?.profile?.phone_number || 'Not provided'}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Availability Status</label>
                {isEditing ? (
                  <select
                    value={formData.is_available ? 'available' : 'unavailable'}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_available: e.target.value === 'available' }))}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    <option value="available">Available for Teaching</option>
                    <option value="unavailable">Currently Unavailable</option>
                  </select>
                ) : (
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    profile?.profile?.is_available 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {profile?.profile?.is_available ? 'Available' : 'Unavailable'}
                  </span>
                )}
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-gray-700 mb-1">Job Title</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="e.g., Senior Software Engineer"
                />
              ) : (
                <p className="text-sm text-gray-900 font-medium">{profile?.profile?.title || 'Not provided'}</p>
              )}
            </div>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-gray-700 mb-1">Bio</label>
              {isEditing ? (
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="Tell us about yourself..."
                />
              ) : (
                <p className="text-sm text-gray-900">{profile?.profile?.bio || 'No bio provided'}</p>
              )}
            </div>
          </div>

          {/* Professional Information */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center space-x-2 mb-4 pb-3 border-b border-gray-200">
              <Award className="h-5 w-5 text-green-600" />
              <h2 className="text-lg font-semibold text-gray-900">Professional Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Years of Experience</label>
                {isEditing ? (
                  <input
                    type="number"
                    min="0"
                    value={formData.years_of_experience}
                    onChange={(e) => setFormData(prev => ({ ...prev, years_of_experience: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                  />
                ) : (
                  <p className="text-sm text-gray-900 font-medium">{profile?.profile?.years_of_experience || 0} years</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Highest Education</label>
                {isEditing ? (
                  <select
                    value={formData.highest_education}
                    onChange={(e) => setFormData(prev => ({ ...prev, highest_education: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    <option value="">Select education level</option>
                    <option value="bachelor">Bachelor&apos;s Degree</option>
                    <option value="master">Master&apos;s Degree</option>
                    <option value="phd">PhD</option>
                    <option value="professional">Professional Certification</option>
                    <option value="self_taught">Self-Taught</option>
                  </select>
                ) : (
                  <p className="text-sm text-gray-900 font-medium">
                    {profile?.profile?.highest_education ? 
                      profile.profile.highest_education.charAt(0).toUpperCase() + profile.profile.highest_education.slice(1).replace('_', ' ') : 
                      'Not provided'
                    }
                  </p>
                )}
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-gray-700 mb-1">Specializations</label>
              {isEditing ? (
                <textarea
                  value={formData.specializations}
                  onChange={(e) => setFormData(prev => ({ ...prev, specializations: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="e.g., Web Development, Machine Learning, Data Science"
                />
              ) : (
                <p className="text-sm text-gray-900">{profile?.profile?.specializations || 'Not provided'}</p>
              )}
            </div>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-gray-700 mb-1">Technologies</label>
              {isEditing ? (
                <textarea
                  value={formData.technologies}
                  onChange={(e) => setFormData(prev => ({ ...prev, technologies: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="e.g., JavaScript, Python, React, Node.js"
                />
              ) : (
                <p className="text-sm text-gray-900">{profile?.profile?.technologies || 'Not provided'}</p>
              )}
            </div>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-gray-700 mb-1">Certifications</label>
              {isEditing ? (
                <textarea
                  value={formData.certifications}
                  onChange={(e) => setFormData(prev => ({ ...prev, certifications: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="List your professional certifications"
                />
              ) : (
                <p className="text-sm text-gray-900">{profile?.profile?.certifications || 'Not provided'}</p>
              )}
            </div>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-gray-700 mb-1">Languages Spoken</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.languages_spoken}
                  onChange={(e) => setFormData(prev => ({ ...prev, languages_spoken: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="e.g., English, Spanish, French"
                />
              ) : (
                <p className="text-sm text-gray-900">{profile?.profile?.languages_spoken || 'Not provided'}</p>
              )}
            </div>
          </div>

        </div>

        {/* Right Column - Stats */}
        <div className="space-y-4">
          {/* Social Links */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center space-x-2 mb-4 pb-3 border-b border-gray-200">
              <Mail className="h-5 w-5 text-purple-600" />
              <h2 className="text-lg font-semibold text-gray-900">Social Links</h2>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">LinkedIn Profile</label>
              {isEditing ? (
                <input
                  type="url"
                  value={formData.linkedin_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, linkedin_url: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              ) : (
                <p className="text-sm text-gray-900 font-medium truncate">{profile?.profile?.linkedin_url || 'Not provided'}</p>
              )}
            </div>
          </div>

          {/* Account Information */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <h3 className="text-base font-semibold text-gray-900 mb-3">Account Information</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-600">Member since</p>
                  <p className="text-sm font-semibold text-gray-900">{profile?.user?.created_at ? new Date(profile.user.created_at).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div> 
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${profile?.user?.is_verified ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <div>
                  <p className="text-xs text-gray-600">Status</p>
                  <p className="text-sm font-semibold text-gray-900">{profile?.user?.is_verified ? 'Verified' : 'Not Verified'}</p>
                </div>
              </div>
            </div>
          </div>
          
        </div>

      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Update Your Password</h2>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              <ChangePasswordForm 
                onSuccess={() => {
                  setTimeout(() => {
                    setShowPasswordModal(false);
                  }, 2000);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}