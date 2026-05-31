import React, { useState } from 'react';
import { BookOpen, Users, Clock, Calendar, ArrowRight, ArrowLeft, Check, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/authService';
import toast from 'react-hot-toast';

const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [subjects, setSubjects] = useState([
    { subjectCode: 'CS301', subjectName: 'Software Engineering', totalClasses: 45 },
    { subjectCode: 'CS302', subjectName: 'Database Management Systems', totalClasses: 45 },
    { subjectCode: 'CS303', subjectName: 'Web Technologies', totalClasses: 40 }
  ]);
  
  const [studentData, setStudentData] = useState({
    currentSemester: 3,
    branch: 'CSE',
    section: 'A'
  });

  const addSubject = () => {
    setSubjects([...subjects, { subjectCode: '', subjectName: '', totalClasses: 45 }]);
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
      // Update student profile (this updates currentSemester, branch, section)
      await api.put('/auth/profile', studentData);
      
      // Create academic record with subjects
      const academicRecord = {
        semester: studentData.currentSemester,
        subjects: subjects.map(s => ({
          subjectCode: s.subjectCode.toUpperCase(),
          subjectName: s.subjectName,
          attendance: { totalClasses: s.totalClasses, attendedClasses: 0 },
          marks: { internal1: 0, internal2: 0, assignments: 0, external: 0 }
        }))
      };
      
      await api.post('/academic/record', academicRecord);
      
      toast.success('Student profile onboarding completed successfully! 🎉');
      
      // Update local storage user profile so currentSemester is recorded immediately
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = { ...user, ...studentData };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      toast.error('Failed to complete onboarding setup');
    } finally {
      setLoading(false);
    }
  };

  const Step1 = () => (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-indigo-600/10 border border-indigo-500/25 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/5">
          <Users className="w-8 h-8 text-indigo-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Welcome to Vignan Cockpit!</h2>
        <p className="text-slate-400 text-sm leading-relaxed">Let's initialize your student academic details</p>
      </div>

      <div className="card p-8 bg-[#0F1424]/60 backdrop-blur-xl border border-slate-800/80 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl" />
        
        <h3 className="text-lg font-bold text-white mb-6 flex items-center">
          <Sparkles className="w-4 h-4 text-indigo-400 mr-2" />
          <span>Academic Information</span>
        </h3>
        
        <div className="space-y-6">
          <div>
            <label className="label">Current Semester</label>
            <select
              value={studentData.currentSemester}
              onChange={(e) => setStudentData({...studentData, currentSemester: parseInt(e.target.value)})}
              className="input"
            >
              {[1,2,3,4,5,6,7,8].map(sem => (
                <option key={sem} value={sem} className="bg-slate-900">Semester {sem}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Select Branch</label>
            <select
              value={studentData.branch}
              onChange={(e) => setStudentData({...studentData, branch: e.target.value})}
              className="input"
            >
              <option value="" disabled className="bg-slate-900 text-slate-500">Select Branch</option>
              <option value="CSE" className="bg-slate-900">Computer Science Engineering (CSE)</option>
              <option value="ECE" className="bg-slate-900">Electronics & Communication (ECE)</option>
              <option value="MECH" className="bg-slate-900">Mechanical Engineering (MECH)</option>
              <option value="EEE" className="bg-slate-900">Electrical & Electronics (EEE)</option>
              <option value="CIVIL" className="bg-slate-900">Civil Engineering</option>
              <option value="IT" className="bg-slate-900">Information Technology (IT)</option>
            </select>
          </div>

          <div>
            <label className="label">Section</label>
            <select
              value={studentData.section}
              onChange={(e) => setStudentData({...studentData, section: e.target.value})}
              className="input"
            >
              <option value="" disabled className="bg-slate-900 text-slate-500">Select Section</option>
              <option value="A" className="bg-slate-900">Section A</option>
              <option value="B" className="bg-slate-900">Section B</option>
              <option value="C" className="bg-slate-900">Section C</option>
              <option value="D" className="bg-slate-900">Section D</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end mt-8 border-t border-slate-800/80 pt-6">
          <button
            onClick={nextStep}
            disabled={!studentData.branch || !studentData.section}
            className="btn btn-primary btn-md flex items-center space-x-2 shadow-lg shadow-indigo-500/15"
          >
            <span>Next Step</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  const Step2 = () => (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-emerald-600/10 border border-emerald-500/25 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/5">
          <BookOpen className="w-8 h-8 text-emerald-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Registered Subjects</h2>
        <p className="text-slate-400 text-sm leading-relaxed">Enter your subject codes, names, and expected classes for this semester</p>
      </div>

      <div className="card p-8 bg-[#0F1424]/60 backdrop-blur-xl border border-slate-800/80 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl" />

        <div className="flex justify-between items-center mb-6 border-b border-slate-800/80 pb-4">
          <h3 className="text-lg font-bold text-white">Subject List Configuration</h3>
          <button
            onClick={addSubject}
            className="btn btn-secondary btn-sm"
          >
            Add Subject Field
          </button>
        </div>

        <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
          {subjects.map((subject, index) => (
            <div key={index} className="border border-slate-850 bg-slate-950/20 rounded-2xl p-5 relative overflow-hidden group hover:border-slate-800 transition-colors">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Subject Code</label>
                  <input
                    type="text"
                    placeholder="e.g. CS301"
                    value={subject.subjectCode}
                    onChange={(e) => updateSubject(index, 'subjectCode', e.target.value.toUpperCase())}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Subject Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Software Engineering"
                    value={subject.subjectName}
                    onChange={(e) => updateSubject(index, 'subjectName', e.target.value)}
                    className="input"
                    required
                  />
                </div>
                <div className="flex space-x-3.5 items-end">
                  <div className="flex-1">
                    <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Estimated Classes</label>
                    <input
                      type="number"
                      placeholder="e.g. 45"
                      value={subject.totalClasses}
                      onChange={(e) => updateSubject(index, 'totalClasses', parseInt(e.target.value) || 0)}
                      className="input"
                      required
                    />
                  </div>
                  {subjects.length > 1 && (
                    <button
                      onClick={() => removeSubject(index)}
                      className="btn btn-outline btn-md text-rose-400 border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 hover:border-rose-500/30"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between mt-8 border-t border-slate-800/80 pt-6">
          <button
            onClick={prevStep}
            className="btn btn-outline btn-md flex items-center space-x-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          
          <button
            onClick={nextStep}
            disabled={subjects.some(s => !s.subjectCode || !s.subjectName || s.totalClasses <= 0)}
            className="btn btn-primary btn-md flex items-center space-x-1.5 shadow-lg shadow-indigo-500/15"
          >
            <span>Review Profile</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  const Step3 = () => (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-purple-600/10 border border-purple-500/25 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/5">
          <Check className="w-8 h-8 text-purple-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Review Profile Parameters</h2>
        <p className="text-slate-400 text-sm leading-relaxed">Review the details below prior to activating your cockpit</p>
      </div>

      <div className="card p-8 bg-[#0F1424]/60 backdrop-blur-xl border border-slate-800/80 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl" />

        <div className="space-y-6">
          <div>
            <h3 className="text-base font-bold text-white mb-3">Academic Registration</h3>
            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-950/40 border border-slate-900 rounded-2xl text-sm">
              <div>
                <p className="text-xs text-slate-500">Current Semester</p>
                <p className="font-semibold text-slate-200 mt-0.5">Semester {studentData.currentSemester}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Branch Name</p>
                <p className="font-semibold text-slate-200 mt-0.5">{studentData.branch}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Section Name</p>
                <p className="font-semibold text-slate-200 mt-0.5">Section {studentData.section}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Total subjects configured</p>
                <p className="font-semibold text-slate-200 mt-0.5">{subjects.length} subjects</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-base font-bold text-white mb-3">Registered Subjects List</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {subjects.map((subject, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-slate-950/20 border border-slate-850 rounded-xl text-xs">
                  <div>
                    <span className="font-bold text-indigo-400 font-mono tracking-wider">{subject.subjectCode.toUpperCase()}</span>
                    <span className="mx-2 text-slate-600">—</span>
                    <span className="text-slate-300 font-semibold">{subject.subjectName}</span>
                  </div>
                  <span className="text-slate-500">{subject.totalClasses} classes</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-between mt-8 border-t border-slate-800/80 pt-6">
          <button
            onClick={prevStep}
            className="btn btn-outline btn-md flex items-center space-x-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          
          <button
            onClick={submitData}
            disabled={loading}
            className="btn btn-primary btn-md flex items-center space-x-1.5 shadow-lg shadow-indigo-500/25"
          >
            <span>{loading ? 'Activating Cockpit...' : 'Activate Cockpit'}</span>
            <Check className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-[#080B11] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Multistep header steps */}
        <div className="flex justify-center mb-10">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold transition-all duration-500 border ${
                  step >= stepNum 
                    ? 'bg-gradient-to-tr from-indigo-600 to-indigo-500 border-indigo-400/40 text-white shadow-lg shadow-indigo-500/20' 
                    : 'bg-slate-900 border-slate-800 text-slate-500'
                }`}>
                  {step > stepNum ? <Check className="w-5 h-5" /> : stepNum}
                </div>
                {stepNum < 3 && (
                  <div className={`w-16 h-1 rounded-full ${
                    step > stepNum ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 shadow-md shadow-indigo-500/20' : 'bg-slate-800'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step contents mapping */}
        {step === 1 && <Step1 />}
        {step === 2 && <Step2 />}
        {step === 3 && <Step3 />}
      </div>
    </div>
  );
};

export default Onboarding;
