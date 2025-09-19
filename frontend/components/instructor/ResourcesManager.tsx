"use client";

import { useState, useEffect } from 'react';
import { instructorApi, type Course } from '@/lib/api';
import { 
  FileText, Download, Upload, Plus, Edit, Trash2, 
  AlertCircle, Save, X, Link as LinkIcon
} from 'lucide-react';

interface Resource {
  id: string;
  title: string;
  description?: string;
  resource_type: 'pdf' | 'video' | 'link' | 'document' | 'other';
  file?: string;
  url?: string;
  is_public: boolean;
  order: number;
  created_at: string;
}

interface ResourcesManagerProps {
  course: Course;
  onUpdate: () => void;
}

const ResourcesManager = ({ course, onUpdate }: ResourcesManagerProps) => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddResource, setShowAddResource] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);

  useEffect(() => {
    fetchResources();
  }, [course.slug]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      setError(null);
      const resourcesData = await instructorApi.resources.list(course.slug);
      setResources(resourcesData);
    } catch (err) {
      console.error('Error fetching resources:', err);
      setError('Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Course Resources</h2>
          <p className="text-gray-600">Manage downloadable files, links, and additional materials</p>
        </div>
        <button
          onClick={() => setShowAddResource(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Resource
        </button>
      </div>

      {/* Resources List */}
      {resources.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No resources yet</h3>
          <p className="text-gray-600 mb-6">Add downloadable files, links, or documents for your learners</p>
          <button
            onClick={() => setShowAddResource(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add First Resource
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} onUpdate={fetchResources} onEdit={() => setEditingResource(resource)} />
          ))}
        </div>
      )}

      {/* Add Resource Modal */}
      {showAddResource && (
        <AddResourceModal
          courseSlug={course.slug}
          onClose={() => setShowAddResource(false)}
          onSuccess={() => {
            setShowAddResource(false);
            fetchResources();
          }}
        />
      )}

      {/* Edit Resource Modal */}
      {editingResource && (
        <EditResourceModal
          resource={editingResource}
          onClose={() => setEditingResource(null)}
          onSuccess={() => {
            setEditingResource(null);
            fetchResources();
          }}
        />
      )}
    </div>
  );
};

const ResourceCard = ({ resource, onUpdate, onEdit }: { resource: Resource; onUpdate: () => void; onEdit: () => void }) => {
  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'pdf':
      case 'document':
      case 'reference':
        return <FileText className="h-6 w-6 text-red-500" />;
      case 'link':
        return <LinkIcon className="h-6 w-6 text-blue-500" />;
      default:
        return <FileText className="h-6 w-6 text-gray-500" />;
    }
  };

  const getFileUrl = (url?: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    return `${base}${url}`;
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this resource?')) return;
    
    try {
      await instructorApi.resources.delete(resource.id);
      onUpdate();
    } catch (err) {
      console.error('Error deleting resource:', err);
      alert('Failed to delete resource');
    }
  };

  const fileHref = getFileUrl(resource.file);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        {getResourceIcon(resource.resource_type)}
        <div className="flex space-x-2">
          <button onClick={onEdit} className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={handleDelete}
            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      <h3 className="font-semibold text-gray-900 mb-2">{resource.title}</h3>
      {resource.description && (
        <p className="text-sm text-gray-600 mb-4">{resource.description}</p>
      )}
      
      <div className="flex items-center justify-between">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          resource.is_public 
            ? 'bg-green-100 text-green-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {resource.is_public ? 'Public' : 'Learners Only'}
        </span>
        {resource.resource_type === 'link' && resource.url ? (
          <a href={resource.url} target="_blank" rel="noreferrer" className="flex items-center text-sm text-blue-600 hover:text-blue-700 transition-colors">
            <LinkIcon className="h-4 w-4 mr-1" />
            Open Link
          </a>
        ) : (
          resource.file ? (
            <a href={fileHref} target="_blank" rel="noreferrer" className="flex items-center text-sm text-blue-600 hover:text-blue-700 transition-colors">
              <Download className="h-4 w-4 mr-1" />
              Download
            </a>
          ) : (
            <span className="text-sm text-gray-500">No file</span>
          )
        )}
      </div>
    </div>
  );
};

const AddResourceModal = ({ courseSlug, onClose, onSuccess }: {
  courseSlug: string;
  onClose: () => void;
  onSuccess: () => void;
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    resource_type: 'pdf' as Resource['resource_type'],
    url: '',
    is_public: false
  });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    try {
      setLoading(true);
      await instructorApi.resources.create(courseSlug, { ...formData, file });
      onSuccess();
    } catch (err) {
      console.error('Error creating resource:', err);
      alert('Failed to create resource');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Resource</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Resource Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter resource title..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Resource Type
            </label>
            <select
              value={formData.resource_type}
              onChange={(e) => setFormData(prev => ({ ...prev, resource_type: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="pdf">PDF Document</option>
              <option value="document">Document</option>
              <option value="link">External Link</option>
              <option value="reference">Reference</option>
              <option value="other">Other</option>
            </select>
          </div>

          {formData.resource_type === 'link' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL
              </label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com"
                required
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                File Upload
              </label>
              <input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,.png,.jpg,.jpeg,.mp4,.mov,.avi"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe this resource..."
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_public"
              checked={formData.is_public}
              onChange={(e) => setFormData(prev => ({ ...prev, is_public: e.target.checked }))}
              className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
            <label htmlFor="is_public" className="ml-2 text-sm text-gray-700">
              Make this resource publicly available (visible to non-enrolled users)
            </label>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.title.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Resource'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const EditResourceModal = ({ resource, onClose, onSuccess }: {
  resource: Resource;
  onClose: () => void;
  onSuccess: () => void;
}) => {
  const [formData, setFormData] = useState({
    title: resource.title,
    description: resource.description || '',
    resource_type: resource.resource_type as Resource['resource_type'],
    url: resource.url || '',
    is_public: resource.is_public,
  });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    try {
      setLoading(true);
      await instructorApi.resources.update(resource.id, { 
        title: formData.title,
        description: formData.description,
        resource_type: formData.resource_type,
        url: formData.resource_type === 'link' ? formData.url : undefined,
        is_public: formData.is_public,
        ...(file ? { file } : {}),
      });
      onSuccess();
    } catch (err) {
      console.error('Error updating resource:', err);
      alert('Failed to update resource');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Resource</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Resource Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter resource title..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Resource Type
            </label>
            <select
              value={formData.resource_type}
              onChange={(e) => setFormData(prev => ({ ...prev, resource_type: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="pdf">PDF Document</option>
              <option value="document">Document</option>
              <option value="link">External Link</option>
              <option value="reference">Reference</option>
              <option value="other">Other</option>
            </select>
          </div>

          {formData.resource_type === 'link' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL
              </label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com"
                required
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Replace File (optional)
              </label>
              <input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,.png,.jpg,.jpeg,.mp4,.mov,.avi"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe this resource..."
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="edit_is_public"
              checked={formData.is_public}
              onChange={(e) => setFormData(prev => ({ ...prev, is_public: e.target.checked }))}
              className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
            <label htmlFor="edit_is_public" className="ml-2 text-sm text-gray-700">
              Make this resource publicly available (visible to non-enrolled users)
            </label>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.title.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResourcesManager;
