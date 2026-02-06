"use client";

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { instructorApi } from '@/features/courses/services/course-management';
import type { LiveSession } from '@/shared/types';
import {
  Calendar,
  Clock,
  Video,
  Users,
  ArrowLeft,
  Edit,
  Play,
  Square,
  AlertCircle,
  CheckCircle,
  XCircle,
  ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

export default function LiveSessionDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;

  const [session, setSession] = useState<LiveSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  const fetchSession = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await instructorApi.liveSessions.get(sessionId);
      setSession(data);
    } catch (err) {
      console.error('Error fetching session:', err);
      setError('Failed to load session details');
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  const handleUpdateStatus = async (newStatus: 'live' | 'completed' | 'cancelled') => {
    if (!session) return;

    try {
      setUpdating(true);
      await instructorApi.liveSessions.updateStatus(sessionId, { status: newStatus });
      await fetchSession();
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update session status');
    } finally {
      setUpdating(false);
    }
  };

  const handleSendReminder = async () => {
    if (!session) return;

    try {
      setUpdating(true);
      await instructorApi.liveSessions.sendReminder(sessionId);
      alert('Reminder sent successfully!');
      await fetchSession();
    } catch (err) {
      console.error('Error sending reminder:', err);
      alert('Failed to send reminder');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'pending_approval':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'live':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div>
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="flex space-x-3">
            <Skeleton className="h-8 w-20 rounded-full" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-40 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-56 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <Alert variant="destructive" className="max-w-md mx-auto">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={fetchSession} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  if (!session) {
    return <div className="text-center py-12">Session not found</div>;
  }

  const canEdit = session.status === 'draft' || session.status === 'pending_approval';
  const canStart = session.status === 'approved' && !session.is_live_now && !session.is_past;
  const canEnd = session.status === 'live';
  const canSendReminder = session.status === 'approved' && !session.reminder_sent;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/dashboard/instructor/sessions')}
            title="Back to Sessions"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{session.title}</h1>
            <p className="text-sm text-gray-600 mt-1">Live Session Details</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Badge className={getStatusBadgeClass(session.status)}>
            {session.status}
          </Badge>

          {canEdit && (
            <Button onClick={() => router.push(`/dashboard/instructor/sessions/${sessionId}/edit`)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
        </div>
      </div>

      {/* Session Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Session Details */}
          <Card>
            <CardHeader>
              <CardTitle>Session Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-1">Description</h3>
                <p className="text-gray-900">{session.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-1">Course</h3>
                  <p className="text-gray-900">{session.course_title}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-1">Duration</h3>
                  <p className="text-gray-900">{session.formatted_duration}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Meeting Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Video className="h-5 w-5 mr-2" />
                Meeting Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-1">Platform</h3>
                <p className="text-gray-900">{session.meeting_platform_display}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-1">Meeting Link</h3>
                <div className="flex items-center space-x-2">
                  <a
                    href={session.meeting_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 hover:underline break-all flex-1"
                  >
                    {session.meeting_link}
                  </a>
                  <ExternalLink className="h-4 w-4 text-gray-400" />
                </div>
              </div>

              {(session.meeting_id || session.meeting_password) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {session.meeting_id && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-1">Meeting ID</h3>
                      <p className="text-gray-900 font-mono">{session.meeting_id}</p>
                    </div>
                  )}

                  {session.meeting_password && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-1">Password</h3>
                      <p className="text-gray-900 font-mono">{session.meeting_password}</p>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={session.is_recording_enabled}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    disabled
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    Recording enabled
                  </label>
                </div>

                {session.max_participants && (
                  <div className="flex items-center">
                    <Users className="h-4 w-4 text-gray-400 mr-1" />
                    <span className="text-sm text-gray-700">
                      Max {session.max_participants} participants
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Session Notes */}
          {session.session_notes && (
            <Card>
              <CardHeader>
                <CardTitle>Session Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-900 whitespace-pre-wrap">{session.session_notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Post-Session Notes */}
          {session.post_session_notes && (
            <Card>
              <CardHeader>
                <CardTitle>Post-Session Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-900 whitespace-pre-wrap">{session.post_session_notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Recording Link */}
          {session.recording_link && (
            <Card>
              <CardHeader>
                <CardTitle>Session Recording</CardTitle>
              </CardHeader>
              <CardContent>
                <a
                  href={session.recording_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-blue-600 hover:text-blue-700 hover:underline"
                >
                  <Video className="h-4 w-4 mr-2" />
                  Watch Recording
                  <ExternalLink className="h-4 w-4 ml-1" />
                </a>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Session Status */}
          <Card>
            <CardHeader>
              <CardTitle>Session Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status</span>
                <Badge className={getStatusBadgeClass(session.status)}>
                  {session.status}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Approved</span>
                <span className="flex items-center">
                  {session.is_approved ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                </span>
              </div>

              {session.approved_by_name && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Approved by</span>
                  <span className="text-sm text-gray-900">{session.approved_by_name}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Scheduling */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="text-sm text-gray-600">Scheduled</span>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(session.scheduled_datetime).toLocaleString()}
                </p>
              </div>

              <div>
                <span className="text-sm text-gray-600">Ends</span>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(session.end_datetime).toLocaleString()}
                </p>
              </div>

              <div className="flex items-center">
                <Clock className="h-4 w-4 text-gray-400 mr-1" />
                <span className="text-sm text-gray-600">
                  {session.formatted_duration}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {canStart && (
                <Button
                  onClick={() => handleUpdateStatus('live')}
                  disabled={updating}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Session
                </Button>
              )}

              {canEnd && (
                <Button
                  onClick={() => handleUpdateStatus('completed')}
                  disabled={updating}
                  variant="destructive"
                  className="w-full"
                >
                  <Square className="h-4 w-4 mr-2" />
                  End Session
                </Button>
              )}

              {canSendReminder && (
                <Button
                  onClick={handleSendReminder}
                  disabled={updating}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Send Reminder
                </Button>
              )}

              {canEdit && (
                <Button
                  onClick={() => router.push(`/dashboard/instructor/sessions/${sessionId}/edit`)}
                  className="w-full"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Session
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Enrollment notification</span>
                <span className="flex items-center">
                  {session.notification_sent ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-gray-400" />
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Reminder sent</span>
                <span className="flex items-center">
                  {session.reminder_sent ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-gray-400" />
                  )}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
