"use client";
import React, { useState } from 'react';


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
    if (!email || disabled) return;
    
    setIsSending(true);
    setError('');
    
    try {
      await onSendOTP(email);
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
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;
    await handleSendOTP();
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
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleSendOTP}
          disabled={!email || isSending || disabled}
          className="px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSending ? 'Sending...' : 'Send OTP'}
        </button>
        
        {resendCooldown > 0 && (
          <button
            type="button"
            onClick={handleResendOTP}
            disabled={resendCooldown > 0}
            className="px-3 py-2 text-blue-600 text-sm hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Resend in {Math.floor(resendCooldown / 60)}:{(resendCooldown % 60).toString().padStart(2, '0')}
          </button>
        )}
        
        {resendCooldown === 0 && email && (
          <button
            type="button"
            onClick={handleResendOTP}
            className="px-3 py-2 text-blue-600 text-sm hover:text-blue-800"
          >
            Resend OTP
          </button>
        )}
      </div>

      {email && (
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            Enter 6-digit code sent to <strong>{email}</strong>
          </p>
          
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
                className="w-8 h-8 text-center text-sm font-bold border border-gray-300 rounded focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-200"
              />
            ))}
          </div>
          
          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}
          
          <button
            type="button"
            onClick={handleVerifyOTP}
            disabled={isVerifying || otpCode.some(digit => !digit)}
            className="w-full px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isVerifying ? 'Verifying...' : 'Verify Code'}
          </button>
        </div>
      )}
    </div>
  );
};

export default OTPVerification;
