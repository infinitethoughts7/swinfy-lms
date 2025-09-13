'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  thumbnail: string;
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

// Updated categories to match backend choices
const categories = [
  'All', 
  'Frontend Development', 
  'Backend Development', 
  'Data Science', 
  'DevOps',
  'AI for Kids',
  'Programming for Kids',
  'Machine Learning',
  'Web Development',
  'Mobile Development',
  'UI/UX Design',
  'Cloud Computing',
  'Cybersecurity',
  'Database Management',
  'Software Testing',
  'Project Management',
  'Digital Marketing',
  'Graphic Design',
  'Video Editing',
  'Photography',
  'Music Production',
  'Language Learning',
  'Business Skills',
  'Personal Development',
  'Health & Fitness',
  'Cooking',
  'Art & Crafts',
  'Other'
];


export default function CoursesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
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
            'Data Science': 'data_science',
            'DevOps': 'devops',
            'AI for Kids': 'ai_kids',
            'Programming for Kids': 'programming_kids',
            'Machine Learning': 'machine_learning',
            'Web Development': 'web_development',
            'Mobile Development': 'mobile_development',
            'UI/UX Design': 'ui_ux_design',
            'Cloud Computing': 'cloud_computing',
            'Cybersecurity': 'cybersecurity',
            'Database Management': 'database_management',
            'Software Testing': 'software_testing',
            'Project Management': 'project_management',
            'Digital Marketing': 'digital_marketing',
            'Graphic Design': 'graphic_design',
            'Video Editing': 'video_editing',
            'Photography': 'photography',
            'Music Production': 'music_production',
            'Language Learning': 'language_learning',
            'Business Skills': 'business_skills',
            'Personal Development': 'personal_development',
            'Health & Fitness': 'health_fitness',
            'Cooking': 'cooking',
            'Art & Crafts': 'art_crafts',
            'Other': 'other'
          };
          params.category = categoryMap[selectedCategory];
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
  }, [searchTerm, selectedCategory]);

  // Filter courses based on search term and category (for client-side filtering of fetched data)
  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           course.organization?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           course.instructor?.full_name.toLowerCase().includes(searchTerm.toLowerCase());
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
              Real courses from TCS, IISc & other top organizations
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
          {filteredCourses.map((course, index) => {
            // Different light gradient backgrounds for variety
            
            return (
            <Link
              key={course.id}
              href={`/courses/course/${course.slug || course.id}`}
              className="group block bg-white rounded-2xl transition-all duration-300 transform hover:scale-105 hover:rounded-3xl overflow-hidden border border-gray-200"
            >
              {/* Course Thumbnail Background */}
              <div className="relative h-48 overflow-hidden">
                {/* Course Thumbnail - Full Background */}
                <Image
                  src={course.thumbnail || '/assets/courses/python.svg'}
                  alt={course.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/assets/courses/python.svg';
                  }}
                />
                
                {/* Dark Overlay for Better Text Readability */}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300"></div>
                
                {/* Level Badge */}
                <div className="absolute top-4 right-4 z-10">
                  <span className={`px-3 py-1 rounded-full text-xs font-inter font-medium backdrop-blur-sm ${
                    course.level_display === 'Beginner' ? 'bg-green-500/90 text-white' :
                    course.level_display === 'Intermediate' ? 'bg-yellow-500/90 text-white' :
                    course.level_display === 'Advanced' ? 'bg-red-500/90 text-white' :
                    'bg-blue-500/90 text-white'
                  }`}>
                    {course.level_display || course.level}
                  </span>
                </div>
                
                {/* Category Badge */}
                <div className="absolute bottom-4 left-4 right-4">
                  <span className="inline-block px-3 py-1 bg-white/95 backdrop-blur-sm text-gray-800 text-xs font-inter rounded-lg border border-gray-200">
                    {course.category_display || course.category}
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                {/* Training Partner Name - Prominent Display */}
                {course.training_partner && (
                  <div className="mb-3">
                    <div className="flex items-center mb-2">
                      <div className="w-6 h-6 mr-2">
                        {course.training_partner.name === 'MAT' ? (
                          <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-blue-800 rounded flex items-center justify-center">
                            <span className="text-white font-bold text-xs">MAT</span>
                          </div>
                        ) : course.training_partner.name === 'Swinfy' ? (
                          <div className="w-6 h-6 bg-gradient-to-br from-purple-600 to-purple-800 rounded flex items-center justify-center">
                            <span className="text-white font-bold text-xs">S</span>
                          </div>
                        ) : (
                          <div className="w-6 h-6 bg-gradient-to-br from-gray-600 to-gray-800 rounded flex items-center justify-center">
                            <span className="text-white font-bold text-xs">
                              {course.training_partner.name?.charAt(0) || 'O'}
                            </span>
                          </div>
                        )}
                      </div>
                      <span className="text-blue-600 font-inter font-semibold text-sm">
                        {course.training_partner.name}
                      </span>
                    </div>
                  </div>
                )}
                
                <h3 className="text-xl font-sora font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {course.title}
                </h3>
                <p className="text-gray-600 font-inter text-sm mb-4 line-clamp-2">
                  {course.short_description}
                </p>
                
                {/* Instructor Info */}
                {course.tutor && (
                  <div className="mb-3 p-2 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="text-xs text-gray-600">
                      <span className="inline-flex items-center">
                        <svg className="w-3 h-3 mr-1 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-500 mr-1">Instructor:</span>
                        {course.tutor.full_name}
                      </span>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-between text-sm mb-4">
                  <div className="flex items-center text-gray-600">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {course.rating || 0}
                  </div>
                  <div className="text-gray-600">
                    {(course.enrollment_count || 0).toLocaleString()} students
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-gray-600 text-sm">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {course.duration_weeks ? `${course.duration_weeks} weeks` : 'TBD'}
                  </div>
                  <div className="text-blue-600 font-inter font-medium text-sm group-hover:text-blue-700 transition-colors">
                    View Details →
                  </div>
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
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-inter"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Stats Section */}
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
                {courses.length > 0 ? (courses.reduce((sum, course) => sum + (course.rating || 0), 0) / courses.length).toFixed(1) : '0.0'}
              </div>
              <div className="text-gray-600 font-inter">Average Rating</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}