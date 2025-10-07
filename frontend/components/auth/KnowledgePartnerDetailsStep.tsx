'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface KnowledgePartnerDetails {
  name: string;
  type: 'company' | 'organization' | 'university' | 'institute' | 'bootcamp';
  location: string;
  website?: string;
  description: string;
  address?: string;
  contact_email?: string;
  contact_phone?: string;
  linkedin_url?: string;
}

interface KnowledgePartnerDetailsStepProps {
  knowledgePartnerDetails: KnowledgePartnerDetails;
  onChange: (details: KnowledgePartnerDetails) => void;
  onNext: () => void;
  onBack: () => void;
  errors?: Partial<Record<keyof KnowledgePartnerDetails, string>>;
}

export default function KnowledgePartnerDetailsStep({
  knowledgePartnerDetails,
  onChange,
  onNext,
  onBack,
  errors
}: KnowledgePartnerDetailsStepProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    onChange({ ...knowledgePartnerDetails, [name]: value });
  };

  const validateKnowledgePartnerDetails = (details: KnowledgePartnerDetails): Partial<Record<keyof KnowledgePartnerDetails, string>> => {
    const kpErrors: Partial<Record<keyof KnowledgePartnerDetails, string>> = {};

    if (!details.name) kpErrors.name = 'Knowledge partner name is required';
    if (!details.type) kpErrors.type = 'Knowledge partner type is required';
    if (!details.location) kpErrors.location = 'Location is required';
    if (!details.description) kpErrors.description = 'Description is required';
    if (details.website && !/^https?:\/\/.+/.test(details.website)) {
      kpErrors.website = 'Please enter a valid URL';
    }
    if (details.contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.contact_email)) {
      kpErrors.contact_email = 'Please enter a valid contact email';
    }
    if (details.linkedin_url && !/^https?:\/\/.+/.test(details.linkedin_url)) {
      kpErrors.linkedin_url = 'Please enter a valid LinkedIn URL';
    }

    return kpErrors;
  };

  const handleNext = async () => {
    const kpErrors = validateKnowledgePartnerDetails(knowledgePartnerDetails);
    if (Object.keys(kpErrors).length > 0) {
      console.error("Knowledge partner details validation errors:", kpErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      // Here you would make an API call to create the knowledge partner
      // For now, we'll just proceed to the next step
      await new Promise(resolve => setTimeout(resolve, 1000));
      onNext();
    } catch (error) {
      console.error('Error creating knowledge partner:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Knowledge Partner Details</h2>
        <p className="text-gray-600">Please provide details about your knowledge partner organization</p>
      </div>

      {/* Form */}
      <div className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Knowledge Partner Name */}
            <div className="md:col-span-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-3">
                Knowledge Partner Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={knowledgePartnerDetails.name}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-1 focus:outline-none focus:ring-blue-500 transition-all duration-200 ${
                  errors?.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 hover:border-gray-400'
                }`}
                placeholder="Enter your knowledge partner name"
              />
              {errors?.name && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.name}
                </p>
              )}
            </div>

            {/* Knowledge Partner Type */}
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-3">
                Knowledge Partner Type *
              </label>
              <select
                id="type"
                name="type"
                value={knowledgePartnerDetails.type}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-1 focus:outline-none focus:ring-blue-500 transition-all duration-200 ${
                  errors?.type ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <option value="university">University</option>
                <option value="company">Company</option>
                <option value="organization">Organization</option>
                <option value="institute">Institute</option>
                <option value="bootcamp">Bootcamp</option>
              </select>
              {errors?.type && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.type}
                </p>
              )}
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-3">
                Location *
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={knowledgePartnerDetails.location}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-1 focus:outline-none focus:ring-blue-500 transition-all duration-200 ${
                  errors?.location ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 hover:border-gray-400'
                }`}
                placeholder="City, State, Country"
              />
              {errors?.location && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.location}
                </p>
              )}
            </div>

            {/* Website */}
            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-3">
                Website
              </label>
              <input
                type="url"
                id="website"
                name="website"
                value={knowledgePartnerDetails.website || ''}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-1 focus:outline-none focus:ring-blue-500 transition-all duration-200 ${
                  errors?.website ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 hover:border-gray-400'
                }`}
                placeholder="https://example.com"
              />
              {errors?.website && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.website}
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-3">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={knowledgePartnerDetails.description}
              onChange={handleInputChange}
              rows={4}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-1 focus:outline-none focus:ring-blue-500 transition-all duration-200 ${
                errors?.description ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 hover:border-gray-400'
              }`}
              placeholder="Describe your knowledge partner organization, its mission, and what makes it unique..."
            />
            {errors?.description && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.description}
              </p>
            )}
          </div>
        </div>

        {/* Additional Information */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
            <p className="text-sm text-gray-600 mb-4">Optional details to help others learn more about your organization</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Address */}
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-3">
                Address
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={knowledgePartnerDetails.address || ''}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-1 focus:outline-none focus:ring-blue-500 transition-all duration-200 hover:border-gray-400"
                placeholder="Street address, city, state, zip code"
              />
            </div>

            {/* Contact Email */}
            <div>
              <label htmlFor="contact_email" className="block text-sm font-medium text-gray-700 mb-3">
                Contact Email
              </label>
              <input
                type="email"
                id="contact_email"
                name="contact_email"
                value={knowledgePartnerDetails.contact_email || ''}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-1 focus:outline-none focus:ring-blue-500 transition-all duration-200 ${
                  errors?.contact_email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 hover:border-gray-400'
                }`}
                placeholder="contact@organization.com"
              />
              {errors?.contact_email && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.contact_email}
                </p>
              )}
            </div>

            {/* Contact Phone */}
            <div>
              <label htmlFor="contact_phone" className="block text-sm font-medium text-gray-700 mb-3">
                Contact Phone
              </label>
              <input
                type="tel"
                id="contact_phone"
                name="contact_phone"
                value={knowledgePartnerDetails.contact_phone || ''}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-1 focus:outline-none focus:ring-blue-500 transition-all duration-200 hover:border-gray-400"
                placeholder="+1 (555) 123-4567"
              />
            </div>

            {/* LinkedIn URL */}
            <div>
              <label htmlFor="linkedin_url" className="block text-sm font-medium text-gray-700 mb-3">
                LinkedIn URL
              </label>
              <input
                type="url"
                id="linkedin_url"
                name="linkedin_url"
                value={knowledgePartnerDetails.linkedin_url || ''}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-1 focus:outline-none focus:ring-blue-500 transition-all duration-200 ${
                  errors?.linkedin_url ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 hover:border-gray-400'
                }`}
                placeholder="https://linkedin.com/company/your-organization"
              />
              {errors?.linkedin_url && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.linkedin_url}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="px-8 py-3"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Button>
        <Button
          type="button"
          onClick={handleNext}
          disabled={isSubmitting}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700"
        >
          {isSubmitting ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Creating...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <span>Create Knowledge Partner</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          )}
        </Button>
      </div>
    </div>
  );
}
