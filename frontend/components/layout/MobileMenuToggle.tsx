"use client";

import { useState } from 'react';
import { Menu, X, Search } from 'lucide-react';
import Link from 'next/link';
import { useModal } from '@/components/providers/ModalProvider';

const MobileMenuToggle = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { openRegistrationModal, openLoginModal } = useModal();

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden p-2 rounded-lg hover:bg-text-primary/5 transition-colors duration-200"
        aria-label="Toggle mobile menu"
        aria-expanded={isOpen}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-text-primary" />
        ) : (
          <Menu className="w-6 h-6 text-text-primary" />
        )}
      </button>

      {/* Mobile menu overlay */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/20 backdrop-blur-sm">
          <div className="fixed top-12 left-0 right-0 bg-white border-b border-border-subtle shadow-lg">
            <div className="px-4 py-6 space-y-4">
              {/* Mobile Search Box */}
              <div className="relative">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search courses, topics, or skills..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-full bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 placeholder-gray-400"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="w-4 h-4 text-gray-400" />
                  </div>
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Mobile Navigation - Only Courses */}
              <Link
                href="/courses"
                className="block py-3 px-4 text-text-primary hover:text-text-secondary hover:bg-text-primary/5 rounded-lg transition-all duration-200 font-inter font-medium"
                onClick={() => setIsOpen(false)}
              >
                Browse Courses
              </Link>

              
              {/* Mobile CTA buttons */}
              <div className="pt-4 space-y-3">
                <button
                  onClick={() => {
                    openLoginModal();
                    setIsOpen(false);
                  }}
                  className="block w-full text-center py-2 px-4 font-inter font-medium text-text-primary hover:bg-text-primary/5 rounded-full"
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    openRegistrationModal();
                    setIsOpen(false);
                  }}
                  className="block w-full text-center py-2 px-4 bg-text-primary text-white hover:bg-text-primary/90 font-inter font-medium rounded-full"
                >
                  Sign up
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileMenuToggle;
