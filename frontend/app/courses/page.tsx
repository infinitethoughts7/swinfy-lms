'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { coursesApi } from '@/lib/api';

// Interface for course data from backend
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

// Updated categories to match backend choices
const categories = [
  'All', 
  'Frontend Development', 
  'Backend Development', 
  'Programming Languages',
  'Artificial Intelligence',
  'AI Tools',
  'Data Science', 
  'Data Analysis',
  'Software Engineering Essentials'
];


// Level choices to match backend
const levels = ['All', 'Beginner', 'Intermediate', 'Advanced'];

export default function CoursesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');


  // Fetch courses from backend
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const params: Record<string, string> = {};
        
        if (selectedCategory !== 'All') {
          // Map display names to backend values
          const categoryMap: { [key: string]: string } = {
            'Frontend Development': 'frontend_development',
            'Backend Development': 'backend_development',
            'Programming Languages': 'programming_languages',
            'Artificial Intelligence': 'ai',
            'AI Tools': 'ai_tools',
            'Data Science': 'data_science',
            'Data Analysis': 'data_analysis',
            'Software Engineering Essentials': 'software_engineering'
          };
          params.category = categoryMap[selectedCategory];
        }
        
        if (selectedLevel !== 'All') {
          // Map display names to backend values
          const levelMap: { [key: string]: string } = {
            'Beginner': 'beginner',
            'Intermediate': 'intermediate',
            'Advanced': 'advanced'
          };
          params.level = levelMap[selectedLevel];
        }
        
        if (searchTerm) {
          params.search = searchTerm;
        }
        
        const data = await coursesApi.getCourses(params);
        setCourses(data.results || data); // Handle both paginated and non-paginated responses
        setError('');
      } catch (err) {
        console.error('Failed to fetch courses:', err);
        setError('Failed to load courses. Please try again.');
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [searchTerm, selectedCategory, selectedLevel]);

  // Filter courses based on search term and category (for client-side filtering of fetched data)
  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (course.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
                           course.training_partner?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           course.tutor?.full_name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [courses, searchTerm]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-50 to-gray-200">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-100 via-gray-50 to-gray-200 -mt-px" style={{ paddingTop: '48px' }}>
        <div className="pb-16">
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-sora font-black text-gray-900 mb-6">
              Bridge the Gap Between Learning and Landing Jobs
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 font-inter max-w-4xl mx-auto mb-8">
              Master technical skills from top organizations, learn from expert instructors, and land your dream job
            </p>
            <div className="inline-flex items-center px-6 py-3 bg-blue-600 rounded-full text-white font-inter font-semibold shadow-lg">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Real courses from THUB, Swinfy & other top organizations
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl p-6 mb-8 border border-gray-200">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search courses, organizations, instructors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:ring-0 focus:border-gray-300 font-inter text-gray-900 placeholder-gray-500"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="lg:w-64">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="block w-full px-3 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-0 focus:border-gray-300 font-inter text-gray-900"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Level Filter */}
            <div className="lg:w-48">
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="block w-full px-3 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-0 focus:border-gray-300 font-inter text-gray-900"
              >
                {levels.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>

          </div>

          {/* Results Count */}
          <div className="mt-4 text-sm text-gray-600 font-inter">
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
                Loading courses...
              </div>
            ) : (
              <>
                Showing {filteredCourses.length} of {courses.length} courses
                {searchTerm && ` for "${searchTerm}"`}
                {selectedCategory !== 'All' && ` in ${selectedCategory}`}
                {selectedLevel !== 'All' && ` at ${selectedLevel} level`}
              </>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map((course) => {
            // Different light gradient backgrounds for variety
            
            return (
            <Link
              key={course.id}
              href={`/courses/course/${course.slug || course.id}`}
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
            );
          })}
        </div>

        {/* No Results */}
        {filteredCourses.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-sora font-bold text-gray-900 mb-2">
              No courses found
            </h3>
            <p className="text-gray-600 font-inter mb-4">
              Try adjusting your search terms or filters
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('All');
                setSelectedLevel('All');
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-inter"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

{/* 
      <div className="bg-gray-200 py-16 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="text-3xl font-sora font-bold text-blue-600 mb-2">{courses.length}</div>
              <div className="text-gray-600 font-inter">Total Courses</div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="text-3xl font-sora font-bold text-green-600 mb-2">{categories.length - 1}</div>
              <div className="text-gray-600 font-inter">Categories</div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="text-3xl font-sora font-bold text-purple-600 mb-2">
                {courses.reduce((sum, course) => sum + (course.enrollment_count || 0), 0).toLocaleString()}
              </div>
              <div className="text-gray-600 font-inter">Total Students</div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="text-3xl font-sora font-bold text-orange-600 mb-2">
                {courses.length > 0 ? (courses.reduce((sum, course) => sum + (parseFloat(course.rating) || 0), 0) / courses.length).toFixed(1) : '0.0'}
              </div>
              <div className="text-gray-600 font-inter">Average Rating</div>
            </div>
          </div>
        </div>
      </div> */}
    </div>
  );
}