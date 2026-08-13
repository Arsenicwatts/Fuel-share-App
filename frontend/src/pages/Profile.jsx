import React, { useState } from 'react';
import { User, Phone, FileText, CheckCircle2, AlertTriangle, X, KeyRound, Loader2, Frown, Leaf, ShieldCheck, QrCode, GraduationCap, Car } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Profile() {
  const { user, setUser, API_URL, NODE_URL, logout, totalCO2Saved } = useApp();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    department: user?.department || '',
    upi_id: user?.upi_id || '',
    bio: user?.bio || ''
  });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  // Deletion Modal States
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteStep, setDeleteStep] = useState('reason'); // 'reason', 'verify'
  const [selectedReasons, setSelectedReasons] = useState([]);
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
      const userId = user?.id || user?.user_id;
      const payload = { ...formData, id: userId, user_id: userId };
      await fetch(`${API_URL}?action=update_profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      setUser({ ...user, ...formData });
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

  // Server-side OTP: ask the server to generate and send the code
  const initiateDeleteOTP = async () => {
    setDeleteLoading(true);
    setDeleteError('');
    try {
      const nodeApi = `${NODE_URL}/api/send-otp`;
      const res = await fetch(nodeApi, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email })
      });

      const data = await res.json();
      if (data.status === 'error') throw new Error(data.message);

      setDeleteStep('verify');
    } catch (err) {
      setDeleteError("Failed to dispatch verification email. " + err.message);
    }
    setDeleteLoading(false);
  };

  // Server-side OTP: verify the code on the server, then delete
  const finalizeDeletion = async () => {
    setDeleteLoading(true);
    setDeleteError('');

    try {
      // Verify OTP server-side
      const verifyRes = await fetch(`${NODE_URL}/api/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, otp: userOtp })
      });
      const verifyData = await verifyRes.json();

      if (verifyData.status === 'error') {
        setDeleteLoading(false);
        return setDeleteError(verifyData.message);
      }

      // OTP verified — proceed with deletion
      await fetch(`${API_URL}?action=delete_account`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id })
      });
      alert("Your account has been permanently deleted.");
      logout();
    } catch (err) {
      setDeleteError("Server error during deletion.");
      setDeleteLoading(false);
    }
  };

  const treesPlanted = (totalCO2Saved / 20.0).toFixed(1);

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* HEADER CARD WITH ECO BADGE */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-20 h-20 bg-white text-emerald-700 rounded-full flex items-center justify-center font-black text-3xl shadow-md border-4 border-emerald-200">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="absolute -bottom-1 -right-1 bg-amber-400 text-slate-950 p-1.5 rounded-full shadow-md" title="Verified Campus Member">
                <ShieldCheck size={16} />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-extrabold">{user?.name}</h2>
                <span className="bg-white/20 backdrop-blur-md text-xs px-2.5 py-0.5 rounded-full border border-white/30 font-bold flex items-center gap-1">
                  <ShieldCheck size={12} /> Campus Verified
                </span>
              </div>
              <p className="text-emerald-100 text-sm font-medium mt-1">{user?.email}</p>
              {formData.department && (
                <p className="text-emerald-200 text-xs font-semibold mt-0.5 flex items-center gap-1">
                  <GraduationCap size={13} /> {formData.department}
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-3 bg-black/20 backdrop-blur-md p-3.5 rounded-2xl border border-white/20">
            <div className="text-center px-3 border-r border-white/20">
              <div className="flex items-center justify-center gap-1 text-emerald-300">
                <Leaf size={16} />
                <span className="text-2xl font-black">{totalCO2Saved.toFixed(1)}</span>
              </div>
              <p className="text-[11px] text-emerald-100 font-bold mt-0.5">kg CO₂ Saved</p>
            </div>
            <div className="text-center px-3">
              <div className="flex items-center justify-center gap-1 text-amber-300">
                <span className="text-2xl font-black">{treesPlanted}</span>
              </div>
              <p className="text-[11px] text-emerald-100 font-bold mt-0.5">🌳 Trees Saved</p>
            </div>
          </div>
        </div>
      </div>

      {/* EDITABLE PROFILE DETAILS FORM */}
      <div className="bg-white/85 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl p-8 shadow-md border border-white/80 dark:border-slate-700/60">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          <User className="text-emerald-600" size={22} /> Personal & Payment Preferences
        </h3>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">Full Name</label>
              <div className="relative">
                <User size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
                <input required name="name" value={formData.name} onChange={handleChange} className="input-field pl-10" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">College Email</label>
              <div className="relative">
                <FileText size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
                <input disabled value={formData.email} className="input-field pl-10 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 cursor-not-allowed font-medium" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">Contact Phone</label>
              <div className="relative">
                <Phone size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
                <input name="phone" value={formData.phone} onChange={handleChange} placeholder="e.g. +91 98765 43210" className="input-field pl-10" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">Department / Year</label>
              <div className="relative">
                <GraduationCap size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
                <input name="department" value={formData.department} onChange={handleChange} placeholder="e.g. Computer Science — 3rd Year" className="input-field pl-10" />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center justify-between">
                <span>UPI Payment ID (for receiving fuel contributions)</span>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <QrCode size={13} /> GPay / PhonePe / Paytm
                </span>
              </label>
              <div className="relative">
                <QrCode size={18} className="absolute left-3.5 top-3.5 text-emerald-500" />
                <input name="upi_id" value={formData.upi_id} onChange={handleChange} placeholder="e.g. user@upi or 9876543210@paytm" className="input-field pl-10 font-semibold" />
              </div>
              <p className="text-xs text-slate-500 mt-1">Passengers will use this ID to make 1-click fuel cost transfers on accepted rides.</p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">Short Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows="3"
                placeholder="Hi, I'm an Engineering student commuting daily to campus..."
                className="input-field resize-none"
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-lg mt-4 flex justify-center items-center gap-2">
            {saved ? <><CheckCircle2 size={24} /> Profile Saved</> : loading ? <Loader2 className="animate-spin" /> : 'Save Profile Details'}
          </button>
        </form>

        {/* DANGER ZONE - ACCOUNT DELETION */}
        <div className="mt-12 pt-8 border-t border-red-100 dark:border-red-900/30">
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
