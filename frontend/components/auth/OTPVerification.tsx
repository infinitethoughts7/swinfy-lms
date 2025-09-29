'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

interface OTPVerificationProps {
  email: string;
  onVerificationSuccess: (user?: unknown, tokens?: unknown, data?: unknown) => void;
  onBack: () => void;
  purpose?: 'email_verification' | 'password_reset' | 'login_verification';
  title?: string;
  description?: string;
  autoSendOTP?: boolean; // Whether to send OTP automatically on mount
  showBackButton?: boolean;
}

const OTP_CONFIG = {
  EXPIRY_TIME_MINUTES: 10,
  CODE_LENGTH: 6,
  RESEND_COOLDOWN_SECONDS: 120, // Increased to 2 minutes
};

export default function OTPVerification({ 
  email, 
  onVerificationSuccess, 
  onBack,
  purpose = 'email_verification',
  title,
  description,
  autoSendOTP = false,
  showBackButton = true
}: OTPVerificationProps) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [otpSent, setOtpSent] = useState(!autoSendOTP); // If autoSend is false, assume OTP already sent
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Debug logging function
  const addDebugLog = useCallback((message: string, data?: unknown) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage, data);
    setDebugLogs(prev => [...prev.slice(-9), logMessage]); // Keep last 10 logs
  }, []);

  // Function to send OTP initially
  const handleSendOTP = useCallback(async () => {
    setIsSending(true);
    setError('');
    setSuccess('');
    setOtp(['', '', '', '', '', '']);
    
    addDebugLog(`🚀 Sending OTP for ${purpose}`, { email, purpose });
    
    try {
      let response;
      
      // Different API endpoints based on purpose
      if (purpose === 'password_reset') {
        response = await api.post('/api/auth/forgot-password/', { email });
      } else if (purpose === 'email_verification') {
        response = await api.post('/api/auth/resend-otp/', {
          email: email,
          purpose: 'email_verification'
        });
      } else {
        // Default to resend-otp endpoint
        response = await api.post('/api/auth/resend-otp/', {
          email: email,
          purpose: purpose
        });
      }

      let data;
      try {
        data = await response.json();
        addDebugLog('📤 Send OTP Response', {
          status: response.status,
          data: data
        });
      } catch (parseError) {
        addDebugLog('❌ Failed to parse send OTP response', parseError);
        setError('Invalid response from server. Please try again.');
        return;
      }

      if (response.ok && data && data.success) {
        addDebugLog('✅ OTP sent successfully');
        setSuccess('Verification code sent to your email!');
        setTimeLeft(OTP_CONFIG.RESEND_COOLDOWN_SECONDS);
        setOtpSent(true);
        inputRefs.current[0]?.focus();
      } else {
        addDebugLog('❌ OTP send failed', data);
        setError(data?.message || 'Failed to send verification code.');
      }
    } catch (error: unknown) {
      console.error('❌ Failed to send OTP:', error);
      addDebugLog('❌ Send OTP Error', error);
      
      const errorMessage = error instanceof Error && 'response' in error && typeof error.response === 'object' && error.response && 'data' in error.response && typeof error.response.data === 'object' && error.response.data && 'message' in error.response.data 
        ? (error.response.data as { message?: string }).message 
        : 'Failed to send OTP. Please try again.';
      setError(errorMessage || 'Failed to send OTP. Please try again.');
    } finally {
      setIsSending(false);
    }
  }, [email, purpose, addDebugLog]);

  // Send OTP automatically if autoSendOTP is true
  useEffect(() => {
    if (autoSendOTP && !otpSent) {
      handleSendOTP();
    }
  }, [autoSendOTP, otpSent, handleSendOTP]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);


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

    // Debug logging
    console.log('🔍 OTP Verification Debug:', {
      email: email,
      enteredOtp: enteredOtp,
      timestamp: new Date().toISOString()
    });

    try {
      let response;
      
      // Different API endpoints based on purpose
      if (purpose === 'password_reset') {
        response = await api.post('/api/auth/verify-reset-otp/', {
          email: email,
          otp_code: enteredOtp
        });
      } else {
        response = await api.post('/api/auth/verify-otp/', {
          email: email,
          otp_code: enteredOtp,
          purpose: purpose
        });
      }

      // Debug logging
      addDebugLog('🔍 API Response Debug', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      // Check if response exists
      if (!response) {
        addDebugLog('❌ No response received from API');
        setError('No response received from server. Please try again.');
        return;
      }

      // Parse JSON response
      let data;
      try {
        data = await response.json();
        addDebugLog('📄 Parsed response data', data);
      } catch (parseError) {
        addDebugLog('❌ Failed to parse JSON response', parseError);
        setError('Invalid response from server. Please try again.');
        return;
      }

      if (response.ok && data.success) {
        addDebugLog('✅ OTP verification successful', data);
        
        // Different success messages based on purpose
        if (purpose === 'password_reset') {
          setSuccess('OTP verified! You can now reset your password.');
        } else if (purpose === 'email_verification') {
          setSuccess('Email verified successfully!');
        } else {
          setSuccess('Verification successful!');
        }
        
        // Call the success callback with appropriate data
        onVerificationSuccess(data.user, data.tokens, data);
      } else {
        addDebugLog('❌ OTP verification failed', data);
        setError(data.message || 'Verification failed. Please try again.');
      }
    } catch (error: unknown) {
      console.error('❌ OTP verification error:', error);
      
      const errorMessage = error instanceof Error && 'response' in error && typeof error.response === 'object' && error.response && 'data' in error.response && typeof error.response.data === 'object' && error.response.data && 'message' in error.response.data 
        ? (error.response.data as { message?: string }).message 
        : 'Verification failed. Please try again.';
      setError(errorMessage || 'Verification failed. Please try again.');
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
    
    addDebugLog(`🔄 Resending OTP for ${purpose}`, { email, purpose });
    
    try {
      let response;
      
      // Different API endpoints based on purpose
      if (purpose === 'password_reset') {
        response = await api.post('/api/auth/forgot-password/', { email });
      } else {
        response = await api.post('/api/auth/resend-otp/', {
          email: email,
          purpose: purpose
        });
      }

      // Parse JSON response
      let data;
      try {
        data = await response.json();
        addDebugLog('🔄 Resend OTP Response', {
          status: response.status,
          data: data
        });
      } catch (parseError) {
        addDebugLog('❌ Failed to parse resend OTP response', parseError);
        setError('Invalid response from server. Please try again.');
        return;
      }

      if (response.ok && data && data.success) {
        addDebugLog('✅ OTP resent successfully');
        setSuccess('New verification code sent to your email!');
        setTimeLeft(OTP_CONFIG.RESEND_COOLDOWN_SECONDS);
        inputRefs.current[0]?.focus();
      } else {
        addDebugLog('❌ OTP resend failed', data);
        setError(data?.message || 'Failed to resend verification code.');
      }
    } catch (error: unknown) {
      console.error('❌ Failed to resend OTP:', error);
      addDebugLog('❌ Resend OTP Error', error);
      
      const errorMessage = error instanceof Error && 'response' in error && typeof error.response === 'object' && error.response && 'data' in error.response && typeof error.response.data === 'object' && error.response.data && 'message' in error.response.data 
        ? (error.response.data as { message?: string }).message 
        : 'Failed to resend OTP. Please try again.';
      setError(errorMessage || 'Failed to resend OTP. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Dynamic content based on purpose
  const getHeaderContent = () => {
    if (title && description) {
      return { title, description };
    }
    
    switch (purpose) {
      case 'password_reset':
        return {
          title: 'Reset Password',
          description: "We've sent a 6-digit verification code to"
        };
      case 'email_verification':
        return {
          title: 'Verify Your Email',
          description: "We've sent a 6-digit verification code to"
        };
      default:
        return {
          title: 'Enter Verification Code',
          description: "We've sent a 6-digit verification code to"
        };
    }
  };

  const headerContent = getHeaderContent();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">{headerContent.title}</h2>
        {!otpSent ? (
          <p className="text-gray-600">
            Enter your email address to receive a verification code
          </p>
        ) : (
          <>
            <p className="text-gray-600">
              {headerContent.description}
            </p>
            <p className="font-medium text-blue-600">{email}</p>
          </>
        )}
      </div>

      {/* Send OTP Button - Show when OTP not sent yet */}
      {!otpSent && (
        <div className="space-y-4">
          <Button
            onClick={handleSendOTP}
            disabled={isSending}
            className="w-full"
          >
            {isSending ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Sending Code...</span>
              </div>
            ) : (
              'Send Verification Code'
            )}
          </Button>
          
          {/* Error and Success messages for sending OTP */}
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
      )}

      {/* OTP Input - Show when OTP has been sent */}
      {otpSent && (
        <div className="space-y-4">
          <div className="flex justify-center space-x-3">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
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
      )}

      {/* Timer and Resend - Only show when OTP has been sent */}
      {otpSent && (
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
            className={`text-sm font-medium transition-colors underline ${
              timeLeft > 0 
                ? 'text-gray-400 cursor-not-allowed' 
                : 'text-blue-600 hover:text-blue-700 cursor-pointer'
            }`}
          >
            {isResending ? 'Resending...' : "Didn't receive the code? Resend"}
          </button>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3">
        {/* Verify Button - Only show when OTP has been sent */}
        {otpSent && (
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
              purpose === 'password_reset' ? 'Verify & Continue' : 'Verify Email'
            )}
          </Button>
        )}

        {/* Back Button - Show conditionally */}
        {showBackButton && (
          <Button
            variant="outline"
            onClick={onBack}
            className="w-full"
          >
            ← Back
          </Button>
        )}
      </div>

      {/* Help Text */}
      <div className="text-center">
        <p className="text-xs text-gray-500">
          Check your spam folder if you don&apos;t see the email in your inbox
        </p>
      </div>

      {/* Debug Panel - Only show in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-6 p-4 bg-gray-100 rounded-lg border">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">🐛 Debug Logs</h4>
          <div className="text-xs text-gray-600 space-y-1 max-h-32 overflow-y-auto">
            {debugLogs.length === 0 ? (
              <p className="text-gray-400">No debug logs yet...</p>
            ) : (
              debugLogs.map((log, index) => (
                <div key={index} className="font-mono">
                  {log}
                </div>
              ))
            )}
          </div>
          <button
            onClick={() => setDebugLogs([])}
            className="mt-2 text-xs text-blue-600 hover:text-blue-800"
          >
            Clear Logs
          </button>
        </div>
      )}
    </div>
  );
}
