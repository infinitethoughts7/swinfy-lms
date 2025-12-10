"use client";

import { useState, useEffect, useCallback } from 'react';
import { Users, Search, Plus, Edit, Trash2, Eye, X, Save } from 'lucide-react';
import { userApi, InstructorListItem } from '@/lib/api';
import Link from 'next/link';

export default function InstructorsPage() {
  const [instructors, setInstructors] = useState<InstructorListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [editModal, setEditModal] = useState<{ isOpen: boolean; instructor: InstructorListItem | null }>({
    isOpen: false,
    instructor: null
  });
  const [editForm, setEditForm] = useState({
    full_name: '',
    email: '',
    title: '',
    specializations: '',
    technologies: '',
    years_of_experience: 0,
    is_available: true,
    is_active: true
  });
  const [saving, setSaving] = useState(false);

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
          full_name: 'Sathish Kumar',
          email: 'sathish@example.com',
          title: 'Data Scientist',
          specializations: 'Data Science, Machine Learning',
          technologies: 'Python, R, TensorFlow, SQL',
          years_of_experience: 5,
          is_available: true,
          is_active: true,
          is_approved: true,
        },
        {
          id: '2',
          full_name: 'Rani Sharma',
          email: 'rani@example.com',
          title: 'Business Navigation Manager',
          specializations: 'Entrepreneurship Skills, Business Analysis',
          technologies: 'Business Intelligence, Analytics',
          years_of_experience: 8,
          is_available: true,
          is_active: true,
          is_approved: true,
        },
        {
          id: '3',
          full_name: 'Shirisha Patel',
          email: 'shirisha@example.com',
          title: 'Business Analyst',
          specializations: 'Business Insights, Data Analysis',
          technologies: 'Excel, Power BI, SQL',
          years_of_experience: 6,
          is_available: false,
          is_active: true,
          is_approved: true,
        },
        {
          id: '4',
          full_name: 'Sowkya Reddy',
          email: 'sowkya@example.com',
          title: 'Technical Analyst',
          specializations: 'Technical Skills, System Analysis',
          technologies: 'Java, Spring Boot, Microservices',
          years_of_experience: 4,
          is_available: true,
          is_active: true,
          is_approved: true,
        },
        {
          id: '5',
          full_name: 'Pravalika Singh',
          email: 'pravalika@example.com',
          title: 'Wellness and Life Skills Lecturer',
          specializations: 'Life Skills, Career Guidance',
          technologies: 'Soft Skills, Communication',
          years_of_experience: 7,
          is_available: true,
          is_active: true,
          is_approved: true,
        },
        {
          id: '6',
          full_name: 'Shivani Gupta',
          email: 'shivani@example.com',
          title: 'Data Analyst',
          specializations: 'Technical Skills, Data Visualization',
          technologies: 'Python, Tableau, Statistics',
          years_of_experience: 3,
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

  const openEditModal = (instructor: InstructorListItem) => {
    setEditForm({
      full_name: instructor.full_name || '',
      email: instructor.email || '',
      title: instructor.title || '',
      specializations: instructor.specializations || '',
      technologies: instructor.technologies || '',
      years_of_experience: instructor.years_of_experience || 0,
      is_available: instructor.is_available || false,
      is_active: instructor.is_active || false
    });
    setEditModal({ isOpen: true, instructor });
  };

  const closeEditModal = () => {
    setEditModal({ isOpen: false, instructor: null });
    setEditForm({
      full_name: '',
      email: '',
      title: '',
      specializations: '',
      technologies: '',
      years_of_experience: 0,
      is_available: true,
      is_active: true
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModal.instructor) return;

    try {
      setSaving(true);
      
      // Transform form data to match backend API expectations
      const updateData = {
        user_email: editForm.email,
        user_full_name: editForm.full_name,
        title: editForm.title,
        specializations: editForm.specializations,
        technologies: editForm.technologies,
        years_of_experience: editForm.years_of_experience,
        is_available: editForm.is_available,
        // Note: is_active is not supported in the update serializer
      };
      
      const updatedInstructor = await userApi.instructors.update(editModal.instructor.id, updateData);
      
      setInstructors(prev => 
        prev.map(instructor => 
          instructor.id === editModal.instructor!.id ? updatedInstructor : instructor
        )
      );
      
      closeEditModal();
      // Refresh the list to get the latest data
      await fetchInstructors();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update instructor');
    } finally {
      setSaving(false);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Instructors</h1>
          <p className="text-gray-600 text-sm">Manage your knowledge partner instructors</p>
        </div>
        <Link
          href="/dashboard/kp/instructors/add"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Instructor
        </Link>
      </div>

      {/* Search and Stats */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search instructors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-xl font-bold text-gray-900">{instructors.length}</div>
              <div className="text-xs text-gray-600">Total</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-green-600">
                {instructors.filter(i => i.is_active).length}
              </div>
              <div className="text-xs text-gray-600">Active</div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-red-700 ml-2">{error}</span>
          </div>
        </div>
      )}

      {/* Instructors Table */}
      {filteredInstructors.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No instructors found</h3>
          <p className="text-gray-600 mb-4 text-sm">
            {searchTerm 
              ? "Try adjusting your search"
              : "Get started by adding your first instructor"
            }
          </p>
          <Link
            href="/dashboard/kp/instructors/add"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Instructor
          </Link>
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
                  Title
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                  Experience
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInstructors.map((instructor) => (
                <tr key={instructor.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                        {(instructor.full_name || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{instructor.full_name || 'Unknown'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-600">{instructor.email}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap hidden md:table-cell">
                    <div className="text-sm text-gray-600">{instructor.title || '-'}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap hidden lg:table-cell">
                    <div className="text-sm text-gray-600">
                      {instructor.years_of_experience ? `${instructor.years_of_experience} years` : '-'}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      instructor.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {instructor.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end space-x-1">
                      <Link
                        href={`/dashboard/kp/instructors/${instructor.id}`}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="View details"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => openEditModal(instructor)}
                        className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                        title="Edit instructor"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(instructor.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete instructor"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      {editModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Edit Instructor</h3>
              <button
                onClick={closeEditModal}
                className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleEditSubmit} className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editForm.full_name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, full_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    required
                  />
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="e.g., Data Scientist"
                  />
                </div>

                {/* Years of Experience */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
                  <input
                    type="number"
                    min="0"
                    value={editForm.years_of_experience}
                    onChange={(e) => setEditForm(prev => ({ ...prev, years_of_experience: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>

              {/* Specializations */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Specializations</label>
                <input
                  type="text"
                  value={editForm.specializations}
                  onChange={(e) => setEditForm(prev => ({ ...prev, specializations: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="e.g., Data Science, Machine Learning"
                />
              </div>

              {/* Technologies */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Technologies</label>
                <input
                  type="text"
                  value={editForm.technologies}
                  onChange={(e) => setEditForm(prev => ({ ...prev, technologies: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="e.g., Python, R, TensorFlow, SQL"
                />
              </div>

              {/* Status Toggles */}
              <div className="flex items-center space-x-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editForm.is_available}
                    onChange={(e) => setEditForm(prev => ({ ...prev, is_available: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Available for Teaching</span>
                </label>
                <div className="text-xs text-gray-500">
                  <span className="font-medium">Note:</span> User activation status can only be changed by admin
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm disabled:opacity-50 flex items-center"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Instructor</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this instructor? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
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