"use client";

import { useState, useEffect } from 'react';
import { 
  User, 
  Building, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Linkedin, 
  Upload, 
  X, 
  Save, 
  Edit3,
  CheckCircle,
  AlertCircle,
  Calendar,
  Users,
  BookOpen,
  Award
} from 'lucide-react';
import { authenticatedFetch, isAuthenticated, logout, safeJsonParse } from '@/lib/auth';

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

interface ProfileStats {
  organization_name: string;
  organization_type: string;
  is_verified: boolean;
  is_active: boolean;
  total_courses: number;
  approved_courses: number;
  pending_courses: number;
  total_instructors: number;
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
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  useEffect(() => {
    // Check if user is authenticated before making API calls
    if (!isAuthenticated()) {
      logout();
      return;
    }
    
    // Check if user has the correct role
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
    fetchStats();
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

  const fetchStats = async () => {
    try {
      const response = await authenticatedFetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/admin/profile/stats/`, {
        method: 'GET',
      });

      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      
      // Only send fields that have values or have been changed
      const updateData: KPProfileUpdateData = {};
      
      // Only include fields that have actual values
      if (formData.name && formData.name.trim()) updateData.name = formData.name.trim();
      if (formData.type) updateData.type = formData.type;
      if (formData.description && formData.description.trim()) updateData.description = formData.description.trim();
      if (formData.location && formData.location.trim()) updateData.location = formData.location.trim();
      if (formData.website && formData.website.trim()) updateData.website = formData.website.trim();
      if (formData.kp_admin_name && formData.kp_admin_name.trim()) updateData.kp_admin_name = formData.kp_admin_name.trim();
      if (formData.kp_admin_email && formData.kp_admin_email.trim()) updateData.kp_admin_email = formData.kp_admin_email.trim();
      if (formData.kp_admin_phone && formData.kp_admin_phone.trim()) updateData.kp_admin_phone = formData.kp_admin_phone.trim();
      if (formData.linkedin_url && formData.linkedin_url.trim()) updateData.linkedin_url = formData.linkedin_url.trim();
      
      console.log('Sending only non-empty fields:', updateData);
      
      const response = await authenticatedFetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/admin/profile/`, {
        method: 'PATCH',
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.detail || 'Failed to update profile');
      }

      const updatedProfile = await response.json();
      setProfile(updatedProfile);
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
          // If response is not JSON, use status text
          errorMessage = `Failed to upload logo: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const result = await safeJsonParse(response) as { logo_url?: string };
      if (profile) {
        setProfile({ ...profile, logo: result.logo_url || '' });
      }
      alert('Logo uploaded successfully!');
    } catch (err) {
      console.error('Error uploading logo:', err);
      let errorMessage = 'Failed to upload logo';
      if (err instanceof Error) {
        errorMessage = err.message;
        // Check for specific error types and provide better guidance
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
          // If response is not JSON, use status text
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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center mb-3">
            <AlertCircle className="h-6 w-6 text-red-500 mr-2" />
            <h2 className="text-lg font-semibold text-red-700">Access Error</h2>
          </div>
          <p className="text-red-700 mb-4">{error}</p>
          
          {error.includes('Access denied') && (
            <div className="mb-4 text-sm text-red-600">
              <strong>Available KP Admin accounts:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li><strong>adfdfm@gmail.com</strong> (hanuman organization)</li>
                <li><strong>rakeshganji99@gmail.com</strong> (Ganji Rocky&apos;s Organization)</li>
                <li><strong>amaz@gmail.com</strong> (Empty Fields Test 2)</li>
              </ul>
              <p className="mt-3">Password for all accounts: <code className="bg-red-100 px-2 py-1 rounded">rockyg07</code></p>
              <p className="mt-2 text-xs">Please logout and login with one of these accounts to access KP features.</p>
            </div>
          )}
          
          <div className="flex space-x-3">
            <button
              onClick={fetchProfile}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Retry
            </button>
            <button
              onClick={logout}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Organization Profile</h1>
          <p className="text-gray-600 text-sm">Manage your Knowledge Partner organization details</p>
        </div>
        <div className="flex items-center space-x-3">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Edit Profile
            </button>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-red-700 font-medium">Error</p>
          </div>
          <p className="text-red-700 mt-2">{error}</p>
          {error.includes('Access denied') && (
            <div className="mt-3 text-sm text-red-600">
              <p>Please contact your system administrator for access credentials.</p>
            </div>
          )}
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Courses</p>
                <p className="text-2xl font-bold text-blue-600">{stats.total_courses}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved Courses</p>
                <p className="text-2xl font-bold text-green-600">{stats.approved_courses}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Courses</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending_courses}</p>
              </div>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Award className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Instructors</p>
                <p className="text-2xl font-bold text-purple-600">{stats.total_instructors}</p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Organization Information */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Building className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Organization Information</h2>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Organization Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter organization name"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{profile?.name || 'Not provided'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Organization Type
                  </label>
                  {isEditing ? (
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    >
                      {KP_TYPE_OPTIONS.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-gray-900 font-medium">
                      {KP_TYPE_OPTIONS.find(opt => opt.value === profile?.type)?.label || 'Not provided'}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                {isEditing ? (
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Describe your organization..."
                  />
                ) : (
                  <p className="text-gray-900">{profile?.description || 'No description provided'}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Location
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="City, State, Country"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{profile?.location || 'Not provided'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Website
                  </label>
                  {isEditing ? (
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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
            </div>
          </div>

          {/* Admin Information */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Admin Information</h2>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Admin Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.kp_admin_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, kp_admin_name: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter admin name"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{profile?.kp_admin_name || 'Not provided'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Admin Email
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={formData.kp_admin_email}
                      onChange={(e) => setFormData(prev => ({ ...prev, kp_admin_email: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="admin@example.com"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{profile?.kp_admin_email || 'Not provided'}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Admin Phone
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={formData.kp_admin_phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, kp_admin_phone: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="+1 (555) 123-4567"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{profile?.kp_admin_phone || 'Not provided'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    LinkedIn URL
                  </label>
                  {isEditing ? (
                    <input
                      type="url"
                      value={formData.linkedin_url}
                      onChange={(e) => setFormData(prev => ({ ...prev, linkedin_url: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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
            </div>
          </div>
        </div>

        {/* Logo and Status */}
        <div className="space-y-6">
          {/* Logo Section */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Upload className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Organization Logo</h2>
            </div>

            <div className="text-center">
              {profile?.logo ? (
                <div className="space-y-4">
                  <div className="w-32 h-32 mx-auto rounded-lg overflow-hidden border-2 border-gray-200">
                    <img
                      src={profile.logo.startsWith('http') ? profile.logo : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${profile.logo}`}
                      alt="Organization Logo"
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
                    <label
                      htmlFor="logo-upload"
                      className="block w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {logoUploading ? 'Uploading...' : 'Change Logo'}
                    </label>
                    <button
                      onClick={handleRemoveLogo}
                      className="block w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Remove Logo
                    </button>
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
                    <label
                      htmlFor="logo-upload"
                      className="block w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {logoUploading ? 'Uploading...' : 'Upload Logo'}
                    </label>
                    <p className="text-xs text-gray-500 mt-2">
                      PNG, JPG, GIF up to 5MB
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Status Section */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center">
                <Award className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Status</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Organization Status</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  profile?.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {profile?.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Verification Status</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  profile?.is_verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {profile?.is_verified ? 'Verified' : 'Pending'}
                </span>
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

              <div className="pt-2">
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <Calendar className="h-4 w-4 mr-2" />
                  Last Updated
                </div>
                <p className="text-sm text-gray-900">
                  {profile?.updated_at ? new Date(profile.updated_at).toLocaleDateString() : 'Unknown'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
