"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { instructorApi } from '@/features/courses/services/course-management';
import type { CourseCreateData } from '@/shared/types';
import { useContentModeration } from '@/lib/hooks/useContentModeration';
import { ArrowLeft, Upload, Save, Clock, BookOpen, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';

const CATEGORIES = [
  { value: '', label: 'Select Category' },
  { value: 'frontend_development', label: 'Frontend Development' },
  { value: 'backend_development', label: 'Backend Development' },
  { value: 'programming_languages', label: 'Programming Languages' },
  { value: 'ai', label: 'Artificial Intelligence' },
  { value: 'ai_tools', label: 'AI Tools' },
  { value: 'data_science', label: 'Data Science' },
  { value: 'data_analysis', label: 'Data Analysis' },
  { value: 'software_engineering', label: 'Software Engineering Essentials' },
];

const LEVELS = [
  { value: '', label: 'Select Level' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

interface FormErrors {
  [key: string]: string;
}

interface CourseFormData {
  title: string;
  description: string;
  short_description: string;
  price?: number;
  duration_weeks?: number;
  category: string;
  level: string;
  learning_outcomes: string;
  prerequisites: string;
  thumbnail?: File;
  demo_video?: File;
  max_enrollments?: number;
  is_private: boolean;
  requires_admin_enrollment: boolean;
}

export default function CreateCoursePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CourseFormData>({
    title: '',
    description: '',
    short_description: '',
    price: undefined,
    duration_weeks: undefined,
    category: '',
    level: '',
    learning_outcomes: '',
    prerequisites: '',
    max_enrollments: undefined,
    is_private: false,
    requires_admin_enrollment: false,
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  const {
    checkField,
    getFieldError,
    hasErrors: hasModerationErrors
  } = useContentModeration();

  const handleChange = (field: keyof CourseFormData, value: string | number | boolean | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }

    const textFields = ['title', 'description', 'short_description', 'learning_outcomes', 'prerequisites'];
    if (textFields.includes(field) && typeof value === 'string') {
      checkField(field, value);
    }
  };

  const handleFileChange = (field: 'thumbnail' | 'demo_video', file: File | null) => {
    if (file) {
      setFormData(prev => ({ ...prev, [field]: file }));

      if (field === 'thumbnail') {
        const reader = new FileReader();
        reader.onload = (e) => {
          setThumbnailPreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!formData.title.trim()) {
      errors.title = 'Course title is required';
    }

    if (!formData.description.trim()) {
      errors.description = 'Course description is required';
    }

    if (!formData.short_description.trim()) {
      errors.short_description = 'Short description is required';
    }

    if (!formData.category) {
      errors.category = 'Please select a category';
    }

    if (!formData.level) {
      errors.level = 'Please select a level';
    }

    if (formData.price !== undefined && formData.price < 0) {
      errors.price = 'Price cannot be negative';
    }

    if (!formData.duration_weeks || formData.duration_weeks < 1) {
      errors.duration_weeks = 'Duration must be at least 1 week';
    }

    if (formData.max_enrollments && formData.max_enrollments < 1) {
      errors.max_enrollments = 'Max enrollments must be at least 1';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const parseFieldErrors = (errorMessage: string): FormErrors => {
    const fieldErrors: FormErrors = {};
    const parts = errorMessage.split(';').map(p => p.trim());
    parts.forEach(part => {
      const match = part.match(/^(\w+):\s*(.+)$/);
      if (match) {
        const [, field, message] = match;
        fieldErrors[field.toLowerCase()] = message;
      }
    });
    return fieldErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (hasModerationErrors) {
      setError('Please fix the content issues highlighted in red before saving.');
      return;
    }

    setLoading(true);
    setError(null);
    setFormErrors({});

    try {
      const courseData: CourseCreateData = {
        ...formData,
        duration_weeks: formData.duration_weeks!,
      };
      const course = await instructorApi.courses.create(courseData);
      router.push(`/dashboard/instructor/courses/${course.slug}`);
    } catch (err: unknown) {
      console.error('Error creating course:', err);

      if (err instanceof Error) {
        const errorMessage = err.message;
        const fieldErrors = parseFieldErrors(errorMessage);

        if (Object.keys(fieldErrors).length > 0) {
          setFormErrors(fieldErrors);
          setError('Please fix the content issues highlighted below.');
        } else {
          setError(errorMessage || 'Failed to create course. Please try again.');
        }
      } else {
        setError('Failed to create course. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Compact Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/instructor/courses">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Create New Course</h1>
            <p className="text-gray-600 text-sm">Build an engaging learning experience</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Basic Information */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-blue-600" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="md:col-span-2">
                <Label htmlFor="title" className="text-xs font-semibold">Course Title *</Label>
                <Input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="e.g., Complete React Development Course"
                  className={formErrors.title || getFieldError('title') ? 'border-red-500 bg-red-50' : ''}
                />
                {(formErrors.title || getFieldError('title')) && (
                  <p className="text-red-600 text-xs mt-1 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {formErrors.title || getFieldError('title')}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="category" className="text-xs font-semibold">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => handleChange('category', value)}>
                  <SelectTrigger className={formErrors.category ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.filter(c => c.value).map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.category && (
                  <p className="text-red-600 text-xs mt-1">{formErrors.category}</p>
                )}
              </div>

              <div>
                <Label htmlFor="level" className="text-xs font-semibold">Level *</Label>
                <Select value={formData.level} onValueChange={(value) => handleChange('level', value)}>
                  <SelectTrigger className={formErrors.level ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select Level" />
                  </SelectTrigger>
                  <SelectContent>
                    {LEVELS.filter(l => l.value).map(level => (
                      <SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.level && (
                  <p className="text-red-600 text-xs mt-1">{formErrors.level}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="short_description" className="text-xs font-semibold">Short Description *</Label>
                <Textarea
                  id="short_description"
                  value={formData.short_description}
                  onChange={(e) => handleChange('short_description', e.target.value)}
                  placeholder="Brief description (max 300 characters)"
                  rows={2}
                  maxLength={300}
                  className={formErrors.short_description || getFieldError('short_description') ? 'border-red-500 bg-red-50' : ''}
                />
                <div className="flex justify-between mt-1">
                  {(formErrors.short_description || getFieldError('short_description')) && (
                    <p className="text-red-600 text-xs flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {formErrors.short_description || getFieldError('short_description')}
                    </p>
                  )}
                  <p className="text-gray-500 text-xs ml-auto">{formData.short_description.length}/300</p>
                </div>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="description" className="text-xs font-semibold">Full Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Detailed course description..."
                  rows={3}
                  className={formErrors.description || getFieldError('description') ? 'border-red-500 bg-red-50' : ''}
                />
                {(formErrors.description || getFieldError('description')) && (
                  <p className="text-red-600 text-xs mt-1 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {formErrors.description || getFieldError('description')}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Course Details */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4 text-green-600" />
              Course Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="price" className="text-xs font-semibold">Price (Rs.) *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 font-medium text-sm">Rs.</span>
                  <Input
                    id="price"
                    type="text"
                    value={formData.price || ''}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '');
                      handleChange('price', value ? parseInt(value) : undefined);
                    }}
                    placeholder="Enter price"
                    className={`pl-10 ${formErrors.price ? 'border-red-500' : ''}`}
                  />
                </div>
                {formErrors.price && (
                  <p className="text-red-600 text-xs mt-1">{formErrors.price}</p>
                )}
              </div>

              <div>
                <Label htmlFor="duration_weeks" className="text-xs font-semibold">Duration (weeks) *</Label>
                <Input
                  id="duration_weeks"
                  type="number"
                  min="1"
                  max="52"
                  value={formData.duration_weeks || ''}
                  onChange={(e) => handleChange('duration_weeks', e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="Enter duration"
                  className={formErrors.duration_weeks ? 'border-red-500' : ''}
                />
                {formErrors.duration_weeks && (
                  <p className="text-red-600 text-xs mt-1">{formErrors.duration_weeks}</p>
                )}
              </div>

              <div>
                <Label htmlFor="max_enrollments" className="text-xs font-semibold">Max Enrollments</Label>
                <Input
                  id="max_enrollments"
                  type="number"
                  min="1"
                  value={formData.max_enrollments || ''}
                  onChange={(e) => handleChange('max_enrollments', e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="Unlimited"
                  className={formErrors.max_enrollments ? 'border-red-500' : ''}
                />
                {formErrors.max_enrollments && (
                  <p className="text-red-600 text-xs mt-1">{formErrors.max_enrollments}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="learning_outcomes" className="text-xs font-semibold">Learning Outcomes</Label>
                <Textarea
                  id="learning_outcomes"
                  value={formData.learning_outcomes || ''}
                  onChange={(e) => handleChange('learning_outcomes', e.target.value)}
                  placeholder="What will students learn?"
                  rows={2}
                  className={formErrors.learning_outcomes || getFieldError('learning_outcomes') ? 'border-red-500 bg-red-50' : ''}
                />
                {(formErrors.learning_outcomes || getFieldError('learning_outcomes')) && (
                  <p className="text-red-600 text-xs mt-1 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {formErrors.learning_outcomes || getFieldError('learning_outcomes')}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="prerequisites" className="text-xs font-semibold">Prerequisites</Label>
                <Textarea
                  id="prerequisites"
                  value={formData.prerequisites || ''}
                  onChange={(e) => handleChange('prerequisites', e.target.value)}
                  placeholder="What should students know?"
                  rows={2}
                  className={formErrors.prerequisites || getFieldError('prerequisites') ? 'border-red-500 bg-red-50' : ''}
                />
                {(formErrors.prerequisites || getFieldError('prerequisites')) && (
                  <p className="text-red-600 text-xs mt-1 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {formErrors.prerequisites || getFieldError('prerequisites')}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Media Upload */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Upload className="h-4 w-4 text-purple-600" />
              Course Media
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold">Thumbnail</Label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange('thumbnail', e.target.files?.[0] || null)}
                  className="hidden"
                  id="thumbnail-upload"
                />
                <label
                  htmlFor="thumbnail-upload"
                  className="block w-full aspect-video bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer"
                >
                  {thumbnailPreview ? (
                    <img src={thumbnailPreview} alt="Thumbnail" className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                      <Upload className="h-5 w-5 mb-1" />
                      <span className="text-xs">Upload thumbnail</span>
                    </div>
                  )}
                </label>
              </div>

              <div>
                <Label htmlFor="demo_video" className="text-xs font-semibold">Demo Video</Label>
                <Input
                  id="demo_video"
                  type="file"
                  accept="video/*"
                  onChange={(e) => handleFileChange('demo_video', e.target.files?.[0] || null)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Form Actions */}
        <Card>
          <CardContent className="p-3 flex items-center justify-between">
            <Button variant="ghost" asChild>
              <Link href="/dashboard/instructor/courses">Cancel</Link>
            </Button>

            <div className="flex flex-col items-end">
              <Button
                type="submit"
                disabled={loading || hasModerationErrors}
                className={hasModerationErrors ? 'bg-red-500 hover:bg-red-600' : ''}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Creating...
                  </>
                ) : hasModerationErrors ? (
                  <>
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Fix Content Issues
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Add Modules and Lessons
                  </>
                )}
              </Button>
              {hasModerationErrors && (
                <p className="text-xs text-red-600 mt-1">
                  Please remove inappropriate content before creating
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
