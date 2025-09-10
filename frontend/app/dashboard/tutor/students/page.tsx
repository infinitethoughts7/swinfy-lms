'use client';

import { useState } from 'react';
import StudentCard from '@/components/dashboard/StudentCard';
import StatsCard from '@/components/dashboard/StatsCard';

// Mock student data for tutor
const allStudents = [
  {
    id: 'student-1',
    name: 'Emily Chen',
    email: 'emily.chen@email.com',
    avatar: '/assets/students/s1.jpg',
    enrolledCourses: 2,
    completedCourses: 1,
    progress: 75,
    lastActive: '2 hours ago',
    status: 'active' as const,
    joinDate: 'March 2024',
    performance: { score: 88, rank: 5 }
  },
  {
    id: 'student-2',
    name: 'Marcus Johnson',
    email: 'marcus.j@email.com',
    avatar: '/assets/students/s2.jpg',
    enrolledCourses: 1,
    completedCourses: 0,
    progress: 45,
    lastActive: '1 day ago',
    status: 'active' as const,
    joinDate: 'April 2024',
    performance: { score: 92, rank: 2 }
  },
  {
    id: 'student-3',
    name: 'Sofia Rodriguez',
    email: 'sofia.r@email.com',
    avatar: '/assets/students/s3.jpg',
    enrolledCourses: 3,
    completedCourses: 2,
    progress: 90,
    lastActive: '3 hours ago',
    status: 'active' as const,
    joinDate: 'February 2024',
    performance: { score: 95, rank: 1 }
  },
  {
    id: 'student-4',
    name: 'David Kim',
    email: 'david.kim@email.com',
    avatar: '/assets/students/s4.jpg',
    enrolledCourses: 2,
    completedCourses: 1,
    progress: 60,
    lastActive: '2 days ago',
    status: 'inactive' as const,
    joinDate: 'January 2024',
    performance: { score: 78, rank: 8 }
  },
  {
    id: 'student-5',
    name: 'Lisa Wang',
    email: 'lisa.wang@email.com',
    avatar: '/assets/students/s5.jpg',
    enrolledCourses: 1,
    completedCourses: 1,
    progress: 100,
    lastActive: '1 hour ago',
    status: 'active' as const,
    joinDate: 'May 2024',
    performance: { score: 96, rank: 1 }
  },
  {
    id: 'student-6',
    name: 'James Brown',
    email: 'james.brown@email.com',
    avatar: '/assets/students/s6.jpg',
    enrolledCourses: 2,
    completedCourses: 0,
    progress: 25,
    lastActive: '1 week ago',
    status: 'inactive' as const,
    joinDate: 'March 2024',
    performance: { score: 65, rank: 12 }
  }
];

const studentStats = {
  totalStudents: allStudents.length,
  activeStudents: allStudents.filter(s => s.status === 'active').length,
  avgPerformance: Math.round(allStudents.reduce((sum, student) => sum + student.performance.score, 0) / allStudents.length),
  completionRate: Math.round((allStudents.reduce((sum, student) => sum + student.completedCourses, 0) / allStudents.reduce((sum, student) => sum + student.enrolledCourses, 0)) * 100)
};

export default function TutorStudentsPage() {
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStudents = allStudents.filter(student => {
    const matchesFilter = filter === 'all' || student.status === filter;
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const filterCounts = {
    all: allStudents.length,
    active: allStudents.filter(s => s.status === 'active').length,
    inactive: allStudents.filter(s => s.status === 'inactive').length
  };

  const handleViewProfile = (studentId: string) => {
    console.log('Viewing student profile:', studentId);
  };

  const handleSendMessage = (studentId: string) => {
    console.log('Sending message to student:', studentId);
  };

  const handleManageStudent = (studentId: string) => {
    console.log('Managing student:', studentId);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Students</h1>
          <p className="text-gray-600 mt-1">
            Monitor student progress and engagement across your courses
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Export Student Data
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Students"
          value={studentStats.totalStudents}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          }
          color="blue"
        />
        <StatsCard
          title="Active Students"
          value={studentStats.activeStudents}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="green"
          change={{ value: 8, type: 'increase', timeframe: 'this month' }}
        />
        <StatsCard
          title="Avg. Performance"
          value={`${studentStats.avgPerformance}%`}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
          color="purple"
          change={{ value: 3, type: 'increase', timeframe: 'this month' }}
        />
        <StatsCard
          title="Completion Rate"
          value={`${studentStats.completionRate}%`}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
          color="yellow"
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
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
              />
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {(['all', 'active', 'inactive'] as const).map((filterOption) => (
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

          {/* View Mode Toggle */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredStudents.length} of {allStudents.length} students
          {searchTerm && ` for "${searchTerm}"`}
          {filter !== 'all' && ` in ${filter}`}
        </div>
      </div>

      {/* Students Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((student) => (
            <StudentCard
              key={student.id}
              student={student}
              variant="grid"
              onViewProfile={handleViewProfile}
              onSendMessage={handleSendMessage}
              onManage={handleManageStudent}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredStudents.map((student) => (
            <StudentCard
              key={student.id}
              student={student}
              variant="list"
              onViewProfile={handleViewProfile}
              onSendMessage={handleSendMessage}
              onManage={handleManageStudent}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredStudents.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">👥</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No students found
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm 
              ? `No students match "${searchTerm}"`
              : `No ${filter} students available`
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

      {/* Top Performers */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performers This Month</h3>
        <div className="space-y-3">
          {allStudents
            .sort((a, b) => b.performance.score - a.performance.score)
            .slice(0, 3)
            .map((student, index) => (
              <div key={student.id} className="flex items-center space-x-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                  index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-500'
                }`}>
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{student.name}</p>
                  <p className="text-sm text-gray-500">{student.performance.score}% performance</p>
                </div>
                <div className="text-sm text-gray-500">
                  {student.completedCourses}/{student.enrolledCourses} courses
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
