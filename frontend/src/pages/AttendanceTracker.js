import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle, XCircle, AlertCircle, Save, Sparkles, BookOpen, AlertTriangle } from 'lucide-react';
import api from '../services/authService';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const AttendanceTracker = () => {
  const [subjects, setSubjects] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [todayClasses, setTodayClasses] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (subjects.length > 0) {
      fetchTodayClasses();
    }
  }, [subjects]);

  const fetchSubjects = async () => {
    try {
      const response = await api.get('/academic/records');
      if (response.data.length > 0) {
        // Get the latest semester
        const currentSemester = response.data[0];
        setSubjects(currentSemester.subjects || []);
        setAttendanceRecords(currentSemester.subjects.map(subject => ({
          subjectCode: subject.subjectCode,
          subjectName: subject.subjectName,
          attended: false,
          status: 'not-marked'
        })));
      } else {
        // Fallback mock subjects if onboarding is not done yet
        const mockSubjects = [
          { subjectCode: 'CS301', subjectName: 'Software Engineering', attendance: { totalClasses: 40, attendedClasses: 36 } },
          { subjectCode: 'CS302', subjectName: 'Database Management Systems', attendance: { totalClasses: 45, attendedClasses: 32 } },
          { subjectCode: 'CS303', subjectName: 'Web Technologies', attendance: { totalClasses: 38, attendedClasses: 34 } },
          { subjectCode: 'CS304', subjectName: 'Computer Networks', attendance: { totalClasses: 42, attendedClasses: 28 } }
        ];
        setSubjects(mockSubjects);
        setAttendanceRecords(mockSubjects.map(subject => ({
          subjectCode: subject.subjectCode,
          subjectName: subject.subjectName,
          attended: false,
          status: 'not-marked'
        })));
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const fetchTodayClasses = () => {
    // Simulate today's schedules
    const rooms = ['A-101', 'B-205', 'C-302', 'D-401', 'Lab-3'];
    const times = ['09:00 AM', '10:00 AM', '11:15 AM', '02:00 PM'];
    
    const simulatedClasses = subjects.slice(0, 4).map((subject, idx) => ({
      subjectCode: subject.subjectCode,
      subjectName: subject.subjectName,
      time: times[idx] || '03:00 PM',
      room: rooms[idx] || 'A-102'
    }));
    setTodayClasses(simulatedClasses);
  };

  const markAttendance = (index, status) => {
    const updated = [...attendanceRecords];
    updated[index] = {
      ...updated[index],
      attended: status === 'present' || status === 'late',
      status
    };
    setAttendanceRecords(updated);
  };

  const saveAttendance = async () => {
    setLoading(true);
    try {
      // Find latest semester academic record
      const recordsResponse = await api.get('/academic/records');
      if (recordsResponse.data.length === 0) {
        toast.error('Complete onboarding setup before tracking attendance.');
        setLoading(false);
        return;
      }
      
      const record = recordsResponse.data[0];
      const semester = record.semester;

      // Update attendance for marked subjects
      for (const entry of attendanceRecords) {
        if (entry.status !== 'not-marked') {
          const subject = record.subjects.find(s => s.subjectCode === entry.subjectCode);
          if (subject) {
            const currentTotal = subject.attendance.totalClasses + 1;
            const currentAttended = entry.attended 
              ? subject.attendance.attendedClasses + 1 
              : subject.attendance.attendedClasses;

            await api.put('/academic/attendance', {
              semester,
              subjectCode: entry.subjectCode,
              totalClasses: currentTotal,
              attendedClasses: currentAttended
            });
          }
        }
      }
      
      toast.success('Attendance sheets updated successfully! 📝');
      fetchSubjects(); // Refresh summary percentages
      
      // Reset marking statuses
      setAttendanceRecords(prev => prev.map(r => ({ ...r, status: 'not-marked' })));
    } catch (error) {
      console.error(error);
      toast.error('Failed to save attendance logs');
    } finally {
      setLoading(false);
    }
  };

  const calculateAttendancePercentage = (subject) => {
    if (!subject.attendance || subject.attendance.totalClasses === 0) return 100;
    const percentage = (subject.attendance.attendedClasses / subject.attendance.totalClasses) * 100;
    return Math.round(percentage);
  };

  const getAttendanceStatusColor = (percentage) => {
    if (percentage >= 90) return 'text-emerald-400';
    if (percentage >= 75) return 'text-amber-400';
    return 'text-rose-400 font-extrabold';
  };

  const getAttendanceBadgeColor = (status) => {
    switch (status) {
      case 'present': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'absent': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'late': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default: return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div className="border-b border-slate-800 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">
            Attendance <span className="text-gradient">Tracker</span> System
          </h1>
          <p className="text-slate-400 mt-1 text-sm">Register class presences daily and monitor Vignan's 75% semester criteria.</p>
        </div>
        
        <button
          onClick={saveAttendance}
          disabled={loading || attendanceRecords.every(r => r.status === 'not-marked')}
          className="btn btn-primary btn-md flex items-center space-x-2 shadow-lg shadow-indigo-500/25"
        >
          <span>{loading ? 'Saving Logs...' : 'Save Attendance'}</span>
          <Save className="w-4 h-4" />
        </button>
      </div>

      {/* Date select panel */}
      <div className="card p-6 bg-[#0F1424]/60 backdrop-blur-xl border border-slate-800/80 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/25 shadow-inner">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Select Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="input border-slate-850 bg-slate-950/60 mt-1 h-9 max-w-xs"
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>
          <div className="text-slate-400 text-xs flex items-center bg-slate-950/40 px-4 py-2 border border-slate-850 rounded-xl max-w-sm">
            <Sparkles className="w-4 h-4 text-amber-400 mr-2 flex-shrink-0" />
            <span>Marking attendance increments the total class counts for respective subjects automatically.</span>
          </div>
        </div>
      </div>

      {/* Grid: Simulated Classes vs Attendance Marking */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Today's Schedule Board */}
        <div className="lg:col-span-5 card p-6 bg-[#0F1424]/60 backdrop-blur-xl border border-slate-800/80 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-5 flex items-center">
            <BookOpen className="w-5 h-5 text-indigo-400 mr-2" />
            <span>Class Timetable (Today)</span>
          </h2>
          
          <div className="space-y-4">
            {todayClasses.length > 0 ? (
              todayClasses.map((item, index) => (
                <div key={index} className="border border-slate-850 bg-slate-950/20 rounded-xl p-4 flex justify-between items-center group hover:border-slate-700 transition-all">
                  <div>
                    <span className="text-[10px] font-mono font-bold tracking-wider text-slate-500 uppercase">{item.subjectCode}</span>
                    <p className="font-semibold text-slate-200 text-sm mt-0.5">{item.subjectName}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-300">{item.time}</span>
                    <p className="text-[10px] text-slate-500 mt-0.5">Room: {item.room}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-slate-600">
                <Calendar className="w-10 h-10 mx-auto animate-pulse" />
                <p className="text-xs mt-2">No active class structures registered.</p>
              </div>
            )}
          </div>
        </div>

        {/* Mark Attendance Sheets */}
        <div className="lg:col-span-7 card p-6 bg-[#0F1424]/60 backdrop-blur-xl border border-slate-800/80 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-5">Daily Check-In Sheet</h2>
          
          <div className="space-y-4">
            {attendanceRecords.map((record, index) => {
              const matchingSubject = subjects.find(s => s.subjectCode === record.subjectCode);
              const percentage = matchingSubject ? calculateAttendancePercentage(matchingSubject) : 100;
              return (
                <div key={record.subjectCode} className="border border-slate-850 bg-slate-950/20 rounded-xl p-4 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                    <div>
                      <span className="text-[10px] font-mono text-slate-500 font-bold uppercase">{record.subjectCode}</span>
                      <h4 className="font-semibold text-slate-200 text-sm mt-0.5">{record.subjectName}</h4>
                      <p className="text-[10px] text-slate-500 mt-1">
                        Current record percentage: <span className={`font-bold ${getAttendanceStatusColor(percentage)}`}>{percentage}%</span>
                      </p>
                    </div>

                    {/* Interactive present/absent/late buttons */}
                    <div className="flex items-center space-x-2.5">
                      <button
                        onClick={() => markAttendance(index, 'present')}
                        className={`p-2.5 rounded-xl border transition-all duration-300 ${
                          record.status === 'present' 
                            ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400 shadow-md shadow-emerald-500/5' 
                            : 'bg-slate-900/60 border-slate-800 text-slate-500 hover:text-emerald-400 hover:bg-slate-850'
                        }`}
                        title="Mark Present"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                      
                      <button
                        onClick={() => markAttendance(index, 'absent')}
                        className={`p-2.5 rounded-xl border transition-all duration-300 ${
                          record.status === 'absent' 
                            ? 'bg-rose-500/20 border-rose-500/40 text-rose-400 shadow-md shadow-rose-500/5' 
                            : 'bg-slate-900/60 border-slate-800 text-slate-500 hover:text-rose-400 hover:bg-slate-850'
                        }`}
                        title="Mark Absent"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                      
                      <button
                        onClick={() => markAttendance(index, 'late')}
                        className={`p-2.5 rounded-xl border transition-all duration-300 ${
                          record.status === 'late' 
                            ? 'bg-amber-500/20 border-amber-500/40 text-amber-400 shadow-md shadow-amber-500/5' 
                            : 'bg-slate-900/60 border-slate-800 text-slate-500 hover:text-amber-400 hover:bg-slate-850'
                        }`}
                        title="Mark Late / Excused"
                      >
                        <AlertCircle className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {record.status !== 'not-marked' && (
                    <div className="flex items-center space-x-2">
                      <span className={`badge text-[9px] tracking-wider uppercase ${getAttendanceBadgeColor(record.status)}`}>
                        Status: {record.status}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Attendance Summary List */}
      <div className="card p-6 bg-[#0F1424]/60 backdrop-blur-xl border border-slate-800/80 shadow-xl">
        <h2 className="text-xl font-bold text-white mb-6">Subject Attendance Analytics</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subject) => {
            const percentage = calculateAttendancePercentage(subject);
            const isBelowLimit = percentage < 75;
            return (
              <div key={subject.subjectCode} className={`border rounded-xl p-5 space-y-3 relative overflow-hidden bg-slate-950/20 ${
                isBelowLimit ? 'border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.02)]' : 'border-slate-800'
              }`}>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 font-bold uppercase">{subject.subjectCode}</span>
                    <p className="font-bold text-slate-200 text-sm mt-0.5 line-clamp-1">{subject.subjectName}</p>
                  </div>
                  <span className={`text-xl font-extrabold font-mono ${getAttendanceStatusColor(percentage)}`}>
                    {percentage}%
                  </span>
                </div>
                
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Attended classes: <b className="text-slate-200 font-bold">{subject.attendance?.attendedClasses || 0}</b></span>
                  <span>Total classes: <b className="text-slate-200 font-bold">{subject.attendance?.totalClasses || 0}</b></span>
                </div>
                
                {/* Progress bar progress fill */}
                <div className="mt-2">
                  <div className="progress-bar">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        percentage >= 90 ? 'bg-gradient-to-r from-emerald-500 to-teal-500' :
                        percentage >= 75 ? 'bg-gradient-to-r from-amber-500 to-yellow-500' : 
                        'bg-gradient-to-r from-rose-500 to-red-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>

                {/* Below 75% warning banner */}
                {isBelowLimit && (
                  <div className="mt-2.5 p-2 bg-rose-500/10 border border-rose-500/25 rounded-lg flex items-center space-x-2 text-[10px] text-rose-400 leading-relaxed font-semibold">
                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>Below Vignan's 75% criterion. Exam registration risk!</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default AttendanceTracker;
