'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Logo from '@/components/shared/Logo';
import ProfileCompletionScreen from './ProfileCompletionScreen';
import LearnerSuccessScreen from './LearnerSuccessScreen';

interface RegistrationSuccessProps {
  userRole: 'learner' | 'knowledge_partner_instructor' | 'knowledge_partner';
  userEmail: string;
  onComplete: () => void;
}

export default function RegistrationSuccess({ userRole, userEmail, onComplete }: RegistrationSuccessProps) {
  const [showCheckmark, setShowCheckmark] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [currentStep, setCurrentStep] = useState<'success' | 'profile-completion' | 'learner-success'>('success');

  useEffect(() => {
    // Trigger checkmark animation
    const checkmarkTimer = setTimeout(() => {
      setShowCheckmark(true);
    }, 300);

    // Show content after checkmark animation
    const contentTimer = setTimeout(() => {
      setShowContent(true);
    }, 800);

    return () => {
      clearTimeout(checkmarkTimer);
      clearTimeout(contentTimer);
    };
  }, []);

  // Render profile completion screen if user has moved to that step
  if (currentStep === 'profile-completion') {
    return (
      <ProfileCompletionScreen
        userRole={userRole}
        userEmail={userEmail}
        onComplete={() => setCurrentStep('learner-success')}
        onSkip={() => setCurrentStep('learner-success')}
      />
    );
  }

  // Render learner success screen after profile completion
  if (currentStep === 'learner-success') {
    return (
      <LearnerSuccessScreen
        userEmail={userEmail}
        onComplete={onComplete}
      />
    );
  }

  return (
    <div className="space-y-6 text-center">
      {/* Logo */}
      <div className="flex justify-center items-center">
        <Logo size="md" showText={true} href="" />
      </div>

      {/* Animated Checkmark */}
      <div className="flex justify-center">
        <div className={`relative w-24 h-24 transition-all duration-500 ${
          showCheckmark ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
        }`}>
          {/* Circle background */}
          <div className={`w-24 h-24 bg-green-100 rounded-full flex items-center justify-center transition-all duration-500 ${
            showCheckmark ? 'bg-green-500' : 'bg-green-100'
          }`}>
            {/* Checkmark */}
            <div className="relative">
              <svg 
                className={`w-12 h-12 text-white transition-all duration-700 ${
                  showCheckmark ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
                }`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                  className={`transition-all duration-1000 ${
                    showCheckmark ? 'animate-draw-check' : ''
                  }`}
                />
              </svg>
            </div>
          </div>

          {/* Pulse effect */}
          {showCheckmark && (
            <>
              <div className="absolute inset-0 w-24 h-24 bg-green-500 rounded-full animate-ping opacity-20"></div>
              <div className="absolute inset-0 w-24 h-24 bg-green-500 rounded-full animate-pulse opacity-10"></div>
            </>
          )}
        </div>
      </div>

      {/* Success Content */}
      <div className={`space-y-4 transition-all duration-500 ${
        showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}>
        <h2 className="text-3xl font-bold text-gray-900">
          Welcome to OLLA LMS! 🎉
        </h2>
        
        <div className="space-y-2">
          <p className="text-xl font-semibold text-green-600">
            Email Verified Successfully!
          </p>
          <p className="text-gray-600">
            Your account is now active and ready to use.
          </p>
        </div>

        {/* Success features */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-4 space-y-3">
          <h3 className="font-semibold text-gray-800 mb-3">What's next?</h3>
          <div className="space-y-2 text-sm text-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Browse our extensive course catalog</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Start your personalized learning journey</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>Connect with instructors and fellow learners</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4">
          <Button
            onClick={() => setCurrentStep('profile-completion')}
            className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
          >
            Continue Filling Profile Information 📝
          </Button>
        </div>
      </div>

      <style jsx>{`
        @keyframes draw-check {
          0% {
            stroke-dasharray: 0 20;
            stroke-dashoffset: 0;
          }
          100% {
            stroke-dasharray: 20 20;
            stroke-dashoffset: 0;
          }
        }
        
        .animate-draw-check {
          animation: draw-check 0.6s ease-in-out 0.3s both;
        }
      `}</style>
    </div>
  );
}
