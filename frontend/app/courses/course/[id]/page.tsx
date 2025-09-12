'use client';

import Image from 'next/image';
import { notFound } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Video } from 'lucide-react';
import CourseHeroSection from '@/components/sections/CourseHeroSection';
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



export default function CoursePage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string>('');
  const [course, setCourse] = useState<Course | null>(null);
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
    
    const fetchCourse = async () => {
      try {
        setLoading(true);
        setError('');
        const courseData = await coursesApi.getCourse(id);
        setCourse(courseData);
      } catch (err) {
        console.error('Error fetching course:', err);
        setError('Failed to load course details.');
        // Fallback to mock data for now
        const mockCourse = courseDetails[id as keyof typeof courseDetails];
        if (mockCourse) {
          // Convert mock data to Course interface format
          setCourse({
            id: id,
            title: mockCourse.title,
            slug: id,
            description: mockCourse.longDescription,
            short_description: mockCourse.description,
            price: mockCourse.price,
            duration_weeks: parseInt(mockCourse.duration.split(' ')[0]),
            category: mockCourse.category.toLowerCase().replace(' ', '_'),
            category_display: mockCourse.category,
            level: mockCourse.level.toLowerCase(),
            level_display: mockCourse.level,
            rating: mockCourse.rating.toString(),
            total_reviews: 0,
            enrollment_count: mockCourse.students,
            thumbnail: mockCourse.image,
            banner_image: mockCourse.image,
            learning_outcomes: '',
            prerequisites: '',
            tags: '',
            tags_list: [],
            training_partner: {
              id: '1',
              name: 'MAT',
              type: 'institute',
              location: 'Bangalore'
            },
            tutor: {
              id: '1',
              full_name: mockCourse.instructor,
              email: 'instructor@example.com',
              first_name: mockCourse.instructor.split(' ')[0],
              last_name: mockCourse.instructor.split(' ').slice(1).join(' '),
              role: 'tutor',
              organization_name: 'MAT',
              organization_type: 'institute'
            },
            is_featured: false,
            created_at: new Date().toISOString()
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
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

  // Component for expandable curriculum
  const CurriculumModule = ({ week }: { week: { 
    week: number;
    title: string;
    lessons: number;
    topics: string[];
    duration: string;
  } }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
      <div className="border border-gray-200 rounded-xl bg-white">
        {/* Module Header - Clickable */}
        <div 
          className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center space-x-4">
            <div>
              <h3 className="text-gray-900 font-sora font-semibold text-lg">
                {week.title}
              </h3>
              <p className="text-gray-600 font-inter text-sm">
                {week.lessons} lessons • {week.duration}
              </p>
            </div>
          </div>
          <svg 
            className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        
        {/* Expandable Content */}
        {isExpanded && (
          <div className="px-5 pb-5 border-t border-gray-100">
            <div className="bg-gray-50 rounded-lg p-4 mt-4">
              {/* Top 3 Video Lectures Preview */}
              <div className="mb-6">
                <h4 className="text-gray-900 font-sora font-semibold mb-4 flex items-center">
                  <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m-6-8h8a2 2 0 012 2v8a2 2 0 01-2 2H8a2 2 0 01-2-2v-4a2 2 0 012-2z" />
                  </svg>
                  Preview Lectures (Top 3)
                </h4>
                <div className="space-y-3">
                  {week.topics.slice(0, 3).map((topic: string, topicIndex: number) => (
                    <div key={topicIndex} className="flex items-center justify-between bg-white rounded-lg p-4 border border-gray-200 hover:border-blue-300 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <Video className="w-4 h-4 text-gray-600" />
                          <p className="text-gray-900 font-inter font-medium">{topic}</p>
                          <span className="text-gray-500 text-sm">• {Math.floor(Math.random() * 15) + 10}min</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">Preview</span>
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* All Video Lectures */}
              <div>
                <h4 className="text-gray-900 font-sora font-semibold mb-4 flex items-center">
                  <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V3a1 1 0 011 1v10a1 1 0 01-1 1H8a1 1 0 01-1-1V4h10z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9l2 2 4-4" />
                  </svg>
                  All Video Lectures ({week.topics.length})
                </h4>
                <div className="space-y-2">
                  {week.topics.map((topic: string, topicIndex: number) => (
                    <div key={topicIndex} className="flex items-center justify-between bg-white rounded-lg p-3 border border-gray-100 hover:border-gray-300 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2 flex-1">
                          <Video className="w-4 h-4 text-gray-500" />
                          <p className="text-gray-800 font-inter font-medium text-sm">{topic}</p>
                          <span className="text-gray-500 text-xs">• {Math.floor(Math.random() * 15) + 10}min</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {topicIndex < 3 && (
                          <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded font-medium">Free</span>
                        )}
                        <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-50 to-gray-200">
      {/* Course Hero - Using new CourseHeroSection component */}
      <CourseHeroSection course={course} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Course Highlights */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200">
              <h2 className="text-3xl font-sora font-bold text-text-primary mb-6">
                What You&apos;ll Master
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {course.learning_outcomes ? course.learning_outcomes.split('\n').filter(line => line.trim()).map((outcome: string, index: number) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="text-text-secondary font-inter">{outcome.replace('•', '').trim()}</p>
                  </div>
                )) : (
                  <div className="col-span-2 text-gray-500 text-center py-8">
                    Learning outcomes will be available soon.
                  </div>
                )}
              </div>
            </div>

            {/* Course Description */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200">
              <h2 className="text-3xl font-sora font-bold text-text-primary mb-6">
                About This Course
              </h2>
              <p className="text-text-secondary font-inter leading-relaxed text-lg">
                {course.description}
              </p>
            </div>

            {/* Course Details */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200">
              <h2 className="text-3xl font-sora font-bold text-text-primary mb-8">
                Course Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Level */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-inter text-gray-600 uppercase tracking-wide">Level</h3>
                      <p className="text-xl font-sora font-bold text-text-primary">{course.level}</p>
                    </div>
                  </div>
                </div>

                {/* Duration */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-inter text-gray-600 uppercase tracking-wide">Duration</h3>
                      <p className="text-xl font-sora font-bold text-text-primary">{course.duration}</p>
                    </div>
                  </div>
                </div>

                {/* Lessons */}
                <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-6 border border-purple-200">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-inter text-gray-600 uppercase tracking-wide">Lessons</h3>
                      <p className="text-xl font-sora font-bold text-text-primary">{course.lessons}</p>
                    </div>
                  </div>
                </div>

                {/* Language */}
                <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-inter text-gray-600 uppercase tracking-wide">Language</h3>
                      <p className="text-xl font-sora font-bold text-text-primary">{course.language}</p>
                    </div>
                  </div>
                </div>

                {/* Students */}
                <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-6 border border-cyan-200">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-inter text-gray-600 uppercase tracking-wide">Students</h3>
                      <p className="text-xl font-sora font-bold text-text-primary">{course.students.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Rating */}
                <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-6 border border-yellow-200">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-inter text-gray-600 uppercase tracking-wide">Rating</h3>
                      <p className="text-xl font-sora font-bold text-text-primary">{course.rating} / 5.0</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Curriculum */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200">
              <h2 className="text-3xl font-sora font-bold text-text-primary mb-8">
                Curriculum
              </h2>
              <div className="space-y-4">
                {course.curriculum.map((week, index) => (
                  <CurriculumModule key={index} week={week} />
                ))}
              </div>
            </div>

            {/* Assignments */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200">
              <h2 className="text-3xl font-sora font-bold text-text-primary mb-6">
                Assignments & Practice Work
              </h2>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200 mb-6">
                <h3 className="text-xl font-sora font-bold text-text-primary mb-3">What You&apos;ll Get:</h3>
                <p className="text-text-secondary font-inter leading-relaxed">
                  We provide you with comprehensive assignments and hands-on practice projects designed to reinforce your learning. 
                  Each week, you&apos;ll receive structured assignments that progressively build your skills and help you apply theoretical concepts to real-world scenarios.
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-sora font-semibold text-text-primary mb-2">Weekly Practice Assignments</h3>
                    <p className="text-text-secondary font-inter text-sm">We provide structured weekly assignments with detailed instructions, sample code, and step-by-step guides to help you practice and master each concept.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4 p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-sora font-semibold text-text-primary mb-2">Industry Project Templates</h3>
                    <p className="text-text-secondary font-inter text-sm">We provide real-world project templates and requirements based on actual industry scenarios to help you build a professional portfolio.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-sora font-semibold text-text-primary mb-2">Capstone Project Guidelines</h3>
                    <p className="text-text-secondary font-inter text-sm">We provide comprehensive project guidelines, documentation templates, and evaluation criteria for your final capstone project that showcases all your skills.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Learning Materials */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200">
              <h2 className="text-3xl font-sora font-bold text-text-primary mb-6">
                Learning Materials We Provide
              </h2>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200 mb-6">
                <h3 className="text-xl font-sora font-bold text-text-primary mb-3">Complete Learning Package:</h3>
                <p className="text-text-secondary font-inter leading-relaxed">
                  We provide you with all the learning materials you need to succeed. From HD video lectures to downloadable resources, 
                  cheat sheets, and interactive coding examples - everything is included to ensure you have the best learning experience possible.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-sora font-semibold text-text-primary">Video Content We Provide:</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 6a2 2 0 012-2h6l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                      </svg>
                      <span className="text-text-secondary font-inter">We provide HD Video Lectures (1080p quality)</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <span className="text-text-secondary font-inter">We provide Interactive Code Examples with explanations</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      <span className="text-text-secondary font-inter">We provide all Source Code Files for download</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-sora font-semibold text-text-primary">Study Resources We Provide:</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                        <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a2 2 0 002 2h6a2 2 0 002-2V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm8 8a1 1 0 011-1h.01a1 1 0 110 2H13a1 1 0 01-1-1z" clipRule="evenodd" />
                      </svg>
                      <span className="text-text-secondary font-inter">We provide comprehensive PDF Study Guides</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      <span className="text-text-secondary font-inter">We provide Cheat Sheets & Code Templates</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      <span className="text-text-secondary font-inter">We provide Progress Tracking Tools & Worksheets</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Reference Websites */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200">
              <h2 className="text-3xl font-sora font-bold text-text-primary mb-6">
                Reference Websites We Recommend for Practice
              </h2>
              <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl p-6 border border-purple-200 mb-6">
                <h3 className="text-xl font-sora font-bold text-text-primary mb-3">Practice Resources We Recommend:</h3>
                <p className="text-text-secondary font-inter leading-relaxed">
                  We provide you with a curated list of the best practice websites and platforms. These are carefully selected resources where you can apply 
                  your skills, solve real-world problems, and continue learning beyond the course. We guide you on how to use each platform effectively.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <a href="#" className="group p-4 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors border border-gray-200 hover:border-blue-300">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                      <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-sora font-semibold text-text-primary group-hover:text-blue-600 transition-colors">LeetCode</h3>
                      <p className="text-text-secondary text-sm font-inter">Coding practice problems</p>
                    </div>
                  </div>
                </a>
                <a href="#" className="group p-4 bg-gray-50 rounded-lg hover:bg-green-50 transition-colors border border-gray-200 hover:border-green-300">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                      <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-sora font-semibold text-text-primary group-hover:text-green-600 transition-colors">HackerRank</h3>
                      <p className="text-text-secondary text-sm font-inter">Skill assessments</p>
                    </div>
                  </div>
                </a>
                <a href="#" className="group p-4 bg-gray-50 rounded-lg hover:bg-purple-50 transition-colors border border-gray-200 hover:border-purple-300">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                      <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-sora font-semibold text-text-primary group-hover:text-purple-600 transition-colors">CodePen</h3>
                      <p className="text-text-secondary text-sm font-inter">Frontend playground</p>
                    </div>
                  </div>
                </a>
                <a href="#" className="group p-4 bg-gray-50 rounded-lg hover:bg-orange-50 transition-colors border border-gray-200 hover:border-orange-300">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                      <svg className="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-sora font-semibold text-text-primary group-hover:text-orange-600 transition-colors">Kaggle</h3>
                      <p className="text-text-secondary text-sm font-inter">Data science practice</p>
                    </div>
                  </div>
                </a>
                <a href="#" className="group p-4 bg-gray-50 rounded-lg hover:bg-red-50 transition-colors border border-gray-200 hover:border-red-300">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-200 transition-colors">
                      <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-sora font-semibold text-text-primary group-hover:text-red-600 transition-colors">Stack Overflow</h3>
                      <p className="text-text-secondary text-sm font-inter">Community support</p>
                    </div>
                  </div>
                </a>
                <a href="#" className="group p-4 bg-gray-50 rounded-lg hover:bg-indigo-50 transition-colors border border-gray-200 hover:border-indigo-300">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                      <svg className="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-sora font-semibold text-text-primary group-hover:text-indigo-600 transition-colors">GitHub</h3>
                      <p className="text-text-secondary text-sm font-inter">Code repositories</p>
                    </div>
                  </div>
                </a>
              </div>
            </div>

            {/* Live Sessions */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200">
              <h2 className="text-3xl font-sora font-bold text-text-primary mb-6">
                Live Sessions We Provide for Doubts Clarification
              </h2>
              <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200 mb-6">
                <h3 className="text-xl font-sora font-bold text-text-primary mb-3">Live Support We Offer:</h3>
                <p className="text-text-secondary font-inter leading-relaxed">
                  We provide regular live sessions where you can interact directly with instructors and get your doubts cleared in real-time. 
                  We also offer community support and code review sessions to ensure you never feel stuck during your learning journey.
                </p>
              </div>
              
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-sora font-bold text-text-primary mb-2">Weekly Live Q&A Sessions We Conduct</h3>
                      <p className="text-text-secondary font-inter mb-4">We organize weekly live sessions where our instructor is available to answer your questions in real-time. Get immediate clarification on concepts and interact with fellow students.</p>
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-text-secondary font-inter">We conduct sessions every Saturday, 3:00 PM IST</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span className="text-text-secondary font-inter">90 minutes duration</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <div className="flex items-center space-x-3 mb-3">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <h4 className="font-sora font-semibold text-text-primary">24/7 Community Support We Offer</h4>
                    </div>
                    <p className="text-text-secondary font-inter text-sm">We provide access to our Discord community where you can get instant help from peers and mentors anytime</p>
                  </div>
                  
                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <div className="flex items-center space-x-3 mb-3">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <h4 className="font-sora font-semibold text-text-primary">Code Review Sessions We Provide</h4>
                    </div>
                    <p className="text-text-secondary font-inter text-sm">We offer personalized code review sessions where industry experts review your assignments and provide detailed feedback</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Student Reviews */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200">
              <h2 className="text-3xl font-sora font-bold text-text-primary mb-8">
                What Our Students Say
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {course.reviews.map((review, index) => (
                  <div key={index} className="bg-gray-50 rounded-2xl p-6">
                    <div className="flex items-center mb-4">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-text-secondary font-inter mb-4 italic">&ldquo;{review.text}&rdquo;</p>
                    <div>
                      <p className="font-sora font-semibold text-text-primary">{review.name}</p>
                      <p className="text-sm text-text-secondary font-inter">{review.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Mentor Card */}
            <div className="bg-white rounded-2xl p-6 sticky top-24 border border-gray-200">
              {/* Mentor Section */}
              <div className="text-center mb-6">
                <div className="w-32 h-32 rounded-full overflow-hidden mx-auto mb-4 border-4 border-blue-100">
                  <Image
                    src={course.instructorPhoto}
                    alt={course.instructor}
                    width={128}
                    height={128}
                    className="object-cover w-full h-full"
                  />
                </div>
                <h3 className="text-xl font-sora font-bold text-text-primary mb-1">
                  {course.instructor}
                </h3>
                <p className="text-blue-600 font-inter font-semibold text-base mb-1">
                  {course.instructorTitle}
                </p>
                <p className="text-text-secondary font-inter text-xs mb-3">
                  {course.instructorExperience}
                </p>
                <div className="flex items-center justify-center space-x-2 mb-3">
                  <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-text-primary font-inter font-semibold text-sm">Expert Mentor</span>
                </div>
                <p className="text-text-secondary font-inter text-xs leading-relaxed mb-4">
                  {course.instructorDescription}
                </p>
              </div>
              
              {/* Pricing Section */}
              <div className="text-center mb-6">
                <div className="text-3xl font-sora font-black text-blue-600 mb-1">
                  {course.price}
                </div>
                <div className="text-text-secondary font-inter text-sm">
                  One-time payment • Lifetime access
                </div>
              </div>
              
              {/* Enroll Button */}
              <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-sora font-bold text-base py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-sm mb-4">
                Enroll Now
              </button>
              
              {/* Features */}
              <div className="border border-gray-200 rounded-lg p-3 space-y-2 text-xs">
                {course.features.map((feature, index) => (
                  <div key={index} className="flex items-center text-text-secondary">
                    <svg className="w-4 h-4 mr-2 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="font-inter">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
