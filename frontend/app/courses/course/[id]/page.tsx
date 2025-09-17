'use client';

import { notFound } from 'next/navigation';
import { useState, useEffect } from 'react';
import CourseHeroSection from '@/components/sections/CourseHeroSection';
import LessonsSection from '@/components/course/LessonsSection';
import PaymentModal from '@/components/payment/PaymentModal';
import LoginModal from '@/components/auth/LoginModal';
import { coursesApi, paymentsApi } from '@/lib/api';

// Interface for course data from backend
interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  short_description: string;
  price: string;
  duration_weeks: number;
  category: string;
  category_display: string;
  level: string;
  level_display: string;
  rating: string;
  total_reviews: number;
  enrollment_count: number;
  view_count: number;
  thumbnail: string | null;
  banner_image: string | null;
  demo_video?: string | null;
  learning_outcomes: string;
  prerequisites: string;
  tags: string;
  tags_list: string[];
  is_published: boolean;
  is_featured: boolean;
  is_draft: boolean;
  approval_status: string;
  approval_status_display?: string;
  is_private: boolean;
  is_active: boolean;
  requires_admin_enrollment: boolean;
  max_enrollments?: number;
  training_partner: {
    id: string;
    name: string;
    type: string;
    location: string;
    website?: string;
    description?: string;
    is_active: boolean;
    created_at: string;
  };
  tutor: {
    id: string;
    full_name: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    is_verified: boolean;
    is_approved: boolean;
    created_at: string;
    instructor_profile?: {
      bio: string;
      title: string;
      years_of_experience: number;
      highest_education: string;
      specializations: string;
      technologies: string;
      linkedin_url?: string;
      github_url?: string;
      portfolio_url?: string;
    };
  };
  created_at: string;
  updated_at: string;
}

// Interface for course modules
interface CourseModule {
  id: string;
  title: string;
  description: string;
  slug: string;
  order: number;
  duration_weeks: number;
  lessons_count: number;
  total_duration_minutes: number;
  created_at: string;
  updated_at: string;
}

// Interface for lessons
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



