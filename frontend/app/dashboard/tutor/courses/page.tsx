'use client';

import { useState } from 'react';
import CourseCard from '@/components/dashboard/CourseCard';
import StatsCard from '@/components/dashboard/StatsCard';

// Mock data for tutor courses
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
    status: 'active' as const
  },
  {
    id: 'javascript-fundamentals',
    title: 'JavaScript Fundamentals',
    description: 'Learn core JavaScript concepts from beginner to intermediate level',
    image: '/assets/courses/javascript.svg',
    duration: '8 weeks',
    level: 'Beginner' as const,
    students: 32,
    rating: 4.9,
    status: 'active' as const
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
    status: 'upcoming' as const
  },
  {
    id: 'react-testing',
    title: 'React Testing Best Practices',
    description: 'Learn to test React applications with Jest and React Testing Library',
    image: '/assets/courses/react.svg',
    duration: '4 weeks',
    level: 'Advanced' as const,
    students: 0,
    rating: 0,
    status: 'draft' as const
  }
];

const courseStats = {
  totalCourses: allCourses.length,
  activeCourses: allCourses.filter(c => c.status === 'active').length,
  totalStudents: allCourses.reduce((sum, course) => sum + course.students, 0),
  averageRating: Number((allCourses.filter(c => c.rating > 0).reduce((sum, course) => sum + course.rating, 0) / allCourses.filter(c => c.rating > 0).length).toFixed(1))
};

export default function TutorCoursesPage() {
  const [filter, setFilter] = useState<'all' | 'active' | 'upcoming' | 'draft'>('all');

  const filteredCourses = allCourses.filter(course => {
    if (filter === 'all') return true;
    return course.status === filter;
  });

  const filterCounts = {
    all: allCourses.length,
    active: allCourses.filter(c => c.status === 'active').length,
    upcoming: allCourses.filter(c => c.status === 'upcoming').length,
    draft: allCourses.filter(c => c.status === 'draft').length
  };

  const handleEditCourse = (courseId: string) => {
    console.log('Editing course:', courseId);
  };

  const handleDeleteCourse = (courseId: string) => {
    console.log('Deleting course:', courseId);
  };

  const handleCreateCourse = () => {
    console.log('Creating new course...');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>
          <p className="text-gray-600 mt-1">
            Manage your courses and track student engagement
          </p>
        </div>
        <button 
          onClick={handleCreateCourse}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Create New Course
        </button>
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
          title="Total Students"
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

      {/* Filter Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 w-fit">
          {(['all', 'active', 'upcoming', 'draft'] as const).map((filterOption) => (
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

        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredCourses.length} of {allCourses.length} courses
          {filter !== 'all' && ` in ${filter}`}
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            variant="tutor"
            showProgress={false}
            onEdit={handleEditCourse}
            onDelete={handleDeleteCourse}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No {filter === 'all' ? '' : filter} courses
          </h3>
          <p className="text-gray-600 mb-4">
            {filter === 'draft' 
              ? "You don't have any draft courses. Start creating one!"
              : filter === 'upcoming'
              ? "No upcoming courses scheduled."
              : "You don't have any courses yet."
            }
          </p>
          <button
            onClick={handleCreateCourse}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Your First Course
          </button>
        </div>
      )}

      {/* Course Performance Insights */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Performance Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">92%</div>
            <div className="text-sm text-gray-600">Average Completion Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">4.8</div>
            <div className="text-sm text-gray-600">Average Student Rating</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">156</div>
            <div className="text-sm text-gray-600">Total Hours Taught</div>
          </div>
        </div>
      </div>
    </div>
  );
}
