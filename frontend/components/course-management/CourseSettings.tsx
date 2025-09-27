'use client';

import { useState } from 'react';
import { DollarSign, Clock, Target, Globe, Users, Award, Settings } from 'lucide-react';

interface CourseSettingsProps {
  courseOutline: any;
  tutorAssignments: any[];
  onSettingsComplete: (settings: CourseSettings) => void;
}

interface CourseSettings {
  pricing: {
    basePrice: number;
    currency: string;
    discountPercentage?: number;
    earlyBirdPrice?: number;
    earlyBirdEndDate?: string;
    groupDiscount?: {
      minStudents: number;
      discountPercentage: number;
    };
  };
  duration: {
    totalWeeks: number;
    hoursPerWeek: number;
    totalHours: number;
    schedule: {
      startDate: string;
      endDate: string;
      classDays: string[];
      classTime: string;
      timezone: string;
    };
  };
  difficulty: {
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    prerequisites: string[];
    skillsGained: string[];
    certification: {
      provided: boolean;
      type?: string;
      requirements?: string[];
    };
  };
  enrollment: {
    maxStudents: number;
    minStudents: number;
    enrollmentDeadline: string;
    requirements: string[];
  };
  marketing: {
    tags: string[];
    featured: boolean;
    category: string;
    language: string;
  };
}

