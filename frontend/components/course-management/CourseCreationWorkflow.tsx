'use client';

import { useState } from 'react';
import { CheckCircle, Clock, Users, Settings, Eye, ArrowRight, ArrowLeft } from 'lucide-react';
import CourseOutlineUpload from './CourseOutlineUpload';
import TutorAssignment from './TutorAssignment';
import CourseSettings from './CourseSettings';
import CourseReview from './CourseReview';

interface CourseCreationWorkflowProps {
  onCourseCreated: (course: any) => void;
}

type WorkflowStep = 'outline' | 'assignment' | 'settings' | 'review';

interface WorkflowData {
  outline: any;
  assignments: any[];
  settings: any;
  isComplete: boolean;
}

export default function CourseCreationWorkflow({ onCourseCreated }: CourseCreationWorkflowProps) {
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('outline');
  const [workflowData, setWorkflowData] = useState<WorkflowData>({
    outline: null,
    assignments: [],
    settings: null,
    isComplete: false
  });

  const steps = [
    {
      id: 'outline',
      title: 'Course Outline',
      description: 'Upload or create course structure',
      icon: CheckCircle,
      completed: !!workflowData.outline
    },
    {
      id: 'assignment',
      title: 'Tutor Assignment',
      description: 'Assign tutors to modules',
      icon: Users,
      completed: workflowData.assignments.length > 0
    },
    {
      id: 'settings',
      title: 'Course Settings',
      description: 'Configure pricing & schedule',
      icon: Settings,
      completed: !!workflowData.settings
    },
    {
      id: 'review',
      title: 'Review & Publish',
      description: 'Final review and approval',
      icon: Eye,
      completed: workflowData.isComplete
    }
  ];

  const handleOutlineComplete = (outline: any) => {
    setWorkflowData(prev => ({ ...prev, outline }));
    setCurrentStep('assignment');
  };

  const handleAssignmentComplete = (assignments: any[]) => {
    setWorkflowData(prev => ({ ...prev, assignments }));
    setCurrentStep('settings');
  };

  const handleSettingsComplete = (settings: any) => {
    setWorkflowData(prev => ({ ...prev, settings }));
    setCurrentStep('review');
  };

  const handleReviewComplete = (approved: boolean, feedback?: string) => {
    if (approved) {
      setWorkflowData(prev => ({ ...prev, isComplete: true }));
      // Create final course object
      const course = {
        ...workflowData.outline,
        assignments: workflowData.assignments,
        settings: workflowData.settings,
        status: 'published',
        createdAt: new Date().toISOString(),
        feedback: feedback
      };
      onCourseCreated(course);
    } else {
      // Handle rejection - could go back to specific step
      alert('Course rejected. Please address the feedback and try again.');
    }
  };

  const goToStep = (step: WorkflowStep) => {
    // Allow going back to any completed step
    const currentStepIndex = steps.findIndex(s => s.id === currentStep);
    const targetStepIndex = steps.findIndex(s => s.id === step);
    
    if (targetStepIndex <= currentStepIndex || steps[targetStepIndex].completed) {
      setCurrentStep(step);
    }
  };

  const goToNextStep = () => {
    const currentStepIndex = steps.findIndex(s => s.id === currentStep);
    if (currentStepIndex < steps.length - 1) {
      setCurrentStep(steps[currentStepIndex + 1].id as WorkflowStep);
    }
  };

  const goToPreviousStep = () => {
    const currentStepIndex = steps.findIndex(s => s.id === currentStep);
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1].id as WorkflowStep);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'outline':
        return <CourseOutlineUpload onUploadComplete={handleOutlineComplete} />;
      case 'assignment':
        return (
          <TutorAssignment
            courseOutline={workflowData.outline}
            onAssignmentComplete={handleAssignmentComplete}
          />
        );
      case 'settings':
        return (
          <CourseSettings
            courseOutline={workflowData.outline}
            tutorAssignments={workflowData.assignments}
            onSettingsComplete={handleSettingsComplete}
          />
        );
      case 'review':
        return (
          <CourseReview
            courseOutline={workflowData.outline}
            tutorAssignments={workflowData.assignments}
            courseSettings={workflowData.settings}
            onApprovalComplete={handleReviewComplete}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Create New Course</h2>
            <p className="text-gray-600">Follow the workflow to create and publish your course</p>
          </div>
          <div className="text-sm text-gray-500">
            Step {steps.findIndex(s => s.id === currentStep) + 1} of {steps.length}
          </div>
        </div>

        {/* Progress Steps */}
        <div className="relative">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 transform -translate-y-1/2"></div>
          <div className="relative flex justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = step.completed;
              const isAccessible = index === 0 || steps[index - 1].completed || isCompleted;

              return (
                <div key={step.id} className="flex flex-col items-center">
                  <button
                    onClick={() => isAccessible && goToStep(step.id as WorkflowStep)}
                    disabled={!isAccessible}
                    className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-200 ${
                      isCompleted
                        ? 'bg-green-600 border-green-600 text-white'
                        : isActive
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : isAccessible
                        ? 'bg-white border-gray-300 text-gray-400 hover:border-blue-400 hover:text-blue-600'
                        : 'bg-gray-100 border-gray-200 text-gray-300 cursor-not-allowed'
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                  </button>
                  <div className="mt-2 text-center">
                    <div className={`text-sm font-medium ${
                      isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 max-w-24">
                      {step.description}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Current Step Content */}
      <div className="mb-8">
        {renderCurrentStep()}
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-6 border-t border-gray-200">
        <button
          onClick={goToPreviousStep}
          disabled={currentStep === 'outline'}
          className="flex items-center px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </button>

        <div className="flex space-x-3">
          <button className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            Save Draft
          </button>
          
          {currentStep !== 'review' && (
            <button
              onClick={goToNextStep}
              disabled={!steps.find(s => s.id === currentStep)?.completed}
              className="flex items-center px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          )}
        </div>
      </div>

      {/* Workflow Summary */}
      {workflowData.outline && (
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-3">Workflow Summary</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Course:</span>
              <span className="ml-2 text-gray-600">{workflowData.outline.title}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Modules:</span>
              <span className="ml-2 text-gray-600">{workflowData.outline.modules?.length || 0}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Tutors:</span>
              <span className="ml-2 text-gray-600">{workflowData.assignments.length}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Price:</span>
              <span className="ml-2 text-gray-600">
                {workflowData.settings?.pricing?.currency} {workflowData.settings?.pricing?.basePrice}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
