"use client";

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { instructorApi, type LiveSession, type LiveSessionUpdateData } from '@/lib/api';
import { 
  Calendar, 
  Video, 
  Save, 
  ArrowLeft, 
  AlertCircle,
  Loader2,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';

const PLATFORM_OPTIONS = [
  { value: 'zoom', label: 'Zoom' },
  { value: 'google_meet', label: 'Google Meet' },
  { value: 'microsoft_teams', label: 'Microsoft Teams' },
  { value: 'other', label: 'Other Platform' },
];

export default function EditLiveSessionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;
  
  const [session, setSession] = useState<LiveSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState<LiveSessionUpdateData>({
    title: '',
    description: '',
    scheduled_datetime: '',
    duration_minutes: 60,
    meeting_link: '',
    meeting_platform: 'zoom',
    meeting_id: '',
    meeting_password: '',
    max_participants: undefined,
    is_recording_enabled: true,
    session_notes: '',
  });

  const fetchSession = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await instructorApi.liveSessions.get(sessionId);
      setSession(data);
      
      setFormData({
        title: data.title || '',
        description: data.description || '',
        scheduled_datetime: data.scheduled_datetime ? new Date(data.scheduled_datetime).toISOString().slice(0, 16) : '',
        duration_minutes: data.duration_minutes || 60,
        meeting_link: data.meeting_link || '',
        meeting_platform: data.meeting_platform || 'zoom',
        meeting_id: data.meeting_id || '',
        meeting_password: data.meeting_password || '',
        max_participants: data.max_participants || undefined,
        is_recording_enabled: data.is_recording_enabled !== undefined ? data.is_recording_enabled : true,
        session_notes: data.session_notes || '',
      });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session) return;
    
    if (session.status !== 'draft' && session.status !== 'pending_approval') {
      setError('Only draft or pending approval sessions can be edited.');
      return;
    }
    
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);
      
      const updateData: LiveSessionUpdateData = {
        ...formData,
        scheduled_datetime: formData.scheduled_datetime ? new Date(formData.scheduled_datetime).toISOString() : undefined,
      };
      
      await instructorApi.liveSessions.update(sessionId, updateData);
      setSuccess(true);
      await fetchSession();
      
      setTimeout(() => {
        router.push('/dashboard/instructor/sessions');
      }, 2000);
      
    } catch (err) {
      console.error('Error updating session:', err);
      setError(err instanceof Error ? err.message : 'Failed to update session');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error && !session) {
    return (
      <div className="text-center py-12">
        <XCircle className="h-12 w-12 text-red-400 mx-auto mb-3" />
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={fetchSession}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!session) return <div className="text-center py-12">Session not found</div>;

  const canEdit = session.status === 'draft' || session.status === 'pending_approval';

  return (
    <div className="max-w-5xl mx-auto">
      {/* Compact Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => router.push('/dashboard/instructor/sessions')}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Edit Live Session</h1>
            <p className="text-sm text-gray-600">{session.course_title}</p>
          </div>
        </div>
        
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          session.status === 'draft' ? 'bg-gray-100 text-gray-800' :
          session.status === 'pending_approval' ? 'bg-yellow-100 text-yellow-800' :
          session.status === 'approved' ? 'bg-green-100 text-green-800' :
          session.status === 'rejected' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {session.status}
        </span>
      </div>

      {/* Alerts */}
      {!canEdit && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3 flex items-start">
          <AlertCircle className="h-4 w-4 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-yellow-800">Only draft or pending approval sessions can be edited. This session is {session.status}.</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3 flex items-start">
          <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-green-800">Session updated successfully! Redirecting...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3 flex items-start">
          <XCircle className="h-4 w-4 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Session Details */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center space-x-2 mb-3 pb-2 border-b border-gray-200">
            <Video className="h-4 w-4 text-blue-600" />
            <h2 className="text-base font-semibold text-gray-900">Session Details</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1">Session Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="Enter session title"
                required
                disabled={!canEdit}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1">Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 resize-none"
                placeholder="Describe what will be covered in this session"
                required
                disabled={!canEdit}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Duration (minutes) *</label>
              <input
                type="number"
                min="15"
                max="480"
                value={formData.duration_minutes}
                onChange={(e) => setFormData(prev => ({ ...prev, duration_minutes: parseInt(e.target.value) || 60 }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                required
                disabled={!canEdit}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Max Participants</label>
              <input
                type="number"
                min="1"
                value={formData.max_participants || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  max_participants: e.target.value ? parseInt(e.target.value) : undefined 
                }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="No limit"
                disabled={!canEdit}
              />
            </div>
          </div>
        </div>

        {/* Scheduling & Meeting Info Combined */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Scheduling */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center space-x-2 mb-3 pb-2 border-b border-gray-200">
              <Calendar className="h-4 w-4 text-green-600" />
              <h2 className="text-base font-semibold text-gray-900">Scheduling</h2>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Scheduled Date & Time *</label>
                <input
                  type="datetime-local"
                  value={formData.scheduled_datetime}
                  onChange={(e) => setFormData(prev => ({ ...prev, scheduled_datetime: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  required
                  disabled={!canEdit}
                />
              </div>

              <div className="flex items-center p-2.5 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="recording_enabled"
                  checked={formData.is_recording_enabled}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_recording_enabled: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-0 border-gray-300 rounded"
                  disabled={!canEdit}
                />
                <label htmlFor="recording_enabled" className="ml-2 text-sm text-gray-700">
                  Enable recording
                </label>
              </div>
            </div>
          </div>

          {/* Meeting Platform */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center space-x-2 mb-3 pb-2 border-b border-gray-200">
              <Clock className="h-4 w-4 text-purple-600" />
              <h2 className="text-base font-semibold text-gray-900">Platform</h2>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Meeting Platform *</label>
                <select
                  value={formData.meeting_platform}
                  onChange={(e) => setFormData(prev => ({ ...prev, meeting_platform: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  required
                  disabled={!canEdit}
                >
                  {PLATFORM_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Meeting Link *</label>
                <input
                  type="url"
                  value={formData.meeting_link}
                  onChange={(e) => setFormData(prev => ({ ...prev, meeting_link: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="https://zoom.us/j/123456789"
                  required
                  disabled={!canEdit}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Meeting Credentials */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Meeting Credentials (Optional)</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Meeting ID</label>
              <input
                type="text"
                value={formData.meeting_id || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, meeting_id: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="123 456 789"
                disabled={!canEdit}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Meeting Password</label>
              <input
                type="text"
                value={formData.meeting_password || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, meeting_password: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="abc123"
                disabled={!canEdit}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Session Notes</label>
              <textarea
                value={formData.session_notes || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, session_notes: e.target.value }))}
                rows={2}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 resize-none"
                placeholder="Pre-session notes, agenda items, or preparation instructions"
                disabled={!canEdit}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 p-3">
          <button
            type="button"
            onClick={() => router.push('/dashboard/instructor/sessions')}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors text-sm"
          >
            Cancel
          </button>
          
          {canEdit && (
            <button
              type="submit"
              disabled={saving}
              className={`inline-flex items-center px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm ${
                saving ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}