export default function CourseSettings({ courseOutline, tutorAssignments, onSettingsComplete }: CourseSettingsProps) {
  const [settings, setSettings] = useState<CourseSettings>({
    pricing: {
      basePrice: 0,
      currency: 'USD',
      discountPercentage: 0,
      earlyBirdPrice: 0,
      earlyBirdEndDate: '',
      groupDiscount: {
        minStudents: 0,
        discountPercentage: 0
      }
    },
    duration: {
      totalWeeks: 0,
      hoursPerWeek: 0,
      totalHours: 0,
      schedule: {
        startDate: '',
        endDate: '',
        classDays: [],
        classTime: '',
        timezone: 'UTC+5:30'
      }
    },
    difficulty: {
      level: 'beginner',
      prerequisites: courseOutline.prerequisites || [],
      skillsGained: [],
      certification: {
        provided: false,
        type: '',
        requirements: []
      }
    },
    enrollment: {
      maxStudents: 0,
      minStudents: 0,
      enrollmentDeadline: '',
      requirements: []
    },
    marketing: {
      tags: [],
      featured: false,
      category: '',
      language: 'English'
    }
  });

  const updateSettings = (section: keyof CourseSettings, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const updateNestedSettings = (section: keyof CourseSettings, subsection: string, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subsection]: {
          ...(prev[section] as any)[subsection],
          [field]: value
        }
      }
    }));
  };

  const addArrayItem = (section: keyof CourseSettings, field: string, value: string) => {
    if (!value.trim()) return;
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: [...(prev[section] as any)[field], value.trim()]
      }
    }));
  };

  const removeArrayItem = (section: keyof CourseSettings, field: string, index: number) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: (prev[section] as any)[field].filter((_: any, i: number) => i !== index)
      }
    }));
  };

  const calculateEndDate = (startDate: string, weeks: number) => {
    if (!startDate) return '';
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + (weeks * 7));
    return end.toISOString().split('T')[0];
  };

  const handleStartDateChange = (startDate: string) => {
    updateNestedSettings('duration', 'schedule', 'startDate', startDate);
    const endDate = calculateEndDate(startDate, settings.duration.totalWeeks);
    updateNestedSettings('duration', 'schedule', 'endDate', endDate);
  };

  const handleWeeksChange = (weeks: number) => {
    updateSettings('duration', 'totalWeeks', weeks);
    updateSettings('duration', 'totalHours', weeks * settings.duration.hoursPerWeek);
    
    if (settings.duration.schedule.startDate) {
      const endDate = calculateEndDate(settings.duration.schedule.startDate, weeks);
      updateNestedSettings('duration', 'schedule', 'endDate', endDate);
    }
  };

  const handleHoursPerWeekChange = (hours: number) => {
    updateSettings('duration', 'hoursPerWeek', hours);
    updateSettings('duration', 'totalHours', settings.duration.totalWeeks * hours);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Course Settings & Configuration</h3>
        <p className="text-sm text-gray-600">Configure pricing, duration, difficulty, and enrollment settings</p>
      </div>

      <div className="space-y-8">
        {/* Pricing Settings */}
        <div>
          <div className="flex items-center mb-4">
            <DollarSign className="w-5 h-5 text-green-600 mr-2" />
            <h4 className="text-lg font-medium text-gray-900">Pricing Configuration</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Base Price</label>
              <div className="flex">
                <select
                  value={settings.pricing.currency}
                  onChange={(e) => updateSettings('pricing', 'currency', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-l-lg border-r-0 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="USD">$</option>
                  <option value="EUR">€</option>
                  <option value="GBP">£</option>
                  <option value="INR">₹</option>
                </select>
                <input
                  type="text"
                  value={settings.pricing.basePrice === 0 ? '' : settings.pricing.basePrice.toString()}
                  onChange={(e) => {
                    let rawValue = e.target.value.replace(/[^0-9]/g, ''); // Only allow numbers
                    
                    // Handle the case where user types a non-zero digit when field shows 0
                    // If the current field value starts with 0 and user adds a non-zero digit, remove the leading zero
                    if (rawValue.length > 1 && rawValue.startsWith('0')) {
                      rawValue = rawValue.substring(1); // Remove the leading zero
                    }
                    
                    // Remove any other leading zeros (for cases like 00123 -> 123)
                    if (rawValue.length > 1) {
                      rawValue = rawValue.replace(/^0+/, '');
                    }
                    
                    // Update the state
                    if (rawValue === '' || rawValue === '0') {
                      updateSettings('pricing', 'basePrice', 0);
                    } else {
                      updateSettings('pricing', 'basePrice', parseInt(rawValue));
                    }
                  }}
                  onFocus={(e) => {
                    if (settings.pricing.basePrice === 0) {
                      // Clear the field when focusing on zero value
                      updateSettings('pricing', 'basePrice', 0);
                    }
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter amount"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Early Bird Discount (%)</label>
              <input
                type="number"
                value={settings.pricing.discountPercentage || 0}
                onChange={(e) => updateSettings('pricing', 'discountPercentage', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="20"
                min="0"
                max="100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Early Bird End Date</label>
              <input
                type="date"
                value={settings.pricing.earlyBirdEndDate || ''}
                onChange={(e) => updateSettings('pricing', 'earlyBirdEndDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h5 className="font-medium text-gray-900 mb-2">Group Discount</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Students</label>
                <input
                  type="number"
                  value={settings.pricing.groupDiscount?.minStudents || 0}
                  onChange={(e) => updateNestedSettings('pricing', 'groupDiscount', 'minStudents', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount (%)</label>
                <input
                  type="number"
                  value={settings.pricing.groupDiscount?.discountPercentage || 0}
                  onChange={(e) => updateNestedSettings('pricing', 'groupDiscount', 'discountPercentage', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Duration Settings */}
        <div>
          <div className="flex items-center mb-4">
            <Clock className="w-5 h-5 text-blue-600 mr-2" />
            <h4 className="text-lg font-medium text-gray-900">Duration & Schedule</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Total Weeks</label>
              <input
                type="number"
                value={settings.duration.totalWeeks}
                onChange={(e) => handleWeeksChange(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="1"
                max="52"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hours per Week</label>
              <input
                type="number"
                value={settings.duration.hoursPerWeek}
                onChange={(e) => handleHoursPerWeekChange(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="1"
                max="40"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={settings.duration.schedule.startDate}
                onChange={(e) => handleStartDateChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={settings.duration.schedule.endDate}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
              />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Class Days</label>
              <div className="space-y-2">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                  <label key={day} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.duration.schedule.classDays.includes(day)}
                      onChange={(e) => {
                        const newDays = e.target.checked
                          ? [...settings.duration.schedule.classDays, day]
                          : settings.duration.schedule.classDays.filter(d => d !== day);
                        updateNestedSettings('duration', 'schedule', 'classDays', newDays);
                      }}
                      className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{day}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Class Time</label>
                <input
                  type="time"
                  value={settings.duration.schedule.classTime}
                  onChange={(e) => updateNestedSettings('duration', 'schedule', 'classTime', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                <select
                  value={settings.duration.schedule.timezone}
                  onChange={(e) => updateNestedSettings('duration', 'schedule', 'timezone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="UTC+5:30">UTC+5:30 (IST)</option>
                  <option value="UTC+0">UTC+0 (GMT)</option>
                  <option value="UTC-5">UTC-5 (EST)</option>
                  <option value="UTC-8">UTC-8 (PST)</option>
                  <option value="UTC+1">UTC+1 (CET)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Difficulty Settings */}
        <div>
          <div className="flex items-center mb-4">
            <Target className="w-5 h-5 text-purple-600 mr-2" />
            <h4 className="text-lg font-medium text-gray-900">Difficulty & Prerequisites</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty Level</label>
              <select
                value={settings.difficulty.level}
                onChange={(e) => updateSettings('difficulty', 'level', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Certification</label>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.difficulty.certification.provided}
                  onChange={(e) => updateNestedSettings('difficulty', 'certification', 'provided', e.target.checked)}
                  className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Provide certificate upon completion</span>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Skills Gained</label>
            <div className="space-y-2">
              {settings.difficulty.skillsGained.map((skill, index) => (
                <div key={index} className="flex items-center">
                  <input
                    type="text"
                    value={skill}
                    onChange={(e) => {
                      const newSkills = [...settings.difficulty.skillsGained];
                      newSkills[index] = e.target.value;
                      updateSettings('difficulty', 'skillsGained', newSkills);
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., React Hooks, State Management"
                  />
                  <button
                    onClick={() => removeArrayItem('difficulty', 'skillsGained', index)}
                    className="ml-2 p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                onClick={() => addArrayItem('difficulty', 'skillsGained', '')}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                + Add Skill
              </button>
            </div>
          </div>
        </div>

        {/* Enrollment Settings */}
        <div>
          <div className="flex items-center mb-4">
            <Users className="w-5 h-5 text-orange-600 mr-2" />
            <h4 className="text-lg font-medium text-gray-900">Enrollment Settings</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Students</label>
              <input
                type="number"
                value={settings.enrollment.maxStudents}
                onChange={(e) => updateSettings('enrollment', 'maxStudents', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="1"
                max="1000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Min Students</label>
              <input
                type="number"
                value={settings.enrollment.minStudents}
                onChange={(e) => updateSettings('enrollment', 'minStudents', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="1"
                max="100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Enrollment Deadline</label>
              <input
                type="date"
                value={settings.enrollment.enrollmentDeadline}
                onChange={(e) => updateSettings('enrollment', 'enrollmentDeadline', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Marketing Settings */}
        <div>
          <div className="flex items-center mb-4">
            <Globe className="w-5 h-5 text-indigo-600 mr-2" />
            <h4 className="text-lg font-medium text-gray-900">Marketing & Categories</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={settings.marketing.category}
                onChange={(e) => updateSettings('marketing', 'category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Category</option>
                <option value="Web Development">Web Development</option>
                <option value="Mobile Development">Mobile Development</option>
                <option value="Data Science">Data Science</option>
                <option value="Machine Learning">Machine Learning</option>
                <option value="DevOps">DevOps</option>
                <option value="Cybersecurity">Cybersecurity</option>
                <option value="UI/UX Design">UI/UX Design</option>
                <option value="Business">Business</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
              <select
                value={settings.marketing.language}
                onChange={(e) => updateSettings('marketing', 'language', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
                <option value="German">German</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Tags (Disabled)</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {settings.marketing.tags.map((tag, index) => (
                <span key={index} className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-500 text-sm rounded-full">
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex">
              <input
                type="text"
                placeholder="Tags are disabled..."
                disabled
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg bg-gray-50 text-gray-400 cursor-not-allowed"
              />
              <button
                disabled
                className="px-4 py-2 bg-gray-300 text-gray-500 rounded-r-lg cursor-not-allowed"
              >
                Add
              </button>
            </div>
          </div>

          <div className="mt-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.marketing.featured}
                onChange={(e) => updateSettings('marketing', 'featured', e.target.checked)}
                className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Feature this course on homepage</span>
            </label>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
        <button className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
          Cancel
        </button>
        <button
          onClick={() => onSettingsComplete(settings)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
}
