'use client';

import { useState } from 'react';
import { Upload, FileText, X, CheckCircle } from 'lucide-react';

interface CourseOutlineUploadProps {
  onUploadComplete: (outline: CourseOutline) => void;
}

interface CourseOutline {
  title: string;
  description: string;
  objectives: string[];
  modules: CourseModule[];
  prerequisites: string[];
  targetAudience: string;
  estimatedDuration: number;
  file?: File;
}

interface CourseModule {
  id: string;
  title: string;
  description: string;
  lessons: string[];
  duration: number;
}

export default function CourseOutlineUpload({ onUploadComplete }: CourseOutlineUploadProps) {
  const [uploadMethod, setUploadMethod] = useState<'file' | 'manual'>('file');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [outline, setOutline] = useState<CourseOutline>({
    title: '',
    description: '',
    objectives: [''],
    modules: [],
    prerequisites: [''],
    targetAudience: '',
    estimatedDuration: 0,
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setIsUploading(true);
      
      // Simulate file processing
      setTimeout(() => {
        // Mock parsed outline data
        const mockOutline: CourseOutline = {
          title: 'Advanced React Development',
          description: 'Comprehensive course covering advanced React concepts, patterns, and best practices.',
          objectives: [
            'Master advanced React patterns and hooks',
            'Implement state management with Redux',
            'Build performant React applications',
            'Understand testing strategies for React apps'
          ],
          modules: [
            {
              id: '1',
              title: 'Advanced Hooks and Patterns',
              description: 'Deep dive into custom hooks and advanced patterns',
              lessons: ['useCallback and useMemo', 'Custom Hooks', 'Render Props', 'Higher-Order Components'],
              duration: 4
            },
            {
              id: '2',
              title: 'State Management',
              description: 'Managing complex state with Redux and Context',
              lessons: ['Redux Fundamentals', 'Redux Toolkit', 'Context API', 'State Normalization'],
              duration: 6
            }
          ],
          prerequisites: ['Basic React knowledge', 'JavaScript ES6+', 'HTML/CSS'],
          targetAudience: 'Intermediate to Advanced developers',
          estimatedDuration: 40,
          file: file
        };
        
        setOutline(mockOutline);
        setIsUploading(false);
        onUploadComplete(mockOutline);
      }, 2000);
    }
  };

  const handleManualInput = (field: keyof CourseOutline, value: string | number | string[]) => {
    setOutline(prev => ({ ...prev, [field]: value }));
  };

  const addObjective = () => {
    setOutline(prev => ({
      ...prev,
      objectives: [...prev.objectives, '']
    }));
  };

  const updateObjective = (index: number, value: string) => {
    setOutline(prev => ({
      ...prev,
      objectives: prev.objectives.map((obj, i) => i === index ? value : obj)
    }));
  };

  const removeObjective = (index: number) => {
    setOutline(prev => ({
      ...prev,
      objectives: prev.objectives.filter((_, i) => i !== index)
    }));
  };

  const addModule = () => {
    const newModule: CourseModule = {
      id: Date.now().toString(),
      title: '',
      description: '',
      lessons: [''],
      duration: 0
    };
    setOutline(prev => ({
      ...prev,
      modules: [...prev.modules, newModule]
    }));
  };

  const updateModule = (moduleId: string, field: keyof CourseModule, value: string | number | string[]) => {
    setOutline(prev => ({
      ...prev,
      modules: prev.modules.map(module => 
        module.id === moduleId ? { ...module, [field]: value } : module
      )
    }));
  };

  const addLesson = (moduleId: string) => {
    setOutline(prev => ({
      ...prev,
      modules: prev.modules.map(module => 
        module.id === moduleId 
          ? { ...module, lessons: [...module.lessons, ''] }
          : module
      )
    }));
  };

  const updateLesson = (moduleId: string, lessonIndex: number, value: string) => {
    setOutline(prev => ({
      ...prev,
      modules: prev.modules.map(module => 
        module.id === moduleId 
          ? { 
              ...module, 
              lessons: module.lessons.map((lesson, i) => i === lessonIndex ? value : lesson)
            }
          : module
      )
    }));
  };

  const removeModule = (moduleId: string) => {
    setOutline(prev => ({
      ...prev,
      modules: prev.modules.filter(module => module.id !== moduleId)
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Course Outline Upload</h3>
        <p className="text-sm text-gray-600">Upload a course outline file or create one manually</p>
      </div>

      {/* Upload Method Selection */}
      <div className="mb-6">
        <div className="flex space-x-4">
          <button
            onClick={() => setUploadMethod('file')}
            className={`flex items-center px-4 py-2 rounded-lg border ${
              uploadMethod === 'file'
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'bg-gray-50 border-gray-200 text-gray-700'
            }`}
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload File
          </button>
          <button
            onClick={() => setUploadMethod('manual')}
            className={`flex items-center px-4 py-2 rounded-lg border ${
              uploadMethod === 'manual'
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'bg-gray-50 border-gray-200 text-gray-700'
            }`}
          >
            <FileText className="w-4 h-4 mr-2" />
            Create Manually
          </button>
        </div>
      </div>

      {/* File Upload */}
      {uploadMethod === 'file' && (
        <div className="mb-6">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer flex flex-col items-center"
            >
              {isUploading ? (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
              ) : (
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
              )}
              <p className="text-sm text-gray-600 mb-1">
                {isUploading ? 'Processing file...' : 'Click to upload course outline'}
              </p>
              <p className="text-xs text-gray-500">PDF, DOC, DOCX, or TXT files</p>
            </label>
          </div>
          
          {uploadedFile && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              <span className="text-sm text-green-700">{uploadedFile.name}</span>
            </div>
          )}
        </div>
      )}

      {/* Manual Input Form */}
      {uploadMethod === 'manual' && (
        <div className="space-y-6">
          {/* Basic Information */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Course Title</label>
            <input
              type="text"
              value={outline.title}
              onChange={(e) => handleManualInput('title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter course title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={outline.description}
              onChange={(e) => handleManualInput('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter course description"
            />
          </div>

          {/* Learning Objectives */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Learning Objectives</label>
            {outline.objectives.map((objective, index) => (
              <div key={index} className="flex items-center mb-2">
                <input
                  type="text"
                  value={objective}
                  onChange={(e) => updateObjective(index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter learning objective"
                />
                <button
                  onClick={() => removeObjective(index)}
                  className="ml-2 p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              onClick={addObjective}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              + Add Objective
            </button>
          </div>

          {/* Course Modules */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">Course Modules</label>
              <button
                onClick={addModule}
                className="text-sm bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700"
              >
                + Add Module
              </button>
            </div>
            
            {outline.modules.map((module) => (
              <div key={module.id} className="border border-gray-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">Module {outline.modules.indexOf(module) + 1}</h4>
                  <button
                    onClick={() => removeModule(module.id)}
                    className="text-red-600 hover:bg-red-50 p-1 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="space-y-3">
                  <input
                    type="text"
                    value={module.title}
                    onChange={(e) => updateModule(module.id, 'title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Module title"
                  />
                  
                  <textarea
                    value={module.description}
                    onChange={(e) => updateModule(module.id, 'description', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Module description"
                  />
                  
                  <div className="flex items-center space-x-4">
                    <input
                      type="number"
                      value={module.duration}
                      onChange={(e) => updateModule(module.id, 'duration', parseInt(e.target.value) || 0)}
                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Hours"
                    />
                    <span className="text-sm text-gray-600">hours</span>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Lessons</label>
                    {module.lessons.map((lesson, lessonIndex) => (
                      <div key={lessonIndex} className="flex items-center mb-1">
                        <input
                          type="text"
                          value={lesson}
                          onChange={(e) => updateLesson(module.id, lessonIndex, e.target.value)}
                          className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Lesson title"
                        />
                        <button
                          onClick={() => {
                            const newLessons = module.lessons.filter((_, i) => i !== lessonIndex);
                            updateModule(module.id, 'lessons', newLessons);
                          }}
                          className="ml-2 p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => addLesson(module.id)}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                      + Add Lesson
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Prerequisites */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Prerequisites</label>
            {outline.prerequisites.map((prereq, index) => (
              <div key={index} className="flex items-center mb-2">
                <input
                  type="text"
                  value={prereq}
                  onChange={(e) => {
                    const newPrereqs = [...outline.prerequisites];
                    newPrereqs[index] = e.target.value;
                    handleManualInput('prerequisites', newPrereqs);
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter prerequisite"
                />
                <button
                  onClick={() => {
                    const newPrereqs = outline.prerequisites.filter((_, i) => i !== index);
                    handleManualInput('prerequisites', newPrereqs);
                  }}
                  className="ml-2 p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              onClick={() => {
                handleManualInput('prerequisites', [...outline.prerequisites, '']);
              }}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              + Add Prerequisite
            </button>
          </div>

          {/* Target Audience & Duration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
              <input
                type="text"
                value={outline.targetAudience}
                onChange={(e) => handleManualInput('targetAudience', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Intermediate developers"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Duration (hours)</label>
              <input
                type="number"
                value={outline.estimatedDuration}
                onChange={(e) => handleManualInput('estimatedDuration', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="40"
              />
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
        <button className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
          Cancel
        </button>
        <button
          onClick={() => onUploadComplete(outline)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Save Outline
        </button>
      </div>
    </div>
  );
}
