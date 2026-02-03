/**
 * Live Session related types
 */

export type LiveSessionStatus =
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'rejected'
  | 'live'
  | 'completed'
  | 'cancelled';

export interface LiveSession {
  id: string;
  title: string;
  description: string;
  course: string;
  course_title: string;
  instructor: string;
  instructor_name: string;
  training_partner: string;
  training_partner_name: string;
  scheduled_datetime: string;
  duration_minutes: number;
  formatted_duration: string;
  meeting_link: string;
  meeting_platform: string;
  meeting_platform_display: string;
  meeting_id?: string;
  meeting_password?: string;
  status: LiveSessionStatus;
  is_approved: boolean;
  approved_by?: string;
  approved_by_name?: string;
  approval_notes?: string;
  approved_at?: string;
  max_participants?: number;
  is_recording_enabled: boolean;
  recording_link?: string;
  session_notes?: string;
  post_session_notes?: string;
  notification_sent: boolean;
  reminder_sent: boolean;
  is_upcoming: boolean;
  is_live_now: boolean;
  is_past: boolean;
  end_datetime: string;
  created_at: string;
  updated_at: string;
}

export interface LiveSessionCreateData {
  title: string;
  description: string;
  course: string;
  scheduled_datetime: string;
  duration_minutes: number;
  meeting_link: string;
  meeting_platform: string;
  meeting_id?: string;
  meeting_password?: string;
  max_participants?: number;
  is_recording_enabled?: boolean;
  session_notes?: string;
}

export interface LiveSessionUpdateData {
  title?: string;
  description?: string;
  scheduled_datetime?: string;
  duration_minutes?: number;
  meeting_link?: string;
  meeting_platform?: string;
  meeting_id?: string;
  meeting_password?: string;
  max_participants?: number;
  is_recording_enabled?: boolean;
  session_notes?: string;
  post_session_notes?: string;
  recording_link?: string;
}

export interface LiveSessionApprovalData {
  is_approved: boolean;
  approval_notes?: string;
}

export interface LiveSessionStatusUpdateData {
  status: 'live' | 'completed' | 'cancelled';
}
