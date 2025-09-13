'use client';

import { notFound } from 'next/navigation';
import { useState, useEffect } from 'react';
import CourseHeroSection from '@/components/sections/CourseHeroSection';
import LessonsSection from '@/components/course/LessonsSection';
import { coursesApi } from '@/lib/api';

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
  thumbnail: string;
  banner_image: string;
  demo_video?: string;
  learning_outcomes: string;
  prerequisites: string;
  tags: string;
  tags_list: string[];
  training_partner: {
    id: string;
    name: string;
    type: string;
    location: string;
    website?: string;
    description?: string;
  };
  tutor: {
    id: string;
    full_name: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    organization_name: string;
    organization_type: string;
  };
  is_featured: boolean;
  created_at: string;
}

// Interface for course modules
interface CourseModule {
  id: string;
  title: string;
  description: string;
  slug: string;
  order: number;
  duration_weeks: number;
  is_published: boolean;
  lessons_count: number;
  total_duration_minutes: number;
  created_at: string;
  updated_at: string;
}

// Interface for lessons
interface Lesson {
  id: string;
  title: string;
  description: string;
  slug: string;
  lesson_type: 'video' | 'text' | 'quiz' | 'assignment' | 'live_session' | 'download';
  order: number;
  duration_minutes: number;
  is_preview: boolean;
  is_published: boolean;
  content: string;
  video_url: string;
  video_file: string;
  attachment: string;
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
        
      } catch (err) {
        console.error('Error fetching course data:', err);
        setError('Failed to load course details.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [id]);

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
                      <p className="text-gray-600 font-inter">{course.enrollment_count.toLocaleString()}</p>
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
              <LessonsSection modules={modules} lessons={lessons} />
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
                <p className="text-blue-600 font-inter font-semibold text-sm mb-1">
                  {course.training_partner.name}
                </p>
                <p className="text-text-secondary font-inter text-xs mb-3">
                  {course.training_partner.type} • {course.training_partner.location}
                </p>
              </div>
              
              {/* Pricing Section */}
              <div className="text-center mb-6">
                <div className="text-3xl font-sora font-black text-blue-600 mb-1">
                  ₹{parseFloat(course.price).toLocaleString()}
                </div>
              </div>
              
              {/* Enroll Button */}
              <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-sora font-bold text-base py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-sm mb-4">
                Enroll Now
              </button>
              
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
