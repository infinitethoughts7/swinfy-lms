'use client';

import React, { useState, useEffect } from 'react';
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
import LearnerSuccessScreen from './LearnerSuccessScreen';
import Logo from '@/components/shared/Logo';

interface RegistrationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSwitchToLogin?: () => void;
  onRegistrationComplete?: () => void;
}



export default function RegistrationModal({ open, onOpenChange, onSwitchToLogin, onRegistrationComplete }: RegistrationModalProps) {
  const [currentStep, setCurrentStep] = useState<'registration' | 'otp-verification' | 'success' | 'pending-approval'>('registration');
  const [registrationEmail, setRegistrationEmail] = useState('');
  const [hasOrganization, setHasOrganization] = useState(false);
  const [organizationName, setOrganizationName] = useState<string | undefined>();

  // Reset function to clear all modal data and return to initial step
  const resetModal = () => {
    setCurrentStep('registration'); // This ensures we start from the registration form, not OTP or success steps
    setRegistrationEmail('');
    setHasOrganization(false);
    setOrganizationName(undefined);
  };

  // Reset modal when it closes
  useEffect(() => {
    if (!open) {
      resetModal();
    }
  }, [open]);

  const handleRegistrationSuccess = (email: string, hasOrg: boolean, orgName?: string) => {
    setRegistrationEmail(email);
    setHasOrganization(hasOrg);
    setOrganizationName(orgName);
    setCurrentStep('otp-verification');
  };

  const handleOTPVerificationSuccess = (user: any, tokens: any) => {
    // Store user data and tokens for later use
    console.log('OTP verification successful:', { user, tokens });
    
    // If user selected an organization, show pending approval screen
    // Otherwise show regular success screen (which will lead to profile completion and then learner success)
    if (hasOrganization) {
      setCurrentStep('pending-approval');
    } else {
      setCurrentStep('success');
    }
  };

  // OTP API methods for registration
  const sendOTPForRegistration = async (email: string): Promise<void> => {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    
    console.log('Attempting to resend OTP to:', email);
    console.log('API URL:', `${API_BASE_URL}/api/auth/resend-otp/`);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/resend-otp/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: email,
          purpose: 'email_verification'
        }),
      });

      console.log('Response status:', response.status);

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error('Failed to parse JSON response:', jsonError);
        throw new Error('Server returned invalid response. Please check if backend is running.');
      }
      
      if (!response.ok) {
        const errorMessage = data.message || data.detail || data.error || 'Failed to send OTP';
        console.error('Server error:', errorMessage, data);
        throw new Error(errorMessage);
      }
      
      // Success - OTP sent
      console.log('OTP resent successfully to:', email);
    } catch (error) {
      console.error('Error sending OTP:', error);
      
      // Check for network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error: Cannot connect to server. Please ensure backend is running on ' + API_BASE_URL);
      }
      
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error('Failed to send OTP. Please try again.');
      }
    }
  };

  const verifyOTPForRegistration = async (email: string, otpCode: string): Promise<void> => {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/verify-otp/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: email,
          otp_code: otpCode,
          purpose: 'email_verification'
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || data.detail || 'OTP verification failed');
      }
      
      // Call the success handler with user data
      handleOTPVerificationSuccess(data.user, data.tokens);
    } catch (error) {
      console.error('Error verifying OTP:', error);
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error('OTP verification failed. Please try again.');
      }
    }
  };

  const handleEmailVerified = () => {
    // This will be called by the OTPVerification component
    // The actual verification logic is in verifyOTPForRegistration
  };


  const handleSuccessComplete = () => {
    onOpenChange(false);
    // Reset state when modal closes
    setTimeout(() => {
      resetModal();
      // Automatically open login modal after registration is complete
      if (onRegistrationComplete) {
        onRegistrationComplete();
      }
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
          
          <DialogTitle className="text-2xl font-bold text-gray-900">
            {currentStep === 'registration' && 'Create Your Learner Account'}
            {currentStep === 'otp-verification' && 'Email Verification'}
            {currentStep === 'success' && 'Registration Successful'}
            {currentStep === 'pending-approval' && 'Registration Pending'}
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            {currentStep === 'registration' && 'Join thousands of learners and start your personalized learning journey'}
            {currentStep === 'otp-verification' && 'We need to verify your email address to complete registration'}
            {currentStep === 'success' && 'Welcome to Swinfy LMS! Your account has been created successfully.'}
            {currentStep === 'pending-approval' && 'Your registration is being reviewed by our team.'}
          </DialogDescription>
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
                         onVerified={handleEmailVerified}
                         onSendOTP={sendOTPForRegistration}
                         onVerifyOTP={verifyOTPForRegistration}
                         isVerified={false}
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
