"use client";

import { useState, useEffect } from 'react';
import { trainingPartnerLiveSessionApi, type LiveSession } from '@/lib/api';
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
      
      console.log('Updated session:', updatedSession);
      
      // Update the sessions list with the updated session
      setSessions(prev => prev.map(session => 
        session.id === sessionId ? updatedSession : session
      ));
      
      // Show success message
      alert(`Session ${isApproved ? 'approved' : 'rejected'} successfully!`);
      
      // Refresh the sessions list to ensure we have the latest data
      await fetchSessions();
      
      // Refresh sidebar counts
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
          <h1 className="text-2xl font-bold text-gray-900">Live Sessions Review</h1>
          <p className="text-gray-600">Review and approve live sessions from instructors</p>
        </div>
        <div className="text-sm text-gray-500">
          {sessions.filter(s => s.status === 'pending_approval').length} pending approval
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'All Sessions' },
            { key: 'pending_approval', label: 'Pending Approval' },
            { key: 'approved', label: 'Approved' },
            { key: 'rejected', label: 'Rejected' },
            { key: 'live', label: 'Live' },
            { key: 'completed', label: 'Completed' }
          ].map((filterOption) => (
            <button
              key={filterOption.key}
              onClick={() => setFilter(filterOption.key as typeof filter)}
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
              ? "No live sessions have been created yet."
              : `No sessions with status "${filter.replace('_', ' ')}" found.`
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
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(session.status || 'pending_approval')}`}>
                      {getStatusIcon(session.status || 'pending_approval')}
                      {(session.status || 'pending_approval').replace('_', ' ')}
                    </span>
                    {session.is_live_now && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium animate-pulse">
                        <Video className="w-3 h-3" />
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

                  {/* Meeting Link - Show prominently for all sessions */}
                  {session.meeting_link && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-blue-900 mb-1">Meeting Link</h4>
                          <p className="text-sm text-blue-700 break-all">{session.meeting_link}</p>
                        </div>
                        <a
                          href={session.meeting_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium ml-4 flex-shrink-0"
                        >
                          <Video className="w-4 h-4 mr-2" />
                          Join Meeting
                        </a>
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
                      <button
                        onClick={() => {
                          const notes = prompt('Approval notes (optional):');
                          handleApprove(session.id, true, notes || undefined);
                        }}
                        disabled={processing === session.id}
                        className="inline-flex items-center px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm font-medium"
                      >
                        {processing === session.id ? (
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                        ) : (
                          <CheckCircle className="w-3 h-3 mr-1" />
                        )}
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          const reason = prompt('Rejection reason:');
                          if (reason) {
                            handleApprove(session.id, false, reason);
                          }
                        }}
                        disabled={processing === session.id}
                        className="inline-flex items-center px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm font-medium"
                      >
                        {processing === session.id ? (
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                        ) : (
                          <XCircle className="w-3 h-3 mr-1" />
                        )}
                        Reject
                      </button>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      // View session details - you can implement a modal or navigate to details page
                      alert('View session details functionality');
                    }}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
