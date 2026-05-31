import React, { useState, useEffect } from 'react';
import { BookOpen, TrendingUp, Award, Calendar, Plus, Edit, X, Save, AlertCircle } from 'lucide-react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import api from '../services/authService';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Academics = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [records, setRecords] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [formData, setFormData] = useState({
    semester: 1,
    subjects: []
  });

  useEffect(() => {
    fetchAcademicRecords();
    fetchAnalytics();
  }, []);

  const fetchAcademicRecords = async () => {
    try {
      const response = await api.get('/academic/records');
      setRecords(response.data || []);
    } catch (error) {
      console.error('Error fetching records:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await api.get('/academic/analytics');
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const subjectTemplate = {
    subjectCode: '',
    subjectName: '',
    attendance: { totalClasses: 45, attendedClasses: 40 },
    marks: { internal1: 25, internal2: 24, assignments: 18, external: 60 }
  };

  const addSubject = () => {
    setFormData(prev => ({
      ...prev,
      subjects: [...prev.subjects, { ...subjectTemplate }]
    }));
  };

  const updateSubject = (index, field, value) => {
    const updatedSubjects = [...formData.subjects];
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      // Deep copy nested object
      updatedSubjects[index][parent] = {
        ...updatedSubjects[index][parent],
        [child]: value
      };
    } else {
      updatedSubjects[index][field] = value;
    }
    setFormData(prev => ({ ...prev, subjects: updatedSubjects }));
  };

  const removeSubject = (index) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.filter((_, i) => i !== index)
    }));
  };

  const saveRecord = async () => {
    try {
      // Basic validation
      if (formData.subjects.some(s => !s.subjectCode || !s.subjectName)) {
        toast.error('Please fill out all subject names and codes.');
        return;
      }

      await api.post('/academic/record', formData);
      toast.success(editingRecord ? 'Record updated successfully! 🎓' : 'Record added successfully! 🎓');
      
      setShowAddModal(false);
      setEditingRecord(null);
      setFormData({ semester: 1, subjects: [] });
      fetchAcademicRecords();
      fetchAnalytics();
    } catch (error) {
      toast.error('Failed to save academic record');
    }
  };

  const getGradeColor = (grade) => {
    const colors = {
      'O': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      'A+': 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
      'A': 'text-sky-400 bg-sky-500/10 border-sky-500/20',
      'B+': 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      'B': 'text-amber-400/80 bg-amber-500/5 border-amber-500/10',
      'C': 'text-orange-400 bg-orange-500/10 border-orange-500/20',
      'D': 'text-rose-400 bg-rose-500/10 border-rose-500/20',
      'F': 'text-red-400 bg-red-500/10 border-red-500/20'
    };
    return colors[grade] || 'text-slate-400 bg-slate-800/10 border-slate-800/20';
  };

  const getAttendanceColor = (percentage) => {
    if (percentage >= 90) return 'text-emerald-400';
    if (percentage >= 75) return 'text-amber-400';
    return 'text-rose-400 font-bold';
  };

  // GPA line progress chart
  const getGPATrendChart = () => {
    let labels = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'];
    let gpaData = [8.2, 8.5, 7.9, 8.8]; // fallbacks
    let attendanceData = [85, 92, 78, 90]; // fallbacks

    if (analytics?.performanceTrends?.length > 0) {
      labels = analytics.performanceTrends.map(t => `Sem ${t.semester}`);
      gpaData = analytics.performanceTrends.map(t => t.sgpa);
      attendanceData = analytics.performanceTrends.map(t => t.overallAttendance);
    } else if (records.length > 0) {
      const reversed = [...records].reverse();
      labels = reversed.map(r => `Sem ${r.semester}`);
      gpaData = reversed.map(r => r.sgpa);
      attendanceData = reversed.map(r => r.overallAttendance);
    }

    return {
      labels,
      datasets: [
        {
          label: 'SGPA Trend',
          data: gpaData,
          borderColor: '#f59e0b',
          backgroundColor: 'rgba(245, 158, 11, 0.15)',
          fill: true,
          tension: 0.3,
          pointBorderColor: '#f59e0b',
          pointBackgroundColor: '#0F1424',
          pointBorderWidth: 2,
          yAxisID: 'y'
        },
        {
          label: 'Overall Attendance (%)',
          data: attendanceData,
          borderColor: '#10b981',
          fill: false,
          tension: 0.3,
          pointBorderColor: '#10b981',
          pointBackgroundColor: '#0F1424',
          pointBorderWidth: 2,
          yAxisID: 'y1'
        }
      ]
    };
  };

  // Bar chart: internal vs external marks comparison
  const getMarksComparisonChart = () => {
    let labels = ['Subject 1', 'Subject 2', 'Subject 3', 'Subject 4', 'Subject 5'];
    let internalData = [24, 25, 23, 26, 25];
    let externalData = [55, 60, 48, 62, 58];

    if (records.length > 0) {
      const currentSubjects = records[0].subjects;
      labels = currentSubjects.map(s => s.subjectCode);
      internalData = currentSubjects.map(s => s.marks.internal1 + s.marks.internal2);
      externalData = currentSubjects.map(s => s.marks.external);
    }

    return {
      labels,
      datasets: [
        {
          label: 'Internal Marks (Max 60)',
          data: internalData,
          backgroundColor: 'rgba(99, 102, 241, 0.85)',
          borderRadius: 4
        },
        {
          label: 'External Marks (Max 70)',
          data: externalData,
          backgroundColor: 'rgba(245, 158, 11, 0.85)',
          borderRadius: 4
        }
      ]
    };
  };

  const OverviewCard = ({ title, value, subtitle, icon: Icon, color }) => (
    <div className="card p-6 bg-[#0F1424]/60 backdrop-blur-xl border border-slate-800/80 shadow-xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/5 rounded-full blur-xl group-hover:bg-amber-500/10 transition-all duration-300" />
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</p>
          <p className="text-3xl font-extrabold text-white mt-1 drop-shadow-[0_0_15px_rgba(245,158,11,0.25)]">{value}</p>
          <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
        </div>
        <div className={`p-3.5 bg-gradient-to-tr ${color} text-white rounded-xl shadow-lg shadow-black/10`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );

  const SubjectTable = ({ record }) => (
    <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950/20">
      <table className="min-w-full divide-y divide-slate-800/80">
        <thead className="bg-slate-900/60">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Subject</th>
            <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Attendance</th>
            <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Internal 1 (30)</th>
            <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Internal 2 (30)</th>
            <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">External (70)</th>
            <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Total (100)</th>
            <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Grade</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60 text-slate-300">
          {record.subjects.map((subject, index) => (
            <tr key={index} className="hover:bg-slate-900/30 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div>
                  <div className="text-sm font-bold text-slate-200">{subject.subjectName}</div>
                  <div className="text-xs font-mono text-slate-500 mt-0.5">{subject.subjectCode}</div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center space-x-2">
                  <span className={`text-sm font-bold ${getAttendanceColor(subject.attendance?.percentage || 0)}`}>
                    {subject.attendance?.percentage || 0}%
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    ({subject.attendance?.attendedClasses || 0}/{subject.attendance?.totalClasses || 0})
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">{subject.marks?.internal1 || 0}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">{subject.marks?.internal2 || 0}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">{subject.marks?.external || 0}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm font-extrabold text-white font-mono">{subject.marks?.total || 0}</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`badge text-[9px] tracking-wider ${getGradeColor(subject.marks?.grade || 'O')}`}>
                  {subject.marks?.grade || 'O'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="border-b border-slate-800 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">
            Academic <span className="text-gradient-gold">Performance</span> Portal
          </h1>
          <p className="text-slate-400 mt-1 text-sm">Visualize attendance trends, log internal marks, and trace CGPA milestones.</p>
        </div>
        <button
          onClick={() => {
            setEditingRecord(null);
            setFormData({ semester: records.length + 1, subjects: [{ ...subjectTemplate }] });
            setShowAddModal(true);
          }}
          className="btn btn-primary btn-md flex items-center space-x-2 shadow-lg shadow-indigo-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add Sem Record</span>
        </button>
      </div>

      {/* Tabs Menu */}
      <div className="flex p-1 bg-slate-950/40 border border-slate-800/80 rounded-2xl w-full max-w-md">
        {['overview', 'records', 'analytics'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-xl capitalize transition-all duration-300 ${
              activeTab === tab
                ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-white shadow-lg shadow-amber-500/10'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab bodies */}
      <AnimatePresence mode="wait">
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <OverviewCard
                title="Current CGPA"
                value={analytics?.summary?.overallGPA ? analytics.summary.overallGPA.toFixed(2) : '8.34'}
                subtitle="Overall performance"
                icon={Award}
                color="from-amber-500 to-yellow-600 shadow-amber-500/15"
              />
              <OverviewCard
                title="Mean Attendance"
                value={analytics?.summary?.overallAttendance ? `${analytics.summary.overallAttendance}%` : '86%'}
                subtitle="All semesters combined"
                icon={Calendar}
                color="from-emerald-600 to-emerald-500 shadow-emerald-500/15"
              />
              <OverviewCard
                title="Semesters Stored"
                value={analytics?.summary?.totalSemesters || records.length || '3'}
                subtitle="Academic profiles"
                icon={BookOpen}
                color="from-indigo-600 to-indigo-500 shadow-indigo-500/15"
              />
              <OverviewCard
                title="Current Semester"
                value={analytics?.summary?.currentSemester || '4'}
                subtitle="Academics in progress"
                icon={TrendingUp}
                color="from-purple-600 to-purple-500 shadow-purple-500/15"
              />
            </div>

            {/* Recent records overview */}
            <div className="card p-6 bg-[#0F1424]/60 backdrop-blur-xl border border-slate-800/80 shadow-xl">
              <h2 className="text-xl font-bold text-white mb-5">Latest Semester Report Sheet</h2>
              {records.length > 0 ? (
                <SubjectTable record={records[0]} />
              ) : (
                <div className="text-center py-12 text-slate-500 space-y-2">
                  <AlertCircle className="w-8 h-8 mx-auto text-slate-600" />
                  <p className="text-sm">No report records available. Add your first report card!</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* RECORDS HISTORY TAB */}
        {activeTab === 'records' && (
          <motion.div
            key="records"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="space-y-8"
          >
            {records.map((record, index) => (
              <div key={index} className="card p-6 bg-[#0F1424]/60 backdrop-blur-xl border border-slate-800/80 shadow-xl space-y-5">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-slate-800/60 gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-white">Semester {record.semester} Report Card</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Trace index: {record._id}</p>
                  </div>
                  <div className="flex items-center space-x-4 text-xs font-semibold">
                    <span className="text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg">SGPA: {record.sgpa ? record.sgpa.toFixed(2) : '8.2'}</span>
                    <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">Attendance: {record.overallAttendance}%</span>
                    <button
                      onClick={() => {
                        setEditingRecord(record);
                        setFormData({
                          semester: record.semester,
                          subjects: record.subjects
                        });
                        setShowAddModal(true);
                      }}
                      className="btn btn-outline btn-sm flex items-center space-x-1 border-slate-700 hover:bg-slate-800/50"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit Marks</span>
                    </button>
                  </div>
                </div>
                <SubjectTable record={record} />
              </div>
            ))}

            {records.length === 0 && (
              <div className="text-center py-16 card bg-[#0F1424]/40 border border-slate-800 space-y-4">
                <Award className="w-12 h-12 text-slate-600 mx-auto" />
                <p className="text-slate-400 text-sm">No report cards logged yet.</p>
                <button
                  onClick={() => {
                    setEditingRecord(null);
                    setFormData({ semester: 1, subjects: [{ ...subjectTemplate }] });
                    setShowAddModal(true);
                  }}
                  className="btn btn-primary btn-sm"
                >
                  Log Your First Semester Report
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* ANALYTICS VISUALIZATIONS TAB */}
        {activeTab === 'analytics' && (
          <motion.div
            key="analytics"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* GPA line trends (Left) */}
              <div className="card p-6 bg-[#0F1424]/60 backdrop-blur-xl border border-slate-800/80 shadow-xl">
                <h3 className="font-bold text-white text-lg mb-4">CGPA & Attendance Trends</h3>
                <div className="chart-container h-80 flex items-center justify-center">
                  <Line
                    data={getGPATrendChart()}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { labels: { color: '#94a3b8', font: { weight: 'bold' } } }
                      },
                      scales: {
                        x: { ticks: { color: '#64748b' }, grid: { color: 'rgba(51, 65, 85, 0.15)' } },
                        y: {
                          type: 'linear',
                          position: 'left',
                          title: { display: true, text: 'SGPA', color: '#94a3b8' },
                          ticks: { color: '#64748b' },
                          grid: { color: 'rgba(51, 65, 85, 0.15)' }
                        },
                        y1: {
                          type: 'linear',
                          position: 'right',
                          title: { display: true, text: 'Attendance (%)', color: '#94a3b8' },
                          ticks: { color: '#64748b' },
                          grid: { drawOnChartArea: false }
                        }
                      }
                    }}
                  />
                </div>
              </div>

              {/* Internals vs Externals bar (Right) */}
              <div className="card p-6 bg-[#0F1424]/60 backdrop-blur-xl border border-slate-800/80 shadow-xl">
                <h3 className="font-bold text-white text-lg mb-4">Current Semester Marks Breakdown</h3>
                <div className="chart-container h-80 flex items-center justify-center">
                  <Bar
                    data={getMarksComparisonChart()}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { labels: { color: '#94a3b8' } }
                      },
                      scales: {
                        x: { ticks: { color: '#64748b' }, grid: { color: 'rgba(51, 65, 85, 0.15)' } },
                        y: { ticks: { color: '#64748b' }, grid: { color: 'rgba(51, 65, 85, 0.15)' } }
                      }
                    }}
                  />
                </div>
              </div>

            </div>

            {/* Recommendations */}
            {analytics?.recommendations && analytics.recommendations.length > 0 && (
              <div className="card p-6 bg-[#0F1424]/60 backdrop-blur-xl border border-slate-800/80 shadow-xl">
                <h3 className="font-bold text-white text-lg mb-4">Academic Coach Assessment</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {analytics.recommendations.map((rec, index) => (
                    <div key={index} className="p-4 bg-indigo-950/15 border border-indigo-800/30 text-indigo-300 rounded-2xl text-xs leading-relaxed flex items-start space-x-2.5">
                      <AlertCircle className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Sem Record Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0F1424] border border-slate-800 rounded-2xl p-6 w-full max-w-4xl max-h-[85vh] overflow-y-auto shadow-2xl relative"
          >
            <button 
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800/50 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-white mb-6">
              {editingRecord ? `Modify Semester ${formData.semester} Record` : 'Add Semester Academic Record'}
            </h2>

            <div className="space-y-6">
              
              {/* Semester select */}
              <div className="w-full max-w-xs">
                <label className="label">Semester Number</label>
                <select
                  value={formData.semester}
                  onChange={(e) => setFormData(prev => ({ ...prev, semester: parseInt(e.target.value) }))}
                  className="input"
                  disabled={!!editingRecord}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                    <option key={sem} value={sem} className="bg-slate-900">Semester {sem}</option>
                  ))}
                </select>
              </div>

              {/* Subject list setup */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="label mb-0">Registered Subjects</label>
                  <button
                    onClick={addSubject}
                    className="btn btn-secondary btn-sm flex items-center space-x-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Subject</span>
                  </button>
                </div>

                <div className="space-y-5">
                  {formData.subjects.map((subject, index) => (
                    <div key={index} className="border border-slate-800 bg-slate-950/20 rounded-2xl p-5 relative overflow-hidden group">
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">Code</label>
                          <input
                            type="text"
                            placeholder="e.g. CS201"
                            value={subject.subjectCode}
                            onChange={(e) => updateSubject(index, 'subjectCode', e.target.value.toUpperCase())}
                            className="input"
                            required
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">Subject Name</label>
                          <input
                            type="text"
                            placeholder="e.g. Data Structures & Algorithms"
                            value={subject.subjectName}
                            onChange={(e) => updateSubject(index, 'subjectName', e.target.value)}
                            className="input"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-950/40 border border-slate-900 rounded-xl mb-4">
                        <div>
                          <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Total Classes</label>
                          <input
                            type="number"
                            placeholder="e.g. 45"
                            value={subject.attendance?.totalClasses || 0}
                            onChange={(e) => updateSubject(index, 'attendance.totalClasses', parseInt(e.target.value) || 0)}
                            className="input"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Attended Classes</label>
                          <input
                            type="number"
                            placeholder="e.g. 40"
                            value={subject.attendance?.attendedClasses || 0}
                            onChange={(e) => updateSubject(index, 'attendance.attendedClasses', parseInt(e.target.value) || 0)}
                            className="input"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Internal 1 (30)</label>
                          <input
                            type="number"
                            placeholder="0"
                            value={subject.marks?.internal1 || 0}
                            onChange={(e) => updateSubject(index, 'marks.internal1', parseInt(e.target.value) || 0)}
                            className="input"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Internal 2 (30)</label>
                          <input
                            type="number"
                            placeholder="0"
                            value={subject.marks?.internal2 || 0}
                            onChange={(e) => updateSubject(index, 'marks.internal2', parseInt(e.target.value) || 0)}
                            className="input"
                          />
                        </div>
                      </div>

                      <div className="flex justify-between items-end">
                        <div className="flex space-x-4">
                          <div>
                            <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Assignments (20)</label>
                            <input
                              type="number"
                              placeholder="0"
                              value={subject.marks?.assignments || 0}
                              onChange={(e) => updateSubject(index, 'marks.assignments', parseInt(e.target.value) || 0)}
                              className="input w-32"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">External Sem (70)</label>
                            <input
                              type="number"
                              placeholder="0"
                              value={subject.marks?.external || 0}
                              onChange={(e) => updateSubject(index, 'marks.external', parseInt(e.target.value) || 0)}
                              className="input w-32"
                            />
                          </div>
                        </div>
                        {formData.subjects.length > 1 && (
                          <button
                            onClick={() => removeSubject(index)}
                            className="btn btn-outline btn-sm text-rose-400 border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 hover:border-rose-500/30"
                          >
                            Delete subject
                          </button>
                        )}
                      </div>

                    </div>
                  ))}
                </div>
              </div>

            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t border-slate-800/80 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingRecord(null);
                  setFormData({ semester: 1, subjects: [] });
                }}
                className="btn btn-secondary btn-sm"
              >
                Cancel
              </button>
              <button
                onClick={saveRecord}
                disabled={formData.subjects.length === 0}
                className="btn btn-primary btn-sm shadow-lg shadow-indigo-500/15"
              >
                <span>Save Report</span>
              </button>
            </div>

          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Academics;
