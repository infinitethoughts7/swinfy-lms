"use client";

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { instructorApi } from '@/features/courses/services/course-management';
import type { Course, CourseCreateData } from '@/shared/types';
import { useContentModeration } from '@/lib/hooks/useContentModeration';
import {
  ChevronRight, Save, X, Upload, AlertCircle,
  Image as ImageIcon, Video
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

const CATEGORIES = [
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
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

export default function EditCoursePage() {
  const params = useParams();
  const router = useRouter();
  const courseSlug = params.slug as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<CourseCreateData>>({
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
  });

  const [files, setFiles] = useState<{
    thumbnail?: File;
    demo_video?: File;
  }>({});

  const {
    checkField,
    getFieldError,
    hasErrors: hasModerationErrors,
    isChecking
  } = useContentModeration();

  const fetchCourse = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await instructorApi.courses.get(courseSlug);
      setCourse(data);

      setFormData({
        title: data.title,
        description: data.description || '',
        short_description: data.short_description || '',
        price: data.price,
        duration_weeks: data.duration_weeks,
        category: data.category,
        level: data.level,
        learning_outcomes: data.learning_outcomes || '',
        prerequisites: data.prerequisites || '',
        max_enrollments: data.max_enrollments,
      });
    } catch (err) {
      console.error('Error fetching course:', err);
      setError('Failed to load course');
    } finally {
      setLoading(false);
    }
  }, [courseSlug]);

  useEffect(() => {
    fetchCourse();
  }, [fetchCourse]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!course) return;

    if (hasModerationErrors) {
      setError('Please fix the content issues highlighted in red before saving.');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const updateData: Partial<CourseCreateData> = {
        ...formData,
        ...files
      };

      await instructorApi.courses.update(course.slug, updateData);
      router.push(`/dashboard/instructor/courses/${course.slug}`);
    } catch (err: unknown) {
      console.error('Error updating course:', err);
      if (err && typeof err === 'object' && 'response' in err) {
        const errorObj = err as { response?: { data?: Record<string, string[]> } };
        const errorData = errorObj.response?.data;
        if (errorData) {
          const errorMessages = Object.entries(errorData)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join('\n');
          setError(errorMessages || 'Failed to update course. Please try again.');
          return;
        }
      }
      setError('Failed to update course. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof CourseCreateData, value: string | number | boolean | File) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    const textFields = ['title', 'description', 'short_description', 'learning_outcomes', 'prerequisites'];
    if (textFields.includes(field) && typeof value === 'string') {
      checkField(field, value);
    }
  };

  const handleFileChange = (field: 'thumbnail' | 'demo_video', file: File | null) => {
    if (file) {
      setFiles(prev => ({ ...prev, [field]: file }));
    } else {
      setFiles(prev => {
        const newFiles = { ...prev };
        delete newFiles[field];
        return newFiles;
      });
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-10 w-10 rounded" />
          <div>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48 mt-1" />
          </div>
        </div>
        <Skeleton className="h-96 w-full rounded-lg" />
      </div>
    );
  }

  if (error && !course) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Course</h3>
        <p className="text-gray-600 mb-6">{error}</p>
        <Button asChild>
          <Link href="/dashboard/instructor/courses">
            <ChevronRight className="h-4 w-4 mr-2 rotate-180" />
            Back to Courses
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/dashboard/instructor/courses/${courseSlug}`}>
              <ChevronRight className="h-5 w-5 rotate-180" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Edit Course</h1>
            <p className="text-sm text-gray-600">{course?.title}</p>
          </div>
        </div>
        <Badge className={
          course?.is_published
            ? 'bg-green-100 text-green-800'
            : 'bg-gray-100 text-gray-800'
        }>
          {course?.is_published ? 'Published' : 'Draft'}
        </Badge>
      </div>

      {/* Error Message */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Column - Basic Info */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Course Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Course Title *</Label>
                  <Input
                    id="title"
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter course title..."
                    required
                    className={getFieldError('title') ? 'border-red-500 bg-red-50' : ''}
                  />
                  {getFieldError('title') && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {getFieldError('title')}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="short_description">Short Description *</Label>
                  <Textarea
                    id="short_description"
                    value={formData.short_description}
                    onChange={(e) => handleInputChange('short_description', e.target.value)}
                    rows={2}
                    maxLength={300}
                    placeholder="Brief description for course listings..."
                    required
                    className={getFieldError('short_description') ? 'border-red-500 bg-red-50' : ''}
                  />
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-gray-500 text-xs">{formData.short_description?.length || 0}/300</p>
                    {getFieldError('short_description') && (
                      <p className="text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {getFieldError('short_description')}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Full Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                    placeholder="Detailed course description..."
                    required
                    className={getFieldError('description') ? 'border-red-500 bg-red-50' : ''}
                  />
                  {getFieldError('description') && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {getFieldError('description')}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map(cat => (
                          <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="level">Level *</Label>
                    <Select value={formData.level} onValueChange={(value) => handleInputChange('level', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        {LEVELS.map(level => (
                          <SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Price (Rs.) *</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500">Rs.</span>
                      <Input
                        id="price"
                        type="number"
                        min="0"
                        step="1"
                        value={formData.price || ''}
                        onChange={(e) => handleInputChange('price', e.target.value ? parseFloat(e.target.value) : undefined)}
                        className="pl-10"
                        placeholder="Enter price"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="duration_weeks">Duration (weeks) *</Label>
                    <Input
                      id="duration_weeks"
                      type="number"
                      min="1"
                      max="52"
                      value={formData.duration_weeks || ''}
                      onChange={(e) => handleInputChange('duration_weeks', e.target.value ? parseInt(e.target.value) : undefined)}
                      placeholder="Enter duration"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="max_enrollments">Max Enrollments</Label>
                  <Input
                    id="max_enrollments"
                    type="number"
                    min="1"
                    value={formData.max_enrollments || ''}
                    onChange={(e) => handleInputChange('max_enrollments', e.target.value ? parseInt(e.target.value) : undefined)}
                    placeholder="Unlimited"
                  />
                </div>

                <div>
                  <Label htmlFor="learning_outcomes">Learning Outcomes</Label>
                  <Textarea
                    id="learning_outcomes"
                    value={formData.learning_outcomes}
                    onChange={(e) => handleInputChange('learning_outcomes', e.target.value)}
                    rows={4}
                    placeholder="What learners will learn from this course..."
                    className={getFieldError('learning_outcomes') ? 'border-red-500 bg-red-50' : ''}
                  />
                  {getFieldError('learning_outcomes') && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {getFieldError('learning_outcomes')}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="prerequisites">Prerequisites</Label>
                  <Textarea
                    id="prerequisites"
                    value={formData.prerequisites}
                    onChange={(e) => handleInputChange('prerequisites', e.target.value)}
                    rows={3}
                    placeholder="What students should know before taking this course..."
                    className={getFieldError('prerequisites') ? 'border-red-500 bg-red-50' : ''}
                  />
                  {getFieldError('prerequisites') && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {getFieldError('prerequisites')}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Media & Actions */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Course Media</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Thumbnail</Label>
                  {(course?.thumbnail || files.thumbnail) ? (
                    <div className="relative group">
                      {files.thumbnail ? (
                        <div className="relative">
                          <img
                            src={URL.createObjectURL(files.thumbnail)}
                            alt="New thumbnail preview"
                            className="w-full h-48 object-cover rounded-lg border-2 border-blue-500"
                          />
                          <div className="absolute top-2 right-2">
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => handleFileChange('thumbnail', null)}
                            >
                              Cancel
                            </Button>
                          </div>
                          <p className="text-xs text-blue-600 mt-2 font-medium">New thumbnail selected</p>
                        </div>
                      ) : (
                        <div className="relative">
                          <img
                            src={course?.thumbnail || ''}
                            alt="Current thumbnail"
                            className="w-full h-48 object-cover rounded-lg border border-gray-200"
                          />
                          <div className="absolute top-2 right-2">
                            <label htmlFor="thumbnail-upload" className="cursor-pointer">
                              <Button variant="secondary" size="sm" asChild>
                                <span>Edit</span>
                              </Button>
                            </label>
                          </div>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange('thumbnail', e.target.files?.[0] || null)}
                        className="hidden"
                        id="thumbnail-upload"
                      />
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                      <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange('thumbnail', e.target.files?.[0] || null)}
                        className="hidden"
                        id="thumbnail-upload"
                      />
                      <label htmlFor="thumbnail-upload" className="cursor-pointer">
                        <span className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                          Upload thumbnail
                        </span>
                      </label>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 2MB</p>
                    </div>
                  )}
                </div>

                <div>
                  <Label>Demo Video</Label>
                  {(course?.demo_video || files.demo_video) ? (
                    <div className="relative">
                      {files.demo_video ? (
                        <div className="relative">
                          <video
                            src={URL.createObjectURL(files.demo_video)}
                            controls
                            preload="metadata"
                            playsInline
                            className="w-full h-48 rounded-lg border-2 border-blue-500 bg-black"
                          />
                          <div className="absolute top-2 right-2">
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => handleFileChange('demo_video', null)}
                            >
                              Cancel
                            </Button>
                          </div>
                          <p className="text-xs text-blue-600 mt-2 font-medium">New demo video selected</p>
                        </div>
                      ) : (
                        <div className="relative">
                          <video
                            src={course?.demo_video || ''}
                            controls
                            preload="metadata"
                            playsInline
                            className="w-full h-48 rounded-lg border border-gray-200 bg-black"
                          />
                          <div className="absolute top-2 right-2">
                            <label htmlFor="demo-video-upload" className="cursor-pointer">
                              <Button variant="secondary" size="sm" asChild>
                                <span>Edit</span>
                              </Button>
                            </label>
                          </div>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="video/*"
                        onChange={(e) => handleFileChange('demo_video', e.target.files?.[0] || null)}
                        className="hidden"
                        id="demo-video-upload"
                      />
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                      <Video className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <input
                        type="file"
                        accept="video/*"
                        onChange={(e) => handleFileChange('demo_video', e.target.files?.[0] || null)}
                        className="hidden"
                        id="demo-video-upload"
                      />
                      <label htmlFor="demo-video-upload" className="cursor-pointer">
                        <span className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                          Upload demo video
                        </span>
                      </label>
                      <p className="text-xs text-gray-500 mt-1">MP4, MOV up to 50MB</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <Button
                  type="submit"
                  disabled={saving || hasModerationErrors}
                  className={`w-full ${hasModerationErrors ? 'bg-red-500 hover:bg-red-600' : ''}`}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Updating...' : hasModerationErrors ? 'Fix Content Issues' : 'Update Course'}
                </Button>
                {hasModerationErrors && (
                  <p className="text-xs text-red-600 text-center">
                    Please remove inappropriate content before saving
                  </p>
                )}

                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/dashboard/instructor/courses/${courseSlug}`}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
