'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface Course {
  id: string;
  title: string;
  description: string;
  image: string;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  progress?: number;
  students?: number;
  rating?: number;
  price?: number;
  currency?: string;
  category?: string;
  instructor?: {
    name: string;
    avatar?: string;
  };
  tutor?: {
    full_name: string;
    avatar?: string;
  };
  status?: 'active' | 'completed' | 'upcoming' | 'draft';
  lastAccessed?: string;
}

interface CourseCardProps {
  course: Course;
  variant?: 'student' | 'tutor' | 'admin';
  showProgress?: boolean;
  onEdit?: (courseId: string) => void;
  onDelete?: (courseId: string) => void;
}

const CourseCard = ({
  course,
  variant = 'student',
  showProgress = true,
  onEdit,
  onDelete
}: CourseCardProps) => {
  const getStatusVariant = (status?: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'active':
        return 'default';
      case 'completed':
        return 'secondary';
      case 'upcoming':
        return 'outline';
      case 'draft':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getLevelVariant = (level: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (level) {
      case 'Beginner':
        return 'default';
      case 'Intermediate':
        return 'outline';
      case 'Advanced':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getActionLink = () => {
    switch (variant) {
      case 'student':
        return `/dashboard/student/courses/${course.id}`;
      case 'tutor':
        return `/dashboard/tutor/courses/${course.id}`;
      case 'admin':
        return `/dashboard/admin/courses/${course.id}`;
      default:
        return `/courses/course/${course.id}`;
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-all duration-200 group">
      {/* Course Image */}
      <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600 overflow-hidden">
        <Image
          src={course.image}
          alt={course.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Status Badge */}
        {course.status && (
          <div className="absolute top-3 left-3">
            <Badge variant={getStatusVariant(course.status)} className="capitalize">
              {course.status}
            </Badge>
          </div>
        )}

        {/* Level Badge */}
        <div className="absolute top-3 right-3">
          <Badge variant={getLevelVariant(course.level)}>
            {course.level}
          </Badge>
        </div>

        {/* Actions Menu */}
        {(variant === 'tutor' || variant === 'admin') && (onEdit || onDelete) && (
          <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex space-x-2">
              {onEdit && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.preventDefault();
                    onEdit(course.id);
                  }}
                  className="bg-white/90 backdrop-blur-sm hover:bg-white"
                  title="Edit course"
                >
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.preventDefault();
                    onDelete(course.id);
                  }}
                  className="bg-white/90 backdrop-blur-sm hover:bg-red-50"
                  title="Delete course"
                >
                  <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Course Content */}
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {course.title}
        </h3>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {course.description}
        </p>

        {/* Progress Bar (for students) */}
        {variant === 'student' && showProgress && course.progress !== undefined && (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Progress</span>
              <span className="text-sm text-gray-500">{course.progress}%</span>
            </div>
            <Progress value={course.progress} className="h-2" />
          </div>
        )}

        {/* Course Info */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {course.duration}
          </div>

          {course.students && (
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              {course.students} students
            </div>
          )}

          {course.rating && Number(course.rating) > 0 && (
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-1 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {Number(course.rating).toFixed(1)}
            </div>
          )}
        </div>

        {/* Instructor/Tutor (for students) */}
        {variant === 'student' && (course.instructor || course.tutor) && (
          <div className="flex items-center mb-4">
            <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden mr-2">
              {(() => {
                const name = course.instructor?.name || course.tutor?.full_name || 'Unknown';
                const avatar = course.instructor?.avatar || course.tutor?.avatar;

                if (avatar) {
                  return (
                    <Image
                      src={avatar}
                      alt={name}
                      width={24}
                      height={24}
                      className="w-full h-full object-cover"
                    />
                  );
                } else {
                  return (
                    <span className="text-xs font-medium text-gray-600">
                      {name.charAt(0).toUpperCase()}
                    </span>
                  );
                }
              })()}
            </div>
            <span className="text-sm text-gray-600">
              {course.instructor?.name || course.tutor?.full_name || 'Unknown Instructor'}
            </span>
          </div>
        )}

        {/* Last Accessed */}
        {course.lastAccessed && (
          <div className="text-xs text-gray-400 mb-4">
            Last accessed: {course.lastAccessed}
          </div>
        )}

        {/* Action Button */}
        <Button asChild className="w-full">
          <Link href={getActionLink()}>
            {variant === 'student' && course.progress === 100 && 'Review Course'}
            {variant === 'student' && course.progress !== 100 && (course.progress ? 'Continue Learning' : 'Start Course')}
            {variant === 'tutor' && 'Manage Course'}
            {variant === 'admin' && 'View Details'}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default CourseCard;
