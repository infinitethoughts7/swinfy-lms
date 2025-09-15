"use client";

import { useState, useEffect } from 'react';
import { instructorApi, type Course, type Module, type Lesson } from '@/lib/api';
import { 
  Plus, Video, FileText, Edit, Trash2, GripVertical, 
  ChevronDown, ChevronRight, Play, Upload, Clock, Eye,
  Save, X, Check, AlertCircle
} from 'lucide-react';

interface ModulesLessonsManagerProps {
  course: Course;
  onUpdate: () => void;
}

interface ModuleWithLessons extends Module {
  lessons: Lesson[];
  isExpanded: boolean;
}

const ModulesLessonsManager = ({ course, onUpdate }: ModulesLessonsManagerProps) => {
  const [modules, setModules] = useState<ModuleWithLessons[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModule, setShowAddModule] = useState(false);
  const [editingModule, setEditingModule] = useState<string | null>(null);
  const [editingLesson, setEditingLesson] = useState<string | null>(null);

  useEffect(() => {
    fetchModules();
  }, [course.slug]);

  const fetchModules = async () => {
    try {
      setLoading(true);
      setError(null);
      const modulesData = await instructorApi.modules.list(course.slug);
      
      // Fetch lessons for each module
      const modulesWithLessons = await Promise.all(
        modulesData.map(async (module) => {
          try {
            const lessons = await instructorApi.lessons.list(course.slug, module.id);
            return {
              ...module,
              lessons: Array.isArray(lessons) ? lessons : [],
              isExpanded: false
            };
          } catch (err) {
            console.error(`Error fetching lessons for module ${module.id}:`, err);
            return {
              ...module,
              lessons: [],
              isExpanded: false
            };
          }
        })
      );
      
      setModules(modulesWithLessons);
    } catch (err) {
      console.error('Error fetching modules:', err);
      setError('Failed to load modules');
    } finally {
      setLoading(false);
    }
  };

  const toggleModuleExpansion = (moduleId: string) => {
    setModules(prev => 
      prev.map(module => 
        module.id === moduleId 
          ? { ...module, isExpanded: !module.isExpanded }
          : module
      )
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Modules</h3>
        <p className="text-gray-600 mb-6">{error}</p>
        <button
          onClick={fetchModules}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
          <h2 className="text-xl font-semibold text-gray-900">Course Content</h2>
          <p className="text-gray-600">Organize your course into modules and lessons</p>
        </div>
        <button
          onClick={() => setShowAddModule(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Module
        </button>
      </div>

      {/* Modules List */}
      {modules.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No modules yet</h3>
          <p className="text-gray-600 mb-6">Start building your course by adding your first module</p>
          <button
            onClick={() => setShowAddModule(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create First Module
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {modules.map((module, moduleIndex) => (
            <ModuleCard
              key={module.id}
              module={module}
              moduleIndex={moduleIndex}
              courseSlug={course.slug}
              onToggleExpansion={() => toggleModuleExpansion(module.id)}
              onUpdate={fetchModules}
              editingModule={editingModule}
              setEditingModule={setEditingModule}
              editingLesson={editingLesson}
              setEditingLesson={setEditingLesson}
            />
          ))}
        </div>
      )}

      {/* Add Module Modal */}
      {showAddModule && (
        <AddModuleModal
          courseSlug={course.slug}
          onClose={() => setShowAddModule(false)}
          onSuccess={() => {
            setShowAddModule(false);
            fetchModules();
          }}
          moduleCount={modules.length}
        />
      )}
    </div>
  );
};

interface ModuleCardProps {
  module: ModuleWithLessons;
  moduleIndex: number;
  courseSlug: string;
  onToggleExpansion: () => void;
  onUpdate: () => void;
  editingModule: string | null;
  setEditingModule: (id: string | null) => void;
  editingLesson: string | null;
  setEditingLesson: (id: string | null) => void;
}

const ModuleCard = ({ 
  module, 
  moduleIndex, 
  courseSlug, 
  onToggleExpansion, 
  onUpdate,
  editingModule,
  setEditingModule,
  editingLesson,
  setEditingLesson
}: ModuleCardProps) => {
  const [showAddLesson, setShowAddLesson] = useState(false);

  const handleDeleteModule = async () => {
    if (!confirm('Are you sure you want to delete this module and all its lessons?')) return;
    
    try {
      await instructorApi.modules.delete(module.id);
      onUpdate();
    } catch (err) {
      console.error('Error deleting module:', err);
      alert('Failed to delete module');
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Module Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center">
              <GripVertical className="h-4 w-4 text-gray-400 mr-2" />
              <span className="text-sm font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                Module {moduleIndex + 1}
              </span>
            </div>
            <button
              onClick={onToggleExpansion}
              className="flex items-center space-x-2 text-left"
            >
              {module.isExpanded ? (
                <ChevronDown className="h-4 w-4 text-gray-400" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-400" />
              )}
              <h3 className="text-lg font-semibold text-gray-900">{module.title}</h3>
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              {module.lessons.length} lesson{module.lessons.length !== 1 ? 's' : ''}
            </span>
            <span className="text-sm text-gray-500">•</span>
            <span className="text-sm text-gray-500">
              {Math.round((module.total_duration_minutes || 0) / 60)}h {(module.total_duration_minutes || 0) % 60}m
            </span>
            <button
              onClick={() => setEditingModule(module.id)}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={handleDeleteModule}
              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Module Content */}
      {module.isExpanded && (
        <div className="p-4 space-y-4">
          {/* Lessons */}
          {module.lessons.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <Video className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 mb-4">No lessons in this module yet</p>
              <button
                onClick={() => setShowAddLesson(true)}
                className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add First Lesson
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {module.lessons.map((lesson, lessonIndex) => (
                <LessonCard
                  key={lesson.id}
                  lesson={lesson}
                  lessonIndex={lessonIndex}
                  courseSlug={courseSlug}
                  moduleId={module.id}
                  onUpdate={onUpdate}
                  isEditing={editingLesson === lesson.id}
                  setEditing={setEditingLesson}
                />
              ))}
            </div>
          )}

          {/* Add Lesson Button */}
          <div className="flex justify-center pt-4 border-t border-gray-100">
            <button
              onClick={() => setShowAddLesson(true)}
              className="flex items-center px-4 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Lesson
            </button>
          </div>

          {/* Add Lesson Modal */}
          {showAddLesson && (
            <AddLessonModal
              courseSlug={courseSlug}
              moduleId={module.id}
              onClose={() => setShowAddLesson(false)}
              onSuccess={() => {
                setShowAddLesson(false);
                onUpdate();
              }}
              lessonCount={module.lessons.length}
            />
          )}
        </div>
      )}
    </div>
  );
};

interface LessonCardProps {
  lesson: Lesson;
  lessonIndex: number;
  courseSlug: string;
  moduleId: string;
  onUpdate: () => void;
  isEditing: boolean;
  setEditing: (id: string | null) => void;
}

const LessonCard = ({ 
  lesson, 
  lessonIndex, 
  courseSlug, 
  moduleId, 
  onUpdate, 
  isEditing, 
  setEditing 
}: LessonCardProps) => {
  const handleDeleteLesson = async () => {
    if (!confirm('Are you sure you want to delete this lesson?')) return;
    
    try {
      await instructorApi.lessons.delete(lesson.id);
      onUpdate();
    } catch (err) {
      console.error('Error deleting lesson:', err);
      alert('Failed to delete lesson');
    }
  };

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div className="flex items-center space-x-3">
        <GripVertical className="h-4 w-4 text-gray-400" />
        <span className="text-sm font-medium text-gray-500 bg-white px-2 py-1 rounded">
          {lessonIndex + 1}
        </span>
        <div className="flex items-center space-x-2">
          {lesson.lesson_type === 'video' ? (
            <Play className="h-4 w-4 text-blue-500" />
          ) : (
            <FileText className="h-4 w-4 text-green-500" />
          )}
          <span className="font-medium text-gray-900">{lesson.title}</span>
        </div>
        {lesson.duration_minutes && (
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="h-3 w-3 mr-1" />
            {lesson.duration_minutes}m
          </div>
        )}
        {lesson.is_preview && (
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Preview</span>
        )}
      </div>
      
      <div className="flex items-center space-x-2">
        <button
          onClick={() => setEditing(lesson.id)}
          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <Edit className="h-4 w-4" />
        </button>
        <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors">
          <Eye className="h-4 w-4" />
        </button>
        <button
          onClick={handleDeleteLesson}
          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

// Modal Components (simplified for now)
const AddModuleModal = ({ courseSlug, onClose, onSuccess, moduleCount }: {
  courseSlug: string;
  onClose: () => void;
  onSuccess: () => void;
  moduleCount: number;
}) => {
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setLoading(true);
      await instructorApi.modules.create(courseSlug, {
        title: title.trim(),
        order: moduleCount, // Use the current module count as the order
        is_published: false
      });
      onSuccess();
    } catch (err) {
      console.error('Error creating module:', err);
      alert('Failed to create module');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Module</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Module Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter module title..."
              required
            />
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
              disabled={loading || !title.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Module'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AddLessonModal = ({ courseSlug, moduleId, onClose, onSuccess, lessonCount }: {
  courseSlug: string;
  moduleId: string;
  onClose: () => void;
  onSuccess: () => void;
  lessonCount: number;
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    lesson_type: 'video' as 'video' | 'text' | 'assignment' | 'image_gallery' | 'mixed',
    content: '',
    is_preview: false,
    is_mandatory: true
  });
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    try {
      setLoading(true);
      await instructorApi.lessons.create(courseSlug, moduleId, {
        ...formData,
        order: lessonCount, // Use the current lesson count as the order
        is_published: false,
        video_file: videoFile
      });
      onSuccess();
    } catch (err) {
      console.error('Error creating lesson:', err);
      alert('Failed to create lesson');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Lesson</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lesson Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter lesson title..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lesson Type
            </label>
              <select
                value={formData.lesson_type}
                onChange={(e) => setFormData(prev => ({ ...prev, lesson_type: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="video">Video Lesson</option>
                <option value="text">Text Lesson</option>
                <option value="assignment">Assignment</option>
                <option value="image_gallery">Image Gallery</option>
                <option value="mixed">Mixed Content</option>
              </select>
          </div>

          {formData.lesson_type === 'video' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Video File
              </label>
              <input
                type="file"
                accept="video/*"
                onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              placeholder="Describe what students will learn in this lesson..."
            />
          </div>

          <div className="flex items-center space-x-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.is_preview}
                onChange={(e) => setFormData(prev => ({ ...prev, is_preview: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
              <span className="ml-2 text-sm text-gray-700">Free Preview</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.is_mandatory}
                onChange={(e) => setFormData(prev => ({ ...prev, is_mandatory: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
              <span className="ml-2 text-sm text-gray-700">Mandatory</span>
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
              {loading ? 'Creating...' : 'Create Lesson'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModulesLessonsManager;
