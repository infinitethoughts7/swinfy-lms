'use client';

import { useState } from 'react';
import { CheckCircle, XCircle, Eye, Edit, Clock, Users, DollarSign, Star, AlertCircle, FileText, Video, Download } from 'lucide-react';

interface CourseReviewProps {
  courseOutline: any;
  tutorAssignments: any[];
  courseSettings: any;
  onApprovalComplete: (approved: boolean, feedback?: string) => void;
}

interface ReviewChecklist {
  outlineComplete: boolean;
  tutorsAssigned: boolean;
  contentCreated: boolean;
  pricingSet: boolean;
  scheduleDefined: boolean;
  prerequisitesClear: boolean;
  objectivesDefined: boolean;
  qualityChecked: boolean;
}

export default function CourseReview({ courseOutline, tutorAssignments, courseSettings, onApprovalComplete }: CourseReviewProps) {
  const [reviewChecklist, setReviewChecklist] = useState<ReviewChecklist>({
    outlineComplete: true,
    tutorsAssigned: tutorAssignments.length > 0,
    contentCreated: false,
    pricingSet: true,
    scheduleDefined: true,
    prerequisitesClear: true,
    objectivesDefined: true,
    qualityChecked: false
  });

  const [feedback, setFeedback] = useState('');
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  const updateChecklist = (item: keyof ReviewChecklist, checked: boolean) => {
    setReviewChecklist(prev => ({ ...prev, [item]: checked }));
  };

  const allChecksPassed = Object.values(reviewChecklist).every(check => check);

  const handleApprove = async () => {
    setIsApproving(true);
    // Simulate approval process
    await new Promise(resolve => setTimeout(resolve, 2000));
    onApprovalComplete(true, feedback);
    setIsApproving(false);
  };

  const handleReject = async () => {
    if (!feedback.trim()) {
      alert('Please provide feedback for rejection');
      return;
    }
    setIsRejecting(true);
    // Simulate rejection process
    await new Promise(resolve => setTimeout(resolve, 2000));
    onApprovalComplete(false, feedback);
    setIsRejecting(false);
  };

  const getCompletionPercentage = () => {
    const completed = Object.values(reviewChecklist).filter(check => check).length;
    return Math.round((completed / Object.keys(reviewChecklist).length) * 100);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Course Review & Approval</h3>
        <p className="text-sm text-gray-600">Review all course details before publishing</p>
      </div>

      {/* Progress Overview */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-gray-900">Review Progress</h4>
          <span className="text-sm font-medium text-gray-600">{getCompletionPercentage()}% Complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${getCompletionPercentage()}%` }}
          ></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Review Checklist */}
        <div>
          <h4 className="font-medium text-gray-900 mb-4">Review Checklist</h4>
          <div className="space-y-3">
            {[
              { key: 'outlineComplete', label: 'Course outline is complete and detailed', icon: FileText },
              { key: 'tutorsAssigned', label: 'Tutors assigned to all modules', icon: Users },
              { key: 'contentCreated', label: 'Course content has been created', icon: Video },
              { key: 'pricingSet', label: 'Pricing and payment terms are set', icon: DollarSign },
              { key: 'scheduleDefined', label: 'Schedule and duration are defined', icon: Clock },
              { key: 'prerequisitesClear', label: 'Prerequisites are clearly stated', icon: AlertCircle },
              { key: 'objectivesDefined', label: 'Learning objectives are well-defined', icon: Star },
              { key: 'qualityChecked', label: 'Content quality has been verified', icon: CheckCircle }
            ].map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center">
                <input
                  type="checkbox"
                  checked={reviewChecklist[key as keyof ReviewChecklist]}
                  onChange={(e) => updateChecklist(key as keyof ReviewChecklist, e.target.checked)}
                  className="mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <Icon className="w-4 h-4 text-gray-400 mr-2" />
                <span className="text-sm text-gray-700">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Course Summary */}
        <div>
          <h4 className="font-medium text-gray-900 mb-4">Course Summary</h4>
          <div className="space-y-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <h5 className="font-medium text-gray-900 mb-2">Basic Information</h5>
              <div className="space-y-2 text-sm">
                <div><span className="font-medium">Title:</span> {courseOutline.title}</div>
                <div><span className="font-medium">Duration:</span> {courseSettings.duration?.totalWeeks} weeks ({courseSettings.duration?.totalHours} hours)</div>
                <div><span className="font-medium">Level:</span> {courseSettings.difficulty?.level}</div>
                <div><span className="font-medium">Price:</span> {courseSettings.pricing?.currency} {courseSettings.pricing?.basePrice}</div>
              </div>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg">
              <h5 className="font-medium text-gray-900 mb-2">Tutor Assignments</h5>
              <div className="space-y-2">
                {tutorAssignments.length === 0 ? (
                  <p className="text-sm text-gray-500">No tutors assigned</p>
                ) : (
                  tutorAssignments.map(assignment => (
                    <div key={assignment.id} className="flex items-center justify-between text-sm">
                      <span>{assignment.tutorName}</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        assignment.status === 'completed' ? 'bg-green-100 text-green-800' :
                        assignment.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {assignment.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg">
              <h5 className="font-medium text-gray-900 mb-2">Content Status</h5>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span>Modules Created:</span>
                  <span className="text-green-600">{courseOutline.modules?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Lessons Created:</span>
                  <span className="text-green-600">
                    {courseOutline.modules?.reduce((total: number, module: any) => total + (module.lessons?.length || 0), 0) || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Content Quality:</span>
                  <span className="text-yellow-600">Pending Review</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Review Sections */}
      <div className="mt-8 space-y-6">
        {/* Course Outline Review */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Course Outline Review</h4>
          <div className="space-y-3">
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-1">Description</h5>
              <p className="text-sm text-gray-600">{courseOutline.description}</p>
            </div>
            
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-1">Learning Objectives</h5>
              <ul className="text-sm text-gray-600 space-y-1">
                {courseOutline.objectives?.map((objective: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>{objective}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-1">Course Modules</h5>
              <div className="space-y-2">
                {courseOutline.modules?.map((module: any, index: number) => (
                  <div key={module.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div>
                      <span className="text-sm font-medium">{index + 1}. {module.title}</span>
                      <p className="text-xs text-gray-600">{module.description}</p>
                    </div>
                    <span className="text-xs text-gray-500">{module.duration}h</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Review */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Pricing Review</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-1">Base Pricing</h5>
              <p className="text-sm text-gray-600">
                {courseSettings.pricing?.currency} {courseSettings.pricing?.basePrice}
                {courseSettings.pricing?.discountPercentage > 0 && (
                  <span className="ml-2 text-green-600">
                    ({courseSettings.pricing.discountPercentage}% off)
                  </span>
                )}
              </p>
            </div>
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-1">Early Bird</h5>
              <p className="text-sm text-gray-600">
                {courseSettings.pricing?.earlyBirdPrice ? 
                  `${courseSettings.pricing.currency} ${courseSettings.pricing.earlyBirdPrice}` : 
                  'Not set'
                }
              </p>
            </div>
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-1">Group Discount</h5>
              <p className="text-sm text-gray-600">
                {courseSettings.pricing?.groupDiscount?.discountPercentage}% off for groups of {courseSettings.pricing?.groupDiscount?.minStudents}+
              </p>
            </div>
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-1">Enrollment</h5>
              <p className="text-sm text-gray-600">
                {courseSettings.enrollment?.minStudents}-{courseSettings.enrollment?.maxStudents} students
              </p>
            </div>
          </div>
        </div>

        {/* Schedule Review */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Schedule Review</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-1">Course Duration</h5>
              <p className="text-sm text-gray-600">
                {courseSettings.duration?.totalWeeks} weeks, {courseSettings.duration?.totalHours} total hours
              </p>
            </div>
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-1">Class Schedule</h5>
              <p className="text-sm text-gray-600">
                {courseSettings.duration?.schedule?.classDays?.join(', ')} at {courseSettings.duration?.schedule?.classTime}
              </p>
            </div>
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-1">Start Date</h5>
              <p className="text-sm text-gray-600">
                {courseSettings.duration?.schedule?.startDate ? 
                  new Date(courseSettings.duration.schedule.startDate).toLocaleDateString() : 
                  'Not set'
                }
              </p>
            </div>
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-1">End Date</h5>
              <p className="text-sm text-gray-600">
                {courseSettings.duration?.schedule?.endDate ? 
                  new Date(courseSettings.duration.schedule.endDate).toLocaleDateString() : 
                  'Not set'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Section */}
      <div className="mt-6 p-4 border border-gray-200 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-3">Review Feedback</h4>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Add any feedback, suggestions, or requirements for course approval..."
        />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
        <div className="flex items-center space-x-4">
          <button className="flex items-center px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
            <Eye className="w-4 h-4 mr-2" />
            Preview Course
          </button>
          <button className="flex items-center px-4 py-2 text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100">
            <Download className="w-4 h-4 mr-2" />
            Export Details
          </button>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={handleReject}
            disabled={isRejecting || !feedback.trim()}
            className="flex items-center px-4 py-2 text-red-700 bg-red-50 rounded-lg hover:bg-red-100 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            <XCircle className="w-4 h-4 mr-2" />
            {isRejecting ? 'Rejecting...' : 'Reject'}
          </button>
          <button
            onClick={handleApprove}
            disabled={!allChecksPassed || isApproving}
            className="flex items-center px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            {isApproving ? 'Approving...' : 'Approve & Publish'}
          </button>
        </div>
      </div>

      {!allChecksPassed && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="w-4 h-4 text-yellow-600 mr-2" />
            <span className="text-sm text-yellow-800">
              Please complete all checklist items before approving the course.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
