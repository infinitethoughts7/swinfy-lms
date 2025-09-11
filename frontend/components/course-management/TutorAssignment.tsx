'use client';

import { useState } from 'react';
import { User, Plus, X, CheckCircle, Clock, Star } from 'lucide-react';

interface TutorAssignmentProps {
  courseOutline: any;
  onAssignmentComplete: (assignments: TutorAssignment[]) => void;
}

interface TutorAssignment {
  id: string;
  tutorId: string;
  tutorName: string;
  tutorEmail: string;
  tutorSpecialization: string;
  moduleIds: string[];
  status: 'pending' | 'assigned' | 'in-progress' | 'completed';
  assignedDate: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
}

interface Tutor {
  id: string;
  name: string;
  email: string;
  specialization: string[];
  rating: number;
  coursesCompleted: number;
  availability: 'available' | 'busy' | 'unavailable';
  profilePicture?: string;
}

export default function TutorAssignment({ courseOutline, onAssignmentComplete }: TutorAssignmentProps) {
  const [assignments, setAssignments] = useState<TutorAssignment[]>([]);
  const [selectedModule, setSelectedModule] = useState<string>('');
  const [selectedTutor, setSelectedTutor] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');

  // Mock tutors data
  const availableTutors: Tutor[] = [
    {
      id: '1',
      name: 'Dr. Sarah Johnson',
      email: 'sarah.johnson@example.com',
      specialization: ['React', 'JavaScript', 'Frontend Development'],
      rating: 4.9,
      coursesCompleted: 15,
      availability: 'available',
      profilePicture: '/assets/images/avatars/avatar-01.jpg'
    },
    {
      id: '2',
      name: 'Prof. Michael Chen',
      email: 'michael.chen@example.com',
      specialization: ['Node.js', 'Backend Development', 'Database Design'],
      rating: 4.8,
      coursesCompleted: 12,
      availability: 'available'
    },
    {
      id: '3',
      name: 'Dr. Emily Rodriguez',
      email: 'emily.rodriguez@example.com',
      specialization: ['Python', 'Machine Learning', 'Data Science'],
      rating: 4.9,
      coursesCompleted: 18,
      availability: 'busy'
    },
    {
      id: '4',
      name: 'Prof. David Kim',
      email: 'david.kim@example.com',
      specialization: ['React', 'TypeScript', 'Full Stack Development'],
      rating: 4.7,
      coursesCompleted: 10,
      availability: 'available'
    }
  ];

  const handleAssignTutor = () => {
    if (!selectedModule || !selectedTutor || !dueDate) return;

    const tutor = availableTutors.find(t => t.id === selectedTutor);
    if (!tutor) return;

    const module = courseOutline.modules.find((m: any) => m.id === selectedModule);
    if (!module) return;

    const newAssignment: TutorAssignment = {
      id: Date.now().toString(),
      tutorId: tutor.id,
      tutorName: tutor.name,
      tutorEmail: tutor.email,
      tutorSpecialization: tutor.specialization.join(', '),
      moduleIds: [selectedModule],
      status: 'assigned',
      assignedDate: new Date().toISOString().split('T')[0],
      dueDate: dueDate,
      priority: priority
    };

    setAssignments(prev => [...prev, newAssignment]);
    setSelectedModule('');
    setSelectedTutor('');
    setDueDate('');
    setPriority('medium');
  };

  const updateAssignmentStatus = (assignmentId: string, status: TutorAssignment['status']) => {
    setAssignments(prev => 
      prev.map(assignment => 
        assignment.id === assignmentId ? { ...assignment, status } : assignment
      )
    );
  };

  const removeAssignment = (assignmentId: string) => {
    setAssignments(prev => prev.filter(assignment => assignment.id !== assignmentId));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Assign Tutors to Course Modules</h3>
        <p className="text-sm text-gray-600">Assign approved tutors to create content for specific course modules</p>
      </div>

      {/* Course Overview */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">{courseOutline.title}</h4>
        <p className="text-sm text-gray-600 mb-3">{courseOutline.description}</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Modules:</span>
            <span className="ml-2 text-gray-600">{courseOutline.modules?.length || 0}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Duration:</span>
            <span className="ml-2 text-gray-600">{courseOutline.estimatedDuration} hours</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Assignments:</span>
            <span className="ml-2 text-gray-600">{assignments.length}</span>
          </div>
        </div>
      </div>

      {/* Assignment Form */}
      <div className="mb-6 p-4 border border-gray-200 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-4">Create New Assignment</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Module</label>
            <select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Module</option>
              {courseOutline.modules?.map((module: any) => (
                <option key={module.id} value={module.id}>
                  {module.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tutor</label>
            <select
              value={selectedTutor}
              onChange={(e) => setSelectedTutor(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Tutor</option>
              {availableTutors.map(tutor => (
                <option key={tutor.id} value={tutor.id}>
                  {tutor.name} ({tutor.specialization[0]})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        <div className="mt-4">
          <button
            onClick={handleAssignTutor}
            disabled={!selectedModule || !selectedTutor || !dueDate}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Assign Tutor
          </button>
        </div>
      </div>

      {/* Available Tutors */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-900 mb-4">Available Tutors</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableTutors.map(tutor => (
            <div key={tutor.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center">
                  {tutor.profilePicture ? (
                    <img
                      src={tutor.profilePicture}
                      alt={tutor.name}
                      className="w-10 h-10 rounded-full mr-3"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-300 rounded-full mr-3 flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-600" />
                    </div>
                  )}
                  <div>
                    <h5 className="font-medium text-gray-900">{tutor.name}</h5>
                    <p className="text-sm text-gray-600">{tutor.email}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  tutor.availability === 'available' ? 'bg-green-100 text-green-800' :
                  tutor.availability === 'busy' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {tutor.availability}
                </span>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <Star className="w-4 h-4 mr-1 text-yellow-500" />
                  <span>{tutor.rating}/5.0</span>
                  <span className="ml-2">• {tutor.coursesCompleted} courses</span>
                </div>
                
                <div>
                  <p className="text-xs font-medium text-gray-700 mb-1">Specializations:</p>
                  <div className="flex flex-wrap gap-1">
                    {tutor.specialization.map(spec => (
                      <span key={spec} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Current Assignments */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-900 mb-4">Current Assignments</h4>
        {assignments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <User className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No assignments yet. Create your first assignment above.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {assignments.map(assignment => {
              const module = courseOutline.modules?.find((m: any) => m.id === assignment.moduleIds[0]);
              return (
                <div key={assignment.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h5 className="font-medium text-gray-900">{assignment.tutorName}</h5>
                      <p className="text-sm text-gray-600">{assignment.tutorEmail}</p>
                      <p className="text-sm text-gray-500">{module?.title}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(assignment.status)}`}>
                        {assignment.status.replace('-', ' ')}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(assignment.priority)}`}>
                        {assignment.priority}
                      </span>
                      <button
                        onClick={() => removeAssignment(assignment.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => updateAssignmentStatus(assignment.id, 'in-progress')}
                        className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded text-sm"
                      >
                        Start
                      </button>
                      <button
                        onClick={() => updateAssignmentStatus(assignment.id, 'completed')}
                        className="px-3 py-1 text-green-600 hover:bg-green-50 rounded text-sm"
                      >
                        Complete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <button className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
          Cancel
        </button>
        <button
          onClick={() => onAssignmentComplete(assignments)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Save Assignments
        </button>
      </div>
    </div>
  );
}
