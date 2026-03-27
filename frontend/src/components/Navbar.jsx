import React from 'react';
import { Fuel, LogOut } from 'lucide-react';

export default function Navbar({ user, setPage, onLogout }) {
  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
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
              <button onClick={() => setPage('dashboard')} className="text-slate-600 hover:text-emerald-600 font-medium">Find Rides</button>
              <button onClick={() => setPage('create')} className="text-slate-600 hover:text-emerald-600 font-medium">Post Ride</button>
              <button onClick={() => setPage('profile')} className="text-slate-600 hover:text-emerald-600 font-medium">Profile</button>
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
            <button className="btn-primary">Login</button>
          )}
        </div>
      </div>
    </nav>
  );
}