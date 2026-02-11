import React from 'react';

export default function Login({ onLogin }) {
  // Mock login for demo purposes
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    const mockUser = { 
      id: 1, 
      name: "Student Demo", 
      is_driver: true, 
      vehicle: { id: 101, mileage: 15, capacity: 4 }
    };
    onLogin(mockUser);
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border-t-4 border-emerald-500">
        <h2 className="text-3xl font-bold mb-2 text-center text-slate-800">Welcome Back</h2>
        <p className="text-center text-slate-500 mb-8">Login to FuelShare</p>
        
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">College Email</label>
            <input type="email" defaultValue="student@college.edu" className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
            <input type="password" defaultValue="password" className="input-field" />
          </div>
          <button type="submit" className="btn-primary w-full py-3 mt-4">
            Login as Student
          </button>
        </form>
      </div>
    </div>
  );
}