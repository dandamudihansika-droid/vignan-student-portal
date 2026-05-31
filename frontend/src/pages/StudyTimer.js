import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Coffee, Target, TrendingUp, Clock, BookOpen, AlertCircle } from 'lucide-react';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import api from '../services/authService';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const StudyTimer = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [currentSession, setCurrentSession] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [concentrationLevel, setConcentrationLevel] = useState(7);
  const [notes, setNotes] = useState('');
  const [subjects, setSubjects] = useState(['Mathematics', 'Physics', 'Chemistry', 'Data Structures', 'Algorithms', 'Database', 'Web Development', 'Machine Learning', 'Computer Networks', 'Operating Systems', 'Software Engineering']);
  const [analytics, setAnalytics] = useState(null);
  const intervalRef = useRef(null);

  const fetchSessions = async () => {
    try {
      const response = await api.get('/study/sessions?limit=10');
      setSessions(response.data.sessions || []);
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
      toast.success('Study session started! Good luck! 📚');
    } catch (error) {
      console.error('Error starting session:', error);
      toast.error('Failed to start session');
    }
  };

  const stopSession = async () => {
    if (!currentSession) return;

    try {
      await api.put('/study/session/' + currentSession._id, {
        endTime: new Date().toISOString(),
        isCompleted: true,
        concentrationLevel,
        notes
      });

      setCurrentSession(null);
      setIsRunning(false);
      setSeconds(0);
      setNotes('');
      toast.success('Study session completed and saved! 🎯');
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
      toast.success('Rest break started! Take a deep breath ☕');
    } catch (error) {
      console.error('Error starting break:', error);
      toast.error('Failed to start break');
    }
  };

  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

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

  // Chart configs
  const getWeeklyHoursChart = () => {
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    let dataset = [1.5, 2.8, 3.2, 1.0, 4.0, 2.5, 0.5]; // default fallbacks

    if (analytics?.dailyAnalysis?.length > 0) {
      dataset = analytics.dailyAnalysis.slice(-7).map(d => (d.totalTime / 60).toFixed(1));
    }

    return {
      labels,
      datasets: [
        {
          label: 'Study Hours',
          data: dataset,
          backgroundColor: 'rgba(99, 102, 241, 0.75)',
          borderColor: '#6366f1',
          borderWidth: 1.5,
          borderRadius: 8
        }
      ]
    };
  };

  const getSubjectDoughnutChart = () => {
    const defaultLabels = ['Maths', 'Web Dev', 'OS', 'Physics'];
    let defaultData = [120, 240, 90, 60];

    if (analytics?.subjectAnalysis && Object.keys(analytics.subjectAnalysis).length > 0) {
      defaultLabels = Object.keys(analytics.subjectAnalysis);
      defaultData = Object.values(analytics.subjectAnalysis).map(d => d.totalTime);
    }

    return {
      labels: defaultLabels,
      datasets: [
        {
          data: defaultData,
          backgroundColor: [
            'rgba(99, 102, 241, 0.8)',
            'rgba(168, 85, 247, 0.8)',
            'rgba(16, 185, 129, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(239, 68, 68, 0.8)',
            'rgba(6, 182, 212, 0.8)'
          ],
          borderColor: '#0F1424',
          borderWidth: 2
        }
      ]
    };
  };

  const SessionCard = ({ session }) => (
    <div className="border border-slate-800/80 bg-slate-950/20 rounded-xl p-4 hover:border-indigo-500/30 transition-all duration-300">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-semibold text-slate-200">{session.subject}</h4>
        <span className="badge badge-info text-[10px] tracking-wide">
          {formatTime(session.duration || 0)}
        </span>
      </div>
      <div className="flex items-center space-x-4 text-xs text-slate-400">
        <div className="flex items-center space-x-1">
          <Target className="w-3.5 h-3.5 text-indigo-400" />
          <span>Focus: {session.concentrationLevel || 7}/10</span>
        </div>
        <div className="flex items-center space-x-1">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          <span>Productivity: {session.productivityScore || 0}%</span>
        </div>
      </div>
      {session.notes && (
        <p className="text-xs text-slate-500 mt-2 bg-slate-950/40 p-2 rounded-lg italic border border-slate-900/60">{session.notes}</p>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div className="border-b border-slate-800 pb-6">
        <h1 className="text-3xl font-extrabold text-white">
          Study <span className="text-gradient">Concentrator</span> Cockpit
        </h1>
        <p className="text-slate-400 mt-1 text-sm">Quantify your concentration levels and monitor daily revision sessions.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Timer Control panel (Left) */}
        <div className="lg:col-span-7 space-y-8">
          <div className="card p-8 bg-[#0F1424]/60 backdrop-blur-xl border border-slate-800/80 shadow-2xl relative overflow-hidden text-center flex flex-col items-center justify-center">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -z-10" />

            {/* Timer stopwatch dial */}
            <div className="w-72 h-72 rounded-full border-4 border-slate-800/60 bg-slate-950/60 flex flex-col items-center justify-center shadow-2xl relative group mb-6">
              <div className="absolute inset-2.5 rounded-full border border-slate-800/20" />
              {isRunning && !isBreak && (
                <motion.div 
                  className="absolute inset-0 rounded-full border-2 border-indigo-500/40"
                  animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ repeat: Infinity, duration: 2.5 }}
                />
              )}
              
              <div className="timer-display text-5xl">
                {formatTime(seconds)}
              </div>
              
              <div className="flex items-center space-x-2 mt-3">
                {isBreak ? (
                  <span className="badge badge-warning text-[10px] tracking-wide flex items-center">
                    <Coffee className="w-3.5 h-3.5 mr-1" />
                    <span>Break Session</span>
                  </span>
                ) : currentSession ? (
                  <span className="badge badge-success text-[10px] tracking-wide flex items-center">
                    <Target className="w-3.5 h-3.5 mr-1 animate-pulse" />
                    <span>Study Session</span>
                  </span>
                ) : (
                  <span className="badge badge-info text-[10px] tracking-wide">Ready to Focus</span>
                )}
              </div>
            </div>

            {/* StopWatch buttons */}
            <div className="flex justify-center space-x-4 mb-6 w-full max-w-sm">
              {!currentSession ? (
                <button
                  onClick={startSession}
                  disabled={!selectedSubject.trim()}
                  className="btn btn-primary w-full btn-md flex items-center justify-center space-x-2 shadow-lg shadow-indigo-500/20"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Start Session</span>
                </button>
              ) : (
                <div className="flex space-x-3 w-full">
                  {!isBreak ? (
                    <>
                      <button
                        onClick={takeBreak}
                        className="btn btn-secondary flex-1 btn-md flex items-center justify-center space-x-2"
                      >
                        <Coffee className="w-4 h-4" />
                        <span>Break</span>
                      </button>
                      <button
                        onClick={stopSession}
                        className="btn btn-danger flex-1 btn-md flex items-center justify-center space-x-2 shadow-lg shadow-rose-500/20"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>Stop</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        setIsBreak(false);
                        setIsRunning(true);
                      }}
                      className="btn btn-primary w-full btn-md flex items-center justify-center space-x-2"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      <span>Resume Study</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Options configuration */}
            {!currentSession && (
              <div className="w-full text-left space-y-5 border-t border-slate-800/80 pt-6">
                <div>
                  <label className="label">Focus Subject</label>
                  <div className="relative">
                    <BookOpen className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <select
                      value={selectedSubject}
                      onChange={(e) => setSelectedSubject(e.target.value)}
                      className="input pl-11"
                    >
                      <option value="" className="bg-slate-900 text-slate-500">Select subject</option>
                      {subjects.map(sub => (
                        <option key={sub} value={sub} className="bg-slate-900 text-slate-200">{sub}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="label mb-0">Expected Concentration</label>
                    <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">
                      {concentrationLevel}/10
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={concentrationLevel}
                    onChange={(e) => setConcentrationLevel(parseInt(e.target.value))}
                    className="w-full accent-indigo-500 bg-slate-900 h-2 rounded-lg cursor-pointer"
                  />
                </div>

                <div>
                  <label className="label">Session Objective (Optional)</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Read Chapter 4 and solve practice questions"
                    className="input min-h-[90px] resize-none py-3"
                  />
                </div>
              </div>
            )}

            {/* Ongoing session detail */}
            {currentSession && !isBreak && (
              <div className="w-full bg-indigo-950/20 border border-indigo-800/40 rounded-xl p-4 text-left animate-pulse mt-4">
                <h4 className="font-bold text-indigo-400 text-sm mb-2">Ongoing Session Parameters</h4>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400">Subject:</span>
                    <p className="font-semibold text-slate-200 mt-0.5">{currentSession.subject}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Time Started:</span>
                    <p className="font-semibold text-slate-200 mt-0.5">
                      {new Date(currentSession.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* History */}
          <div className="card p-6 bg-[#0F1424]/60 backdrop-blur-xl border border-slate-800/80 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-5">Recent Study Sessions</h2>
            <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
              {sessions.length > 0 ? (
                sessions.map((session, index) => (
                  <SessionCard key={index} session={session} />
                ))
              ) : (
                <div className="text-center py-8 text-slate-500 space-y-2">
                  <AlertCircle className="w-8 h-8 mx-auto text-slate-600" />
                  <p className="text-sm">No study logs stored in database yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Analytics charts sidebar (Right) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Chart 1: Time Breakdown */}
          <div className="card p-6 bg-[#0F1424]/60 backdrop-blur-xl border border-slate-800/80 shadow-xl">
            <h3 className="font-bold text-white text-lg mb-4">Subject Focus Distribution</h3>
            <div className="chart-container h-64 flex items-center justify-center">
              <Doughnut
                data={getSubjectDoughnutChart()}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: { color: '#94a3b8', boxWidth: 10, font: { size: 10 } }
                    }
                  }
                }}
              />
            </div>
          </div>

          {/* Chart 2: Daily Trends */}
          <div className="card p-6 bg-[#0F1424]/60 backdrop-blur-xl border border-slate-800/80 shadow-xl">
            <h3 className="font-bold text-white text-lg mb-4">Weekly Focus Hours</h3>
            <div className="chart-container h-60 flex items-center justify-center">
              <Bar
                data={getWeeklyHoursChart()}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    x: { ticks: { color: '#64748b' }, grid: { color: 'rgba(51, 65, 85, 0.1)' } },
                    y: { ticks: { color: '#64748b' }, grid: { color: 'rgba(51, 65, 85, 0.1)' } }
                  }
                }}
              />
            </div>
          </div>

          {/* Text Summaries */}
          <div className="card p-6 bg-[#0F1424]/60 backdrop-blur-xl border border-slate-800/80 shadow-xl">
            <h3 className="font-bold text-white text-lg mb-4">Focus Statistics</h3>
            <div className="space-y-3.5 text-sm">
              <div className="flex justify-between items-center py-2.5 border-b border-slate-850">
                <span className="text-slate-400">Total Recorded Sessions</span>
                <span className="font-bold text-slate-100">{analytics?.summary?.totalSessions || sessions.length}</span>
              </div>
              <div className="flex justify-between items-center py-2.5 border-b border-slate-850">
                <span className="text-slate-400">Total Study Time</span>
                <span className="font-bold text-indigo-400">{analytics?.summary?.totalStudyTime || 300} mins</span>
              </div>
              <div className="flex justify-between items-center py-2.5 border-b border-slate-850">
                <span className="text-slate-400">Mean Concentration Score</span>
                <span className="font-bold text-slate-100">{analytics?.summary?.avgConcentration || 7.5}/10</span>
              </div>
              
              {/* Recommendations */}
              {analytics?.recommendations && analytics.recommendations.length > 0 && (
                <div className="pt-4 space-y-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Coach Insights</span>
                  {analytics.recommendations.slice(0, 2).map((rec, index) => (
                    <div key={index} className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-lg text-xs leading-relaxed">
                      {rec}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default StudyTimer;
