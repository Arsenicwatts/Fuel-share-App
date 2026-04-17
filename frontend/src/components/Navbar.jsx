import React from 'react';
import { Fuel, LogOut } from 'lucide-react';

export default function Navbar({ user, page, setPage, onLogout }) {
  return (
    <nav className="bg-white/30 backdrop-blur-md border-b border-white/40 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div
          onClick={() => setPage('dashboard')}
          className="flex items-center gap-2 cursor-pointer"
        >
          <Fuel className="text-emerald-600" size={32} />
          <h1 className="text-2xl font-bold text-slate-800">Fuel<span className="text-emerald-600">Share</span></h1>
        </div>

        <div className="flex items-center gap-6">
          {user ? (
            <>
              <button onClick={() => setPage('dashboard')} className={`font-medium transition-colors ${page === 'dashboard' ? 'text-emerald-600' : 'text-slate-600 hover:text-emerald-600'}`}>Find Rides</button>
              <button onClick={() => setPage('create')} className={`font-medium transition-colors ${page === 'create' ? 'text-emerald-600' : 'text-slate-600 hover:text-emerald-600'}`}>Post Ride</button>
              <button onClick={() => setPage('my_bookings')} className={`font-medium transition-colors ${page === 'my_bookings' ? 'text-emerald-600' : 'text-slate-600 hover:text-emerald-600'}`}>My Rides</button>
              <button onClick={() => setPage('profile')} className={`font-medium transition-colors ${page === 'profile' ? 'text-emerald-600' : 'text-slate-600 hover:text-emerald-600'}`}>Profile</button>
              <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
                <div className="text-right hidden md:block">
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
      </div>
    </nav>
  );
}