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
import OrganizationDetailsStep from './OrganizationDetailsStep';
import AdminDetailsStep from './AdminDetailsStep';
import Logo from '@/components/shared/Logo';

interface RegistrationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSwitchToLogin?: () => void;
}

interface OrganizationDetails {
  name: string;
  type: 'company' | 'organization' | 'university' | 'institute' | 'bootcamp';
  location: string;
  website: string;
  description: string;
  address: string;
  contact_email: string;
  contact_phone: string;
  logo?: File | null;
  linkedin_url?: string;
}

interface AdminDetails {
  bio: string;
  profile_picture?: File | null;
  phone_number: string;
  job_title: string;
  department: string;
  office_location: string;
  office_phone: string;
  emergency_contact: string;
  linkedin_url: string;
  professional_email: string;
}

export default function RegistrationModal({ open, onOpenChange, onSwitchToLogin }: RegistrationModalProps) {
  const [currentStep, setCurrentStep] = useState<'registration' | 'otp-verification' | 'organization-details' | 'admin-details' | 'success'>('registration');
  const [registrationEmail, setRegistrationEmail] = useState('');
  const [userRole, setUserRole] = useState<'learner' | 'knowledge_partner_instructor' | 'knowledge_partner_admin'>('learner');
  const [organizationDetails, setOrganizationDetails] = useState<OrganizationDetails>({
    name: '',
    type: 'university',
    location: '',
    website: '',
    description: '',
    address: '',
    contact_email: '',
    contact_phone: '',
    logo: null,
    linkedin_url: ''
  });
  const [adminDetails, setAdminDetails] = useState<AdminDetails>({
    bio: '',
    profile_picture: null,
    phone_number: '',
    job_title: '',
    department: '',
    office_location: '',
    office_phone: '',
    emergency_contact: '',
    linkedin_url: '',
    professional_email: ''
  });

  const handleRegistrationSuccess = (email: string, role: 'learner' | 'knowledge_partner_instructor' | 'knowledge_partner_admin') => {
    setRegistrationEmail(email);
    setUserRole(role);
    setCurrentStep('otp-verification');
  };

  const handleOTPVerificationSuccess = () => {
    // Determine next step based on user role
    if (userRole === 'knowledge_partner_admin') {
      setCurrentStep('organization-details');
    } else {
      setCurrentStep('success');
    }
  };

  const handleOrganizationDetailsNext = () => {
    if (userRole === 'knowledge_partner_admin') {
      setCurrentStep('admin-details');
    } else {
      setCurrentStep('success');
    }
  };

  const handleAdminDetailsNext = () => {
    setCurrentStep('success');
  };

  const handleSuccessComplete = () => {
    onOpenChange(false);
    // Reset state when modal closes
    setTimeout(() => {
      setCurrentStep('registration');
      setRegistrationEmail('');
      setUserRole('learner');
      setOrganizationDetails({
        name: '',
        type: 'university',
        location: '',
        website: '',
        description: '',
        address: '',
        contact_email: '',
        contact_phone: '',
        logo: null,
        linkedin_url: ''
      });
      setAdminDetails({
        bio: '',
        profile_picture: null,
        phone_number: '',
        job_title: '',
        department: '',
        office_location: '',
        office_phone: '',
        emergency_contact: '',
        linkedin_url: '',
        professional_email: ''
      });
    }, 300);
  };

  const handleBackToRegistration = () => {
    setCurrentStep('registration');
  };

  const handleBackToOTP = () => {
    setCurrentStep('otp-verification');
  };

  const handleBackToOrganizationDetails = () => {
    setCurrentStep('organization-details');
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
                {currentStep === 'registration' && 'Create Your Account'}
                {currentStep === 'otp-verification' && 'Email Verification'}
                {currentStep === 'organization-details' && 'Organization Details'}
                {currentStep === 'admin-details' && 'Admin Profile'}
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                {currentStep === 'registration' && 'Join thousands of learners and start your personalized learning journey'}
                {currentStep === 'otp-verification' && 'We need to verify your email address to complete registration'}
                {currentStep === 'organization-details' && 'Please provide details about your organization'}
                {currentStep === 'admin-details' && 'Complete your admin profile information'}
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
          ) : currentStep === 'organization-details' ? (
            <OrganizationDetailsStep
              organizationDetails={organizationDetails}
              onChange={setOrganizationDetails}
              onNext={handleOrganizationDetailsNext}
              onBack={handleBackToOTP}
            />
          ) : currentStep === 'admin-details' ? (
            <AdminDetailsStep
              adminDetails={adminDetails}
              onChange={setAdminDetails}
              onNext={handleAdminDetailsNext}
              onBack={handleBackToOrganizationDetails}
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
