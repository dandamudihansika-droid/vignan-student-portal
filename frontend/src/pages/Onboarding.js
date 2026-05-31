import React, { useState } from 'react';
import { BookOpen, Users, Clock, Calendar, ArrowRight, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/authService';
import toast from 'react-hot-toast';

const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [subjects, setSubjects] = useState([
    { subjectCode: '', subjectName: '', totalClasses: 0 }
  ]);
  
  const [studentData, setStudentData] = useState({
    currentSemester: 1,
    branch: '',
    section: ''
  });

  const addSubject = () => {
    setSubjects([...subjects, { subjectCode: '', subjectName: '', totalClasses: 0 }]);
  };

  const updateSubject = (index, field, value) => {
    const updated = [...subjects];
    updated[index][field] = value;
    setSubjects(updated);
  };

  const removeSubject = (index) => {
    setSubjects(subjects.filter((_, i) => i !== index));
  };

  const nextStep = () => {
    if (step < 3) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const submitData = async () => {
    setLoading(true);
    try {
      // Update student profile
      await api.put('/auth/profile', studentData);
      
      // Create academic record with subjects
      const academicRecord = {
        semester: studentData.currentSemester,
        subjects: subjects.map(s => ({
          subjectCode: s.subjectCode,
          subjectName: s.subjectName,
          attendance: { totalClasses: s.totalClasses, attendedClasses: 0 },
          marks: { internal1: 0, internal2: 0, assignments: 0, external: 0 }
        }))
      };
      
      await api.post('/academic/record', academicRecord);
      
      toast.success('Setup completed successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to complete setup');
    } finally {
      setLoading(false);
    }
  };

  const Step1 = () => (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Users className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Vignan Student Portal!</h2>
        <p className="text-gray-600">Let's set up your academic profile</p>
      </div>

      <div className="card p-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Academic Information</h3>
        
        <div className="space-y-6">
          <div>
            <label className="label">Current Semester</label>
            <select
              value={studentData.currentSemester}
              onChange={(e) => setStudentData({...studentData, currentSemester: parseInt(e.target.value)})}
              className="input"
            >
              {[1,2,3,4,5,6,7,8].map(sem => (
                <option key={sem} value={sem}>Semester {sem}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Branch</label>
            <select
              value={studentData.branch}
              onChange={(e) => setStudentData({...studentData, branch: e.target.value})}
              className="input"
            >
              <option value="">Select Branch</option>
              <option value="CSE">Computer Science Engineering</option>
              <option value="ECE">Electronics & Communication</option>
              <option value="MECH">Mechanical Engineering</option>
              <option value="EEE">Electrical & Electronics</option>
              <option value="CIVIL">Civil Engineering</option>
              <option value="IT">Information Technology</option>
            </select>
          </div>

          <div>
            <label className="label">Section</label>
            <select
              value={studentData.section}
              onChange={(e) => setStudentData({...studentData, section: e.target.value})}
              className="input"
            >
              <option value="">Select Section</option>
              <option value="A">Section A</option>
              <option value="B">Section B</option>
              <option value="C">Section C</option>
              <option value="D">Section D</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end mt-8">
          <button
            onClick={nextStep}
            disabled={!studentData.branch || !studentData.section}
            className="btn btn-primary flex items-center space-x-2"
          >
            <span>Next</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  const Step2 = () => (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <BookOpen className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Add Your Subjects</h2>
        <p className="text-gray-600">Enter subject codes and total classes for this semester</p>
      </div>

      <div className="card p-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Subject List</h3>
          <button
            onClick={addSubject}
            className="btn btn-secondary"
          >
            Add Subject
          </button>
        </div>

        <div className="space-y-4">
          {subjects.map((subject, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="label">Subject Code</label>
                  <input
                    type="text"
                    placeholder="e.g., CS101"
                    value={subject.subjectCode}
                    onChange={(e) => updateSubject(index, 'subjectCode', e.target.value.toUpperCase())}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Subject Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Programming Fundamentals"
                    value={subject.subjectName}
                    onChange={(e) => updateSubject(index, 'subjectName', e.target.value)}
                    className="input"
                  />
                </div>
                <div className="flex space-x-2">
                  <div className="flex-1">
                    <label className="label">Total Classes</label>
                    <input
                      type="number"
                      placeholder="e.g., 45"
                      value={subject.totalClasses}
                      onChange={(e) => updateSubject(index, 'totalClasses', parseInt(e.target.value) || 0)}
                      className="input"
                    />
                  </div>
                  {subjects.length > 1 && (
                    <button
                      onClick={() => removeSubject(index)}
                      className="btn btn-outline mt-6"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between mt-8">
          <button
            onClick={prevStep}
            className="btn btn-outline"
          >
            Previous
          </button>
          <button
            onClick={nextStep}
            disabled={subjects.some(s => !s.subjectCode || !s.subjectName || s.totalClasses <= 0)}
            className="btn btn-primary flex items-center space-x-2"
          >
            <span>Next</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  const Step3 = () => (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-purple-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Review Your Information</h2>
        <p className="text-gray-600">Please review before submitting</p>
      </div>

      <div className="card p-8">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Academic Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Semester</p>
                <p className="font-medium">Semester {studentData.currentSemester}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Branch</p>
                <p className="font-medium">{studentData.branch}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Section</p>
                <p className="font-medium">Section {studentData.section}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Subjects</p>
                <p className="font-medium">{subjects.length}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Subjects</h3>
            <div className="space-y-2">
              {subjects.map((subject, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div>
                    <span className="font-medium">{subject.subjectCode}</span>
                    <span className="mx-2 text-gray-500">-</span>
                    <span>{subject.subjectName}</span>
                  </div>
                  <span className="text-sm text-gray-600">{subject.totalClasses} classes</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-between mt-8">
          <button
            onClick={prevStep}
            className="btn btn-outline"
          >
            Previous
          </button>
          <button
            onClick={submitData}
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? 'Submitting...' : 'Complete Setup'}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step >= stepNum ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {step > stepNum ? <Check className="w-5 h-5" /> : stepNum}
                </div>
                {stepNum < 3 && (
                  <div className={`w-16 h-1 ${
                    step > stepNum ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        {step === 1 && <Step1 />}
        {step === 2 && <Step2 />}
        {step === 3 && <Step3 />}
      </div>
    </div>
  );
};

export default Onboarding;
