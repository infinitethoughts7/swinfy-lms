'use client';

import { useState } from 'react';
import Link from 'next/link';
import MobileMenuToggle from './MobileMenuToggle';
import { useModal } from '@/components/providers/ModalProvider';
import Logo from '@/components/shared/Logo';

const StaticNavbar = () => {
  const { openRegistrationModal, openLoginModal } = useModal();
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-white/20 shadow-sm"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12 lg:h-14">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Logo size="lg" showText={true} href="/" textClassName="text-text-primary" />
          </div>

          {/* Center Navigation - Only Courses */}
          <div className="hidden md:flex items-center">
            <Link
              href="/courses"
              className="text-text-primary hover:text-black transition-all duration-300 font-inter font-medium text-base lg:text-lg hover:scale-105 px-4 py-2 rounded-lg hover:bg-gray-50"
            >
              Courses
            </Link>
          </div>

          {/* Search Box */}
          <div className="hidden md:flex items-center flex-1 max-w-md ml-4 mr-4">
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

          {/* Join Session Button */}
          <div className="hidden md:flex items-center mr-4">
            <button
              onClick={() => {
                // TODO: Implement join session functionality
                console.log('Join session clicked');
              }}
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 rounded-full hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
            >
              <svg 
                className="w-4 h-4 mr-2" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" 
                />
              </svg>
              Join Session
            </button>
          </div>

          {/* Right Actions - Login & Sign Up */}
          <div className="hidden md:flex items-center space-x-2">
            <button
              onClick={openLoginModal}
              className="inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium text-text-primary hover:bg-gray-100 focus:ring-2 focus:ring-text-primary/20 transition-all duration-300 rounded-full"
            >
              Login
            </button>
            <button
              onClick={openRegistrationModal}
              className="inline-flex items-center justify-center px-4 py-1.5 text-sm font-medium bg-text-primary text-white hover:bg-black focus:ring-2 focus:ring-text-primary/20 transition-all duration-300 rounded-full hover:scale-105 active:scale-95"
            >
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
