'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { learnerDashboardApi } from '@/features/dashboard/services/learner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Clock, X } from 'lucide-react';

interface Course {
  id: string;
  slug: string;
  title: string;
  thumbnail?: string | null;
  thumbnail_url?: string | null;
  duration_weeks?: number;
  level_display?: string;
}

interface Enrollment {
  id: string;
  course: Course;
  progress_percentage?: number;
  status: string;
}

function CoursesSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-8 w-24" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-64 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export default function LearnerMyCoursesPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await learnerDashboardApi.getMyCourses();
        const items = (res?.results || res || []) as Enrollment[];
        setEnrollments(items);
      } catch {
        setError('Failed to load your courses.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) {
    return <CoursesSkeleton />;
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">My Courses</h1>
        <Button variant="link" asChild className="p-0 h-auto">
          <Link href="/courses">Browse All</Link>
        </Button>
      </div>

      {enrollments.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-gray-600">
            You have not enrolled in any courses yet.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {enrollments.map((en) => {
            const isPendingApproval = en.status === 'pending_approval' || en.status === 'pending';
            const isActive = en.status === 'active';
            const isRejected = en.status === 'rejected';

            return (
              <Card key={en.id}>
                <CardContent className="pt-4">
                  <div className="flex items-start space-x-3 mb-3">
                    {(en.course?.thumbnail_url || en.course?.thumbnail) ? (
                      <Image src={en.course.thumbnail_url || en.course.thumbnail || ''} alt={en.course.title} width={60} height={60} className="rounded-lg object-cover" />
                    ) : (
                      <div className="w-[60px] h-[60px] rounded-lg bg-gray-200" />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-2">{en.course?.title}</h3>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{en.course?.level_display || 'Beginner'}</span>
                        <span>{en.course?.duration_weeks || 0} weeks</span>
                      </div>
                    </div>
                  </div>

                  {/* Progress bar - only show for active enrollments */}
                  {isActive && (
                    <>
                      <Progress value={en.progress_percentage || 0} className="h-2 mb-2" />
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <span>{en.progress_percentage || 0}% complete</span>
                        <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100">
                          Active
                        </Badge>
                      </div>
                    </>
                  )}

                  {/* Pending approval status */}
                  {isPendingApproval && (
                    <Alert className="bg-yellow-50 border-yellow-200 mb-2">
                      <Clock className="h-4 w-4 text-yellow-800" />
                      <AlertDescription className="text-yellow-800">
                        <span className="text-xs font-medium">Pending Approval</span>
                        <p className="text-xs text-yellow-700 mt-1">Waiting for course provider approval</p>
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Rejected status */}
                  {isRejected && (
                    <Alert variant="destructive" className="bg-red-50 border-red-200 mb-2">
                      <X className="h-4 w-4" />
                      <AlertDescription>
                        <span className="text-xs font-medium">Enrollment Rejected</span>
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="pt-3 border-t border-gray-100 mt-3">
                    {isActive ? (
                      <Button asChild size="sm" className="w-full">
                        <Link href={`/dashboard/learner/courses/${en.course?.slug || en.course?.id || en.id}`}>
                          {(en.progress_percentage || 0) > 0 ? 'Continue Learning' : 'Start Learning'}
                        </Link>
                      </Button>
                    ) : isPendingApproval ? (
                      <Button
                        disabled
                        size="sm"
                        variant="secondary"
                        className="w-full bg-yellow-100 text-yellow-700 hover:bg-yellow-100 cursor-not-allowed"
                      >
                        <Clock className="w-3 h-3 mr-1" />
                        Awaiting Approval
                      </Button>
                    ) : (
                      <Button asChild size="sm" variant="secondary" className="w-full">
                        <Link href={`/courses/course/${en.course?.slug}`}>
                          View Course
                        </Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
