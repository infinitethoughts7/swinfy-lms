'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { learnerDashboardApi } from '@/lib/api';
import { authenticatedFetch, isAuthenticated, getCurrentUser, getTokens } from '@/lib/auth';
import { getLessonVideoUrl, getLessonMaterialUrl, getCourseResourceUrl } from '@/lib/image-utils';
import { 
  Play, 
  CheckCircle, 
  Download,
  ChevronRight,
  ChevronDown,
  Target,
  FileText,
  Video,
  File,
  ExternalLink
} from 'lucide-react';

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
  video_url?: string;
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

interface CourseContent {
  course: {
    id: string;
    title: string;
    slug: string;
    description: string;
    thumbnail?: string;
  };
  modules: Array<{
    id: string;
    title: string;
    description: string;
    order: number;
    duration_minutes: number;
    duration_formatted: string;
    lessons: Array<{
      id: string;
      title: string;
      slug: string;
      lesson_type: string;
      lesson_type_display: string;
      duration_minutes: number;
      duration_formatted: string;
      video_file?: string;
      video_url?: string;
      content?: string;
      is_preview: boolean;
      is_mandatory: boolean;
      is_completed: boolean;
      order: number;
      has_video_content: boolean;
      materials_count: number;
      created_at: string;
      updated_at: string;
    }>;
  }>;
}

interface Enrollment {
  id: string;
  course: Course;
  progress_percentage: number;
  status: string;
  can_access_content: boolean;
}