export default function CoursePage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string>('');
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [lessons, setLessons] = useState<{ [moduleId: string]: Lesson[] }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [enrollmentStatus, setEnrollmentStatus] = useState<'not_enrolled' | 'pending' | 'payment_verification' | 'active' | 'completed'>('not_enrolled');
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Check if user is logged in
  useEffect(() => {
    const checkLoginStatus = () => {
      const token = localStorage.getItem('access_token');
      setIsLoggedIn(!!token);
    };
    
    checkLoginStatus();
    
    // Listen for storage changes (login/logout)
    const handleStorageChange = () => {
      checkLoginStatus();
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Handle async params
  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setId(resolvedParams.id);
    };
    getParams();
  }, [params]);

  useEffect(() => {
    if (!id) return; // Don't fetch until we have the id
    
    const fetchCourseData = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Fetch course details
        const courseData = await coursesApi.getCourse(id);
        setCourse(courseData);

        // Check enrollment status first if user is logged in
        if (isLoggedIn) {
          try {
            const enrollmentData = await paymentsApi.checkEnrollment(courseData.slug);
            setEnrollmentStatus(enrollmentData.status);
            setIsEnrolled(['active', 'completed', 'pending'].includes(enrollmentData.status));
            
            // Only fetch modules and lessons if user is enrolled
            if (['active', 'completed'].includes(enrollmentData.status)) {
              // Fetch course modules
              const modulesData = await coursesApi.getCourseModules(id);
              setModules(modulesData);
              
              // Fetch lessons for each module
              const lessonsData: { [moduleId: string]: Lesson[] } = {};
              for (const courseModule of modulesData) {
                try {
                  const moduleLessons = await coursesApi.getModuleLessons(id, courseModule.id);
                  lessonsData[courseModule.id] = moduleLessons;
                } catch (err) {
                  console.error(`Error fetching lessons for module ${courseModule.id}:`, err);
                  lessonsData[courseModule.id] = [];
                }
              }
              setLessons(lessonsData);
            }
          } catch (err) {
            console.log('User not enrolled:', err);
            setEnrollmentStatus('not_enrolled');
            setIsEnrolled(false);
          }
        } else {
          // User not logged in, set default values
          setEnrollmentStatus('not_enrolled');
          setIsEnrolled(false);
        }
        
      } catch (err) {
        console.error('Error fetching course data:', err);
        setError('Failed to load course details.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [id, isLoggedIn]);

  // Handle payment success
  const handlePaymentSuccess = (paymentData: unknown) => {
    console.log('Payment successful:', paymentData);
    setEnrollmentStatus('payment_verification');
    setIsEnrolled(false); // Still waiting for admin approval
    setShowSuccessMessage(true);
    // Auto hide success message after 5 seconds
    setTimeout(() => setShowSuccessMessage(false), 5000);
  };

  // Handle enroll button click
  const handleEnrollClick = () => {
    if (!course) return;
    
    // Check if user is logged in
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }

    setShowPaymentModal(true);
  };

  // Handle successful login
  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    setIsLoggedIn(true);
    // Refresh enrollment status after login
    if (course) {
      paymentsApi.checkEnrollment(course.slug)
        .then(enrollmentData => {
          setEnrollmentStatus(enrollmentData.status);
          setIsEnrolled(['active', 'completed'].includes(enrollmentData.status));
        })
        .catch(() => {
          setEnrollmentStatus('not_enrolled');
          setIsEnrolled(false);
        });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (error && !course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  
  if (!course) {
    notFound();
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-50 to-gray-200">
      {/* Course Hero - Using new CourseHeroSection component */}
      <CourseHeroSection course={course} />

      {/* Payment Success Notification */}
      {showSuccessMessage && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 mx-4 sm:mx-6 lg:mx-8 mt-4 rounded-r-lg shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700 font-medium">
                🎉 Payment Successful! Your enrollment is pending admin approval. You&apos;ll receive a notification once approved.
              </p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setShowSuccessMessage(false)}
                className="text-green-400 hover:text-green-600"
              >
                <span className="sr-only">Dismiss</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Learning Outcomes */}
            {course.learning_outcomes && course.learning_outcomes.trim() && (
            <div className="bg-white rounded-2xl p-8 border border-gray-200">
              <h2 className="text-3xl font-sora font-bold text-text-primary mb-6">
                What You&apos;ll Master
              </h2>
               <div className="space-y-4">
                   {(() => {
                     // Handle both comma-separated and bullet point formats
                     let outcomes: string[] = [];
                     
                     if (course.learning_outcomes.includes('•')) {
                       // Split by bullet points and newlines
                       outcomes = course.learning_outcomes.split(/[•\n]/).filter(line => line.trim());
                     } else if (course.learning_outcomes.includes(',')) {
                       // Split by commas
                       outcomes = course.learning_outcomes.split(',').filter(line => line.trim());
                     } else {
                       // Single outcome or other format
                       outcomes = [course.learning_outcomes];
                     }
                     
                     return outcomes.map((outcome: string, index: number) => {
                       const trimmedOutcome = outcome.trim();
                       if (!trimmedOutcome) return null;
                       
                       return (
                         <div key={index} className="flex items-start space-x-4">
                           <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                             <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                               <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                             </svg>
                           </div>
                           <p className="text-text-secondary font-inter text-lg leading-relaxed">{trimmedOutcome}</p>
                         </div>
                       );
                     });
                   })()}
               </div>
            </div>
            )}

            {/* Course Description */}
            {course.description && course.description.trim() && (
            <div className="bg-white rounded-2xl p-8 border border-gray-200">
              <h2 className="text-3xl font-sora font-bold text-text-primary mb-6">
                About This Course
              </h2>
              <p className="text-text-secondary font-inter leading-relaxed text-lg">
                  {course.description}
              </p>
            </div>
            )}

            {/* Course Details */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200">
              <h2 className="text-3xl font-sora font-bold text-text-primary mb-8">
                Course Details
              </h2>
              <div className="space-y-6">
                {/* Level */}
                <div className="flex items-center justify-between py-4 border-b border-gray-100">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-sora font-semibold text-text-primary">Level</h3>
                      <p className="text-gray-600 font-inter">{course.level_display}</p>
                    </div>
                  </div>
                </div>

                {/* Duration */}
                <div className="flex items-center justify-between py-4 border-b border-gray-100">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-sora font-semibold text-text-primary">Duration</h3>
                      <p className="text-gray-600 font-inter">{course.duration_weeks} weeks</p>
                    </div>
                  </div>
                </div>

                {/* Category */}
                <div className="flex items-center justify-between py-4 border-b border-gray-100">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-sora font-semibold text-text-primary">Category</h3>
                      <p className="text-gray-600 font-inter">{course.category_display}</p>
                    </div>
                  </div>
                </div>

                {/* Price */}
                <div className="flex items-center justify-between py-4 border-b border-gray-100">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-sora font-semibold text-text-primary">Price</h3>
                      <p className="text-gray-600 font-inter">₹{parseFloat(course.price).toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Students */}
                <div className="flex items-center justify-between py-4 border-b border-gray-100">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-sora font-semibold text-text-primary">Students</h3>
                      <p className="text-gray-600 font-inter">{course.enrollment_count.toLocaleString()} enrolled</p>
                    </div>
                  </div>
                </div>

                {/* Views */}
                <div className="flex items-center justify-between py-4 border-b border-gray-100">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-sora font-semibold text-text-primary">Views</h3>
                      <p className="text-gray-600 font-inter">{course.view_count?.toLocaleString() || 0} views</p>
                    </div>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center justify-between py-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-sora font-semibold text-text-primary">Rating</h3>
                      <p className="text-gray-600 font-inter">{course.rating} / 5.0</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Prerequisites */}
            {course.prerequisites && (
            <div className="bg-white rounded-2xl p-8 border border-gray-200">
              <h2 className="text-3xl font-sora font-bold text-text-primary mb-6">
                  Prerequisites
              </h2>
                <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200">
                  <p className="text-text-secondary font-inter leading-relaxed text-lg">
                    {course.prerequisites}
                  </p>
                </div>
              </div>
            )}

            {/* Course Curriculum */}
            {modules.length > 0 && (
              <LessonsSection 
                modules={modules} 
                lessons={lessons} 
                isEnrolled={isEnrolled}
                enrollmentStatus={enrollmentStatus}
              />
            )}

            {/* Tags */}
            {course.tags_list && course.tags_list.length > 0 && (
            <div className="bg-white rounded-2xl p-8 border border-gray-200">
                <h2 className="text-3xl font-sora font-bold text-text-primary mb-6">
                  Course Tags
              </h2>
                <div className="flex flex-wrap gap-3">
                  {course.tags_list.map((tag, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-inter font-medium"
                    >
                      {tag}
                    </span>
                      ))}
                    </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Course Info Card */}
            <div className="bg-white rounded-2xl p-6 sticky top-24 border border-gray-200">
              {/* Tutor Section */}
              <div className="text-center mb-6">
                <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4 border-4 border-blue-100 bg-gray-100 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-sora font-bold text-text-primary mb-1">
                  {course.tutor.full_name}
                </h3>
                {course.tutor.instructor_profile?.title && (
                  <p className="text-gray-600 font-inter text-sm mb-1">
                    {course.tutor.instructor_profile.title}
                  </p>
                )}
                <p className="text-blue-600 font-inter font-semibold text-sm mb-1">
                  {course.training_partner.name}
                </p>
                <p className="text-text-secondary font-inter text-xs mb-3">
                  {course.training_partner.type} • {course.training_partner.location}
                </p>
                
                {/* Tutor Bio */}
                {course.tutor.instructor_profile?.bio && (
                  <div className="text-left mb-4">
                    <h4 className="text-sm font-sora font-semibold text-text-primary mb-2">About the Instructor</h4>
                    <p className="text-text-secondary font-inter text-sm leading-relaxed">
                      {course.tutor.instructor_profile.bio}
                    </p>
                  </div>
                )}
                
                {/* Tutor Experience & Education */}
                {(course.tutor.instructor_profile?.years_of_experience || course.tutor.instructor_profile?.highest_education) && (
                  <div className="text-left mb-4 space-y-2">
                    {course.tutor.instructor_profile.years_of_experience && (
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-xs text-gray-600">
                          {course.tutor.instructor_profile.years_of_experience} years experience
                        </span>
                      </div>
                    )}
                    {course.tutor.instructor_profile.highest_education && (
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                        </svg>
                        <span className="text-xs text-gray-600">
                          {course.tutor.instructor_profile.highest_education.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Tutor Specializations */}
                {course.tutor.instructor_profile?.specializations && (
                  <div className="text-left mb-4">
                    <h4 className="text-sm font-sora font-semibold text-text-primary mb-2">Specializations</h4>
                    <div className="flex flex-wrap gap-1">
                      {course.tutor.instructor_profile.specializations.split(',').slice(0, 3).map((spec, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                          {spec.trim()}
                        </span>
                      ))}
                      {course.tutor.instructor_profile.specializations.split(',').length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{course.tutor.instructor_profile.specializations.split(',').length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Social Links */}
                {(course.tutor.instructor_profile?.linkedin_url || course.tutor.instructor_profile?.github_url || course.tutor.instructor_profile?.portfolio_url) && (
                  <div className="flex justify-center space-x-3">
                    {course.tutor.instructor_profile.linkedin_url && (
                      <a href={course.tutor.instructor_profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                      </a>
                    )}
                    {course.tutor.instructor_profile.github_url && (
                      <a href={course.tutor.instructor_profile.github_url} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-800">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                        </svg>
                      </a>
                    )}
                    {course.tutor.instructor_profile.portfolio_url && (
                      <a href={course.tutor.instructor_profile.portfolio_url} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-800">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                        </svg>
                      </a>
                    )}
                  </div>
                )}
              </div>
              
              {/* Pricing Section */}
              <div className="text-center mb-6">
                <div className="text-3xl font-sora font-black text-blue-600 mb-1">
                  ₹{parseFloat(course.price).toLocaleString()}
                </div>
                <p className="text-sm text-gray-600 font-inter">
                  Own this course forever
                </p>
              </div>
              
              {/* Enroll Button */}
              {enrollmentStatus === 'not_enrolled' && (
                <div className="space-y-3 mb-4">
                  <button 
                    onClick={handleEnrollClick}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-sora font-bold text-base py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    {isLoggedIn ? '🛒 Enroll Now' : '🔑 Login to Enroll'}
                  </button>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">30-day money-back guarantee</p>
                  </div>
                </div>
              )}
              
              {enrollmentStatus === 'pending' && (
                <div className="space-y-3 mb-4">
                  <div className="w-full bg-orange-100 border-2 border-orange-300 text-orange-800 font-sora font-semibold text-base py-3 px-6 rounded-xl text-center flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    ⏳ Enrollment Pending
                  </div>
                  <p className="text-xs text-gray-600 text-center">Your enrollment request is being reviewed</p>
                </div>
              )}
              
              {enrollmentStatus === 'payment_verification' && (
                <div className="space-y-3 mb-4">
                  <div className="w-full bg-yellow-100 border-2 border-yellow-400 text-yellow-800 font-sora font-semibold text-base py-3 px-6 rounded-xl text-center flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    💳 Payment Under Review
                  </div>
                  <p className="text-xs text-gray-600 text-center">Payment received - awaiting admin approval</p>
                </div>
              )}
              
              {enrollmentStatus === 'active' && (
                <div className="space-y-3 mb-4">
                  <div className="w-full bg-green-100 border-2 border-green-400 text-green-800 font-sora font-semibold text-base py-3 px-6 rounded-xl text-center flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    ✅ Enrolled - Full Access
                  </div>
                  <p className="text-xs text-gray-600 text-center">You have full access to all course materials</p>
                </div>
              )}
              
              {enrollmentStatus === 'completed' && (
                <div className="space-y-3 mb-4">
                  <div className="w-full bg-purple-100 border-2 border-purple-400 text-purple-800 font-sora font-semibold text-base py-3 px-6 rounded-xl text-center flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                    🎓 Course Completed
                  </div>
                  <p className="text-xs text-gray-600 text-center">Congratulations on completing this course!</p>
                </div>
              )}
              
            </div>

          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {course && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          course={{
            id: course.id,
            title: course.title,
            price: course.price,
            slug: course.slug
          }}
          onPaymentSuccess={handlePaymentSuccess}
          onAuthRequired={() => setShowLoginModal(true)}
        />
      )}

      {/* Login Modal */}
      <LoginModal
        open={showLoginModal}
        onOpenChange={setShowLoginModal}
        onLoginSuccess={handleLoginSuccess}
        onSwitchToRegister={() => {
          // You can add registration modal here if needed
          console.log('Switch to register');
        }}
      />
    </div>
  );
}
