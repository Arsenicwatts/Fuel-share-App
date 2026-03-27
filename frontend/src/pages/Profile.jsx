import React, { useState } from 'react';
import { User, Phone, FileText, CheckCircle2 } from 'lucide-react';

export default function Profile({ user, onUpdateUser }) {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: user?.bio || ''
  });
  const [saved, setSaved] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdateUser({ ...user, ...formData });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-bold text-2xl">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Your Profile</h2>
            <p className="text-slate-500">Add details so drivers know who they are picking up.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-3.5 text-slate-400" />
                <input required name="name" value={formData.name} onChange={handleChange} className="input-field pl-10" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">College Email</label>
              <div className="relative">
                <FileText size={18} className="absolute left-3 top-3.5 text-slate-400" />
                <input disabled value={formData.email} className="input-field pl-10 bg-slate-50 text-slate-500 cursor-not-allowed" />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Contact Number</label>
              <div className="relative">
                <Phone size={18} className="absolute left-3 top-3.5 text-slate-400" />
                <input name="phone" value={formData.phone} onChange={handleChange} placeholder="e.g. +91 98765 43210" className="input-field pl-10" />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Short Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows="3"
                placeholder="Hi, I'm an Engineering student in 3rd year..."
                className="input-field resize-none"
              />
            </div>
          </div>

          <button type="submit" className="btn-primary w-full py-4 text-lg mt-4 flex justify-center items-center gap-2">
            {saved ? <><CheckCircle2 size={24} /> Profile Saved</> : 'Save Profile Details'}
          </button>
        </form>
      </div>
    </div>
  );
}
