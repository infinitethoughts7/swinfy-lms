'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { learnerDashboardApi } from '@/lib/api';
import { authenticatedFetch } from '@/lib/auth';

interface Course {
  id: string;
  slug: string;
  title: string;
  description: string;
  short_description: string;
  thumbnail?: string | null;
  banner_image?: string | null;
  duration_weeks: number;
  level_display: string;
  category_display: string;
  price: string;
  rating: string;
  total_reviews: number;
  enrollment_count: number;
  learning_outcomes: string;
  prerequisites: string;
  tags_list: string[];
  training_partner: {
    id: string;
    name: string;
    type: string;
    logo?: string;
  };
  tutor: {
    id: string;
    full_name: string;
    instructor_profile?: {
      bio: string;
      title: string;
      years_of_experience: number;
      specializations: string;
      technologies: string;
    };
  };
  modules: Module[];
  created_at: string;
  updated_at: string;
}

interface Module {
  id: string;
  title: string;
  description: string;
  order: number;
  duration_minutes: number;
  duration_formatted: string;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  slug: string;
  lesson_type: 'video' | 'text' | 'quiz' | 'assignment' | 'live_session' | 'download';
  lesson_type_display: string;
  order: number;
  duration_minutes: number;
  duration_formatted: string;
  is_preview: boolean;
  is_mandatory: boolean;
  content?: string;
  video_file?: string;
  has_video_content: boolean;
  materials_count: number;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

interface LessonMaterial {
  id: string;
  title: string;
  description: string;
  material_type: string;
  file: string;
  file_size: number;
  file_size_formatted: string;
  is_required: boolean;
  is_downloadable: boolean;
  download_count: number;
  created_at: string;
}

interface CourseResource {
  id: string;
  title: string;
  description: string;
  resource_type: string;
  file?: string;
  url?: string;
  is_public: boolean;
  created_at: string;
}

interface Enrollment {
  id: string;
  course: Course;
  progress_percentage: number;
  status: string;
  can_access_content: boolean;
}

export default function StudentCourseDetailPage() {
  const params = useParams();
  const courseSlug = params.slug as string;
  
  const [course, setCourse] = useState<Course | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [lessonMaterials, setLessonMaterials] = useState<LessonMaterial[]>([]);
  const [courseResources, setCourseResources] = useState<CourseResource[]>([]);
  const [completingLesson, setCompletingLesson] = useState<string | null>(null);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);

  const fetchCourseResources = useCallback(async () => {
    try {
      const response = await authenticatedFetch(
        `/api/courses/${courseSlug}/resources/`
      );
      if (response.ok) {
        const resources = await response.json();
        setCourseResources(resources);
      }
    } catch (error) {
      console.error('Failed to fetch course resources:', error);
    }
  }, [courseSlug]);

  const fetchCourseData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch course details
      const courseResponse = await learnerDashboardApi.getCourseDetail(courseSlug);
      setCourse(courseResponse);
      
      // Fetch enrollment status
      const enrollmentResponse = await learnerDashboardApi.getMyCourses();
      const enrollments = (enrollmentResponse?.results || enrollmentResponse || []) as Enrollment[];
      const currentEnrollment = enrollments.find(e => e.course.slug === courseSlug);
      setEnrollment(currentEnrollment || null);
      
      // Set first module as selected by default
      if (courseResponse?.modules?.length > 0) {
        setSelectedModule(courseResponse.modules[0]);
      }
      
