import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, GraduationCap, ArrowRight, Sparkles, BookOpen } from 'lucide-react';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const Login = () => {
  const navigate = useNavigate();
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [loading, setLoading] = useState(false);

  // Login Form State
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  // Register Form State
  const [registerData, setRegisterData] = useState({
    studentId: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    branch: '',
    section: '',
    password: '',
    confirmPassword: ''
  });

  const handleLoginChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegisterChange = (e) => {
    setRegisterData({
      ...registerData,
      [e.target.name]: e.target.value
    });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.login(loginData);
      toast.success('Welcome back, Vignan Student! 👋');
      navigate('/dashboard');
    } catch (error) {
      const msg = error.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    
    // Validations
    if (registerData.password !== registerData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    const vignanIdRegex = /^[2][0-9][1]fa0[0-9]{4}$/;
    if (!vignanIdRegex.test(registerData.studentId.toLowerCase())) {
      toast.error('Invalid Vignan Student ID format (e.g. 241fa04548)');
      return;
    }

    setLoading(true);
    try {
      const { confirmPassword, ...submitData } = registerData;
      // Convert studentId to lowercase for consistency
      submitData.studentId = submitData.studentId.toLowerCase();
      await authService.register(submitData);
      toast.success('Registration successful! Welcome to the portal.');
      navigate('/onboarding');
    } catch (error) {
      const msg = error.response?.data?.message || 'Registration failed. Please check your details.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Info Column (Left) */}
        <div className="lg:col-span-5 text-left space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Vignan University Portal</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            Analyze Your <span className="text-gradient">Student Life</span> & Performance.
          </h1>
          
          <p className="text-slate-400 text-base leading-relaxed">
            Welcome to the Vignan Cockpit. A centralized terminal designed to monitor study sessions, analyze sleep schedules, log daily attendance, and visualize academic grades.
          </p>

          <div className="space-y-4 pt-2">
            <div className="flex items-start space-x-3">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 mt-1">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-200">Interactive Grade Tracking</h4>
                <p className="text-sm text-slate-400">Log internal marks, external grades, and plot comparative CGPA charts.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 mt-1">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-200">Study Concentrator Timer</h4>
                <p className="text-sm text-slate-400">Track focus times, productivity scores, and study break intervals.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Column (Right) */}
        <div className="lg:col-span-7">
          <div className="card p-8 bg-[#0F1424]/60 backdrop-blur-xl border border-slate-800/80 shadow-2xl relative overflow-hidden">
            
            {/* Background design elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -z-10" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl -z-10" />

            {/* Form Header Tabs */}
            <div className="flex border-b border-slate-800 mb-8 p-1 bg-slate-950/40 rounded-xl">
              <button
                onClick={() => setIsLoginTab(true)}
                className={`flex-1 py-3 text-sm font-semibold rounded-lg transition-all duration-300 ${
                  isLoginTab 
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-500/10' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setIsLoginTab(false)}
                className={`flex-1 py-3 text-sm font-semibold rounded-lg transition-all duration-300 ${
                  !isLoginTab 
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-500/10' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Register Account
              </button>
            </div>

            <AnimatePresence mode="wait">
              {isLoginTab ? (
                <motion.form
                  key="login-form"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleLoginSubmit}
                  className="space-y-5"
                >
                  <div className="text-center sm:text-left">
                    <h2 className="text-2xl font-bold text-white">Student Sign In</h2>
                    <p className="text-slate-400 text-sm mt-1">Enter your registered college email to enter your portal</p>
                  </div>

                  <div>
                    <label className="label">College Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="email"
                        name="email"
                        value={loginData.email}
                        onChange={handleLoginChange}
                        placeholder="e.g. student@vignan.ac.in"
                        className="input pl-11"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="label mb-0">Password</label>
                      <button type="button" className="text-xs text-indigo-400 hover:underline">Forgot password?</button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="password"
                        name="password"
                        value={loginData.password}
                        onChange={handleLoginChange}
                        placeholder="••••••••"
                        className="input pl-11"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary w-full btn-md flex items-center justify-center space-x-2 mt-2"
                  >
                    <span>{loading ? 'Entering Portal...' : 'Access Dashboard'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </motion.form>
              ) : (
                <motion.form
                  key="register-form"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleRegisterSubmit}
                  className="space-y-4"
                >
                  <div className="text-center sm:text-left">
                    <h2 className="text-2xl font-bold text-white">Create Account</h2>
                    <p className="text-slate-400 text-sm mt-1">Initialize your student profile on the dashboard</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="label">First Name</label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          type="text"
                          name="firstName"
                          value={registerData.firstName}
                          onChange={handleRegisterChange}
                          placeholder="First Name"
                          className="input pl-11"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="label">Last Name</label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          type="text"
                          name="lastName"
                          value={registerData.lastName}
                          onChange={handleRegisterChange}
                          placeholder="Last Name"
                          className="input pl-11"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Student ID</label>
                      <div className="relative">
                        <GraduationCap className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          type="text"
                          name="studentId"
                          value={registerData.studentId}
                          onChange={handleRegisterChange}
                          placeholder="e.g. 241fa04548"
                          className="input pl-11"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="label">Mobile Number</label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          type="tel"
                          name="phone"
                          value={registerData.phone}
                          onChange={handleRegisterChange}
                          placeholder="10-digit number"
                          className="input pl-11"
                          pattern="[0-9]{10}"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Branch</label>
                      <select
                        name="branch"
                        value={registerData.branch}
                        onChange={handleRegisterChange}
                        className="input"
                        required
                      >
                        <option value="" disabled className="bg-slate-900 text-slate-500">Select Branch</option>
                        <option value="CSE" className="bg-slate-900 text-slate-200">Computer Science (CSE)</option>
                        <option value="ECE" className="bg-slate-900 text-slate-200">Electronics & Comm (ECE)</option>
                        <option value="MECH" className="bg-slate-900 text-slate-200">Mechanical (MECH)</option>
                        <option value="EEE" className="bg-slate-900 text-slate-200">Electrical (EEE)</option>
                        <option value="CIVIL" className="bg-slate-900 text-slate-200">Civil Engineering</option>
                        <option value="IT" className="bg-slate-900 text-slate-200">Information Tech (IT)</option>
                      </select>
                    </div>
                    <div>
                      <label className="label">Section</label>
                      <select
                        name="section"
                        value={registerData.section}
                        onChange={handleRegisterChange}
                        className="input"
                        required
                      >
                        <option value="" disabled className="bg-slate-900 text-slate-500">Select Section</option>
                        <option value="A" className="bg-slate-900 text-slate-200">Section A</option>
                        <option value="B" className="bg-slate-900 text-slate-200">Section B</option>
                        <option value="C" className="bg-slate-900 text-slate-200">Section C</option>
                        <option value="D" className="bg-slate-900 text-slate-200">Section D</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="label">College Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="email"
                        name="email"
                        value={registerData.email}
                        onChange={handleRegisterChange}
                        placeholder="e.g. name@vignan.ac.in"
                        className="input pl-11"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          type="password"
                          name="password"
                          value={registerData.password}
                          onChange={handleRegisterChange}
                          placeholder="At least 6 chars"
                          className="input pl-11"
                          minLength="6"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="label">Confirm Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          type="password"
                          name="confirmPassword"
                          value={registerData.confirmPassword}
                          onChange={handleRegisterChange}
                          placeholder="Re-type password"
                          className="input pl-11"
                          minLength="6"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary w-full btn-md flex items-center justify-center space-x-2 mt-4"
                  >
                    <span>{loading ? 'Creating Student Profile...' : 'Complete Register'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
