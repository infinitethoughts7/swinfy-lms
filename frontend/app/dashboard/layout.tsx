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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // For desktop collapse
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false); // For mobile menu visibility
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
          'knowledge_partner': 'kp',
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

  // Close mobile menu when route changes - MUST be called before any early returns
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Helper functions
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

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

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar - Always visible on lg+ */}
      <div className={`hidden lg:block fixed left-0 top-0 z-40 transition-all duration-300 ${
        sidebarCollapsed ? 'w-16' : 'w-64'
      }`}>
        <Sidebar
          userRole={user.role as 'student' | 'tutor' | 'admin' | 'knowledge_partner' | 'knowledge_partner_instructor' | 'super_admin'}
          isCollapsed={sidebarCollapsed}
          onToggle={toggleSidebar}
        />
      </div>

      {/* Mobile Sidebar - Only visible when mobileMenuOpen is true */}
      <div className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <Sidebar
          userRole={user.role as 'student' | 'tutor' | 'admin' | 'knowledge_partner' | 'knowledge_partner_instructor' | 'super_admin'}
          isCollapsed={false} // Never collapsed on mobile
          onToggle={toggleMobileMenu}
        />
      </div>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${
        sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
      }`}>
        {/* Header */}
        <Header
          user={user}
          onSidebarToggle={toggleMobileMenu} // This will handle mobile menu toggle
          showSidebarToggle={true}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto">
          <div className="p-3 sm:p-4 lg:p-6">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
