// frontend/components/sections/FeaturedCoursesSlider.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { coursesApi } from '@/lib/api';
import Link from 'next/link';

interface Course {
  id: string;
  title: string;
  slug: string;
  short_description: string;
  description?: string;
  category: string;
  category_display: string;
  level: string;
  level_display: string;
  duration_weeks: number;
  price: string;
  thumbnail: string | null;
  thumbnail_url?: string | null;
  rating: string;
  total_reviews: number;
  enrollment_count: number;
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
  };
  is_featured: boolean;
  created_at: string;
}

const FeaturedCoursesSlider = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const coursesPerView = 3;

  // Fetch featured courses from API
  useEffect(() => {
    const fetchFeaturedCourses = async () => {
      try {
        setLoading(true);
        setError('');
        
        const data = await coursesApi.getCourses({ featured: true });
        const coursesData = data.results || data;
        
        const featuredCourses = Array.isArray(coursesData) 
          ? coursesData.slice(0, 6) 
          : [];
        
        setCourses(featuredCourses);
      } catch (err) {
        console.error('Error fetching featured courses:', err);
        setError('Failed to load featured courses');
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedCourses();
  }, []);

  // Auto-slide functionality
  useEffect(() => {
    if (courses.length <= coursesPerView || isHovered) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const maxIndex = Math.ceil(courses.length / coursesPerView) - 1;
        return prevIndex >= maxIndex ? 0 : prevIndex + 1;
      });
    }, 4000); // Auto-slide every 4 seconds

    return () => clearInterval(interval);
  }, [courses.length, coursesPerView, isHovered]);

  // Show loading state
  if (loading) {
    return (
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center text-gray-900">Featured Courses</h2>
          <div className="flex flex-col items-center justify-center py-12 min-h-[300px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="mt-3 text-gray-600 text-center">Loading featured courses...</span>
          </div>
        </div>
      </section>
    );
  }

  // Show error state
  if (error) {
    return (
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center text-gray-900">Featured Courses</h2>
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  // Show empty state
  if (courses.length === 0) {
    return (
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center text-gray-900">Featured Courses</h2>
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No featured courses available at the moment.</p>
            <Link 
              href="/courses" 
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              View All Courses
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Featured Courses</h2>
        </div>
        
        <div 
          className="relative max-w-7xl mx-auto"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Course cards container */}
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-700 ease-in-out gap-6"
              style={{ transform: `translateX(-${currentIndex * (100 / coursesPerView)}%)` }}
            >
              {courses.map((course) => (
                <div key={course.id} className="flex-shrink-0 w-full sm:w-1/2 lg:w-1/3">
                  <Link 
                    href={`/courses/course/${course.slug}`}
                    className="group block bg-white rounded-xl transition-all duration-200 hover:shadow-lg overflow-hidden border border-gray-200"
                  >
                    {/* Course Thumbnail */}
                    <div className="relative h-40 overflow-hidden">
                      {/* Course Thumbnail - Full Background */}
                      {(course.thumbnail_url || course.thumbnail) ? (
                        <img
                          src={course.thumbnail_url || course.thumbnail || ''}
                          alt={course.title}
                          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            // Hide the broken image and show fallback
                            target.style.display = 'none';
                            const fallback = target.nextElementSibling as HTMLElement;
                            if (fallback) fallback.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      {/* Fallback gradient - always present but hidden if image loads */}
                      <div 
                        className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center"
                        style={{ display: (course.thumbnail_url || course.thumbnail) ? 'none' : 'flex' }}
                      >
                        <div className="text-white text-center">
                          <div className="text-4xl mb-2">📚</div>
                          <div className="text-sm font-medium">{course.category_display}</div>
                        </div>
                      </div>
                      
                      {/* Badges */}
                      <div className="absolute inset-x-0 top-0 p-3 flex items-start justify-between">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium ${
                          course.level_display === 'Beginner' ? 'bg-green-600 text-white' :
                          course.level_display === 'Intermediate' ? 'bg-yellow-600 text-white' :
                          course.level_display === 'Advanced' ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'
                        }`}>{course.level_display || course.level}</span>
                      </div>
                      <div className="absolute bottom-3 left-3">
                        <span className="px-2.5 py-0.5 bg-white/95 text-gray-800 text-[10px] font-medium rounded-full border border-gray-200">
                          {course.category_display || course.category}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      {/* Organization name only */}
                      {course.training_partner && (
                        <div className="mb-1 flex items-center text-sm font-medium text-blue-600">
                          {course.training_partner.name}
                        </div>
                      )}
                      
                      <h3 className="text-lg font-sora font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {course.title}
                      </h3>
                      <p className="text-gray-600 font-inter text-xs mb-3 line-clamp-2">
                        {course.short_description}
                      </p>
                      
                      {/* Instructor Info */}
                      {course.tutor && (
                        <div className="mb-3 text-xs text-gray-600 inline-flex items-center px-2 py-1 bg-gray-50 rounded border border-gray-200">
                          <svg className="w-3 h-3 mr-1 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                          <span className="text-gray-500 mr-1">Instructor:</span>
                          {course.tutor.full_name}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between text-xs mb-3">
                        <div className="flex items-center text-gray-600 gap-4">
                          <span className="inline-flex items-center">
                            <svg className="w-4 h-4 mr-1 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            {parseFloat(course.rating || '0').toFixed(1)}
                          </span>
                          <span className="inline-flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {course.duration_weeks ? `${course.duration_weeks} weeks` : 'TBD'}
                          </span>
                          <span className="inline-flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197" />
                            </svg>
                            {(course.enrollment_count || 0).toLocaleString()} students
                          </span>
                        </div>
                        <div className="text-green-600 font-inter font-bold text-base">₹{parseFloat(course.price).toFixed(0)}</div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-blue-600 font-medium text-sm group-hover:text-blue-700">View Details →</span>
                        <span className="text-xs text-gray-500">{course.enrollment_count > 0 ? `${course.enrollment_count} enrolled` : 'New course'}</span>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Pagination dots */}
          {courses.length > coursesPerView && (
            <div className="flex justify-center space-x-2 mt-8">
              {Array.from({ length: Math.ceil(courses.length / coursesPerView) }, (_, index) => (
                <button
                  key={index}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    index === currentIndex 
                      ? 'bg-blue-600 w-8' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  onClick={() => setCurrentIndex(index)}
                />
              ))}
            </div>
          )}
        </div>
        
        {/* View All Courses Link - Bottom Right */}
        <div className="flex justify-end mt-8">
          <Link 
            href="/courses" 
            className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            View All Courses →
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCoursesSlider;