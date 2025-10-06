"use client";

import { useState } from 'react';
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { authenticatedFetch } from '@/lib/auth';

interface ChangePasswordFormProps {
  onSuccess?: () => void;
}

export default function ChangePasswordForm({ onSuccess }: ChangePasswordFormProps) {
  const [formData, setFormData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    setSuccess(false);
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.old_password) {
      newErrors.old_password = 'Current password is required';
    }

    if (!formData.new_password) {
      newErrors.new_password = 'New password is required';
    } else if (formData.new_password.length < 8) {
      newErrors.new_password = 'Password must be at least 8 characters';
    }

    if (!formData.confirm_password) {
      newErrors.confirm_password = 'Please confirm your new password';
    } else if (formData.new_password !== formData.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match';
    }

    if (formData.old_password && formData.new_password && formData.old_password === formData.new_password) {
      newErrors.new_password = 'New password must be different from current password';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setErrors({});

      const response = await authenticatedFetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/change-password/`,
        {
          method: 'POST',
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        
        // Handle specific error fields
        if (errorData.old_password) {
          setErrors({ old_password: Array.isArray(errorData.old_password) ? errorData.old_password[0] : errorData.old_password });
        } else if (errorData.new_password) {
          setErrors({ new_password: Array.isArray(errorData.new_password) ? errorData.new_password[0] : errorData.new_password });
        } else if (errorData.confirm_password) {
          setErrors({ confirm_password: Array.isArray(errorData.confirm_password) ? errorData.confirm_password[0] : errorData.confirm_password });
        } else {
          setErrors({ general: errorData.message || errorData.detail || 'Failed to change password' });
        }
        return;
      }

      // Success
      setSuccess(true);
      setFormData({
        old_password: '',
        new_password: '',
        confirm_password: '',
      });

      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }

      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 5000);

    } catch (err) {
      console.error('Error changing password:', err);
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <div className="flex items-center mb-6">
        <div className="p-3 bg-blue-100 rounded-xl mr-4">
          <Lock className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Change Password</h2>
          <p className="text-sm text-gray-600">Update your password to keep your account secure</p>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-green-800">Password changed successfully!</p>
              <p className="text-xs text-green-700 mt-1">Your password has been updated. Please use your new password for future logins.</p>
            </div>
          </div>
        </div>
      )}

      {/* General Error */}
      {errors.general && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">{errors.general}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Current Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Password *
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type={showOldPassword ? 'text' : 'password'}
              value={formData.old_password}
              onChange={(e) => handleChange('old_password', e.target.value)}
              className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                errors.old_password ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your current password"
            />
            <button
              type="button"
              onClick={() => setShowOldPassword(!showOldPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showOldPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {errors.old_password && (
            <p className="text-red-600 text-sm mt-1">{errors.old_password}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            This is the password you received in the invitation email or set previously
          </p>
        </div>

        {/* New Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            New Password *
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type={showNewPassword ? 'text' : 'password'}
              value={formData.new_password}
              onChange={(e) => handleChange('new_password', e.target.value)}
              className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                errors.new_password ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your new password"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {errors.new_password && (
            <p className="text-red-600 text-sm mt-1">{errors.new_password}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Must be at least 8 characters long and different from your current password
          </p>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confirm New Password *
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirm_password}
              onChange={(e) => handleChange('confirm_password', e.target.value)}
              className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                errors.confirm_password ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Confirm your new password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {errors.confirm_password && (
            <p className="text-red-600 text-sm mt-1">{errors.confirm_password}</p>
          )}
        </div>

        {/* Security Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-xs text-blue-800">
            <strong>💡 Security Tips:</strong>
          </p>
          <ul className="text-xs text-blue-700 mt-2 space-y-1 list-disc list-inside">
            <li>Use a mix of uppercase, lowercase, numbers, and special characters</li>
            <li>Avoid using common words or personal information</li>
            <li>Don&apos;t reuse passwords from other accounts</li>
            <li>Consider using a password manager to generate and store strong passwords</li>
          </ul>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Changing Password...
              </>
            ) : (
              <>
                <Lock className="h-5 w-5 mr-2" />
                Change Password
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

