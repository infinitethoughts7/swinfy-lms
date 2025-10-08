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
  const coursesPerView = 3;

  // Fetch featured courses from API
  useEffect(() => {
    const fetchFeaturedCourses = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Fetch featured courses (limit to 5-6 courses)
        const data = await coursesApi.getCourses({ featured: true });
        const coursesData = data.results || data;
        
        // Take only first 5-6 courses for the slider
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

  const maxIndex = Math.max(0, courses.length - coursesPerView);

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? maxIndex : prevIndex - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex >= maxIndex ? 0 : prevIndex + 1));
  };


  // Show loading state
  if (loading) {
    return (
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center text-gray-900">Featured Courses</h2>
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading featured courses...</span>
          </div>
        </div>
      </section>
    );
  }

  // Show error state
  if (error) {
    return (
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
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
        <div className="container mx-auto px-4">
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
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Featured Courses</h2>
          <Link 
            href="/courses" 
            className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            View All Courses →
          </Link>
        </div>
        
        <div className="relative max-w-7xl mx-auto">
          {/* Slider controls */}
          {courses.length > coursesPerView && (
            <>
              <button 
                className="absolute top-1/2 -left-4 transform -translate-y-1/2 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-200 z-10 border border-gray-200"
                onClick={prevSlide}
                disabled={currentIndex === 0}
              >
                <ChevronLeft className={`w-6 h-6 ${currentIndex === 0 ? 'text-gray-400' : 'text-gray-600'}`} />
              </button>
              <button
                className="absolute top-1/2 -right-4 transform -translate-y-1/2 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-200 z-10 border border-gray-200"
                onClick={nextSlide}
                disabled={currentIndex >= maxIndex}
              >
                <ChevronRight className={`w-6 h-6 ${currentIndex >= maxIndex ? 'text-gray-400' : 'text-gray-600'}`} />
              </button>
            </>
          )}

          {/* Course cards container */}
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-300 ease-in-out gap-6"
              style={{ transform: `translateX(-${currentIndex * (100 / coursesPerView)}%)` }}
            >
              {courses.map((course) => (
                <div key={course.id} className="flex-shrink-0 w-full sm:w-1/2 lg:w-1/3">
                  <Link 
                    href={`/courses/course/${course.slug}`}
                    className="block"
                  >
                    <Card className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white border-0 shadow-md cursor-pointer group">
                      <CardHeader className="p-0">
                        <div className="relative h-40 overflow-hidden rounded-t-lg">
                          <img 
                            src={course.thumbnail_url || course.thumbnail || '/assets/courses/default.svg'}
                            alt={course.title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute top-3 right-3">
                            <span className="bg-black/60 backdrop-blur-sm text-white text-xs font-semibold px-2 py-1 rounded-full">
                              {course.level_display || course.level}
                            </span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4">
                        <CardTitle className="text-base font-bold mb-2 text-gray-900 line-clamp-2 leading-tight">
                          {course.title}
                        </CardTitle>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-bold text-blue-600">
                            {course.training_partner.name}
                          </span>
                          <span className="text-sm text-gray-800 font-medium">
                            {course.category_display || course.category}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1">
                            <div className="flex text-yellow-400">
                              {[...Array(Math.floor(parseFloat(course.rating) || 0))].map((_, i) => (
                                <Star key={i} className="w-3 h-3 fill-current" />
                              ))}
                              {(parseFloat(course.rating) || 0) % 1 !== 0 && (
                                <Star className="w-3 h-3 fill-current opacity-50" />
                              )}
                            </div>
                            <span className="text-xs text-gray-600 ml-1">
                              {course.rating || '0.0'}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">
                            ({course.total_reviews || 0})
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Pagination dots */}
          {courses.length > coursesPerView && (
            <div className="flex justify-center space-x-2 mt-8">
              {Array.from({ length: maxIndex + 1 }, (_, index) => (
                <button
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${
                    index === currentIndex 
                      ? 'bg-blue-600 scale-110' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  onClick={() => setCurrentIndex(index)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCoursesSlider;