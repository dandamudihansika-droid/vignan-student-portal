import React, { useState, useEffect } from 'react';
import { Moon, TrendingUp, Calendar, Plus, Clock, Sun, Sparkles, ChevronRight, X, AlertCircle } from 'lucide-react';
import { Line, Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  RadialLinearScale,
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
  RadialLinearScale,
  Title,
  Tooltip,
  Legend
);

const SleepAnalysis = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [schedules, setSchedules] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    bedtime: '22:30',
    wakeTime: '06:30',
    quality: 7,
    factors: [],
    notes: ''
  });

  const sleepFactors = [
    'study', 'phone', 'caffeine', 'exercise', 'stress', 'noise', 'comfortable', 'routine'
  ];

  useEffect(() => {
    fetchSleepSchedules();
    fetchAnalytics();
    fetchRecommendations();
  }, []);

  const fetchSleepSchedules = async () => {
    try {
      const response = await api.get('/sleep/schedules?limit=10');
      setSchedules(response.data.schedules || []);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await api.get('/sleep/analytics?period=30');
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const response = await api.get('/sleep/recommendations');
      setRecommendations(response.data || {});
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/sleep/schedule', formData);
      toast.success('Sleep schedule added successfully! 😴');
      setShowAddModal(false);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        bedtime: '22:30',
        wakeTime: '06:30',
        quality: 7,
        factors: [],
        notes: ''
      });
      fetchSleepSchedules();
      fetchAnalytics();
      fetchRecommendations();
    } catch (error) {
      toast.error('Failed to save sleep schedule');
    }
  };

  const toggleFactor = (factor) => {
    setFormData(prev => ({
      ...prev,
      factors: prev.factors.includes(factor)
        ? prev.factors.filter(f => f !== factor)
        : [...prev.factors, factor]
    }));
  };

  const getQualityColor = (quality) => {
    if (quality >= 8) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (quality >= 6) return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
  };

  const getDurationColor = (duration) => {
    if (duration >= 7 && duration <= 9) return 'text-emerald-400';
    if (duration >= 6 && duration <= 10) return 'text-amber-400';
    return 'text-rose-400';
  };

  // Line Chart Config for sleep duration history
  const getSleepLineChart = () => {
    let labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    let durationData = [7.5, 6.8, 8.0, 5.5, 7.2, 8.5, 8.0]; // fallback
    let qualityData = [8, 6, 9, 4, 7, 9, 8]; // fallback

    if (schedules.length > 0) {
      const reversed = [...schedules].reverse().slice(-7);
      labels = reversed.map(s => new Date(s.date).toLocaleDateString([], { weekday: 'short' }));
      durationData = reversed.map(s => s.duration);
      qualityData = reversed.map(s => s.quality);
    }

    return {
      labels,
      datasets: [
        {
          label: 'Sleep Duration (hrs)',
          data: durationData,
          borderColor: '#a78bfa',
          backgroundColor: 'rgba(167, 139, 250, 0.15)',
          fill: true,
          tension: 0.35,
          pointBorderColor: '#a78bfa',
          pointBackgroundColor: '#0F1424',
          pointBorderWidth: 2,
          yAxisID: 'y'
        },
        {
          label: 'Sleep Quality (1-10)',
          data: qualityData,
          borderColor: '#38bdf8',
          borderWidth: 2,
          borderDash: [5, 5],
          fill: false,
          pointBorderColor: '#38bdf8',
          pointBackgroundColor: '#0F1424',
          pointBorderWidth: 2,
          yAxisID: 'y1'
        }
      ]
    };
  };

  // Radar Chart Config for Factors influence
  const getFactorsRadarChart = () => {
    const labels = ['Late Study', 'Phone Screen', 'Caffeine', 'Workout', 'Exams Stress', 'Noise', 'Comfortable Room', 'Standard Routine'];
    let defaultImpact = [6, 8, 4, 7, 5, 2, 9, 8];

    // Build factor frequencies from analytics
    if (analytics?.factorAnalysis) {
      const counts = sleepFactors.map(factor => analytics.factorAnalysis[factor] || 0);
      const totalDays = analytics.summary?.totalDays || 1;
      defaultImpact = counts.map(c => Math.round((c / totalDays) * 10));
    }

    return {
      labels,
      datasets: [
        {
          label: 'Factor Occurrences / Influence Level',
          data: defaultImpact,
          backgroundColor: 'rgba(99, 102, 241, 0.2)',
          borderColor: '#6366f1',
          borderWidth: 2,
          pointBackgroundColor: '#6366f1',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: '#6366f1'
        }
      ]
    };
  };

  const OverviewCard = ({ title, value, subtitle, icon: Icon, color }) => (
    <div className="card p-6 bg-[#0F1424]/60 backdrop-blur-xl border border-slate-800/80 shadow-xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/5 rounded-full blur-xl group-hover:bg-purple-500/10 transition-all duration-300" />
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</p>
          <p className="text-3xl font-extrabold text-white mt-1 drop-shadow-[0_0_15px_rgba(167,139,250,0.25)]">{value}</p>
          <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
        </div>
        <div className={`p-3.5 bg-gradient-to-tr ${color} text-white rounded-xl shadow-lg shadow-black/10`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );

  const SleepScheduleCard = ({ schedule }) => (
    <div className="border border-slate-800 bg-slate-950/20 rounded-xl p-5 hover:border-purple-500/30 transition-all duration-300">
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="font-semibold text-slate-200">
            {new Date(schedule.date).toLocaleDateString('en-US', { 
              weekday: 'short', 
              month: 'short', 
              day: 'numeric' 
            })}
          </p>
          <p className="text-[10px] text-slate-500 tracking-wider font-mono uppercase mt-0.5">
            {new Date(schedule.date).toLocaleDateString('en-US', { year: 'numeric' })}
          </p>
        </div>
        <span className={`badge text-[10px] tracking-wide ${getQualityColor(schedule.quality)}`}>
          Quality: {schedule.quality}/10
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 my-4 p-3 bg-slate-950/40 border border-slate-900/60 rounded-xl">
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-purple-400" />
          <div>
            <p className="text-[10px] text-slate-500">Bedtime</p>
            <p className="text-xs font-bold text-slate-300">{schedule.bedtime}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Sun className="w-4 h-4 text-amber-400" />
          <div>
            <p className="text-[10px] text-slate-500">Wake Time</p>
            <p className="text-xs font-bold text-slate-300">{schedule.wakeTime}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center text-xs">
        <div>
          <span className="text-slate-500 text-[10px] block">Duration</span>
          <span className={`font-bold ${getDurationColor(schedule.duration)}`}>
            {schedule.duration.toFixed(1)} hours
          </span>
        </div>
        {schedule.factors && schedule.factors.length > 0 && (
          <div className="flex flex-wrap gap-1 justify-end max-w-[60%]">
            {schedule.factors.slice(0, 2).map((factor, index) => (
              <span key={index} className="text-[9px] font-bold bg-slate-800/80 text-slate-400 px-2 py-0.5 rounded border border-slate-700/40">
                {factor}
              </span>
            ))}
            {schedule.factors.length > 2 && (
              <span className="text-[9px] text-slate-500">+{schedule.factors.length - 2}</span>
            )}
          </div>
        )}
      </div>

      {schedule.notes && (
        <div className="mt-3.5 pt-3.5 border-t border-slate-900/60">
          <p className="text-xs text-slate-400 leading-relaxed italic">"{schedule.notes}"</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div className="border-b border-slate-800 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">
            Sleep <span className="text-gradient">Analysis</span> Dashboard
          </h1>
          <p className="text-slate-400 mt-1 text-sm">Optimize your sleeping consistency to maximize your cognitive abilities.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary btn-md flex items-center space-x-2 shadow-lg shadow-indigo-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add Sleep Log</span>
        </button>
      </div>

      {/* Glassmorphic Tabs */}
      <div className="flex p-1 bg-slate-950/40 border border-slate-800/80 rounded-2xl w-full max-w-md">
        {['overview', 'schedule', 'analytics'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-xl capitalize transition-all duration-300 ${
              activeTab === tab
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-500/10'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
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
                title="Mean Sleep Length"
                value={analytics?.summary?.avgSleepDuration ? `${analytics.summary.avgSleepDuration.toFixed(1)} hrs` : '7.4 hrs'}
                subtitle="Daily average"
                icon={Moon}
                color="from-purple-600 to-purple-500"
              />
              <OverviewCard
                title="Sleep Quality Score"
                value={analytics?.summary?.avgSleepQuality ? `${analytics.summary.avgSleepQuality.toFixed(1)}/10` : '7.8/10'}
                subtitle="Self evaluated"
                icon={TrendingUp}
                color="from-sky-600 to-sky-500"
              />
              <OverviewCard
                title="Consistency Rating"
                value={analytics?.summary?.consistencyScore ? `${analytics.summary.consistencyScore}%` : '85%'}
                subtitle="Regularity schedule"
                icon={Calendar}
                color="from-emerald-600 to-emerald-500"
              />
              <OverviewCard
                title="Optimal Sleep Goal"
                value={analytics?.summary?.sleepGoal ? `${analytics.summary.sleepGoal} hrs` : '8.0 hrs'}
                subtitle="Professor recommendations"
                icon={Moon}
                color="from-amber-600 to-amber-500"
              />
            </div>

            {/* Visual Line Chart */}
            <div className="card p-6 bg-[#0F1424]/60 backdrop-blur-xl border border-slate-800/80 shadow-xl">
              <h3 className="font-bold text-white text-lg mb-4">Sleep Log Progress Charts</h3>
              <div className="chart-container h-80 flex items-center justify-center">
                <Line
                  data={getSleepLineChart()}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { labels: { color: '#94a3b8', font: { weight: 'bold' } } },
                      tooltip: { backgroundColor: '#0F1424', padding: 12, cornerRadius: 8 }
                    },
                    scales: {
                      x: { grid: { color: 'rgba(51, 65, 85, 0.15)' }, ticks: { color: '#64748b' } },
                      y: {
                        type: 'linear',
                        position: 'left',
                        title: { display: true, text: 'Sleep Duration (hrs)', color: '#94a3b8' },
                        grid: { color: 'rgba(51, 65, 85, 0.15)' },
                        ticks: { color: '#64748b' }
                      },
                      y1: {
                        type: 'linear',
                        position: 'right',
                        title: { display: true, text: 'Sleep Quality (1-10)', color: '#94a3b8' },
                        grid: { drawOnChartArea: false },
                        ticks: { color: '#64748b' }
                      }
                    }
                  }}
                />
              </div>
            </div>

            {/* Quick tips list */}
            <div className="card p-6 bg-[#0F1424]/60 backdrop-blur-xl border border-slate-800/80 shadow-xl">
              <h2 className="text-xl font-bold text-white mb-5 flex items-center">
                <Sparkles className="w-5 h-5 text-purple-400 mr-2" />
                <span>Rest & Recovery Tips</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(recommendations.general?.length > 0 ? recommendations.general : [
                  "Establish a standard sleeping clock: sleeping and waking up at the same hour regulates body rhythms.",
                  "Dim computer/mobile screens at least 45 minutes before sleep to facilitate melatonin generation.",
                  "Avoid caffeine triggers (coffee, strong tea, energy sodas) after 4:00 PM.",
                  "Keep your study/revision desk separate from your sleeping bed. Let your brain link bed with rest."
                ]).slice(0, 4).map((tip, index) => (
                  <div key={index} className="flex items-start space-x-3.5 p-4 bg-purple-950/15 border border-purple-800/30 rounded-2xl group hover:border-purple-500/30 transition-all duration-300">
                    <div className="p-1.5 rounded-lg bg-purple-600/10 text-purple-400 mt-0.5 shadow-md shadow-black/10">
                      <Moon className="w-4 h-4" />
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* LOG HISTORY TAB */}
        {activeTab === 'schedule' && (
          <motion.div
            key="schedule"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {schedules.map((schedule, index) => (
                <SleepScheduleCard key={index} schedule={schedule} />
              ))}
            </div>
            {schedules.length === 0 && (
              <div className="text-center py-16 card bg-[#0F1424]/40 border border-slate-800 space-y-4">
                <Moon className="w-12 h-12 text-slate-600 mx-auto animate-pulse" />
                <p className="text-slate-400 text-sm">No sleep logs stored in database yet.</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="btn btn-primary mt-4 btn-sm"
                >
                  Create Your First Sleep Log
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* ANALYTICS TAB */}
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
              
              {/* Radar Chart (Left) */}
              <div className="card p-6 bg-[#0F1424]/60 backdrop-blur-xl border border-slate-800/80 shadow-xl">
                <h3 className="font-bold text-white text-lg mb-4">Factor-Correlation radar</h3>
                <div className="chart-container h-80 flex items-center justify-center">
                  <Radar
                    data={getFactorsRadarChart()}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        r: {
                          grid: { color: 'rgba(51, 65, 85, 0.25)' },
                          angleLines: { color: 'rgba(51, 65, 85, 0.25)' },
                          pointLabels: { color: '#94a3b8', font: { size: 10, weight: 'bold' } },
                          ticks: { display: false }
                        }
                      },
                      plugins: {
                        legend: { display: false }
                      }
                    }}
                  />
                </div>
              </div>

              {/* Sleeping Clock pattern analysis (Right) */}
              <div className="card p-6 bg-[#0F1424]/60 backdrop-blur-xl border border-slate-800/80 shadow-xl flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-white text-lg mb-5">Weekly Log Frequency</h3>
                  <div className="space-y-4 text-sm">
                    <div className="flex justify-between items-center py-2.5 border-b border-slate-850">
                      <span className="text-slate-400">Regular Bedtimes (&lt;11:00 PM)</span>
                      <span className="font-bold text-emerald-400">{analytics?.sleepPatterns?.earlyBedtime || 5} days</span>
                    </div>
                    <div className="flex justify-between items-center py-2.5 border-b border-slate-850">
                      <span className="text-slate-400">Late Bedtimes (&gt;11:00 PM)</span>
                      <span className="font-bold text-rose-400">{analytics?.sleepPatterns?.lateBedtime || 2} days</span>
                    </div>
                    <div className="flex justify-between items-center py-2.5 border-b border-slate-850">
                      <span className="text-slate-400">Early Waking (&lt;06:00 AM)</span>
                      <span className="font-bold text-slate-200">{analytics?.sleepPatterns?.earlyWake || 3} days</span>
                    </div>
                    <div className="flex justify-between items-center py-2.5">
                      <span className="text-slate-400">Mean Sleep Efficiency</span>
                      <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">89%</span>
                    </div>
                  </div>
                </div>

                {/* Factors counts checklist */}
                <div className="pt-6 border-t border-slate-800/80">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-4">Occurrences Breakdown</h4>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    {analytics?.factorAnalysis ? Object.entries(analytics.factorAnalysis).map(([factor, count]) => (
                      <div key={factor} className="flex justify-between items-center bg-slate-950/40 border border-slate-900/60 p-2.5 rounded-lg">
                        <span className="capitalize text-slate-400 font-semibold">{factor}</span>
                        <span className="badge badge-info text-[9px]">{count}x</span>
                      </div>
                    )) : (
                      ['late study (3x)', 'caffeine (2x)', 'exercise (4x)', 'phone use (5x)'].map((fac, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-slate-950/40 border border-slate-900/60 p-2.5 rounded-lg">
                          <span className="capitalize text-slate-400 font-semibold">{fac.split(' ')[0]}</span>
                          <span className="badge badge-info text-[9px]">{fac.split(' ').pop()}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

            </div>

            {/* Personalized feedback */}
            {recommendations.personalized?.length > 0 && (
              <div className="card p-6 bg-[#0F1424]/60 backdrop-blur-xl border border-slate-800/80 shadow-xl">
                <h3 className="font-bold text-white text-lg mb-4">Personalized Sleep Coach Assessment</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recommendations.personalized.map((rec, index) => (
                    <div key={index} className="p-4 bg-amber-500/10 border border-amber-500/25 text-amber-400 rounded-2xl text-xs leading-relaxed flex items-start space-x-2.5">
                      <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Sleep Log Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0F1424] border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl relative"
          >
            <button 
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800/50 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-white mb-6">Log Sleep Record</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Date of Rest</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className="input"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Bedtime clock</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="time"
                      value={formData.bedtime}
                      onChange={(e) => setFormData(prev => ({ ...prev, bedtime: e.target.value }))}
                      className="input pl-10"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="label">Waking clock</label>
                  <div className="relative">
                    <Sun className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="time"
                      value={formData.wakeTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, wakeTime: e.target.value }))}
                      className="input pl-10"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="label mb-0">Evaluate Quality</label>
                  <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">
                    {formData.quality}/10
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={formData.quality}
                  onChange={(e) => setFormData(prev => ({ ...prev, quality: parseInt(e.target.value) }))}
                  className="w-full accent-indigo-500 bg-slate-950 h-2 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <label className="label">Lifestyle Conditions</label>
                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-950/40 border border-slate-900 rounded-xl">
                  {sleepFactors.map((factor) => (
                    <label key={factor} className="flex items-center space-x-2.5 cursor-pointer text-slate-400 hover:text-white transition-colors">
                      <input
                        type="checkbox"
                        checked={formData.factors.includes(factor)}
                        onChange={() => toggleFactor(factor)}
                        className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-[#0F1424]"
                      />
                      <span className="text-xs capitalize">{factor}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">Notes / Observations (Optional)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="e.g. Woke up once, slightly warm room, read book before bedtime"
                  className="input min-h-[80px] resize-none py-2.5"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm shadow-lg shadow-indigo-500/15"
                >
                  Log Sleep
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default SleepAnalysis;
