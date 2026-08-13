import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CreateRide from './pages/Createride';
import Profile from './pages/Profile';
import MyBookings from './pages/MyBookings';
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';
import UniversityPartners from './pages/UniversityPartners';
import Support from './pages/Support';

// AppShell wraps all the authenticated + login routes inside the Navbar/background shell
function AppShell() {
  const { user, toast, theme } = useApp();

  return (
    <div className={`min-h-[100dvh] font-sans relative text-slate-800 dark:text-slate-100 ${
      theme === 'dark'
        ? 'bg-slate-950'
        : 'bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100'
    }`}>
      <style>
        {`
          @keyframes blob {
            0% { transform: translate(0px, 0px) scale(1); }
            33% { transform: translate(30px, -50px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
            100% { transform: translate(0px, 0px) scale(1); }
          }
          .animate-blob { animation: blob 7s infinite; }
          .animation-delay-2000 { animation-delay: 2s; }
          .animation-delay-4000 { animation-delay: 4s; }
        `}
      </style>

      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className={`absolute top-0 left-0 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl animate-blob ${theme === 'dark' ? 'bg-emerald-900 opacity-20' : 'bg-emerald-300 opacity-30'}`}></div>
        <div className={`absolute top-0 right-0 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000 ${theme === 'dark' ? 'bg-teal-900 opacity-20' : 'bg-teal-300 opacity-30'}`}></div>
        <div className={`absolute -bottom-8 left-20 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000 ${theme === 'dark' ? 'bg-cyan-900 opacity-20' : 'bg-cyan-300 opacity-30'}`}></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />

        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/create" element={<ProtectedRoute><CreateRide /></ProtectedRoute>} />
            <Route path="/bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to={user ? "/dashboard" : "/"} replace />} />
          </Routes>
        </main>

        {user && <Footer />}
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[100] animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="bg-white/80 dark:bg-slate-800/90 backdrop-blur-md px-6 py-4 rounded-2xl shadow-xl shadow-teal-500/10 border border-white/60 dark:border-slate-700/60 font-bold text-teal-800 dark:text-teal-300 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900 flex items-center justify-center text-teal-600 dark:text-teal-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
            </div>
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Routes>
          {/* Public standalone pages — have their own full-page layout, rendered outside AppShell */}
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/university-partners" element={<UniversityPartners />} />
          <Route path="/support" element={<Support />} />

          {/* All other routes (login, dashboard, etc.) go through AppShell */}
          <Route path="/*" element={<AppShell />} />
        </Routes>
      </AppProvider>
    </BrowserRouter>
  );
}