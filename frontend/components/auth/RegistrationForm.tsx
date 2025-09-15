'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { authApi, RegistrationData } from '@/lib/api';

type UserRole = 'learner' | 'knowledge_partner_instructor' | 'knowledge_partner_admin';


interface FormData {
  full_name: string;
  email: string;
  password: string;
  confirm_password: string;
  role: UserRole;
  knowledge_partner_id?: string;
}

interface FormErrors {
  full_name?: string;
  email?: string;
  password?: string;
  confirm_password?: string;
  knowledge_partner_id?: string;
}

const validationRules = {
  full_name: {
    required: true,
    minLength: 2,
    message: "Name must be at least 2 characters"
  },
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: "Please enter a valid email"
  },
  password: {
    required: true,
    minLength: 8,
    pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]/,
    message: "8+ characters with at least 1 letter and 1 number"
  },
  confirm_password: {
    required: true,
    message: "Passwords must match"
  }
};

interface RegistrationFormProps {
  onSuccess?: (email: string, role: 'learner' | 'knowledge_partner_instructor' | 'knowledge_partner_admin') => void;
}

export default function RegistrationForm({ onSuccess }: RegistrationFormProps = {}) {
  const [formData, setFormData] = useState<FormData>({
    full_name: '',
    email: '',
    password: '',
    confirm_password: '',
    role: 'learner',
    knowledge_partner_id: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = (name: keyof FormData, value: string): string | undefined => {
    switch (name) {
      case 'full_name':
        if (!value) return validationRules.full_name.message;
        if (value.length < validationRules.full_name.minLength) return validationRules.full_name.message;
        break;
      
      case 'email':
        if (!value) return validationRules.email.message;
        if (!validationRules.email.pattern.test(value)) return validationRules.email.message;
        break;
      
      case 'password':
        if (!value) return validationRules.password.message;
        if (value.length < validationRules.password.minLength) return validationRules.password.message;
        if (!validationRules.password.pattern.test(value)) return validationRules.password.message;
        break;
      
      case 'confirm_password':
        if (!value) return validationRules.confirm_password.message;
        if (value !== formData.password) return validationRules.confirm_password.message;
        break;
      
    case 'knowledge_partner_id':
      if (formData.role === 'knowledge_partner_instructor' && !value) {
        return 'Please select a knowledge partner';
      }
      break;
    }
    return undefined;
  };


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleRoleChange = (role: UserRole) => {
    setFormData(prev => ({ 
      ...prev, 
      role, 
      knowledge_partner_id: role === 'learner' ? '' : prev.knowledge_partner_id
    }));
    
    // Clear relevant errors when switching roles
    if (role === 'learner') {
      setErrors(prev => ({ 
        ...prev, 
        knowledge_partner_id: undefined
      }));
    }
  };


  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    // Validate basic fields
    const basicFields = ['full_name', 'email', 'password', 'confirm_password'] as const;
    basicFields.forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) {
        newErrors[key] = error;
      }
    });

    // Validate knowledge_partner_id separately
    const partnerError = validateField('knowledge_partner_id', formData.knowledge_partner_id || '');
    if (partnerError) {
      newErrors.knowledge_partner_id = partnerError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // Prepare registration data
      const registrationData: RegistrationData = {
        email: formData.email,
        full_name: formData.full_name,
        password: formData.password,
        confirm_password: formData.confirm_password,
        role: formData.role,
      };

      // Add knowledge partner data based on role
      if (formData.role === 'knowledge_partner_instructor' && formData.knowledge_partner_id) {
        registrationData.organization_id = formData.knowledge_partner_id;
      }
      // Note: Knowledge partner admin details will be collected in the next step after email verification

      // Make API call
      const response = await authApi.register(registrationData);
      
      console.log('Registration successful:', response);
      
      // Call onSuccess callback with email and role to proceed to OTP verification
      if (onSuccess) {
        onSuccess(formData.email, formData.role);
      }
      
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Registration failed. Please try again.';
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const requiresKnowledgePartnerSelection = formData.role === 'knowledge_partner_instructor';

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Personal Information Section */}
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
        </div>
        
        {/* Full Name */}
        <div>
          <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-3">
            Full Name
          </label>
          <input
            type="text"
            id="full_name"
            name="full_name"
            value={formData.full_name}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
              errors.full_name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 hover:border-gray-400'
            }`}
            placeholder="Enter your full name"
          />
          {errors.full_name && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.full_name}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-3">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
              errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 hover:border-gray-400'
            }`}
            placeholder="Enter your email address"
          />
          {errors.email && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.email}
            </p>
          )}
        </div>
      </div>

      {/* Role Selection Section */}
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Account Type</h3>
          <p className="text-sm text-gray-600 mb-4">Choose how you want to use the platform</p>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          {([
            { 
              role: 'learner', 
              label: 'Learner', 
              description: 'Access courses and learn new skills',
              icon: '🎓',
              features: ['Browse courses', 'Track progress', 'Get certificates']
            },
            { 
              role: 'knowledge_partner_instructor', 
              label: 'Knowledge Partner Instructor', 
              description: 'Teach courses within an existing knowledge partner',
              icon: '👨‍🏫',
              features: ['Create courses', 'Manage students', 'Requires approval']
            },
            { 
              role: 'knowledge_partner_admin', 
              label: 'Knowledge Partner Admin', 
              description: 'Create and manage your own knowledge partner organization',
              icon: '🏢',
              features: ['Create organization', 'Manage instructors', 'Full control']
            }
          ] as const).map(({ role, label, description, icon, features }) => (
            <button
              key={role}
              type="button"
              onClick={() => handleRoleChange(role)}
              className={`p-6 rounded-xl border-2 transition-all duration-200 text-left group ${
                formData.role === role
                  ? 'border-blue-500 bg-blue-50 text-blue-900 shadow-md'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              <div className="flex items-start space-x-4">
                <div className="text-2xl">{icon}</div>
                <div className="flex-1">
                  <div className="font-semibold text-lg mb-1">{label}</div>
                  <div className="text-sm text-gray-600 mb-3">{description}</div>
                  <div className="flex flex-wrap gap-2">
                    {features.map((feature, index) => (
                      <span 
                        key={index}
                        className={`px-2 py-1 rounded-full text-xs ${
                          formData.role === role
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  formData.role === role
                    ? 'border-blue-500 bg-blue-500'
                    : 'border-gray-300'
                }`}>
                  {formData.role === role && (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Knowledge Partner Selection for Instructors */}
      <div className={`transition-all duration-500 ${
        requiresKnowledgePartnerSelection ? 'opacity-100 max-h-96' : 'opacity-0 max-h-0 overflow-hidden'
      }`}>
        {requiresKnowledgePartnerSelection && (
          <div className="space-y-4 p-6 bg-blue-50 rounded-xl border border-blue-200">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-blue-900">Select Knowledge Partner</h4>
                <p className="text-sm text-blue-700">Choose which knowledge partner you want to join</p>
              </div>
            </div>
            
            <div>
              <label htmlFor="knowledge_partner_id" className="block text-sm font-medium text-gray-700 mb-3">
                Knowledge Partner
              </label>
              <select
                id="knowledge_partner_id"
                name="knowledge_partner_id"
                value={formData.knowledge_partner_id}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                  errors.knowledge_partner_id ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 hover:border-gray-400'
                }`}
              >
              <option value="">Choose knowledge partner to request access...</option>
              <option value="loading" disabled>Loading knowledge partners...</option>
              </select>
              {errors.knowledge_partner_id && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.knowledge_partner_id}
                </p>
              )}
            </div>
            
            <div className="flex items-start space-x-3 p-3 bg-blue-100 rounded-lg">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-blue-800 font-medium">Approval Required</p>
                <p className="text-xs text-blue-700 mt-1">Your request will be sent to the knowledge partner admin for approval before you can start teaching.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-amber-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-amber-800 font-medium">Note</p>
                <p className="text-xs text-amber-700 mt-1">Knowledge partners will be loaded from the database. If none are available, contact support.</p>
              </div>
            </div>
          </div>
        )}
      </div>


      {/* Security Section */}
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Security</h3>
          <p className="text-sm text-gray-600 mb-4">Create a secure password for your account</p>
        </div>
        
        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-3">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
              errors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 hover:border-gray-400'
            }`}
            placeholder="Create a strong password"
          />
          {errors.password && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.password}
            </p>
          )}
          <div className="mt-2 flex items-center space-x-2 text-xs text-gray-500">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span>Must be 8+ characters with at least 1 letter and 1 number</span>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700 mb-3">
            Confirm Password
          </label>
          <div className="relative">
            <input
              type="password"
              id="confirm_password"
              name="confirm_password"
              value={formData.confirm_password}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                errors.confirm_password
                  ? 'border-red-500 focus:ring-red-500'
                  : formData.confirm_password && formData.password === formData.confirm_password
                    ? 'border-green-500 focus:ring-green-500'
                    : 'border-gray-300 hover:border-gray-400'
              }`}
              placeholder="Confirm your password"
            />
            {/* Password Match Indicator */}
            {formData.confirm_password && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                {formData.password === formData.confirm_password ? (
                  <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            )}
          </div>
          {errors.confirm_password && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.confirm_password}
            </p>
          )}
          {formData.confirm_password && formData.password === formData.confirm_password && !errors.confirm_password && (
            <p className="mt-2 text-sm text-green-600 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Passwords match
            </p>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-6">
        <Button
          type="submit"
          disabled={isSubmitting}
          size="lg"
          className="w-full py-4 text-lg font-semibold bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all duration-200"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Creating Account...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Create Account</span>
            </div>
          )}
        </Button>
        
        {formData.role === 'knowledge_partner_admin' && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-amber-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-amber-800">Next Step: Knowledge Partner Details</p>
                <p className="text-xs text-amber-700 mt-1">After email verification, you&apos;ll be asked to provide details about your knowledge partner organization.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </form>
  );
}
