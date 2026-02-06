"use client";

import { useState, useEffect } from 'react';
import { liveSessionApi } from '@/features/live-sessions/services/live-session';
import type { LiveSession } from '@/shared/types';
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
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

function SessionsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-5 w-72" />
        </div>
        <Skeleton className="h-5 w-32" />
      </div>

      <Skeleton className="h-16 rounded-lg" />

      <div className="grid gap-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-48 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

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

      const sessionsData = await liveSessionApi.list();
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

  const getStatusBadgeVariant = (session: LiveSession): 'destructive' | 'default' | 'secondary' => {
    if (session.is_live_now) {
      return 'destructive';
    } else if (session.is_upcoming) {
      return 'default';
    }
    return 'secondary';
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
    return <SessionsSkeleton />;
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
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'All Sessions' },
              { key: 'upcoming', label: 'Upcoming' },
              { key: 'live', label: 'Live Now' },
              { key: 'past', label: 'Past Sessions' }
            ].map((filterOption) => (
              <Button
                key={filterOption.key}
                variant={filter === filterOption.key ? 'default' : 'secondary'}
                size="sm"
                onClick={() => setFilter(filterOption.key as typeof filter)}
              >
                {filterOption.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sessions List */}
      {error ? (
        <Alert variant="destructive">
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button variant="destructive" size="sm" onClick={fetchSessions}>
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      ) : filteredSessions.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No live sessions found</h3>
            <p className="text-gray-600">
              {filter === 'all'
                ? "No live sessions are available for your enrolled courses."
                : `No ${filter} sessions found.`
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredSessions.map((session) => (
            <Card key={session.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{session.title}</h3>
                      <Badge variant={getStatusBadgeVariant(session)} className="inline-flex items-center gap-1">
                        {getStatusIcon(session)}
                        {getStatusText(session)}
                      </Badge>
                      {session.is_live_now && (
                        <Badge variant="destructive" className="animate-pulse">
                          <Play className="w-3 h-3 mr-1" />
                          Live Now
                        </Badge>
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

                    {/* Meeting Details */}
                    {session.meeting_link && session.is_approved && (
                      <Alert className="bg-blue-50 border-blue-200 mt-4">
                        <Video className="h-4 w-4 text-blue-600" />
                        <AlertDescription>
                          <h4 className="text-sm font-semibold text-gray-900 mb-3">
                            Meeting Details
                          </h4>
                          <div className="space-y-2 mb-3">
                            <div className="flex items-start">
                              <span className="text-xs font-medium text-gray-600 w-20">Link:</span>
                              <a
                                href={session.meeting_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:text-blue-700 hover:underline break-all flex-1"
                              >
                                {session.meeting_link}
                              </a>
                            </div>
                            {session.meeting_id && (
                              <div className="flex items-start">
                                <span className="text-xs font-medium text-gray-600 w-20">Meeting ID:</span>
                                <span className="text-xs text-gray-900 font-mono">{session.meeting_id}</span>
                              </div>
                            )}
                            {session.meeting_password && (
                              <div className="flex items-start">
                                <span className="text-xs font-medium text-gray-600 w-20">Password:</span>
                                <span className="text-xs text-gray-900 font-mono">{session.meeting_password}</span>
                              </div>
                            )}
                          </div>
                          <Button
                            asChild
                            size="sm"
                            className={session.is_live_now ? 'bg-red-600 hover:bg-red-700 animate-pulse' : ''}
                          >
                            <a
                              href={session.meeting_link}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Video className="w-4 h-4 mr-2" />
                              {session.is_live_now ? 'Join Live Session Now' : 'Join Session'}
                              <ExternalLink className="w-4 h-4 ml-2" />
                            </a>
                          </Button>
                        </AlertDescription>
                      </Alert>
                    )}

                    {!session.is_approved && (
                      <Alert className="bg-yellow-50 border-yellow-200 mt-4">
                        <AlertCircle className="h-4 w-4 text-yellow-800" />
                        <AlertDescription className="text-yellow-800">
                          This session is pending approval from your training partner.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
