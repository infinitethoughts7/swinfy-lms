"use client";

import { useState, useEffect, useCallback } from 'react';
import { instructorApi, type Course, type Module, type Lesson } from '@/lib/api';
import { 
  Plus, Video, FileText, Edit, Trash2, GripVertical, 
  ChevronDown, ChevronRight, Play, Clock, Eye, AlertCircle, X
} from 'lucide-react';

interface ModulesLessonsManagerProps {
  course: Course;
}

interface ModuleWithLessons extends Module {
  lessons: Lesson[];
  isExpanded: boolean;
}

const ModulesLessonsManager = ({ course }: ModulesLessonsManagerProps) => {
  const [modules, setModules] = useState<ModuleWithLessons[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModule, setShowAddModule] = useState(false);
  const [editingModule, setEditingModule] = useState<string | null>(null);
  const [editingLesson, setEditingLesson] = useState<string | null>(null);
  const [previewLesson, setPreviewLesson] = useState<Lesson | null>(null);

  const fetchModules = useCallback(async () => {
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
  }, [course.slug]);

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  const toggleModuleExpansion = (moduleId: string) => {
    setModules(prev => 
      prev.map(module => 
        module.id === moduleId 
          ? { ...module, isExpanded: !module.isExpanded }
          : module
      )
    );
  };

  const handlePreviewLesson = async (lesson: Lesson) => {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      const res = await fetch(`${API_BASE_URL}/api/courses/instructor/lessons/${lesson.id}/`, {
        method: 'GET',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          'Content-Type': 'application/json',
        },
      });
      if (res.ok) {
        const data = await res.json();
        // Ensure video_file is present if available
        setPreviewLesson({ ...lesson, ...data });
      } else {
        // Fallback: open modal with existing lesson data
        setPreviewLesson(lesson);
      }
    } catch (e) {
      console.error('Failed to load lesson details for preview:', e);
      setPreviewLesson(lesson);
    }
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
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Course Content</h2>
            <p className="text-sm text-gray-600">Organize your course into modules and lessons</p>
          </div>
          <button
            onClick={() => setShowAddModule(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Module
          </button>
        </div>
      </div>

      {/* Modules List */}
      {modules.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="text-center py-8 px-4">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Video className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">No modules yet</h3>
            <p className="text-gray-600 mb-4 text-sm">Start building your course by adding your first module.</p>
            <button
              onClick={() => setShowAddModule(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <Plus className="h-4 w-4 mr-1" />
              Create First Module
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
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
              onPreviewLesson={handlePreviewLesson}
            />
          ))}
        </div>
      )}

      {/* Add Module Modal */}
      {showAddModule && (
        <AddModuleModal
          courseSlug={course.slug}
          modules={modules}
          onClose={() => setShowAddModule(false)}
          onSuccess={() => {
            setShowAddModule(false);
            fetchModules();
          }}
        />
      )}

      {/* Lesson Video Preview */}
      {previewLesson && (
        <PreviewLessonModal lesson={previewLesson} onClose={() => setPreviewLesson(null)} />
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
  onPreviewLesson: (lesson: Lesson) => void;
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
  setEditingLesson,
  onPreviewLesson
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
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* Module Header */}
      <div className="p-4 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center">
              <GripVertical className="h-4 w-4 text-gray-400 mr-2 cursor-move" />
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                Module {moduleIndex + 1}
              </span>
            </div>
            <button
              onClick={onToggleExpansion}
              className="flex items-center space-x-2 text-left hover:bg-white hover:bg-opacity-50 rounded p-1 -ml-1 transition-colors"
            >
              {module.isExpanded ? (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-500" />
              )}
              <h3 className="text-base font-bold text-gray-900">{module.title}</h3>
            </button>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 text-xs text-gray-600">
              <div className="flex items-center space-x-1">
                <Video className="h-3 w-3" />
                <span className="font-medium">{module.lessons.length} lesson{module.lessons.length !== 1 ? 's' : ''}</span>
              </div>
              <span className="text-gray-300">•</span>
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span className="font-medium">
                  {Math.round((module.total_duration_minutes || 0) / 60)}h {(module.total_duration_minutes || 0) % 60}m
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setEditingModule(module.id)}
                className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
              >
                <Edit className="h-3 w-3" />
              </button>
              <button
                onClick={handleDeleteModule}
                className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Module Modal */}
      {editingModule === module.id && (
        <EditModuleModal
          module={module}
          onClose={() => setEditingModule(null)}
          onSuccess={() => {
            setEditingModule(null);
            onUpdate();
          }}
        />
      )}

      {/* Module Content */}
      {module.isExpanded && (
        <div className="p-4 space-y-3 bg-gray-50">
          {/* Lessons */}
          {module.lessons.length === 0 ? (
            <div className="text-center py-6 bg-white rounded-lg border-2 border-dashed border-gray-200">
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <Video className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="text-base font-semibold text-gray-900 mb-1">No lessons yet</h4>
              <p className="text-gray-600 mb-4 text-sm">Add your first lesson to start building this module</p>
              <button
                onClick={() => setShowAddLesson(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add First Lesson
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {module.lessons.map((lesson, lessonIndex) => (
                <div key={lesson.id} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                  <LessonCard
                    lesson={lesson}
                    lessonIndex={lessonIndex}
                    onUpdate={onUpdate}
                    isEditing={editingLesson === lesson.id}
                    setEditing={setEditingLesson}
                    onPreview={onPreviewLesson}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Add Lesson Button */}
          <div className="flex justify-center pt-3 border-t border-gray-200">
            <button
              onClick={() => setShowAddLesson(true)}
              className="flex items-center px-4 py-2 text-blue-600 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors text-sm"
            >
              <Plus className="h-4 w-4 mr-1" />
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
  onUpdate: () => void;
  isEditing: boolean;
  setEditing: (id: string | null) => void;
  onPreview: (lesson: Lesson) => void;
}

const LessonCard = ({ 
  lesson, 
  lessonIndex, 
  onUpdate, 
  isEditing, 
  setEditing,
  onPreview
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
    <>
      <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
        <div className="flex items-center space-x-2">
          <GripVertical className="h-3 w-3 text-gray-400" />
          <span className="text-xs font-medium text-gray-500 bg-white px-1.5 py-0.5 rounded">
            {lessonIndex + 1}
          </span>
          <div className="flex items-center space-x-1">
            {lesson.lesson_type === 'video' ? (
              <Play className="h-3 w-3 text-blue-500" />
            ) : (
              <FileText className="h-3 w-3 text-green-500" />
            )}
            <span className="text-sm font-medium text-gray-900">{lesson.title}</span>
          </div>
          {lesson.duration_minutes && (
            <div className="flex items-center text-xs text-gray-500">
              <Clock className="h-3 w-3 mr-1" />
              {lesson.duration_minutes}m
            </div>
          )}
          {lesson.is_preview && (
            <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">Preview</span>
          )}
        </div>
        
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setEditing(lesson.id)}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Edit className="h-3 w-3" />
          </button>
          <button
            onClick={() => onPreview(lesson)}
            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
          >
            <Eye className="h-3 w-3" />
          </button>
          <button
            onClick={handleDeleteLesson}
            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Edit Lesson Modal */}
      {isEditing && (
        <EditLessonModal
          lesson={lesson}
          onClose={() => setEditing(null)}
          onSuccess={() => {
            setEditing(null);
            onUpdate();
          }}
        />
      )}
    </>
  );
};

// Modal Components (simplified for now)
const getMediaUrl = (url?: string) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  return `${base}${url}`;
};

const PreviewLessonModal = ({ lesson, onClose }: { lesson: Lesson; onClose: () => void }) => {
  const hasVideo = Boolean(lesson.video_file);
  const videoSrc = getMediaUrl(lesson.video_file);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-4 w-full max-w-4xl shadow-2xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">{lesson.title}</h3>
          <button onClick={onClose} className="p-2 rounded hover:bg-gray-100 text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        {hasVideo ? (
          <div className="aspect-video w-full bg-black rounded-lg overflow-hidden">
            <video src={videoSrc} controls autoPlay className="w-full h-full" />
          </div>
        ) : (
          <div className="p-6 text-center text-gray-600">
            <p>No video available for this lesson.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const AddModuleModal = ({ courseSlug, modules, onClose, onSuccess }: {
  courseSlug: string;
  modules: ModuleWithLessons[];
  onClose: () => void;
  onSuccess: () => void;
}) => {
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setLoading(true);
      // Calculate next order number based on existing modules
      const nextOrder = modules.length > 0 ? Math.max(...modules.map(m => m.order)) + 1 : 1;
      
      await instructorApi.modules.create(courseSlug, {
        title: title.trim(),
        order: nextOrder
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
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-2xl">
        <div className="text-center mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <Plus className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-1">Add New Module</h3>
          <p className="text-sm text-gray-600">Create a new module to organize your course content</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Module Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="e.g., Introduction to JavaScript"
              required
              autoFocus
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-semibold text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim()}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 font-semibold text-sm shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                  Creating...
                </div>
              ) : (
                'Create Module'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AddLessonModal = ({ courseSlug, moduleId, onClose, onSuccess }: {
  courseSlug: string;
  moduleId: string;
  onClose: () => void;
  onSuccess: () => void;
}) => {
  const [formData, setFormData] = useState({
    title: '',
    lesson_type: 'video' as 'video' | 'text' | 'quiz',
    content: '',
    is_preview: false,
    is_mandatory: true
  });
  const [videoFile, setVideoFile] = useState<File | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    try {
      setLoading(true);
      await instructorApi.lessons.create(courseSlug, moduleId, {
        ...formData,
        order: 0, // Will be set by backend based on existing lessons
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
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Video className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Add New Lesson</h3>
          <p className="text-gray-600">Create engaging content for your learners</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Lesson Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="e.g., Variables and Data Types"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Lesson Type
              </label>
              <select
                value={formData.lesson_type}
                onChange={(e) => setFormData(prev => ({ ...prev, lesson_type: e.target.value as 'video' | 'text' | 'quiz' }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="video">📹 Video Lesson</option>
              </select>
            </div>
          </div>

          {formData.lesson_type === 'video' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Video File
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => setVideoFile(e.target.files?.[0] || undefined)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
                <p className="text-sm text-gray-500 mt-2">Upload MP4, MOV, or AVI files</p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-center space-x-8 bg-gray-50 rounded-xl p-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_preview}
                onChange={(e) => setFormData(prev => ({ ...prev, is_preview: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 w-5 h-5"
              />
              <span className="ml-3 text-sm font-semibold text-gray-700">🆓 Free Preview</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_mandatory}
                onChange={(e) => setFormData(prev => ({ ...prev, is_mandatory: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 w-5 h-5"
              />
              <span className="ml-3 text-sm font-semibold text-gray-700">⭐ Mandatory</span>
            </label>
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.title.trim()}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 disabled:opacity-50 font-semibold shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </div>
              ) : (
                '✨ Create Lesson'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const EditModuleModal = ({ module, onClose, onSuccess }: {
  module: ModuleWithLessons;
  onClose: () => void;
  onSuccess: () => void;
}) => {
  const [title, setTitle] = useState(module.title);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setLoading(true);
      await instructorApi.modules.update(module.id, { title: title.trim() });
      onSuccess();
    } catch (err) {
      console.error('Error updating module:', err);
      alert('Failed to update module');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Edit Module</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Module Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter module title"
              required
              autoFocus
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const EditLessonModal = ({ lesson, onClose, onSuccess }: {
  lesson: Lesson;
  onClose: () => void;
  onSuccess: () => void;
}) => {
  const [formData, setFormData] = useState({
    title: lesson.title,
    lesson_type: lesson.lesson_type as 'video' | 'text' | 'quiz' | 'assignment' | 'live_session' | 'download',
    content: lesson.content || '',
    is_preview: lesson.is_preview,
    is_mandatory: lesson.is_mandatory,
    duration_minutes: lesson.duration_minutes || 0
  });
  const [videoFile, setVideoFile] = useState<File | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    try {
      setLoading(true);
      const updateData: Record<string, unknown> = {
        ...formData,
        video_file: videoFile
      };
      
      // Remove undefined values
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) {
          delete updateData[key];
        }
      });

      await instructorApi.lessons.update(lesson.id, updateData);
      onSuccess();
    } catch (err) {
      console.error('Error updating lesson:', err);
      alert('Failed to update lesson');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Edit className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Edit Lesson</h3>
          <p className="text-gray-600">Update your lesson content and settings</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Lesson Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="e.g., Variables and Data Types"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Lesson Type
              </label>
              <select
                value={formData.lesson_type}
                onChange={(e) => setFormData(prev => ({ ...prev, lesson_type: e.target.value as 'video' | 'text' | 'quiz' | 'assignment' | 'live_session' | 'download' }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="video">📹 Video Lesson</option>
                <option value="text">📝 Text Lesson</option>
                <option value="quiz">❓ Quiz</option>
                <option value="assignment">📋 Assignment</option>
                <option value="live_session">🔴 Live Session</option>
                <option value="download">📥 Download</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Duration (minutes)
              </label>
              <input
                type="number"
                min="0"
                value={formData.duration_minutes}
                onChange={(e) => setFormData(prev => ({ ...prev, duration_minutes: parseInt(e.target.value) || 0 }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="e.g., 30"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Content
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Lesson content or instructions..."
              />
            </div>
          </div>

          {formData.lesson_type === 'video' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Video File (optional - leave empty to keep current video)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => setVideoFile(e.target.files?.[0] || undefined)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
                <p className="text-sm text-gray-500 mt-2">Upload MP4, MOV, or AVI files</p>
                {lesson.video_file && (
                  <p className="text-xs text-blue-600 mt-1">Current video: {lesson.video_file}</p>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center justify-center space-x-8 bg-gray-50 rounded-xl p-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_preview}
                onChange={(e) => setFormData(prev => ({ ...prev, is_preview: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 w-5 h-5"
              />
              <span className="ml-3 text-sm font-semibold text-gray-700">🆓 Free Preview</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_mandatory}
                onChange={(e) => setFormData(prev => ({ ...prev, is_mandatory: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 w-5 h-5"
              />
              <span className="ml-3 text-sm font-semibold text-gray-700">⭐ Mandatory</span>
            </label>
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.title.trim()}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 font-semibold shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </div>
              ) : (
                '💾 Update Lesson'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModulesLessonsManager;
