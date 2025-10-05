"use client";

import { useState, useEffect } from 'react';
import { instructorApi, type Course, type LiveSessionCreateData } from '@/lib/api';
import { 
  X, 
  Calendar, 
  Clock, 
  Video, 
  Users, 
  FileText, 
  Save,
  AlertCircle
} from 'lucide-react';

interface CreateLiveSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateLiveSessionModal({ isOpen, onClose, onSuccess }: CreateLiveSessionModalProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<LiveSessionCreateData>({
    title: '',
    description: '',
    course: '',
    scheduled_datetime: '',
    duration_minutes: 60,
    meeting_link: '',
    meeting_platform: 'zoom',
    meeting_id: '',
    meeting_password: '',
    max_participants: undefined,
    is_recording_enabled: true,
    session_notes: ''
  });

  useEffect(() => {
    if (isOpen) {
      fetchCourses();
    }
  }, [isOpen]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const coursesData = await instructorApi.courses.list();
      setCourses(coursesData);
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: value ? parseInt(value) : undefined }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.course || !formData.scheduled_datetime || !formData.meeting_link) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      
      const sessionData = {
        ...formData,
        scheduled_datetime: new Date(formData.scheduled_datetime).toISOString()
      };
      
      await instructorApi.liveSessions.create(sessionData);
      onSuccess();
      onClose();
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        course: '',
        scheduled_datetime: '',
        duration_minutes: 60,
        meeting_link: '',
        meeting_platform: 'zoom',
        meeting_id: '',
        meeting_password: '',
        max_participants: undefined,
        is_recording_enabled: true,
        session_notes: ''
      });
    } catch (err: any) {
      console.error('Error creating session:', err);
      setError(err.message || 'Failed to create live session');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Create Live Session</h2>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {/* Basic Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Session Details
                </h3>
                
                <div className="grid grid-cols-1 gap-4">
                  {/* Title */}
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                      Session Title *
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder="Enter session title"
                      required
                    />
                  </div>

                  {/* Course */}
                  <div>
                    <label htmlFor="course" className="block text-sm font-medium text-gray-700 mb-1">
                      Course *
                    </label>
                    <select
                      id="course"
                      name="course"
                      value={formData.course}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      required
                    >
                      <option value="">Select a course</option>
                      {courses.map((course) => (
                        <option key={course.id} value={course.id}>
                          {course.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Description */}
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      Description *
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder="Describe what will be covered in this session"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Scheduling */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Scheduling
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Scheduled Date & Time */}
                  <div>
                    <label htmlFor="scheduled_datetime" className="block text-sm font-medium text-gray-700 mb-1">
                      Date & Time *
                    </label>
                    <input
                      type="datetime-local"
                      id="scheduled_datetime"
                      name="scheduled_datetime"
                      value={formData.scheduled_datetime}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      required
                    />
                  </div>

                  {/* Duration */}
                  <div>
                    <label htmlFor="duration_minutes" className="block text-sm font-medium text-gray-700 mb-1">
                      Duration (minutes) *
                    </label>
                    <input
                      type="number"
                      id="duration_minutes"
                      name="duration_minutes"
                      value={formData.duration_minutes}
                      onChange={handleInputChange}
                      min="15"
                      max="480"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      required
                    />
                  </div>

                  {/* Max Participants */}
                  <div>
                    <label htmlFor="max_participants" className="block text-sm font-medium text-gray-700 mb-1">
                      Max Participants
                    </label>
                    <input
                      type="number"
                      id="max_participants"
                      name="max_participants"
                      value={formData.max_participants || ''}
                      onChange={handleInputChange}
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder="Unlimited"
                    />
                  </div>

                  {/* Recording */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="is_recording_enabled"
                      name="is_recording_enabled"
                      checked={formData.is_recording_enabled}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="is_recording_enabled" className="ml-2 block text-sm text-gray-700">
                      Enable recording
                    </label>
                  </div>
                </div>
              </div>

              {/* Meeting Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                  <Video className="w-5 h-5" />
                  Meeting Details
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Meeting Platform */}
                  <div>
                    <label htmlFor="meeting_platform" className="block text-sm font-medium text-gray-700 mb-1">
                      Platform *
                    </label>
                    <select
                      id="meeting_platform"
                      name="meeting_platform"
                      value={formData.meeting_platform}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      required
                    >
                      <option value="zoom">Zoom</option>
                      <option value="google_meet">Google Meet</option>
                      <option value="microsoft_teams">Microsoft Teams</option>
                      <option value="other">Other Platform</option>
                    </select>
                  </div>

                  {/* Meeting Link */}
                  <div className="md:col-span-2">
                    <label htmlFor="meeting_link" className="block text-sm font-medium text-gray-700 mb-1">
                      Meeting Link *
                    </label>
                    <input
                      type="url"
                      id="meeting_link"
                      name="meeting_link"
                      value={formData.meeting_link}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder="https://zoom.us/j/123456789"
                      required
                    />
                  </div>

                  {/* Meeting ID */}
                  <div>
                    <label htmlFor="meeting_id" className="block text-sm font-medium text-gray-700 mb-1">
                      Meeting ID
                    </label>
                    <input
                      type="text"
                      id="meeting_id"
                      name="meeting_id"
                      value={formData.meeting_id}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder="123 456 789"
                    />
                  </div>

                  {/* Meeting Password */}
                  <div>
                    <label htmlFor="meeting_password" className="block text-sm font-medium text-gray-700 mb-1">
                      Meeting Password
                    </label>
                    <input
                      type="text"
                      id="meeting_password"
                      name="meeting_password"
                      value={formData.meeting_password}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder="Optional password"
                    />
                  </div>
                </div>
              </div>

              {/* Session Notes */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Additional Notes
                </h3>
                
                <div>
                  <label htmlFor="session_notes" className="block text-sm font-medium text-gray-700 mb-1">
                    Session Notes
                  </label>
                  <textarea
                    id="session_notes"
                    name="session_notes"
                    value={formData.session_notes}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="Any additional notes or agenda for this session"
                  />
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Create Session
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
