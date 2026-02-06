"use client";

import { useState, useEffect } from 'react';
import {
  BookOpen,
  Clock,
  User,
  CheckCircle,
  XCircle,
  Eye,
  Star,
  Play,
  FileText,
  Image,
  Award,
  Search
} from 'lucide-react';
import { authenticatedFetch, isAuthenticated, logout } from '@/lib/auth/token';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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

export default function CourseReviewPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
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
  }, []);

  useEffect(() => {
    const coursesToFilter = Array.isArray(courses) ? courses : [];
    let filtered = coursesToFilter;

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
  }, [courses, searchTerm, statusFilter]);

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
      if ((window as any).refreshSidebarCounts) {
        (window as any).refreshSidebarCounts();
      }
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
      if ((window as any).refreshSidebarCounts) {
        (window as any).refreshSidebarCounts();
      }
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-80" />
              <Skeleton className="h-10 w-40" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="text-center">
          <Button onClick={fetchCourses}>
            Try Again
          </Button>
        </div>
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

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-3">
          <div className="flex items-center gap-3">
            <div className="w-80">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="w-40">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending_approval">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(searchTerm || statusFilter !== 'all') && (
              <Button
                variant="secondary"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                }}
              >
                Clear
              </Button>
            )}

            <div className="ml-auto text-sm text-gray-500">
              {safeFilteredCourses.length} of {safeCourses.length} courses
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Courses List */}
      <Card>
        <CardHeader>
          <CardTitle>Course History</CardTitle>
        </CardHeader>
        <CardContent>
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
                <Card key={course.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{course.title}</h3>
                          <Badge className={getStatusColor(course.approval_status)}>
                            {course.approval_status.replace('_', ' ').toUpperCase()}
                          </Badge>
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
                        <Button onClick={() => openReviewModal(course)}>
                          <Eye className="h-4 w-4 mr-2" />
                          {course.approval_status === 'pending_approval' ? 'Review' : 'View Details'}
                        </Button>

                        {course.approval_status === 'pending_approval' && (
                          <>
                            <Button
                              variant="default"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleApprove(course.id)}
                              disabled={actionLoading}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Quick Approve
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() => {
                                setSelectedCourse(course);
                                setReviewNotes('');
                                setShowReviewModal(true);
                              }}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
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
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Modal */}
      <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedCourse?.approval_status === 'pending_approval' ? 'Review Course' : 'Course Details'}
            </DialogTitle>
            <DialogDescription>{selectedCourse?.title}</DialogDescription>
          </DialogHeader>

          {selectedCourse && (
            <div className="space-y-6">
              {/* Course Overview */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
                  Course Overview
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Course Title</span>
                      <span className="text-sm text-gray-900 font-semibold">{selectedCourse.title}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Instructor</span>
                      <span className="text-sm text-gray-900">{selectedCourse.tutor?.full_name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Category</span>
                      <span className="text-sm text-gray-900 capitalize">{selectedCourse.category.replace('_', ' ')}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Level</span>
                      <span className="text-sm text-gray-900 capitalize">{selectedCourse.level}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Price</span>
                      <span className="text-sm text-gray-900 font-semibold">₹{selectedCourse.price}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Duration</span>
                      <span className="text-sm text-gray-900">{selectedCourse.duration_weeks} weeks</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Enrollments</span>
                      <span className="text-sm text-gray-900">{selectedCourse.enrollment_count || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Status</span>
                      <Badge className={getStatusColor(selectedCourse.approval_status)}>
                        {selectedCourse.approval_status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Course Description */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Course Description</h4>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-700 leading-relaxed">{selectedCourse.description}</p>
                </div>
              </div>

              {/* Course Short Description */}
              {selectedCourse.short_description && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Course Summary</h4>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-gray-700 leading-relaxed">{selectedCourse.short_description}</p>
                  </div>
                </div>
              )}

              {/* Course Content */}
              {selectedCourse.modules && selectedCourse.modules.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Course Content</h4>
                  <p className="text-sm text-gray-600 mb-6">
                    {Math.round(selectedCourse.total_duration_minutes / 60)}h {selectedCourse.total_duration_minutes % 60}m - {selectedCourse.modules.length} Sections - {selectedCourse.lessons_count} Lessons
                  </p>

                  <div className="space-y-1">
                    {selectedCourse.modules.map((module, moduleIndex) => (
                      <div key={module.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-8 h-8 bg-gray-300 rounded-lg flex items-center justify-center text-gray-700 font-semibold text-sm">
                              {moduleIndex + 1}
                            </div>
                            <div>
                              <h5 className="font-semibold text-gray-900 text-base">
                                {module.title}
                              </h5>
                              <p className="text-sm text-gray-600">
                                {module.lessons?.length || 0} lessons - {module.lessons?.reduce((total, lesson) => total + (lesson.duration_minutes || 0), 0) || 0}m
                              </p>
                            </div>
                          </div>
                        </div>

                        {module.lessons && module.lessons.length > 0 && (
                          <div className="mt-4 pl-12 space-y-1">
                            {module.lessons.map((lesson) => (
                              <div key={lesson.id} className="flex items-center space-x-3 py-2 hover:bg-gray-100 rounded-lg px-2">
                                <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                                  {getLessonIcon(lesson.lesson_type)}
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-900">
                                    {lesson.title}
                                  </p>
                                  <p className="text-xs text-gray-500 capitalize">
                                    {lesson.lesson_type}
                                  </p>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-xs text-gray-500">{lesson.duration_minutes}m</span>
                                  {lesson.is_preview && (
                                    <Badge className="bg-blue-100 text-blue-800">Preview</Badge>
                                  )}
                                  {lesson.is_mandatory && (
                                    <Badge className="bg-red-100 text-red-800">Mandatory</Badge>
                                  )}
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

              {/* Review Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {selectedCourse.approval_status === 'pending_approval' ? 'Review Notes' : 'Previous Review Notes'}
                </label>
                {selectedCourse.approval_status === 'pending_approval' ? (
                  <Textarea
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    rows={4}
                    placeholder="Add your review notes here..."
                  />
                ) : (
                  <div className="px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm text-gray-700">
                    {selectedCourse.approval_notes || 'No review notes provided'}
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReviewModal(false)}>
              Close
            </Button>

            {selectedCourse?.approval_status === 'pending_approval' && (
              <>
                <Button
                  variant="destructive"
                  onClick={() => selectedCourse && handleReject(selectedCourse.id)}
                  disabled={actionLoading}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  {actionLoading ? 'Rejecting...' : 'Reject'}
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => selectedCourse && handleApprove(selectedCourse.id)}
                  disabled={actionLoading}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {actionLoading ? 'Approving...' : 'Approve'}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
