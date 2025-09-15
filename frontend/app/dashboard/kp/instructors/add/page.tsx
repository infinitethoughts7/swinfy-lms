"use client";

import { useState } from 'react';
import { ArrowLeft, Save, User, Lock } from 'lucide-react';
import { userApi, InstructorCreateData } from '@/lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface FormData {
  email: string;
  full_name: string;
  password: string;
  confirm_password: string;
}

interface FormErrors {
  [key: string]: string;
}

export default function AddInstructorPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    email: '',
    full_name: '',
    password: 'rockyg07',
    confirm_password: 'rockyg07',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (!formData.full_name) {
      newErrors.full_name = 'Full name is required';
    } else if (formData.full_name.length < 2) {
      newErrors.full_name = 'Full name must be at least 2 characters';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setSubmitError(null);

    try {
      const instructorData: InstructorCreateData = {
        email: formData.email,
        full_name: formData.full_name,
        password: formData.password,
        confirm_password: formData.confirm_password,
      };

      await userApi.instructors.create(instructorData);
      router.push('/dashboard/kp/instructors?success=created');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to create instructor');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/kp/instructors"
          className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add New Instructor</h1>
          <p className="text-gray-600 mt-1">Create a new instructor account</p>
        </div>
      </div>

      {/* Info Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
        <div className="flex items-start">
          <div className="p-2 bg-blue-100 rounded-lg">
            <User className="h-5 w-5 text-blue-600" />
          </div>
          <div className="ml-4">
            <h3 className="font-medium text-blue-900">Quick Setup</h3>
            <p className="text-blue-700 mt-1">
              Just provide basic account details. The instructor can complete their profile after logging in.
            </p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {submitError && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <div className="flex items-center">
            <span className="text-red-600">⚠️</span>
            <span className="text-red-700 ml-2">{submitError}</span>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-2xl border border-gray-100 p-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => handleChange('full_name', e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border-0 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200 ${
                  errors.full_name ? 'ring-2 ring-red-500' : ''
                }`}
                placeholder="Enter instructor's full name"
              />
              {errors.full_name && <p className="text-red-600 text-sm mt-2">{errors.full_name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border-0 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200 ${
                  errors.email ? 'ring-2 ring-red-500' : ''
                }`}
                placeholder="instructor@example.com"
              />
              {errors.email && <p className="text-red-600 text-sm mt-2">{errors.email}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border-0 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200 ${
                      errors.password ? 'ring-2 ring-red-500' : ''
                    }`}
                    placeholder="Minimum 8 characters"
                  />
                </div>
                {errors.password && <p className="text-red-600 text-sm mt-2">{errors.password}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="password"
                    value={formData.confirm_password}
                    onChange={(e) => handleChange('confirm_password', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border-0 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200 ${
                      errors.confirm_password ? 'ring-2 ring-red-500' : ''
                    }`}
                    placeholder="Confirm password"
                  />
                </div>
                {errors.confirm_password && <p className="text-red-600 text-sm mt-2">{errors.confirm_password}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Professional Details Notice */}
        <div className="bg-gray-50 rounded-2xl p-6">
          <h3 className="font-medium text-gray-900 mb-2">What happens next?</h3>
          <ul className="text-gray-700 space-y-2">
            <li className="flex items-center">
              <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
              Account created with default profile settings
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
              Instructor can log in and complete their professional details
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
              They can update bio, specializations, and availability
            </li>
          </ul>
        </div>

        {/* Submit */}
        <div className="flex gap-4">
          <Link
            href="/dashboard/kp/instructors"
            className="px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Create Instructor
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}