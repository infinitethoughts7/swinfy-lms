"use client";

import { useState, useEffect } from 'react';
import { isAuthenticated, logout, safeJsonParse } from '@/lib/auth/token';
import { authenticatedFetch } from '@/lib/auth/token';
import { useContentModeration } from '@/lib/hooks/useContentModeration';
import { User, Mail, Calendar, Award, Lock, AlertCircle } from 'lucide-react';
import ChangePasswordForm from '@/components/dashboard/ChangePasswordForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

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
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});
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
    if (hasModerationErrors) {
      setError('Please fix the content issues highlighted in red before saving.');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setFieldErrors({});

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
          const errorData = await response.json();
          const fieldErrorsFound = Object.entries(errorData)
            .filter(([, value]) => Array.isArray(value) && value.length > 0)
            .map(([field, errors]) => `${field}: ${(errors as string[]).join(', ')}`)
            .join('; ');

          if (fieldErrorsFound) {
            errorMessage = fieldErrorsFound;
          } else {
            errorMessage = errorData.error || errorData.message || errorMessage;
          }
        } catch {
          errorMessage = `Failed to update profile: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      await fetchProfile();
      setIsEditing(false);
      alert('Profile updated successfully!');

    } catch (err) {
      console.error('Error saving profile:', err);
      if (err instanceof Error) {
        const errors = parseFieldErrors(err.message);
        if (Object.keys(errors).length > 0) {
          setFieldErrors(errors);
          setError('Please fix the content issues highlighted below.');
        } else {
          setError(err.message || 'Failed to save profile');
        }
      } else {
        setError('Failed to save profile');
      }
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
    setFieldErrors({});
    clearModerationErrors();
    setIsEditing(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: '' }));
    }
    const textFields = ['bio', 'title', 'specializations', 'technologies', 'certifications'];
    if (textFields.includes(field)) {
      checkField(field, value);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="flex space-x-3">
            <Skeleton className="h-10 w-36" />
            <Skeleton className="h-10 w-28" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-64 w-full rounded-xl" />
            <Skeleton className="h-80 w-full rounded-xl" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-40 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <Alert variant="destructive" className="max-w-md mx-auto">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={fetchProfile} className="mt-4">
          Try Again
        </Button>
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
              <Button
                onClick={() => setShowPasswordModal(true)}
                variant="outline"
                className="bg-purple-600 text-white hover:bg-purple-700 border-purple-600"
              >
                <Lock className="h-4 w-4 mr-2" />
                Update Password
              </Button>
              <Button onClick={() => setIsEditing(true)}>
                Edit Profile
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving || hasModerationErrors}
                className={hasModerationErrors ? 'bg-red-500 hover:bg-red-600' : ''}
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : hasModerationErrors ? (
                  <>
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Fix Content Issues
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Error Banner for Editing */}
      {isEditing && (error || hasModerationErrors) && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {hasModerationErrors
              ? 'Please fix the content issues highlighted in red below before saving.'
              : error
            }
          </AlertDescription>
        </Alert>
      )}

      {/* Profile Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Personal Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <User className="h-5 w-5 text-blue-600 mr-2" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-semibold">Full Name</Label>
                  <p className="text-sm text-gray-900 font-medium">{profile?.user?.full_name || 'Not available'}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Contact admin to change</p>
                </div>

                <div>
                  <Label className="text-xs font-semibold">Email</Label>
                  <p className="text-sm text-gray-900 font-medium">{profile?.user?.email || 'Not available'}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Contact admin to change</p>
                </div>

                <div>
                  <Label className="text-xs font-semibold">Phone</Label>
                  {isEditing ? (
                    <Input
                      type="tel"
                      value={formData.phone_number}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone_number: e.target.value }))}
                      placeholder="+1 (555) 123-4567"
                    />
                  ) : (
                    <p className="text-sm text-gray-900 font-medium">{profile?.profile?.phone_number || 'Not provided'}</p>
                  )}
                </div>

                <div>
                  <Label className="text-xs font-semibold">Availability Status</Label>
                  {isEditing ? (
                    <Select
                      value={formData.is_available ? 'available' : 'unavailable'}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, is_available: value === 'available' }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">Available for Teaching</SelectItem>
                        <SelectItem value="unavailable">Currently Unavailable</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge className={profile?.profile?.is_available
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                    }>
                      {profile?.profile?.is_available ? 'Available' : 'Unavailable'}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <Label className="text-xs font-semibold">Job Title</Label>
                {isEditing ? (
                  <>
                    <Input
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className={fieldErrors.title || getFieldError('title') ? 'border-red-500 bg-red-50' : ''}
                      placeholder="e.g., Senior Software Engineer"
                    />
                    {(fieldErrors.title || getFieldError('title')) && (
                      <p className="text-xs text-red-600 mt-1 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {fieldErrors.title || getFieldError('title')}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-gray-900 font-medium">{profile?.profile?.title || 'Not provided'}</p>
                )}
              </div>

              <div className="mt-4">
                <Label className="text-xs font-semibold">Bio</Label>
                {isEditing ? (
                  <>
                    <Textarea
                      value={formData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      rows={3}
                      className={fieldErrors.bio || getFieldError('bio') ? 'border-red-500 bg-red-50' : ''}
                      placeholder="Tell us about yourself..."
                    />
                    {(fieldErrors.bio || getFieldError('bio')) && (
                      <p className="text-xs text-red-600 mt-1 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {fieldErrors.bio || getFieldError('bio')}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-gray-900">{profile?.profile?.bio || 'No bio provided'}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Professional Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <Award className="h-5 w-5 text-green-600 mr-2" />
                Professional Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-semibold">Years of Experience</Label>
                  {isEditing ? (
                    <Input
                      type="number"
                      min="0"
                      value={formData.years_of_experience}
                      onChange={(e) => setFormData(prev => ({ ...prev, years_of_experience: parseInt(e.target.value) || 0 }))}
                    />
                  ) : (
                    <p className="text-sm text-gray-900 font-medium">{profile?.profile?.years_of_experience || 0} years</p>
                  )}
                </div>

                <div>
                  <Label className="text-xs font-semibold">Highest Education</Label>
                  {isEditing ? (
                    <Select
                      value={formData.highest_education}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, highest_education: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select education level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bachelor">Bachelor&apos;s Degree</SelectItem>
                        <SelectItem value="master">Master&apos;s Degree</SelectItem>
                        <SelectItem value="phd">PhD</SelectItem>
                        <SelectItem value="professional">Professional Certification</SelectItem>
                        <SelectItem value="self_taught">Self-Taught</SelectItem>
                      </SelectContent>
                    </Select>
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
                <Label className="text-xs font-semibold">Specializations</Label>
                {isEditing ? (
                  <>
                    <Textarea
                      value={formData.specializations}
                      onChange={(e) => handleInputChange('specializations', e.target.value)}
                      rows={2}
                      className={fieldErrors.specializations || getFieldError('specializations') ? 'border-red-500 bg-red-50' : ''}
                      placeholder="e.g., Web Development, Machine Learning, Data Science"
                    />
                    {(fieldErrors.specializations || getFieldError('specializations')) && (
                      <p className="text-xs text-red-600 mt-1 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {fieldErrors.specializations || getFieldError('specializations')}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-gray-900">{profile?.profile?.specializations || 'Not provided'}</p>
                )}
              </div>

              <div className="mt-4">
                <Label className="text-xs font-semibold">Technologies</Label>
                {isEditing ? (
                  <>
                    <Textarea
                      value={formData.technologies}
                      onChange={(e) => handleInputChange('technologies', e.target.value)}
                      rows={2}
                      className={fieldErrors.technologies || getFieldError('technologies') ? 'border-red-500 bg-red-50' : ''}
                      placeholder="e.g., JavaScript, Python, React, Node.js"
                    />
                    {(fieldErrors.technologies || getFieldError('technologies')) && (
                      <p className="text-xs text-red-600 mt-1 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {fieldErrors.technologies || getFieldError('technologies')}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-gray-900">{profile?.profile?.technologies || 'Not provided'}</p>
                )}
              </div>

              <div className="mt-4">
                <Label className="text-xs font-semibold">Certifications</Label>
                {isEditing ? (
                  <>
                    <Textarea
                      value={formData.certifications}
                      onChange={(e) => handleInputChange('certifications', e.target.value)}
                      rows={2}
                      className={fieldErrors.certifications || getFieldError('certifications') ? 'border-red-500 bg-red-50' : ''}
                      placeholder="List your professional certifications"
                    />
                    {(fieldErrors.certifications || getFieldError('certifications')) && (
                      <p className="text-xs text-red-600 mt-1 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {fieldErrors.certifications || getFieldError('certifications')}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-gray-900">{profile?.profile?.certifications || 'Not provided'}</p>
                )}
              </div>

              <div className="mt-4">
                <Label className="text-xs font-semibold">Languages Spoken</Label>
                {isEditing ? (
                  <Input
                    type="text"
                    value={formData.languages_spoken}
                    onChange={(e) => setFormData(prev => ({ ...prev, languages_spoken: e.target.value }))}
                    placeholder="e.g., English, Spanish, French"
                  />
                ) : (
                  <p className="text-sm text-gray-900">{profile?.profile?.languages_spoken || 'Not provided'}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Stats */}
        <div className="space-y-4">
          {/* Social Links */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <Mail className="h-5 w-5 text-purple-600 mr-2" />
                Social Links
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label className="text-xs font-semibold">LinkedIn Profile</Label>
                {isEditing ? (
                  <Input
                    type="url"
                    value={formData.linkedin_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, linkedin_url: e.target.value }))}
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                ) : (
                  <p className="text-sm text-gray-900 font-medium truncate">{profile?.profile?.linkedin_url || 'Not provided'}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Account Information</CardTitle>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Change Password Modal */}
      <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Update Your Password</DialogTitle>
          </DialogHeader>
          <ChangePasswordForm
            onSuccess={() => {
              setTimeout(() => {
                setShowPasswordModal(false);
              }, 2000);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
