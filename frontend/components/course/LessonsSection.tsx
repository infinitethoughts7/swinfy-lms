
import { useState } from 'react';

interface Lesson {
  id: string;
  title: string;
  description: string;
  slug: string;
  lesson_type: 'video' | 'text' | 'quiz' | 'assignment' | 'live_session' | 'download';
  order: number;
  duration_minutes: number;
  is_preview: boolean;
  is_published: boolean;
  content: string;
  video_url: string;
  video_file: string;
  attachment: string;
  materials_count: number;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

interface CourseModule {
  id: string;
  title: string;
  description: string;
  slug: string;
  order: number;
  duration_weeks: number;
  is_published: boolean;
  lessons_count: number;
  total_duration_minutes: number;
  created_at: string;
  updated_at: string;
}

interface LessonsSectionProps {
  modules: CourseModule[];
  lessons: { [moduleId: string]: Lesson[] };
}

const LessonsSection = ({ modules, lessons }: LessonsSectionProps) => {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [previewLesson, setPreviewLesson] = useState<Lesson | null>(null);

  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const getLessonIcon = (lessonType: string) => {
    switch (lessonType) {
      case 'video':
        return (
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
        );
      case 'text':
        return (
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        );
      case 'quiz':
        return (
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'assignment':
        return (
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
        );
      case 'live_session':
        return (
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        );
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const handleLessonClick = (lesson: Lesson) => {
    if (lesson.is_preview) {
      setPreviewLesson(lesson);
    }
  };

  const closePreview = () => {
    setPreviewLesson(null);
  };

  return (
    <>
      <div className="bg-white rounded-2xl p-8 border border-gray-200">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-sora font-bold text-text-primary">
            Course Curriculum
          </h2>
          <div className="text-sm text-gray-600">
            {modules.length} modules • {Object.values(lessons).flat().length} lessons
          </div>
        </div>

        <div className="space-y-4">
          {modules.map((module) => {
            const moduleLessons = lessons[module.id] || [];
            const isExpanded = expandedModules.has(module.id);
            const previewLessons = moduleLessons.filter(lesson => lesson.is_preview);
            const lockedLessons = moduleLessons.filter(lesson => !lesson.is_preview);

            return (
              <div key={module.id} className="border border-gray-200 rounded-xl overflow-hidden">
                {/* Module Header */}
                <div 
                  className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 cursor-pointer hover:from-blue-100 hover:to-indigo-100 transition-colors"
                  onClick={() => toggleModule(module.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <span className="text-lg font-bold text-blue-600">{module.order}</span>
                        </div>
                        <div>
                          <h3 className="text-xl font-sora font-bold text-text-primary">
                            {module.title}
                          </h3>
                          <p className="text-gray-600 font-inter text-sm">
                            {module.lessons_count} lessons • {formatDuration(module.total_duration_minutes)}
                          </p>
                        </div>
                      </div>
                      {module.description && (
                        <p className="text-gray-600 font-inter text-sm ml-16">
                          {module.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <span className="text-green-600 font-semibold">{previewLessons.length} preview</span>
                          <span>•</span>
                          <span className="text-gray-500">{lockedLessons.length} locked</span>
                        </div>
                      </div>
                      {isExpanded ? (
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      ) : (
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>

                {/* Module Lessons */}
                {isExpanded && (
                  <div className="bg-white">
                    {/* Preview Lessons */}
                    {previewLessons.length > 0 && (
                      <div className="p-6 border-b border-gray-100">
                        <h4 className="text-lg font-sora font-semibold text-text-primary mb-4 flex items-center">
                          <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          Preview Lessons
                        </h4>
                        <div className="space-y-3">
                          {previewLessons.map((lesson) => (
                            <div 
                              key={lesson.id}
                              className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200 hover:border-green-300 transition-colors cursor-pointer group"
                              onClick={() => handleLessonClick(lesson)}
                            >
                              <div className="flex items-center space-x-4">
                                {getLessonIcon(lesson.lesson_type)}
                                <div className="flex-1">
                                  <h5 className="font-sora font-semibold text-text-primary mb-1 group-hover:text-green-700">
                                    {lesson.title}
                                  </h5>
                                  {lesson.description && (
                                    <p className="text-gray-600 font-inter text-sm">
                                      {lesson.description}
                                    </p>
                                  )}
                                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                                    <span className="flex items-center">
                                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                      {formatDuration(lesson.duration_minutes)}
                                    </span>
                                    <span className="capitalize">{lesson.lesson_type}</span>
                                    {lesson.materials_count > 0 && (
                                      <span className="flex items-center">
                                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                        </svg>
                                        {lesson.materials_count} materials
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                  Preview Available
                                </span>
                                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Locked Lessons */}
                    {lockedLessons.length > 0 && (
                      <div className="p-6">
                        <h4 className="text-lg font-sora font-semibold text-text-primary mb-4 flex items-center">
                          <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          Enroll to Access ({lockedLessons.length} lessons)
                        </h4>
                        <div className="space-y-3">
                          {lockedLessons.slice(0, 3).map((lesson) => (
                            <div 
                              key={lesson.id}
                              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 opacity-75"
                            >
                              <div className="flex items-center space-x-4">
                                {getLessonIcon(lesson.lesson_type)}
                                <div className="flex-1">
                                  <h5 className="font-sora font-semibold text-gray-700 mb-1">
                                    {lesson.title}
                                  </h5>
                                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                                    <span className="flex items-center">
                                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                      {formatDuration(lesson.duration_minutes)}
                                    </span>
                                    <span className="capitalize">{lesson.lesson_type}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                                  Enroll to Access
                                </span>
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                              </div>
                            </div>
                          ))}
                          {lockedLessons.length > 3 && (
                            <div className="text-center py-4">
                              <p className="text-gray-500 text-sm">
                                +{lockedLessons.length - 3} more lessons available after enrollment
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Video Preview Modal */}
      {previewLesson && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-sora font-bold text-text-primary">
                {previewLesson.title}
              </h3>
              <button
                onClick={closePreview}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                <div className="text-center">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <p className="text-gray-600 font-inter">
                    Video preview will be available here
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Duration: {formatDuration(previewLesson.duration_minutes)}
                  </p>
                </div>
              </div>
              {previewLesson.description && (
                <p className="text-gray-600 font-inter">
                  {previewLesson.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LessonsSection;
