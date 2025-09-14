'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { mockKnowledgePartners } from '@/lib/mock-organizations';
import { authApi, RegistrationData } from '@/lib/api';

type UserRole = 'learner' | 'knowledge_partner_instructor' | 'knowledge_partner_admin';


interface FormData {
  full_name: string;
  email: string;
  password: string;
  confirm_password: string;
  role: UserRole;
  knowledge_partner_id?: string;
  knowledge_partner_details?: {
    name: string;
    type: 'company' | 'organization' | 'university' | 'institute' | 'bootcamp';
    location: string;
    website?: string;
    description: string;
    address?: string;
    contact_email?: string;
    contact_phone?: string;
    linkedin_url?: string;
  };
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
    knowledge_partner_id: '',
    knowledge_partner_details: {
      name: '',
      type: 'university',
      location: '',
      website: '',
      description: '',
      address: '',
      contact_email: '',
      contact_phone: '',
      linkedin_url: ''
    }
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
      knowledge_partner_id: role === 'learner' ? '' : prev.knowledge_partner_id,
      knowledge_partner_details: role === 'knowledge_partner_admin' ? prev.knowledge_partner_details : {
        name: '',
        type: 'university',
        location: '',
        website: '',
        description: '',
        address: '',
        contact_email: '',
        contact_phone: '',
        linkedin_url: ''
      }
    }));
    
    // Clear relevant errors when switching roles
    if (role === 'learner') {
      setErrors(prev => ({ 
        ...prev, 
        knowledge_partner_id: undefined,
        knowledge_partner_details: undefined
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
      } else if (formData.role === 'knowledge_partner_admin' && formData.knowledge_partner_details) {
        registrationData.organization_details = formData.knowledge_partner_details;
      }

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
  const requiresKnowledgePartnerCreation = formData.role === 'knowledge_partner_admin';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Full Name */}
      <div>
        <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-2">
          Full Name
        </label>
        <input
          type="text"
          id="full_name"
          name="full_name"
          value={formData.full_name}
          onChange={handleInputChange}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-gray-900 focus:bg-gray-50 transition-all duration-200 ${
            errors.full_name ? 'border-red-500 focus:border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter your full name"
        />
        {errors.full_name && (
          <p className="mt-1 text-sm text-red-600">{errors.full_name}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          Email Address
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-gray-900 focus:bg-gray-50 transition-all duration-200 ${
            errors.email ? 'border-red-500 focus:border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter your email"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email}</p>
        )}
      </div>

      {/* Role Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          I want to join as a
        </label>
        <div className="grid grid-cols-1 gap-3">
                     {([
                       { role: 'learner', label: 'Learner', description: 'Access courses and learn' },
                       { role: 'knowledge_partner_instructor', label: 'Knowledge Partner Instructor', description: 'Join existing knowledge partner (requires approval)' },
                       { role: 'knowledge_partner_admin', label: 'Knowledge Partner Admin', description: 'Create and manage new knowledge partner' }
                     ] as const).map(({ role, label, description }) => (
            <button
              key={role}
              type="button"
              onClick={() => handleRoleChange(role)}
              className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                formData.role === role
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
              }`}
            >
              <div className="font-medium">{label}</div>
              <div className="text-sm opacity-75 mt-1">{description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Knowledge Partner Selection for Instructors */}
      <div className={`transition-all duration-300 ${
        requiresKnowledgePartnerSelection ? 'opacity-100 max-h-96' : 'opacity-0 max-h-0 overflow-hidden'
      }`}>
        {requiresKnowledgePartnerSelection && (
          <>
            <label htmlFor="knowledge_partner_id" className="block text-sm font-medium text-gray-700 mb-2">
              Select Knowledge Partner to Join
            </label>
            <select
              id="knowledge_partner_id"
              name="knowledge_partner_id"
              value={formData.knowledge_partner_id}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-gray-900 focus:bg-gray-50 transition-all duration-200 ${
                errors.knowledge_partner_id ? 'border-red-500 focus:border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Choose knowledge partner to request access...</option>
              {mockKnowledgePartners.map((kp) => (
                <option key={kp.id} value={kp.id}>
                  {kp.name} ({kp.type})
                </option>
              ))}
            </select>
            {errors.knowledge_partner_id && (
              <p className="mt-1 text-sm text-red-600">{errors.knowledge_partner_id}</p>
            )}
            <p className="mt-1 text-xs text-blue-600 bg-blue-50 p-2 rounded">
              💡 Your request will be sent to the knowledge partner admin for approval
            </p>
          </>
        )}
      </div>

      {/* Knowledge Partner Creation for Knowledge Partner Admins */}
      <div className={`transition-all duration-300 ${
        requiresKnowledgePartnerCreation ? 'opacity-100' : 'opacity-0 max-h-0 overflow-hidden'
      }`}>
        {requiresKnowledgePartnerCreation && (
          <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-900">Knowledge Partner Details</h3>
            <p className="text-sm text-blue-700">Please provide details about your knowledge partner</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Knowledge Partner Name */}
              <div>
                <label htmlFor="kp_name" className="block text-sm font-medium text-gray-700 mb-2">
                  Knowledge Partner Name *
                </label>
                <input
                  type="text"
                  id="kp_name"
                  value={formData.knowledge_partner_details?.name || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    knowledge_partner_details: {
                      ...prev.knowledge_partner_details!,
                      name: e.target.value
                    }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900 focus:bg-gray-50 transition-all duration-200"
                  placeholder="Enter knowledge partner name"
                />
              </div>

              {/* Knowledge Partner Type */}
              <div>
                <label htmlFor="kp_type" className="block text-sm font-medium text-gray-700 mb-2">
                  Knowledge Partner Type *
                </label>
                <select
                  id="kp_type"
                  value={formData.knowledge_partner_details?.type || 'university'}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    knowledge_partner_details: {
                      ...prev.knowledge_partner_details!,
                      type: e.target.value as any
                    }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900 focus:bg-gray-50 transition-all duration-200"
                >
                  <option value="university">University</option>
                  <option value="company">Company</option>
                  <option value="organization">Organization</option>
                  <option value="institute">Institute</option>
                  <option value="bootcamp">Bootcamp</option>
                </select>
              </div>

              {/* Location */}
              <div>
                <label htmlFor="kp_location" className="block text-sm font-medium text-gray-700 mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  id="kp_location"
                  value={formData.knowledge_partner_details?.location || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    knowledge_partner_details: {
                      ...prev.knowledge_partner_details!,
                      location: e.target.value
                    }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900 focus:bg-gray-50 transition-all duration-200"
                  placeholder="City, State, Country"
                />
              </div>

              {/* Website */}
              <div>
                <label htmlFor="kp_website" className="block text-sm font-medium text-gray-700 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  id="kp_website"
                  value={formData.knowledge_partner_details?.website || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    knowledge_partner_details: {
                      ...prev.knowledge_partner_details!,
                      website: e.target.value
                    }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900 focus:bg-gray-50 transition-all duration-200"
                  placeholder="https://example.com"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="kp_description" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                id="kp_description"
                value={formData.knowledge_partner_details?.description || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  knowledge_partner_details: {
                    ...prev.knowledge_partner_details!,
                    description: e.target.value
                  }
                }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900 focus:bg-gray-50 transition-all duration-200"
                placeholder="Describe your knowledge partner..."
              />
            </div>
          </div>
        )}
      </div>

      {/* Password */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
          Password
        </label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-gray-900 focus:bg-gray-50 transition-all duration-200 ${
            errors.password ? 'border-red-500 focus:border-red-500' : 'border-gray-300'
          }`}
          placeholder="Create a strong password"
        />
        {errors.password && (
          <p className="mt-1 text-sm text-red-600">{errors.password}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Must be 8+ characters with at least 1 letter and 1 number
        </p>
      </div>

      {/* Confirm Password */}
      <div>
        <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700 mb-2">
          Confirm Password
        </label>
        <div className="relative">
          <input
            type="password"
            id="confirm_password"
            name="confirm_password"
            value={formData.confirm_password}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:border-gray-900 focus:bg-gray-50 transition-all duration-200 ${
              errors.confirm_password 
                ? 'border-red-500 focus:border-red-500' 
                : formData.confirm_password && formData.password === formData.confirm_password
                  ? 'border-green-500 focus:border-green-600' 
                  : 'border-gray-300'
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
          <p className="mt-1 text-sm text-red-600">{errors.confirm_password}</p>
        )}
        {formData.confirm_password && formData.password === formData.confirm_password && !errors.confirm_password && (
          <p className="mt-1 text-sm text-green-600 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Passwords match
          </p>
        )}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isSubmitting}
        size="lg"
        className="w-full"
      >
        {isSubmitting ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Creating Account...
          </div>
        ) : (
          'Create Account'
        )}
      </Button>
    </form>
  );
}