export default function CourseLearningPage() {
  const params = useParams();
  const courseSlug = params.slug as string;
  
  // Debug logging (client side only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log('Course Learning Page - Params:', params);
      console.log('Course Learning Page - Course Slug:', courseSlug);
      console.log('Course Learning Page - Is Authenticated:', isAuthenticated());
      console.log('Course Learning Page - User:', getCurrentUser());
    }
  }, [courseSlug, params]);
  
  const [course, setCourse] = useState<Course | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [lessonMaterials, setLessonMaterials] = useState<LessonMaterial[]>([]);
  const [courseResources, setCourseResources] = useState<CourseResource[]>([]);
  const [courseContent, setCourseContent] = useState<CourseContent | null>(null);
  const [completingLesson, setCompletingLesson] = useState<string | null>(null);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  const fetchCourseResources = useCallback(async () => {
    try {
      const response = await authenticatedFetch(
        `/api/courses/${courseSlug}/learner-resources/`
      );
      if (response.ok) {
        const resources = await response.json();
        setCourseResources(resources.results || resources);
      } else {
        console.error('Failed to fetch course resources:', response.status);
      }
    } catch (error) {
      console.error('Failed to fetch course resources:', error);
    }
  }, [courseSlug]);

  const fetchCourseContent = useCallback(async () => {
    try {
      const response = await authenticatedFetch(
        `/api/courses/${courseSlug}/learner-content/`
      );
      if (response.ok) {
        const content = await response.json();
        setCourseContent(content);
      } else {
        console.error('Failed to fetch course content:', response.status);
      }
    } catch (error) {
      console.error('Failed to fetch course content:', error);
    }
  }, [courseSlug]);

  const fetchCourseData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Fetching course data for slug:', courseSlug);
      
      // Fetch course details
      const courseResponse = await learnerDashboardApi.getCourseDetail(courseSlug);
      console.log('Course response:', courseResponse);
      setCourse(courseResponse);
      
      // Fetch enrollment status
      const enrollmentResponse = await learnerDashboardApi.getMyCourses();
      const enrollments = (enrollmentResponse?.results || enrollmentResponse || []) as Enrollment[];
      const currentEnrollment = enrollments.find(e => e.course.slug === courseSlug);
      setEnrollment(currentEnrollment || null);
      
      // Fetch course progress if enrollment exists
      if (currentEnrollment) {
        try {
          const progressResponse = await learnerDashboardApi.getCourseProgress(courseSlug);
          if (progressResponse) {
            // Update enrollment with fresh progress data
            setEnrollment(prev => prev ? { ...prev, progress_percentage: progressResponse.overall_progress } : null);
          }
        } catch (progressErr) {
          console.warn('Could not fetch course progress:', progressErr);
        }
      }
      
      // Expand first module by default
      if (courseResponse?.modules?.length > 0) {
        setExpandedModules(new Set([courseResponse.modules[0].id]));
      }
      
      // Fetch course resources and content
      await fetchCourseResources();
      await fetchCourseContent();
      
    } catch (err: unknown) {
      console.error('Error fetching course data:', err);
      if (err instanceof Error && err.message.includes('No valid access token available')) {
        setError('Please log in to access this course');
      } else if (err instanceof Error && err.message.includes('Authentication failed')) {
        setError('Please log in to access this course');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to load course details');
      }
    } finally {
      setLoading(false);
    }
  }, [courseSlug, fetchCourseResources, fetchCourseContent]);

  useEffect(() => {
    // Check authentication on client side only
    if (typeof window !== 'undefined') {
      const authStatus = isAuthenticated();
      const tokens = getTokens();
      const user = getCurrentUser();
      
      console.log('Authentication check:', authStatus);
      console.log('Tokens available:', !!tokens);
      console.log('User data:', user);
      
      if (!authStatus) {
        console.log('User not authenticated, setting error');
        setError('Please log in to access this course');
        setLoading(false);
        return;
      }
      
      console.log('User is authenticated, proceeding with course data fetch');
      
      if (courseSlug) {
        fetchCourseData();
      }
    }
  }, [courseSlug, fetchCourseData]);


  const handleCourseContentLessonClick = async (lesson: CourseContent['modules'][0]['lessons'][0]) => {
    // Convert course content lesson to Lesson format for compatibility
    const lessonData: Lesson = {
      id: lesson.id,
      title: lesson.title,
      slug: lesson.slug,
      lesson_type: lesson.lesson_type as Lesson['lesson_type'],
      lesson_type_display: lesson.lesson_type_display,
      order: lesson.order,
      duration_minutes: lesson.duration_minutes,
      duration_formatted: lesson.duration_formatted,
      is_preview: lesson.is_preview,
      is_mandatory: lesson.is_mandatory,
      content: lesson.content,
      video_file: lesson.video_file,
      materials_count: lesson.materials_count,
      is_completed: lesson.is_completed,
      has_video_content: lesson.has_video_content,
      created_at: lesson.created_at,
      updated_at: lesson.updated_at
    };
    
    setSelectedLesson(lessonData);
    
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
        if (courseContent) {
          const updatedCourseContent = { ...courseContent };
          updatedCourseContent.modules = updatedCourseContent.modules.map(module => ({
            ...module,
            lessons: module.lessons?.map(lesson => 
              lesson.id === lessonId 
                ? { ...lesson, is_completed: true }
                : lesson
            ) || []
          }));
          setCourseContent(updatedCourseContent);
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

  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const getLessonIcon = (type: string) => {
    const icons = {
      video: Video,
      text: FileText,
      quiz: Target,
      assignment: File,
      live_session: Play,
      download: Download
    };
    return icons[type as keyof typeof icons] || FileText;
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


  const calculateCourseContentModuleProgress = (module: CourseContent['modules'][0]) => {
    if (!module.lessons) return 0;
    const completedLessons = module.lessons.filter(lesson => lesson.is_completed).length;
    const totalLessons = module.lessons.length;
    return totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  };

  const calculateTotalProgress = () => {
    // Use enrollment progress percentage if available, otherwise calculate from modules
    if (enrollment && enrollment.progress_percentage !== undefined) {
      return Math.round(enrollment.progress_percentage);
    }
    
    if (!courseContent || !courseContent.modules) return 0;
    const totalLessons = courseContent.modules.reduce((total, module) => total + (module.lessons?.length || 0), 0);
    const completedLessons = courseContent.modules.reduce((total, module) => 
      total + (module.lessons?.filter(lesson => lesson.is_completed).length || 0), 0
    );
    return totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-3 space-y-6">
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <div className="text-red-600 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {error === 'Please log in to access this course' ? 'Authentication Required' : 'Course Not Found'}
            </h3>
            <p className="text-gray-600 mb-4">
              {error === 'Please log in to access this course' 
                ? 'Please log in to access this course content.' 
                : error || 'The course you are looking for does not exist or you do not have access to it.'
              }
            </p>
            <div className="flex space-x-4 justify-center">
              {error === 'Please log in to access this course' ? (
                <Link 
                  href="/auth/login"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Log In
                </Link>
              ) : (
                <Link 
                  href="/dashboard/learner/courses"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Back to My Courses 
                </Link> 
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
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
            <p className="text-gray-600 mb-4">
              The course you are looking for does not exist or you do not have access to it.
            </p>
            <div className="flex space-x-4 justify-center">
              <Link 
                href="/dashboard/learner/courses"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Back to My Courses 
              </Link>
            </div>
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
              {!enrollment 
                ? 'You need to enroll in this course to access its content.'
                : enrollment?.status === 'pending' 
                ? 'Your enrollment is pending approval. You will be notified once approved.'
                : enrollment?.status === 'rejected'
                ? 'Your enrollment has been rejected. Please contact support for more information.'
                : !enrollment.can_access_content
                ? 'Your enrollment is not active or you do not have access to course content.'
                : 'You need to enroll in this course to access its content.'
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link 
                href="/dashboard/learner/courses"
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
              href="/dashboard/learner/courses"
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
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{course.title}</h1>
          <p className="text-lg text-gray-600 mb-4">{course.short_description}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content - Course Modules */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Course Content</h2>
                
                <div className="space-y-4">
                  {courseContent && courseContent.modules && courseContent.modules.length > 0 ? courseContent.modules.map((module) => {
                    const moduleProgress = calculateCourseContentModuleProgress(module);
                    const isExpanded = expandedModules.has(module.id);
                    const completedLessons = module.lessons?.filter(lesson => lesson.is_completed).length || 0;
                    
                    return (
                      <div key={module.id} className="border border-gray-200 rounded-lg">
                        <button
                          onClick={() => toggleModule(module.id)}
                          className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="flex-shrink-0">
                                {isExpanded ? (
                                  <ChevronDown className="h-5 w-5 text-gray-500" />
                                ) : (
                                  <ChevronRight className="h-5 w-5 text-gray-500" />
                                )}
                              </div>
                              <div>
                                <h3 className="font-medium text-gray-900">{module.title}</h3>
                                <p className="text-sm text-gray-600 mt-1">
                                  {completedLessons}/{module.lessons?.length || 0} lessons • {module.duration_formatted}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className="text-sm text-gray-500">
                                {moduleProgress}% complete
                              </div>
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${moduleProgress}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </button>
                        
                        {isExpanded && (
                          <div className="border-t border-gray-200 p-4 bg-gray-50">
                            <div className="space-y-2">
                              {module.lessons?.map((lesson) => {
                                const LessonIcon = getLessonIcon(lesson.lesson_type);
                                
                                return (
                                  <div
                                    key={lesson.id}
                                    className={`w-full p-3 text-left rounded-lg transition-colors cursor-pointer ${
                                      selectedLesson?.id === lesson.id
                                        ? 'bg-blue-100 border border-blue-200'
                                        : 'hover:bg-white border border-transparent'
                                    }`}
                                    onClick={() => handleCourseContentLessonClick(lesson)}
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center space-x-3">
                                        <div className="flex-shrink-0">
                                          {lesson.is_completed ? (
                                            <CheckCircle className="h-5 w-5 text-green-600" />
                                          ) : (
                                            <LessonIcon className="h-5 w-5 text-gray-400" />
                                          )}
                                        </div>
                                        <div>
                                          <h4 className="font-medium text-gray-900">{lesson.title}</h4>
                                          <p className="text-sm text-gray-600">
                                            {lesson.lesson_type_display} • {lesson.duration_formatted}
                                            {lesson.is_mandatory && ' • Required'}
                                          </p>
                                        </div>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        {lesson.is_preview && (
                                          <span className="px-2 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded-full">
                                            Preview
                                          </span>
                                        )}
                                        
                                        {/* Show Pay button only for non-enrolled students */}
                                        {!enrollment && !lesson.is_preview && (
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              // Handle payment logic here
                                              console.log('Pay for lesson:', lesson.title);
                                            }}
                                            className="flex items-center space-x-1 px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors"
                                          >
                                            <span>Pay to Access</span>
                                          </button>
                                        )}
                                        
                                        {/* Show Watch button for enrolled students or preview lessons */}
                                        {enrollment && lesson.lesson_type === 'video' && lesson.video_file && (
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleCourseContentLessonClick(lesson);
                                              setShowVideoPlayer(true);
                                            }}
                                            className="flex items-center space-x-1 px-3 py-1 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                                          >
                                            <Play className="h-4 w-4" />
                                            <span>Watch</span>
                                          </button>
                                        )}
                                        
                                        {/* Show Watch button for preview lessons (even if not enrolled) */}
                                        {!enrollment && lesson.is_preview && lesson.lesson_type === 'video' && lesson.video_file && (
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleCourseContentLessonClick(lesson);
                                              setShowVideoPlayer(true);
                                            }}
                                            className="flex items-center space-x-1 px-3 py-1 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                                          >
                                            <Play className="h-4 w-4" />
                                            <span>Watch</span>
                                          </button>
                                        )}
                                        
                                        <span className="text-sm text-gray-500">
                                          {lesson.duration_formatted || 'Duration not set'}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  }) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>No course content available yet.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Progress Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Progress</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Overall Progress</span>
                    <span>{calculateTotalProgress()}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${calculateTotalProgress()}%` }}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{courseContent?.modules?.length || 0}</div>
                    <div className="text-sm text-gray-600">Modules</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {courseContent?.modules?.reduce((total, module) => total + (module.lessons?.length || 0), 0) || 0}
                    </div>
                    <div className="text-sm text-gray-600">Lessons</div>
                  </div>
                </div>
              </div>
            </div>


            {/* Course Resources */}
            {courseResources.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Resources</h3>
                <div className="space-y-3">
                  {courseResources.slice(0, 3).map((resource) => (
                    <div key={resource.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          {resource.file ? (
                            <File className="w-4 h-4 text-blue-600" />
                          ) : (
                            <ExternalLink className="w-4 h-4 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-900 text-sm">{resource.title}</h5>
                          <p className="text-xs text-gray-600">{resource.resource_type}</p>
                        </div>
                      </div>
                      {resource.file ? (
                        <a
                          href={getCourseResourceUrl(resource.file)}
                          download
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      ) : resource.url ? (
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      ) : null}
                    </div>
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
                      {(() => {
                        const LessonIcon = getLessonIcon(selectedLesson.lesson_type);
                        return <LessonIcon className="w-4 h-4 mr-1" />;
                      })()}
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
                  {(selectedLesson.video_url || selectedLesson.video_file) && (
                    <div className="bg-gray-900 rounded-lg overflow-hidden">
                      {showVideoPlayer ? (
                        <video
                          controls
                          className="w-full h-96 object-contain"
                          src={selectedLesson.video_url || getLessonVideoUrl(selectedLesson.video_file)}
                        >
                          Your browser does not support the video tag.
                        </video>
                      ) : (
                        <div className="h-96 flex items-center justify-center">
                          <button
                            onClick={handleVideoPlay}
                            className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-4 transition-all"
                          >
                            <Play className="w-16 h-16 text-white" />
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
                                <File className="w-4 h-4 text-blue-600" />
                              </div>
                              <div>
                                <h5 className="font-medium text-gray-900">{material.title}</h5>
                                <p className="text-sm text-gray-600">{material.file_size_formatted}</p>
                              </div>
                            </div>
                            {material.is_downloadable && (
                              <a
                                href={getLessonMaterialUrl(material.file)}
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