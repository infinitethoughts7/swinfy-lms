'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import RegistrationForm from './RegistrationForm';
import OTPVerification from './OTPVerification';
import RegistrationSuccess from './RegistrationSuccess';
import Logo from '@/components/shared/Logo';

interface RegistrationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSwitchToLogin?: () => void;
}

export default function RegistrationModal({ open, onOpenChange, onSwitchToLogin }: RegistrationModalProps) {
  const [currentStep, setCurrentStep] = useState<'registration' | 'otp-verification' | 'success'>('registration');
  const [registrationEmail, setRegistrationEmail] = useState('');
  const [userRole, setUserRole] = useState<'student' | 'tutor' | 'admin'>('student');

  const handleRegistrationSuccess = (email: string, role: 'student' | 'tutor' | 'admin') => {
    setRegistrationEmail(email);
    setUserRole(role);
    setCurrentStep('otp-verification');
  };

  const handleOTPVerificationSuccess = () => {
    setCurrentStep('success');
  };

  const handleSuccessComplete = () => {
    onOpenChange(false);
    // Reset state when modal closes
    setTimeout(() => {
      setCurrentStep('registration');
      setRegistrationEmail('');
    }, 300);
  };

  const handleBackToRegistration = () => {
    setCurrentStep('registration');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-md border-0 shadow-2xl">
        <DialogHeader className="text-center space-y-3">
          {/* Logo - Same as navbar (hidden on success screen) */}
          {currentStep !== 'success' && (
            <div className="flex justify-center items-center">
              <Logo size="md" showText={true} href="" />
            </div>
          )}
          
          {currentStep !== 'success' && (
            <>
              <DialogTitle className="text-2xl font-bold text-gray-900">
                {currentStep === 'registration' ? 'Create Your Account' : 'Email Verification'}
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                {currentStep === 'registration' 
                  ? 'Join thousands of learners and start your personalized learning journey'
                  : 'We need to verify your email address to complete registration'
                }
              </DialogDescription>
            </>
          )}
        </DialogHeader>

        <div className="mt-6">
          {currentStep === 'registration' ? (
            <>
              <RegistrationForm onSuccess={handleRegistrationSuccess} />
          
              {/* Login Link */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <button
                    onClick={onSwitchToLogin}
                    className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                  >
                    Sign in here
                  </button>
                </p>
              </div>

              {/* Terms */}
              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500">
                  By creating an account, you agree to our{' '}
                  <Link href="/terms" className="text-blue-500 hover:text-blue-400">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-blue-500 hover:text-blue-400">
                    Privacy Policy
                  </Link>
                </p>
              </div>
            </>
          ) : currentStep === 'otp-verification' ? (
            <OTPVerification
              email={registrationEmail}
              onVerificationSuccess={handleOTPVerificationSuccess}
              onBack={handleBackToRegistration}
            />
          ) : (
            <RegistrationSuccess
              userRole={userRole}
              userEmail={registrationEmail}
              onComplete={handleSuccessComplete}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
