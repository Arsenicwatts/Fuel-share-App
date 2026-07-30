import React, { useState } from 'react';
import { Fuel, LogOut, Menu, X } from 'lucide-react';

export default function Navbar({ user, page, setPage, onLogout }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { label: 'Find Rides', key: 'dashboard' },
    { label: 'Post Ride', key: 'create' },
    { label: 'My Rides', key: 'my_bookings' },
    { label: 'Profile', key: 'profile' },
  ];

  const handleNav = (key) => {
    setPage(key);
    setMobileOpen(false);
  };

  return (
    <nav className="bg-white/30 backdrop-blur-md border-b border-white/40 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div
          onClick={() => handleNav('dashboard')}
          className="flex items-center gap-2 cursor-pointer"
        >
          <Fuel className="text-emerald-600" size={32} />
          <h1 className="text-2xl font-bold text-slate-800">Fuel<span className="text-emerald-600">Share</span></h1>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          {user ? (
            <>
              {navItems.map(item => (
                <button
                  key={item.key}
                  onClick={() => handleNav(item.key)}
                  className={`font-medium transition-colors ${page === item.key ? 'text-emerald-600' : 'text-slate-600 hover:text-emerald-600'}`}
                >
                  {item.label}
                </button>
              ))}
              <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-800">{user.name}</p>
                  <p className="text-xs text-slate-500">Student</p>
                </div>
                <button onClick={onLogout} className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full transition-colors">
                  <LogOut size={20} />
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={() => document.getElementById('auth-form')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold rounded-xl shadow-lg hover:shadow-emerald-500/30 transition-all hover:-translate-y-0.5 active:scale-95"
            >
              Login
            </button>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        {user && (
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-emerald-600 rounded-lg transition-colors"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        )}
      </div>

      {/* Mobile Drawer */}
      {user && mobileOpen && (
        <div className="md:hidden bg-white/80 backdrop-blur-xl border-t border-white/40 animate-in slide-in-from-top-2 fade-in duration-200">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-1">
            {navItems.map(item => (
              <button
                key={item.key}
                onClick={() => handleNav(item.key)}
                className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all ${page === item.key
                  ? 'bg-emerald-50 text-emerald-700 font-bold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-emerald-600'
                }`}
              >
                {item.label}
              </button>
            ))}
            <div className="mt-2 pt-3 border-t border-slate-200/50 flex items-center justify-between px-4">
              <div>
                <p className="text-sm font-bold text-slate-800">{user.name}</p>
                <p className="text-xs text-slate-500">Student</p>
              </div>
              <button onClick={onLogout} className="p-2 bg-red-50 text-red-500 hover:bg-red-100 rounded-full transition-colors">
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}