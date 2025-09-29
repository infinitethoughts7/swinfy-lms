"use client";

import { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Clock, 
  User, 
  CheckCircle, 
  XCircle, 
  Eye, 
  MessageSquare,
  Calendar,
  Star,
  Users,
  Play,
  FileText,
  Image,
  Award,
  Search
} from 'lucide-react';
import Link from 'next/link';
import { authenticatedFetch, isAuthenticated, logout } from '@/lib/auth';

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  short_description: string;
  price: number;
  duration_weeks: number;
  category: string;
  level: string;
  tags: string;
  learning_outcomes: string;
  prerequisites: string;
  thumbnail: string;
  banner_image: string;
  demo_video: string;
  is_private: boolean;
  requires_admin_enrollment: boolean;
  max_enrollments: number;
  is_active: boolean;
  approval_status: string;
  approval_notes: string;
  is_published: boolean;
  is_featured: boolean;
  is_draft: boolean;
  enrollment_count: number;
  rating: number;
  review_count: number;
  created_at: string;
  updated_at: string;
  tutor: {
    id: string;
    full_name: string;
    email: string;
  };
  training_partner: {
    id: string;
    organization_name: string;
  };
  modules: Module[];
  lessons_count: number;
  total_duration_minutes: number;
}

interface Module {
  id: string;
  title: string;
  description: string;
  order: number;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  lesson_type: string;
  duration_minutes: number;
  order: number;
  is_preview: boolean;
  is_mandatory: boolean;
  content: string;
  video_file: string;
  materials: LessonMaterial[];
}

interface LessonMaterial {
  id: string;
  title: string;
  material_type: string;
  file: string;
  order: number;
}

interface ReviewStats {
  total_pending: number;
  total_approved: number;
  total_rejected: number;
  total_draft: number;
  recent_activity: Array<{
    id: string;
    title: string;
    instructor: string;
    created_at: string;
    status: string;
  }>;
}

