import React, { useState, useEffect } from 'react';
import { Moon, TrendingUp, Calendar, Plus, Clock, Sun } from 'lucide-react';
import api from '../services/authService';
import toast from 'react-hot-toast';

const SleepAnalysis = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [schedules, setSchedules] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    bedtime: '22:00',
    wakeTime: '06:00',
    quality: 5,
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
      setSchedules(response.data.schedules);
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
      setRecommendations(response.data);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/sleep/schedule', formData);
      toast.success('Sleep schedule added successfully!');
      setShowAddModal(false);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        bedtime: '22:00',
        wakeTime: '06:00',
        quality: 5,
        factors: [],
        notes: ''
      });
      fetchSleepSchedules();
      fetchAnalytics();
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
    if (quality >= 8) return 'text-green-600 bg-green-100';
    if (quality >= 6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getDurationColor = (duration) => {
    if (duration >= 7 && duration <= 9) return 'text-green-600';
    if (duration >= 6 && duration <= 10) return 'text-yellow-600';
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

  const SleepScheduleCard = ({ schedule }) => (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="font-medium text-gray-900">
            {new Date(schedule.date).toLocaleDateString('en-US', { 
              weekday: 'short', 
              month: 'short', 
              day: 'numeric' 
            })}
          </p>
          <p className="text-sm text-gray-500">
            {new Date(schedule.date).toLocaleDateString('en-US', { year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getQualityColor(schedule.quality)}`}>
            Quality: {schedule.quality}/10
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-3">
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-blue-600" />
          <div>
            <p className="text-xs text-gray-500">Bedtime</p>
            <p className="text-sm font-medium text-gray-900">{schedule.bedtime}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Sun className="w-4 h-4 text-orange-600" />
          <div>
            <p className="text-xs text-gray-500">Wake Time</p>
            <p className="text-sm font-medium text-gray-900">{schedule.wakeTime}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <p className="text-xs text-gray-500">Duration</p>
          <p className={`text-sm font-medium ${getDurationColor(schedule.duration)}`}>
            {schedule.duration.toFixed(1)} hours
          </p>
        </div>
        {schedule.factors && schedule.factors.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {schedule.factors.slice(0, 3).map((factor, index) => (
              <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                {factor}
              </span>
            ))}
            {schedule.factors.length > 3 && (
              <span className="text-xs text-gray-500">+{schedule.factors.length - 3} more</span>
            )}
          </div>
        )}
      </div>

      {schedule.notes && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-sm text-gray-600">{schedule.notes}</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Sleep Analysis</h1>
        <p className="text-gray-600 mt-2">Track your sleep patterns and improve your rest quality</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {['overview', 'schedule', 'analytics'].map((tab) => (
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
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {analytics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <OverviewCard
                title="Avg Sleep Duration"
                value={analytics?.summary?.avgSleepDuration ? `${analytics.summary.avgSleepDuration.toFixed(1)} hrs` : 'N/A'}
                subtitle="Last 30 days"
                icon={Moon}
                color="bg-purple-500"
              />
              <OverviewCard
                title="Sleep Quality"
                value={analytics?.summary?.avgSleepQuality ? `${analytics.summary.avgSleepQuality.toFixed(1)}/10` : 'N/A'}
                subtitle="Average rating"
                icon={TrendingUp}
                color="bg-blue-500"
              />
              <OverviewCard
                title="Consistency Score"
                value={analytics?.summary?.consistencyScore ? `${analytics.summary.consistencyScore}%` : 'N/A'}
                subtitle="Schedule regularity"
                icon={Calendar}
                color="bg-green-500"
              />
              <OverviewCard
                title="Sleep Goal"
                value={analytics?.summary?.sleepGoal ? `${analytics.summary.sleepGoal} hrs` : 'N/A'}
                subtitle="Recommended"
                icon={Moon}
                color="bg-yellow-500"
              />
            </div>
          )}

          {/* Recent Schedules */}
          <div className="card p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Recent Sleep Schedule</h2>
              <button
                onClick={() => setShowAddModal(true)}
                className="btn btn-primary flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Today</span>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {schedules.slice(0, 6).map((schedule, index) => (
                <SleepScheduleCard key={index} schedule={schedule} />
              ))}
            </div>
            {schedules.length === 0 && (
              <p className="text-gray-500 text-center py-8">No sleep data yet. Start tracking your sleep!</p>
            )}
          </div>

          {/* Quick Tips */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Sleep Tips</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendations.general?.slice(0, 4).map((tip, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                  <Moon className="w-5 h-5 text-blue-600 mt-0.5" />
                  <p className="text-sm text-gray-700">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Schedule Tab */}
      {activeTab === 'schedule' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Sleep Schedule History</h2>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn btn-primary flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Schedule</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {schedules.map((schedule, index) => (
              <SleepScheduleCard key={index} schedule={schedule} />
            ))}
          </div>
          {schedules.length === 0 && (
            <div className="text-center py-12">
              <Moon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No sleep schedules recorded yet.</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="btn btn-primary mt-4"
              >
                Add Your First Sleep Schedule
              </button>
            </div>
          )}
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && analytics && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Sleep Patterns */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Sleep Patterns</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Early Bedtime (&lt;10 PM)</span>
                  <span className="text-sm font-medium text-gray-900">{analytics?.sleepPatterns?.earlyBedtime || 0} days</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Normal Bedtime (10 PM - 12 AM)</span>
                  <span className="text-sm font-medium text-gray-900">{analytics?.sleepPatterns?.normalBedtime || 0} days</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Late Bedtime (&gt;12 AM)</span>
                  <span className="text-sm font-medium text-gray-900">{analytics?.sleepPatterns?.lateBedtime || 0} days</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Early Wake (&lt;6 AM)</span>
                  <span className="text-sm font-medium text-gray-900">{analytics?.sleepPatterns?.earlyWake || 0} days</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Normal Wake (6 AM - 8 AM)</span>
                  <span className="text-sm font-medium text-gray-900">{analytics?.sleepPatterns?.normalWake || 0} days</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Late Wake (&gt;8 AM)</span>
                  <span className="text-sm font-medium text-gray-900">{analytics?.sleepPatterns?.lateWake || 0} days</span>
                </div>
              </div>
            </div>

            {/* Factors Analysis */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Sleep Factors</h2>
              <div className="space-y-3">
                {analytics?.factorAnalysis && Object.entries(analytics.factorAnalysis).map(([factor, count]) => (
                  <div key={factor} className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-900 capitalize">{factor}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary-600 h-2 rounded-full"
                          style={{ width: `${(count / (analytics?.summary?.totalDays || 1)) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 w-8">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Personalized Recommendations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendations.personalized?.map((recommendation, index) => (
                <div key={index} className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-gray-700">{recommendation}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add Sleep Schedule Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Add Sleep Schedule</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Date</label>
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
                  <label className="label">Bedtime</label>
                  <input
                    type="time"
                    value={formData.bedtime}
                    onChange={(e) => setFormData(prev => ({ ...prev, bedtime: e.target.value }))}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="label">Wake Time</label>
                  <input
                    type="time"
                    value={formData.wakeTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, wakeTime: e.target.value }))}
                    className="input"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="label">Sleep Quality (1-10)</label>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={formData.quality}
                    onChange={(e) => setFormData(prev => ({ ...prev, quality: parseInt(e.target.value) }))}
                    className="flex-1"
                  />
                  <span className="text-lg font-medium text-primary-600 w-8">
                    {formData.quality}
                  </span>
                </div>
              </div>

              <div>
                <label className="label">Factors Affecting Sleep</label>
                <div className="grid grid-cols-2 gap-2">
                  {sleepFactors.map((factor) => (
                    <label key={factor} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.factors.includes(factor)}
                        onChange={() => toggleFactor(factor)}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-700 capitalize">{factor}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">Notes (Optional)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any additional notes about your sleep..."
                  className="input min-h-[80px] resize-none"
                />
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Add Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SleepAnalysis;
