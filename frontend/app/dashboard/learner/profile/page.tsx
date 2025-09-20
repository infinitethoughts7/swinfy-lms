'use client';

import { useState, useEffect } from 'react';
import { userApi } from '@/lib/api';
import { getBaseApiUrl } from '@/lib/api-config';
import { Edit3, Save, X, User, Mail, Phone, Target, Heart, Camera, Upload } from 'lucide-react';

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

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await userApi.getProfile();
      console.log('Profile data fetched:', data);
      console.log('Profile picture URL:', data.profile?.profile_picture);
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
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setProfileError('Please select a valid image file.');
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
        setProfilePicturePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageRemove = () => {
    setProfilePicture(null);
    setProfilePicturePreview(null);
  };

  const handleSave = async () => {
    try {
      setProfileLoading(true);
      setProfileError('');

      // Prepare form data for file upload
      const formDataToSend = new FormData();
      
      // Add user data
      formDataToSend.append('user_data', JSON.stringify({
        full_name: formData.full_name,
      }));
      
      // Add profile data
      const profileDataToSend: any = {
        bio: formData.bio,
        phone_number: formData.phone_number,
        learning_goals: formData.learning_goals,
        interests: formData.interests,
      };
      
      // Add profile picture if uploaded
      if (profilePicture) {
        formDataToSend.append('profile_picture', profilePicture);
      }
      
      formDataToSend.append('profile_data', JSON.stringify(profileDataToSend));

      // Update user profile with file upload
      await userApi.updateProfileWithFile(formDataToSend);

      // Refresh profile data
      await fetchProfileData();
      setIsEditing(false);
      
      // Reset image states
      setProfilePicture(null);
      setProfilePicturePreview(null);
    } catch (err) {
      console.error('Error updating profile:', err);
      setProfileError('Failed to update profile. Please try again.');
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
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                  {profilePicturePreview ? (
                    <img
                      src={profilePicturePreview}
                      alt="Profile Preview"
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  ) : profileData.profile?.profile_picture ? (
                    <img
                      src={profileData.profile.profile_picture.startsWith('http') 
                        ? profileData.profile.profile_picture 
                        : `${getBaseApiUrl()}${profileData.profile.profile_picture}`
                      }
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover"
                      onLoad={() => console.log('Profile image loaded successfully in edit mode')}
                      onError={(e) => {
                        console.error('Profile image failed to load in edit mode:', e.currentTarget.src);
                        // Hide image if it fails to load
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <User className="w-12 h-12 text-gray-400" />
                  )}
                </div>
                <label className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors cursor-pointer">
                  <Camera className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
                {profilePicture && (
                  <button
                    onClick={handleImageRemove}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Profile Picture</h3>
                <p className="text-sm text-gray-500">
                  {profilePicture ? 'New image selected' : 'Click the camera icon to upload a new photo'}
                </p>
                <div className="mt-2 space-x-2">
                  <label className="text-sm text-blue-600 hover:text-blue-700 flex items-center cursor-pointer">
                    <Upload className="w-4 h-4 mr-1" />
                    {profilePicture ? 'Change Photo' : 'Upload Photo'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                  {profilePicture && (
                    <button
                      onClick={handleImageRemove}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-1">Max size: 10MB. Supported formats: JPG, PNG, GIF</p>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Separate multiple interests with commas</p>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
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
                disabled={profileLoading}
                className="flex items-center px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {profileLoading ? (
                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {profileLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Profile Picture Display */}
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                {profileData.profile?.profile_picture ? (
                  <img
                    src={profileData.profile.profile_picture.startsWith('http') 
                      ? profileData.profile.profile_picture 
                      : `${getBaseApiUrl()}${profileData.profile.profile_picture}`
                    }
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover"
                    onLoad={() => console.log('Profile image loaded successfully')}
                    onError={(e) => {
                      console.error('Profile image failed to load:', e.currentTarget.src);
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
}