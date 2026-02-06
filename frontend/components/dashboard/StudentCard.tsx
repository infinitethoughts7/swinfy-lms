'use client';

import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';

interface Learner {
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

interface LearnerCardProps {
  learner: Learner;
  variant?: 'grid' | 'list';
  onViewProfile?: (learnerId: string) => void;
  onSendMessage?: (learnerId: string) => void;
  onManage?: (learnerId: string) => void;
  showActions?: boolean;
}

const LearnerCard = ({
  learner,
  variant = 'grid',
  onViewProfile,
  onSendMessage,
  onManage,
  showActions = true
}: LearnerCardProps) => {
  const getStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'active':
        return 'default';
      case 'inactive':
        return 'secondary';
      case 'suspended':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getStatusDotColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'inactive':
        return 'bg-gray-400';
      case 'suspended':
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
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
      <Card className="hover:shadow-md transition-all duration-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="w-12 h-12">
                <AvatarImage src={learner.avatar} alt={learner.name} />
                <AvatarFallback>
                  {learner.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {learner.name}
                  </h3>
                  <div className={`w-2 h-2 rounded-full ${getStatusDotColor(learner.status)}`}></div>
                  <Badge variant={getStatusVariant(learner.status)} className="capitalize">
                    {learner.status}
                  </Badge>
                </div>
                <p className="text-gray-600 text-sm truncate">{learner.email}</p>
                <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                  <span>{learner.enrolledCourses} enrolled</span>
                  <span>{learner.completedCourses} completed</span>
                  <span>Last active: {learner.lastActive}</span>
                </div>
              </div>

              <div className="hidden md:block text-center">
                <div className="text-lg font-semibold text-gray-900">{learner.progress}%</div>
                <div className="text-xs text-gray-500">Progress</div>
              </div>

              {learner.performance && (
                <div className="hidden lg:block text-center">
                  <div className={`text-lg font-semibold ${getPerformanceColor(learner.performance.score)}`}>
                    {learner.performance.score}%
                  </div>
                  <div className="text-xs text-gray-500">Performance</div>
                </div>
              )}
            </div>

            {showActions && (
              <div className="flex items-center space-x-2">
                {onSendMessage && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onSendMessage(learner.id)}
                    title="Send message"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </Button>
                )}
                {onViewProfile && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewProfile(learner.id)}
                  >
                    View Profile
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden hover:shadow-md transition-all duration-200 group">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${getStatusDotColor(learner.status)}`}></div>
            <Badge variant={getStatusVariant(learner.status)} className="capitalize">
              {learner.status}
            </Badge>
          </div>
          {learner.performance?.rank && (
            <div className="text-xs text-gray-500">
              Rank #{learner.performance.rank}
            </div>
          )}
        </div>

        <div className="text-center">
          <Avatar className="w-16 h-16 mx-auto mb-3">
            <AvatarImage src={learner.avatar} alt={learner.name} />
            <AvatarFallback className="text-xl font-bold">
              {learner.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{learner.name}</h3>
          <p className="text-gray-600 text-sm truncate">{learner.email}</p>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{learner.enrolledCourses}</div>
            <div className="text-xs text-gray-500">Enrolled</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{learner.completedCourses}</div>
            <div className="text-xs text-gray-500">Completed</div>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Overall Progress</span>
            <span className="text-sm text-gray-500">{learner.progress}%</span>
          </div>
          <Progress value={learner.progress} className="h-2" />
        </div>

        {learner.performance && (
          <div className="text-center mb-4">
            <div className={`text-lg font-bold ${getPerformanceColor(learner.performance.score)}`}>
              {learner.performance.score}% Performance
            </div>
          </div>
        )}

        <div className="text-xs text-gray-500 space-y-1">
          <div>Joined: {learner.joinDate}</div>
          <div>Last active: {learner.lastActive}</div>
        </div>
      </CardContent>

      {showActions && (
        <CardFooter className="bg-gray-50 flex space-x-2">
          {onViewProfile && (
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onViewProfile(learner.id)}
            >
              View Profile
            </Button>
          )}
          {onSendMessage && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onSendMessage(learner.id)}
              title="Send message"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </Button>
          )}
          {onManage && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onManage(learner.id)}
              title="Manage student"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
};

export default LearnerCard;
