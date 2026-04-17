import React, { useState } from 'react';
import { User, Phone, FileText, CheckCircle2, AlertTriangle, X, KeyRound, Loader2, Frown } from 'lucide-react';

export default function Profile({ user, onUpdateUser, API_URL, onLogout }) {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: user?.bio || ''
  });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  // Deletion Modal States
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteStep, setDeleteStep] = useState('reason'); // 'reason', 'verify'
  const [selectedReasons, setSelectedReasons] = useState([]);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [userOtp, setUserOtp] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const REASONS = [
    "Not finding rides",
    "Found another commuting method",
    "Privacy concerns",
    "App keeps crashing/bugs",
    "Graduating/Leaving college",
    "Other"
  ];

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...formData, id: user.id };
      await fetch(`${API_URL}?action=update_profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      onUpdateUser({ ...user, ...formData });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
      alert("Failed to save profile");
    }
    setLoading(false);
  };

  const toggleReason = (reason) => {
    if (selectedReasons.includes(reason)) {
      setSelectedReasons(selectedReasons.filter(r => r !== reason));
    } else {
      setSelectedReasons([...selectedReasons, reason]);
    }
  };

  const initiateDeleteOTP = async () => {
    setDeleteLoading(true);
    setDeleteError('');
    try {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(otp);

      const nodeApi = `http://${window.location.hostname}:5000/api/send-otp`;
      const res = await fetch(nodeApi, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, otp })
      });

      const data = await res.json();
      if (data.status === 'error') throw new Error(data.message);

      setDeleteStep('verify');
    } catch (err) {
      setDeleteError("Failed to dispatch verification email. " + err.message);
    }
    setDeleteLoading(false);
  };

  const finalizeDeletion = async () => {
    if (userOtp !== generatedOtp) {
      return setDeleteError("Invalid verification code.");
    }
    setDeleteLoading(true);
    try {
      await fetch(`${API_URL}?action=delete_account`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id })
      });
      alert("Your account has been permanently deleted.");
      onLogout();
    } catch (err) {
      setDeleteError("Server error during deletion.");
      setDeleteLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto pb-20 animate-in fade-in duration-500">
      <div className="bg-white/20 backdrop-blur-xl rounded-3xl p-8 shadow-lg border border-white/40">
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

          <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-lg mt-4 flex justify-center items-center gap-2">
            {saved ? <><CheckCircle2 size={24} /> Profile Saved</> : loading ? <Loader2 className="animate-spin" /> : 'Save Profile Details'}
          </button>
        </form>

        {/* DANGER ZONE - ACCOUNT DELETION */}
        <div className="mt-12 pt-8 border-t border-red-100">
          <h3 className="text-lg font-bold text-red-600 mb-2 flex items-center gap-2">
            <AlertTriangle size={20} /> Danger Zone
          </h3>
          <p className="text-slate-500 text-sm mb-4">Permanently delete your account, rides, and history. This action cannot be undone.</p>
          <button onClick={() => setShowDeleteModal(true)} className="px-6 py-3 rounded-xl border-2 border-red-200 text-red-600 font-bold hover:bg-red-50 transition-colors">
            Delete My Account
          </button>
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-red-50 p-6 flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-red-700 flex items-center gap-2">
                  <Frown size={28} /> We're sad to see you go!
                </h2>
                <p className="text-red-900/70 font-medium mt-1">
                  {deleteStep === 'reason' ? "Could you tell us why you're leaving?" : "Final security verification step."}
                </p>
              </div>
              <button onClick={() => setShowDeleteModal(false)} className="text-red-400 hover:text-red-600 p-1">
                <X size={24} />
              </button>
            </div>

            <div className="p-8">
              {deleteError && (
                <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-xl font-medium border border-red-200 flex items-center gap-2">
                  <AlertTriangle size={18} /> {deleteError}
                </div>
              )}

              {deleteStep === 'reason' ? (
                <div>
                  <div className="flex flex-wrap gap-2">
                    {REASONS.map(r => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => toggleReason(r)}
                        className={`px-4 py-2 rounded-full text-sm font-semibold transition-all border ${selectedReasons.includes(r)
                          ? 'bg-red-600 text-white border-red-600'
                          : 'bg-white text-slate-600 border-slate-300 hover:border-red-400 hover:bg-red-50'
                          }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={initiateDeleteOTP}
                    disabled={deleteLoading || selectedReasons.length === 0}
                    className="w-full mt-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl flex items-center justify-center transition-colors disabled:opacity-50"
                  >
                    {deleteLoading ? <Loader2 className="animate-spin" /> : "Continue to Deletion"}
                  </button>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">6-Digit Verification Code</label>
                  <p className="text-sm text-slate-500 mb-4">We dispatched a secondary code to <strong className="text-slate-800">{user.email}</strong> to verify this destructive action.</p>

                  <div className="relative mb-8">
                    <KeyRound size={20} className="absolute left-4 top-4 text-red-400" />
                    <input
                      type="text"
                      maxLength="6"
                      value={userOtp}
                      onChange={(e) => setUserOtp(e.target.value.replace(/\D/g, ''))}
                      className="w-full py-4 pl-12 pr-4 bg-red-50/50 border border-red-200 rounded-xl text-xl tracking-[0.5em] font-bold text-center focus:ring-2 focus:ring-red-400 focus:outline-none transition-all"
                      placeholder="000000"
                    />
                  </div>

                  <button
                    onClick={finalizeDeletion}
                    disabled={deleteLoading || userOtp.length !== 6}
                    className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl flex items-center justify-center transition-colors disabled:opacity-50"
                  >
                    {deleteLoading ? <Loader2 className="animate-spin" /> : "Permanently Delete Account"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