export default function CourseReviewPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const safeCourses = Array.isArray(courses) ? courses : [];
  const safeFilteredCourses = Array.isArray(filteredCourses) ? filteredCourses : [];

  useEffect(() => {
    if (!isAuthenticated()) {
      logout();
      return;
    }
    fetchCourses();
    fetchStats();
  }, []);

  useEffect(() => {
    let filtered = safeCourses;

    if (searchTerm.trim()) {
      filtered = filtered.filter(course =>
        course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.tutor?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(course => course.approval_status === statusFilter);
    }

    setFilteredCourses(filtered);
  }, [safeCourses, searchTerm, statusFilter]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authenticatedFetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/admin/course-review/all/`, {
        method: 'GET',
      });

      const data = await response.json();
      const coursesArray = data.results || data;
      setCourses(Array.isArray(coursesArray) ? coursesArray : []);
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch courses');
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await authenticatedFetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/admin/course-review/stats/`, {
        method: 'GET',
      });

      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleApprove = async (courseId: string) => {
    try {
      setActionLoading(true);
      
      const response = await authenticatedFetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/admin/course-review/${courseId}/approve/`, {
        method: 'POST',
        body: JSON.stringify({
          notes: reviewNotes
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to approve course');
      }

      alert('Course approved successfully!');
      setShowReviewModal(false);
      setReviewNotes('');
      fetchCourses();
      fetchStats();
    } catch (err) {
      console.error('Error approving course:', err);
      alert(err instanceof Error ? err.message : 'Failed to approve course');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (courseId: string) => {
    if (!reviewNotes.trim()) {
      alert('Please provide rejection notes');
      return;
    }

    try {
      setActionLoading(true);
      
      const response = await authenticatedFetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/admin/course-review/${courseId}/reject/`, {
        method: 'POST',
        body: JSON.stringify({
          notes: reviewNotes
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reject course');
      }

      alert('Course rejected successfully!');
      setShowReviewModal(false);
      setReviewNotes('');
      fetchCourses();
      fetchStats();
    } catch (err) {
      console.error('Error rejecting course:', err);
      alert(err instanceof Error ? err.message : 'Failed to reject course');
    } finally {
      setActionLoading(false);
    }
  };

  const openReviewModal = (course: Course) => {
    setSelectedCourse(course);
    setReviewNotes(course.approval_notes || '');
    setShowReviewModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_approval':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Play className="h-4 w-4" />;
      case 'text':
        return <FileText className="h-4 w-4" />;
      case 'assignment':
        return <Award className="h-4 w-4" />;
      case 'image_gallery':
        return <Image className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
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
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={fetchCourses}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Course Review</h1>
          <p className="text-gray-600 text-sm">Review and approve courses created by instructors</p>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.total_pending}</p>
              </div>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">{stats.total_approved}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{stats.total_rejected}</p>
              </div>
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Courses</p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.total_pending + stats.total_approved + stats.total_rejected + stats.total_draft || 0}
                </p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="bg-white rounded-lg border border-gray-200 p-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-80">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
          
          <div className="w-40">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="all">All Status</option>
              <option value="pending_approval">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="draft">Draft</option>
            </select>
          </div>
          
          {(searchTerm || statusFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
              }}
              className="px-3 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors text-sm"
            >
              Clear
            </button>
          )}
          
          <div className="ml-auto text-sm text-gray-500">
            {safeFilteredCourses.length} of {safeCourses.length} courses
          </div>
        </div>
      </div>

      {/* Courses List */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Course History
        </h2>
        
        {safeFilteredCourses.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              {safeCourses.length === 0 
                ? "No courses found" 
                : "No courses match your search criteria"}
            </p>
            <p className="text-gray-400 text-sm">
              {safeCourses.length === 0 
                ? "No courses have been created for this Knowledge Partner yet"
                : "Try adjusting your search terms or filters"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {safeFilteredCourses.map((course) => (
              <div key={course.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{course.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(course.approval_status)}`}>
                        {course.approval_status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-2">{course.short_description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        {course.tutor?.full_name || 'Unknown Instructor'}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {course.duration_weeks} weeks
                      </div>
                      <div className="flex items-center">
                        <BookOpen className="h-4 w-4 mr-1" />
                        {course.lessons_count} lessons
                      </div>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 mr-1" />
                        ₹{course.price}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => openReviewModal(course)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      {course.approval_status === 'pending_approval' ? 'Review' : 'View Details'}
                    </button>
                    
                    {course.approval_status === 'pending_approval' && (
                      <>
                        <button
                          onClick={() => handleApprove(course.id)}
                          disabled={actionLoading}
                          className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Quick Approve
                        </button>
                        <button
                          onClick={() => {
                            setSelectedCourse(course);
                            setReviewNotes('');
                            setShowReviewModal(true);
                          }}
                          className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </button>
                      </>
                    )}
                    
                    {(course.approval_status === 'approved' || course.approval_status === 'rejected') && course.approval_notes && (
                      <div className="text-xs text-gray-500 max-w-xs">
                        <strong>Review Notes:</strong> {course.approval_notes}
                      </div>
                    )}
                  </div>
                </div>
                
                {course.modules && course.modules.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Course Content:</h4>
                    <div className="space-y-2">
                      {course.modules.slice(0, 2).map((module) => (
                        <div key={module.id} className="bg-gray-50 rounded-lg p-3">
                          <h5 className="font-medium text-gray-900 text-sm">{module.title}</h5>
                          <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                            <span>{module.lessons.length} lessons</span>
                            <span>{module.lessons.reduce((total, lesson) => total + lesson.duration_minutes, 0)} min</span>
                          </div>
                        </div>
                      ))}
                      {course.modules.length > 2 && (
                        <p className="text-xs text-gray-500">+{course.modules.length - 2} more modules</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {selectedCourse.approval_status === 'pending_approval' ? 'Review Course' : 'Course Details'}
                </h3>
                <p className="text-gray-600">{selectedCourse.title}</p>
              </div>
              <button
                onClick={() => setShowReviewModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Course Overview */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Course Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Instructor:</span>
                      <span className="font-medium">{selectedCourse.tutor?.full_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium">{selectedCourse.duration_weeks} weeks</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Price:</span>
                      <span className="font-medium">₹{selectedCourse.price}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Level:</span>
                      <span className="font-medium capitalize">{selectedCourse.level}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Category:</span>
                      <span className="font-medium capitalize">{selectedCourse.category.replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedCourse.approval_status)}`}>
                        {selectedCourse.approval_status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Description</h4>
                  <p className="text-sm text-gray-600">{selectedCourse.description}</p>
                </div>
              </div>

              {/* Course Content */}
              {selectedCourse.modules && selectedCourse.modules.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Course Content</h4>
                  <div className="space-y-4">
                    {selectedCourse.modules.map((module, moduleIndex) => (
                      <div key={module.id} className="border border-gray-200 rounded-lg p-4">
                        <h5 className="font-medium text-gray-900 mb-2">
                          Module {moduleIndex + 1}: {module.title}
                        </h5>
                        <p className="text-sm text-gray-600 mb-3">{module.description}</p>
                        {module.lessons && module.lessons.length > 0 && (
                          <div className="space-y-2">
                            {module.lessons.map((lesson, lessonIndex) => (
                              <div key={lesson.id} className="flex items-center space-x-3 bg-gray-50 rounded-lg p-3">
                                <div className="p-1 bg-blue-100 rounded">
                                  {getLessonIcon(lesson.lesson_type)}
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-900">
                                    {lessonIndex + 1}. {lesson.title}
                                  </p>
                                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                                    <span>{lesson.lesson_type}</span>
                                    <span>{lesson.duration_minutes} min</span>
                                    {lesson.is_preview && <span className="text-blue-600">Preview</span>}
                                    {lesson.is_mandatory && <span className="text-red-600">Mandatory</span>}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Review Notes - Show for all statuses */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {selectedCourse.approval_status === 'pending_approval' ? 'Review Notes' : 'Previous Review Notes'}
                </label>
                {selectedCourse.approval_status === 'pending_approval' ? (
                  <textarea
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="Add your review notes here..."
                  />
                ) : (
                  <div className="px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm text-gray-700">
                    {selectedCourse.approval_notes || 'No review notes provided'}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Actions - Only show for pending courses */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowReviewModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
              
              {selectedCourse.approval_status === 'pending_approval' && (
                <>
                  <button
                    onClick={() => handleReject(selectedCourse.id)}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    {actionLoading ? 'Rejecting...' : 'Reject'}
                  </button>
                  <button
                    onClick={() => handleApprove(selectedCourse.id)}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {actionLoading ? 'Approving...' : 'Approve'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}