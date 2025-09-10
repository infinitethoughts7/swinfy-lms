'use client';

import { useState } from 'react';
import CourseCard from '@/components/dashboard/CourseCard';
import StatsCard from '@/components/dashboard/StatsCard';

// Mock course data for admin
const allCourses = [
  {
    id: 'react-advanced',
    title: 'Advanced React Development',
    description: 'Master advanced React concepts including hooks, context, and performance optimization',
    image: '/assets/courses/react.svg',
    duration: '12 weeks',
    level: 'Advanced' as const,
    students: 25,
    rating: 4.8,
    status: 'active' as const,
    instructor: {
      name: 'Dr. Sarah Wilson',
      avatar: '/assets/students/s4.jpg'
    }
  },
  {
    id: 'python-basics',
    title: 'Python Fundamentals',
    description: 'Learn Python programming from scratch with hands-on projects',
    image: '/assets/courses/python.svg',
    duration: '8 weeks',
    level: 'Beginner' as const,
    students: 32,
    rating: 4.9,
    status: 'active' as const,
    instructor: {
      name: 'Prof. Michael Chen',
      avatar: '/assets/students/s5.jpg'
    }
  },
  {
    id: 'web-performance',
    title: 'Web Performance Optimization',
    description: 'Optimize website performance using modern techniques and tools',
    image: '/assets/courses/react.svg',
    duration: '6 weeks',
    level: 'Intermediate' as const,
    students: 18,
    rating: 4.7,
    status: 'draft' as const,
    instructor: {
      name: 'Dr. Sarah Wilson',
      avatar: '/assets/students/s4.jpg'
    }
  },
  {
    id: 'data-science',
    title: 'Data Science with Python',
    description: 'Comprehensive data science course using Python and its libraries',
    image: '/assets/courses/python.svg',
    duration: '16 weeks',
    level: 'Advanced' as const,
    students: 45,
    rating: 4.8,
    status: 'active' as const,
    instructor: {
      name: 'Dr. Emma Watson',
      avatar: '/assets/students/s6.jpg'
    }
  },
  {
    id: 'javascript-fundamentals',
    title: 'JavaScript Fundamentals',
    description: 'Learn core JavaScript concepts from beginner to intermediate level',
    image: '/assets/courses/javascript.svg',
    duration: '10 weeks',
    level: 'Beginner' as const,
    students: 38,
    rating: 4.6,
    status: 'active' as const,
    instructor: {
      name: 'John Martinez',
      avatar: '/assets/students/s7.jpg'
    }
  }
];

const courseStats = {
  totalCourses: allCourses.length,
  activeCourses: allCourses.filter(c => c.status === 'active').length,
  totalStudents: allCourses.reduce((sum, course) => sum + course.students, 0),
  averageRating: Number((allCourses.reduce((sum, course) => sum + course.rating, 0) / allCourses.length).toFixed(1))
};

export default function AdminCoursesPage() {
  const [filter, setFilter] = useState<'all' | 'active' | 'draft' | 'pending'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCourses = allCourses.filter(course => {
    const matchesFilter = filter === 'all' || course.status === filter;
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.instructor.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const filterCounts = {
    all: allCourses.length,
    active: allCourses.filter(c => c.status === 'active').length,
    draft: allCourses.filter(c => c.status === 'draft').length,
    pending: allCourses.filter(c => c.status === 'pending').length
  };

  const handleApproveCourse = (courseId: string) => {
    console.log('Approving course:', courseId);
  };

  const handleRejectCourse = (courseId: string) => {
    console.log('Rejecting course:', courseId);
  };

  const handleEditCourse = (courseId: string) => {
    console.log('Editing course:', courseId);
  };

  const handleDeleteCourse = (courseId: string) => {
    console.log('Deleting course:', courseId);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Course Management</h1>
          <p className="text-gray-600 mt-1">
            Oversee all courses, approve new submissions, and monitor performance
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            Export Report
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Add Course
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Courses"
          value={courseStats.totalCourses}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          }
          color="blue"
        />
        <StatsCard
          title="Active Courses"
          value={courseStats.activeCourses}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="green"
        />
        <StatsCard
          title="Total Enrollments"
          value={courseStats.totalStudents}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          }
          color="purple"
        />
        <StatsCard
          title="Avg. Rating"
          value={`${courseStats.averageRating} ⭐`}
          icon={
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          }
          color="yellow"
        />
      </div>

      {/* Pending Approvals Alert */}
      {filterCounts.pending > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-yellow-900 mb-1">
                {filterCounts.pending} Course{filterCounts.pending > 1 ? 's' : ''} Pending Approval
              </h3>
              <p className="text-yellow-700 mb-3">
                Review and approve new course submissions from tutors
              </p>
              <button 
                onClick={() => setFilter('pending')}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium"
              >
                Review Pending Courses
              </button>
            </div>
          </div>
        </div>
      )}

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
                placeholder="Search courses or instructors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
              />
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {(['all', 'active', 'draft', 'pending'] as const).map((filterOption) => (
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

        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredCourses.length} of {allCourses.length} courses
          {searchTerm && ` for "${searchTerm}"`}
          {filter !== 'all' && ` in ${filter}`}
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <div key={course.id} className="relative">
            <CourseCard
              course={course}
              variant="admin"
              showProgress={false}
              onEdit={handleEditCourse}
              onDelete={handleDeleteCourse}
            />
            
            {/* Admin-specific actions overlay */}
            {course.status === 'pending' && (
              <div className="absolute top-4 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 border border-gray-200">
                <p className="text-sm font-medium text-gray-900 mb-2">Pending Approval</p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleApproveCourse(course.id)}
                    className="flex-1 px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleRejectCourse(course.id)}
                    className="flex-1 px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                  >
                    Reject
                  </button>
                </div>
              </div>
            )}
          </div>
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

      {/* Course Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Top Performing Courses */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing</h3>
          <div className="space-y-3">
            {allCourses
              .sort((a, b) => b.rating - a.rating)
              .slice(0, 3)
              .map((course, index) => (
                <div key={course.id} className="flex items-center space-x-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                    index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-500'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{course.title}</p>
                    <p className="text-xs text-gray-500">{course.rating} ⭐ • {course.students} students</p>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Most Popular Courses */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Popular</h3>
          <div className="space-y-3">
            {allCourses
              .sort((a, b) => b.students - a.students)
              .slice(0, 3)
              .map((course, index) => (
                <div key={course.id} className="flex items-center space-x-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                    index === 0 ? 'bg-blue-500' : index === 1 ? 'bg-green-500' : 'bg-purple-500'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{course.title}</p>
                    <p className="text-xs text-gray-500">{course.students} students • {course.level}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Course Categories */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">By Difficulty</h3>
          <div className="space-y-3">
            {['Beginner', 'Intermediate', 'Advanced'].map((level) => {
              const count = allCourses.filter(c => c.level === level).length;
              const percentage = Math.round((count / allCourses.length) * 100);
              
              return (
                <div key={level} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{level}</span>
                    <span className="font-medium text-gray-900">{count} ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        level === 'Beginner' ? 'bg-green-500' :
                        level === 'Intermediate' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
