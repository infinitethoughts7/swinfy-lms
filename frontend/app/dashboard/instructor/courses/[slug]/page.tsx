"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { instructorApi, type Course } from '@/lib/api';
import ModulesLessonsManager from '@/components/instructor/ModulesLessonsManager';
import ResourcesManager from '@/components/instructor/ResourcesManager';
import { 
  BookOpen, Users, Clock, Star, Settings, Plus, Eye, Edit, Trash2, 
  Video, FileText, Award, BarChart3, Upload, Play, Download,
  ChevronRight, ChevronDown, GripVertical
} from 'lucide-react';

interface TabProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const CourseDetailTabs = ({ activeTab, setActiveTab }: TabProps) => {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: BookOpen },
    { id: 'modules', label: 'Modules & Lessons', icon: Video },
    { id: 'resources', label: 'Resources', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <div className="border-b border-gray-200 mb-6">
      <nav className="flex space-x-8">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="h-4 w-4 mr-2" />
              {tab.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

const CourseOverview = ({ course }: { course: Course }) => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    {/* Course Info */}
    <div className="lg:col-span-2 space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <p className="text-gray-600">{course.description || 'No description provided'}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <p className="text-gray-600">{course.category_display}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
              <p className="text-gray-600">{course.level_display}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
              <p className="text-gray-600">{course.duration_weeks} weeks</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
              <p className="text-gray-600">₹{course.price}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Learning Outcomes */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Learning Outcomes</h3>
        <div className="prose prose-sm">
          <p className="text-gray-600">{course.learning_outcomes || 'No learning outcomes specified'}</p>
        </div>
      </div>

      {/* Prerequisites */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Prerequisites</h3>
        <div className="prose prose-sm">
          <p className="text-gray-600">{course.prerequisites || 'No prerequisites specified'}</p>
        </div>
      </div>
    </div>

    {/* Course Stats & Actions */}
    <div className="space-y-6">
      {/* Course Image */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Thumbnail</h3>
        <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg mb-4 flex items-center justify-center">
          {course.thumbnail ? (
            <img 
              src={course.thumbnail} 
              alt={course.title}
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <BookOpen className="h-12 w-12 text-white" />
          )}
        </div>
        <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center">
          <Upload className="h-4 w-4 mr-2" />
          Update Thumbnail
        </button>
      </div>

      {/* Quick Stats */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
        <div className="space-y-4">
          <div className="flex justify-between">
            <span className="text-gray-600">Modules</span>
            <span className="font-medium">{course.modules_count || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Lessons</span>
            <span className="font-medium">{course.lessons_count || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Duration</span>
            <span className="font-medium">{Math.round((course.total_duration_minutes || 0) / 60)}h</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Enrollments</span>
            <span className="font-medium">{course.enrollment_count || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Status</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              course.approval_status === 'approved' 
                ? 'bg-green-100 text-green-800'
                : course.approval_status === 'pending_approval'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {course.approval_status_display}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
        <div className="space-y-3">
          <Link
            href={`/dashboard/instructor/courses/${course.slug}/edit`}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Course
          </Link>
          <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center">
            <Eye className="h-4 w-4 mr-2" />
            Preview Course
          </button>
          {course.approval_status === 'draft' && (
            <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center">
              <Award className="h-4 w-4 mr-2" />
              Submit for Approval
            </button>
          )}
        </div>
      </div>
    </div>
  </div>
);

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseSlug = params.slug as string;
  
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchCourse();
  }, [courseSlug]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await instructorApi.courses.get(courseSlug);
      setCourse(data);
    } catch (err) {
      console.error('Error fetching course:', err);
      setError('Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="text-center py-12">
        <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Course not found</h3>
        <p className="text-gray-600 mb-6">{error || 'The requested course could not be found.'}</p>
        <Link
          href="/dashboard/instructor/courses"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <ChevronRight className="h-4 w-4 mr-2 rotate-180" />
          Back to Courses
        </Link>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <CourseOverview course={course} />;
      case 'modules':
        return <ModulesLessonsTab course={course} onUpdate={fetchCourse} />;
      case 'resources':
        return <ResourcesTab course={course} onUpdate={fetchCourse} />;
      case 'settings':
        return <SettingsTab course={course} onUpdate={fetchCourse} />;
      case 'analytics':
        return <AnalyticsTab course={course} />;
      default:
        return <CourseOverview course={course} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/dashboard/instructor/courses"
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ChevronRight className="h-5 w-5 rotate-180" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
            <p className="text-gray-600">{course.short_description}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            course.is_published 
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}>
            {course.is_published ? 'Published' : 'Draft'}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <CourseDetailTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Tab Content */}
      {renderTabContent()}
    </div>
  );
}

const ModulesLessonsTab = ({ course, onUpdate }: { course: Course; onUpdate: () => void }) => (
  <ModulesLessonsManager course={course} onUpdate={onUpdate} />
);

const ResourcesTab = ({ course, onUpdate }: { course: Course; onUpdate: () => void }) => (
  <ResourcesManager course={course} onUpdate={onUpdate} />
);

const SettingsTab = ({ course, onUpdate }: { course: Course; onUpdate: () => void }) => (
  <div className="text-center py-12">
    <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
    <h3 className="text-lg font-semibold text-gray-900 mb-2">Course Settings</h3>
    <p className="text-gray-600 mb-6">Configure course settings and publishing options</p>
  </div>
);

const AnalyticsTab = ({ course }: { course: Course }) => (
  <div className="text-center py-12">
    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
    <h3 className="text-lg font-semibold text-gray-900 mb-2">Course Analytics</h3>
    <p className="text-gray-600 mb-6">View course performance and student engagement</p>
  </div>
);