      // Fetch course resources
      await fetchCourseResources();
      
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load course details');
    } finally {
      setLoading(false);
    }
  }, [courseSlug, fetchCourseResources]);

  useEffect(() => {
    if (courseSlug) {
      fetchCourseData();
    }
  }, [courseSlug, fetchCourseData]);

  const handleLessonClick = async (lesson: Lesson) => {
    setSelectedLesson(lesson);
    
    // Fetch lesson materials
    try {
      const response = await authenticatedFetch(
        `/api/courses/lessons/${lesson.id}/materials/`
      );
      if (response.ok) {
        const materials = await response.json();
        setLessonMaterials(materials);
      }
    } catch (error) {
      console.error('Failed to fetch lesson materials:', error);
    }
  };

  const handleCompleteLesson = async (lessonId: string) => {
    try {
      setCompletingLesson(lessonId);
      const response = await authenticatedFetch(
        `/api/courses/lessons/${lessonId}/complete/`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ is_completed: true }),
        }
      );

      if (response.ok) {
        // Update the lesson completion status in the UI
        if (course) {
          const updatedCourse = { ...course };
          updatedCourse.modules = updatedCourse.modules.map(module => ({
            ...module,
            lessons: module.lessons.map(lesson => 
              lesson.id === lessonId 
                ? { ...lesson, is_completed: true }
                : lesson
            )
          }));
          setCourse(updatedCourse);
        }
        
        // Update selected lesson if it's the one being completed
        if (selectedLesson?.id === lessonId) {
          setSelectedLesson({ ...selectedLesson, is_completed: true });
        }
        
        // Refresh enrollment data to update progress
        const enrollmentResponse = await learnerDashboardApi.getMyCourses();
        const enrollments = (enrollmentResponse?.results || enrollmentResponse || []) as Enrollment[];
        const currentEnrollment = enrollments.find(e => e.course.slug === courseSlug);
        setEnrollment(currentEnrollment || null);
        
        alert('Lesson completed successfully!');
      } else {
        const errorData = await response.json();
        alert(errorData.detail || 'Failed to complete lesson');
      }
    } catch (error) {
      console.error('Error completing lesson:', error);
      alert('Failed to complete lesson');
    } finally {
      setCompletingLesson(null);
    }
  };

  const handleVideoPlay = () => {
    setShowVideoPlayer(true);
  };

  const getLessonIcon = (type: string) => {
    const icons = {
      video: '🎥',
      text: '📄',
      quiz: '❓',
      assignment: '📝',
      live_session: '🔴',
      download: '📥'
    };
    return icons[type as keyof typeof icons] || '📄';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-64 bg-gray-200 rounded-lg"></div>
                <div className="h-32 bg-gray-200 rounded-lg"></div>
              </div>
              <div className="space-y-6">
                <div className="h-48 bg-gray-200 rounded-lg"></div>
                <div className="h-32 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <div className="text-red-600 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Course Not Found</h3>
            <p className="text-gray-600 mb-4">{error || 'The course you are looking for does not exist or you do not have access to it.'}</p>
            <Link 
              href="/dashboard/student/courses"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Back to My Courses
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!enrollment || !enrollment.can_access_content) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <div className="text-yellow-600 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
            <p className="text-gray-600 mb-4">
              {enrollment?.status === 'pending' 
                ? 'Your enrollment is pending approval. You will be notified once approved.'
                : enrollment?.status === 'rejected'
                ? 'Your enrollment has been rejected. Please contact support for more information.'
                : 'You need to enroll in this course to access its content.'
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link 
                href="/dashboard/student/courses"
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Back to My Courses
              </Link>
              {!enrollment && (
                <Link 
                  href={`/courses/course/${courseSlug}`}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Enroll Now
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Link 
              href="/dashboard/student/courses"
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to My Courses
            </Link>
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(enrollment.status)}`}>
                {enrollment.status}
              </span>
              <span className="text-sm text-gray-600">
                {enrollment.progress_percentage}% Complete
              </span>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{course.title}</h1>
          <p className="text-lg text-gray-600 mb-4">{course.short_description}</p>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {course.duration_weeks} weeks
            </span>
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              {course.level_display}
            </span>
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              {course.category_display}
            </span>
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              {course.rating} ({course.total_reviews} reviews)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Course Banner */}
            {course.banner_image && (
              <div className="relative h-64 rounded-lg overflow-hidden">
                <Image
                  src={course.banner_image}
                  alt={course.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            {/* Course Description */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">About This Course</h2>
              <p className="text-gray-700 leading-relaxed">{course.description}</p>
            </div>

            {/* Learning Outcomes */}
            {course.learning_outcomes && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">What You&apos;ll Learn</h2>
                <div className="prose max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: course.learning_outcomes }} />
                </div>
              </div>
            )}

            {/* Prerequisites */}
            {course.prerequisites && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Prerequisites</h2>
                <div className="prose max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: course.prerequisites }} />
                </div>
              </div>
            )}

            {/* Course Content */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Course Content</h2>
              <div className="space-y-4">
                {course.modules.map((module) => (
                  <div key={module.id} className="border border-gray-200 rounded-lg">
                    <button
                      onClick={() => setSelectedModule(module)}
                      className={`w-full p-4 text-left transition-colors ${
                        selectedModule?.id === module.id 
                          ? 'bg-blue-50 border-blue-200' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">{module.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{module.description}</p>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <span>{module.lessons.length} lessons</span>
                          <span>•</span>
                          <span>{module.duration_formatted}</span>
                          <svg 
                            className={`w-5 h-5 transition-transform ${
                              selectedModule?.id === module.id ? 'rotate-180' : ''
                            }`} 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </button>
                    
                    {selectedModule?.id === module.id && (
                      <div className="border-t border-gray-200 p-4 bg-gray-50">
                        <div className="space-y-2">
                          {module.lessons.map((lesson) => (
                            <button
                              key={lesson.id}
                              onClick={() => handleLessonClick(lesson)}
                              className={`w-full p-3 text-left rounded-lg transition-colors ${
                                selectedLesson?.id === lesson.id
                                  ? 'bg-blue-100 border-blue-200'
                                  : 'hover:bg-white border border-transparent'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <span className="text-lg">{getLessonIcon(lesson.lesson_type)}</span>
                                  <div>
                                    <h4 className="font-medium text-gray-900">{lesson.title}</h4>
                                    <p className="text-sm text-gray-600">
                                      {lesson.lesson_type_display} • {lesson.duration_formatted}
                                      {lesson.is_mandatory && ' • Required'}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  {lesson.is_completed && (
                                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                  )}
                                  {lesson.is_preview && (
                                    <span className="px-2 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded-full">
                                      Preview
                                    </span>
                                  )}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Course Progress */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Progress</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Overall Progress</span>
                    <span>{enrollment.progress_percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${enrollment.progress_percentage}%` }}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{course.modules.length}</div>
                    <div className="text-sm text-gray-600">Modules</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {course.modules.reduce((total, module) => total + module.lessons.length, 0)}
                    </div>
                    <div className="text-sm text-gray-600">Lessons</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Instructor Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Instructor</h3>
              <div className="flex items-start space-x-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{course.tutor.full_name}</h4>
                  {course.tutor.instructor_profile && (
                    <p className="text-sm text-gray-600">{course.tutor.instructor_profile.title}</p>
                  )}
                  <p className="text-sm text-gray-500 mt-1">
                    {course.training_partner.name}
                  </p>
                </div>
              </div>
            </div>

            {/* Course Resources */}
            {courseResources.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Resources</h3>
                <div className="space-y-3">
                  {courseResources.map((resource) => (
                    <div key={resource.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          {resource.file ? (
                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-900">{resource.title}</h5>
                          <p className="text-sm text-gray-600">{resource.resource_type}</p>
                        </div>
                      </div>
                      {resource.file ? (
                        <a
                          href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${resource.file}`}
                          download
                          className="px-3 py-1 text-sm text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
                        >
                          Download
                        </a>
                      ) : resource.url ? (
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 text-sm text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
                        >
                          Open
                        </a>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Course Tags */}
            {course.tags_list && course.tags_list.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {course.tags_list.map((tag, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 text-sm text-gray-600 bg-gray-100 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Lesson Content Modal */}
        {selectedLesson && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">{selectedLesson.title}</h3>
                  <button
                    onClick={() => {
                      setSelectedLesson(null);
                      setShowVideoPlayer(false);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span className="flex items-center">
                      {getLessonIcon(selectedLesson.lesson_type)}
                      <span className="ml-1">{selectedLesson.lesson_type_display}</span>
                    </span>
                    <span>{selectedLesson.duration_formatted}</span>
                    {selectedLesson.is_mandatory && (
                      <span className="px-2 py-1 text-xs font-medium text-red-600 bg-red-100 rounded-full">
                        Required
                      </span>
                    )}
                    {selectedLesson.is_completed && (
                      <span className="px-2 py-1 text-xs font-medium text-green-600 bg-green-100 rounded-full">
                        Completed
                      </span>
                    )}
                  </div>
                  
                  {/* Video Player */}
                  {selectedLesson.video_file && (
                    <div className="bg-gray-900 rounded-lg overflow-hidden">
                      {showVideoPlayer ? (
                        <video
                          controls
                          className="w-full h-96 object-contain"
                          src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${selectedLesson.video_file}`}
                        >
                          Your browser does not support the video tag.
                        </video>
                      ) : (
                        <div className="h-96 flex items-center justify-center">
                          <button
                            onClick={handleVideoPlay}
                            className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-4 transition-all"
                          >
                            <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Lesson Content */}
                  {selectedLesson.content && (
                    <div className="prose max-w-none">
                      <div dangerouslySetInnerHTML={{ __html: selectedLesson.content }} />
                    </div>
                  )}
                  
                  {/* Lesson Materials */}
                  {lessonMaterials.length > 0 && (
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-medium text-blue-900 mb-3">Lesson Materials</h4>
                      <div className="space-y-2">
                        {lessonMaterials.map((material) => (
                          <div key={material.id} className="flex items-center justify-between bg-white rounded-lg p-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              </div>
                              <div>
                                <h5 className="font-medium text-gray-900">{material.title}</h5>
                                <p className="text-sm text-gray-600">{material.file_size_formatted}</p>
                              </div>
                            </div>
                            {material.is_downloadable && (
                              <a
                                href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${material.file}`}
                                download
                                className="px-3 py-1 text-sm text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
                              >
                                Download
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Lesson Completion */}
                  {!selectedLesson.is_completed && (
                    <div className="flex justify-end">
                      <button
                        onClick={() => handleCompleteLesson(selectedLesson.id)}
                        disabled={completingLesson === selectedLesson.id}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {completingLesson === selectedLesson.id ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Completing...
                          </div>
                        ) : (
                          'Mark as Complete'
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
