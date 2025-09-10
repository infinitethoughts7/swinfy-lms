'use client';

import { useState } from 'react';
import CourseCard from '@/components/dashboard/CourseCard';
import StatsCard from '@/components/dashboard/StatsCard';

// Mock data for student courses
const allCourses = [
  {
    id: 'react-advanced',
    title: 'Advanced React Development',
    description: 'Master advanced React concepts including hooks, context, and performance optimization',
    image: '/assets/courses/react.svg',
    duration: '12 weeks',
    level: 'Advanced' as const,
    progress: 65,
    instructor: {
      name: 'Dr. Sarah Wilson',
      avatar: '/assets/students/s4.jpg'
    },
    lastAccessed: '2 hours ago',
    status: 'active' as const,
    rating: 4.8,
    students: 234
  },
  {
    id: 'python-basics',
    title: 'Python Fundamentals',
    description: 'Learn Python programming from scratch with hands-on projects',
    image: '/assets/courses/python.svg',
    duration: '8 weeks',
    level: 'Beginner' as const,
    progress: 100,
    instructor: {
      name: 'Prof. Michael Chen',
      avatar: '/assets/students/s5.jpg'
    },
    lastAccessed: '1 day ago',
    status: 'completed' as const,
    rating: 4.9,
    students: 189
  },
  {
    id: 'sql-database',
    title: 'SQL Database Management',
    description: 'Master SQL queries and database design principles',
    image: '/assets/courses/sql.png',
    duration: '10 weeks',
    level: 'Intermediate' as const,
    progress: 30,
    instructor: {
      name: 'Dr. Lisa Rodriguez',
      avatar: '/assets/students/s6.jpg'
    },
    lastAccessed: '3 days ago',
    status: 'active' as const,
    rating: 4.7,
    students: 156
  },
  {
    id: 'javascript-es6',
    title: 'Modern JavaScript (ES6+)',
    description: 'Learn modern JavaScript features and best practices',
    image: '/assets/courses/javascript.svg',
    duration: '6 weeks',
    level: 'Intermediate' as const,
    progress: 0,
    instructor: {
      name: 'John Martinez',
      avatar: '/assets/students/s7.jpg'
    },
    lastAccessed: 'Never',
    status: 'upcoming' as const,
    rating: 4.6,
    students: 201
  },
  {
    id: 'data-analysis',
    title: 'Data Analysis with Python',
    description: 'Analyze data using Python libraries like Pandas and NumPy',
    image: '/assets/courses/python.svg',
    duration: '14 weeks',
    level: 'Advanced' as const,
    progress: 15,
    instructor: {
      name: 'Dr. Emma Watson',
      avatar: '/assets/students/s8.jpg'
    },
    lastAccessed: '1 week ago',
    status: 'active' as const,
    rating: 4.8,
    students: 167
  }
];

const courseStats = {
  totalEnrolled: allCourses.length,
  completed: allCourses.filter(c => c.status === 'completed').length,
  inProgress: allCourses.filter(c => c.status === 'active').length,
  averageProgress: Math.round(allCourses.reduce((sum, course) => sum + course.progress, 0) / allCourses.length)
};

export default function StudentCoursesPage() {
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'upcoming'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCourses = allCourses.filter(course => {
    const matchesFilter = filter === 'all' || course.status === filter;
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const filterCounts = {
    all: allCourses.length,
    active: allCourses.filter(c => c.status === 'active').length,
    completed: allCourses.filter(c => c.status === 'completed').length,
    upcoming: allCourses.filter(c => c.status === 'upcoming').length
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>
          <p className="text-gray-600 mt-1">
            Track your learning progress and continue your courses
          </p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Browse New Courses
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Enrolled"
          value={courseStats.totalEnrolled}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          }
          color="blue"
        />
        <StatsCard
          title="In Progress"
          value={courseStats.inProgress}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="yellow"
        />
        <StatsCard
          title="Completed"
          value={courseStats.completed}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="green"
        />
        <StatsCard
          title="Average Progress"
          value={`${courseStats.averageProgress}%`}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
          color="purple"
        />
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
              />
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {(['all', 'active', 'completed', 'upcoming'] as const).map((filterOption) => (
              <button
                key={filterOption}
                onClick={() => setFilter(filterOption)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filter === filterOption
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
                <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                  {filterCounts[filterOption]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredCourses.length} of {allCourses.length} courses
          {searchTerm && ` for "${searchTerm}"`}
          {filter !== 'all' && ` in ${filter}`}
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            variant="student"
            showProgress={true}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No courses found
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm 
              ? `No courses match "${searchTerm}"`
              : `No ${filter} courses available`
            }
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setFilter('all');
            }}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}
