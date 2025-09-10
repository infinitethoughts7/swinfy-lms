'use client';

import Image from 'next/image';

interface Student {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  enrolledCourses: number;
  completedCourses: number;
  progress: number;
  lastActive: string;
  status: 'active' | 'inactive' | 'suspended';
  joinDate: string;
  performance?: {
    score: number;
    rank?: number;
  };
}

interface StudentCardProps {
  student: Student;
  variant?: 'grid' | 'list';
  onViewProfile?: (studentId: string) => void;
  onSendMessage?: (studentId: string) => void;
  onManage?: (studentId: string) => void;
  showActions?: boolean;
}

const StudentCard = ({ 
  student, 
  variant = 'grid',
  onViewProfile,
  onSendMessage,
  onManage,
  showActions = true
}: StudentCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        );
      case 'inactive':
        return (
          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
        );
      case 'suspended':
        return (
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
        );
      default:
        return null;
    }
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (variant === 'list') {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all duration-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Avatar */}
            <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden flex-shrink-0">
              {student.avatar ? (
                <Image
                  src={student.avatar}
                  alt={student.name}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-lg font-semibold text-gray-600">
                  {student.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            {/* Student Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {student.name}
                </h3>
                {getStatusIcon(student.status)}
                <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(student.status)}`}>
                  {student.status}
                </span>
              </div>
              <p className="text-gray-600 text-sm truncate">{student.email}</p>
              <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                <span>{student.enrolledCourses} enrolled</span>
                <span>{student.completedCourses} completed</span>
                <span>Last active: {student.lastActive}</span>
              </div>
            </div>

            {/* Progress */}
            <div className="hidden md:block text-center">
              <div className="text-lg font-semibold text-gray-900">{student.progress}%</div>
              <div className="text-xs text-gray-500">Progress</div>
            </div>

            {/* Performance */}
            {student.performance && (
              <div className="hidden lg:block text-center">
                <div className={`text-lg font-semibold ${getPerformanceColor(student.performance.score)}`}>
                  {student.performance.score}%
                </div>
                <div className="text-xs text-gray-500">Performance</div>
              </div>
            )}
          </div>

          {/* Actions */}
          {showActions && (
            <div className="flex items-center space-x-2">
              {onSendMessage && (
                <button
                  onClick={() => onSendMessage(student.id)}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Send message"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </button>
              )}
              {onViewProfile && (
                <button
                  onClick={() => onViewProfile(student.id)}
                  className="px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  View Profile
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200 group">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            {getStatusIcon(student.status)}
            <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(student.status)}`}>
              {student.status}
            </span>
          </div>
          {student.performance?.rank && (
            <div className="text-xs text-gray-500">
              Rank #{student.performance.rank}
            </div>
          )}
        </div>

        {/* Avatar and Name */}
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden mx-auto mb-3">
            {student.avatar ? (
              <Image
                src={student.avatar}
                alt={student.name}
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-xl font-bold text-gray-600">
                {student.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{student.name}</h3>
          <p className="text-gray-600 text-sm truncate">{student.email}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="px-6 pb-4">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{student.enrolledCourses}</div>
            <div className="text-xs text-gray-500">Enrolled</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{student.completedCourses}</div>
            <div className="text-xs text-gray-500">Completed</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Overall Progress</span>
            <span className="text-sm text-gray-500">{student.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${student.progress}%` }}
            ></div>
          </div>
        </div>

        {/* Performance Score */}
        {student.performance && (
          <div className="text-center mb-4">
            <div className={`text-lg font-bold ${getPerformanceColor(student.performance.score)}`}>
              {student.performance.score}% Performance
            </div>
          </div>
        )}

        {/* Additional Info */}
        <div className="text-xs text-gray-500 space-y-1">
          <div>Joined: {student.joinDate}</div>
          <div>Last active: {student.lastActive}</div>
        </div>
      </div>

      {/* Actions */}
      {showActions && (
        <div className="bg-gray-50 px-6 py-4 flex space-x-2">
          {onViewProfile && (
            <button
              onClick={() => onViewProfile(student.id)}
              className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              View Profile
            </button>
          )}
          {onSendMessage && (
            <button
              onClick={() => onSendMessage(student.id)}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Send message"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </button>
          )}
          {onManage && (
            <button
              onClick={() => onManage(student.id)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Manage student"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentCard;
