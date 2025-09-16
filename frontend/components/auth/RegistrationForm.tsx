'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { authApi, RegistrationData } from '@/lib/api';

interface FormData {
  full_name: string;
  email: string;
  password: string;
  confirm_password: string;
  wants_kp_association: boolean;
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
  onSuccess?: (email: string, hasOrganization: boolean, organizationName?: string) => void;
}

interface KnowledgePartner {
  id: string;
  name: string;
  type: string;
}

export default function RegistrationForm({ onSuccess }: RegistrationFormProps = {}) {
  const [formData, setFormData] = useState<FormData>({
    full_name: '',
    email: '',
    password: '',
    confirm_password: '',
    wants_kp_association: false,
    knowledge_partner_id: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [knowledgePartners, setKnowledgePartners] = useState<KnowledgePartner[]>([]);
  const [loadingKPs, setLoadingKPs] = useState(false);

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
      if (formData.wants_kp_association && !value) {
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

  // Load knowledge partners when KP association is enabled
  useEffect(() => {
    if (formData.wants_kp_association && knowledgePartners.length === 0 && !loadingKPs) {
      loadKnowledgePartners();
    }
  }, [formData.wants_kp_association, knowledgePartners.length, loadingKPs]);

  const loadKnowledgePartners = async () => {
    try {
      setLoadingKPs(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/knowledge-partners/`);
      if (!response.ok) {
        throw new Error('Failed to load knowledge partners');
      }
      const data = await response.json();
      setKnowledgePartners(data);
    } catch (error) {
      console.error('Error loading knowledge partners:', error);
      setKnowledgePartners([]);
    } finally {
      setLoadingKPs(false);
    }
  };

  const handleKPAssociationChange = (wants_association: boolean) => {
    setFormData(prev => ({ 
      ...prev, 
      wants_kp_association: wants_association,
      knowledge_partner_id: wants_association ? prev.knowledge_partner_id : ''
    }));
    
    // Clear relevant errors when switching
    if (!wants_association) {
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
        role: 'learner', // Always learner now
      };

      // Add knowledge partner data if learner wants association
      if (formData.wants_kp_association && formData.knowledge_partner_id) {
        registrationData.knowledge_partner_id = formData.knowledge_partner_id;
      }

      // Make API call
      const response = await authApi.register(registrationData);
      
      console.log('Registration successful:', response);
      
      // Find the selected organization name
      const selectedOrganization = formData.knowledge_partner_id 
        ? knowledgePartners.find(kp => kp.id === formData.knowledge_partner_id)
        : null;
      
      // Call onSuccess callback with email and organization info
      if (onSuccess) {
        onSuccess(
          formData.email, 
          formData.wants_kp_association && !!formData.knowledge_partner_id,
          selectedOrganization?.name
        );
      }
      
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Registration failed. Please try again.';
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const requiresKnowledgePartnerSelection = formData.wants_kp_association;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 max-w-lg mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information Section */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Your Account</h3>
          </div>
          
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
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                errors.full_name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 hover:border-gray-400'
              }`}
              placeholder="Enter your full name"
            />
            {errors.full_name && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.full_name}
              </p>
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
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 hover:border-gray-400'
              }`}
              placeholder="Enter your email address"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.email}
              </p>
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
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                errors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 hover:border-gray-400'
              }`}
              placeholder="Create a strong password"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.password}
              </p>
            )}
            <div className="mt-1 text-xs text-gray-500">
              Must be 8+ characters with at least 1 letter and 1 number
            </div>
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
                className={`w-full px-4 py-2.5 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
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
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.confirm_password}
              </p>
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
        </div>

        {/* Organization Association Section */}
        <div className="space-y-4">
          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="wants_kp_association"
                checked={formData.wants_kp_association}
                onChange={(e) => handleKPAssociationChange(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <label htmlFor="wants_kp_association" className="text-sm font-medium text-gray-700">
                Join a Knowledge Partner organization
              </label>
            </div>
            
            {formData.wants_kp_association && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-700 mb-2">✓ You&apos;ll have immediate platform access. Organization approval is for additional features.</p>
              </div>
            )}
          </div>
        </div>

        {/* Knowledge Partner Selection */}
        {requiresKnowledgePartnerSelection && (
          <div className="space-y-3">
            <div>
              <label htmlFor="knowledge_partner_id" className="block text-sm font-medium text-gray-700 mb-2">
                Select Organization
              </label>
              <select
                id="knowledge_partner_id"
                name="knowledge_partner_id"
                value={formData.knowledge_partner_id}
                onChange={handleInputChange}
                disabled={loadingKPs}
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                  errors.knowledge_partner_id ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <option value="">
                  {loadingKPs ? 'Loading organizations...' : 'Choose an organization'}
                </option>
                {knowledgePartners.map((kp) => (
                  <option key={kp.id} value={kp.id}>
                    {kp.name} ({kp.type})
                  </option>
                ))}
                {!loadingKPs && knowledgePartners.length === 0 && (
                  <option value="" disabled>No organizations available</option>
                )}
              </select>
              {errors.knowledge_partner_id && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.knowledge_partner_id}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-4">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all duration-200 font-medium"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Creating Account...</span>
              </div>
            ) : (
              <span>Create Account</span>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
