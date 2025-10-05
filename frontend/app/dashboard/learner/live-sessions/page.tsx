"use client";

import { useState, useEffect } from 'react';
import { liveSessionApi, type LiveSession } from '@/lib/api';
import { 
  Video, 
  Calendar, 
  Clock, 
  Users, 
  ExternalLink,
  Play,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export default function LearnerLiveSessionsPage() {
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'live' | 'past'>('all');

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching learner live sessions...');
      // Fetch approved live sessions for enrolled courses (backend already filters)
      const sessionsData = await liveSessionApi.list();
      console.log('Learner sessions data received:', sessionsData);
      setSessions(sessionsData);
    } catch (err) {
      console.error('Error fetching sessions:', err);
      setError('Failed to load live sessions');
    } finally {
      setLoading(false);
    }
  };

  const filteredSessions = sessions.filter(session => {
    if (filter === 'all') return true;
    if (filter === 'upcoming') return session.is_upcoming;
    if (filter === 'live') return session.is_live_now;
    if (filter === 'past') return session.is_past;
    return true;
  });

  const getStatusIcon = (session: LiveSession) => {
    if (session.is_live_now) {
      return <Play className="w-4 h-4 text-red-600" />;
    } else if (session.is_upcoming) {
      return <Clock className="w-4 h-4 text-blue-600" />;
    } else if (session.is_past) {
      return <CheckCircle className="w-4 h-4 text-gray-600" />;
    }
    return <AlertCircle className="w-4 h-4 text-gray-600" />;
  };

  const getStatusColor = (session: LiveSession) => {
    if (session.is_live_now) {
      return 'bg-red-100 text-red-800';
    } else if (session.is_upcoming) {
      return 'bg-blue-100 text-blue-800';
    } else if (session.is_past) {
      return 'bg-gray-100 text-gray-800';
    }
    return 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (session: LiveSession) => {
    if (session.is_live_now) {
      return 'Live Now';
    } else if (session.is_upcoming) {
      return 'Upcoming';
    } else if (session.is_past) {
      return 'Completed';
    }
    return 'Unknown';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Live Sessions</h1>
          <p className="text-gray-600">Join live teaching sessions from your enrolled courses</p>
        </div>
        <div className="text-sm text-gray-500">
          {sessions.filter(s => s.is_upcoming).length} upcoming sessions
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'All Sessions' },
            { key: 'upcoming', label: 'Upcoming' },
            { key: 'live', label: 'Live Now' },
            { key: 'past', label: 'Past Sessions' }
          ].map((filterOption) => (
            <button
              key={filterOption.key}
              onClick={() => setFilter(filterOption.key as any)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filter === filterOption.key
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filterOption.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sessions List */}
      {error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchSessions}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      ) : filteredSessions.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No live sessions found</h3>
          <p className="text-gray-600">
            {filter === 'all' 
              ? "No live sessions are available for your enrolled courses."
              : `No ${filter} sessions found.`
            }
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredSessions.map((session) => (
            <div key={session.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{session.title}</h3>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(session)}`}>
                      {getStatusIcon(session)}
                      {getStatusText(session)}
                    </span>
                    {session.is_live_now && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium animate-pulse">
                        <Play className="w-3 h-3" />
                        Live Now
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-gray-600 mb-1">
                        <span className="font-medium">Course:</span> {session.course_title}
                      </p>
                      <p className="text-gray-600 mb-1">
                        <span className="font-medium">Instructor:</span> {session.instructor_name}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1">
                        <span className="font-medium">Platform:</span> {session.meeting_platform_display}
                      </p>
                      <p className="text-gray-600 mb-1">
                        <span className="font-medium">Duration:</span> {session.formatted_duration}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(session.scheduled_datetime).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {new Date(session.scheduled_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {session.max_participants ? `${session.max_participants} max` : 'Unlimited'}
                    </span>
                  </div>

                  {session.description && (
                    <p className="text-gray-600 mb-4 text-sm line-clamp-2">{session.description}</p>
                  )}

                  {session.meeting_link && session.is_approved && (
                    <div className="mt-4">
                      <a
                        href={session.meeting_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                      >
                        <Video className="w-4 h-4 mr-2" />
                        {session.is_live_now ? 'Join Live Session' : 'Join Session'}
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </a>
                    </div>
                  )}

                  {!session.is_approved && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-yellow-800 text-sm">
                        <AlertCircle className="w-4 h-4 inline mr-1" />
                        This session is pending approval from your training partner.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
