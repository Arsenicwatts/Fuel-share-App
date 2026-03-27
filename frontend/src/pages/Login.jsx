import React, { useState } from 'react';
import { Mail, Lock, User, Car, Droplet, Users, AlertCircle } from 'lucide-react';

export default function Login({ onLogin }) {
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(''); // clear previous errors

    // Load registered users from local storage
    const usersList = JSON.parse(localStorage.getItem('fuelshare_users_list') || '[]');

    if (isSignup) {
      // Prevent duplicate emails
      if (usersList.some((u) => u.email === formData.email)) {
        return setError("An account with this email already exists!");
      }

      // Create new user profile
      const newUser = {
        id: Date.now(),
        name: formData.name,
        email: formData.email,
        password: formData.password
      };

      // Save to registered list
      localStorage.setItem('fuelshare_users_list', JSON.stringify([...usersList, newUser]));

      // Auto login the new user
      onLogin(newUser);
    } else {
      // Validate returning user credentials
      const existingUser = usersList.find(
        (u) => u.email === formData.email && u.password === formData.password
      );

      if (!existingUser) {
        return setError("Invalid email or password. Are you sure you've registered?");
      }

      // Found the user, log them in!
      onLogin(existingUser);
    }
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

          {error && (
            <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-xl flex items-center gap-3 text-sm font-semibold animate-in fade-in">
              <AlertCircle size={18} className="shrink-0" />
              <p>{error}</p>
            </div>
          )}

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

            <button type="submit" className="btn-primary w-full py-3.5 mt-8 shadow-md hover:shadow-lg">
              {isSignup ? 'Create Account' : 'Secure Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}