'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { authApi } from '@/lib/api';
import { saveUser, saveTokens } from '@/lib/auth';
import Logo from '@/components/shared/Logo';

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSwitchToRegister?: () => void;
  onLoginSuccess?: () => void;
}

export default function LoginModal({ open, onOpenChange, onSwitchToRegister, onLoginSuccess }: LoginModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  // Forgot password states
  const [forgotPasswordStep, setForgotPasswordStep] = useState<'email' | 'otp' | 'new-password' | null>(null);
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Call backend API for authentication
      const data = await authApi.login({
        email: email,
        password: password,
      });

      // Store tokens
      saveTokens({
        access: data.tokens.access,
        refresh: data.tokens.refresh
      });

      // Store user info
      saveUser({
        id: data.user.id,
        email: data.user.email,
        full_name: data.user.full_name,
        role: data.user.role,
      });

      // Close modal
      onOpenChange(false);

      // Dispatch login event to update navbar
      window.dispatchEvent(new CustomEvent('userLogin', { detail: data.user }));

      // Call success callback if provided
      if (onLoginSuccess) {
        onLoginSuccess();
      } else {
        // Default behavior: redirect based on role
        const roleToDashboard: Record<string, string> = {
          'learner': 'learner',
          'knowledge_partner_instructor': 'instructor',
          'knowledge_partner': 'kp',
          'tutor': 'tutor',
          'admin': 'admin',
          'super_admin': 'super-admin'
        };
        const dashboardPath = roleToDashboard[data.user.role] || data.user.role;
        router.push(`/dashboard/${dashboardPath}`);
      }
    } catch (error: unknown) {
      console.error('Login error:', error);
      setError(error instanceof Error ? error.message : 'Login failed. Please try again.');
    }

    setIsLoading(false);
  };

  // Forgot password functions
  const handleForgotPassword = () => {
    setForgotPasswordStep('email');
    setError('');
  };

  const handleSendOTP = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await authApi.forgotPassword({ email });
      setOtpSent(true);
      setForgotPasswordStep('otp');
      setTimeLeft(300); // 5 minutes
      setError('');
    } catch (error: any) {
      console.error('Forgot password error:', error);
      setError(error.message || 'Failed to send reset code. Please try again.');
    }

    setIsLoading(false);
  };

  const handleVerifyOTP = async () => {
    const otp = otpCode.join('');
    if (otp.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await authApi.verifyResetOTP({ email, otp_code: otp });
      setForgotPasswordStep('new-password');
      setError('');
    } catch (error: any) {
      console.error('OTP verification error:', error);
      setError(error.message || 'Invalid verification code. Please try again.');
    }

    setIsLoading(false);
  };

  const handleUpdatePassword = async () => {
    if (!newPassword || !confirmPassword) {
      setError('Please fill in all password fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await authApi.resetPassword({ 
        email, 
        otp_code: otpCode.join(''), 
        new_password: newPassword 
      });
      
      // Reset all states
      setForgotPasswordStep(null);
      setEmail('');
      setPassword('');
      setOtpCode(['', '', '', '', '', '']);
      setNewPassword('');
      setConfirmPassword('');
      setOtpSent(false);
      setTimeLeft(0);
      setError('');
      
      // Close modal
      onOpenChange(false);
      
    } catch (error: any) {
      console.error('Password update error:', error);
      setError(error.message || 'Failed to update password. Please try again.');
    }

    setIsLoading(false);
  };

  const handleBackToLogin = () => {
    setForgotPasswordStep(null);
    setEmail('');
    setPassword('');
    setOtpCode(['', '', '', '', '', '']);
    setNewPassword('');
    setConfirmPassword('');
    setOtpSent(false);
    setTimeLeft(0);
    setError('');
  };

  const handleOTPInputChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otpCode];
    newOtp[index] = value;
    setOtpCode(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOTPKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl w-[95vw] max-h-[95vh] overflow-y-auto bg-white/95 backdrop-blur-md border-0 shadow-2xl p-0">
        <div className="p-4 sm:p-8">
          <DialogHeader className="text-center space-y-3 mb-6">
            {/* Logo - Same as navbar */}
            <div className="flex justify-center items-center">
              <Logo size="md" showText={true} href="" />
            </div>
            
            <DialogTitle className="text-2xl font-bold text-gray-900">
              {!forgotPasswordStep && 'Welcome Back!'}
              {forgotPasswordStep === 'email' && 'Reset Your Password'}
              {forgotPasswordStep === 'otp' && 'Verify Your Email'}
              {forgotPasswordStep === 'new-password' && 'Create New Password'}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              {!forgotPasswordStep && 'Sign in to your account to continue learning'}
              {forgotPasswordStep === 'email' && 'Enter your email address to receive a reset code'}
              {forgotPasswordStep === 'otp' && 'Enter the 6-digit code sent to your email'}
              {forgotPasswordStep === 'new-password' && 'Enter your new password to complete the reset'}
            </DialogDescription>
          </DialogHeader>

          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-8 max-w-lg mx-auto">
            {/* Step 1: Email Input for Forgot Password */}
            {forgotPasswordStep === 'email' && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    id="reset-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:outline-none focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                    placeholder="Enter your email address"
                    required
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={handleBackToLogin}
                    className="flex-1 py-2.5 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Back to Login
                  </button>
                  <button
                    type="button"
                    onClick={handleSendOTP}
                    disabled={isLoading}
                    className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? 'Sending...' : 'Send Reset Code'}
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: OTP Verification */}
            {forgotPasswordStep === 'otp' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enter 6-digit code
                  </label>
                  <div className="flex space-x-2 justify-center">
                    {otpCode.map((digit, index) => (
                      <input
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOTPInputChange(index, e.target.value)}
                        onKeyDown={(e) => handleOTPKeyDown(index, e)}
                        className="w-12 h-12 text-center text-lg font-semibold border border-gray-300 rounded-lg focus:ring-2 focus:outline-none focus:ring-blue-500 focus:border-transparent"
                      />
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 mt-2 text-center">
                    Code sent to {email}
                  </p>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={handleBackToLogin}
                    className="flex-1 py-2.5 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Back to Login
                  </button>
                  <button
                    type="button"
                    onClick={handleVerifyOTP}
                    disabled={isLoading || otpCode.join('').length !== 6}
                    className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? 'Verifying...' : 'Verify Code'}
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: New Password */}
            {forgotPasswordStep === 'new-password' && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                    placeholder="Enter new password"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                    placeholder="Confirm new password"
                    required
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={handleBackToLogin}
                    className="flex-1 py-2.5 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Back to Login
                  </button>
                  <button
                    type="button"
                    onClick={handleUpdatePassword}
                    disabled={isLoading}
                    className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </div>
            )}

            {/* Login Form - Only show when not in forgot password flow */}
            {!forgotPasswordStep && (
              <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                placeholder="Enter your email"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Remember me and Forgot password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="rounded text-blue-600" />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <button 
                type="button" 
                onClick={handleForgotPassword}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Forgot password?
              </button>
            </div>

            {/* Error message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Submit button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all duration-200 font-medium text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  'Sign In'
                )}
              </button>
            </div>
          </form>
            )}
          </div>

          {/* Register link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don&apos;t have an account?{' '}
              <button
                onClick={onSwitchToRegister}
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
              >
                Sign up here
              </button>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
