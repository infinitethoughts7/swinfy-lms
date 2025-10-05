"use client";

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { instructorApi, type Course, type CourseCreateData } from '@/lib/api';
import { 
  ChevronRight, Save, X, Upload, AlertCircle,
  Image as ImageIcon, Video
} from 'lucide-react';


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
    price: 0,
    duration_weeks: 4,
    category: 'frontend_development',
    level: 'beginner',
    learning_outcomes: '',
    is_private: false,
    requires_admin_enrollment: false,
  });

  const [files, setFiles] = useState<{
    thumbnail?: File;
    demo_video?: File;
  }>({});


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
        is_private: data.is_private,
        requires_admin_enrollment: data.requires_admin_enrollment,
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

    try {
      setSaving(true);
      setError(null);

      const updateData: Partial<CourseCreateData> = {
        ...formData,
        ...files
      };

      await instructorApi.courses.update(course.slug, updateData);
      router.push(`/dashboard/instructor/courses/${course.slug}`);
    } catch (err) {
      console.error('Error updating course:', err);
      setError('Failed to update course. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof CourseCreateData, value: string | number | boolean | File) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Course Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter course title..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
                  <textarea
                    value={formData.short_description}
                    onChange={(e) => handleInputChange('short_description', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Brief description for course listings..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Detailed course description..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="frontend_development">Frontend Development</option>
                      <option value="backend_development">Backend Development</option>
                      <option value="programming_languages">Programming Languages</option>
                      <option value="ai">Artificial Intelligence</option>
                      <option value="ai_tools">AI Tools</option>
                      <option value="data_science">Data Science</option>
                      <option value="data_analysis">Data Analysis</option>
                      <option value="software_engineering">Software Engineering Essentials</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                    <select
                      value={formData.level}
                      onChange={(e) => handleInputChange('level', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500">₹</span>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={formData.price}
                        onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration (weeks)</label>
                    <input
                      type="number"
                      min="1"
                      max="52"
                      value={formData.duration_weeks}
                      onChange={(e) => handleInputChange('duration_weeks', parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Learning Outcomes</label>
                  <textarea
                    value={formData.learning_outcomes}
                    onChange={(e) => handleInputChange('learning_outcomes', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="What learners will learn from this course..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Media & Settings */}
          <div className="space-y-4">
            {/* Media Upload */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Course Media</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Thumbnail</label>
                  
                  {/* Show current or new thumbnail */}
                  {(course?.thumbnail || files.thumbnail) ? (
                    <div className="relative group">
                      {files.thumbnail ? (
                        // Preview new file
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
                        // Show current thumbnail
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
                    // No thumbnail - show upload area
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
                  
                  {/* Show current or new demo video */}
                  {(course?.demo_video || files.demo_video) ? (
                    <div className="relative">
                      {files.demo_video ? (
                        // Preview new file
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
                        // Show current video
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
                    // No video - show upload area
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

            {/* Settings */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Settings</h2>
              
              <div className="space-y-3">
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    checked={formData.is_private}
                    onChange={(e) => handleInputChange('is_private', e.target.checked)}
                    className="mt-1 rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                  <div className="ml-2">
                    <span className="text-sm font-medium text-gray-700">Private Course</span>
                    <p className="text-xs text-gray-500">Only enrolled students can see this</p>
                  </div>
                </label>

                <label className="flex items-start">
                  <input
                    type="checkbox"
                    checked={formData.requires_admin_enrollment}
                    onChange={(e) => handleInputChange('requires_admin_enrollment', e.target.checked)}
                    className="mt-1 rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                  <div className="ml-2">
                    <span className="text-sm font-medium text-gray-700">Admin Enrollment</span>
                    <p className="text-xs text-gray-500">Students must be manually enrolled</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center disabled:opacity-50"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Updating...' : 'Update Course'}
                </button>

                {course?.approval_status === 'draft' && (
                  <button
                    type="button"
                    onClick={async () => {
                      if (confirm('Submit this course for approval? Once submitted, you cannot edit until it is reviewed.')) {
                        try {
                          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/courses/instructor/courses/${courseSlug}/submit-approval/`, {
                            method: 'POST',
                            headers: {
                              'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({})
                          });
                          
                          if (response.ok) {
                            alert('Course submitted for approval successfully!');
                            fetchCourse(); // Refresh course data
                          } else {
                            const errorData = await response.json();
                            alert(errorData.detail || 'Failed to submit course for approval');
                          }
                        } catch (err) {
                          console.error('Submit for approval error:', err);
                          alert('Failed to submit course for approval');
                        }
                      }
                    }}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Submit for Approval
                  </button>
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
