'use client';

import React, { useEffect } from 'react';

interface LearnerSuccessScreenProps {
  userEmail: string;
  onComplete: () => void;
}

const LearnerSuccessScreen = ({ userEmail, onComplete }: LearnerSuccessScreenProps) => {
  // Auto-close after 3 seconds and open login modal
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 3000); // Reduced to 3 seconds for faster transition

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="text-center space-y-8 animate-fadeIn">
      {/* Animated Success Icon */}
      <div className="flex justify-center">
        <div className="relative">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center animate-pulse">
            <svg 
              className="w-16 h-16 text-green-600 animate-bounce" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={3} 
                d="M5 13l4 4L19 7" 
              />
            </svg>
          </div>
          {/* Ripple effect */}
          <div className="absolute inset-0 w-24 h-24 bg-green-200 rounded-full animate-ping opacity-20"></div>
        </div>
      </div>

      {/* Simple Success Message */}
      <div className="space-y-4">
        <h3 className="text-3xl font-bold text-gray-900 animate-fadeIn">
          Happy Learning! 🎉
        </h3>
        <p className="text-lg text-gray-600">
          All the best for your learning journey!
        </p>
        <p className="text-sm text-gray-500">
          Redirecting you to login...
        </p>
        <div className="flex justify-center mt-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    </div>
  );
};

export default LearnerSuccessScreen;
