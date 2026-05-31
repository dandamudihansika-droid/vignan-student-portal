import React, { useState, useEffect } from 'react';
import { BookOpen, TrendingUp, Award, Calendar, Plus, Edit } from 'lucide-react';
import api from '../services/authService';
import toast from 'react-hot-toast';

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
      setRecords(response.data);
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
    attendance: { totalClasses: 0, attendedClasses: 0 },
    marks: { internal1: 0, internal2: 0, assignments: 0, external: 0 }
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
      updatedSubjects[index][parent][child] = value;
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
      if (editingRecord) {
        await api.put('/academic/record', formData);
        toast.success('Academic record updated successfully!');
      } else {
        await api.post('/academic/record', formData);
        toast.success('Academic record added successfully!');
      }
      
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
      'O': 'text-green-600 bg-green-100',
      'A+': 'text-blue-600 bg-blue-100',
      'A': 'text-blue-500 bg-blue-50',
      'B+': 'text-yellow-600 bg-yellow-100',
      'B': 'text-yellow-500 bg-yellow-50',
      'C': 'text-orange-500 bg-orange-50',
      'D': 'text-red-500 bg-red-50',
      'F': 'text-red-600 bg-red-100'
    };
    return colors[grade] || 'text-gray-600 bg-gray-100';
  };

  const getAttendanceColor = (percentage) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const OverviewCard = ({ title, value, subtitle, icon: Icon, color }) => (
    <div className="card p-6 card-hover">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  const SubjectTable = ({ record }) => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Subject
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Attendance
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Internal 1
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Internal 2
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              External
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Grade
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {record.subjects.map((subject, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div>
                  <div className="text-sm font-medium text-gray-900">{subject.subjectName}</div>
                  <div className="text-sm text-gray-500">{subject.subjectCode}</div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <span className={`text-sm font-medium ${getAttendanceColor(subject.attendance.percentage)}`}>
                    {subject.attendance.percentage}%
                  </span>
                  <span className="text-xs text-gray-500 ml-2">
                    ({subject.attendance.attendedClasses}/{subject.attendance.totalClasses})
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {subject.marks.internal1}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {subject.marks.internal2}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {subject.marks.external}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm font-medium text-gray-900">{subject.marks.total}</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getGradeColor(subject.marks.grade)}`}>
                  {subject.marks.grade}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Academic Performance</h1>
        <p className="text-gray-600 mt-2">Track your attendance, marks, and academic progress</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {['overview', 'records', 'analytics'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                activeTab === tab
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && analytics && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <OverviewCard
              title="Current GPA"
              value={analytics?.summary?.overallGPA?.toFixed(2) || 'N/A'}
              subtitle="Overall Performance"
              icon={Award}
              color="bg-yellow-500"
            />
            <OverviewCard
              title="Overall Attendance"
              value={analytics?.summary?.overallAttendance ? `${analytics.summary.overallAttendance}%` : 'N/A'}
              subtitle="This Semester"
              icon={Calendar}
              color="bg-green-500"
            />
            <OverviewCard
              title="Total Semesters"
              value={analytics?.summary?.totalSemesters || 'N/A'}
              subtitle="Completed"
              icon={BookOpen}
              color="bg-blue-500"
            />
            <OverviewCard
              title="Current Semester"
              value={analytics?.summary?.currentSemester || 'N/A'}
              subtitle="In Progress"
              icon={TrendingUp}
              color="bg-purple-500"
            />
          </div>

          {/* Recent Performance */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Performance</h2>
            {records.length > 0 ? (
              <SubjectTable record={records[0]} />
            ) : (
              <p className="text-gray-500 text-center py-8">No academic records available. Add your first record!</p>
            )}
          </div>
        </div>
      )}

      {/* Records Tab */}
      {activeTab === 'records' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Academic Records</h2>
            <button
              onClick={() => {
                setShowAddModal(true);
                setEditingRecord(null);
                setFormData({ semester: 1, subjects: [{ ...subjectTemplate }] });
              }}
              className="btn btn-primary flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Record</span>
            </button>
          </div>

          <div className="space-y-6">
            {records.map((record, index) => (
              <div key={index} className="card p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Semester {record.semester}</h3>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600">SGPA: {record.sgpa.toFixed(2)}</span>
                    <span className="text-sm text-gray-600">Attendance: {record.overallAttendance}%</span>
                    <button
                      onClick={() => {
                        setEditingRecord(record);
                        setFormData({
                          semester: record.semester,
                          subjects: record.subjects
                        });
                        setShowAddModal(true);
                      }}
                      className="btn btn-outline btn-sm flex items-center space-x-1"
                    >
                      <Edit className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                  </div>
                </div>
                <SubjectTable record={record} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && analytics && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Performance Trends */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Performance Trends</h2>
              <div className="space-y-4">
                {analytics?.performanceTrends?.map((trend, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-900">Semester {trend.semester}</span>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-600">SGPA: {trend.sgpa.toFixed(2)}</span>
                      <span className="text-sm text-gray-600">Attendance: {trend.overallAttendance}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Subject Performance */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Subject Performance</h2>
              <div className="space-y-4">
                {analytics?.subjectPerformance && Object.entries(analytics.subjectPerformance).slice(0, 5).map(([subject, data]) => (
                  <div key={subject} className="p-3 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-900">{subject}</span>
                      <span className="text-sm text-gray-600">{data.semesters} semesters</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Avg Marks: {data.averageMarks}</span>
                      <span className="text-gray-600">Avg Attendance: {data.averageAttendance}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Recommendations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analytics?.recommendations?.map((recommendation, index) => (
                <div key={index} className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-gray-700">{recommendation}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              {editingRecord ? 'Edit Academic Record' : 'Add Academic Record'}
            </h2>

            <div className="space-y-6">
              {/* Semester Selection */}
              <div>
                <label className="label">Semester</label>
                <select
                  value={formData.semester}
                  onChange={(e) => setFormData(prev => ({ ...prev, semester: parseInt(e.target.value) }))}
                  className="input"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                    <option key={sem} value={sem}>Semester {sem}</option>
                  ))}
                </select>
              </div>

              {/* Subjects */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="label">Subjects</label>
                  <button
                    onClick={addSubject}
                    className="btn btn-secondary btn-sm flex items-center space-x-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Subject</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {formData.subjects.map((subject, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <input
                          type="text"
                          placeholder="Subject Code"
                          value={subject.subjectCode}
                          onChange={(e) => updateSubject(index, 'subjectCode', e.target.value)}
                          className="input"
                        />
                        <input
                          type="text"
                          placeholder="Subject Name"
                          value={subject.subjectName}
                          onChange={(e) => updateSubject(index, 'subjectName', e.target.value)}
                          className="input md:col-span-2"
                        />
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <label className="text-xs text-gray-600">Total Classes</label>
                          <input
                            type="number"
                            placeholder="0"
                            value={subject.attendance.totalClasses}
                            onChange={(e) => updateSubject(index, 'attendance.totalClasses', parseInt(e.target.value) || 0)}
                            className="input"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-600">Attended</label>
                          <input
                            type="number"
                            placeholder="0"
                            value={subject.attendance.attendedClasses}
                            onChange={(e) => updateSubject(index, 'attendance.attendedClasses', parseInt(e.target.value) || 0)}
                            className="input"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-600">Internal 1</label>
                          <input
                            type="number"
                            placeholder="0"
                            value={subject.marks.internal1}
                            onChange={(e) => updateSubject(index, 'marks.internal1', parseInt(e.target.value) || 0)}
                            className="input"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-600">Internal 2</label>
                          <input
                            type="number"
                            placeholder="0"
                            value={subject.marks.internal2}
                            onChange={(e) => updateSubject(index, 'marks.internal2', parseInt(e.target.value) || 0)}
                            className="input"
                          />
                        </div>
                      </div>

                      <div className="flex justify-between items-center mt-4">
                        <div className="flex space-x-4">
                          <div>
                            <label className="text-xs text-gray-600">Assignments</label>
                            <input
                              type="number"
                              placeholder="0"
                              value={subject.marks.assignments}
                              onChange={(e) => updateSubject(index, 'marks.assignments', parseInt(e.target.value) || 0)}
                              className="input w-24"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-600">External</label>
                            <input
                              type="number"
                              placeholder="0"
                              value={subject.marks.external}
                              onChange={(e) => updateSubject(index, 'marks.external', parseInt(e.target.value) || 0)}
                              className="input w-24"
                            />
                          </div>
                        </div>
                        {formData.subjects.length > 1 && (
                          <button
                            onClick={() => removeSubject(index)}
                            className="btn btn-outline btn-sm text-red-600"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingRecord(null);
                  setFormData({ semester: 1, subjects: [] });
                }}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button
                onClick={saveRecord}
                disabled={formData.subjects.length === 0}
                className="btn btn-primary"
              >
                {editingRecord ? 'Update Record' : 'Add Record'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Academics;
