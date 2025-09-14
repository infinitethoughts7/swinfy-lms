'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AuthAPI, VerifyEmailRequest } from '@/lib/api/auth';

interface EmailVerificationFormProps {
  email: string;
  onVerificationSuccess: (tokens: { access: string; refresh: string }) => void;
  onResendCode: () => void;
  onBack: () => void;
}

export default function EmailVerificationForm({
  email,
  onVerificationSuccess,
  onResendCode,
  onBack
}: EmailVerificationFormProps) {
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!verificationCode.trim()) {
      setError('Please enter the verification code');
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      const data: VerifyEmailRequest = {
        email,
        verification_code: verificationCode.trim()
      };

      const response = await AuthAPI.verifyEmail(data);
      
      setSuccess('Email verified successfully!');
      
      // Call success callback with tokens
      if (response.tokens) {
        onVerificationSuccess(response.tokens);
      }
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);
    setError(null);
    setSuccess(null);

    try {
      // For now, we'll simulate resending
      // In a real implementation, you'd call an API endpoint
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess('Verification code sent to your email');
      onResendCode();
    } catch (error) {
      setError('Failed to resend verification code');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Email</h2>
        <p className="text-gray-600">
          We've sent a verification code to <strong>{email}</strong>
        </p>
      </div>

      <form onSubmit={handleVerify} className="space-y-6">
        <div>
          <label htmlFor="verification-code" className="block text-sm font-medium text-gray-700 mb-2">
            Verification Code
          </label>
          <input
            type="text"
            id="verification-code"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900 focus:bg-gray-50 transition-all duration-200 text-center text-lg tracking-widest"
            placeholder="Enter 6-digit code"
            maxLength={6}
            autoComplete="one-time-code"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm text-green-600">{success}</p>
          </div>
        )}

        <div className="space-y-3">
          <Button
            type="submit"
            disabled={isVerifying || !verificationCode.trim()}
            className="w-full"
          >
            {isVerifying ? 'Verifying...' : 'Verify Email'}
          </Button>

          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">
              Didn't receive the code?
            </p>
            <button
              type="button"
              onClick={handleResendCode}
              disabled={isResending}
              className="text-sm text-blue-600 hover:text-blue-500 font-medium disabled:opacity-50"
            >
              {isResending ? 'Sending...' : 'Resend Code'}
            </button>
          </div>

          <button
            type="button"
            onClick={onBack}
            className="w-full text-sm text-gray-600 hover:text-gray-500 font-medium"
          >
            ← Back to Registration
          </button>
        </div>
      </form>
    </div>
  );
}
