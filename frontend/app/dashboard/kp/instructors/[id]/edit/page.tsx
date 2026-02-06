"use client";

import { useState, useEffect } from 'react';
import { ArrowLeft, Save, User, Briefcase, AlertCircle } from 'lucide-react';
import { userApi } from '@/features/users/services/user';
import type { InstructorDetail, InstructorUpdateData } from '@/shared/types';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load instructor details');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.user_email) {
      newErrors.user_email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.user_email)) {
      newErrors.user_email = 'Invalid email format';
    }

    if (!formData.user_full_name) {
      newErrors.user_full_name = 'Full name is required';
    } else if (formData.user_full_name.length < 2) {
      newErrors.user_full_name = 'Full name must be at least 2 characters';
    }

    if (!formData.bio) {
      newErrors.bio = 'Bio is required';
    } else if (formData.bio.length < 10) {
      newErrors.bio = 'Bio must be at least 10 characters';
    }

    if (!formData.title) {
      newErrors.title = 'Job title is required';
    }

    if (!formData.specializations) {
      newErrors.specializations = 'Specializations are required';
    }

    if (!formData.technologies) {
      newErrors.technologies = 'Technologies are required';
    }

    if (!formData.languages_spoken) {
      newErrors.languages_spoken = 'Languages spoken is required';
    }

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
      };

      await userApi.instructors.update(instructorId, updateData);
      router.push(`/dashboard/kp/instructors/${instructorId}`);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to update instructor');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof FormData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <Card>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="rounded-xl">
            <Link href="/dashboard/kp/instructors">
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Edit Instructor</h1>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="rounded-xl">
          <Link href={`/dashboard/kp/instructors/${instructorId}`}>
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Instructor</h1>
          <p className="text-gray-600 mt-1">Update instructor profile and information</p>
        </div>
      </div>

      {saveError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{saveError}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card>
          <CardHeader>
            <div className="flex items-center">
              <User className="h-6 w-6 text-blue-600 mr-3" />
              <CardTitle>Account Information</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="user_full_name">Full Name</Label>
                <Input
                  id="user_full_name"
                  type="text"
                  value={formData.user_full_name}
                  onChange={(e) => handleChange('user_full_name', e.target.value)}
                  className={errors.user_full_name ? 'border-red-500' : ''}
                  placeholder="Enter full name"
                />
                {errors.user_full_name && <p className="text-red-600 text-sm">{errors.user_full_name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="user_email">Email Address</Label>
                <Input
                  id="user_email"
                  type="email"
                  value={formData.user_email}
                  onChange={(e) => handleChange('user_email', e.target.value)}
                  className={errors.user_email ? 'border-red-500' : ''}
                  placeholder="instructor@example.com"
                />
                {errors.user_email && <p className="text-red-600 text-sm">{errors.user_email}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center">
              <Briefcase className="h-6 w-6 text-green-600 mr-3" />
              <CardTitle>Professional Information</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="bio">About</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleChange('bio', e.target.value)}
                rows={4}
                className={errors.bio ? 'border-red-500' : ''}
                placeholder="Describe professional background and expertise..."
              />
              {errors.bio && <p className="text-red-600 text-sm">{errors.bio}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">Job Title</Label>
                <Input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  className={errors.title ? 'border-red-500' : ''}
                  placeholder="e.g., Senior Developer, Data Scientist"
                />
                {errors.title && <p className="text-red-600 text-sm">{errors.title}</p>}
              </div>

              <div className="space-y-2">
                <Label>Education</Label>
                <Select
                  value={formData.highest_education}
                  onValueChange={(value) => handleChange('highest_education', value as 'bachelor' | 'master' | 'phd' | 'self_taught')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select education" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bachelor">Bachelor's Degree</SelectItem>
                    <SelectItem value="master">Master's Degree</SelectItem>
                    <SelectItem value="phd">PhD</SelectItem>
                    <SelectItem value="self_taught">Self-Taught</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="years_of_experience">Experience (Years)</Label>
                <Input
                  id="years_of_experience"
                  type="number"
                  min="0"
                  value={formData.years_of_experience}
                  onChange={(e) => handleChange('years_of_experience', parseInt(e.target.value) || 0)}
                  className={errors.years_of_experience ? 'border-red-500' : ''}
                  placeholder="Years of experience"
                />
                {errors.years_of_experience && <p className="text-red-600 text-sm">{errors.years_of_experience}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="languages_spoken">Languages</Label>
                <Input
                  id="languages_spoken"
                  type="text"
                  value={formData.languages_spoken}
                  onChange={(e) => handleChange('languages_spoken', e.target.value)}
                  className={errors.languages_spoken ? 'border-red-500' : ''}
                  placeholder="e.g., English, Spanish, French"
                />
                {errors.languages_spoken && <p className="text-red-600 text-sm">{errors.languages_spoken}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="specializations">Specializations</Label>
                <Input
                  id="specializations"
                  type="text"
                  value={formData.specializations}
                  onChange={(e) => handleChange('specializations', e.target.value)}
                  className={errors.specializations ? 'border-red-500' : ''}
                  placeholder="e.g., Web Development, Machine Learning"
                />
                {errors.specializations && <p className="text-red-600 text-sm">{errors.specializations}</p>}
                <p className="text-gray-500 text-sm">Separate with commas</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="technologies">Technologies</Label>
                <Input
                  id="technologies"
                  type="text"
                  value={formData.technologies}
                  onChange={(e) => handleChange('technologies', e.target.value)}
                  className={errors.technologies ? 'border-red-500' : ''}
                  placeholder="e.g., React, Python, AWS"
                />
                {errors.technologies && <p className="text-red-600 text-sm">{errors.technologies}</p>}
                <p className="text-gray-500 text-sm">Separate with commas</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="certifications">Certifications</Label>
                <Textarea
                  id="certifications"
                  value={formData.certifications}
                  onChange={(e) => handleChange('certifications', e.target.value)}
                  rows={3}
                  placeholder="List relevant certifications..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedin_url">LinkedIn URL</Label>
                <Input
                  id="linkedin_url"
                  type="url"
                  value={formData.linkedin_url}
                  onChange={(e) => handleChange('linkedin_url', e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Availability</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_available"
                checked={formData.is_available}
                onChange={(e) => handleChange('is_available', e.target.checked)}
                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <Label htmlFor="is_available" className="ml-3">
                Currently available for new assignments
              </Label>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/kp/instructors/${instructorId}`}>Cancel</Link>
          </Button>
          <Button
            type="submit"
            disabled={saving}
            className="flex-1"
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
          </Button>
        </div>
      </form>
    </div>
  );
}
