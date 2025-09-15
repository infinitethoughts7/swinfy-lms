"use client";

import { useState } from 'react';
import { 
  Video, FileText, Award, Clock, Edit, Trash2, 
  Save, X, Play, Image, BookOpen
} from 'lucide-react';

export interface Lesson {
  id?: string;
  title: string;
  lesson_type: 'video' | 'text' | 'assignment' | 'image_gallery' | 'mixed';
  duration_minutes: number;
  is_preview: boolean;
  is_mandatory: boolean;
  content?: string;
  video_file?: File | null;
  order: number;
}

interface LessonCardProps {
  lesson: Lesson;
  index: number;
  onUpdate: (index: number, updatedLesson: Lesson) => void;
  onDelete: (index: number) => void;
  getLessonIcon: (type: string) => JSX.Element;
}

const LessonCard = ({ lesson, index, onUpdate, onDelete, getLessonIcon }: LessonCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Lesson>({ ...lesson });

  const handleSave = () => {
    onUpdate(index, editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({ ...lesson });
    setIsEditing(false);
  };

  const handleFileChange = (file: File | null) => {
    setEditData(prev => ({ ...prev, video_file: file }));
  };

  if (isEditing) {
    return (
      <div className="p-4 bg-white rounded-lg border-2 border-blue-200 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-900">Edit Lesson {index + 1}</h4>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleCancel}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lesson Title</label>
            <input
              type="text"
              value={editData.title}
              onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter lesson title..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lesson Type</label>
            <select
              value={editData.lesson_type}
              onChange={(e) => setEditData(prev => ({ ...prev, lesson_type: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="video">Video Lesson</option>
              <option value="text">Text Lesson</option>
              <option value="assignment">Assignment</option>
              <option value="image_gallery">Image Gallery</option>
              <option value="mixed">Mixed Content</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
            <input
              type="number"
              min="0"
              value={editData.duration_minutes}
              onChange={(e) => setEditData(prev => ({ ...prev, duration_minutes: parseInt(e.target.value) || 0 }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {editData.lesson_type === 'video' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Video File</label>
            <input
              type="file"
              accept="video/*"
              onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
            {editData.video_file && (
              <p className="text-xs text-gray-500 mt-1">Selected: {editData.video_file.name}</p>
            )}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Content/Description</label>
          <textarea
            value={editData.content || ''}
            onChange={(e) => setEditData(prev => ({ ...prev, content: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Lesson content or description..."
          />
        </div>

        <div className="flex items-center space-x-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={editData.is_preview}
              onChange={(e) => setEditData(prev => ({ ...prev, is_preview: e.target.checked }))}
              className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
            <span className="ml-2 text-sm text-gray-700">Free Preview</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={editData.is_mandatory}
              onChange={(e) => setEditData(prev => ({ ...prev, is_mandatory: e.target.checked }))}
              className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
            <span className="ml-2 text-sm text-gray-700">Mandatory</span>
          </label>
        </div>

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={handleCancel}
            className="px-3 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Save Lesson
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border">
      <div className="flex items-center space-x-3">
        <span className="text-sm font-medium text-gray-500 bg-white px-2 py-1 rounded min-w-[2rem] text-center">
          {index + 1}
        </span>
        <div className="flex items-center space-x-2">
          {getLessonIcon(lesson.lesson_type)}
          <span className="font-medium text-gray-900">
            {lesson.title || `Lesson ${index + 1}`}
          </span>
        </div>
        {lesson.duration_minutes > 0 && (
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="h-3 w-3 mr-1" />
            {lesson.duration_minutes}m
          </div>
        )}
        {lesson.is_preview && (
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Preview</span>
        )}
        {!lesson.is_mandatory && (
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Optional</span>
        )}
      </div>
      
      <div className="flex items-center space-x-2">
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <Edit className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => onDelete(index)}
          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default LessonCard;
