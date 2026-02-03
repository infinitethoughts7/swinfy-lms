/**
 * Course, Module, and Lesson related types
 */

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  short_description: string;
  price: number;
  duration_weeks: number;
  category: string;
  category_display: string;
  level: string;
  level_display: string;
  tags?: string;
  tags_list?: string[];
  learning_outcomes?: string;
  prerequisites?: string;
  thumbnail?: string;
  thumbnail_url?: string;
  banner_image?: string;
  banner_image_url?: string;
  demo_video?: string;
  demo_video_url?: string;
  approval_status: string;
  approval_status_display: string;
  is_published: boolean;
  is_active: boolean;
  is_private: boolean;
  requires_admin_enrollment: boolean;
  max_enrollments?: number;
  modules_count: number;
  lessons_count: number;
  total_duration_minutes: number;
  enrollment_count: number;
  approval_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CourseCreateData {
  title: string;
  description: string;
  short_description: string;
  price?: number;
  duration_weeks: number;
  category: string;
  level: string;
  learning_outcomes?: string;
  prerequisites?: string;
  thumbnail?: File;
  banner_image?: File;
  demo_video?: File;
  is_private: boolean;
  requires_admin_enrollment: boolean;
  max_enrollments?: number;
}

export interface Module {
  id: string;
  title: string;
  slug: string;
  order: number;
  lessons_count: number;
  total_duration_minutes: number;
  created_at: string;
  updated_at: string;
}

export interface ModuleCreateData {
  title: string;
  order: number;
}

export interface Lesson {
  id: string;
  title: string;
  slug: string;
  lesson_type: string;
  lesson_type_display: string;
  order: number;
  content?: string;
  video_file?: string;
  video_url?: string;
  document_file?: string;
  document_url?: string;
  image_file?: string;
  image_url?: string;
  duration_minutes: number;
  duration_formatted: string;
  has_video_content: boolean;
  is_preview: boolean;
  is_mandatory: boolean;
  total_materials_count: number;
  module_title: string;
  course_title: string;
  created_at: string;
  updated_at: string;
}

export interface LessonCreateData {
  title: string;
  lesson_type: string;
  order: number;
  content?: string;
  video_file?: File;
  document_file?: File;
  image_file?: File;
  duration_minutes?: number;
  is_preview: boolean;
  is_mandatory: boolean;
}

export interface InstructorStats {
  total_courses: number;
  published_courses: number;
  draft_courses: number;
  pending_approval_courses: number;
  total_enrollments: number;
  total_modules: number;
  total_lessons: number;
  total_duration_hours: number;
  avg_course_rating: number;
  recent_courses: Course[];
}
