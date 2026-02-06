"use client";

import { useState, useEffect } from 'react';
import { trainingPartnerLiveSessionApi } from '@/features/live-sessions/services/live-session';
import type { LiveSession } from '@/shared/types';
import {
  Video,
  Calendar,
  Clock,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

export default function KnowledgePartnerLiveSessionsPage() {
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending_approval' | 'approved' | 'rejected' | 'live' | 'completed'>('all');
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      setError(null);

      const sessionsData = await trainingPartnerLiveSessionApi.list();
      setSessions(sessionsData);
    } catch (err) {
      console.error('Error fetching sessions:', err);
      setError(`Failed to load live sessions: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (sessionId: string, isApproved: boolean, notes?: string) => {
    try {
      setProcessing(sessionId);

      const updatedSession = await trainingPartnerLiveSessionApi.approve(sessionId, {
        is_approved: isApproved,
        approval_notes: notes
      });

      setSessions(prev => prev.map(session =>
        session.id === sessionId ? updatedSession : session
      ));

      alert(`Session ${isApproved ? 'approved' : 'rejected'} successfully!`);

      await fetchSessions();

      if ((window as any).refreshSidebarCounts) {
        (window as any).refreshSidebarCounts();
      }
    } catch (err: unknown) {
      console.error('Error updating session:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update session';
      alert(errorMessage);
    } finally {
      setProcessing(null);
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
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'live':
        return <Video className="w-4 h-4 text-blue-600" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-gray-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending_approval':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'live':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-6 w-32" />
        </div>
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-8 w-24 rounded-full" />
              ))}
            </div>
          </CardContent>
        </Card>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-48 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
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
          <h1 className="text-2xl font-bold text-gray-900">Live Sessions Review</h1>
          <p className="text-gray-600">Review and approve live sessions from instructors</p>
        </div>
        <div className="text-sm text-gray-500">
          {sessions.filter(s => s.status === 'pending_approval').length} pending approval
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'All Sessions' },
              { key: 'pending_approval', label: 'Pending Approval' },
              { key: 'approved', label: 'Approved' },
              { key: 'rejected', label: 'Rejected' },
              { key: 'live', label: 'Live' },
              { key: 'completed', label: 'Completed' }
            ].map((filterOption) => (
              <Button
                key={filterOption.key}
                variant={filter === filterOption.key ? "default" : "secondary"}
                size="sm"
                onClick={() => setFilter(filterOption.key as typeof filter)}
                className="rounded-full"
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
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : filteredSessions.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No live sessions found</h3>
            <p className="text-gray-600">
              {filter === 'all'
                ? "No live sessions have been created yet."
                : `No sessions with status "${filter.replace('_', ' ')}" found.`
              }
            </p>
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
                      <Badge className={`inline-flex items-center gap-1 ${getStatusColor(session.status || 'pending_approval')}`}>
                        {getStatusIcon(session.status || 'pending_approval')}
                        {(session.status || 'pending_approval').replace('_', ' ')}
                      </Badge>
                      {session.is_live_now && (
                        <Badge className="bg-red-100 text-red-800 animate-pulse">
                          <Video className="w-3 h-3 mr-1" />
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
                        <p className="text-gray-600 mb-1">
                          <span className="font-medium">Platform:</span> {session.meeting_platform_display}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 mb-1">
                          <span className="font-medium">Duration:</span> {session.formatted_duration}
                        </p>
                        <p className="text-gray-600 mb-1">
                          <span className="font-medium">Max Participants:</span> {session.max_participants ? `${session.max_participants}` : 'Unlimited'}
                        </p>
                        <p className="text-gray-600 mb-1">
                          <span className="font-medium">Session ID:</span> {session.id.slice(0, 8)}...
                        </p>
                      </div>
                    </div>

                    {/* Meeting Link */}
                    {session.meeting_link && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-blue-900 mb-1">Meeting Link</h4>
                            <p className="text-sm text-blue-700 break-all">{session.meeting_link}</p>
                          </div>
                          <Button asChild size="sm" className="ml-4 flex-shrink-0">
                            <a
                              href={session.meeting_link}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Video className="w-4 h-4 mr-2" />
                              Join Meeting
                            </a>
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Meeting Details */}
                    {session.meeting_id && (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">Meeting Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          {session.meeting_id && (
                            <p className="text-gray-600">
                              <span className="font-medium">Meeting ID:</span> {session.meeting_id}
                            </p>
                          )}
                          {session.meeting_password && (
                            <p className="text-gray-600">
                              <span className="font-medium">Password:</span> {session.meeting_password}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

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

                    {session.approval_notes && (
                      <div className="bg-gray-50 rounded-lg p-3 mb-4">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Approval Notes:</span> {session.approval_notes}
                        </p>
                      </div>
                    )}

                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    {session.status === 'pending_approval' && (
                      <div className="flex flex-col gap-2">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => {
                            const notes = prompt('Approval notes (optional):');
                            handleApprove(session.id, true, notes || undefined);
                          }}
                          disabled={processing === session.id}
                        >
                          {processing === session.id ? (
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                          ) : (
                            <CheckCircle className="w-3 h-3 mr-1" />
                          )}
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            const reason = prompt('Rejection reason:');
                            if (reason) {
                              handleApprove(session.id, false, reason);
                            }
                          }}
                          disabled={processing === session.id}
                        >
                          {processing === session.id ? (
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                          ) : (
                            <XCircle className="w-3 h-3 mr-1" />
                          )}
                          Reject
                        </Button>
                      </div>
                    )}

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        alert('View session details functionality');
                      }}
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
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
