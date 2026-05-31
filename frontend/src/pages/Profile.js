import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, GraduationCap, Edit, Save, X, Sparkles, Shield, Bell, Lock } from 'lucide-react';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    if (currentUser) {
      setFormData({
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        email: currentUser.email,
        phone: currentUser.phone
      });
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await authService.updateProfile(formData);
      const updatedUser = authService.getCurrentUser();
      setUser(updatedUser);
      setIsEditing(false);
      toast.success('Student profile updated successfully! 👤');
    } catch (error) {
      toast.error('Failed to update student profile');
    } finally {
      setIsLoading(false);
    }
  };

  const cancelEdit = () => {
    if (user) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone
      });
    }
    setIsEditing(false);
  };

  const getBatchDisplay = (batch) => {
    if (!batch) return 'N/A';
    const [startYear, endYear] = batch.split('-');
    return `${startYear}-${endYear.slice(2)} Batch`;
  };

  if (!user) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center bg-[#080B11]">
        <div className="loading-spinner w-8 h-8"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Title */}
      <div className="border-b border-slate-800 pb-6">
        <h1 className="text-3xl font-extrabold text-white">
          Student <span className="text-gradient">Profile</span> Portal
        </h1>
        <p className="text-slate-400 mt-1 text-sm">Manage your personal information, contact cards, and security configurations.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Profile Card Summary (Left) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="card p-6 bg-[#0F1424]/60 backdrop-blur-xl border border-slate-800/80 shadow-xl relative overflow-hidden text-center flex flex-col items-center">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl -z-10" />

            <div className="w-24 h-24 bg-indigo-600/10 border-2 border-indigo-500/20 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/5 mb-5 relative group">
              <User className="w-10 h-10 text-indigo-400" />
              <div className="absolute inset-0 rounded-full border border-indigo-500/10 animate-pulse-slow" />
            </div>

            <h2 className="text-xl font-bold text-white tracking-tight">
              {user.firstName} {user.lastName}
            </h2>
            
            <p className="text-xs font-mono text-slate-500 tracking-wider uppercase mt-1">
              {user.studentId}
            </p>

            <div className="mt-5 p-3.5 bg-slate-950/40 border border-slate-900 rounded-2xl w-full text-xs space-y-2.5 text-slate-400 text-left">
              <div className="flex items-center space-x-2">
                <GraduationCap className="w-4 h-4 text-indigo-400" />
                <span>{user.branch} — Section {user.section}</span>
              </div>
              <div className="flex items-center space-x-2 border-t border-slate-900 pt-2.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>{getBatchDisplay(user.batch)}</span>
              </div>
            </div>

            {/* Academic progress checklist */}
            <div className="w-full text-left mt-6 pt-6 border-t border-slate-800/60">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3.5">Registration status</h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Current Semester</span>
                  <span className="font-bold text-slate-200">Semester {user.currentSemester}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Portal Security Access</span>
                  <span className="badge badge-success text-[9px]">Student Verified</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Details & Settings (Right) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Personal Info Sheet */}
          <div className="card p-6 bg-[#0F1424]/60 backdrop-blur-xl border border-slate-800/80 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Student Personal Information</h2>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn btn-outline btn-sm flex items-center space-x-1.5 border-slate-700 hover:bg-slate-800/50"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={cancelEdit}
                    className="btn btn-secondary btn-sm flex items-center space-x-1.5"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Cancel</span>
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="btn btn-primary btn-sm flex items-center space-x-1.5 shadow-lg shadow-indigo-500/15"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isLoading ? 'Saving...' : 'Save'}</span>
                  </button>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* First Name */}
                <div>
                  <label className="label">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`input ${!isEditing ? 'bg-slate-950/40 text-slate-400 border-slate-850 cursor-not-allowed' : ''}`}
                    required
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label className="label">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`input ${!isEditing ? 'bg-slate-950/40 text-slate-400 border-slate-850 cursor-not-allowed' : ''}`}
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="label">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`input pl-11 ${!isEditing ? 'bg-slate-950/40 text-slate-400 border-slate-850 cursor-not-allowed' : ''}`}
                      required
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="label">Mobile Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`input pl-11 ${!isEditing ? 'bg-slate-950/40 text-slate-400 border-slate-850 cursor-not-allowed' : ''}`}
                      pattern="[0-9]{10}"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Academic details (Read-only for security reasons) */}
              <div className="pt-6 border-t border-slate-800/80">
                <h3 className="text-lg font-bold text-white mb-4">Academic Registration (Read Only)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="label">Vignan Student ID</label>
                    <input
                      type="text"
                      value={user.studentId}
                      disabled
                      className="input bg-slate-950/40 text-slate-500 border-slate-850 cursor-not-allowed font-mono"
                    />
                  </div>
                  <div>
                    <label className="label">Branch Name</label>
                    <input
                      type="text"
                      value={user.branch}
                      disabled
                      className="input bg-slate-950/40 text-slate-500 border-slate-850 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="label">Section Name</label>
                    <input
                      type="text"
                      value={`Section ${user.section}`}
                      disabled
                      className="input bg-slate-950/40 text-slate-500 border-slate-850 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="label">Batch Period</label>
                    <input
                      type="text"
                      value={getBatchDisplay(user.batch)}
                      disabled
                      className="input bg-slate-950/40 text-slate-500 border-slate-850 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Account Settings checklists */}
          <div className="card p-6 bg-[#0F1424]/60 backdrop-blur-xl border border-slate-800/80 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-6">Portal Configuration</h2>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between items-center p-4 border border-slate-850 bg-slate-950/10 rounded-xl">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-indigo-500/10 border border-indigo-500/25 rounded-lg text-indigo-400 mt-0.5">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-200">System Notifications</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Receive reminders about attendance and sleep patterns.</p>
                  </div>
                </div>
                <button className="btn btn-outline btn-sm">Configure</button>
              </div>

              <div className="flex justify-between items-center p-4 border border-slate-850 bg-slate-950/10 rounded-xl">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-emerald-500/10 border border-emerald-500/25 rounded-lg text-emerald-400 mt-0.5">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-200">Data Analytics Privacy</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Control how study timer metrics populate recommendations.</p>
                  </div>
                </div>
                <button className="btn btn-outline btn-sm">Manage</button>
              </div>

              <div className="flex justify-between items-center p-4 border border-slate-850 bg-slate-950/10 rounded-xl">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-amber-500/10 border border-amber-500/25 rounded-lg text-amber-400 mt-0.5">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-200">Authentication Details</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Change password and setup recovery email portals.</p>
                  </div>
                </div>
                <button className="btn btn-outline btn-sm">Configure</button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;
