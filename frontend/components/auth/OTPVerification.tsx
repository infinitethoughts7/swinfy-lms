'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

interface OTPVerificationProps {
  email: string;
  onVerificationSuccess: (user: any, tokens: any) => void;
  onBack: () => void;
}

const OTP_CONFIG = {
  EXPIRY_TIME_MINUTES: 10,
  CODE_LENGTH: 6,
  RESEND_COOLDOWN_SECONDS: 60,
};

export default function OTPVerification({ email, onVerificationSuccess, onBack }: OTPVerificationProps) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(OTP_CONFIG.RESEND_COOLDOWN_SECONDS);
  const [isResending, setIsResending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Generate and send OTP on component mount
  useEffect(() => {
    generateAndSendOTP();
  }, []);

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const sendOTPEmail = async () => {
    try {
      setError('');
      setSuccess('');
      
      const response = await api.post('/api/auth/send-otp/', {
        email: email,
        purpose: 'email_verification'
      });

      if (response.data.success) {
        setSuccess('Verification code sent to your email!');
        setTimeLeft(OTP_CONFIG.RESEND_COOLDOWN_SECONDS);
      } else {
        setError(response.data.message || 'Failed to send verification code.');
      }
    } catch (error: any) {
      console.error('Failed to send OTP email:', error);
      const errorMessage = error.response?.data?.message || 'Failed to send verification code. Please try again.';
      setError(errorMessage);
    }
  };

  const generateAndSendOTP = async () => {
    await sendOTPEmail();
  };

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digit
    if (!/^\d*$/.test(value)) return; // Only allow numbers

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    for (let i = 0; i < Math.min(pastedData.length, 6); i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);
    setError('');
  };

  const handleVerifyOTP = async () => {
    const enteredOtp = otp.join('');
    
    if (enteredOtp.length !== 6) {
      setError('Please enter the complete 6-digit OTP');
      return;
    }

    setIsVerifying(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.post('/api/auth/verify-otp/', {
        email: email,
        otp_code: enteredOtp,
        purpose: 'email_verification'
      });

      if (response.data.success) {
        setSuccess('Email verified successfully!');
        // Call the success callback with user data and tokens
        onVerificationSuccess(response.data.user, response.data.tokens);
      } else {
        setError(response.data.message || 'Verification failed. Please try again.');
      }
    } catch (error: any) {
      console.error('OTP verification error:', error);
      const errorMessage = error.response?.data?.message || 'Verification failed. Please try again.';
      setError(errorMessage);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOTP = async () => {
    if (timeLeft > 0) return;
    
    setIsResending(true);
    setError('');
    setSuccess('');
    setOtp(['', '', '', '', '', '']);
    
    try {
      const response = await api.post('/api/auth/resend-otp/', {
        email: email,
        purpose: 'email_verification'
      });

      if (response.data.success) {
        setSuccess('New verification code sent to your email!');
        setTimeLeft(OTP_CONFIG.RESEND_COOLDOWN_SECONDS);
        inputRefs.current[0]?.focus();
      } else {
        setError(response.data.message || 'Failed to resend verification code.');
      }
    } catch (error: any) {
      console.error('Failed to resend OTP:', error);
      const errorMessage = error.response?.data?.message || 'Failed to resend OTP. Please try again.';
      setError(errorMessage);
    } finally {
      setIsResending(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Verify Your Email</h2>
        <p className="text-gray-600">
          We've sent a 6-digit verification code to
        </p>
        <p className="font-medium text-blue-600">{email}</p>
      </div>

      {/* OTP Input */}
      <div className="space-y-4">
        <div className="flex justify-center space-x-3">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleInputChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={index === 0 ? handlePaste : undefined}
              className={`w-12 h-12 text-center text-xl font-bold border-2 rounded-lg focus:outline-none focus:border-gray-900 focus:bg-gray-50 transition-all duration-200 ${
                error ? 'border-red-500 focus:border-red-500' : digit ? 'border-green-500 focus:border-green-600' : 'border-gray-300'
              }`}
              placeholder="0"
            />
          ))}
        </div>

        {error && (
          <p className="text-center text-sm text-red-600 bg-red-50 p-2 rounded-lg">
            {error}
          </p>
        )}

        {success && (
          <p className="text-center text-sm text-green-600 bg-green-50 p-2 rounded-lg">
            {success}
          </p>
        )}
      </div>

      {/* Timer and Resend */}
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center space-x-2">
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className={`text-sm font-medium ${timeLeft > 0 ? 'text-gray-600' : 'text-red-600'}`}>
            {timeLeft > 0 ? `Expires in ${formatTime(timeLeft)}` : 'Code expired'}
          </span>
        </div>

        <button
          onClick={handleResendOTP}
          disabled={timeLeft > 0 || isResending}
          className={`text-sm font-medium transition-colors ${
            timeLeft > 0 
              ? 'text-gray-400 cursor-not-allowed' 
              : 'text-blue-600 hover:text-blue-700 cursor-pointer'
          }`}
        >
          {isResending ? 'Resending...' : "Didn't receive the code? Resend"}
        </button>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <Button
          onClick={handleVerifyOTP}
          disabled={otp.some(digit => !digit) || isVerifying}
          className="w-full"
        >
          {isVerifying ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Verifying...</span>
            </div>
          ) : (
            'Verify Email'
          )}
        </Button>

        <Button
          variant="outline"
          onClick={onBack}
          className="w-full"
        >
          ← Back to Registration
        </Button>
      </div>

      {/* Help Text */}
      <div className="text-center">
        <p className="text-xs text-gray-500">
          Check your spam folder if you don't see the email in your inbox
        </p>
      </div>
    </div>
  );
}
