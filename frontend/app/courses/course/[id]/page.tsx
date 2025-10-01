'use client';

import { notFound } from 'next/navigation';
import { useState, useEffect } from 'react';
import CourseHeroSection from '@/components/sections/CourseHeroSection';
import CourseSidebar from '@/components/course/CourseSidebar';
import OverviewTab from '@/components/course/OverviewTab';
import CourseContentTab from '@/components/course/CourseContentTab';
import InstructorTab from '@/components/course/InstructorTab';
import ReviewsTab from '@/components/course/ReviewsTab';
import DemoVideoModal from '@/components/course/DemoVideoModal';
import PaymentModal from '@/components/payment/PaymentModal';
import { coursesApi, paymentsApi } from '@/lib/api';
import { useModal } from '@/components/providers/ModalProvider';

// [Keep all your existing interfaces]
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

interface CourseModule {
  id: string;
  title: string;
  slug: string;
  order: number;
  duration_weeks: number;
  lessons_count: number;
  total_duration_minutes: number;
  created_at: string;
  updated_at: string;
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

type TabType = 'overview' | 'content' | 'instructor' | 'reviews';

export default function CoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { openLoginModal } = useModal();
  const [id, setId] = useState<string>('');
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [lessons, setLessons] = useState<{ [moduleId: string]: Lesson[] }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [, setEnrollmentStatus] = useState<'not_enrolled' | 'active' | 'payment_verification'>('not_enrolled');
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'paid' | 'verified' | 'failed' | 'refunded' | 'partial'>('pending');
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
    if (!id) return;
    
