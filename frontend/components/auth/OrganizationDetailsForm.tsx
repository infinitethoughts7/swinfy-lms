'use client';

import React from 'react';
import Image from 'next/image';

interface OrganizationDetails {
  name: string;
  type: 'company' | 'organization' | 'university' | 'institute' | 'bootcamp';
  location: string;
  website: string;
  description: string;
  address: string;
  contact_email: string;
  contact_phone: string;
  logo?: File | null;
  linkedin_url?: string;
}

interface OrganizationDetailsFormProps {
  organizationDetails: OrganizationDetails;
  onChange: (details: OrganizationDetails) => void;
  errors?: Partial<Record<keyof OrganizationDetails, string>>;
}

export default function OrganizationDetailsForm({ 
  organizationDetails, 
  onChange, 
  errors = {} 
}: OrganizationDetailsFormProps) {
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, files } = e.target as HTMLInputElement;
    
    if (name === 'logo' && files && files[0]) {
      onChange({
        ...organizationDetails,
        [name]: files[0]
      });
    } else {
      onChange({
        ...organizationDetails,
        [name]: value
      });
    }
  };

  return (
    <div className="space-y-4 mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
        <h3 className="text-lg font-semibold text-blue-900">Organization Details</h3>
      </div>
      
      {/* Organization Name */}
      <div>
        <label htmlFor="org-name" className="block text-sm font-medium text-gray-700 mb-1">
          Organization Name *
        </label>
        <input
          type="text"
          id="org-name"
          name="name"
          value={organizationDetails.name}
          onChange={handleInputChange}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-gray-900 focus:bg-gray-50 transition-all duration-200 ${
            errors.name ? 'border-red-500 focus:border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter your organization name"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name}</p>
        )}
      </div>

      {/* Organization Type */}
      <div>
        <label htmlFor="org-type" className="block text-sm font-medium text-gray-700 mb-1">
          Organization Type *
        </label>
        <select
          id="org-type"
          name="type"
          value={organizationDetails.type}
          onChange={handleInputChange}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-gray-900 focus:bg-gray-50 transition-all duration-200 ${
            errors.type ? 'border-red-500 focus:border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="">Select organization type...</option>
          <option value="company">Company</option>
          <option value="organization">Organization</option>
          <option value="university">University</option>
          <option value="institute">Institute</option>
          <option value="bootcamp">Bootcamp</option>
        </select>
        {errors.type && (
          <p className="mt-1 text-sm text-red-600">{errors.type}</p>
        )}
      </div>

      {/* Location */}
      <div>
        <label htmlFor="org-location" className="block text-sm font-medium text-gray-700 mb-1">
          Location *
        </label>
        <input
          type="text"
          id="org-location"
          name="location"
          value={organizationDetails.location}
          onChange={handleInputChange}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-gray-900 focus:bg-gray-50 transition-all duration-200 ${
            errors.location ? 'border-red-500 focus:border-red-500' : 'border-gray-300'
          }`}
          placeholder="City, State, Country"
        />
        {errors.location && (
          <p className="mt-1 text-sm text-red-600">{errors.location}</p>
        )}
      </div>

      {/* Website */}
      <div>
        <label htmlFor="org-website" className="block text-sm font-medium text-gray-700 mb-1">
          Website
        </label>
        <input
          type="url"
          id="org-website"
          name="website"
          value={organizationDetails.website}
          onChange={handleInputChange}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-gray-900 focus:bg-gray-50 transition-all duration-200 ${
            errors.website ? 'border-red-500 focus:border-red-500' : 'border-gray-300'
          }`}
          placeholder="https://your-organization.com"
        />
        {errors.website && (
          <p className="mt-1 text-sm text-red-600">{errors.website}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="org-description" className="block text-sm font-medium text-gray-700 mb-1">
          Brief Description *
        </label>
        <textarea
          id="org-description"
          name="description"
          rows={3}
          value={organizationDetails.description}
          onChange={handleInputChange}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-gray-900 focus:bg-gray-50 transition-all duration-200 resize-none ${
            errors.description ? 'border-red-500 focus:border-red-500' : 'border-gray-300'
          }`}
          placeholder="Brief description of your organization..."
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Provide a brief description of your organization&apos;s mission and activities
        </p>
      </div>

      {/* Address */}
      <div>
        <label htmlFor="org-address" className="block text-sm font-medium text-gray-700 mb-1">
          Address *
        </label>
        <textarea
          id="org-address"
          name="address"
          rows={2}
          value={organizationDetails.address}
          onChange={handleInputChange}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-gray-900 focus:bg-gray-50 transition-all duration-200 resize-none ${
            errors.address ? 'border-red-500 focus:border-red-500' : 'border-gray-300'
          }`}
          placeholder="Full address of your organization"
        />
        {errors.address && (
          <p className="mt-1 text-sm text-red-600">{errors.address}</p>
        )}
      </div>

      {/* Contact Email */}
      <div>
        <label htmlFor="org-contact-email" className="block text-sm font-medium text-gray-700 mb-1">
          Contact Email *
        </label>
        <input
          type="email"
          id="org-contact-email"
          name="contact_email"
          value={organizationDetails.contact_email}
          onChange={handleInputChange}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-gray-900 focus:bg-gray-50 transition-all duration-200 ${
            errors.contact_email ? 'border-red-500 focus:border-red-500' : 'border-gray-300'
          }`}
          placeholder="contact@your-organization.com"
        />
        {errors.contact_email && (
          <p className="mt-1 text-sm text-red-600">{errors.contact_email}</p>
        )}
      </div>

      {/* Contact Phone */}
      <div>
        <label htmlFor="org-contact-phone" className="block text-sm font-medium text-gray-700 mb-1">
          Contact Phone *
        </label>
        <input
          type="tel"
          id="org-contact-phone"
          name="contact_phone"
          value={organizationDetails.contact_phone}
          onChange={handleInputChange}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-gray-900 focus:bg-gray-50 transition-all duration-200 ${
            errors.contact_phone ? 'border-red-500 focus:border-red-500' : 'border-gray-300'
          }`}
          placeholder="+1 (555) 123-4567"
        />
        {errors.contact_phone && (
          <p className="mt-1 text-sm text-red-600">{errors.contact_phone}</p>
        )}
      </div>

      {/* Logo Upload */}
      <div>
        <label htmlFor="org-logo" className="block text-sm font-medium text-gray-700 mb-1">
          Organization Logo
        </label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-gray-400 transition-colors">
          <div className="space-y-1 text-center">
            {organizationDetails.logo ? (
              <div className="flex flex-col items-center">
                <Image
                  src={URL.createObjectURL(organizationDetails.logo)}
                  alt="Logo preview"
                  width={80}
                  height={80}
                  className="h-20 w-20 object-contain rounded-lg"
                />
                <p className="text-sm text-gray-600 mt-2">{organizationDetails.logo.name}</p>
                <button
                  type="button"
                  onClick={() => onChange({ ...organizationDetails, logo: null })}
                  className="text-sm text-red-600 hover:text-red-500 mt-1"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="flex text-sm text-gray-600">
                  <label htmlFor="org-logo" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                    <span>Upload a file</span>
                    <input
                      id="org-logo"
                      name="logo"
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      onChange={handleInputChange}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
              </div>
            )}
          </div>
        </div>
        {errors.logo && (
          <p className="mt-1 text-sm text-red-600">{errors.logo}</p>
        )}
      </div>

      {/* LinkedIn URL */}
      <div>
        <label htmlFor="org-linkedin" className="block text-sm font-medium text-gray-700 mb-1">
          LinkedIn URL
        </label>
        <input
          type="url"
          id="org-linkedin"
          name="linkedin_url"
          value={organizationDetails.linkedin_url || ''}
          onChange={handleInputChange}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-gray-900 focus:bg-gray-50 transition-all duration-200 ${
            errors.linkedin_url ? 'border-red-500 focus:border-red-500' : 'border-gray-300'
          }`}
          placeholder="https://linkedin.com/company/your-organization"
        />
        {errors.linkedin_url && (
          <p className="mt-1 text-sm text-red-600">{errors.linkedin_url}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Optional: Your organization&apos;s LinkedIn company page
        </p>
      </div>
    </div>
  );
}
