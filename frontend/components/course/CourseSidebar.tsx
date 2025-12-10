'use client';

import { Play, BarChart3, Clock, FileText, Code, MessageSquare, Award, Infinity, BookOpen } from 'lucide-react';

interface CourseSidebarProps {
  demoVideo?: string;
  courseThumbnail?: string;
  price: string;
  duration: number;
  lessonsCount?: number;
  level: string;
  isEnrolled: boolean;
  paymentStatus: string;
  enrollmentStatus?: string;
  onEnrollClick: () => void;
  onDemoVideoClick: () => void;
}

export default function CourseSidebar({
  demoVideo,
  courseThumbnail,
  price,
  duration,
  lessonsCount = 0,
  level,
  isEnrolled,
  paymentStatus,
  enrollmentStatus,
  onEnrollClick,
  onDemoVideoClick
}: CourseSidebarProps) {
  
  const estimatedHours = Math.round(duration * 2.5);

  // Check if payment is made but enrollment is pending approval
  const isPendingApproval = (paymentStatus === 'paid' && enrollmentStatus === 'pending_approval') || 
                            enrollmentStatus === 'pending_approval';

  const courseIncludes = [
    {
      icon: BarChart3,
      label: level === 'beginner' ? 'Beginner Friendly' : level === 'advanced' ? 'Advanced Level' : 'Intermediate Level',
    },
    {
      icon: Clock,
      label: `${estimatedHours} Hours`,
    },
    {
      icon: FileText,
      label: `${lessonsCount} Lessons`,
    },
    {
      icon: Code,
      label: 'Hands-on Exercises',
    },
    {
      icon: MessageSquare,
      label: 'English Captions',
    },
    {
      icon: Award,
      label: 'Certificate of Completion',
    },
    {
      icon: Infinity,
      label: 'Lifetime Access',
    },
    {
      icon: BookOpen,
      label: 'Learn at Your Own Pace',
    },
  ];

  // Only consider as fully paid if payment is verified AND enrollment is active
  const isPaid = (paymentStatus === 'paid' || paymentStatus === 'verified') && 
                 enrollmentStatus === 'active';

  return (
    <div className="space-y-4">
      {/* Sticky Card */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Demo Video Thumbnail */}
        <div className="relative">
          <div className="aspect-video bg-gray-900 relative overflow-hidden group cursor-pointer">
            {courseThumbnail ? (
              <img 
                src={courseThumbnail} 
                alt="Course preview" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <Play className="w-12 h-12 text-gray-600" />
              </div>
            )}
            
            {/* Play Button Overlay */}
            <div 
              onClick={onDemoVideoClick}
              className="absolute inset-0 bg-black/30 hover:bg-black/40 transition-all flex items-center justify-center"
            >
              <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform shadow-lg">
                <Play className="w-6 h-6 text-gray-900 ml-0.5" fill="currentColor" />
              </div>
            </div>

            {/* Preview Label */}
            {demoVideo && (
              <div className="absolute top-3 left-3 bg-white px-3 py-1 rounded-md text-xs font-semibold text-gray-900">
                Preview
              </div>
            )}
          </div>
        </div>

        {/* Pricing & CTA Section */}
        <div className="p-5 space-y-4">
          {/* Price */}
          {!isPaid && !isPendingApproval && (
            <div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                ₹{parseFloat(price).toLocaleString()}
              </div>
              <p className="text-sm text-gray-600">
                One-time payment - Lifetime access
              </p>
            </div>
          )}

          {/* Payment Received - Pending Approval */}
          {isPendingApproval && (
            <div className="py-1">
              <div className="text-xl font-bold text-yellow-700 mb-1">
                Payment Received
              </div>
              <p className="text-sm text-gray-600">
                Waiting for course provider to approve your enrollment
              </p>
            </div>
          )}

          {/* Course Owned Message */}
          {isPaid && !isPendingApproval && (
            <div className="py-1">
              <div className="text-xl font-bold text-gray-900 mb-1">
                Course Owned
              </div>
              <p className="text-sm text-gray-600">
                You have lifetime access
              </p>
            </div>
          )}

          {/* Pending Approval Message */}
          {isPendingApproval && (
            <div className="w-full bg-yellow-50 border border-yellow-300 text-yellow-800 font-medium text-sm py-3 px-6 rounded-lg text-center">
              <div className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Pending Approval
              </div>
              <p className="text-xs mt-1 text-yellow-700">
                Payment received. Awaiting course provider approval.
              </p>
            </div>
          )}

          {/* Enroll Button - Clean & Minimal */}
          {!isPaid && !isPendingApproval && (
            <button
              onClick={onEnrollClick}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold text-base py-3.5 px-6 rounded-lg transition-colors shadow-sm"
            >
              Start learning now
            </button>
          )}

          {/* Course Owned Badge */}
          {isPaid && !isPendingApproval && (
            <div className="w-full bg-gray-100 border border-gray-300 text-gray-900 font-semibold text-sm py-3 px-6 rounded-lg text-center">
              Enrolled - Full Access
            </div>
          )}

          {/* Money Back Guarantee */}
          {!isPaid && !isPendingApproval && (
            <p className="text-xs text-center text-gray-500">
              30-day money-back guarantee
            </p>
          )}
        </div>

        {/* This Course Includes */}
        <div className="border-t border-gray-200 p-5">
          <h3 className="text-base font-bold text-gray-900 mb-3">
            This course includes:
          </h3>
          <div className="space-y-2.5">
            {courseIncludes.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-4 h-4 text-gray-600">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm text-gray-700">
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}