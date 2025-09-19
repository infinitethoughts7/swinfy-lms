"use client";

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { instructorApi, type Course } from '@/lib/api';
import ModulesLessonsManager from '@/components/instructor/ModulesLessonsManager';
import ResourcesManager from '@/components/instructor/ResourcesManager';
import { 
  BookOpen, Users, Clock, Star, Eye, Edit, 
  Video, FileText, BarChart3, Upload, Play,
  ChevronRight, X
} from 'lucide-react';

interface TabProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const CourseDetailTabs = ({ activeTab, setActiveTab }: TabProps) => {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: BookOpen },
    { id: 'modules', label: 'Modules & Lessons', icon: Video },
    { id: 'resources', label: 'Resources', icon: FileText },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <div className="border-b border-gray-200 mb-4">
      <nav className="flex space-x-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="h-4 w-4 mr-2" />
              {tab.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

const CourseOverview = ({ course, onUpdate, onSendForApproval }: { 
  course: Course; 
  onUpdate: () => void;
  onSendForApproval?: () => void;
}) => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
    {/* Course Info */}
    <div className="lg:col-span-2 space-y-4">
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Course Information</h3>
        <div className="space-y-3">
          <div>
            <span className="block text-sm font-semibold text-gray-900 mb-1">Description:</span>
            <p className="text-sm text-gray-700 leading-relaxed">{course.description || 'No description provided'}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-semibold text-gray-900">Category:</span>
              <span className="text-sm font-medium text-gray-700">{course.category_display}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-semibold text-gray-900">Level:</span>
              <span className="text-sm font-medium text-gray-700">{course.level_display}</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-semibold text-gray-900">Duration:</span>
              <span className="text-sm font-medium text-gray-700">{course.duration_weeks} weeks</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-semibold text-gray-900">Price:</span>
              <span className="text-sm font-bold text-green-600">₹{course.price}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Learning Outcomes */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Learning Outcomes</h3>
        <div>
          <span className="block text-sm font-semibold text-gray-900 mb-1">What you&apos;ll learn:</span>
          <p className="text-sm text-gray-700 leading-relaxed">{course.learning_outcomes || 'No learning outcomes specified'}</p>
        </div>
      </div>

      {/* Prerequisites */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Prerequisites</h3>
        <div>
          <span className="block text-sm font-semibold text-gray-900 mb-1">Requirements:</span>
          <p className="text-sm text-gray-700 leading-relaxed">{course.prerequisites || 'No prerequisites specified'}</p>
        </div>
      </div>
    </div>

    {/* Course Stats & Actions */}
    <div className="space-y-4">
      {/* Course Image */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-base font-semibold text-gray-900 mb-3">Course Thumbnail</h3>
        <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
          {course.thumbnail ? (
            <img 
              src={(course.thumbnail?.startsWith('http://') || course.thumbnail?.startsWith('https://')) ? course.thumbnail : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${course.thumbnail}`}
              alt={course.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <BookOpen className="h-8 w-8 text-white" />
          )}
        </div>
        <UpdateThumbnailButton slug={course.slug} onUploaded={onUpdate} />
      </div>

      {/* Quick Stats */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-base font-semibold text-gray-900 mb-3">Quick Stats</h3>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-gray-900">Modules:</span>
            <span className="text-sm font-bold text-blue-600">{course.modules_count || 0}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-gray-900">Lessons:</span>
            <span className="text-sm font-bold text-blue-600">{course.lessons_count || 0}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-gray-900">Duration:</span>
            <span className="text-sm font-bold text-purple-600">{Math.round((course.total_duration_minutes || 0) / 60)}h</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-gray-900">Enrollments:</span>
            <span className="text-sm font-bold text-green-600">{course.enrollment_count || 0}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-gray-900">Status:</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              course.approval_status === 'approved' 
                ? 'bg-green-100 text-green-800'
                : course.approval_status === 'pending_approval'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {course.approval_status_display}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-base font-semibold text-gray-900 mb-3">Actions</h3>
        <div className="space-y-2">
          <Link
            href={`/dashboard/instructor/courses/${course.slug}/edit`}
            className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center text-sm"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Course
          </Link>
          <PreviewCourseButton 
            course={course} 
            onSendForApproval={onSendForApproval}
          />
        </div>
      </div>
    </div>
  </div>
);

// Preview Course Button component
const PreviewCourseButton = ({ course, onSendForApproval }: { 
  course: Course;
  onSendForApproval?: () => void;
}) => {
  const [showPreview, setShowPreview] = useState(false);

  return (
    <>
      <button 
        onClick={() => setShowPreview(true)}
        className="w-full px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center text-sm"
      >
        <Eye className="h-4 w-4 mr-2" />
        Preview Course
      </button>
      
      {showPreview && (
        <CoursePreviewModal 
          course={course} 
          onClose={() => setShowPreview(false)} 
          onSendForApproval={onSendForApproval}
        />
      )}
    </>
  );
};

// Course Preview Modal component
const CoursePreviewModal = ({ course, onClose, onSendForApproval }: { 
  course: Course; 
  onClose: () => void;
  onSendForApproval?: () => void;
}) => {
  const [modules, setModules] = useState<Array<{ id: string; title: string; lessons: Array<{ id: string; title: string; lesson_type: string; duration_minutes?: number; is_preview: boolean }> }>>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchModules = useCallback(async () => {
    try {
      setLoading(true);
      const modulesData = await instructorApi.modules.list(course.slug);
      
      // Fetch lessons for each module
      const modulesWithLessons = await Promise.all(
        modulesData.map(async (module) => {
          try {
            const lessons = await instructorApi.lessons.list(course.slug, module.id);
            return {
              ...module,
              lessons: Array.isArray(lessons) ? lessons : []
            };
          } catch (err) {
            console.error(`Error fetching lessons for module ${module.id}:`, err);
            return {
              ...module,
              lessons: []
            };
          }
        })
      );
      
      setModules(modulesWithLessons);
    } catch (err) {
      console.error('Error fetching modules:', err);
    } finally {
      setLoading(false);
    }
  }, [course.slug]);

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  const handleSendForApproval = async () => {
    if (!onSendForApproval) return;
    
    try {
      setSubmitting(true);
      await onSendForApproval();
      onClose();
    } catch (error) {
      console.error('Error sending for approval:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-5 w-full max-w-3xl max-h-[85vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Course Preview</h3>
            <p className="text-sm text-gray-600">Review your course before submission</p>
          </div>
          <button onClick={onClose} className="p-2 rounded hover:bg-gray-100 text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Course Header */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-4">
          <div className="flex items-start space-x-3">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center overflow-hidden">
              {course.thumbnail ? (
                <img 
                  src={(course.thumbnail?.startsWith('http://') || course.thumbnail?.startsWith('https://')) ? course.thumbnail : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${course.thumbnail}`}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <BookOpen className="h-8 w-8 text-white" />
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900 mb-1">{course.title}</h2>
              <p className="text-sm text-gray-600 mb-2">{course.short_description}</p>
              <div className="flex items-center space-x-3 text-xs text-gray-600">
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{course.duration_weeks} weeks</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="h-3 w-3" />
                  <span>{course.enrollment_count || 0} students</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="h-3 w-3" />
                  <span>0.0</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="font-bold text-green-600">₹{course.price}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Course Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <div className="space-y-3">
            <div>
              <h4 className="text-base font-semibold text-gray-900 mb-1">Description</h4>
              <p className="text-gray-700 text-xs leading-relaxed">{course.description || 'No description provided'}</p>
            </div>
            
            <div>
              <h4 className="text-base font-semibold text-gray-900 mb-1">Learning Outcomes</h4>
              <p className="text-gray-700 text-xs leading-relaxed">{course.learning_outcomes || 'No learning outcomes specified'}</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div>
              <h4 className="text-base font-semibold text-gray-900 mb-1">Prerequisites</h4>
              <p className="text-gray-700 text-xs leading-relaxed">{course.prerequisites || 'No prerequisites specified'}</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3">
              <h4 className="text-base font-semibold text-gray-900 mb-2">Course Stats</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">Modules:</span>
                  <span className="font-semibold text-blue-600">{modules.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Lessons:</span>
                  <span className="font-semibold text-blue-600">{modules.reduce((acc, m) => acc + m.lessons.length, 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-semibold text-purple-600">{Math.round((course.total_duration_minutes || 0) / 60)}h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Category:</span>
                  <span className="font-semibold text-gray-900">{course.category_display}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modules and Lessons */}
        <div>
          <h4 className="text-base font-semibold text-gray-900 mb-3">Course Content</h4>
          {loading ? (
            <div className="flex items-center justify-center py-6">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            </div>
          ) : modules.length === 0 ? (
            <div className="text-center py-6 bg-gray-50 rounded-lg">
              <Video className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">No modules added yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {modules.map((module, moduleIndex) => (
                <div key={module.id} className="bg-white border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-sm font-semibold text-gray-900">
                      Module {moduleIndex + 1}: {module.title}
                    </h5>
                    <span className="text-xs text-gray-500">
                      {module.lessons.length} lesson{module.lessons.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  
                  {module.lessons.length === 0 ? (
                    <p className="text-xs text-gray-500 italic">No lessons in this module</p>
                  ) : (
                    <div className="space-y-1">
                      {module.lessons.map((lesson: { id: string; title: string; lesson_type: string; duration_minutes?: number; is_preview: boolean }, lessonIndex: number) => (
                        <div key={lesson.id} className="flex items-center space-x-2 py-1.5 px-2 bg-gray-50 rounded">
                          <span className="text-xs font-medium text-gray-500 bg-white px-1.5 py-0.5 rounded">
                            {lessonIndex + 1}
                          </span>
                          <div className="flex items-center space-x-1">
                            {lesson.lesson_type === 'video' ? (
                              <Play className="h-3 w-3 text-blue-500" />
                            ) : (
                              <FileText className="h-3 w-3 text-green-500" />
                            )}
                            <span className="text-xs font-medium text-gray-900">{lesson.title}</span>
                          </div>
                          {lesson.duration_minutes && (
                            <div className="flex items-center text-xs text-gray-500">
                              <Clock className="h-3 w-3 mr-1" />
                              {lesson.duration_minutes}m
                            </div>
                          )}
                          {lesson.is_preview && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">Preview</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
          <div className="flex space-x-2">
            <button
              onClick={onClose}
              className="px-3 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm"
            >
              Close Preview
            </button>
            <Link
              href={`/courses/course/${course.slug}`}
              target="_blank"
              className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
            >
              View Public Page
            </Link>
          </div>
          
          {onSendForApproval && (
            <button
              onClick={handleSendForApproval}
              disabled={submitting}
              className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 disabled:opacity-50 font-semibold text-sm shadow-lg hover:shadow-xl"
            >
              {submitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                  Sending...
                </div>
              ) : (
                '🚀 Send for Approval'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Upload thumbnail button component
const UpdateThumbnailButton = ({ slug, onUploaded }: { slug: string; onUploaded: () => void }) => {
  const [uploading, setUploading] = useState(false);

  const handlePick = async () => {
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = async () => {
        const file = input.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
          await instructorApi.courses.update(slug, { thumbnail: file } as Record<string, unknown>);
          onUploaded();
        } catch (e) {
          console.error('Thumbnail upload failed', e);
          alert('Failed to upload thumbnail');
        } finally {
          setUploading(false);
        }
      };
      input.click();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <button onClick={handlePick} disabled={uploading} className="w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center text-sm disabled:opacity-50">
      <Upload className="h-4 w-4 mr-2" />
      {uploading ? 'Uploading...' : 'Update Thumbnail'}
    </button>
  );
};

export default function CourseDetailPage() {
  const params = useParams();
  const courseSlug = params.slug as string;
  
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchCourse = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await instructorApi.courses.get(courseSlug);
      setCourse(data);
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

  const handleSubmitForApproval = async () => {
    if (!course) return;
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/courses/instructor/courses/${course.slug}/submit-approval/`, {
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
        alert(errorData.detail || errorData.error || 'Failed to submit course for approval');
      }
    } catch (err) {
      console.error('Submit for approval error:', err);
      alert('Failed to submit course for approval');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="text-center py-12">
        <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Course not found</h3>
        <p className="text-gray-600 mb-6">{error || 'The requested course could not be found.'}</p>
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

  const renderTabContent = () => {
      switch (activeTab) {
        case 'overview':
          return <CourseOverview course={course} onUpdate={fetchCourse} onSendForApproval={handleSubmitForApproval} />;
        case 'modules':
        return <ModulesLessonsTab course={course} />;
      case 'resources':
        return <ResourcesTab course={course} onUpdate={fetchCourse} />;
      case 'analytics':
        return <AnalyticsTab />;
      default:
        return <CourseOverview course={course} onUpdate={fetchCourse} onSendForApproval={handleSubmitForApproval} />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link
            href="/dashboard/instructor/courses"
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ChevronRight className="h-5 w-5 rotate-180" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{course.title}</h1>
            <p className="text-gray-600 text-sm">{course.short_description}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            course.is_published 
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}>
            {course.is_published ? 'Published' : 'Draft'}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <CourseDetailTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Tab Content */}
      {renderTabContent()}
    </div>
  );
}

const ModulesLessonsTab = ({ course }: { course: Course }) => (
  <ModulesLessonsManager course={course} />
);

const ResourcesTab = ({ course, onUpdate }: { course: Course; onUpdate: () => void }) => (
  <ResourcesManager course={course} onUpdate={onUpdate} />
);

const AnalyticsTab = () => (
  <div className="text-center py-12">
    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
    <h3 className="text-lg font-semibold text-gray-900 mb-2">Course Analytics</h3>
    <p className="text-gray-600 mb-6">View course performance and student engagement</p>
  </div>
);
