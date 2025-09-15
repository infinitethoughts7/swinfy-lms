"use client";

import { useState, useEffect, useCallback } from 'react';
import { Users, Search, Plus, Edit, Trash2, Eye, Mail, Calendar } from 'lucide-react';
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
      // Mock data for demo
      setInstructors([
        {
          id: '1',
          full_name: 'John Doe',
          email: 'john@example.com',
          title: 'Senior Developer',
          specializations: 'React, Node.js',
          technologies: 'JavaScript, TypeScript',
          years_of_experience: 5,
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Instructors</h1>
          <p className="text-gray-600 mt-1">Manage your knowledge partner instructors</p>
        </div>
        <Link
          href="/dashboard/kp/instructors/add"
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Instructor
        </Link>
      </div>

      {/* Search and Stats */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search instructors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-0 bg-gray-50 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
            />
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{instructors.length}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {instructors.filter(i => i.is_active).length}
              </div>
              <div className="text-sm text-gray-600">Active</div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center">
            <div className="text-red-600">⚠️</div>
            <span className="text-red-700 ml-2">{error}</span>
          </div>
        </div>
      )}

      {/* Instructors Grid */}
      {filteredInstructors.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">No instructors found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm 
              ? "Try adjusting your search"
              : "Get started by adding your first instructor"
            }
          </p>
          <Link
            href="/dashboard/kp/instructors/add"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Instructor
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInstructors.map((instructor) => (
            <div key={instructor.id} className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-all duration-200 group">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{instructor.full_name || 'Unknown'}</h3>
                  <p className="text-gray-600">{instructor.title || 'No title specified'}</p>
                </div>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                  instructor.is_active 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {instructor.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* Details */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="truncate">{instructor.email || 'No email'}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                  {instructor.years_of_experience || 0} years experience
                </div>
                
                <div>
                  <p className="text-xs text-gray-500 mb-1">Technologies</p>
                  <div className="flex flex-wrap gap-1">
                    {instructor.technologies && instructor.technologies.length > 0 ? (
                      instructor.technologies.split(',').slice(0, 2).map((tech, index) => (
                        <span
                          key={index}
                          className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-lg"
                        >
                          {tech.trim()}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-500">Not specified</span>
                    )}
                    {instructor.technologies && instructor.technologies.split(',').length > 2 && (
                      <span className="text-xs text-gray-500">
                        +{instructor.technologies.split(',').length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Link
                  href={`/dashboard/kp/instructors/${instructor.id}`}
                  className="flex-1 inline-flex items-center justify-center px-3 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Link>
                <Link
                  href={`/dashboard/kp/instructors/${instructor.id}/edit`}
                  className="flex-1 inline-flex items-center justify-center px-3 py-2 text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Link>
                <button
                  onClick={() => setDeleteConfirm(instructor.id)}
                  className="px-3 py-2 text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Instructor</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this instructor? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-4 py-2 text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors"
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