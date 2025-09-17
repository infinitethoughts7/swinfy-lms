"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { instructorApi, type CourseCreateData } from '@/lib/api';
import { ArrowLeft, Upload, Save, Eye, DollarSign, Clock, Tag, BookOpen } from 'lucide-react';

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

interface FormErrors {
  [key: string]: string;
}

export default function CreateCoursePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CourseCreateData>({
    title: '',
    description: '',
    short_description: '',
    price: 0,
    duration_weeks: 4,
    category: 'frontend_development',
    level: 'beginner',
    tags: '',
    learning_outcomes: '',
    prerequisites: '',
    is_private: true,
    requires_admin_enrollment: true,
    max_enrollments: undefined,
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  const handleChange = (field: keyof CourseCreateData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFileChange = (field: 'thumbnail' | 'banner_image' | 'demo_video', file: File | null) => {
    if (file) {
      setFormData(prev => ({ ...prev, [field]: file }));
      
      // Create preview for images
      if (field === 'thumbnail' || field === 'banner_image') {
        const reader = new FileReader();
        reader.onload = (e) => {
          const preview = e.target?.result as string;
          if (field === 'thumbnail') {
            setThumbnailPreview(preview);
          } else {
            setBannerPreview(preview);
          }
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

    if (formData.price < 0) {
      errors.price = 'Price cannot be negative';
    }

    if (formData.duration_weeks < 1) {
      errors.duration_weeks = 'Duration must be at least 1 week';
    }

    if (formData.max_enrollments && formData.max_enrollments < 1) {
      errors.max_enrollments = 'Max enrollments must be at least 1';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const course = await instructorApi.courses.create(formData);
      router.push(`/dashboard/instructor/courses/${course.slug}`);
    } catch (err) {
      console.error('Error creating course:', err);
      setError('Failed to create course. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Header */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <div className="flex items-center space-x-4">
          <Link
            href="/dashboard/instructor/courses"
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create New Course</h1>
              <p className="text-gray-600 text-sm">Build an engaging learning experience for your students</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Basic Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center mb-4">
            <div className="p-1.5 bg-blue-100 rounded-lg mr-2">
              <BookOpen className="h-4 w-4 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Course Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="e.g., Complete React Development Course"
                className={`w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all ${
                  formErrors.title ? 'ring-1 ring-red-500 border-red-500' : ''
                }`}
              />
              {formErrors.title && (
                <p className="text-red-600 text-sm mt-1">{formErrors.title}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Difficulty Level *
              </label>
              <select
                value={formData.level}
                onChange={(e) => handleChange('level', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all"
              >
                {LEVELS.map(level => (
                  <option key={level.value} value={level.value}>{level.label}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Short Description *
              </label>
              <textarea
                value={formData.short_description}
                onChange={(e) => handleChange('short_description', e.target.value)}
                placeholder="Brief description for course cards (max 300 characters)"
                rows={2}
                maxLength={300}
                className={`w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all resize-none ${
                  formErrors.short_description ? 'ring-1 ring-red-500 border-red-500' : ''
                }`}
              />
              <div className="flex justify-between mt-1">
                {formErrors.short_description && (
                  <p className="text-red-600 text-sm">{formErrors.short_description}</p>
                )}
                <p className="text-gray-500 text-sm ml-auto">{formData.short_description.length}/300</p>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Full Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Detailed course description, what students will learn, course structure..."
                rows={4}
                className={`w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all resize-none ${
                  formErrors.description ? 'ring-1 ring-red-500 border-red-500' : ''
                }`}
              />
              {formErrors.description && (
                <p className="text-red-600 text-sm mt-1">{formErrors.description}</p>
              )}
            </div>
          </div>
        </div>

        {/* Course Details */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center mb-4">
            <div className="p-1.5 bg-green-100 rounded-lg mr-2">
              <Tag className="h-4 w-4 text-green-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Course Details</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Price (₹) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 font-medium">₹</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={formData.price}
                  onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
                  className={`w-full pl-8 pr-3 py-2 rounded-lg border border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all ${
                    formErrors.price ? 'ring-1 ring-red-500 border-red-500' : ''
                  }`}
                />
              </div>
              {formErrors.price && (
                <p className="text-red-600 text-sm mt-1">{formErrors.price}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Duration (weeks) *
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="number"
                  min="1"
                  max="52"
                  value={formData.duration_weeks}
                  onChange={(e) => handleChange('duration_weeks', parseInt(e.target.value) || 1)}
                  className={`w-full pl-8 pr-3 py-2 rounded-lg border border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all ${
                    formErrors.duration_weeks ? 'ring-1 ring-red-500 border-red-500' : ''
                  }`}
                />
              </div>
              {formErrors.duration_weeks && (
                <p className="text-red-600 text-sm mt-1">{formErrors.duration_weeks}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={formData.tags || ''}
                onChange={(e) => handleChange('tags', e.target.value)}
                placeholder="e.g., React, JavaScript, Frontend, Web Development"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all"
              />
              <p className="text-gray-500 text-sm mt-1">Help students find your course with relevant tags</p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Learning Outcomes
              </label>
              <textarea
                value={formData.learning_outcomes || ''}
                onChange={(e) => handleChange('learning_outcomes', e.target.value)}
                placeholder="What will students be able to do after completing this course?"
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all resize-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Prerequisites
              </label>
              <textarea
                value={formData.prerequisites || ''}
                onChange={(e) => handleChange('prerequisites', e.target.value)}
                placeholder="What should students know before taking this course?"
                rows={2}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all resize-none"
              />
            </div>
          </div>
        </div>

        {/* Media Upload */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center mb-4">
            <div className="p-1.5 bg-purple-100 rounded-lg mr-2">
              <Upload className="h-4 w-4 text-purple-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Course Media</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Thumbnail Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Course Thumbnail
              </label>
              <div className="relative">
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
                    <img
                      src={thumbnailPreview}
                      alt="Thumbnail preview"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                      <Upload className="h-6 w-6 mb-1" />
                      <span className="text-xs">Upload thumbnail</span>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Banner Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Course Banner
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange('banner_image', e.target.files?.[0] || null)}
                  className="hidden"
                  id="banner-upload"
                />
                <label
                  htmlFor="banner-upload"
                  className="block w-full aspect-video bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer"
                >
                  {bannerPreview ? (
                    <img
                      src={bannerPreview}
                      alt="Banner preview"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                      <Upload className="h-6 w-6 mb-1" />
                      <span className="text-xs">Upload banner</span>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Demo Video Upload */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Demo Video (Optional)
              </label>
              <input
                type="file"
                accept="video/*"
                onChange={(e) => handleFileChange('demo_video', e.target.files?.[0] || null)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all"
              />
              <p className="text-gray-500 text-xs mt-1">Upload a short video preview of your course</p>
            </div>
          </div>
        </div>

        {/* Course Settings */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center mb-4">
            <div className="p-1.5 bg-orange-100 rounded-lg mr-2">
              <Eye className="h-4 w-4 text-orange-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Course Settings</h2>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900 text-sm">Private Course</h3>
                <p className="text-gray-600 text-xs">Only visible to learners from your organization</p>
              </div>
              <input
                type="checkbox"
                checked={formData.is_private}
                onChange={(e) => handleChange('is_private', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900 text-sm">Require Admin Approval</h3>
                <p className="text-gray-600 text-xs">All enrollments need admin approval</p>
              </div>
              <input
                type="checkbox"
                checked={formData.requires_admin_enrollment}
                onChange={(e) => handleChange('requires_admin_enrollment', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Maximum Enrollments (Optional)
              </label>
              <input
                type="number"
                min="1"
                value={formData.max_enrollments || ''}
                onChange={(e) => handleChange('max_enrollments', e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="Leave empty for unlimited"
                className={`w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all ${
                  formErrors.max_enrollments ? 'ring-1 ring-red-500 border-red-500' : ''
                }`}
              />
              {formErrors.max_enrollments && (
                <p className="text-red-600 text-sm mt-1">{formErrors.max_enrollments}</p>
              )}
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Form Actions */}
        <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 p-4">
          <Link
            href="/dashboard/instructor/courses"
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors text-sm"
          >
            Cancel
          </Link>
          
          <button
            type="submit"
            disabled={loading}
            className={`inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm ${
              loading ? 'opacity-50 cursor-not-allowed' : 'shadow-sm hover:shadow-md'
            }`}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                Creating...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Create Course
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
