import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle, XCircle, AlertCircle, Plus, Save } from 'lucide-react';
import api from '../services/authService';
import toast from 'react-hot-toast';

const AttendanceTracker = () => {
  const [subjects, setSubjects] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [todayClasses, setTodayClasses] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSubjects();
    fetchTodayClasses();
  }, []);

  const fetchSubjects = async () => {
    try {
      const response = await api.get('/academic/records');
      if (response.data.length > 0) {
        const currentSemester = response.data[response.data.length - 1];
        setSubjects(currentSemester.subjects);
        setAttendanceRecords(currentSemester.subjects.map(subject => ({
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

  const fetchTodayClasses = async () => {
    try {
      // This would ideally fetch from a schedule API
      // For now, we'll simulate daily classes
      const simulatedClasses = subjects.map(subject => ({
        subjectCode: subject.subjectCode,
        subjectName: subject.subjectName,
        time: getRandomTime(),
        room: getRandomRoom()
      }));
      setTodayClasses(simulatedClasses);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const getRandomTime = () => {
    const times = ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'];
    return times[Math.floor(Math.random() * times.length)];
  };

  const getRandomRoom = () => {
    const rooms = ['A-101', 'B-205', 'C-302', 'D-401', 'E-503', 'Lab-1', 'Lab-2'];
    return rooms[Math.floor(Math.random() * rooms.length)];
  };

  const markAttendance = (index, status) => {
    const updated = [...attendanceRecords];
    updated[index] = {
      ...updated[index],
      attended: status === 'present',
      status
    };
    setAttendanceRecords(updated);
  };

  const saveAttendance = async () => {
    setLoading(true);
    try {
      // Update attendance for each subject
      for (const record of attendanceRecords) {
        if (record.status !== 'not-marked') {
          await api.put('/academic/attendance', {
            subjectCode: record.subjectCode,
            date: selectedDate,
            attended: record.attended
          });
        }
      }
      
      toast.success('Attendance saved successfully!');
      fetchSubjects(); // Refresh to get updated percentages
    } catch (error) {
      toast.error('Failed to save attendance');
    } finally {
      setLoading(false);
    }
  };

  const calculateAttendancePercentage = (subject) => {
    if (!subject.attendance) return 0;
    const percentage = (subject.attendance.attendedClasses / subject.attendance.totalClasses) * 100;
    return percentage.toFixed(1);
  };

  const getAttendanceStatusColor = (percentage) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAttendanceBadgeColor = (status) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800';
      case 'absent': return 'bg-red-100 text-red-800';
      case 'late': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Attendance Tracker</h1>
        <p className="text-gray-600 mt-2">Mark your daily attendance and track your progress</p>
      </div>

      {/* Date Selection */}
      <div className="card p-6 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Calendar className="w-5 h-5 text-gray-600" />
            <div>
              <label className="label">Select Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="input"
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>
          
          <button
            onClick={saveAttendance}
            disabled={loading || attendanceRecords.every(r => r.status === 'not-marked')}
            className="btn btn-primary flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Saving...' : 'Save Attendance'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Today's Classes */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Today's Classes</h2>
          
          <div className="space-y-4">
            {todayClasses.length > 0 ? (
              todayClasses.map((classItem, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">{classItem.subjectCode}</p>
                      <p className="text-sm text-gray-600">{classItem.subjectName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{classItem.time}</p>
                      <p className="text-xs text-gray-500">Room: {classItem.room}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No classes scheduled for today</p>
              </div>
            )}
          </div>
        </div>

        {/* Mark Attendance */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Mark Attendance</h2>
          
          <div className="space-y-4">
            {attendanceRecords.map((record, index) => (
              <div key={record.subjectCode} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-900">{record.subjectCode}</p>
                    <p className="text-sm text-gray-600">{record.subjectName}</p>
                    {subjects.find(s => s.subjectCode === record.subjectCode) && (
                      <p className="text-xs text-gray-500 mt-1">
                        Current Attendance: {calculateAttendancePercentage(subjects.find(s => s.subjectCode === record.subjectCode))}%
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => markAttendance(index, 'present')}
                      className={`p-2 rounded-lg ${
                        record.status === 'present' 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-gray-100 text-gray-600 hover:bg-green-50'
                      }`}
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => markAttendance(index, 'absent')}
                      className={`p-2 rounded-lg ${
                        record.status === 'absent' 
                          ? 'bg-red-100 text-red-600' 
                          : 'bg-gray-100 text-gray-600 hover:bg-red-50'
                      }`}
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => markAttendance(index, 'late')}
                      className={`p-2 rounded-lg ${
                        record.status === 'late' 
                          ? 'bg-yellow-100 text-yellow-600' 
                          : 'bg-gray-100 text-gray-600 hover:bg-yellow-50'
                      }`}
                    >
                      <AlertCircle className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                {record.status !== 'not-marked' && (
                  <div className="mt-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getAttendanceBadgeColor(record.status)}`}>
                      {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Attendance Summary */}
      <div className="card p-6 mt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Attendance Summary</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subject) => (
            <div key={subject.subjectCode} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-medium text-gray-900">{subject.subjectCode}</p>
                  <p className="text-sm text-gray-600">{subject.subjectName}</p>
                </div>
                <span className={`text-lg font-bold ${getAttendanceStatusColor(calculateAttendancePercentage(subject))}`}>
                  {calculateAttendancePercentage(subject)}%
                </span>
              </div>
              
              <div className="flex justify-between text-sm text-gray-600">
                <span>Attended: {subject.attendance?.attendedClasses || 0}</span>
                <span>Total: {subject.attendance?.totalClasses || 0}</span>
              </div>
              
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      calculateAttendancePercentage(subject) >= 90 ? 'bg-green-600' :
                      calculateAttendancePercentage(subject) >= 75 ? 'bg-yellow-600' : 'bg-red-600'
                    }`}
                    style={{ width: `${calculateAttendancePercentage(subject)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AttendanceTracker;
