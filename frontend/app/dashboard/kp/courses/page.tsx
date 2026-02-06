"use client";

import { useState, useEffect } from 'react';
import {
  BookOpen,
  Clock,
  User,
  CheckCircle,
  Eye,
  Star,
  Users,
  Search
} from 'lucide-react';
import Link from 'next/link';
import { authenticatedFetch, isAuthenticated, logout } from '@/lib/auth/token';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

interface Course {
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
  approval_status_display: string;
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
  modules_count: number;
  lessons_count: number;
  total_duration_minutes: number;
}

export default function KPCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');

  const safeCourses = Array.isArray(courses) ? courses : [];

  useEffect(() => {
    if (!isAuthenticated()) {
      logout();
      return;
    }
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await authenticatedFetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/admin/courses/`, {
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

  const filteredCourses = safeCourses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.short_description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.tutor.full_name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = !selectedCategory || selectedCategory === 'all' || course.category === selectedCategory;
    const matchesLevel = !selectedLevel || selectedLevel === 'all' || course.level === selectedLevel;

    return matchesSearch && matchesCategory && matchesLevel;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending_approval':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const categories = [...new Set(safeCourses.map(course => course.category))];
  const levels = [...new Set(safeCourses.map(course => course.level))];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-6 w-24 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-10 w-full" />
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
          <h1 className="text-2xl font-bold text-gray-900">Approved Courses</h1>
          <p className="text-gray-600 text-sm">Manage and view all approved courses from instructors</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/kp/course-review">
            <Eye className="h-4 w-4 mr-2" />
            Review Courses
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Approved</p>
                <p className="text-2xl font-bold text-green-600">{safeCourses.length}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Enrollments</p>
                <p className="text-2xl font-bold text-blue-600">
                  {safeCourses.reduce((total, course) => total + course.enrollment_count, 0)}
                </p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Lessons</p>
                <p className="text-2xl font-bold text-purple-600">
                  {safeCourses.reduce((total, course) => total + course.lessons_count, 0)}
                </p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <BookOpen className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search courses, instructors, or descriptions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="lg:w-48">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Level Filter */}
            <div className="lg:w-48">
              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="All Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  {levels.map(level => (
                    <SelectItem key={level} value={level}>
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Courses List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Approved Courses ({filteredCourses.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredCourses.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                {safeCourses.length === 0
                  ? "No approved courses yet"
                  : "No courses match your search criteria"
                }
              </p>
              <p className="text-gray-400 text-sm">
                {safeCourses.length === 0
                  ? "Courses will appear here once they are approved by admins"
                  : "Try adjusting your search or filter criteria"
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <Card key={course.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    {/* Course Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{course.title}</h3>
                          <Badge className={getStatusColor(course.approval_status)}>
                            {course.approval_status_display}
                          </Badge>
                        </div>
                        <p className="text-gray-600 text-sm line-clamp-2 mb-3">{course.short_description}</p>

                        {/* Course Meta */}
                        <div className="flex items-center space-x-4 text-xs text-gray-500 mb-3">
                          <div className="flex items-center">
                            <User className="h-3 w-3 mr-1" />
                            {course.tutor?.full_name || 'Unknown Instructor'}
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {course.duration_weeks} weeks
                          </div>
                          <div className="flex items-center">
                            <BookOpen className="h-3 w-3 mr-1" />
                            {course.lessons_count} lessons
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Course Details */}
                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Category</span>
                        <span className="text-sm font-medium">{course.category_display}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Level</span>
                        <span className="text-sm font-medium">{course.level_display}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Price</span>
                        <span className="text-lg font-bold text-green-600">₹{course.price}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Enrollments</span>
                        <span className="text-sm font-medium">{course.enrollment_count}</span>
                      </div>
                      {course.rating > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Rating</span>
                          <div className="flex items-center">
                            <Star className="h-3 w-3 text-yellow-400 mr-1" />
                            <span className="text-sm font-medium">{course.rating.toFixed(1)}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Course Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="text-xs text-gray-500">
                        Created {new Date(course.created_at).toLocaleDateString()}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/courses/${course.slug}`}>
                            View
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
