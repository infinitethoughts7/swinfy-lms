'use client';

import { useState, useEffect } from 'react';
import { userApi } from '@/features/users/services/user';
import { getBaseApiUrl } from '@/shared/services/api-client';
import { useContentModeration } from '@/lib/hooks/useContentModeration';
import { Edit3, Save, X, User, Phone, Target, Heart, Upload, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

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

function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-48" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-6">
            <Skeleton className="w-24 h-24 rounded-full" />
            <div>
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-5 w-32" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-20 rounded-lg" />
            <Skeleton className="h-20 rounded-lg" />
          </div>
          <Skeleton className="h-32 rounded-lg" />
        </CardContent>
      </Card>
    </div>
  );
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

  const {
    checkField,
    getFieldError,
    hasErrors: hasModerationErrors,
    clearAllErrors: clearModerationErrors
  } = useContentModeration();

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
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }

    const textFields = ['bio', 'learning_goals', 'interests', 'full_name'];
    if (textFields.includes(name)) {
      checkField(name, value);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileError('');

      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type.toLowerCase())) {
        setProfileError('Please select a valid image file (JPG, PNG, GIF, or WEBP).');
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setProfileError('Image size should be less than 10MB.');
        return;
      }

      setProfilePicture(file);

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
    if (hasModerationErrors) {
      setProfileError('Please fix the content issues highlighted in red before saving.');
      return;
    }

    try {
      setProfileLoading(true);
      setProfileError('');
      setFieldErrors({});

      const formDataToSend = new FormData();

      formDataToSend.append('user_data', JSON.stringify({
        full_name: formData.full_name,
      }));

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

      if (profilePicture) {
        formDataToSend.append('profile_picture', profilePicture);
      }

      await userApi.updateProfileWithFile(formDataToSend);

      await fetchProfileData();
      setIsEditing(false);
      alert('Profile updated successfully!');

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
    return <ProfileSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={() => fetchProfileData()}>
            Try Again
          </Button>
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

  const getProfilePictureUrl = () => {
    if (profilePicturePreview) return profilePicturePreview;
    if (profileData.profile?.profile_picture) {
      return profileData.profile.profile_picture.startsWith('http')
        ? profileData.profile.profile_picture
        : `${getBaseApiUrl()}${profileData.profile.profile_picture}`;
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <User className="w-6 h-6 mr-3" />
              My Profile
            </CardTitle>
            {!isEditing && (
              <Button variant="secondary" onClick={handleEdit}>
                <Edit3 className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="space-y-6">
              {profileError && (
                <Alert variant="destructive">
                  <AlertDescription>{profileError}</AlertDescription>
                </Alert>
              )}

              {/* Profile Picture Section */}
              <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
                <div className="relative">
                  <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
                    <AvatarImage
                      src={getProfilePictureUrl() || undefined}
                      alt="Profile"
                    />
                    <AvatarFallback className="text-4xl">
                      <User className="w-16 h-16 text-gray-400" />
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Profile Picture</h3>
                  <p className="text-sm text-gray-500 mb-3">
                    {profilePicture ? (
                      <span className="text-green-600 font-medium">Selected: {profilePicture.name} ({(profilePicture.size / 1024).toFixed(1)} KB)</span>
                    ) : (
                      'Upload a professional photo for your profile'
                    )}
                  </p>
                  <div className="flex items-center space-x-3">
                    <Button asChild disabled={profileLoading}>
                      <label className="cursor-pointer">
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
                    </Button>
                    {profilePicture && (
                      <Button
                        variant="destructive"
                        onClick={handleImageRemove}
                        disabled={profileLoading}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Remove
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-2">Max size: 10MB. Supported formats: JPG, PNG, GIF, WEBP</p>
                </div>
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name *</Label>
                  <Input
                    id="full_name"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    className={getFieldError('full_name') ? 'border-red-500 bg-red-50' : ''}
                    required
                  />
                  {getFieldError('full_name') && (
                    <p className="text-xs text-red-600 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {getFieldError('full_name')}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    disabled
                    className="bg-gray-50 text-gray-500"
                  />
                  <p className="text-xs text-gray-500">Email cannot be changed</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone_number">Phone Number</Label>
                  <Input
                    id="phone_number"
                    name="phone_number"
                    type="tel"
                    value={formData.phone_number}
                    onChange={handleInputChange}
                    placeholder="Enter your phone number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="interests">Interests</Label>
                  <Input
                    id="interests"
                    name="interests"
                    value={formData.interests}
                    onChange={handleInputChange}
                    placeholder="e.g., Programming, Design, Marketing"
                    className={fieldErrors.interests || getFieldError('interests') ? 'border-red-500 bg-red-50' : ''}
                  />
                  {(fieldErrors.interests || getFieldError('interests')) ? (
                    <p className="text-xs text-red-600 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {fieldErrors.interests || getFieldError('interests')}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-500">Separate multiple interests with commas</p>
                  )}
                </div>
              </div>

              {/* Bio Section */}
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Tell us about yourself..."
                  rows={4}
                  className={fieldErrors.bio || getFieldError('bio') ? 'border-red-500 bg-red-50' : ''}
                />
                {(fieldErrors.bio || getFieldError('bio')) && (
                  <p className="text-xs text-red-600 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {fieldErrors.bio || getFieldError('bio')}
                  </p>
                )}
              </div>

              {/* Learning Goals Section */}
              <div className="space-y-2">
                <Label htmlFor="learning_goals">Learning Goals</Label>
                <Textarea
                  id="learning_goals"
                  name="learning_goals"
                  value={formData.learning_goals}
                  onChange={handleInputChange}
                  placeholder="What do you want to learn? What are your learning objectives?"
                  rows={4}
                  className={fieldErrors.learning_goals || getFieldError('learning_goals') ? 'border-red-500 bg-red-50' : ''}
                />
                {(fieldErrors.learning_goals || getFieldError('learning_goals')) && (
                  <p className="text-xs text-red-600 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {fieldErrors.learning_goals || getFieldError('learning_goals')}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                <Button
                  variant="secondary"
                  onClick={handleCancel}
                  disabled={profileLoading}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={profileLoading || hasModerationErrors}
                  className={hasModerationErrors ? 'bg-red-500 hover:bg-red-500' : ''}
                >
                  {profileLoading ? (
                    <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : hasModerationErrors ? (
                    <AlertCircle className="w-4 h-4 mr-2" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {profileLoading ? 'Saving...' : hasModerationErrors ? 'Fix Content Issues' : 'Save Changes'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Profile Picture Display */}
              <div className="flex items-center space-x-6">
                <Avatar className="w-24 h-24">
                  <AvatarImage
                    src={getProfilePictureUrl() || undefined}
                    alt="Profile"
                  />
                  <AvatarFallback>
                    <User className="w-12 h-12 text-gray-400" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{profileData.user?.full_name}</h2>
                  <p className="text-gray-500">{profileData.user?.email}</p>
                  <p className="text-sm text-gray-400">Learner</p>
                </div>
              </div>

              {/* Profile Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {profileData.profile?.phone_number && (
                  <Card className="bg-gray-50">
                    <CardContent className="pt-4 flex items-center space-x-3">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Phone</p>
                        <p className="text-sm text-gray-500">{profileData.profile.phone_number}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {profileData.profile?.interests && (
                  <Card className="bg-gray-50">
                    <CardContent className="pt-4 flex items-center space-x-3">
                      <Heart className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Interests</p>
                        <p className="text-sm text-gray-500">{profileData.profile.interests}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Bio Section */}
              {profileData.profile?.bio && (
                <Card className="bg-gray-50">
                  <CardContent className="pt-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      About Me
                    </h3>
                    <p className="text-sm text-gray-600">{profileData.profile.bio}</p>
                  </CardContent>
                </Card>
              )}

              {/* Learning Goals Section */}
              {profileData.profile?.learning_goals && (
                <Card className="bg-gray-50">
                  <CardContent className="pt-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                      <Target className="w-4 h-4 mr-2" />
                      Learning Goals
                    </h3>
                    <p className="text-sm text-gray-600">{profileData.profile.learning_goals}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
