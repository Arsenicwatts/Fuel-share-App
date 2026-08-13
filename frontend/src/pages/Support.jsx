import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Fuel, ArrowLeft, HelpCircle, MessageCircle, Bug, Lightbulb, ChevronDown, ChevronUp, Mail, Clock } from 'lucide-react';

const faqs = [
  {
    q: 'How do I sign up for FuelShare?',
    a: 'Click "Get Started" on the home page and enter your university email address. You will receive a One-Time Password (OTP) to verify your email. Once verified, set your name and password to complete registration.',
  },
  {
    q: 'Is FuelShare free to use?',
    a: 'Yes! FuelShare is completely free to use. The platform simply helps you split exact fuel costs with other passengers — there are no platform fees or service charges.',
  },
  {
    q: 'How is the fuel cost calculated?',
    a: 'The cost is calculated using this formula: (Distance ÷ Vehicle Mileage) × Live City Petrol Price ÷ Number of Seats. The fuel price is fetched live from publicly available sources for your ride\'s origin city.',
  },
  {
    q: 'How do I post a ride as a driver?',
    a: 'Navigate to "Create Ride" from the Navbar. Fill in your origin, destination, departure time, number of available seats, and your vehicle\'s mileage. The cost per seat will be calculated automatically. Click "Publish Ride" to make it visible to passengers.',
  },
  {
    q: 'Why is my OTP not arriving?',
    a: 'Check your spam/junk folder first. OTPs expire after 10 minutes, so request a new one if needed. Make sure you\'re using your university email address — personal emails (Gmail, Yahoo, etc.) are not accepted.',
  },
  {
    q: 'Can I save my home or college location?',
    a: 'Yes! Use the "Saved Places" feature in the ride creation flow to save custom locations with nicknames (e.g., Home, College, Office). These are stored securely in your browser and available for quick selection.',
  },
  {
    q: 'How do I accept or decline a seat request?',
    a: 'Go to your active ride card on the Dashboard. Seat requests appear below the ride details. Click Accept or Decline next to each request. Accepted passengers will be notified and a chat thread will open between you.',
  },
  {
    q: 'What happens if a driver cancels a ride?',
    a: 'If a driver deletes a ride, all pending and accepted passengers are removed from the ride. We recommend passengers confirm with drivers via in-app chat before the ride. FuelShare is not liable for cancellations.',
  },
  {
    q: 'Is my location data shared with anyone?',
    a: 'Location data you enter for ride origins and destinations is visible to other users on that ride for navigation purposes. Saved custom places are stored only on your device (localStorage) and are never uploaded to our servers.',
  },
  {
    q: 'How do I report a user or safety concern?',
    a: 'Use the "Report" option on any ride card, or send a message to us directly through this Support page. For urgent safety concerns, always contact campus security or local authorities first.',
  },
];

const categories = [
  { icon: HelpCircle, label: 'General Help', color: 'emerald' },
  { icon: Bug, label: 'Report a Bug', color: 'red' },
  { icon: Lightbulb, label: 'Feature Request', color: 'amber' },
  { icon: MessageCircle, label: 'Other Inquiry', color: 'teal' },
];

export default function Support() {
  const [openFaq, setOpenFaq] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('General Help');
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const NODE_URL = `http://${window.location.hostname}:5000`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch(`${NODE_URL}/api/support`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          category: selectedCategory,
          message: form.message,
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setSubmitted(true);
      } else {
        setError(data.message || 'Failed to send message. Please try again.');
      }
    } catch (err) {
      setError('Could not reach the server. Make sure the Node.js server is running on port 5000.');
    } finally {
      setIsLoading(false);
    }
  };


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
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-64 bg-emerald-500/10 rounded-full blur-3xl" />
        </div>
        <div className="relative">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 mb-6">
            <MessageCircle className="text-emerald-400" size={32} />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
            How can we <span className="text-emerald-400">help?</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Browse our FAQs below, or send us a message and we'll get back to you within 24 hours.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 text-emerald-400 text-sm font-medium">
            <Clock size={14} />
            Average response time: under 24 hours
          </div>
        </div>
      </section>

      <main className="container mx-auto px-6 pb-20 max-w-5xl">
        {/* FAQs */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-white text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-emerald-500/20 transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left"
                >
                  <span className="font-semibold text-white pr-4">{faq.q}</span>
                  {openFaq === i
                    ? <ChevronUp className="text-emerald-400 flex-shrink-0" size={18} />
                    : <ChevronDown className="text-slate-400 flex-shrink-0" size={18} />
                  }
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 text-slate-300 text-sm leading-relaxed border-t border-white/5 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Contact Form */}
        <section>
          <h2 className="text-2xl font-bold text-white text-center mb-2">Still need help?</h2>
          <p className="text-slate-400 text-center text-sm mb-8">Send us a message and we'll respond to your university email.</p>

          {submitted ? (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-3xl p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
                <Mail className="text-emerald-400" size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Message Sent!</h3>
              <p className="text-slate-400">Thanks for reaching out. We'll get back to you within 24 hours.</p>
              <button
                onClick={() => { setSubmitted(false); setForm({ name: '', email: '', message: '' }); }}
                className="mt-6 text-sm text-emerald-400 hover:text-emerald-300 transition-colors underline underline-offset-2"
              >
                Send another message
              </button>
            </div>
          ) : (
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-10">
              {/* Category Select */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-300 mb-3">Category</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {categories.map(({ icon: Icon, label, color }) => (
                    <button
                      key={label}
                      onClick={() => setSelectedCategory(label)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border text-sm font-medium transition-all ${selectedCategory === label
                          ? `bg-${color}-500/20 border-${color}-500/50 text-${color === 'red' ? 'red' : color === 'amber' ? 'amber' : 'emerald'}-400`
                          : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'
                        }`}
                    >
                      <Icon size={20} />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Your Name</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="Arjun Mehta"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">University Email</label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      placeholder="you@university.edu"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Message</label>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    placeholder="Describe your issue or question in detail..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 transition-colors resize-none"
                  />
                </div>
                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm font-medium">
                    {error}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold px-10 py-3 rounded-xl transition-colors flex items-center gap-2"
                >
                  {isLoading ? (
                    <svg className="animate-spin" width={18} height={18} fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z" />
                    </svg>
                  ) : (
                    <Mail size={18} />
                  )}
                  {isLoading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
