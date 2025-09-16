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
import PendingApprovalScreen from './PendingApprovalScreen';
import Logo from '@/components/shared/Logo';

interface RegistrationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSwitchToLogin?: () => void;
}



export default function RegistrationModal({ open, onOpenChange, onSwitchToLogin }: RegistrationModalProps) {
  const [currentStep, setCurrentStep] = useState<'registration' | 'otp-verification' | 'success' | 'pending-approval'>('registration');
  const [registrationEmail, setRegistrationEmail] = useState('');
  const [hasOrganization, setHasOrganization] = useState(false);
  const [organizationName, setOrganizationName] = useState<string | undefined>();

  const handleRegistrationSuccess = (email: string, hasOrg: boolean, orgName?: string) => {
    setRegistrationEmail(email);
    setHasOrganization(hasOrg);
    setOrganizationName(orgName);
    setCurrentStep('otp-verification');
  };

  const handleOTPVerificationSuccess = () => {
    // If user selected an organization, show pending approval screen
    // Otherwise show regular success screen
    if (hasOrganization) {
      setCurrentStep('pending-approval');
    } else {
      setCurrentStep('success');
    }
  };


  const handleSuccessComplete = () => {
    onOpenChange(false);
    // Reset state when modal closes
    setTimeout(() => {
      setCurrentStep('registration');
      setRegistrationEmail('');
      setHasOrganization(false);
      setOrganizationName(undefined);
    }, 300);
  };

  const handleBackToRegistration = () => {
    setCurrentStep('registration');
  };



  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl w-[95vw] max-h-[95vh] overflow-y-auto bg-white/95 backdrop-blur-md border-0 shadow-2xl p-0">
        <div className="p-4 sm:p-8">
          <DialogHeader className="text-center space-y-3 mb-6">
          {/* Logo - Same as navbar (hidden on success screen) */}
          {currentStep !== 'success' && currentStep !== 'pending-approval' && (
            <div className="flex justify-center items-center">
              <Logo size="md" showText={true} href="" />
            </div>
          )}
          
          {(currentStep === 'registration' || currentStep === 'otp-verification') && (
            <>
                        <DialogTitle className="text-2xl font-bold text-gray-900">
                          {currentStep === 'registration' && 'Create Your Learner Account'}
                          {currentStep === 'otp-verification' && 'Email Verification'}
                        </DialogTitle>
                        <DialogDescription className="text-gray-600">
                          {currentStep === 'registration' && 'Join thousands of learners and start your personalized learning journey'}
                          {currentStep === 'otp-verification' && 'We need to verify your email address to complete registration'}
                        </DialogDescription>
            </>
          )}
          </DialogHeader>

          <div>
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
                     ) : currentStep === 'pending-approval' ? (
                       <PendingApprovalScreen
                         userEmail={registrationEmail}
                         organizationName={organizationName}
                         onComplete={handleSuccessComplete}
                       />
                     ) : (
            <RegistrationSuccess
              userRole="learner"
              userEmail={registrationEmail}
              onComplete={handleSuccessComplete}
            />
          )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
