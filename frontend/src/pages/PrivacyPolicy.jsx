import React from 'react';
import { Link } from 'react-router-dom';
import { Fuel, ArrowLeft, Lock, Eye, Database, Bell } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-slate-100">
      {/* Header */}
      <header className="border-b border-white/10 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <Fuel className="text-emerald-400 group-hover:scale-110 transition-transform" size={24} />
            <span className="text-xl font-bold text-white">
              Fuel<span className="text-emerald-400">Share</span>
            </span>
          </Link>
          <Link
            to="/"
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-emerald-400 transition-colors font-medium"
          >
            <ArrowLeft size={16} />
            Back
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl" />
        </div>
        <div className="relative">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-teal-500/20 border border-teal-500/30 mb-6">
            <Lock className="text-teal-400" size={32} />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
            Privacy <span className="text-teal-400">Policy</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Your privacy matters. Here's how we collect, use, and protect your data.
          </p>
          <p className="text-slate-500 text-sm mt-3">Last updated: August 2026</p>
        </div>
      </section>

      {/* Quick Summary Cards */}
      <section className="container mx-auto px-6 max-w-4xl mb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: Eye, color: 'teal', title: 'Transparent', desc: 'We clearly explain what data we collect and why.' },
            { icon: Database, color: 'emerald', title: 'Minimal Data', desc: "We only collect what's necessary to run the platform." },
            { icon: Bell, color: 'cyan', title: 'Your Control', desc: 'You can delete your account and data at any time.' },
          ].map(({ icon: Icon, color, title, desc }, i) => (
            <div key={i} className={`bg-${color}-500/10 border border-${color}-500/20 rounded-2xl p-5 text-center`}>
              <Icon className={`text-${color}-400 mx-auto mb-3`} size={24} />
              <h3 className="font-bold text-white mb-1">{title}</h3>
              <p className="text-slate-400 text-sm">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Content */}
      <main className="container mx-auto px-6 pb-20 max-w-4xl">
        <div className="space-y-8">
          {[
            {
              title: '1. Information We Collect',
              content: `When you register on FuelShare, we collect your university email address, name, and a bcrypt-hashed password. You may optionally provide vehicle details (make, model, mileage) if you post rides. During platform use, we collect location data you explicitly enter for ride origin/destination, your saved custom places (stored locally in your browser), and in-app chat messages with ride partners. We also collect standard web server logs (IP address, browser type) for security and diagnostic purposes.`,
            },
            {
              title: '2. How We Use Your Information',
              content: `Your university email is used for account creation and OTP verification only — we do not send marketing emails. Your name and profile information are visible to other users on rides you create or join, facilitating the peer-to-peer carpooling experience. Location data you provide is used solely for route matching, mini-map display, and fuel cost calculation. Chat messages are stored to enable real-time communication between matched drivers and passengers and for dispute resolution.`,
            },
            {
              title: '3. OTP & Email Authentication',
              content: `When you sign up or verify your account, we send a One-Time Password (OTP) to your university email via our secure Node.js/Nodemailer server. OTPs expire after 10 minutes and are never logged after verification. Your Gmail SMTP credentials (if used for server configuration) are stored as environment variables and are never exposed to any client-side code or stored in the database.`,
            },
            {
              title: '4. Location Data',
              content: `Location searches use a combination of Photon (OpenStreetMap) and Nominatim geocoding APIs. Your search queries are sent to these third-party services to retrieve coordinates. We do not store your search history on our servers. Your saved custom places (Home, Office, College, etc.) are stored exclusively in your browser's localStorage using user-isolated keys — they never leave your device unless you explicitly share them in a ride posting.`,
            },
            {
              title: '5. Fuel Price Data & Python Scraper',
              content: `Live fuel price data is fetched on demand from publicly available sources via our Python web scraper. No personally identifiable information is involved in this process. Fetched data is temporarily cached server-side for performance and is not associated with individual user accounts.`,
            },
            {
              title: '6. Data Sharing',
              content: `We do not sell, trade, or rent your personal data to third parties. Your name and ride details are visible to other platform users as necessary for the carpooling service to function. Anonymized, aggregated usage statistics may be shared with partner universities to demonstrate platform health. We may disclose your information if required to do so by law or in response to valid legal process.`,
            },
            {
              title: '7. Data Security',
              content: `Passwords are hashed using bcrypt before storage and are never stored or transmitted in plaintext. All database queries use PDO prepared statements to prevent SQL injection attacks. OTP validation is performed server-side only and is never exposed to client-side JavaScript. We use HTTPS for all production communications to protect data in transit. Our MySQL database uses normalized schema design with scheduled auto-cleanup events to remove stale data.`,
            },
            {
              title: '8. Data Retention & Deletion',
              content: `Active ride listings are automatically cleaned up by MySQL event schedulers after they expire. You may delete your account at any time through the Profile page. Upon account deletion, your personal data, ride history, and messages are removed from our database within 30 days. Browser-stored data (saved places, theme preference) is stored locally and can be cleared by you at any time by clearing your browser's localStorage.`,
            },
            {
              title: '9. Cookies & Local Storage',
              content: `FuelShare uses browser localStorage (not cookies) to persist your session, theme preference, saved places, and CO₂ savings tracker. These are stored only on your device and are not transmitted to any server except when explicitly included in API requests (e.g., user ID for authenticated actions). We do not use any tracking cookies or third-party analytics cookies.`,
            },
            {
              title: '10. Changes to This Policy',
              content: `We may update this Privacy Policy from time to time. We will notify you of significant changes by posting the updated policy on the platform. Your continued use of FuelShare after changes are posted constitutes your acceptance of the updated policy. If you have concerns about any changes, please contact us through the Support page.`,
            },
          ].map((section, i) => (
            <div
              key={i}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 hover:border-teal-500/30 transition-colors"
            >
              <h2 className="text-lg font-bold text-teal-400 mb-3">{section.title}</h2>
              <p className="text-slate-300 leading-relaxed text-sm md:text-base">{section.content}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 text-slate-500 text-sm">
            <Lock size={14} />
            <span>FuelShare Academic Collective · Your data stays yours.</span>
          </div>
        </div>
      </main>
    </div>
  );
}
