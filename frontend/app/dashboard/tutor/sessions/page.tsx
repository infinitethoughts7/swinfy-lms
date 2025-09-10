'use client';

import { useState } from 'react';
import LiveSessionCard from '@/components/dashboard/LiveSessionCard';
import StatsCard from '@/components/dashboard/StatsCard';

// Mock session data for tutor
const allSessions = [
  {
    id: 'session-1',
    title: 'React Hooks Deep Dive',
    course: 'Advanced React Development',
    instructor: {
      name: 'Dr. Michael Chen',
      avatar: '/assets/students/s5.jpg'
    },
    startTime: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(), // 3 hours from now
    duration: 90,
    participants: 18,
    maxParticipants: 25,
    status: 'upcoming' as const,
    description: 'Deep dive into React hooks patterns and custom hooks development'
  },
  {
    id: 'session-2',
    title: 'JavaScript ES6+ Features',
    course: 'JavaScript Fundamentals',
    instructor: {
      name: 'Dr. Michael Chen',
      avatar: '/assets/students/s5.jpg'
    },
    startTime: new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString(), // tomorrow
    duration: 60,
    participants: 0,
    maxParticipants: 30,
    status: 'upcoming' as const,
    description: 'Explore modern JavaScript features including arrow functions, destructuring, and async/await'
  },
  {
    id: 'session-3',
    title: 'React Performance Optimization Workshop',
    course: 'Advanced React Development',
    instructor: {
      name: 'Dr. Michael Chen',
      avatar: '/assets/students/s5.jpg'
    },
    startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    duration: 120,
    status: 'ended' as const,
    recordingAvailable: true,
    description: 'Workshop on React performance optimization techniques'
  },
  {
    id: 'session-4',
    title: 'JavaScript Closures and Scope',
    course: 'JavaScript Fundamentals',
    instructor: {
      name: 'Dr. Michael Chen',
      avatar: '/assets/students/s5.jpg'
    },
    startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
    duration: 90,
    status: 'ended' as const,
    recordingAvailable: true,
    description: 'Understanding JavaScript closures and lexical scope'
  },
  {
    id: 'session-5',
    title: 'Building React Components',
    course: 'Advanced React Development',
    instructor: {
      name: 'Dr. Michael Chen',
      avatar: '/assets/students/s5.jpg'
    },
    startTime: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 2 weeks ago
    duration: 90,
    status: 'ended' as const,
    recordingAvailable: false,
    description: 'Best practices for building reusable React components'
  }
];

const sessionStats = {
  totalSessions: allSessions.length,
  upcoming: allSessions.filter(s => s.status === 'upcoming').length,
  completed: allSessions.filter(s => s.status === 'ended').length,
  thisWeek: allSessions.filter(s => {
    const sessionDate = new Date(s.startTime);
    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return sessionDate >= now && sessionDate <= weekFromNow && s.status === 'upcoming';
  }).length
};

export default function TutorSessionsPage() {
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

  const handleStartSession = (sessionId: string) => {
    console.log('Starting session:', sessionId);
  };

  const handleEditSession = (sessionId: string) => {
    console.log('Editing session:', sessionId);
  };

  const handleCancelSession = (sessionId: string) => {
    console.log('Cancelling session:', sessionId);
  };

  const handleScheduleSession = () => {
    console.log('Scheduling new session...');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Live Sessions</h1>
          <p className="text-gray-600 mt-1">
            Manage your live sessions and engage with students
          </p>
        </div>
        <button 
          onClick={handleScheduleSession}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Schedule New Session
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
        />
        <StatsCard
          title="Completed"
          value={sessionStats.completed}
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

      {/* Quick Actions Bar */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-blue-900 mb-1">Ready to teach?</h3>
            <p className="text-blue-700">Start a session or schedule one for later</p>
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={handleStartSession}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              🔴 Start Live Session
            </button>
            <button 
              onClick={handleScheduleSession}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              📅 Schedule Session
            </button>
          </div>
        </div>
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

      {/* Sessions List */}
      <div className="space-y-6">
        {filteredSessions.map((session) => (
          <LiveSessionCard
            key={session.id}
            session={session}
            variant="tutor"
            onJoin={handleStartSession}
            onEdit={handleEditSession}
            onCancel={handleCancelSession}
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
              ? "No sessions completed yet."
              : "No sessions available."
            }
          </p>
          <button 
            onClick={handleScheduleSession}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Schedule Your First Session
          </button>
        </div>
      )}

      {/* Session Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Session Performance */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Performance</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Average Attendance</span>
              <span className="font-semibold text-gray-900">85%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Average Duration</span>
              <span className="font-semibold text-gray-900">87 min</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Student Satisfaction</span>
              <span className="font-semibold text-yellow-600">4.9 ⭐</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Recording Rate</span>
              <span className="font-semibold text-green-600">90%</span>
            </div>
          </div>
        </div>

        {/* Upcoming Sessions Schedule */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">This Week's Schedule</h3>
          <div className="space-y-3">
            {allSessions
              .filter(s => s.status === 'upcoming')
              .slice(0, 4)
              .map((session) => (
                <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{session.title}</p>
                    <p className="text-xs text-gray-500">{session.course}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(session.startTime).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
