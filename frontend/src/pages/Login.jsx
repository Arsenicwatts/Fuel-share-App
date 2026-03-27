import React, { useState } from 'react';
import { Mail, Lock, User, Car, Droplet, Users } from 'lucide-react';

export default function Login({ onLogin }) {
  const [isSignup, setIsSignup] = useState(false);
  const [isDriver, setIsDriver] = useState(false);
  const [formData, setFormData] = useState({
    name: 'Student Demo',
    email: 'student@college.edu',
    password: 'password',
    model: 'Honda City',
    mileage: '15',
    capacity: '4'
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    const mockUser = {
      id: Date.now(),
      name: isSignup ? formData.name : "Student Demo",
      email: formData.email,
      is_driver: isSignup ? isDriver : true,
      vehicle: (isSignup && isDriver) || (!isSignup) ? {
        id: Date.now(),
        model: isSignup ? formData.model : "Honda City",
        mileage: parseFloat(isSignup ? formData.mileage : 15),
        capacity: parseInt(isSignup ? formData.capacity : 4, 10)
      } : null
    };
    onLogin(mockUser);
  };

  return (
    <div className="flex items-center justify-center min-h-[85vh]">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">

        {/* Header Section */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-700 p-8 text-white relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
          <h2 className="text-3xl font-bold mb-2 relative z-10">{isSignup ? 'Join FuelShare' : 'Welcome Back'}</h2>
          <p className="text-emerald-50 relative z-10">
            {isSignup ? '@college.edu required for safety.' : 'Login to find your next ride.'}
          </p>
        </div>

        {/* Form Section */}
        <div className="p-8">
          <div className="flex justify-center mb-6 bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setIsSignup(false)}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${!isSignup ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setIsSignup(true)}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${isSignup ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {isSignup && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">Full Name</label>
                <div className="relative">
                  <User size={18} className="absolute left-3 top-3.5 text-slate-400" />
                  <input name="name" onChange={handleChange} value={formData.name} className="input-field pl-10" required />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">College Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-3.5 text-slate-400" />
                <input type="email" name="email" onChange={handleChange} value={formData.email} className="input-field pl-10" required />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-3.5 text-slate-400" />
                <input type="password" name="password" onChange={handleChange} value={formData.password} className="input-field pl-10" required />
              </div>
            </div>

            {isSignup && (
              <div className="pt-4 border-t border-slate-100 mt-6">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" checked={isDriver} onChange={(e) => setIsDriver(e.target.checked)} className="w-5 h-5 text-emerald-500 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer" />
                  <span className="text-sm font-semibold text-slate-700 group-hover:text-emerald-700 transition-colors">I want to offer rides (Driver)</span>
                </label>

                {isDriver && (
                  <div className="mt-5 space-y-4 animate-in slide-in-from-top-2 fade-in duration-300">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">Vehicle Model</label>
                      <div className="relative">
                        <Car size={18} className="absolute left-3 top-3.5 text-slate-400" />
                        <input name="model" onChange={handleChange} value={formData.model} className="input-field pl-10" placeholder="e.g. Honda City" required />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">Mileage (km/l)</label>
                        <div className="relative">
                          <Droplet size={18} className="absolute left-3 top-3.5 text-slate-400" />
                          <input type="number" step="0.1" name="mileage" onChange={handleChange} value={formData.mileage} className="input-field pl-10" required />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">Capacity</label>
                        <div className="relative">
                          <Users size={18} className="absolute left-3 top-3.5 text-slate-400" />
                          <input type="number" name="capacity" onChange={handleChange} value={formData.capacity} className="input-field pl-10" required />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <button type="submit" className="btn-primary w-full py-3.5 mt-8 shadow-md hover:shadow-lg">
              {isSignup ? (isDriver ? 'Register as Driver' : 'Register as Passenger') : 'Secure Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}