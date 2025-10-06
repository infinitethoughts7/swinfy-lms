'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Lock } from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  slug: string;
  lesson_type: 'video' | 'text' | 'quiz' | 'assignment' | 'live_session' | 'download';
  lesson_type_display: string;
  order: number;
  duration_minutes: number;
  duration_formatted: string;
  is_preview: boolean;
  is_mandatory: boolean;
  is_completed: boolean;
}

interface CourseModule {
  id: string;
  title: string;
  slug: string;
  order: number;
  duration_weeks: number;
  lessons_count: number;
  total_duration_minutes: number;
  created_at: string;
  updated_at: string;
}

interface CourseContentTabProps {
  modules: CourseModule[];
  lessons: { [moduleId: string]: Lesson[] };
  isEnrolled: boolean;
}

export default function CourseContentTab({ modules, lessons, isEnrolled }: CourseContentTabProps) {
  const [expandedModules, setExpandedModules] = useState<string[]>([]);

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev =>
      prev.includes(moduleId)
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  // Calculate total course statistics
  const totalLessons = modules.reduce((sum, module) => sum + module.lessons_count, 0);
  const totalMinutes = modules.reduce((sum, module) => sum + module.total_duration_minutes, 0);
  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;

  const getLessonTypeLabel = (lessonType: string) => {
    switch (lessonType) {
      case 'video':
        return 'Video';
      case 'text':
        return 'Reading';
      case 'quiz':
        return 'Quiz';
      case 'assignment':
        return 'Assignment';
      case 'live_session':
        return 'Live Session';
      case 'download':
        return 'Download';
      default:
        return 'Content';
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <div className="space-y-4">
      {/* Course Content Header - White Theme */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Course Content</h2>
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <span className="font-medium">
            {totalHours > 0 ? `${totalHours}h ${remainingMinutes}m` : `${remainingMinutes}m`}
          </span>
          <span className="text-gray-400">•</span>
          <span className="font-medium">{modules.length} Sections</span>
          <span className="text-gray-400">•</span>
          <span className="font-medium">{totalLessons} Lessons</span>
        </div>
      </div>

      {/* Modules List - White Theme */}
      <div className="space-y-2">
        {modules.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <div className="w-5 h-5 bg-gray-400 rounded"></div>
            </div>
            <h3 className="text-sm font-medium text-gray-700 mb-1">No Course Content Yet</h3>
            <p className="text-xs text-gray-500">The instructor is preparing the materials.</p>
          </div>
        ) : (
          modules.map((module, index) => {
            const isExpanded = expandedModules.includes(module.id);
            const moduleLessons = lessons[module.id] || [];
            const Icon = isExpanded ? ChevronUp : ChevronDown;

            return (
              <div key={module.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {/* Module Header - White Theme */}
                <button
                  onClick={() => toggleModule(module.id)}
                  className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 text-left">
                    <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center">
                      <span className="text-gray-700 font-medium text-sm">{index + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 mb-0.5">
                        {module.title}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{module.lessons_count} lessons</span>
                        <span>•</span>
                        <span>{formatDuration(module.total_duration_minutes)}</span>
                      </div>
                    </div>
                  </div>
                  <Icon className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
                </button>

                {/* Module Lessons - White Theme */}
                {isExpanded && (
                  <div className="border-t border-gray-200 bg-gray-50">
                    {moduleLessons.length === 0 ? (
                      <div className="px-4 py-3 text-center text-xs text-gray-500">
                        No lessons in this module yet
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-200">
                        {moduleLessons.map((lesson) => {
                          const isLocked = !isEnrolled && !lesson.is_preview;

                          return (
                            <div
                              key={lesson.id}
                              className={`px-4 py-3 ${
                                isLocked ? 'opacity-50' : 'hover:bg-white cursor-pointer'
                              } transition-colors`}
                            >
                              <div className="flex items-start gap-3">
                                {/* Simple bullet point */}
                                <div className="flex-shrink-0 mt-1.5">
                                  <div className={`w-2 h-2 rounded-full ${
                                    lesson.is_completed 
                                      ? 'bg-green-500' 
                                      : lesson.is_preview 
                                      ? 'bg-blue-500' 
                                      : 'bg-gray-400'
                                  }`}></div>
                                </div>
                                
                                {/* Lesson content */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="text-sm font-medium text-gray-900">
                                      {lesson.title}
                                    </h4>
                                    {lesson.is_preview && (
                                      <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                                        Preview
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-3 text-xs text-gray-500">
                                    <span>{getLessonTypeLabel(lesson.lesson_type)}</span>
                                    <span>•</span>
                                    <span>{formatDuration(lesson.duration_minutes)}</span>
                                    {isLocked && (
                                      <>
                                        <span>•</span>
                                        <div className="flex items-center gap-1">
                                          <Lock className="w-3 h-3" />
                                          <span>Locked</span>
                                        </div>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Enrollment CTA - White Theme */}
      {!isEnrolled && modules.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to start learning?</h3>
          <p className="text-sm text-gray-600 mb-4">
            Click the <span className="font-semibold text-gray-900">&quot;Start learning now&quot;</span> button in the sidebar to enroll and access all {totalLessons} lessons
          </p>
          <div className="inline-flex items-center gap-2 text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span>Look for the button on the right</span>
          </div>
        </div>
      )}
    </div>
  );
}