    const fetchCourseData = async () => {
      try {
        setLoading(true);
        setError('');
        
        const courseData = await coursesApi.getCourse(id);
        setCourse(courseData);

        // ALWAYS fetch modules and lessons
        try {
          const modulesResponse = await coursesApi.getCourseModulesPreview(id);
          const modulesData = Array.isArray(modulesResponse) 
            ? modulesResponse 
            : modulesResponse?.results || modulesResponse?.data || [];
          
          if (!Array.isArray(modulesData)) {
            setModules([]);
          } else {
            setModules(modulesData);
            
            const lessonsData: { [moduleId: string]: Lesson[] } = {};
            for (const courseModule of modulesData) {
              try {
                const lessonsResponse = await coursesApi.getModuleLessonsPreview(id, courseModule.id);
                const moduleLessons = Array.isArray(lessonsResponse) 
                  ? lessonsResponse 
                  : lessonsResponse?.results || lessonsResponse?.data || [];
                
                lessonsData[courseModule.id] = Array.isArray(moduleLessons) ? moduleLessons : [];
              } catch (err) {
                console.error(`Error fetching lessons for module ${courseModule.id}:`, err);
                lessonsData[courseModule.id] = [];
              }
            }
            setLessons(lessonsData);
          }
        } catch (err) {
          console.error('Error fetching modules:', err);
          setModules([]);
          setLessons({});
        }

        // Check enrollment status if logged in
        if (isLoggedIn) {
          try {
            const enrollmentData = await paymentsApi.checkEnrollment(courseData.slug);
            setEnrollmentStatus(enrollmentData.status);
            setPaymentStatus(enrollmentData.payment_status || 'pending');
            
            if (enrollmentData.payment_status === 'paid' || enrollmentData.payment_status === 'verified') {
              setEnrollmentStatus('active');
              setIsEnrolled(true);
            } else {
              setEnrollmentStatus('not_enrolled');
              setIsEnrolled(false);
            }
          } catch (err) {
            setEnrollmentStatus('not_enrolled');
            setIsEnrolled(false);
          }
        } else {
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

  const handlePaymentSuccess = (paymentData: unknown) => {
    console.log('Payment successful:', paymentData);
    setEnrollmentStatus('payment_verification');
    setIsEnrolled(false);
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 5000);
  };

  const handleEnrollClick = () => {
    if (!course) return;
    
    if (!isLoggedIn) {
      openLoginModal();
      return;
    }
    
    if (paymentStatus === 'paid' || paymentStatus === 'verified') {
      return;
    }

    setShowPaymentModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
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
            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
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

  const tabs: { id: TabType; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'content', label: 'Course content' },
    { id: 'instructor', label: 'Instructor' },
    { id: 'reviews', label: 'Reviews' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
       {/* Course Hero Section - Dark Background */}
       <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-black pb-24">
         {/* Grid Pattern Overlay */}
         <div className="absolute inset-0 opacity-10">
           <div className="absolute inset-0" style={{
             backgroundImage: `
               linear-gradient(to right, rgb(148, 163, 184) 1px, transparent 1px),
               linear-gradient(to bottom, rgb(148, 163, 184) 1px, transparent 1px)
             `,
             backgroundSize: '40px 40px'
           }} />
         </div>

         <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             {/* Left Column - Course Hero Info */}
             <div className="lg:col-span-2">
      <CourseHeroSection course={course} />
             </div>

             {/* Right Column - Sidebar Preview (Hidden on mobile) */}
             <div className="lg:col-span-1 hidden lg:block">
               {/* Empty space for sidebar positioning */}
             </div>
           </div>
         </div>
       </div>

      {/* Payment Success Notification */}
      {showSuccessMessage && (
        <div className="bg-green-50 border border-green-200 p-4 mx-4 sm:mx-6 lg:mx-8 -mt-20 mb-4 rounded-lg relative z-10">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-800">
                Payment successful! Your enrollment is pending approval.
              </p>
            </div>
              <button
                onClick={() => setShowSuccessMessage(false)}
              className="ml-auto text-green-600 hover:text-green-800"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
          </div>
        </div>
      )}

       {/* Main Content Area - WHITE BACKGROUND */}
       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative">
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Left Column - Main Content with Sticky Tabs */}
           <div className="lg:col-span-2 pt-6">
             {/* STICKY Tab Navigation */}
             <div className="sticky top-16 z-20 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0 mb-6 bg-gray-50 pb-4">
               <div className="bg-white rounded-lg p-1.5 flex gap-1 shadow-sm border border-gray-200">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 px-6 py-2.5 text-sm font-medium rounded-lg transition-all ${
                      activeTab === tab.id
                        ? 'bg-slate-900 text-white shadow-md'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content - ALL WITH WHITE BACKGROUND */}
            <div>
              {activeTab === 'overview' && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <OverviewTab
                    learningOutcomes={course.learning_outcomes}
                    description={course.description}
                    prerequisites={course.prerequisites}
                    tags={course.tags_list}
                    rating={course.rating}
                    enrollmentCount={course.enrollment_count}
                    viewCount={course.view_count}
                  />
              </div>
            )}

              {activeTab === 'content' && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <CourseContentTab
                modules={modules} 
                lessons={lessons} 
                isEnrolled={isEnrolled}
              />
                  </div>
                )}
                
              {activeTab === 'instructor' && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <InstructorTab
                    tutor={course.tutor}
                    trainingPartner={course.training_partner}
                    courseRating={course.rating}
                    totalStudents={course.enrollment_count}
                    totalCourses={2}
                  />
                </div>
              )}
              
              {activeTab === 'reviews' && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <ReviewsTab
                    courseRating={course.rating}
                    totalReviews={course.total_reviews}
                  />
                </div>
              )}
            </div>
          </div>

           {/* Right Column - STICKY SIDEBAR CARD */}
           <div className="lg:col-span-1">
             <div className="sticky top-16 z-30 -mt-32">
               <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
                 <CourseSidebar
                   demoVideo={course.demo_video || undefined}
                   courseThumbnail={course.thumbnail || undefined}
                   price={course.price}
                   duration={course.duration_weeks}
                   lessonsCount={modules.reduce((sum, module) => sum + module.lessons_count, 0)}
                   level={course.level}
                   isEnrolled={isEnrolled}
                   paymentStatus={paymentStatus}
                   onEnrollClick={handleEnrollClick}
                   onDemoVideoClick={() => setShowDemoModal(true)}
                 />
               </div>
             </div>
          </div>
        </div>
      </div>

      {/* Demo Video Modal */}
      <DemoVideoModal
        isOpen={showDemoModal}
        onClose={() => setShowDemoModal(false)}
        videoUrl={course.demo_video || undefined}
        courseTitle={course.title}
      />

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
          onAuthRequired={() => openLoginModal()}
        />
      )}
    </div>
  );
}