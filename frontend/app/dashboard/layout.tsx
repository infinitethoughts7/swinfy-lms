'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import ErrorBoundary from '@/components/ErrorBoundary';
import { getCurrentUser, isAuthenticated } from '@/lib/auth';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'learner' | 'tutor' | 'admin' | 'knowledge_partner_instructor' | 'knowledge_partner' | 'super_admin';
  role_display?: string;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // Initialize as null to avoid hydration mismatch (don't call getCurrentUser during SSR)
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Mark as mounted (client-side only)
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Check authentication after mount
  useEffect(() => {
    if (!isMounted) return;

    const checkAuth = () => {
      const authenticated = isAuthenticated();
      const currentUser = getCurrentUser();

      if (!authenticated || !currentUser) {
        setIsLoading(false);
        router.push('/');
        return;
      }

      // Check if user is accessing the correct dashboard
      const pathSegment = pathname.split('/')[2];

      const roleToDashboard: Record<string, string> = {
        'learner': 'learner',
        'knowledge_partner_instructor': 'instructor',
        'knowledge_partner': 'kp',
        'tutor': 'tutor',
        'admin': 'admin',
        'super_admin': 'super-admin'
      };

      const expectedDashboard = roleToDashboard[currentUser.role];

      if (pathSegment && expectedDashboard && pathSegment !== expectedDashboard) {
        router.push(`/dashboard/${expectedDashboard}`);
        return;
      }

      setUser(currentUser);
      setIsLoading(false);
    };

    checkAuth();
  }, [isMounted, pathname, router]);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);
  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  // Always render the same structure to avoid hydration mismatch
  // Use CSS to show/hide loading state
  if (!isMounted || isLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 flex">
        {/* Desktop Sidebar */}
        <div className={`hidden lg:block fixed left-0 top-0 z-40 transition-all duration-300 ${
          sidebarCollapsed ? 'w-16' : 'w-64'
        }`}>
          <Sidebar
            userRole={user.role}
            isCollapsed={sidebarCollapsed}
            onToggle={toggleSidebar}
          />
        </div>

        {/* Mobile Sidebar */}
        <div className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <Sidebar
            userRole={user.role}
            isCollapsed={false}
            onToggle={toggleMobileMenu}
          />
        </div>

        {/* Main Content */}
        <div className={`flex-1 flex flex-col transition-all duration-300 ${
          sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
        }`}>
          <Header
            user={user}
            onSidebarToggle={toggleMobileMenu}
            showSidebarToggle={true}
          />
          <main className="flex-1 overflow-auto">
            <div className="p-3 sm:p-4 lg:p-6">
              {children}
            </div>
          </main>
        </div>

        {/* Mobile Overlay */}
        {mobileMenuOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}
