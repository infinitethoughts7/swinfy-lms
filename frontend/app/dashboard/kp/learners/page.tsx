"use client";

import { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { authenticatedFetch, isAuthenticated, logout } from '@/lib/auth';

interface LearnerProfile {
  bio: string | null;
  profile_picture: string | null;
  phone_number: string | null;
  learning_goals: string | null;
  interests: string | null;
  created_at: string | null;
  updated_at: string | null;
}

interface Enrollment {
  id: string;
  course_title: string;
  course_slug: string;
  status: string;
  enrollment_date: string;
  progress_percentage: number;
  payment_status: string;
  amount_paid: string;
  overall_progress?: string;
  lessons_completed?: number;
  total_lessons?: number;
  last_activity?: string;
}

interface Learner {
  id: string;
  email: string;
  full_name: string;
  is_verified: boolean;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
  profile: LearnerProfile;
  enrollments: Enrollment[];
  total_enrollments: number;
  active_enrollments: number;
  completed_enrollments: number;
}

export default function KPLearnersPage() {
  const [learners, setLearners] = useState<Learner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!isAuthenticated()) {
      logout();
      return;
    }
    fetchLearners();
  }, []);

  const fetchLearners = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authenticatedFetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/kp/learners/`, {
        method: 'GET',
      });

      if (response.ok) {
        const data = await response.json();
        // Handle both array response and object with results/learners key
        const learnersList = Array.isArray(data) ? data : (data.results || data.learners || []);
        setLearners(learnersList);
      } else {
        throw new Error('Failed to fetch learners');
      }
    } catch (err) {
      console.error('Error fetching learners:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch learners');
    } finally {
      setLoading(false);
    }
  };

  const filteredLearners = (Array.isArray(learners) ? learners : []).filter(learner =>
    learner.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    learner.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (learner.profile?.phone_number && learner.profile.phone_number.includes(searchTerm)) ||
    (learner.enrollments || []).some(enrollment => 
      enrollment.course_title?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={fetchLearners}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Our Learners</h1>
          <p className="text-gray-600 text-sm">Manage and view learners in your organization</p>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <Users className="h-5 w-5" />
          <span className="font-medium">{filteredLearners.length} learners</span>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search by name, email, phone, or course..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* Learners Table */}
      {filteredLearners.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No learners found</h3>
          <p className="text-gray-600 text-sm">
            {learners.length === 0 
              ? 'Learners will appear here once they enroll in your courses'
              : 'Try adjusting your search terms'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  Phone
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                  Joined
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLearners.map((learner) => (
                <tr key={learner.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                        {(learner.full_name || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900 flex items-center gap-1">
                          {learner.full_name || 'Unknown'}
                          {learner.is_verified && (
                            <CheckCircle className="h-3 w-3 text-green-500" />
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-600">{learner.email}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap hidden md:table-cell">
                    <div className="text-sm text-gray-600">
                      {learner.profile?.phone_number || '-'}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap hidden lg:table-cell">
                    <div className="text-sm text-gray-600">{formatDate(learner.created_at)}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}
