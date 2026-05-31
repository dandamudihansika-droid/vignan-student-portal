import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, BookOpen, Calendar, Moon, TrendingUp, User, Plus } from 'lucide-react';
import api from '../services/authService';
import { authService } from '../services/authService';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [todayStats, setTodayStats] = useState({
    studyTime: 0,
    attendanceMarked: false,
    sleepLogged: false
  });

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    checkOnboardingStatus();
    fetchTodayStats();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const response = await api.get('/academic/records');
      if (response.data.length === 0) {
        setNeedsOnboarding(true);
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
    }
  };

  const fetchTodayStats = async () => {
    try {
      // Fetch today's study time
      const studyResponse = await api.get('/study/analytics?period=today');
      const studyTime = studyResponse.data.summary?.totalStudyTime || 0;

      // Check if attendance is marked for today
      const attendanceResponse = await api.get('/academic/records');
      let attendanceMarked = false;
      if (attendanceResponse.data.length > 0) {
        const today = new Date().toISOString().split('T')[0];
        // This would ideally check if attendance is marked for today
        attendanceMarked = false; // Simplified for now
      }

      // Check if sleep is logged for yesterday
      const sleepResponse = await api.get('/sleep/schedules?limit=1');
      const sleepLogged = sleepResponse.data.schedules?.length > 0;

      setTodayStats({
        studyTime,
        attendanceMarked,
        sleepLogged
      });
    } catch (error) {
      console.error('Error fetching today stats:', error);
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const QuickActionCard = ({ title, description, icon: Icon, color, onClick, completed }) => (
    <button
      onClick={onClick}
      className={`card p-6 text-left w-full card-hover transition-all ${
        completed ? 'opacity-75' : ''
      }`}
    >
      <div className="flex items-start space-x-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
          <p className="text-sm text-gray-600 mb-3">{description}</p>
          {completed && (
            <span className="inline-flex items-center text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
              Completed Today
            </span>
          )}
        </div>
      </div>
    </button>
  );

  if (needsOnboarding) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Your Student Portal!</h1>
          <p className="text-gray-600 mb-6">
            Let's set up your academic profile to get started with tracking your progress.
          </p>
          <button
            onClick={() => navigate('/onboarding')}
            className="btn btn-primary w-full"
          >
            Complete Setup
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.firstName}! 👋
        </h1>
        <p className="text-gray-600 mt-2">
          Here's your student life overview for today
        </p>
      </div>

      {/* Today's Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Study Time</p>
              <p className="text-2xl font-bold text-gray-900">{formatTime(todayStats.studyTime)}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Attendance</p>
              <p className="text-2xl font-bold text-gray-900">
                {todayStats.attendanceMarked ? '✓ Marked' : 'Pending'}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Sleep</p>
              <p className="text-2xl font-bold text-gray-900">
                {todayStats.sleepLogged ? '✓ Logged' : 'Pending'}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Moon className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Progress</p>
              <p className="text-2xl font-bold text-gray-900">Good</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <QuickActionCard
            title="Start Study Session"
            description="Track your study time and improve concentration"
            icon={Clock}
            color="bg-blue-500"
            onClick={() => navigate('/study-timer')}
            completed={todayStats.studyTime > 0}
          />
          
          <QuickActionCard
            title="Mark Attendance"
            description="Record your daily class attendance"
            icon={Calendar}
            color="bg-green-500"
            onClick={() => navigate('/attendance')}
            completed={todayStats.attendanceMarked}
          />
          
          <QuickActionCard
            title="View Academics"
            description="Check your grades and academic performance"
            icon={BookOpen}
            color="bg-purple-500"
            onClick={() => navigate('/academics')}
          />
          
          <QuickActionCard
            title="Sleep Analysis"
            description="Track your sleep patterns and get recommendations"
            icon={Moon}
            color="bg-indigo-500"
            onClick={() => navigate('/sleep-analysis')}
            completed={todayStats.sleepLogged}
          />
          
          <QuickActionCard
            title="Update Profile"
            description="Manage your personal information"
            icon={User}
            color="bg-gray-500"
            onClick={() => navigate('/profile')}
          />
        </div>
      </div>

      {/* Daily Tips */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Today's Tips</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">💡 Study Tip</h3>
            <p className="text-sm text-blue-700">
              Take a 5-minute break every 25 minutes to maintain focus and productivity.
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="font-medium text-green-900 mb-2">📚 Academic Tip</h3>
            <p className="text-sm text-green-700">
              Review today's class notes within 24 hours to improve retention by 50%.
            </p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <h3 className="font-medium text-purple-900 mb-2">😴 Sleep Tip</h3>
            <p className="text-sm text-purple-700">
              Maintain a consistent sleep schedule to improve academic performance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
