'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Logo from '@/components/shared/Logo';

interface PendingApprovalScreenProps {
  userEmail: string;
  organizationName?: string;
  onComplete: () => void;
}

export default function PendingApprovalScreen({ 
  userEmail, 
  organizationName, 
  onComplete 
}: PendingApprovalScreenProps) {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Show content with animation
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-6 text-center">
      {/* Logo */}
      <div className="flex justify-center items-center">
        <Logo size="md" showText={true} href="" />
      </div>

      {/* Pending Icon */}
      <div className="flex justify-center">
        <div className={`relative w-24 h-24 transition-all duration-500 ${
          showContent ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
        }`}>
          {/* Circle background */}
          <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center">
            {/* Clock Icon */}
            <svg 
              className="w-12 h-12 text-orange-500"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="10" strokeWidth="2"/>
              <polyline points="12,6 12,12 16,14" strokeWidth="2"/>
            </svg>
          </div>
          
          {/* Pulse effect */}
          <div className="absolute inset-0 w-24 h-24 bg-orange-500 rounded-full animate-pulse opacity-10"></div>
        </div>
      </div>

      {/* Content */}
      <div className={`space-y-4 transition-all duration-700 ${
        showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}>
        <h2 className="text-2xl font-bold text-gray-900">
          Account Created Successfully!
        </h2>
        
        <div className="space-y-3">
          <p className="text-gray-600">
            Welcome to the platform! Your account has been created and you can start learning immediately.
          </p>
          
          {organizationName && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <h3 className="font-semibold text-orange-800">Organization Request Pending</h3>
              </div>
              <p className="text-sm text-orange-700">
                Your request to join <strong>{organizationName}</strong> has been sent to the organization admin for approval. 
                You&apos;ll be notified once your request is reviewed.
              </p>
            </div>
          )}
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <h3 className="font-semibold text-green-800">Platform Access</h3>
            </div>
            <p className="text-sm text-green-700">
              You have full access to browse courses, track your progress, and start learning right away!
            </p>
          </div>
        </div>

        <div className="space-y-2 text-sm text-gray-500">
          <p>Account created for: <strong>{userEmail}</strong></p>
          {organizationName && (
            <p>Organization request: <strong>{organizationName}</strong></p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className={`space-y-3 transition-all duration-700 delay-300 ${
        showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}>
        <Button
          onClick={onComplete}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all duration-200 font-medium"
        >
          Continue to Login
        </Button>
        
        <p className="text-xs text-gray-500">
          Please login to access your dashboard and start learning
        </p>
      </div>
    </div>
  );
}
