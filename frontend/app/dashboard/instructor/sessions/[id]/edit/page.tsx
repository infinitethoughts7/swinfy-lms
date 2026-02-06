"use client";

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { instructorApi } from '@/features/courses/services/course-management';
import type { LiveSession, LiveSessionUpdateData } from '@/shared/types';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';

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
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div>
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <Skeleton className="h-8 w-24 rounded-full" />
        </div>
        <Skeleton className="h-48 w-full rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Skeleton className="h-40 w-full rounded-lg" />
          <Skeleton className="h-40 w-full rounded-lg" />
        </div>
        <Skeleton className="h-32 w-full rounded-lg" />
      </div>
    );
  }

  if (error && !session) {
    return (
      <div className="text-center py-12">
        <XCircle className="h-12 w-12 text-red-400 mx-auto mb-3" />
        <Alert variant="destructive" className="max-w-md mx-auto">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={fetchSession} className="mt-4">
          Try Again
        </Button>
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
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/dashboard/instructor/sessions')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Edit Live Session</h1>
            <p className="text-sm text-gray-600">{session.course_title}</p>
          </div>
        </div>

        <Badge className={getStatusBadgeClass(session.status)}>
          {session.status}
        </Badge>
      </div>

      {/* Alerts */}
      {!canEdit && (
        <Alert className="mb-3 border-yellow-200 bg-yellow-50">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            Only draft or pending approval sessions can be edited. This session is {session.status}.
          </AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-3 border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Session updated successfully! Redirecting...
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="mb-3">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Session Details */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-base">
              <Video className="h-4 w-4 text-blue-600 mr-2" />
              Session Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="md:col-span-2">
                <Label className="text-xs font-semibold">Session Title *</Label>
                <Input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter session title"
                  required
                  disabled={!canEdit}
                />
              </div>

              <div className="md:col-span-2">
                <Label className="text-xs font-semibold">Description *</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  placeholder="Describe what will be covered in this session"
                  required
                  disabled={!canEdit}
                />
              </div>

              <div>
                <Label className="text-xs font-semibold">Duration (minutes) *</Label>
                <Input
                  type="number"
                  min="15"
                  max="480"
                  value={formData.duration_minutes}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration_minutes: parseInt(e.target.value) || 60 }))}
                  required
                  disabled={!canEdit}
                />
              </div>

              <div>
                <Label className="text-xs font-semibold">Max Participants</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.max_participants || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    max_participants: e.target.value ? parseInt(e.target.value) : undefined
                  }))}
                  placeholder="No limit"
                  disabled={!canEdit}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Scheduling & Meeting Info Combined */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Scheduling */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-base">
                <Calendar className="h-4 w-4 text-green-600 mr-2" />
                Scheduling
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs font-semibold">Scheduled Date & Time *</Label>
                <Input
                  type="datetime-local"
                  value={formData.scheduled_datetime}
                  onChange={(e) => setFormData(prev => ({ ...prev, scheduled_datetime: e.target.value }))}
                  required
                  disabled={!canEdit}
                />
              </div>

              <div className="flex items-center space-x-2 p-2.5 bg-gray-50 rounded-lg">
                <Checkbox
                  id="recording_enabled"
                  checked={formData.is_recording_enabled}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_recording_enabled: checked === true }))}
                  disabled={!canEdit}
                />
                <label htmlFor="recording_enabled" className="text-sm text-gray-700 cursor-pointer">
                  Enable recording
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Meeting Platform */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-base">
                <Clock className="h-4 w-4 text-purple-600 mr-2" />
                Platform
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs font-semibold">Meeting Platform *</Label>
                <Select
                  value={formData.meeting_platform}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, meeting_platform: value }))}
                  disabled={!canEdit}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PLATFORM_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs font-semibold">Meeting Link *</Label>
                <Input
                  type="url"
                  value={formData.meeting_link}
                  onChange={(e) => setFormData(prev => ({ ...prev, meeting_link: e.target.value }))}
                  placeholder="https://zoom.us/j/123456789"
                  required
                  disabled={!canEdit}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Meeting Credentials */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Meeting Credentials (Optional)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Meeting ID</Label>
                <Input
                  type="text"
                  value={formData.meeting_id || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, meeting_id: e.target.value }))}
                  placeholder="123 456 789"
                  disabled={!canEdit}
                />
              </div>

              <div>
                <Label className="text-xs">Meeting Password</Label>
                <Input
                  type="text"
                  value={formData.meeting_password || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, meeting_password: e.target.value }))}
                  placeholder="abc123"
                  disabled={!canEdit}
                />
              </div>

              <div className="md:col-span-2">
                <Label className="text-xs">Session Notes</Label>
                <Textarea
                  value={formData.session_notes || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, session_notes: e.target.value }))}
                  rows={2}
                  placeholder="Pre-session notes, agenda items, or preparation instructions"
                  disabled={!canEdit}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.push('/dashboard/instructor/sessions')}
              >
                Cancel
              </Button>

              {canEdit && (
                <Button type="submit" disabled={saving}>
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
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
