'use client';

import { useState } from 'react';
import Image from 'next/image';

interface LiveSession {
  id: string;
  title: string;
  course: string;
  instructor: {
    name: string;
    avatar?: string;
  };
  startTime: string;
  duration: number; // in minutes
  participants?: number;
  maxParticipants?: number;
  status: 'upcoming' | 'live' | 'ended';
  description?: string;
  meetingLink?: string;
  recordingAvailable?: boolean;
}

interface LiveSessionCardProps {
  session: LiveSession;
  variant?: 'student' | 'tutor' | 'admin';
  onJoin?: (sessionId: string) => void;
  onEdit?: (sessionId: string) => void;
  onCancel?: (sessionId: string) => void;
  onViewRecording?: (sessionId: string) => void;
}

const LiveSessionCard = ({ 
  session, 
  variant = 'student',
  onJoin,
  onEdit,
  onCancel,
  onViewRecording
}: LiveSessionCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'live':
        return 'bg-red-100 text-red-800 animate-pulse';
      case 'ended':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'upcoming':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'live':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
          </svg>
        );
      case 'ended':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      default:
        return null;
    }
  };

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getTimeUntilSession = () => {
    const now = new Date();
    const sessionTime = new Date(session.startTime);
    const diffMs = sessionTime.getTime() - now.getTime();
    
    if (diffMs <= 0) return 'Session has started';
    
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) return `In ${diffDays} day${diffDays > 1 ? 's' : ''}`;
    if (diffHours > 0) return `In ${diffHours} hour${diffHours > 1 ? 's' : ''}`;
    if (diffMins > 0) return `In ${diffMins} minute${diffMins > 1 ? 's' : ''}`;
    return 'Starting now';
  };

  const canJoin = session.status === 'live' || (session.status === 'upcoming' && getTimeUntilSession().includes('minute'));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200">
      {/* Header */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-2">
            {getStatusIcon(session.status)}
            <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(session.status)}`}>
              {session.status}
            </span>
            {session.status === 'live' && (
              <span className="text-xs text-red-600 font-medium">
                • LIVE
              </span>
            )}
          </div>
          
          {/* Session Actions Menu */}
          {(variant === 'tutor' || variant === 'admin') && (
            <div className="flex space-x-2">
              {onEdit && session.status === 'upcoming' && (
                <button
                  onClick={() => onEdit(session.id)}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Edit session"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              )}
              {onCancel && session.status === 'upcoming' && (
                <button
                  onClick={() => onCancel(session.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Cancel session"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {session.title}
        </h3>
        
        <p className="text-blue-600 text-sm font-medium mb-3">
          {session.course}
        </p>

        {/* Instructor */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
            {session.instructor.avatar ? (
              <Image
                src={session.instructor.avatar}
                alt={session.instructor.name}
                width={32}
                height={32}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-sm font-medium text-gray-600">
                {session.instructor.name.charAt(0)}
              </span>
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{session.instructor.name}</p>
            <p className="text-xs text-gray-500">Instructor</p>
          </div>
        </div>

        {/* Session Info */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {formatTime(session.startTime)}
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {session.duration} minutes
          </div>

          {session.participants !== undefined && session.maxParticipants && (
            <div className="flex items-center text-sm text-gray-600">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              {session.participants}/{session.maxParticipants} participants
            </div>
          )}

          {session.status === 'upcoming' && (
            <div className="flex items-center text-sm font-medium text-blue-600">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {getTimeUntilSession()}
            </div>
          )}
        </div>

        {/* Description */}
        {session.description && (
          <div className="mb-4">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              {isExpanded ? 'Hide description' : 'Show description'}
            </button>
            {isExpanded && (
              <p className="text-sm text-gray-600 mt-2">{session.description}</p>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="bg-gray-50 px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
        <div className="flex flex-wrap gap-2">
          {/* Join/View Recording Button */}
          {session.status === 'ended' && session.recordingAvailable && onViewRecording ? (
            <button
              onClick={() => onViewRecording(session.id)}
              className="inline-flex items-center px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m2-7H5a2 2 0 00-2 2v8a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2z" />
              </svg>
              View Recording
            </button>
          ) : canJoin && onJoin ? (
            <button
              onClick={() => onJoin(session.id)}
              className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                session.status === 'live' 
                  ? 'bg-red-600 text-white hover:bg-red-700' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              {session.status === 'live' ? 'Join Now' : 'Join Session'}
            </button>
          ) : (
            <span className="text-sm text-gray-500">
              {session.status === 'ended' ? 'Session ended' : 'Not available yet'}
            </span>
          )}
        </div>

        {/* Participants indicator for live sessions */}
        {session.status === 'live' && session.participants !== undefined && (
          <div className="flex items-center text-sm text-gray-600 sm:ml-auto">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            <span className="whitespace-nowrap">{session.participants} watching</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveSessionCard;
