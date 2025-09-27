'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { learnerDashboardApi } from '@/lib/api';

interface Course {
  id: string;
  slug: string;
  title: string;
  thumbnail?: string | null;
  duration_weeks?: number;
  level_display?: string;
}

interface Enrollment {
  id: string;
  course: Course;
  progress_percentage?: number;
  status: string;
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
      } catch (e) {
        setError('Failed to load your courses.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">Loading...</div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-red-600">{error}</div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">My Courses</h1>
        <Link href="/courses" className="text-sm text-blue-600 hover:text-blue-700 font-medium">Browse All</Link>
      </div>

      {enrollments.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-gray-600">You have not enrolled in any courses yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {enrollments.map((en) => (
            <div key={en.id} className="bg-white rounded-xl border border-gray-200 p-4">
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
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${en.progress_percentage || 0}%` }} />
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>{en.progress_percentage || 0}% complete</span>
                <span className={`px-2 py-0.5 rounded-full ${en.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{en.status}</span>
              </div>
              <div className="pt-3 border-t border-gray-100 mt-3">
                <Link href={`/dashboard/learner/courses/${en.course?.slug || en.course?.id || en.id}`} className="w-full inline-flex items-center justify-center px-3 py-2 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">{(en.progress_percentage || 0) > 0 ? 'Continue' : 'Start'}</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


