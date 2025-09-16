'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { getCurrentUser, isAuthenticated } from '@/lib/auth';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [user, setUser] = useState(getCurrentUser());
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  // Check authentication and redirect if needed
  useEffect(() => {
    const checkAuth = () => {
      if (!isAuthenticated()) {
        router.push('/');
        return;
      }

      const currentUser = getCurrentUser();
      if (currentUser) {
        // Check if user is accessing the correct dashboard
        const pathSegment = pathname.split('/')[2]; // Extract role from /dashboard/role/...
        
        // Map roles to their dashboard paths
        const roleToDashboard: Record<string, string> = {
          'learner': 'student',
          'knowledge_partner_instructor': 'instructor',
          'knowledge_partner_admin': 'kp',
          'student': 'student',
          'tutor': 'tutor',
          'admin': 'admin',
          'super_admin': 'super-admin'
        };
        
        const expectedDashboard = roleToDashboard[currentUser.role];
        
        if (pathSegment && expectedDashboard && pathSegment !== expectedDashboard) {
          // Redirect to correct dashboard
          router.push(`/dashboard/${expectedDashboard}`);
          return;
        }
        setUser(currentUser);
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [pathname, router]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  // Show nothing if not authenticated (will redirect)
  if (!user) {
    return null;
  }

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 transition-all duration-300 lg:relative lg:translate-x-0 ${
        sidebarCollapsed ? 'w-16' : 'w-64'
      }`}>
        <Sidebar
          userRole={user.role as 'student' | 'tutor' | 'admin' | 'knowledge_partner_admin' | 'knowledge_partner_instructor' | 'super_admin'}
          isCollapsed={sidebarCollapsed}
          onToggle={toggleSidebar}
        />
      </div>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${
        sidebarCollapsed ? 'ml-16 lg:ml-16' : 'ml-64 lg:ml-0'
      }`}>
        {/* Header */}
        <Header
          user={user}
          onSidebarToggle={toggleSidebar}
          showSidebarToggle={true}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 lg:p-6">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      <div className="lg:hidden">
        {!sidebarCollapsed && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setSidebarCollapsed(true)}
          />
        )}
      </div>
    </div>
  );
}
