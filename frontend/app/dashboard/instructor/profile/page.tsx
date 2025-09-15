"use client";

import { useState, useEffect } from 'react';
import { getCurrentUser } from '@/lib/auth';
import { User, Save, Camera, Mail, Phone, MapPin, Calendar, Award, BookOpen, Users, Clock } from 'lucide-react';

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  role: string;
  date_joined: string;
  last_login: string;
  is_active: boolean;
  avatar?: string;
  phone?: string;
  bio?: string;
  location?: string;
  website?: string;
  linkedin?: string;
  twitter?: string;
  github?: string;
  expertise_areas?: string[];
  years_experience?: number;
  education?: string;
  certifications?: string[];
}

export default function InstructorProfilePage() {
  const [user, setUser] = useState(getCurrentUser());
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    bio: '',
    location: '',
    website: '',
    linkedin: '',
    twitter: '',
    github: '',
    expertise_areas: [] as string[],
    years_experience: 0,
    education: '',
    certifications: [] as string[],
  });

  const [newExpertise, setNewExpertise] = useState('');
  const [newCertification, setNewCertification] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // For now, use mock data since we don't have a profile API yet
      const mockProfile: UserProfile = {
        id: user?.id || '1',
        full_name: user?.full_name || 'John Doe',
        email: user?.email || 'john@example.com',
        role: 'knowledge_partner_instructor',
        date_joined: '2024-01-15',
        last_login: '2024-09-15',
        is_active: true,
        avatar: user?.avatar,
        phone: '+1 (555) 123-4567',
        bio: 'Experienced software engineer and educator with 8+ years of experience in full-stack development. Passionate about teaching and helping students learn modern technologies.',
        location: 'San Francisco, CA',
        website: 'https://johndoe.dev',
        linkedin: 'https://linkedin.com/in/johndoe',
        twitter: 'https://twitter.com/johndoe',
        github: 'https://github.com/johndoe',
        expertise_areas: ['JavaScript', 'React', 'Node.js', 'Python', 'Machine Learning'],
        years_experience: 8,
        education: 'MS Computer Science, Stanford University',
        certifications: ['AWS Certified Developer', 'Google Cloud Professional', 'React Certified Developer'],
      };

      setProfile(mockProfile);
      setFormData({
        full_name: mockProfile.full_name,
        email: mockProfile.email,
        phone: mockProfile.phone || '',
        bio: mockProfile.bio || '',
        location: mockProfile.location || '',
        website: mockProfile.website || '',
        linkedin: mockProfile.linkedin || '',
        twitter: mockProfile.twitter || '',
        github: mockProfile.github || '',
        expertise_areas: mockProfile.expertise_areas || [],
        years_experience: mockProfile.years_experience || 0,
        education: mockProfile.education || '',
        certifications: mockProfile.certifications || [],
      });
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      
      // TODO: Implement actual API call to update profile
      console.log('Saving profile:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsEditing(false);
      // Update the profile state with new data
      if (profile) {
        setProfile({ ...profile, ...formData });
      }
    } catch (err) {
      console.error('Error saving profile:', err);
      setError('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        full_name: profile.full_name,
        email: profile.email,
        phone: profile.phone || '',
        bio: profile.bio || '',
        location: profile.location || '',
        website: profile.website || '',
        linkedin: profile.linkedin || '',
        twitter: profile.twitter || '',
        github: profile.github || '',
        expertise_areas: profile.expertise_areas || [],
        years_experience: profile.years_experience || 0,
        education: profile.education || '',
        certifications: profile.certifications || [],
      });
    }
    setIsEditing(false);
  };

  const addExpertise = () => {
    if (newExpertise.trim() && !formData.expertise_areas.includes(newExpertise.trim())) {
      setFormData(prev => ({
        ...prev,
        expertise_areas: [...prev.expertise_areas, newExpertise.trim()]
      }));
      setNewExpertise('');
    }
  };

  const removeExpertise = (index: number) => {
    setFormData(prev => ({
      ...prev,
      expertise_areas: prev.expertise_areas.filter((_, i) => i !== index)
    }));
  };

  const addCertification = () => {
    if (newCertification.trim() && !formData.certifications.includes(newCertification.trim())) {
      setFormData(prev => ({
        ...prev,
        certifications: [...prev.certifications, newCertification.trim()]
      }));
      setNewCertification('');
    }
  };

  const removeCertification = (index: number) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }));
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
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                ) : (
                  <p className="text-gray-900 font-medium">{profile.full_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                ) : (
                  <p className="text-gray-900 font-medium">{profile.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="+1 (555) 123-4567"
                  />
                ) : (
                  <p className="text-gray-900 font-medium">{profile.phone || 'Not provided'}</p>
                )}
              </div>

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
                    placeholder="City, State"
                  />
                ) : (
                  <p className="text-gray-900 font-medium">{profile.location || 'Not provided'}</p>
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
                <p className="text-gray-900">{profile.bio || 'No bio provided'}</p>
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
                    value={formData.years_experience}
                    onChange={(e) => setFormData(prev => ({ ...prev, years_experience: parseInt(e.target.value) || 0 }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                ) : (
                  <p className="text-gray-900 font-medium">{profile.years_experience} years</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Education
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.education}
                    onChange={(e) => setFormData(prev => ({ ...prev, education: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Degree, University"
                  />
                ) : (
                  <p className="text-gray-900 font-medium">{profile.education || 'Not provided'}</p>
                )}
              </div>
            </div>

            {/* Expertise Areas */}
            <div className="mt-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Expertise Areas
              </label>
              {isEditing ? (
                <div className="space-y-3">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newExpertise}
                      onChange={(e) => setNewExpertise(e.target.value)}
                      placeholder="Add expertise area..."
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      onKeyPress={(e) => e.key === 'Enter' && addExpertise()}
                    />
                    <button
                      type="button"
                      onClick={addExpertise}
                      className="px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.expertise_areas.map((area, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {area}
                        <button
                          type="button"
                          onClick={() => removeExpertise(index)}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {profile.expertise_areas.map((area, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Certifications */}
            <div className="mt-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Certifications
              </label>
              {isEditing ? (
                <div className="space-y-3">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newCertification}
                      onChange={(e) => setNewCertification(e.target.value)}
                      placeholder="Add certification..."
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      onKeyPress={(e) => e.key === 'Enter' && addCertification()}
                    />
                    <button
                      type="button"
                      onClick={addCertification}
                      className="px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.certifications.map((cert, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                      >
                        {cert}
                        <button
                          type="button"
                          onClick={() => removeCertification(index)}
                          className="ml-2 text-green-600 hover:text-green-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {profile.certifications.map((cert, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                    >
                      {cert}
                    </span>
                  ))}
                </div>
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
                  Website
                </label>
                {isEditing ? (
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="https://yourwebsite.com"
                  />
                ) : (
                  <p className="text-gray-900 font-medium">{profile.website || 'Not provided'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  LinkedIn
                </label>
                {isEditing ? (
                  <input
                    type="url"
                    value={formData.linkedin}
                    onChange={(e) => setFormData(prev => ({ ...prev, linkedin: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                ) : (
                  <p className="text-gray-900 font-medium">{profile.linkedin || 'Not provided'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Twitter
                </label>
                {isEditing ? (
                  <input
                    type="url"
                    value={formData.twitter}
                    onChange={(e) => setFormData(prev => ({ ...prev, twitter: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="https://twitter.com/yourhandle"
                  />
                ) : (
                  <p className="text-gray-900 font-medium">{profile.twitter || 'Not provided'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  GitHub
                </label>
                {isEditing ? (
                  <input
                    type="url"
                    value={formData.github}
                    onChange={(e) => setFormData(prev => ({ ...prev, github: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="https://github.com/yourusername"
                  />
                ) : (
                  <p className="text-gray-900 font-medium">{profile.github || 'Not provided'}</p>
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
                  <p className="font-semibold text-gray-900">{new Date(profile.date_joined).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Last login</p>
                  <p className="font-semibold text-gray-900">{new Date(profile.last_login).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${profile.is_active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="font-semibold text-gray-900">{profile.is_active ? 'Active' : 'Inactive'}</p>
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
