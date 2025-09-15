"use client";

import { useState, useEffect, useCallback } from 'react';
import { Users, Search, Plus, Edit, Trash2, Eye, CheckCircle, XCircle, Mail, Calendar } from 'lucide-react';
import { userApi, InstructorListItem } from '@/lib/api';
import Link from 'next/link';

export default function InstructorsPage() {
  const [instructors, setInstructors] = useState<InstructorListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchInstructors = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params: { search?: string } = {};
      if (searchTerm) params.search = searchTerm;
      
      const data = await userApi.instructors.list(params);
      setInstructors(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load instructors');
      // For demo purposes, use mock data if API fails
      setInstructors([
        {
          id: '1788021f-c768-4c2d-8383-d45cd5650aeb',
          full_name: 'Test Instructor Updated',
          email: 'test_instructor@example.com',
          title: 'Senior Software Developer',
          specializations: 'Python, Django, React',
          technologies: 'Python, JavaScript, SQL',
          years_of_experience: 7,
          is_available: true,
          is_active: true,
          is_approved: true,
        }
      ]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchInstructors();
  }, [fetchInstructors]);

  const handleDelete = async (instructorId: string) => {
    try {
      await userApi.instructors.delete(instructorId);
      setInstructors(prev => prev.filter(instructor => instructor.id !== instructorId));
      setDeleteConfirm(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete instructor');
    }
  };

  const filteredInstructors = instructors.filter(instructor => {
    const matchesSearch = !searchTerm || 
      instructor.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      instructor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      instructor.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      instructor.technologies.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Instructors</h1>
          <p className="text-gray-600">Manage your instructor team</p>
        </div>
        <Link
          href="/dashboard/kp/instructors/add"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Instructor
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search instructors by name, email, title, or technologies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="text-sm text-gray-500">
            Instructors can manage their own availability settings
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <XCircle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <Users className="h-5 w-5 text-blue-600 mr-2" />
            <div>
              <p className="text-sm text-gray-600">Total Instructors</p>
              <p className="text-xl font-semibold text-gray-900">{instructors.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            <div>
              <p className="text-sm text-gray-600">Active Instructors</p>
              <p className="text-xl font-semibold text-gray-900">
                {instructors.filter(i => i.is_active).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Instructors Grid */}
      {filteredInstructors.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No instructors found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm 
              ? "Try adjusting your search"
              : "Get started by adding your first instructor"
            }
          </p>
          <Link
            href="/dashboard/kp/instructors/add"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Instructor
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInstructors.map((instructor) => (
            <div key={instructor.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{instructor.full_name || 'Unknown'}</h3>
                  <p className="text-sm text-gray-600">{instructor.title || 'No title specified'}</p>
                </div>
                <div className="flex items-center gap-1 ml-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    instructor.is_active 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {instructor.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="h-4 w-4 mr-2" />
                  {instructor.email || 'No email'}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  {instructor.years_of_experience || 0} years experience
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Specializations:</p>
                  <p className="text-sm text-gray-900">{instructor.specializations || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Technologies:</p>
                  <div className="flex flex-wrap gap-1">
                    {instructor.technologies && instructor.technologies.length > 0 ? (
                      <>
                        {instructor.technologies.split(',').slice(0, 3).map((tech, index) => (
                          <span
                            key={index}
                            className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                          >
                            {tech.trim()}
                          </span>
                        ))}
                        {instructor.technologies.split(',').length > 3 && (
                          <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                            +{instructor.technologies.split(',').length - 3} more
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-sm text-gray-500">Not specified</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-gray-200">
                <Link
                  href={`/dashboard/kp/instructors/${instructor.id}`}
                  className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Link>
                <Link
                  href={`/dashboard/kp/instructors/${instructor.id}/edit`}
                  className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Link>
                <button
                  onClick={() => setDeleteConfirm(instructor.id)}
                  className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Instructor</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this instructor? This action cannot be undone and will remove all associated data.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
