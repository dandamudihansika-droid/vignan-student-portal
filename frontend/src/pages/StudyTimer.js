import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Coffee, Target, TrendingUp, Clock } from 'lucide-react';
import api from '../services/authService';
import toast from 'react-hot-toast';

const StudyTimer = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [currentSession, setCurrentSession] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [concentrationLevel, setConcentrationLevel] = useState(5);
  const [notes, setNotes] = useState('');
  const [subjects, setSubjects] = useState(['Mathematics', 'Physics', 'Chemistry', 'Data Structures', 'Algorithms', 'Database', 'Web Development', 'Machine Learning', 'Computer Networks', 'Operating Systems', 'Software Engineering']);
  const [analytics, setAnalytics] = useState(null);
  const intervalRef = useRef(null);

  const fetchSessions = async () => {
    try {
      const response = await api.get('/study/sessions?limit=10');
      setSessions(response.data.sessions);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await api.get('/study/analytics?period=7');
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const startSession = async () => {
    if (!selectedSubject.trim()) {
      toast.error('Please select a subject');
      return;
    }

    try {
      const response = await api.post('/study/session', {
        subject: selectedSubject,
        startTime: new Date().toISOString(),
        concentrationLevel,
        notes
      });

      setCurrentSession(response.data);
      setIsRunning(true);
      setIsBreak(false);
      setSeconds(0);
      toast.success('Study session started!');
    } catch (error) {
      console.error('Error starting session:', error);
      toast.error('Failed to start session');
    }
  };

  const stopSession = async () => {
    if (!currentSession) return;

    try {
      const response = await api.put('/study/session/' + currentSession._id, {
        endTime: new Date().toISOString(),
        isCompleted: true,
        concentrationLevel,
        notes
      });

      setCurrentSession(null);
      setIsRunning(false);
      setSeconds(0);
      setNotes('');
      toast.success('Study session completed!');
      fetchSessions();
      fetchAnalytics();
    } catch (error) {
      console.error('Error stopping session:', error);
      toast.error('Failed to stop session');
    }
  };

  const takeBreak = async () => {
    if (!currentSession) return;

    try {
      await api.post('/study/break', {
        startTime: new Date().toISOString()
      });

      setIsBreak(true);
      setIsRunning(false);
      toast.success('Break started!');
    } catch (error) {
      console.error('Error starting break:', error);
      toast.error('Failed to start break');
    }
  };

  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const SessionCard = ({ session }) => (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-medium text-gray-900">{session.subject}</h4>
        <span className="badge badge-info">
          {formatTime(session.duration || 0)}
        </span>
      </div>
      <div className="flex items-center space-x-4 text-sm text-gray-600">
        <div className="flex items-center space-x-1">
          <Target className="w-4 h-4" />
          <span>Focus: {session.concentrationLevel || 5}/10</span>
        </div>
        <div className="flex items-center space-x-1">
          <TrendingUp className="w-4 h-4" />
          <span>Productivity: {session.productivityScore || 0}%</span>
        </div>
      </div>
      {session.notes && (
        <p className="text-sm text-gray-500 mt-2">{session.notes}</p>
      )}
    </div>
  );

  useEffect(() => {
    fetchSessions();
    fetchAnalytics();
  }, []);

  useEffect(() => {
    if (isRunning && !isBreak) {
      intervalRef.current = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isBreak]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Study Timer</h1>
        <p className="text-gray-600 mt-2">Track your study sessions and improve concentration</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Timer Section */}
        <div className="lg:col-span-2">
          <div className="card p-8">
            {/* Timer Display */}
            <div className="text-center mb-8">
              <div className="timer-display mb-4">
                {formatTime(seconds)}
              </div>
              <div className="flex justify-center items-center space-x-2">
                {isBreak && <Coffee className="w-5 h-5 text-yellow-600" />}
                <span className={`text-lg font-medium ${isBreak ? 'text-yellow-600' : 'text-gray-700'}`}>
                  {isBreak ? 'Break Time' : currentSession ? 'Study Session' : 'Ready to Study'}
                </span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex justify-center space-x-4 mb-8">
              {!currentSession ? (
                <button
                  onClick={startSession}
                  disabled={!selectedSubject.trim()}
                  className="btn btn-primary btn-lg flex items-center space-x-2"
                >
                  <Play className="w-5 h-5" />
                  <span>Start Session</span>
                </button>
              ) : (
                <>
                  {!isBreak ? (
                    <>
                      <button
                        onClick={takeBreak}
                        className="btn btn-secondary btn-lg flex items-center space-x-2"
                      >
                        <Coffee className="w-5 h-5" />
                        <span>Take Break</span>
                      </button>
                      <button
                        onClick={stopSession}
                        className="btn btn-danger btn-lg flex items-center space-x-2"
                      >
                        <RotateCcw className="w-5 h-5" />
                        <span>Stop Session</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        setIsBreak(false);
                        setIsRunning(true);
                      }}
                      className="btn btn-primary btn-lg flex items-center space-x-2"
                    >
                      <Play className="w-5 h-5" />
                      <span>Resume Study</span>
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Session Setup */}
            {!currentSession && (
              <div className="space-y-6">
                {/* Subject Selection */}
                <div>
                  <label className="label">Subject</label>
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="input"
                  >
                    <option value="">Select a subject</option>
                    {subjects.map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>

                {/* Concentration Level */}
                <div>
                  <label className="label">Current Concentration Level</label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={concentrationLevel}
                      onChange={(e) => setConcentrationLevel(parseInt(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-lg font-medium text-primary-600 w-8">
                      {concentrationLevel}
                    </span>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="label">Notes (Optional)</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes about your study session..."
                    className="input min-h-[100px] resize-none"
                  />
                </div>
              </div>
            )}

            {/* Current Session Info */}
            {currentSession && !isBreak && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">Current Session</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700">Subject:</span>
                    <p className="font-medium text-blue-900">{currentSession.subject}</p>
                  </div>
                  <div>
                    <span className="text-blue-700">Started:</span>
                    <p className="font-medium text-blue-900">
                      {new Date(currentSession.startTime).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Recent Sessions */}
          <div className="card p-6 mt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Sessions</h2>
            <div className="space-y-4">
              {sessions.length > 0 ? (
                sessions.map((session, index) => (
                  <SessionCard key={index} session={session} />
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">No study sessions yet. Start your first session!</p>
              )}
            </div>
          </div>
        </div>

        {/* Analytics Sidebar */}
        <div className="lg:col-span-1">
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">This Week's Analytics</h2>
            
            {analytics ? (
              <div className="space-y-6">
                {/* Summary Stats */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Sessions</span>
                    <span className="font-medium text-gray-900">{analytics.summary.totalSessions}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Study Time</span>
                    <span className="font-medium text-gray-900">{analytics.summary.totalStudyTime} min</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Avg Concentration</span>
                    <span className="font-medium text-gray-900">{analytics.summary.avgConcentration}/10</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Daily Average</span>
                    <span className="font-medium text-gray-900">{analytics.summary.dailyAverage} min</span>
                  </div>
                </div>

                {/* Subject Analysis */}
                {analytics.subjectAnalysis && Object.keys(analytics.subjectAnalysis).length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Subject Breakdown</h3>
                    <div className="space-y-2">
                      {Object.entries(analytics.subjectAnalysis).slice(0, 3).map(([subject, data]) => (
                        <div key={subject} className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">{subject}</span>
                          <span className="font-medium text-gray-900">{data.totalTime} min</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {analytics.recommendations && analytics.recommendations.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Recommendations</h3>
                    <div className="space-y-2">
                      {analytics.recommendations.slice(0, 2).map((rec, index) => (
                        <p key={index} className="text-sm text-gray-600 bg-yellow-50 p-3 rounded-lg">
                          {rec}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No analytics data available yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyTimer;
