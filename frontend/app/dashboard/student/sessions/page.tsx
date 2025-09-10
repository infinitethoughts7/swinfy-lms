'use client';

import { useState } from 'react';
import LiveSessionCard from '@/components/dashboard/LiveSessionCard';
import StatsCard from '@/components/dashboard/StatsCard';

// Mock data for student sessions
const allSessions = [
  {
    id: 'session-1',
    title: 'React Performance Optimization',
    course: 'Advanced React Development',
    instructor: {
      name: 'Dr. Sarah Wilson',
      avatar: '/assets/students/s4.jpg'
    },
    startTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
    duration: 90,
    participants: 15,
    maxParticipants: 25,
    status: 'upcoming' as const,
    description: 'Learn advanced techniques for optimizing React application performance, including memoization, lazy loading, and code splitting.'
  },
  {
    id: 'session-2',
    title: 'SQL Joins and Subqueries',
    course: 'SQL Database Management',
    instructor: {
      name: 'Dr. Lisa Rodriguez',
      avatar: '/assets/students/s6.jpg'
    },
    startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // tomorrow
    duration: 60,
    participants: 0,
    maxParticipants: 30,
    status: 'upcoming' as const,
    description: 'Master complex SQL queries with joins and subqueries. Practice with real-world database scenarios.'
  },
  {
    id: 'session-3',
    title: 'Python Data Structures Deep Dive',
    course: 'Data Analysis with Python',
    instructor: {
      name: 'Dr. Emma Watson',
      avatar: '/assets/students/s8.jpg'
    },
    startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
    duration: 120,
    participants: 0,
    maxParticipants: 20,
    status: 'upcoming' as const,
    description: 'Explore advanced Python data structures and their applications in data analysis.'
  },
  {
    id: 'session-4',
    title: 'JavaScript ES6 Features Workshop',
    course: 'Modern JavaScript (ES6+)',
    instructor: {
      name: 'John Martinez',
      avatar: '/assets/students/s7.jpg'
    },
    startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    duration: 90,
    status: 'ended' as const,
    recordingAvailable: true,
    description: 'Hands-on workshop covering arrow functions, destructuring, promises, and async/await.'
  },
  {
    id: 'session-5',
    title: 'Python Fundamentals Q&A',
    course: 'Python Fundamentals',
    instructor: {
      name: 'Prof. Michael Chen',
      avatar: '/assets/students/s5.jpg'
    },
    startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
    duration: 60,
    status: 'ended' as const,
    recordingAvailable: true,
    description: 'Q&A session covering Python basics, common mistakes, and best practices.'
  },
  {
    id: 'session-6',
    title: 'SQL Database Design Principles',
    course: 'SQL Database Management',
    instructor: {
      name: 'Dr. Lisa Rodriguez',
      avatar: '/assets/students/s6.jpg'
    },
    startTime: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
    duration: 90,
    status: 'ended' as const,
    recordingAvailable: false,
    description: 'Learn the principles of good database design, normalization, and entity relationships.'
  }
];

const sessionStats = {
  totalSessions: allSessions.length,
  upcoming: allSessions.filter(s => s.status === 'upcoming').length,
  attended: allSessions.filter(s => s.status === 'ended').length,
  thisWeek: allSessions.filter(s => {
    const sessionDate = new Date(s.startTime);
    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return sessionDate >= now && sessionDate <= weekFromNow && s.status === 'upcoming';
  }).length
};

export default function StudentSessionsPage() {
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'ended'>('upcoming');

  const filteredSessions = allSessions.filter(session => {
    if (filter === 'all') return true;
    return session.status === filter;
  });

  const filterCounts = {
    all: allSessions.length,
    upcoming: allSessions.filter(s => s.status === 'upcoming').length,
    ended: allSessions.filter(s => s.status === 'ended').length
  };

  const handleJoinSession = (sessionId: string) => {
    console.log('Joining session:', sessionId);
    // In a real app, this would redirect to the video conference
  };

  const handleViewRecording = (sessionId: string) => {
    console.log('Viewing recording:', sessionId);
    // In a real app, this would open the recorded session
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Live Sessions</h1>
          <p className="text-gray-600 mt-1">
            Join live sessions and access recordings from your courses
          </p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Schedule 1-on-1 Session
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Sessions"
          value={sessionStats.totalSessions}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          }
          color="blue"
        />
        <StatsCard
          title="Upcoming"
          value={sessionStats.upcoming}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="yellow"
          change={{ value: 1, type: 'increase', timeframe: 'this week' }}
        />
        <StatsCard
          title="Attended"
          value={sessionStats.attended}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="green"
        />
        <StatsCard
          title="This Week"
          value={sessionStats.thisWeek}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
          color="purple"
        />
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 w-fit">
          {(['upcoming', 'ended', 'all'] as const).map((filterOption) => (
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
          Showing {filteredSessions.length} {filter === 'all' ? '' : filter} sessions
        </div>
      </div>

      {/* Next Session Alert */}
      {sessionStats.upcoming > 0 && filter === 'upcoming' && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-blue-900 mb-1">
                Next Session Starting Soon!
              </h3>
              <p className="text-blue-700 mb-3">
                {allSessions.find(s => s.status === 'upcoming')?.title} starts in 2 hours
              </p>
              <button 
                onClick={() => handleJoinSession(allSessions.find(s => s.status === 'upcoming')?.id || '')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Prepare to Join
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sessions List */}
      <div className="space-y-6">
        {filteredSessions.map((session) => (
          <LiveSessionCard
            key={session.id}
            session={session}
            variant="student"
            onJoin={handleJoinSession}
            onViewRecording={handleViewRecording}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredSessions.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎥</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No {filter === 'all' ? '' : filter} sessions
          </h3>
          <p className="text-gray-600 mb-4">
            {filter === 'upcoming' 
              ? "You don't have any upcoming sessions scheduled."
              : filter === 'ended'
              ? "You haven't attended any sessions yet."
              : "No sessions available."
            }
          </p>
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Browse Available Sessions
          </button>
        </div>
      )}
    </div>
  );
}
