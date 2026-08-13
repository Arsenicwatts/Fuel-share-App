import React, { useState } from 'react';
import { Mail, Lock, User, CheckCircle, Leaf, Shield, AlertCircle, KeyRound, Loader2, ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Login() {
  const { login, API_URL, NODE_URL } = useApp();
  const [isSignup, setIsSignup] = useState(() => {
    try {
      return sessionStorage.getItem('fuelshare_signup_mode') === 'true';
    } catch (e) { return false; }
  });
  const [isForgot, setIsForgot] = useState(false);

  const [showOtp, setShowOtp] = useState(() => {
    try {
      return sessionStorage.getItem('fuelshare_show_otp') === 'true';
    } catch (e) { return false; }
  });

  const [userOtp, setUserOtp] = useState(() => {
    try {
      return sessionStorage.getItem('fuelshare_user_otp') || '';
    } catch (e) { return ''; }
  });

  const [formData, setFormData] = useState(() => {
    try {
      const saved = sessionStorage.getItem('fuelshare_form_data');
      return saved ? JSON.parse(saved) : { name: '', email: '', password: '' };
    } catch (e) {
      return { name: '', email: '', password: '' };
    }
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleChange = (e) => {
    const updated = { ...formData, [e.target.name]: e.target.value };
    setFormData(updated);
    try {
      sessionStorage.setItem('fuelshare_form_data', JSON.stringify(updated));
    } catch (e) {}
  };

  const handleOtpChange = (e) => {
    const val = e.target.value.replace(/\D/g, '');
    setUserOtp(val);
    try {
      sessionStorage.setItem('fuelshare_user_otp', val);
    } catch (e) {}
  };

  // 1. Initial Signup Button Click
  const initiateSignup = async () => {
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch(`${NODE_URL}/api/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      });
      const data = await res.json();

      if (data.status === 'error') {
        setError(data.message);
      } else {
        // Mail sent successfully, switch UI to OTP input and persist state across tab switches
        setShowOtp(true);
        try {
          sessionStorage.setItem('fuelshare_show_otp', 'true');
          sessionStorage.setItem('fuelshare_signup_mode', 'true');
          sessionStorage.setItem('fuelshare_form_data', JSON.stringify(formData));
        } catch (e) {}
      }
    } catch (err) {
      setError("Failed to communicate with the mail server. Ensure `node server.js` is running on port 5000.");
    } finally {
      setIsLoading(false);
    }
  };

  // 1.5 Initial Forgot Password Button Click
  const initiateForgot = async () => {
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch(`${NODE_URL}/api/send-reset-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      });
      const data = await res.json();

      if (data.status === 'error') {
        setError(data.message);
      } else {
        setShowOtp(true);
      }
    } catch (err) {
      setError("Failed to communicate with the mail server.");
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Final Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // --- Forgot Password Flow ---
    if (isForgot) {
      if (!showOtp) {
        return initiateForgot();
      } else {
        setIsLoading(true);
        try {
          const verifyRes = await fetch(`${NODE_URL}/api/verify-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: formData.email, otp: userOtp })
          });
          const verifyData = await verifyRes.json();

          if (verifyData.status === 'error') {
            setIsLoading(false);
            return setError(verifyData.message);
          }

          const resetRes = await fetch(`${API_URL}?action=reset_password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: formData.email, password: formData.password })
          });
          const resetData = await resetRes.json();

          if (resetData.error) {
            setIsLoading(false);
            return setError(resetData.error);
          }

          setIsForgot(false);
          setShowOtp(false);
          setUserOtp('');
          setFormData({ ...formData, password: '' });
          setError('Password reset successfully. You can now login.');
          setIsLoading(false);
          return;
        } catch (err) {
          setIsLoading(false);
          return setError("Failed to reset password.");
        }
      }
    }

    // --- Signup Flow ---
    if (isSignup && !showOtp) {
      return initiateSignup();
    }

    if (isSignup && showOtp) {
      setIsLoading(true);
      try {
        const verifyRes = await fetch(`${NODE_URL}/api/verify-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email, otp: userOtp })
        });
        const verifyData = await verifyRes.json();

        if (verifyData.status === 'error') {
          setIsLoading(false);
          return setError(verifyData.message);
        }
      } catch (err) {
        setIsLoading(false);
        return setError("Failed to verify code with backend server.");
      }
    }

    // --- Standard PHP verification/record insertion flow (Login & verified Signup) ---
    if (!isLoading) setIsLoading(true);
    try {
      const endpoint = isSignup ? 'signup' : 'login';
      const bodyData = isSignup
        ? { name: formData.name, email: formData.email, password: formData.password }
        : { email: formData.email, password: formData.password };

      const res = await fetch(`${API_URL}?action=${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyData)
      });

      const data = await res.json();

      if (data.error) {
        setIsLoading(false);
        return setError(data.error);
      }

      try {
        sessionStorage.removeItem('fuelshare_show_otp');
        sessionStorage.removeItem('fuelshare_signup_mode');
        sessionStorage.removeItem('fuelshare_form_data');
        sessionStorage.removeItem('fuelshare_user_otp');
      } catch (e) {}

      login(data, rememberMe); // Successfully logged in or verified & created
    } catch (err) {
      setError("Failed to connect to database backend. Ensure XAMPP is running!");
      setIsLoading(false);
    }
  };

  const handleToggleMode = (signupMode) => {
    setIsSignup(signupMode);
    setIsForgot(false);
    setShowOtp(false);
    setError('');
    setUserOtp('');
    try {
      sessionStorage.removeItem('fuelshare_show_otp');
      sessionStorage.setItem('fuelshare_signup_mode', String(signupMode));
      sessionStorage.removeItem('fuelshare_user_otp');
    } catch (e) {}
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-[100dvh] pb-24">

      {/* Introduction Hero Section */}
      <div className="w-full max-w-5xl mx-auto flex flex-col items-center text-center mt-12 md:mt-24 mb-16 px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <span className="inline-block py-1.5 px-4 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 text-sm font-bold tracking-wide mb-6 border border-emerald-300/60 shadow-sm">
          Campus Commuting, Reimagined
        </span>
        <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-tight mb-6">
          Share the Ride. <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
            Split the Exact Cost.
          </span>
        </h1>
        <p className="text-lg text-slate-700 dark:text-slate-300 font-medium max-w-2xl mb-12">
          FuelShare is a zero-profit, student-exclusive carpooling platform. We crunch real-time fuel data to calculate your exact micro-share.
        </p>

        {/* Features Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
          {[
            { icon: CheckCircle, title: "Zero Profit", desc: "No haggling. Pay the exact cost of fuel consumed." },
            { icon: Shield, title: "100% Verified", desc: "Access restricted strictly to university emails." },
            { icon: Leaf, title: "Eco-Conscious", desc: "Track the CO₂ you save with every shared trip." }
          ].map((feat, i) => (
            <div key={i} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/80 dark:border-slate-700 shadow-md shadow-teal-500/5 flex flex-col items-center text-center hover:-translate-y-1 transition-transform">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/60 backdrop-blur-sm flex items-center justify-center mb-4 text-emerald-700 dark:text-emerald-400 border border-emerald-200">
                <feat.icon size={24} />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-2">{feat.title}</h3>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">{feat.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Auth Card */}
      <div id="auth-form" className="w-full max-w-md px-4 scroll-mt-24 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 fill-mode-both">
        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-2xl rounded-[2rem] shadow-2xl shadow-teal-500/10 overflow-hidden border border-white/80 dark:border-slate-700 relative">

          <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-8 text-white relative transition-all duration-300">
            {!showOtp ? (
              <>
                <h2 className="text-3xl font-bold mb-2 relative z-10">
                  {isForgot ? 'Reset Password' : isSignup ? 'Create Account' : 'Welcome Back'}
                </h2>
                <p className="text-emerald-50 relative z-10 font-medium">
                  {isForgot ? 'Enter your email to get a reset code.' : isSignup ? '@college.edu required for safety.' : 'Login to find your next ride.'}
                </p>
              </>
            ) : (
              <>
                <h2 className="text-3xl font-bold mb-2 relative z-10">Verify Identity</h2>
                <p className="text-emerald-50 relative z-10 font-medium">
                  We just sent a 6-digit code to <span className="font-bold underline">{formData.email}</span>.
                </p>
              </>
            )}
          </div>

          <div className="p-8">
            {!showOtp && !isForgot && (
              <div className="flex justify-center mb-6 bg-slate-100 dark:bg-slate-700/50 p-1.5 rounded-xl border border-slate-200 dark:border-slate-600">
                <button
                  type="button"
                  onClick={() => handleToggleMode(false)}
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${!isSignup ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'}`}
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleMode(true)}
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${isSignup ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'}`}
                >
                  Sign Up
                </button>
              </div>
            )}

            {!showOtp && isForgot && (
              <button
                type="button"
                onClick={() => { setIsForgot(false); setError(''); }}
                className="mb-6 text-sm text-emerald-600 dark:text-emerald-400 font-bold flex items-center hover:underline"
              >
                <ArrowLeft size={16} className="mr-1" /> Back to Login
              </button>
            )}

            {error && (
              <div className={`mb-6 p-3 rounded-xl flex items-center gap-3 text-sm font-semibold border animate-in fade-in ${error.includes('successfully') ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'}`}>
                {error.includes('successfully') ? <CheckCircle size={18} className="shrink-0" /> : <AlertCircle size={18} className="shrink-0" />}
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">

              {!showOtp ? (
                // Standard Login/Signup/Forgot Fields
                <>
                  <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isSignup ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0 hidden'}`}>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wide">Full Name</label>
                    <div className="relative">
                      <User size={18} className="absolute left-3 top-3.5 text-slate-500" />
                      <input name="name" onChange={handleChange} value={formData.name} className="input-field pl-10" placeholder="John Doe" required={isSignup} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wide">College Email</label>
                    <div className="relative">
                      <Mail size={18} className="absolute left-3 top-3.5 text-slate-500" />
                      <input type="email" name="email" onChange={handleChange} value={formData.email} className="input-field pl-10" placeholder="student@college.edu" required />
                    </div>
                  </div>

                  <div className={`overflow-hidden transition-all duration-300 ease-in-out ${!isForgot ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0 hidden'}`}>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wide">Password</label>
                    <div className="relative">
                      <Lock size={18} className="absolute left-3 top-3.5 text-slate-500" />
                      <input type="password" name="password" onChange={handleChange} value={formData.password} className="input-field pl-10" placeholder="••••••••" required={!isForgot} />
                    </div>
                  </div>

                  {/* Remember Me Checkbox & Forgot Password */}
                  {!isSignup && !isForgot && (
                    <div className="flex items-center justify-between pt-1">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
                        />
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Remember Me (24h)</span>
                      </label>
                      <button type="button" onClick={() => { setIsForgot(true); setError(''); setFormData({...formData, password: ''}); }} className="text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline">
                        Forgot Password?
                      </button>
                    </div>
                  )}
                </>
              ) : (
                // OTP Challenge Phase
                <div className="animate-in fade-in zoom-in-95 duration-300 space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wide">6-Digit Verification Code</label>
                    <div className="relative">
                      <KeyRound size={18} className="absolute left-3 top-3.5 text-emerald-600" />
                      <input
                        type="text"
                        maxLength="6"
                        value={userOtp}
                        onChange={handleOtpChange}
                        className="input-field pl-10 bg-emerald-50/50 border-emerald-200 text-lg tracking-widest font-bold focus:ring-emerald-300 text-center"
                        placeholder="000000"
                        required
                      />
                    </div>
                  </div>

                  {isForgot && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wide">New Password</label>
                      <div className="relative">
                        <Lock size={18} className="absolute left-3 top-3.5 text-emerald-600" />
                        <input
                          type="password"
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          className="input-field pl-10 bg-emerald-50/50 border-emerald-200 font-bold focus:ring-emerald-300"
                          placeholder="••••••••"
                          required
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center py-3.5 mt-8 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin mr-2" size={20} />
                ) : null}

                {isForgot
                  ? showOtp
                    ? 'Reset Password'
                    : 'Send Reset Code'
                  : !isSignup
                    ? 'Secure Login'
                    : showOtp
                      ? 'Verify & Complete Registration'
                      : 'Dispatch Verification Code'}
              </button>

              {showOtp && (
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => setShowOtp(false)}
                  className="w-full mt-3 py-2 text-sm text-slate-500 hover:text-slate-800 font-medium transition-colors disabled:opacity-50"
                >
                  Edit details / Resend email
                </button>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}