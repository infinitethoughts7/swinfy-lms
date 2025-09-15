'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import MobileMenuToggle from './MobileMenuToggle';
import { useModal } from '@/components/providers/ModalProvider';
import Logo from '@/components/shared/Logo';
import { getCurrentUser, logout, isAuthenticated } from '@/lib/auth';

interface User {
  full_name?: string;
  email?: string;
  role?: string;
}

const StaticNavbar = () => {
  const { openRegistrationModal, openLoginModal } = useModal();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check authentication status on component mount
    const checkAuth = () => {
      const currentUser = getCurrentUser();
      const authenticated = isAuthenticated();
      setUser(currentUser);
      setIsLoggedIn(authenticated);
    };

    checkAuth();

    // Listen for storage changes (login/logout from other tabs)
    const handleStorageChange = () => {
      checkAuth();
    };

    // Listen for login events
    const handleUserLogin = () => {
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userLogin', handleUserLogin);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userLogin', handleUserLogin);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setUser(null);
    setIsLoggedIn(false);
    // Dispatch logout event
    window.dispatchEvent(new CustomEvent('userLogout'));
    router.push('/');
  };

  const handleDashboardClick = () => {
    if (user?.role) {
      const roleToDashboard: Record<string, string> = {
        'learner': 'student',
        'knowledge_partner_instructor': 'instructor',
        'knowledge_partner_admin': 'kp',
        'student': 'student',
        'tutor': 'tutor',
        'admin': 'admin'
      };
      const dashboardPath = roleToDashboard[user.role] || user.role;
      router.push(`/dashboard/${dashboardPath}`);
    }
  };
  
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-white/20 shadow-sm"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-12 lg:h-14">
          {/* Logo and Courses Button */}
          <div className="flex items-center space-x-8">
            <Logo size="lg" showText={true} href="/" textClassName="text-text-primary" />
            <Link
              href="/courses"
              className="hidden md:inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-blue-600 border border-blue-300 rounded-full hover:border-blue-500 transition-all duration-300 hover:scale-105"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Courses
            </Link>
          </div>

          {/* Search Box */}
          <div className="hidden md:flex items-center w-80 ml-8">
            <div className="relative w-full">
              <div className={`relative transition-all duration-300 ${isSearchFocused ? 'scale-105' : ''}`}>
                <input
                  type="text"
                  placeholder="Search courses, topics, or skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-full bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 placeholder-gray-400"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg 
                    className={`w-4 h-4 text-gray-400 transition-all duration-300 ${isSearchFocused ? 'text-blue-500 scale-110' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Spacer to push right actions to the right */}
          <div className="flex-1"></div>

          {/* Right Actions - Conditional based on auth status */}
          <div className="hidden md:flex items-center space-x-2">
            {isLoggedIn ? (
              // User is logged in - show user dropdown only
              <div className="relative group">
                <button className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 rounded-full shadow-lg hover:shadow-xl hover:scale-105 active:scale-95">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {user?.full_name || user?.email || 'User'}
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {/* Dropdown menu */}
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <button
                    onClick={handleDashboardClick}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              // User is not logged in - show login and sign up
              <>
                <button
                  onClick={openLoginModal}
                  className="inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-text-primary hover:bg-gray-100 focus:ring-2 focus:ring-text-primary/20 transition-all duration-300 rounded-full"
                >
                  Login
                </button>
                <button
                  onClick={openRegistrationModal}
                  className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium bg-text-primary text-white hover:bg-black focus:ring-2 focus:ring-text-primary/20 transition-all duration-300 rounded-full hover:scale-105 active:scale-95"
                >
                  Sign up
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <MobileMenuToggle />
        </div>
      </div>
    </nav>
  );
};

export default StaticNavbar;
