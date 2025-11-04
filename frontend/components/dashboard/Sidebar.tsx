'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import Logo from '@/components/shared/Logo';
import { authenticatedFetch } from '@/lib/auth';
import { getThemeForRole, getRoleDisplayName, type UserRole } from '@/lib/theme-config';

interface SidebarProps {
  userRole: 'learner' | 'tutor' | 'admin' | 'knowledge_partner' | 'knowledge_partner_instructor' | 'super_admin';
  isCollapsed?: boolean;
  onToggle?: () => void;
}

interface MenuItem {
  label: string;
  href: string;
  icon: React.ReactElement;
  badge?: number;
}

interface KPProfile {
  id: string;
  name: string;
  logo: string | null;
  type: string;
  description: string;
  location: string;
  website: string | null;
  is_active: boolean;
  is_verified: boolean;
}

const Sidebar = ({ userRole, isCollapsed = false, onToggle }: SidebarProps) => {
  const pathname = usePathname();
  const [kpProfile, setKpProfile] = useState<KPProfile | null>(null);
  const [pendingCounts, setPendingCounts] = useState<{
    courses: number;
    liveSessions: number;
  }>({ courses: 0, liveSessions: 0 });
  const [hasLiveSessionNow, setHasLiveSessionNow] = useState(false);

  // Get theme colors for current role
  const theme = getThemeForRole(userRole as UserRole);

  // Fetch KP profile data and pending counts if user is a knowledge partner
  useEffect(() => {
    if (userRole === 'knowledge_partner') {
      fetchKPProfile();
      fetchPendingCounts();
    }
    if (userRole === 'learner') {
      fetchLearnerLiveNow();
      const interval = setInterval(fetchLearnerLiveNow, 30000);
      return () => clearInterval(interval);
    }
  }, [userRole]);

  const fetchKPProfile = async () => {
    try {
      const response = await authenticatedFetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/admin/profile/`);
      if (response.ok) {
        const data = await response.json();
        setKpProfile(data);
      }
    } catch (error) {
      console.error('Failed to fetch KP profile:', error);
    }
  };

  const fetchPendingCounts = async () => {
    try {
      const coursesResponse = await authenticatedFetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/admin/course-review/stats/`);
      let coursesCount = 0;
      if (coursesResponse.ok) {
        const coursesData = await coursesResponse.json();
        coursesCount = coursesData.stats?.total_pending || coursesData.total_pending || 0;
      }

      const sessionsResponse = await authenticatedFetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/courses/live-sessions/training-partner/live-sessions/`);
      let sessionsCount = 0;
      if (sessionsResponse.ok) {
        const sessionsData = await sessionsResponse.json();
        const sessions = Array.isArray(sessionsData) ? sessionsData : sessionsData.results || [];
        sessionsCount = sessions.filter((session: { status: string }) => session.status === 'pending_approval').length;
      }

      setPendingCounts({ courses: coursesCount, liveSessions: sessionsCount });
    } catch (error) {
      console.error('Failed to fetch pending counts:', error);
    }
  };

  const fetchLearnerLiveNow = async () => {
    try {
      const response = await authenticatedFetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/courses/live-sessions/learner/live-sessions/`);
      if (!response.ok) return;
      const data = await response.json();
      const sessions = Array.isArray(data) ? data : (data.results || []);
      const liveNow = sessions.some((s: { is_live_now?: boolean; status?: string }) => s?.is_live_now === true || s?.status === 'live');
      setHasLiveSessionNow(liveNow);
    } catch (error) {
      console.error('Failed to check live sessions for learner:', error);
    }
  };

  useEffect(() => {
    if (userRole === 'knowledge_partner' && (pathname.includes('/course-review') || pathname.includes('/live-sessions'))) {
      const timer = setTimeout(() => {
        fetchPendingCounts();
      }, 1000);
      return () => clearTimeout(timer);
    }
    if (userRole === 'learner') {
      const timer = setTimeout(() => {
        fetchLearnerLiveNow();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [pathname, userRole]);

  useEffect(() => {
    if (userRole === 'knowledge_partner') {
      (window as unknown as { refreshSidebarCounts?: () => void }).refreshSidebarCounts = fetchPendingCounts;
    }
  }, [userRole]);

  const getMenuItems = (): MenuItem[] => {
    const baseItems: MenuItem[] = [
      {
        label: 'Dashboard',
        href: `/dashboard/${userRole}`,
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
          </svg>
        ),
      },
    ];

    switch (userRole) {
      case 'learner':
        return [
          {
            label: 'Home',
            href: '/dashboard/learner',
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            ),
          },
          {
            label: 'My Profile',
            href: '/dashboard/learner/profile',
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            ),
          },
          {
            label: 'My Courses',
            href: '/dashboard/learner/courses',
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            ),
          },
          {
            label: 'All Courses',
            href: '/courses',
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            ),
          },
          {
            label: 'Live Sessions',
            href: '/dashboard/learner/live-sessions',
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            ),
          },
          {
            label: 'Payments',
            href: '/dashboard/learner/payments',
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            ),
          },
        ];

      case 'tutor':
        return [
          ...baseItems,
          {
            label: 'My Courses',
            href: '/dashboard/tutor/courses',
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            ),
          },
          {
            label: 'My Learners',
            href: '/dashboard/tutor/learners',
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            ),
          },
          {
            label: 'Live Sessions',
            href: '/dashboard/tutor/sessions',
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            ),
          },
        ];

      case 'admin':
        return [
          ...baseItems,
          {
            label: 'User Management',
            href: '/dashboard/admin/users',
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            ),
          },
          {
            label: 'Course Management',
            href: '/dashboard/admin/courses',
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            ),
          },
          {
            label: 'System Settings',
            href: '/dashboard/admin/settings',
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            ),
          },
        ];

      case 'knowledge_partner':
        return [
          {
            label: 'Dashboard',
            href: '/dashboard/kp',
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
              </svg>
            ),
          },
          {
            label: 'Profile',
            href: '/dashboard/kp/profile',
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            ),
          },
          {
            label: 'Instructors',
            href: '/dashboard/kp/instructors',
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            ),
          },
          {
            label: 'Learners',
            href: '/dashboard/kp/learners',
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
            ),
          },
          {
            label: 'Courses',
            href: '/dashboard/kp/courses',
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            ),
          },
          {
            label: 'Course Review',
            href: '/dashboard/kp/course-review',
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ),
            badge: pendingCounts.courses > 0 ? pendingCounts.courses : undefined,
          },
          {
            label: 'Live Sessions Review',
            href: '/dashboard/kp/live-sessions',
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            ),
            badge: pendingCounts.liveSessions > 0 ? pendingCounts.liveSessions : undefined,
          },
          {
            label: 'Payments',
            href: '/dashboard/kp/payments',
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            ),
          },
        ];

      case 'knowledge_partner_instructor':
        return [
          {
            label: 'Dashboard',
            href: '/dashboard/instructor',
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
              </svg>
            ),
          },
          {
            label: 'Profile',
            href: '/dashboard/instructor/profile',
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            ),
          },
          {
            label: 'My Courses',
            href: '/dashboard/instructor/courses',
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            ),
          },
          {
            label: 'Learners',
            href: '/dashboard/instructor/learners',
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
            ),
          },
          {
            label: 'Live Sessions',
            href: '/dashboard/instructor/sessions',
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            ),
          },
          {
            label: 'Attendance',
            href: '/dashboard/instructor/attendance',
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            ),
          },
        ];

      case 'super_admin':
        return [
          {
            label: 'Dashboard',
            href: '/dashboard/super-admin',
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
              </svg>
            ),
          },
          {
            label: 'KP Applications',
            href: '/dashboard/super-admin/applications',
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            ),
          },
          {
            label: 'Users',
            href: '/dashboard/super-admin/users',
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            ),
          },
        ];

      default:
        return baseItems;
    }
  };

  const menuItems = getMenuItems();

  const KPLogo = () => {
    if (!kpProfile) {
      return (
        <Link href="/dashboard/kp" className="flex items-center">
          <Logo size="sm" showText={!isCollapsed} textClassName="text-white" />
        </Link>
      );
    }

    if (kpProfile.logo) {
      return (
        <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
          <div className={`relative ${isCollapsed ? 'w-8 h-8' : 'w-8 h-8 mr-3'}`}>
            <Image
              src={kpProfile.logo}
              alt={kpProfile.name}
              fill
              className="object-contain"
              sizes="32px"
            />
          </div>
          {!isCollapsed && (
            <span className="font-semibold text-white text-lg truncate">
              {kpProfile.name}
            </span>
          )}
        </Link>
      );
    } else {
      return (
        <Link href="/dashboard/kp" className="flex items-center">
          <Logo size="sm" showText={!isCollapsed} textClassName="text-white" />
        </Link>
      );
    }
  };

  return (
    <div 
      className={`text-white h-screen flex flex-col transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      } relative`}
      style={{
        background: 'linear-gradient(180deg, #1a1f35 0%, #0f1419 100%)',
        boxShadow: '2px 0 12px rgba(0, 0, 0, 0.3)'
      }}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-700/50" style={{
        background: 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)'
      }}>
        <div className="flex items-center justify-between">
          {userRole === 'knowledge_partner' ? (
            <KPLogo />
          ) : (
            <>
              {!isCollapsed && (
                <Logo size="sm" showText={true} textClassName="text-white" />
              )}
              {isCollapsed && (
                <Logo size="sm" showText={false} />
              )}
            </>
          )}
          {onToggle && (
            <button
              onClick={onToggle}
              className="p-1.5 rounded-lg hover:bg-gray-800 transition-colors"
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          let isActive = false;
          
          if (pathname === item.href) {
            isActive = true;
          } else if (item.href !== '/dashboard/kp' && item.href !== '/dashboard/learner' && item.href !== '/dashboard/tutor' && item.href !== '/dashboard/admin' && item.href !== '/dashboard/instructor' && item.href !== '/dashboard/super-admin') {
            isActive = pathname.startsWith(item.href + '/');
          }
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 group relative ${
                isActive 
                  ? 'text-white font-semibold' 
                  : 'text-gray-400 hover:text-white'
              }`}
              style={{
                backgroundColor: isActive ? theme.primary : 'transparent',
                borderLeft: isActive ? `3px solid ${theme.primary}` : '3px solid transparent',
                boxShadow: isActive ? `0 4px 12px ${theme.primary}40` : 'none',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = `${theme.primary}30`;
                  e.currentTarget.style.borderLeft = `3px solid ${theme.primary}80`;
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.borderLeft = '3px solid transparent';
                }
              }}
            >
              <span className={`${isCollapsed ? 'mx-auto' : 'mr-3'} relative`}>
                {item.icon}
                {userRole === 'learner' && item.href === '/dashboard/learner/live-sessions' && hasLiveSessionNow && (
                  <>
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
                    </span>
                  </>
                )}
                {isCollapsed && item.badge && item.badge > 0 && (
                  <span 
                    className="absolute -top-1 -right-1 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center text-[10px] font-bold"
                    style={{ backgroundColor: theme.accent }}
                  >
                    {item.badge}
                  </span>
                )}
              </span>
              {!isCollapsed && (
                <>
                  <span className="flex-1 font-medium">{item.label}</span>
                  {userRole === 'learner' && item.href === '/dashboard/learner/live-sessions' && hasLiveSessionNow && (
                    <span className="ml-2 flex items-center">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600"></span>
                      </span>
                    </span>
                  )}
                  {item.badge && item.badge > 0 && (
                    <span 
                      className="text-white text-xs px-2 py-0.5 rounded-full ml-2 min-w-[20px] text-center"
                      style={{ backgroundColor: theme.accent }}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Role Badge */}
      <div className="p-4 border-t border-gray-700/50" style={{
        background: 'linear-gradient(180deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.05) 100%)'
      }}>
        {!isCollapsed && (
          <div className="flex items-center">
            <div 
              className="w-2 h-2 rounded-full mr-2 animate-pulse"
              style={{ 
                backgroundColor: theme.primary,
                boxShadow: `0 0 8px ${theme.primary}80`
              }}
            ></div>
            <span className="text-sm text-gray-400 capitalize">
              {userRole === 'knowledge_partner' && kpProfile 
                ? `${kpProfile.name} Dashboard` 
                : getRoleDisplayName(userRole as UserRole)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
