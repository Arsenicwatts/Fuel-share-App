import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Fuel, LogOut, Menu, X, Sun, Moon } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Navbar() {
  const { user, logout, theme, toggleTheme } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { label: 'Find Rides', path: '/dashboard' },
    { label: 'Post Ride', path: '/create' },
    { label: 'My Rides', path: '/bookings' },
    { label: 'Profile', path: '/profile' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white/85 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-2">
          <Fuel className="text-emerald-600 dark:text-emerald-400" size={32} />
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Fuel<span className="text-emerald-600 dark:text-emerald-400">Share</span></h1>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          {user ? (
            <>
              {navItems.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`font-bold text-sm transition-colors ${isActive(item.path) ? 'text-emerald-700 dark:text-emerald-400 font-extrabold underline decoration-emerald-500 decoration-2 underline-offset-4' : 'text-slate-800 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400'}`}
                >
                  {item.label}
                </Link>
              ))}
              <div className="flex items-center gap-2 pl-6 border-l border-slate-300 dark:border-slate-700">
                {/* Dark mode toggle */}
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                  title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                  {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                </button>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{user.name}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Student</p>
                </div>
                <button onClick={logout} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-500 hover:text-red-600 rounded-full transition-colors" title="Log Out">
                  <LogOut size={20} />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button
                onClick={() => document.getElementById('auth-form')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold rounded-xl shadow-lg hover:shadow-emerald-500/30 transition-all hover:-translate-y-0.5 active:scale-95"
              >
                Login
              </button>
            </div>
          )}
        </div>

        {/* Mobile controls */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-slate-500 dark:text-slate-400"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          {user && (
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-emerald-600 rounded-lg transition-colors"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Drawer */}
      {user && mobileOpen && (
        <div className="md:hidden bg-white/80 dark:bg-slate-900/90 backdrop-blur-xl border-t border-white/40 dark:border-slate-700/40 animate-in slide-in-from-top-2 fade-in duration-200">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-1">
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all ${isActive(item.path)
                  ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-bold'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-emerald-600'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-2 pt-3 border-t border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between px-4">
              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-white">{user.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Student</p>
              </div>
              <button onClick={logout} className="p-2 bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 rounded-full transition-colors">
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}