'use client';

import { useState } from 'react';
import LiveSessionCard from '@/components/dashboard/LiveSessionCard';
import StatsCard from '@/components/dashboard/StatsCard';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Clock, Video, Calendar, CheckCircle } from 'lucide-react';

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
    startTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
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
    startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
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
    startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
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
    startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
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
    startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
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
    startTime: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
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
    void sessionId;
  };

  const handleViewRecording = (sessionId: string) => {
    void sessionId;
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
        <Button>
          Schedule 1-on-1 Session
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Sessions"
          value={sessionStats.totalSessions}
          icon={<Video className="w-5 h-5" />}
          color="blue"
        />
        <StatsCard
          title="Upcoming"
          value={sessionStats.upcoming}
          icon={<Clock className="w-5 h-5" />}
          color="yellow"
          change={{ value: 1, type: 'increase', timeframe: 'this week' }}
        />
        <StatsCard
          title="Attended"
          value={sessionStats.attended}
          icon={<CheckCircle className="w-5 h-5" />}
          color="green"
        />
        <StatsCard
          title="This Week"
          value={sessionStats.thisWeek}
          icon={<Calendar className="w-5 h-5" />}
          color="purple"
        />
      </div>

      {/* Filter Tabs */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 w-fit">
            {(['upcoming', 'ended', 'all'] as const).map((filterOption) => (
              <Button
                key={filterOption}
                variant={filter === filterOption ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFilter(filterOption)}
                className={filter === filterOption ? 'shadow-sm' : ''}
              >
                {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
                <Badge variant="secondary" className="ml-2">
                  {filterCounts[filterOption]}
                </Badge>
              </Button>
            ))}
          </div>

          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredSessions.length} {filter === 'all' ? '' : filter} sessions
          </div>
        </CardContent>
      </Card>

      {/* Next Session Alert */}
      {sessionStats.upcoming > 0 && filter === 'upcoming' && (
        <Alert className="bg-blue-50 border-blue-200">
          <Clock className="h-6 w-6 text-blue-600" />
          <AlertDescription className="flex-1">
            <h3 className="text-lg font-semibold text-blue-900 mb-1">
              Next Session Starting Soon!
            </h3>
            <p className="text-blue-700 mb-3">
              {allSessions.find(s => s.status === 'upcoming')?.title} starts in 2 hours
            </p>
            <Button
              size="sm"
              onClick={() => handleJoinSession(allSessions.find(s => s.status === 'upcoming')?.id || '')}
            >
              Prepare to Join
            </Button>
          </AlertDescription>
        </Alert>
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
        <Card>
          <CardContent className="py-12 text-center">
            <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
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
            <Button>
              Browse Available Sessions
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
