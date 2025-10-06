"use client";

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { instructorApi, type LiveSession } from '@/lib/api';
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
      await fetchSession(); // Refresh session data
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
      await fetchSession(); // Refresh session data
    } catch (err) {
      console.error('Error sending reminder:', err);
      alert('Failed to send reminder');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={fetchSession}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Try Again
        </button>
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
          <button
            onClick={() => router.push('/dashboard/instructor/sessions')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Back to Sessions"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{session.title}</h1>
            <p className="text-sm text-gray-600 mt-1">Live Session Details</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            session.status === 'draft' ? 'bg-gray-100 text-gray-800' :
            session.status === 'pending_approval' ? 'bg-yellow-100 text-yellow-800' :
            session.status === 'approved' ? 'bg-green-100 text-green-800' :
            session.status === 'rejected' ? 'bg-red-100 text-red-800' :
            session.status === 'live' ? 'bg-blue-100 text-blue-800' :
            session.status === 'completed' ? 'bg-green-100 text-green-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {session.status}
          </span>
          
          {canEdit && (
            <button
              onClick={() => router.push(`/dashboard/instructor/sessions/${sessionId}/edit`)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </button>
          )}
        </div>
      </div>

      {/* Session Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Session Details */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Session Information</h2>
            
            <div className="space-y-4">
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
            </div>
          </div>

          {/* Meeting Information */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Video className="h-5 w-5 mr-2" />
              Meeting Details
            </h2>
            
            <div className="space-y-4">
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
            </div>
          </div>

          {/* Session Notes */}
          {session.session_notes && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Session Notes</h2>
              <p className="text-gray-900 whitespace-pre-wrap">{session.session_notes}</p>
            </div>
          )}

          {/* Post-Session Notes */}
          {session.post_session_notes && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Post-Session Notes</h2>
              <p className="text-gray-900 whitespace-pre-wrap">{session.post_session_notes}</p>
            </div>
          )}

          {/* Recording Link */}
          {session.recording_link && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Session Recording</h2>
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
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Session Status */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Status</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  session.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                  session.status === 'pending_approval' ? 'bg-yellow-100 text-yellow-800' :
                  session.status === 'approved' ? 'bg-green-100 text-green-800' :
                  session.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  session.status === 'live' ? 'bg-blue-100 text-blue-800' :
                  session.status === 'completed' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {session.status}
                </span>
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
            </div>
          </div>

          {/* Scheduling */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Schedule
            </h3>
            
            <div className="space-y-3">
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
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
            
            <div className="space-y-3">
              {canStart && (
                <button
                  onClick={() => handleUpdateStatus('live')}
                  disabled={updating}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Session
                </button>
              )}
              
              {canEnd && (
                <button
                  onClick={() => handleUpdateStatus('completed')}
                  disabled={updating}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  <Square className="h-4 w-4 mr-2" />
                  End Session
                </button>
              )}
              
              {canSendReminder && (
                <button
                  onClick={handleSendReminder}
                  disabled={updating}
                  className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Send Reminder
                </button>
              )}
              
              {canEdit && (
                <button
                  onClick={() => router.push(`/dashboard/instructor/sessions/${sessionId}/edit`)}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Session
                </button>
              )}
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h3>
            
            <div className="space-y-3">
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
