"use client";
import React, { useState, useEffect } from 'react';

interface OTPVerificationProps {
  email: string;
  onVerified: () => void;
  onSendOTP: (email: string) => Promise<void>;
  onVerifyOTP: (email: string, otpCode: string) => Promise<void>;
  isVerified: boolean;
  disabled?: boolean;
}

const OTPVerification = ({ 
  email, 
  onVerified, 
  onSendOTP, 
  onVerifyOTP, 
  isVerified, 
  disabled = false 
}: OTPVerificationProps) => {
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [hasAutoSent, setHasAutoSent] = useState(false);

  // Auto-send OTP when component mounts
  useEffect(() => {
    if (email && !isVerified && !hasAutoSent && !disabled) {
      handleSendOTP();
      setHasAutoSent(true);
    }
  }, [email, isVerified, hasAutoSent, disabled]);

  const handleOtpInputChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newOtpCode = [...otpCode];
    newOtpCode[index] = value;
    setOtpCode(newOtpCode);
    
    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleSendOTP = async () => {
    if (!email || disabled) {
      console.log('Cannot send OTP:', { email, disabled });
      return;
    }
    
    console.log('Sending OTP to:', email);
    setIsSending(true);
    setError('');
    
    try {
      await onSendOTP(email);
      console.log('OTP sent successfully to:', email);
      setResendCooldown(120); // 2 minutes cooldown
      const interval = setInterval(() => {
        setResendCooldown(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error: unknown) {
      console.error('Error sending OTP:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to send OTP';
      setError(errorMessage);
    } finally {
      setIsSending(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otpCode.some(digit => !digit)) return;
    
    setIsVerifying(true);
    setError('');
    
    try {
      await onVerifyOTP(email, otpCode.join(''));
      onVerified();
      setOtpCode(['', '', '', '', '', '']);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Invalid OTP';
      setError(errorMessage);
      // Clear OTP fields on error
      setOtpCode(['', '', '', '', '', '']);
      // Focus first input
      setTimeout(() => {
        const firstInput = document.getElementById('otp-0');
        firstInput?.focus();
      }, 100);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0 || isSending) return;
    
    setOtpCode(['', '', '', '', '', '']); // Clear OTP fields
    setError(''); // Clear any previous errors
    
    try {
      await handleSendOTP();
    } catch (error) {
      console.error('Error resending OTP:', error);
      // Error will be handled by handleSendOTP
    }
  };

  if (isVerified) {
    return (
      <div className="flex items-center gap-2 text-green-600 text-sm">
        <span>✅</span>
        <span>Email verified</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Show sending status or email info */}
      {isSending ? (
        <div className="flex items-center gap-2 text-blue-600 text-sm">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span>Sending verification code...</span>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Enter 6-digit code sent to <strong>{email}</strong>
          </p>
          
          {resendCooldown > 0 ? (
            <span className="text-xs text-gray-500">
              Resend in {Math.floor(resendCooldown / 60)}:{(resendCooldown % 60).toString().padStart(2, '0')}
            </span>
          ) : (
            hasAutoSent && (
              <button
                type="button"
                onClick={handleResendOTP}
                className="text-xs text-blue-600 hover:text-blue-800 underline"
              >
                Resend OTP
              </button>
            )
          )}
        </div>
      )}

      {/* OTP Input Fields */}
      <div className="space-y-2">
        <div className="flex justify-center space-x-2">
          {otpCode.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpInputChange(index, e.target.value)}
              onKeyDown={(e) => handleOtpKeyDown(index, e)}
              className="w-10 h-10 text-center text-lg font-bold border border-gray-300 rounded focus:ring-1 focus:outline-none focus:ring-blue-500"
              disabled={disabled || isSending}
            />
          ))}
        </div>
        
        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}
        
        <button
          type="button"
          onClick={handleVerifyOTP}
          disabled={isVerifying || otpCode.some(digit => !digit) || disabled}
          className="w-full px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isVerifying ? (
            <span className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Verifying...
            </span>
          ) : (
            'Verify Code'
          )}
        </button>
      </div>
    </div>
  );
};

export default OTPVerification;