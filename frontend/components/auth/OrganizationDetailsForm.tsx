'use client';

import React from 'react';

interface OrganizationDetails {
  name: string;
  type: 'university' | 'company' | 'institute' | 'bootcamp';
  location: string;
  website: string;
  description: string;
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
    const { name, value } = e.target;
    onChange({
      ...organizationDetails,
      [name]: value
    });
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
          <option value="university">University</option>
          <option value="company">Company</option>
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
          Provide a brief description of your organization's mission and activities
        </p>
      </div>
    </div>
  );
}
