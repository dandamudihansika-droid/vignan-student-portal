import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Clock, 
  BookOpen, 
  Moon, 
  Menu, 
  X,
  GraduationCap,
  Calendar,
  LogOut,
  User as UserIcon,
  ChevronDown
} from 'lucide-react';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const user = authService.getCurrentUser();
  const isAuthenticated = authService.isAuthenticated();

  // If not logged in, do not render Navbar at all
  if (!isAuthenticated || !user) {
    return null;
  }

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: GraduationCap },
    { path: '/study-timer', label: 'Study Timer', icon: Clock },
    { path: '/attendance', label: 'Attendance', icon: Calendar },
    { path: '/academics', label: 'Academics', icon: BookOpen },
    { path: '/sleep', label: 'Sleep Analysis', icon: Moon },
  ];

  const handleLogout = () => {
    authService.logout();
    toast.success('Logged out successfully. Secure portal locked.');
    setIsProfileOpen(false);
    setIsMenuOpen(false);
    navigate('/login');
  };

  const isActiveLink = (path) => {
    return location.pathname === path;
  };

  const getInitials = () => {
    if (!user) return 'VU';
    const first = user.firstName ? user.firstName.charAt(0) : '';
    const last = user.lastName ? user.lastName.charAt(0) : '';
    return (first + last).toUpperCase();
  };

  return (
    <nav className="bg-[#0F1424]/60 backdrop-blur-xl border-b border-slate-800/80 sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2.5 group">
              <div className="w-9 h-9 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-all">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white group-hover:text-indigo-400 transition-colors">
                Vignan <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">Portal</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1.5">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActiveLink(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold tracking-wide transition-all duration-300 ${
                    active
                      ? 'text-white bg-indigo-600/20 border border-indigo-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50 border border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-indigo-400' : 'text-slate-400'}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Profile Menu (Desktop) */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-2.5 px-3 py-1.5 rounded-xl bg-slate-950/40 border border-slate-800 hover:border-slate-700 transition-all text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 font-extrabold text-xs flex items-center justify-center border border-indigo-500/20">
                  {getInitials()}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-200 line-clamp-1">
                    {user?.firstName}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono tracking-wider uppercase">
                    {user?.studentId}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              </button>

              {/* Profile Dropdown */}
              {isProfileOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)} />
                  <div className="absolute right-0 mt-2.5 w-56 rounded-xl bg-[#0F1424] border border-slate-800/80 shadow-2xl p-2 z-20 animate-slide-up">
                    <div className="px-3 py-2 border-b border-slate-800/60 mb-1">
                      <p className="text-xs text-slate-500">Logged in as</p>
                      <p className="text-sm font-bold text-slate-200 truncate">{user?.email}</p>
                    </div>
                    
                    <Link
                      to="/profile"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center space-x-2 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all"
                    >
                      <UserIcon className="w-4 h-4 text-slate-500" />
                      <span>My Profile</span>
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-2 px-3 py-2.5 rounded-lg text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Lock Portal (Logout)</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Mobile hamburger menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-800/60 space-y-4">
            <div className="px-2 space-y-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = isActiveLink(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-semibold transition-all ${
                      active
                        ? 'text-white bg-indigo-600/20 border border-indigo-500/20'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${active ? 'text-indigo-400' : 'text-slate-400'}`} />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Mobile User Section */}
            <div className="pt-4 border-t border-slate-800/60 px-4 space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 font-extrabold text-sm flex items-center justify-center border border-indigo-500/20">
                  {getInitials()}
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-200">{user?.firstName} {user?.lastName}</div>
                  <div className="text-xs text-slate-500 font-mono">{user?.studentId} • {user?.branch}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  to="/profile"
                  onClick={() => setIsMenuOpen(false)}
                  className="btn btn-outline btn-sm w-full py-2"
                >
                  <UserIcon className="w-4 h-4 mr-1.5 text-slate-400" />
                  <span>Profile</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="btn btn-danger btn-sm w-full py-2 hover:bg-red-700/80"
                >
                  <LogOut className="w-4 h-4 mr-1.5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
