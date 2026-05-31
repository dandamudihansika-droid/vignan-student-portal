import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import StudyTimer from './pages/StudyTimer';
import AttendanceTracker from './pages/AttendanceTracker';
import Academics from './pages/Academics';
import SleepAnalysis from './pages/SleepAnalysis';
import Profile from './pages/Profile';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-[#080B11]">
        <Navbar />
        <main className="flex-1">
          <Routes>
            {/* Public Auth Route */}
            <Route path="/login" element={<Login />} />

            {/* Private Student Routes */}
            <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/study-timer" element={<ProtectedRoute><StudyTimer /></ProtectedRoute>} />
            <Route path="/attendance" element={<ProtectedRoute><AttendanceTracker /></ProtectedRoute>} />
            <Route path="/academics" element={<ProtectedRoute><Academics /></ProtectedRoute>} />
            <Route path="/sleep" element={<ProtectedRoute><SleepAnalysis /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            
            {/* Default redirects */}
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#0F1424',
              color: '#f8fafc',
              border: '1px solid #1e293b',
              borderRadius: '12px',
              fontFamily: 'sans-serif'
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#0F1424',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#f43f5e',
                secondary: '#0F1424',
              },
            },
          }}
        />
      </div>
    </Router>
  );
}

export default App;
