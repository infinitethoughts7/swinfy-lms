'use client';

interface QuickAction {
  id: string;
  label: string;
  icon: JSX.Element;
  color: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'indigo';
  onClick: () => void;
  disabled?: boolean;
  badge?: string;
}

interface QuickActionsProps {
  actions: QuickAction[];
  variant?: 'grid' | 'list' | 'horizontal';
  size?: 'sm' | 'md' | 'lg';
}

const QuickActions = ({ actions, variant = 'grid', size = 'md' }: QuickActionsProps) => {
  const colorClasses = {
    blue: 'bg-blue-600 hover:bg-blue-700 text-white',
    green: 'bg-green-600 hover:bg-green-700 text-white',
    red: 'bg-red-600 hover:bg-red-700 text-white',
    yellow: 'bg-yellow-600 hover:bg-yellow-700 text-white',
    purple: 'bg-purple-600 hover:bg-purple-700 text-white',
    indigo: 'bg-indigo-600 hover:bg-indigo-700 text-white',
  };

  const sizeClasses = {
    sm: {
      button: 'p-3',
      icon: 'w-5 h-5',
      text: 'text-sm',
      spacing: 'space-y-2'
    },
    md: {
      button: 'p-4',
      icon: 'w-6 h-6',
      text: 'text-base',
      spacing: 'space-y-3'
    },
    lg: {
      button: 'p-6',
      icon: 'w-8 h-8',
      text: 'text-lg',
      spacing: 'space-y-4'
    }
  };

  const sizes = sizeClasses[size];

  if (variant === 'list') {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className={`${sizes.spacing}`}>
          {actions.map((action) => (
            <button
              key={action.id}
              onClick={action.onClick}
              disabled={action.disabled}
              className={`w-full flex items-center justify-between ${sizes.button} rounded-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${
                colorClasses[action.color]
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className={sizes.icon}>{action.icon}</span>
                <span className={`font-medium ${sizes.text}`}>{action.label}</span>
              </div>
              {action.badge && (
                <span className="bg-white/20 text-white text-xs px-2 py-1 rounded-full">
                  {action.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Horizontal layout - all actions in a single row
  if (variant === 'horizontal') {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3 sm:gap-4 justify-start lg:justify-start">
          {actions.map((action) => (
            <button
              key={action.id}
              onClick={action.onClick}
              disabled={action.disabled}
              className={`relative flex items-center space-x-2 sm:space-x-3 ${sizes.button} rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${
                colorClasses[action.color]
              } min-w-fit flex-shrink-0`}
            >
              <span className={sizes.icon}>{action.icon}</span>
              <span className={`font-medium ${sizes.text} whitespace-nowrap`}>{action.label}</span>
              {action.badge && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {action.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Grid layout (default)
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={action.onClick}
            disabled={action.disabled}
            className={`relative flex flex-col items-center justify-center ${sizes.button} rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${
              colorClasses[action.color]
            }`}
          >
            <span className={`${sizes.icon} mb-2`}>{action.icon}</span>
            <span className={`font-medium ${sizes.text} text-center`}>{action.label}</span>
            {action.badge && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {action.badge}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

// Predefined action sets for different user roles
export const StudentQuickActions = ({ 
  onJoinSession, 
  onViewCourses, 
  onCheckAssignments,
  onViewProgress,
  upcomingSessions = 0,
  pendingAssignments = 0
}: {
  onJoinSession: () => void;
  onViewCourses: () => void;
  onCheckAssignments: () => void;
  onViewProgress: () => void;
  upcomingSessions?: number;
  pendingAssignments?: number;
}) => {
  const actions: QuickAction[] = [
    {
      id: 'join-session',
      label: 'Join Live Session',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
      color: 'green',
      onClick: onJoinSession,
      badge: upcomingSessions > 0 ? upcomingSessions.toString() : undefined
    },
    {
      id: 'view-courses',
      label: 'My Courses',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      color: 'blue',
      onClick: onViewCourses
    },
    {
      id: 'assignments',
      label: 'Assignments',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
      color: 'yellow',
      onClick: onCheckAssignments,
      badge: pendingAssignments > 0 ? pendingAssignments.toString() : undefined
    },
    {
      id: 'progress',
      label: 'My Progress',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      color: 'purple',
      onClick: onViewProgress
    }
  ];

  return <QuickActions actions={actions} variant="horizontal" />;
};

export const TutorQuickActions = ({ 
  onStartSession, 
  onCreateCourse, 
  onViewStudents,
  onScheduleSession,
  liveStudents = 0
}: {
  onStartSession: () => void;
  onCreateCourse: () => void;
  onViewStudents: () => void;
  onScheduleSession: () => void;
  liveStudents?: number;
}) => {
  const actions: QuickAction[] = [
    {
      id: 'start-session',
      label: 'Start Live Session',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m2-7H5a2 2 0 00-2 2v8a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2z" />
        </svg>
      ),
      color: 'red',
      onClick: onStartSession,
      badge: liveStudents > 0 ? liveStudents.toString() : undefined
    },
    {
      id: 'create-course',
      label: 'Create Course',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
      color: 'blue',
      onClick: onCreateCourse
    },
    {
      id: 'view-students',
      label: 'My Students',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
      color: 'green',
      onClick: onViewStudents
    },
    {
      id: 'schedule-session',
      label: 'Schedule Session',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      color: 'purple',
      onClick: onScheduleSession
    }
  ];

  return <QuickActions actions={actions} variant="horizontal" />;
};

export const AdminQuickActions = ({ 
  onManageUsers, 
  onSystemSettings, 
  onViewReports,
  onBackupSystem,
  pendingApprovals = 0
}: {
  onManageUsers: () => void;
  onSystemSettings: () => void;
  onViewReports: () => void;
  onBackupSystem: () => void;
  pendingApprovals?: number;
}) => {
  const actions: QuickAction[] = [
    {
      id: 'manage-users',
      label: 'Manage Users',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
      color: 'blue',
      onClick: onManageUsers,
      badge: pendingApprovals > 0 ? pendingApprovals.toString() : undefined
    },
    {
      id: 'system-settings',
      label: 'System Settings',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      color: 'indigo',
      onClick: onSystemSettings
    },
    {
      id: 'view-reports',
      label: 'View Reports',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      color: 'green',
      onClick: onViewReports
    },
    {
      id: 'backup-system',
      label: 'Backup System',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
        </svg>
      ),
      color: 'yellow',
      onClick: onBackupSystem
    }
  ];

  return <QuickActions actions={actions} variant="horizontal" />;
};

export default QuickActions;
