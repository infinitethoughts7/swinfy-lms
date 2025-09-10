'use client';

import { ReactNode } from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
    timeframe?: string;
  };
  icon?: ReactNode;
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'indigo';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  onClick?: () => void;
}

const StatsCard = ({
  title,
  value,
  change,
  icon,
  color = 'blue',
  size = 'md',
  loading = false,
  onClick
}: StatsCardProps) => {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      icon: 'bg-blue-100 text-blue-600',
      text: 'text-blue-600'
    },
    green: {
      bg: 'bg-green-50',
      icon: 'bg-green-100 text-green-600',
      text: 'text-green-600'
    },
    red: {
      bg: 'bg-red-50',
      icon: 'bg-red-100 text-red-600',
      text: 'text-red-600'
    },
    yellow: {
      bg: 'bg-yellow-50',
      icon: 'bg-yellow-100 text-yellow-600',
      text: 'text-yellow-600'
    },
    purple: {
      bg: 'bg-purple-50',
      icon: 'bg-purple-100 text-purple-600',
      text: 'text-purple-600'
    },
    indigo: {
      bg: 'bg-indigo-50',
      icon: 'bg-indigo-100 text-indigo-600',
      text: 'text-indigo-600'
    }
  };

  const sizeClasses = {
    sm: {
      padding: 'p-4',
      iconSize: 'w-8 h-8',
      valueText: 'text-xl',
      titleText: 'text-sm'
    },
    md: {
      padding: 'p-6',
      iconSize: 'w-10 h-10',
      valueText: 'text-2xl',
      titleText: 'text-sm'
    },
    lg: {
      padding: 'p-8',
      iconSize: 'w-12 h-12',
      valueText: 'text-3xl',
      titleText: 'text-base'
    }
  };

  const colors = colorClasses[color];
  const sizes = sizeClasses[size];

  if (loading) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${sizes.padding} animate-pulse`}>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded mb-3"></div>
            <div className="h-8 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-20"></div>
          </div>
          <div className={`${sizes.iconSize} bg-gray-200 rounded-lg`}></div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`bg-white rounded-xl shadow-sm border border-gray-200 ${sizes.padding} transition-all duration-200 hover:shadow-md ${
        onClick ? 'cursor-pointer hover:scale-105' : ''
      } ${colors.bg}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className={`${sizes.titleText} font-medium text-gray-600 mb-2`}>
            {title}
          </p>
          <p className={`${sizes.valueText} font-bold text-gray-900 mb-1`}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          
          {change && (
            <div className="flex items-center">
              <span className={`inline-flex items-center text-xs font-medium ${
                change.type === 'increase' ? 'text-green-600' : 'text-red-600'
              }`}>
                {change.type === 'increase' ? (
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
                {change.value}%
              </span>
              {change.timeframe && (
                <span className="text-xs text-gray-500 ml-2">
                  {change.timeframe}
                </span>
              )}
            </div>
          )}
        </div>
        
        {icon && (
          <div className={`${sizes.iconSize} ${colors.icon} rounded-lg flex items-center justify-center flex-shrink-0 ml-4`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

// Predefined stats card components for common use cases
export const CourseStatsCard = ({ completed, total, ...props }: { completed: number; total: number } & Omit<StatsCardProps, 'title' | 'value' | 'icon'>) => (
  <StatsCard
    title="Course Progress"
    value={`${completed}/${total}`}
    icon={
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    }
    color="blue"
    {...props}
  />
);

export const StudentStatsCard = ({ count, ...props }: { count: number } & Omit<StatsCardProps, 'title' | 'value' | 'icon'>) => (
  <StatsCard
    title="Total Students"
    value={count}
    icon={
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
      </svg>
    }
    color="green"
    {...props}
  />
);

export const SessionStatsCard = ({ upcoming, ...props }: { upcoming: number } & Omit<StatsCardProps, 'title' | 'value' | 'icon'>) => (
  <StatsCard
    title="Upcoming Sessions"
    value={upcoming}
    icon={
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    }
    color="purple"
    {...props}
  />
);

export const PerformanceStatsCard = ({ percentage, ...props }: { percentage: number } & Omit<StatsCardProps, 'title' | 'value' | 'icon'>) => (
  <StatsCard
    title="Performance"
    value={`${percentage}%`}
    icon={
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    }
    color="yellow"
    {...props}
  />
);

export default StatsCard;
