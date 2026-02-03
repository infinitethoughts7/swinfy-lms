'use client';

import { useState, useEffect } from 'react';
import { userApi } from '@/features/users/services/user';
import { getBaseApiUrl } from '@/shared/services/api-client';
import { useContentModeration } from '@/lib/hooks/useContentModeration';
import { Edit3, Save, X, User, Phone, Target, Heart, Upload, AlertCircle } from 'lucide-react';
import Image from 'next/image';

interface LearnerProfile {
  id: string;
  bio?: string;
  profile_picture?: string;
  phone_number?: string;
  learning_goals?: string;
  interests?: string;
  created_at: string;
  updated_at: string;
}

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_verified: boolean;
  learner_profile?: LearnerProfile;
}

interface ProfileData {
  user: UserProfile;
  profile: LearnerProfile;
  has_profile: boolean;
}

export default function StudentProfilePage() {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    bio: '',
    phone_number: '',
    learning_goals: '',
    interests: '',
  });
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null);

  // Content moderation hook
  const { 
    checkField, 
    getFieldError, 
    hasErrors: hasModerationErrors,
    clearAllErrors: clearModerationErrors
  } = useContentModeration();

  // Parse field-specific errors from error message
  const parseFieldErrors = (errorMessage: string): {[key: string]: string} => {
    const errors: {[key: string]: string} = {};
    const parts = errorMessage.split(';').map(p => p.trim());
    parts.forEach(part => {
      const match = part.match(/^(\w+):\s*(.+)$/);
      if (match) {
        const [, field, message] = match;
        errors[field.toLowerCase()] = message;
      }
    });
    return errors;
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await userApi.getProfile();
      setProfileData(data);
      
      // Initialize form data
      setFormData({
        full_name: data.user?.full_name || '',
        email: data.user?.email || '',
        bio: data.profile?.bio || '',
        phone_number: data.profile?.phone_number || '',
        learning_goals: data.profile?.learning_goals || '',
        interests: data.profile?.interests || '',
      });
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setProfileError('');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setProfileError('');
    clearModerationErrors();
    // Reset form data to original values
    if (profileData) {
      setFormData({
        full_name: profileData.user?.full_name || '',
        email: profileData.user?.email || '',
        bio: profileData.profile?.bio || '',
        phone_number: profileData.profile?.phone_number || '',
        learning_goals: profileData.profile?.learning_goals || '',
        interests: profileData.profile?.interests || '',
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear field-specific error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Check content moderation for text fields
    const textFields = ['bio', 'learning_goals', 'interests', 'full_name'];
    if (textFields.includes(name)) {
      checkField(name, value);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Clear any previous errors
      setProfileError('');
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type.toLowerCase())) {
        setProfileError('Please select a valid image file (JPG, PNG, GIF, or WEBP).');
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setProfileError('Image size should be less than 10MB.');
        return;
      }
      
      setProfilePicture(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setProfilePicturePreview(result);
      };
      reader.onerror = () => {
        setProfileError('Failed to read the image file. Please try again.');
        setProfilePicture(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageRemove = () => {
    setProfilePicture(null);
    setProfilePicturePreview(null);
  };

  const handleSave = async () => {
    // Check for content moderation errors
    if (hasModerationErrors) {
      setProfileError('Please fix the content issues highlighted in red before saving.');
      return;
    }

    try {
      setProfileLoading(true);
      setProfileError('');
      setFieldErrors({});

      // Prepare form data for file upload
      const formDataToSend = new FormData();
      
      // Add user data
      formDataToSend.append('user_data', JSON.stringify({
        full_name: formData.full_name,
      }));
      
      // Add profile data
      const profileDataToSend: {
        bio: string;
        phone_number: string;
        learning_goals: string;
        interests: string;
      } = {
        bio: formData.bio || '',
        phone_number: formData.phone_number || '',
        learning_goals: formData.learning_goals || '',
        interests: formData.interests || '',
      };
      
      formDataToSend.append('profile_data', JSON.stringify(profileDataToSend));
      
      // Add profile picture if uploaded
      if (profilePicture) {
        formDataToSend.append('profile_picture', profilePicture);
      }

      // Update user profile with file upload
      await userApi.updateProfileWithFile(formDataToSend);

      // Refresh profile data
      await fetchProfileData();
      setIsEditing(false);
      alert('Profile updated successfully!');
      
      // Reset image states
      setProfilePicture(null);
      setProfilePicturePreview(null);
    } catch (err) {
      console.error('Error updating profile:', err);
      if (err instanceof Error) {
        const errors = parseFieldErrors(err.message);
        if (Object.keys(errors).length > 0) {
          setFieldErrors(errors);
          setProfileError('Please fix the content issues highlighted below.');
        } else {
          setProfileError(err.message || 'Failed to update profile. Please try again.');
        }
      } else {
        setProfileError('Failed to update profile. Please try again.');
      }
    } finally {
      setProfileLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => fetchProfileData()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No profile data found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 flex items-center">
            <User className="w-6 h-6 mr-3" />
            My Profile
          </h1>
          {!isEditing && (
            <button
              onClick={handleEdit}
              className="flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Edit3 className="w-4 h-4 mr-2" />
              Edit Profile
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-6">
            {profileError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-sm">{profileError}</p>
              </div>
            )}

            {/* Profile Picture Section */}
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
              <div className="relative">
                <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                  {profilePicturePreview ? (
                    <Image
                      src={profilePicturePreview}
                      alt="Profile Preview"
                      width={128}
                      height={128}
                      className="w-full h-full object-cover"
                    />
                  ) : profileData.profile?.profile_picture ? (
                    <Image
                      src={profileData.profile.profile_picture.startsWith('http')
                        ? profileData.profile.profile_picture
                        : `${getBaseApiUrl()}${profileData.profile.profile_picture}`
                      }
                      alt="Profile"
                      width={128}
                      height={128}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Show placeholder if image fails to load
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <User className="w-16 h-16 text-gray-400" />
                  )}
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Profile Picture</h3>
                <p className="text-sm text-gray-500 mb-3">
                  {profilePicture ? (
                    <span className="text-green-600 font-medium">✓ {profilePicture.name} ({(profilePicture.size / 1024).toFixed(1)} KB)</span>
                  ) : (
                    'Upload a professional photo for your profile'
                  )}
                </p>
                <div className="flex items-center space-x-3">
                  <label className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Image
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                      onChange={handleImageUpload}
                      disabled={profileLoading}
                      className="hidden"
                    />
                  </label>
                  {profilePicture && (
                    <button
                      type="button"
                      onClick={handleImageRemove}
                      disabled={profileLoading}
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Remove
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-2">Max size: 10MB. Supported formats: JPG, PNG, GIF, WEBP</p>
              </div>
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    getFieldError('full_name') ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  required
                />
                {getFieldError('full_name') && (
                  <p className="text-xs text-red-600 mt-1 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {getFieldError('full_name')}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleInputChange}
                  placeholder="Enter your phone number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interests
                </label>
                <input
                  type="text"
                  name="interests"
                  value={formData.interests}
                  onChange={handleInputChange}
                  placeholder="e.g., Programming, Design, Marketing"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    fieldErrors.interests || getFieldError('interests') ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {(fieldErrors.interests || getFieldError('interests')) ? (
                  <p className="text-xs text-red-600 mt-1 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {fieldErrors.interests || getFieldError('interests')}
                  </p>
                ) : (
                  <p className="text-xs text-gray-500 mt-1">Separate multiple interests with commas</p>
                )}
              </div>
            </div>

            {/* Bio Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                placeholder="Tell us about yourself..."
                rows={4}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  fieldErrors.bio || getFieldError('bio') ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
              />
              {(fieldErrors.bio || getFieldError('bio')) && (
                <p className="text-xs text-red-600 mt-1 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {fieldErrors.bio || getFieldError('bio')}
                </p>
              )}
            </div>

            {/* Learning Goals Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Learning Goals
              </label>
              <textarea
                name="learning_goals"
                value={formData.learning_goals}
                onChange={handleInputChange}
                placeholder="What do you want to learn? What are your learning objectives?"
                rows={4}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  fieldErrors.learning_goals || getFieldError('learning_goals') ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
              />
              {(fieldErrors.learning_goals || getFieldError('learning_goals')) && (
                <p className="text-xs text-red-600 mt-1 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {fieldErrors.learning_goals || getFieldError('learning_goals')}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                onClick={handleCancel}
                disabled={profileLoading}
                className="flex items-center px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={profileLoading || hasModerationErrors}
                className={`flex items-center px-6 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 ${
                  hasModerationErrors ? 'bg-red-500' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {profileLoading ? (
                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : hasModerationErrors ? (
                  <AlertCircle className="w-4 h-4 mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {profileLoading ? 'Saving...' : hasModerationErrors ? 'Fix Content Issues' : 'Save Changes'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Profile Picture Display */}
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                {profileData.profile?.profile_picture ? (
                  <Image
                    src={profileData.profile.profile_picture.startsWith('http')
                      ? profileData.profile.profile_picture
                      : `${getBaseApiUrl()}${profileData.profile.profile_picture}`
                    }
                    alt="Profile"
                    width={96}
                    height={96}
                    className="w-24 h-24 rounded-full object-cover"
                    onError={(e) => {
                      // Hide image if it fails to load
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <User className="w-12 h-12 text-gray-400" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{profileData.user?.full_name}</h2>
                <p className="text-gray-500">{profileData.user?.email}</p>
                <p className="text-sm text-gray-400">Learner</p>
              </div>
            </div>

            {/* Profile Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {profileData.profile?.phone_number && (
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Phone</p>
                    <p className="text-sm text-gray-500">{profileData.profile.phone_number}</p>
                  </div>
                </div>
              )}

              {profileData.profile?.interests && (
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <Heart className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Interests</p>
                    <p className="text-sm text-gray-500">{profileData.profile.interests}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Bio Section */}
            {profileData.profile?.bio && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  About Me
                </h3>
                <p className="text-sm text-gray-600">{profileData.profile.bio}</p>
              </div>
            )}

            {/* Learning Goals Section */}
            {profileData.profile?.learning_goals && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                  <Target className="w-4 h-4 mr-2" />
                  Learning Goals
                </h3>
                <p className="text-sm text-gray-600">{profileData.profile.learning_goals}</p>
              </div>
            )}

            {/* Profile Stats */}
            {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-500">Profile Created</p>
                <p className="text-lg font-semibold text-blue-600">
                  {profileData.profile?.created_at ? 
                    new Date(profileData.profile.created_at).toLocaleDateString() : 
                    'N/A'
                  }
                </p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-500">Last Updated</p>
                <p className="text-lg font-semibold text-green-600">
                  {profileData.profile?.updated_at ? 
                    new Date(profileData.profile.updated_at).toLocaleDateString() : 
                    'N/A'
                  }
                </p>
              </div>
            </div> */}
          </div>
        )}
      </div>
    </div>
  );
}