import React, { useState } from 'react';
import { Mail, Lock, User, CheckCircle, Leaf, Shield, AlertCircle, KeyRound, Loader2 } from 'lucide-react';

export default function Login({ onLogin }) {
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // OTP Verification States
  const [showOtp, setShowOtp] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [userOtp, setUserOtp] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // 1. Initial Signup Button Click (Sends Email)
  const initiateSignup = async () => {
    setIsLoading(true);
    setError('');

    // Generate secure 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(otp);

    try {
      // Connect to the Node Express server running on port 5000 for mailing
      const res = await fetch(`http://${window.location.hostname}:5000/api/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, otp })
      });
      const data = await res.json();

      if (data.status === 'error') {
        setError(data.message);
      } else {
        // Mail sent successfully, switch UI state
        setShowOtp(true);
      }
    } catch (err) {
      setError("Failed to communicate with the mail server. Ensure `node server.js` is running on port 5000.");
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Final Submit (Evaluates Login OR Verified OTP Signup)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // If User is signing up but hasn't received email yet
    if (isSignup && !showOtp) {
      return initiateSignup();
    }

    // If User is signing up and the OTP input is shown, verify the code first
    if (isSignup && showOtp) {
      if (userOtp !== generatedOtp) {
        return setError("Invalid verification code. Please check your email and try again.");
      }
    }

    // Standard PHP verification/record insertion flow
    setIsLoading(true);
    try {
      const endpoint = isSignup ? 'signup' : 'login';
      const bodyData = isSignup
        ? { name: formData.name, email: formData.email, password: formData.password }
        : { email: formData.email, password: formData.password };

      const res = await fetch(`http://${window.location.hostname}/fuelshare-backend/api/api.php?action=${endpoint}`, {
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

      onLogin(data); // Successfully logged in or verified & created
    } catch (err) {
      setError("Failed to connect to database backend. Ensure XAMPP is running!");
      setIsLoading(false);
    }
  };

  const handleToggleMode = (signupMode) => {
    setIsSignup(signupMode);
    setShowOtp(false); // Reset OTP sequence if they back out of signup
    setError('');
    setUserOtp('');
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-[100dvh] pb-24">

      {/* Introduction Hero Section */}
      <div className="w-full max-w-5xl mx-auto flex flex-col items-center text-center mt-12 md:mt-24 mb-16 px-4">
        <span className="inline-block py-1 px-4 rounded-full bg-emerald-100 text-emerald-700 text-sm font-bold tracking-wide mb-6 border border-emerald-200 shadow-sm">
          Campus Commuting, Reimagined
        </span>
        <h1 className="text-4xl md:text-6xl font-extrabold text-slate-800 tracking-tight leading-tight mb-6">
          Share the Ride. <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
            Split the Exact Cost.
          </span>
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mb-12">
          FuelShare is a zero-profit, student-exclusive carpooling platform. We crunch real-time fuel data to calculate your exact micro-share.
        </p>

        {/* Features Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
          {[
            { icon: CheckCircle, title: "Zero Profit", desc: "No haggling. Pay the exact cost of fuel consumed." },
            { icon: Shield, title: "100% Verified", desc: "Access restricted strictly to university emails." },
            { icon: Leaf, title: "Eco-Conscious", desc: "Track the CO₂ you save with every shared trip." }
          ].map((feat, i) => (
            <div key={i} className="bg-white/60 backdrop-blur-md rounded-2xl p-6 border border-white shadow-sm flex flex-col items-center text-center hover:-translate-y-1 transition-transform">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mb-4 text-emerald-600">
                <feat.icon size={24} />
              </div>
              <h3 className="font-bold text-slate-800 mb-2">{feat.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Auth Card */}
      <div id="auth-form" className="w-full max-w-md px-4 scroll-mt-24">
        <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden border border-white/60 relative">

          <div className="bg-gradient-to-br from-emerald-500/90 to-teal-600/90 p-8 text-white relative transition-all duration-300">
            {!showOtp ? (
              <>
                <h2 className="text-3xl font-bold mb-2 relative z-10">{isSignup ? 'Create Account' : 'Welcome Back'}</h2>
                <p className="text-emerald-50 relative z-10 font-medium">
                  {isSignup ? '@college.edu required for safety.' : 'Login to find your next ride.'}
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
            {!showOtp && (
              <div className="flex justify-center mb-6 bg-slate-100/50 p-1.5 rounded-xl border border-slate-200/50">
                <button
                  type="button"
                  onClick={() => handleToggleMode(false)}
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${!isSignup ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleMode(true)}
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${isSignup ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Sign Up
                </button>
              </div>
            )}

            {error && (
              <div className="mb-6 bg-red-50 text-red-600 p-3 rounded-xl flex items-center gap-3 text-sm font-semibold border border-red-100 animate-in fade-in">
                <AlertCircle size={18} className="shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">

              {!showOtp ? (
                // Standard Login/Signup Fields
                <>
                  <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isSignup ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0 hidden'}`}>
                    <label className="block text-xs font-bold text-slate-600 mb-1 uppercase tracking-wide">Full Name</label>
                    <div className="relative">
                      <User size={18} className="absolute left-3 top-3.5 text-slate-400" />
                      <input name="name" onChange={handleChange} value={formData.name} className="input-field pl-10 bg-white/50" placeholder="John Doe" required={isSignup} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1 uppercase tracking-wide">College Email</label>
                    <div className="relative">
                      <Mail size={18} className="absolute left-3 top-3.5 text-slate-400" />
                      <input type="email" name="email" onChange={handleChange} value={formData.email} className="input-field pl-10 bg-white/50" placeholder="student@college.edu" required />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1 uppercase tracking-wide">Password</label>
                    <div className="relative">
                      <Lock size={18} className="absolute left-3 top-3.5 text-slate-400" />
                      <input type="password" name="password" onChange={handleChange} value={formData.password} className="input-field pl-10 bg-white/50" placeholder="••••••••" required />
                    </div>
                  </div>
                </>
              ) : (
                // OTP Challenge Phase
                <div className="animate-in fade-in zoom-in-95 duration-300">
                  <label className="block text-xs font-bold text-slate-600 mb-1 uppercase tracking-wide">6-Digit Verification Code</label>
                  <div className="relative">
                    <KeyRound size={18} className="absolute left-3 top-3.5 text-emerald-600" />
                    <input
                      type="text"
                      maxLength="6"
                      value={userOtp}
                      onChange={(e) => setUserOtp(e.target.value.replace(/\D/g, ''))} // only allow numbers
                      className="input-field pl-10 bg-emerald-50/50 border-emerald-200 text-lg tracking-widest font-bold focus:ring-emerald-300 text-center"
                      placeholder="000000"
                      required
                    />
                  </div>
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

                {!isSignup
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