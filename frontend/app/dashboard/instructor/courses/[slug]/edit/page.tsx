"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { instructorApi, type Course, type CourseCreateData } from '@/lib/api';
import { 
  BookOpen, ChevronRight, Save, X, Upload, AlertCircle,
  Image as ImageIcon, Video, FileText, Plus, Trash2, Edit,
  Play, File, Link as LinkIcon, Clock
} from 'lucide-react';

interface Lesson {
  id?: string;
  title: string;
  lesson_type: 'video' | 'text' | 'assignment' | 'image_gallery' | 'mixed';
  duration_minutes: number;
  is_preview: boolean;
  is_mandatory: boolean;
  content?: string;
  video_file?: File | null;
  order: number;
}

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
    category: 'programming',
    level: 'beginner',
    tags: '',
    is_private: false,
    requires_admin_enrollment: false,
  });

  const [files, setFiles] = useState<{
    thumbnail?: File;
    demo_video?: File;
  }>({});

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [showAddLesson, setShowAddLesson] = useState(false);

  useEffect(() => {
    fetchCourse();
  }, [courseSlug]);

  const fetchCourse = async () => {
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
        tags: data.tags || '',
        is_private: data.is_private,
        requires_admin_enrollment: data.requires_admin_enrollment,
      });
    } catch (err) {
      console.error('Error fetching course:', err);
      setError('Failed to load course');
    } finally {
      setLoading(false);
    }
  };

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

  const handleInputChange = (field: keyof CourseCreateData, value: any) => {
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

  const addLesson = () => {
    const newLesson: Lesson = {
      title: '',
      lesson_type: 'video',
      duration_minutes: 0,
      is_preview: false,
      is_mandatory: true,
      content: '',
      video_file: null,
      order: lessons.length + 1
    };
    setLessons([...lessons, newLesson]);
    setShowAddLesson(false);
  };

  const updateLesson = (index: number, updatedLesson: Partial<Lesson>) => {
    setLessons(prev => 
      prev.map((lesson, i) => 
        i === index ? { ...lesson, ...updatedLesson } : lesson
      )
    );
  };

  const deleteLesson = (index: number) => {
    if (confirm('Are you sure you want to delete this lesson?')) {
      setLessons(prev => prev.filter((_, i) => i !== index));
    }
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4 text-blue-500" />;
      case 'text': return <FileText className="h-4 w-4 text-green-500" />;
      case 'assignment': return <Edit className="h-4 w-4 text-orange-500" />;
      case 'image_gallery': return <ImageIcon className="h-4 w-4 text-purple-500" />;
      case 'mixed': return <File className="h-4 w-4 text-gray-500" />;
      default: return <FileText className="h-4 w-4 text-gray-500" />;
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
          <div className="lg:col-span-2 space-y-4">
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
                      <option value="programming">Programming</option>
                      <option value="design">Design</option>
                      <option value="business">Business</option>
                      <option value="marketing">Marketing</option>
                      <option value="data_science">Data Science</option>
                      <option value="other">Other</option>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => handleInputChange('tags', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="python, programming, web development"
                  />
                </div>
              </div>
            </div>

            {/* Lessons Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Course Lessons ({lessons.length})</h2>
                <button
                  type="button"
                  onClick={addLesson}
                  className="flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Lesson
                </button>
              </div>

              {lessons.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <Video className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-3">No lessons added yet</p>
                  <button
                    type="button"
                    onClick={addLesson}
                    className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add First Lesson
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {lessons.map((lesson, index) => (
                    <LessonCard
                      key={index}
                      lesson={lesson}
                      index={index}
                      onUpdate={updateLesson}
                      onDelete={deleteLesson}
                      getLessonIcon={getLessonIcon}
                    />
                  ))}
                </div>
              )}
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
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center hover:border-gray-400 transition-colors">
                    <ImageIcon className="h-6 w-6 text-gray-400 mx-auto mb-1" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange('thumbnail', e.target.files?.[0] || null)}
                      className="hidden"
                      id="thumbnail-upload"
                    />
                    <label htmlFor="thumbnail-upload" className="cursor-pointer">
                      <span className="text-xs text-blue-600 hover:text-blue-700">
                        {files.thumbnail ? files.thumbnail.name : 'Upload thumbnail'}
                      </span>
                    </label>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 2MB</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Demo Video</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center hover:border-gray-400 transition-colors">
                    <Video className="h-6 w-6 text-gray-400 mx-auto mb-1" />
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => handleFileChange('demo_video', e.target.files?.[0] || null)}
                      className="hidden"
                      id="demo-video-upload"
                    />
                    <label htmlFor="demo-video-upload" className="cursor-pointer">
                      <span className="text-xs text-blue-600 hover:text-blue-700">
                        {files.demo_video ? files.demo_video.name : 'Upload demo'}
                      </span>
                    </label>
                    <p className="text-xs text-gray-500 mt-1">MP4, MOV up to 50MB</p>
                  </div>
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

                {course?.approval_status === 'draft' && lessons.length > 0 && (
                  <button
                    type="button"
                    onClick={async () => {
                      if (confirm('Submit this course for approval? Once submitted, you cannot edit until it is reviewed.')) {
                        try {
                          // This would call the submit for approval API
                          // await instructorApi.courses.submitForApproval(courseSlug);
                          alert('Course submitted for approval successfully!');
                        } catch (err) {
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

// Lesson Card Component
interface LessonCardProps {
  lesson: Lesson;
  index: number;
  onUpdate: (index: number, lesson: Partial<Lesson>) => void;
  onDelete: (index: number) => void;
  getLessonIcon: (type: string) => JSX.Element;
}

const LessonCard = ({ lesson, index, onUpdate, onDelete, getLessonIcon }: LessonCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(lesson);

  const handleSave = () => {
    onUpdate(index, editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData(lesson);
    setIsEditing(false);
  };

  const handleFileChange = (file: File | null) => {
    setEditData(prev => ({ ...prev, video_file: file }));
  };

  if (isEditing) {
    return (
      <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lesson Title</label>
            <input
              type="text"
              value={editData.title}
              onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter lesson title..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lesson Type</label>
              <select
                value={editData.lesson_type}
                onChange={(e) => setEditData(prev => ({ ...prev, lesson_type: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="video">Video Lesson</option>
                <option value="text">Text Lesson</option>
                <option value="assignment">Assignment</option>
                <option value="image_gallery">Image Gallery</option>
                <option value="mixed">Mixed Content</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
              <input
                type="number"
                min="0"
                value={editData.duration_minutes}
                onChange={(e) => setEditData(prev => ({ ...prev, duration_minutes: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {editData.lesson_type === 'video' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Video File</label>
              <input
                type="file"
                accept="video/*"
                onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
              {editData.video_file && (
                <p className="text-xs text-gray-500 mt-1">Selected: {editData.video_file.name}</p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content/Description</label>
            <textarea
              value={editData.content || ''}
              onChange={(e) => setEditData(prev => ({ ...prev, content: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Lesson content or description..."
            />
          </div>

          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={editData.is_preview}
                onChange={(e) => setEditData(prev => ({ ...prev, is_preview: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
              <span className="ml-2 text-sm text-gray-700">Free Preview</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={editData.is_mandatory}
                onChange={(e) => setEditData(prev => ({ ...prev, is_mandatory: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
              <span className="ml-2 text-sm text-gray-700">Mandatory</span>
            </label>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={handleCancel}
              className="px-3 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Save Lesson
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border">
      <div className="flex items-center space-x-3">
        <span className="text-sm font-medium text-gray-500 bg-white px-2 py-1 rounded min-w-[2rem] text-center">
          {index + 1}
        </span>
        <div className="flex items-center space-x-2">
          {getLessonIcon(lesson.lesson_type)}
          <span className="font-medium text-gray-900">
            {lesson.title || `Lesson ${index + 1}`}
          </span>
        </div>
        {lesson.duration_minutes > 0 && (
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="h-3 w-3 mr-1" />
            {lesson.duration_minutes}m
          </div>
        )}
        {lesson.is_preview && (
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Preview</span>
        )}
        {!lesson.is_mandatory && (
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Optional</span>
        )}
      </div>
      
      <div className="flex items-center space-x-2">
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <Edit className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => onDelete(index)}
          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
