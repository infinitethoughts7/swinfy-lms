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

  // Content moderation hook
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
      
      // Populate form data
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

    // Check if there are any moderation errors
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
      // Handle backend validation errors (content moderation)
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
    
    // Check content moderation for text fields
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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error && !course) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Course</h3>
        <p className="text-gray-600 mb-6">{error}</p>
        <Link
          href="/dashboard/instructor/courses"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <ChevronRight className="h-4 w-4 mr-2 rotate-180" />
          Back to Courses
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href={`/dashboard/instructor/courses/${courseSlug}`}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ChevronRight className="h-5 w-5 rotate-180" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Edit Course</h1>
            <p className="text-sm text-gray-600">{course?.title}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            course?.is_published 
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}>
            {course?.is_published ? 'Published' : 'Draft'}
          </span>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex">
            <AlertCircle className="h-4 w-4 text-red-400 mr-2 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Column - Basic Info */}
          <div className="lg:col-span-2">
            {/* Basic Information */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Course Details</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Course Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                      getFieldError('title') ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Enter course title..."
                    required
                  />
                  {getFieldError('title') && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {getFieldError('title')}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Short Description *</label>
                  <textarea
                    value={formData.short_description}
                    onChange={(e) => handleInputChange('short_description', e.target.value)}
                    rows={2}
                    maxLength={300}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                      getFieldError('short_description') ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Brief description for course listings..."
                    required
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Description *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                      getFieldError('description') ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Detailed course description..."
                    required
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Level *</label>
                    <select
                      value={formData.level}
                      onChange={(e) => handleInputChange('level', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      {LEVELS.map(level => (
                        <option key={level.value} value={level.value}>{level.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500">₹</span>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={formData.price || ''}
                        onChange={(e) => handleInputChange('price', e.target.value ? parseFloat(e.target.value) : undefined)}
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter price"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration (weeks) *</label>
                    <input
                      type="number"
                      min="1"
                      max="52"
                      value={formData.duration_weeks || ''}
                      onChange={(e) => handleInputChange('duration_weeks', e.target.value ? parseInt(e.target.value) : undefined)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter duration"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Enrollments</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.max_enrollments || ''}
                    onChange={(e) => handleInputChange('max_enrollments', e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Unlimited"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Learning Outcomes</label>
                  <textarea
                    value={formData.learning_outcomes}
                    onChange={(e) => handleInputChange('learning_outcomes', e.target.value)}
                    rows={4}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                      getFieldError('learning_outcomes') ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="What learners will learn from this course..."
                  />
                  {getFieldError('learning_outcomes') && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {getFieldError('learning_outcomes')}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prerequisites</label>
                  <textarea
                    value={formData.prerequisites}
                    onChange={(e) => handleInputChange('prerequisites', e.target.value)}
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                      getFieldError('prerequisites') ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="What students should know before taking this course..."
                  />
                  {getFieldError('prerequisites') && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {getFieldError('prerequisites')}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Media & Actions */}
          <div className="space-y-4">
            {/* Media Upload */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Course Media</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Thumbnail</label>
                  
                  {(course?.thumbnail || files.thumbnail) ? (
                    <div className="relative group">
                      {files.thumbnail ? (
                        <div className="relative">
                          <img 
                            src={URL.createObjectURL(files.thumbnail)} 
                            alt="New thumbnail preview" 
                            className="w-full h-48 object-cover rounded-lg border-2 border-blue-500"
                          />
                          <div className="absolute top-2 right-2 flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleFileChange('thumbnail', null)}
                              className="bg-red-600 text-white px-3 py-1.5 rounded-lg shadow-lg hover:bg-red-700 transition-colors text-xs font-medium"
                            >
                              Cancel
                            </button>
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
                              <div className="bg-white px-3 py-1.5 rounded-lg shadow-lg hover:bg-gray-50 transition-colors">
                                <span className="text-xs font-medium text-gray-900">Edit</span>
                              </div>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Demo Video</label>
                  
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
                            <button
                              type="button"
                              onClick={() => handleFileChange('demo_video', null)}
                              className="bg-red-600 text-white px-3 py-1.5 rounded-lg shadow-lg hover:bg-red-700 transition-colors text-xs font-medium"
                            >
                              Cancel
                            </button>
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
                              <div className="bg-white px-3 py-1.5 rounded-lg shadow-lg hover:bg-gray-50 transition-colors">
                                <span className="text-xs font-medium text-gray-900">Edit</span>
                              </div>
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
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={saving || hasModerationErrors}
                  className={`w-full px-4 py-2 text-white rounded-md transition-colors flex items-center justify-center disabled:opacity-50 ${
                    hasModerationErrors ? 'bg-red-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Updating...' : hasModerationErrors ? 'Fix Content Issues' : 'Update Course'}
                </button>
                {hasModerationErrors && (
                  <p className="text-xs text-red-600 text-center mt-2">
                    Please remove inappropriate content before saving
                  </p>
                )}

  
                
                <Link
                  href={`/dashboard/instructor/courses/${courseSlug}`}
                  className="w-full px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors flex items-center justify-center"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Link>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}