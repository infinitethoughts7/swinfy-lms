'use client';

import Link from 'next/link';
import MobileMenuToggle from './MobileMenuToggle';
import { useModal } from '@/components/providers/ModalProvider';
import Logo from '@/components/shared/Logo';

const StaticNavbar = () => {
  const { openRegistrationModal, openLoginModal } = useModal();
  
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-white/20 shadow-sm"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-18">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Logo size="lg" showText={true} href="/" textClassName="text-text-primary" />
          </div>

          {/* Center Navigation */}
          <div className="hidden md:flex items-center space-x-8 lg:space-x-12">
            <Link
              href="/courses"
              className="text-text-primary hover:text-black transition-all duration-300 font-inter font-medium text-base lg:text-lg hover:scale-105"
            >
              Courses
            </Link>
            <Link
              href="/team"
              className="text-text-primary hover:text-black transition-all duration-300 font-inter font-medium text-base lg:text-lg hover:scale-105"
            >
              Team
            </Link>
            
            <Link
              href="/review"
              className="text-text-primary hover:text-black transition-all duration-300 font-inter font-medium text-base lg:text-lg hover:scale-105"
            >
              Review
            </Link>
            <Link
              href="/hire"
              className="text-text-primary hover:text-black transition-all duration-300 font-inter font-medium text-base lg:text-lg hover:scale-105"
            >
              Hire from us
            </Link>
          </div>

          {/* Right Actions - Static Buttons */}
          <div className="hidden md:flex items-center space-x-3 lg:space-x-4">
            <button
              onClick={openLoginModal}
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-text-primary hover:bg-black hover:text-white focus:ring-2 focus:ring-text-primary/20 transition-all duration-300 hover:scale-105 rounded-md"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Login
            </button>
            <button
              onClick={openRegistrationModal}
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium bg-text-primary text-white hover:bg-black hover:scale-105 focus:ring-2 focus:ring-text-primary/20 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 rounded-md active:scale-95"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Sign up
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <MobileMenuToggle />
        </div>
      </div>
    </nav>
  );
};

export default StaticNavbar;
