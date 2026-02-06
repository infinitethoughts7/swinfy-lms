"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { instructorApi } from '@/features/courses/services/course-management';
import type { LiveSession } from '@/shared/types';
import CreateLiveSessionModal from '@/components/live-session/CreateLiveSessionModal';
import {
  Plus,
  Video,
  Calendar,
  Clock,
  Users,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Play,
  Square
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

export default function InstructorLiveSessionsPage() {
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'draft' | 'pending_approval' | 'approved' | 'live' | 'completed' | 'cancelled'>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const sessionsData = await instructorApi.liveSessions.list();

      setSessions(sessionsData);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load live sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to delete this live session? This action cannot be undone.')) {
      return;
    }

    try {
      await instructorApi.liveSessions.delete(sessionId);
      setSessions(prev => prev.filter(session => session.id !== sessionId));
    } catch (err) {
      console.error('Error deleting session:', err);
      alert('Failed to delete session. Please try again.');
    }
  };

  const handleUpdateStatus = async (sessionId: string, status: 'live' | 'completed' | 'cancelled') => {
    try {
      const updatedSession = await instructorApi.liveSessions.updateStatus(sessionId, { status });
      setSessions(prev => prev.map(session =>
        session.id === sessionId ? updatedSession : session
      ));
    } catch (err) {
      console.error('Error updating session status:', err);
      alert('Failed to update session status. Please try again.');
    }
  };

  const handleSendReminder = async (sessionId: string) => {
    try {
      await instructorApi.liveSessions.sendReminder(sessionId);
      alert('Reminder sent successfully!');
    } catch (err) {
      console.error('Error sending reminder:', err);
      alert('Failed to send reminder. Please try again.');
    }
  };

  const filteredSessions = sessions.filter(session => {
    if (filter === 'all') return true;
    return session.status === filter;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending_approval':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'live':
        return <Play className="w-4 h-4 text-blue-600" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-gray-600" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending_approval':
        return 'bg-yellow-100 text-yellow-800';
      case 'live':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-40 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>
        <Skeleton className="h-16 w-full rounded-lg" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Live Sessions</h1>
          <p className="text-gray-600">Manage your live teaching sessions</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Live Session
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'All Sessions' },
              { key: 'draft', label: 'Draft' },
              { key: 'pending_approval', label: 'Pending Approval' },
              { key: 'approved', label: 'Approved' },
              { key: 'live', label: 'Live' },
              { key: 'completed', label: 'Completed' },
              { key: 'cancelled', label: 'Cancelled' }
            ].map((filterOption) => (
              <Button
                key={filterOption.key}
                variant={filter === filterOption.key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(filterOption.key as typeof filter)}
                className={filter === filterOption.key ? '' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200'}
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
            <Button onClick={fetchData} variant="outline" size="sm">
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      ) : filteredSessions.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No live sessions found</h3>
            <p className="text-gray-600 mb-4">
              {filter === 'all'
                ? "You haven't created any live sessions yet."
                : `No sessions with status "${filter.replace('_', ' ')}" found.`
              }
            </p>
            {filter === 'all' && (
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Session
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredSessions.map((session) => (
            <Card key={session.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{session.title}</h3>
                      <Badge className={getStatusBadgeClass(session.status)}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(session.status)}
                          {session.status.replace('_', ' ')}
                        </span>
                      </Badge>
                      {session.is_live_now && (
                        <Badge className="bg-red-100 text-red-800 animate-pulse">
                          <Play className="w-3 h-3 mr-1" />
                          Live Now
                        </Badge>
                      )}
                    </div>

                    <p className="text-gray-600 mb-3">{session.course_title}</p>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(session.scheduled_datetime).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {new Date(session.scheduled_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Video className="w-4 h-4" />
                        {session.meeting_platform_display}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {session.max_participants ? `${session.max_participants} max` : 'Unlimited'}
                      </span>
                      <span className="text-green-600 font-medium">
                        {session.formatted_duration}
                      </span>
                    </div>

                    {session.description && (
                      <p className="text-gray-600 mt-3 text-sm line-clamp-2">{session.description}</p>
                    )}

                    {/* Meeting Details */}
                    {session.meeting_link && (
                      <Card className="mt-4 bg-blue-50 border-blue-200">
                        <CardContent className="p-4">
                          <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                            <Video className="w-4 h-4 mr-2 text-blue-600" />
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
                          {session.is_approved && (
                            <Button
                              asChild
                              className={session.is_live_now
                                ? 'bg-red-600 hover:bg-red-700 animate-pulse'
                                : ''
                              }
                            >
                              <a
                                href={session.meeting_link}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Video className="w-4 h-4 mr-2" />
                                {session.is_live_now ? 'Join Live Session Now' : 'Join Session'}
                              </a>
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    {session.status === 'approved' && !session.is_live_now && !session.is_past && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleUpdateStatus(session.id, 'live')}
                        className="text-blue-600 hover:bg-blue-100"
                        title="Start Session"
                      >
                        <Play className="w-4 h-4" />
                      </Button>
                    )}

                    {session.status === 'live' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleUpdateStatus(session.id, 'completed')}
                        className="text-green-600 hover:bg-green-100"
                        title="End Session"
                      >
                        <Square className="w-4 h-4" />
                      </Button>
                    )}

                    {session.status === 'approved' && !session.reminder_sent && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleSendReminder(session.id)}
                        className="text-purple-600 hover:bg-purple-100"
                        title="Send Reminder"
                      >
                        <AlertCircle className="w-4 h-4" />
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      size="icon"
                      asChild
                      className="text-gray-600 hover:bg-gray-100"
                    >
                      <Link
                        href={`/dashboard/instructor/sessions/${session.id}/edit`}
                        title="Edit Session"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                    </Button>

                    {session.status === 'draft' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteSession(session.id)}
                        className="text-red-600 hover:bg-red-100"
                        title="Delete Session"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Live Session Modal */}
      <CreateLiveSessionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchData}
      />
    </div>
  );
}
