"use client";

import { useState, useEffect } from 'react';
import {
  User,
  Building,
  Upload,
  Save,
  Edit3,
  Calendar,
  Award,
  Lock,
  AlertCircle
} from 'lucide-react';
import { authenticatedFetch, isAuthenticated, logout, safeJsonParse } from '@/lib/auth/token';
import ChangePasswordForm from '@/components/dashboard/ChangePasswordForm';
import { useContentModeration } from '@/lib/hooks/useContentModeration';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface KPProfile {
  id: string;
  name: string;
  type: string;
  description: string;
  location: string;
  website: string;
  kp_admin_name: string;
  kp_admin_email: string;
  kp_admin_phone: string;
  logo: string;
  linkedin_url: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

interface KPProfileUpdateData {
  name?: string;
  type?: string;
  description?: string;
  location?: string;
  website?: string;
  kp_admin_name?: string;
  kp_admin_email?: string;
  kp_admin_phone?: string;
  linkedin_url?: string;
}

const KP_TYPE_OPTIONS = [
  { value: 'company', label: 'Company' },
  { value: 'organization', label: 'Organization' },
  { value: 'university', label: 'University' },
  { value: 'institute', label: 'Institute' },
  { value: 'bootcamp', label: 'Bootcamp' },
  { value: 'other', label: 'Other' },
];

export default function KPProfilePage() {
  const [profile, setProfile] = useState<KPProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});
  const [isEditing, setIsEditing] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    type: 'company',
    description: '',
    location: '',
    website: '',
    kp_admin_name: '',
    kp_admin_email: '',
    kp_admin_phone: '',
    linkedin_url: '',
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

    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        if (userData.role !== 'knowledge_partner') {
          setError('Access denied. This page is only available for Knowledge Partner accounts.');
          return;
        }
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }

    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await authenticatedFetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/admin/profile/`, {
        method: 'GET',
      });

      const data = await response.json();
      setProfile(data);
      setFormData({
        name: data.name || '',
        type: data.type || 'company',
        description: data.description || '',
        location: data.location || '',
        website: data.website || '',
        kp_admin_name: data.kp_admin_name || '',
        kp_admin_email: data.kp_admin_email || '',
        kp_admin_phone: data.kp_admin_phone || '',
        linkedin_url: data.linkedin_url || '',
      });
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch profile');
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

      const updateData: KPProfileUpdateData = {};

      if (formData.name && formData.name.trim()) updateData.name = formData.name.trim();
      if (formData.type) updateData.type = formData.type;
      if (formData.description && formData.description.trim()) updateData.description = formData.description.trim();
      if (formData.location && formData.location.trim()) updateData.location = formData.location.trim();
      if (formData.website && formData.website.trim()) updateData.website = formData.website.trim();
      if (formData.kp_admin_name && formData.kp_admin_name.trim()) updateData.kp_admin_name = formData.kp_admin_name.trim();
      if (formData.kp_admin_email && formData.kp_admin_email.trim()) updateData.kp_admin_email = formData.kp_admin_email.trim();
      if (formData.kp_admin_phone && formData.kp_admin_phone.trim()) updateData.kp_admin_phone = formData.kp_admin_phone.trim();
      if (formData.linkedin_url && formData.linkedin_url.trim()) updateData.linkedin_url = formData.linkedin_url.trim();

      const response = await authenticatedFetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/admin/profile/`, {
        method: 'PATCH',
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const fieldErrorsFound = Object.entries(errorData)
          .filter(([, value]) => Array.isArray(value) && value.length > 0)
          .map(([field, errors]) => `${field}: ${(errors as string[]).join(', ')}`)
          .join('; ');

        if (fieldErrorsFound) {
          throw new Error(fieldErrorsFound);
        }
        throw new Error(errorData.error || errorData.detail || 'Failed to update profile');
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
      setFormData({
        name: profile.name || '',
        type: profile.type || 'company',
        description: profile.description || '',
        location: profile.location || '',
        website: profile.website || '',
        kp_admin_name: profile.kp_admin_name || '',
        kp_admin_email: profile.kp_admin_email || '',
        kp_admin_phone: profile.kp_admin_phone || '',
        linkedin_url: profile.linkedin_url || '',
      });
    }
    setIsEditing(false);
    clearModerationErrors();
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setLogoUploading(true);
      setError(null);

      const formData = new FormData();
      formData.append('logo', file);

      const response = await authenticatedFetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/admin/profile/upload-logo/`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = 'Failed to upload logo';
        try {
          const errorData = await safeJsonParse(response) as { error?: string };
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = `Failed to upload logo: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      await fetchProfile();
      alert('Logo uploaded successfully!');
    } catch (err) {
      console.error('Error uploading logo:', err);
      let errorMessage = 'Failed to upload logo';
      if (err instanceof Error) {
        errorMessage = err.message;
        if (errorMessage.includes('KP Profile not found')) {
          errorMessage = 'Profile not found. Please ensure you are logged in with a Knowledge Partner Admin account.';
        } else if (errorMessage.includes('Invalid file type')) {
          errorMessage = 'Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image.';
        } else if (errorMessage.includes('File too large')) {
          errorMessage = 'File is too large. Please upload an image smaller than 5MB.';
        } else if (errorMessage.includes('No logo file provided')) {
          errorMessage = 'Please select an image file to upload.';
        }
      }
      setError(errorMessage);
    } finally {
      setLogoUploading(false);
    }
  };

  const handleRemoveLogo = async () => {
    try {
      setError(null);

      const response = await authenticatedFetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/admin/profile/remove-logo/`, {
        method: 'POST',
      });

      if (!response.ok) {
        let errorMessage = 'Failed to remove logo';
        try {
          const errorData = await safeJsonParse(response) as { error?: string };
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = `Failed to remove logo: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      if (profile) {
        setProfile({ ...profile, logo: '' });
      }
      alert('Logo removed successfully!');
    } catch (err) {
      console.error('Error removing logo:', err);
      setError(err instanceof Error ? err.message : 'Failed to remove logo');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-48 mb-4" />
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-32 w-32 mx-auto rounded-lg mb-4" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <Alert variant="destructive">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle>Access Error</AlertTitle>
          <AlertDescription>
            <p className="mb-4">{error}</p>
            <div className="flex space-x-3">
              <Button onClick={fetchProfile}>Retry</Button>
              <Button variant="outline" onClick={logout}>Logout</Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Knowledge Partner Profile</h1>
          <p className="text-gray-600 text-sm">Manage your Knowledge Partner details</p>
        </div>
        <div className="flex items-center space-x-3">
          {!isEditing ? (
            <>
              <Button
                variant="secondary"
                onClick={() => setShowPasswordModal(true)}
              >
                <Lock className="h-4 w-4 mr-2" />
                Update Password
              </Button>
              <Button onClick={() => setIsEditing(true)}>
                <Edit3 className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving || hasModerationErrors}
                variant={hasModerationErrors ? 'destructive' : 'default'}
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : hasModerationErrors ? 'Fix Content Issues' : 'Save Changes'}
              </Button>
            </div>
          )}
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Building className="h-5 w-5 text-white" />
                </div>
                <CardTitle>Knowledge Partner Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Knowledge Partner Name</Label>
                  {isEditing ? (
                    <>
                      <Input
                        value={formData.name}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, name: e.target.value }));
                          if (fieldErrors.name) setFieldErrors(prev => ({ ...prev, name: '' }));
                          checkField('name', e.target.value);
                        }}
                        className={fieldErrors.name || getFieldError('name') ? 'border-red-500' : ''}
                        placeholder="Enter Knowledge Partner name"
                      />
                      {(fieldErrors.name || getFieldError('name')) && (
                        <p className="text-xs text-red-600 flex items-center">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          {fieldErrors.name || getFieldError('name')}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-gray-900 font-medium">{profile?.name || 'Not provided'}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Knowledge Partner Type</Label>
                  {isEditing ? (
                    <Select
                      value={formData.type}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {KP_TYPE_OPTIONS.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-gray-900 font-medium">
                      {KP_TYPE_OPTIONS.find(opt => opt.value === profile?.type)?.label || 'Not provided'}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                {isEditing ? (
                  <>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, description: e.target.value }));
                        if (fieldErrors.description) setFieldErrors(prev => ({ ...prev, description: '' }));
                        checkField('description', e.target.value);
                      }}
                      rows={4}
                      className={fieldErrors.description || getFieldError('description') ? 'border-red-500' : ''}
                      placeholder="Describe your knowledge partner..."
                    />
                    {(fieldErrors.description || getFieldError('description')) && (
                      <p className="text-xs text-red-600 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {fieldErrors.description || getFieldError('description')}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-gray-900">{profile?.description || 'No description provided'}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Location</Label>
                  {isEditing ? (
                    <>
                      <Input
                        value={formData.location}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, location: e.target.value }));
                          if (fieldErrors.location) setFieldErrors(prev => ({ ...prev, location: '' }));
                          checkField('location', e.target.value);
                        }}
                        className={fieldErrors.location || getFieldError('location') ? 'border-red-500' : ''}
                        placeholder="City, State, Country"
                      />
                      {(fieldErrors.location || getFieldError('location')) && (
                        <p className="text-xs text-red-600 flex items-center">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          {fieldErrors.location || getFieldError('location')}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-gray-900 font-medium">{profile?.location || 'Not provided'}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Website</Label>
                  {isEditing ? (
                    <Input
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                      placeholder="https://example.com"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">
                      {profile?.website ? (
                        <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                          {profile.website}
                        </a>
                      ) : 'Not provided'}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
                <CardTitle>Admin Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Admin Name</Label>
                  {isEditing ? (
                    <>
                      <Input
                        value={formData.kp_admin_name}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, kp_admin_name: e.target.value }));
                          if (fieldErrors.kp_admin_name) setFieldErrors(prev => ({ ...prev, kp_admin_name: '' }));
                          checkField('kp_admin_name', e.target.value);
                        }}
                        className={fieldErrors.kp_admin_name || getFieldError('kp_admin_name') ? 'border-red-500' : ''}
                        placeholder="Enter admin name"
                      />
                      {(fieldErrors.kp_admin_name || getFieldError('kp_admin_name')) && (
                        <p className="text-xs text-red-600 flex items-center">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          {fieldErrors.kp_admin_name || getFieldError('kp_admin_name')}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-gray-900 font-medium">{profile?.kp_admin_name || 'Not provided'}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Admin Email</Label>
                  {isEditing ? (
                    <Input
                      type="email"
                      value={formData.kp_admin_email}
                      onChange={(e) => setFormData(prev => ({ ...prev, kp_admin_email: e.target.value }))}
                      placeholder="admin@example.com"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{profile?.kp_admin_email || 'Not provided'}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Admin Phone</Label>
                  {isEditing ? (
                    <Input
                      type="tel"
                      value={formData.kp_admin_phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, kp_admin_phone: e.target.value }))}
                      placeholder="+1 (555) 123-4567"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{profile?.kp_admin_phone || 'Not provided'}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>LinkedIn URL</Label>
                  {isEditing ? (
                    <Input
                      type="url"
                      value={formData.linkedin_url}
                      onChange={(e) => setFormData(prev => ({ ...prev, linkedin_url: e.target.value }))}
                      placeholder="https://linkedin.com/company/example"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">
                      {profile?.linkedin_url ? (
                        <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                          {profile.linkedin_url}
                        </a>
                      ) : 'Not provided'}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Upload className="h-5 w-5 text-white" />
                </div>
                <CardTitle>Knowledge Partner Logo</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                {profile?.logo ? (
                  <div className="space-y-4">
                    <div className="w-32 h-32 mx-auto rounded-lg overflow-hidden border-2 border-gray-200">
                      <img
                        src={profile.logo.startsWith('http') ? profile.logo : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${profile.logo}`}
                        alt="Knowledge Partner Logo"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="space-y-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        disabled={logoUploading}
                        className="hidden"
                        id="logo-upload"
                      />
                      <label htmlFor="logo-upload">
                        <Button asChild className="w-full cursor-pointer" disabled={logoUploading}>
                          <span>{logoUploading ? 'Uploading...' : 'Change Logo'}</span>
                        </Button>
                      </label>
                      <Button
                        variant="destructive"
                        className="w-full"
                        onClick={handleRemoveLogo}
                      >
                        Remove Logo
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="w-32 h-32 mx-auto rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                      <Upload className="h-8 w-8 text-gray-400" />
                    </div>
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        disabled={logoUploading}
                        className="hidden"
                        id="logo-upload"
                      />
                      <label htmlFor="logo-upload">
                        <Button asChild className="w-full cursor-pointer" disabled={logoUploading}>
                          <span>{logoUploading ? 'Uploading...' : 'Upload Logo'}</span>
                        </Button>
                      </label>
                      <p className="text-xs text-gray-500 mt-2">
                        PNG, JPG, GIF up to 5MB
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center">
                  <Award className="h-5 w-5 text-white" />
                </div>
                <CardTitle>Status</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Knowledge Partner Status</span>
                <Badge className={profile?.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {profile?.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Verification Status</span>
                <Badge className={profile?.is_verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                  {profile?.is_verified ? 'Verified' : 'Pending'}
                </Badge>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <Calendar className="h-4 w-4 mr-2" />
                  Created
                </div>
                <p className="text-sm text-gray-900">
                  {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Unknown'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
        <DialogContent className="sm:max-w-lg">
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
