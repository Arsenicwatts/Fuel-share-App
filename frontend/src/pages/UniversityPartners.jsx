import React from 'react';
import { Link } from 'react-router-dom';
import { Fuel, ArrowLeft, Building2, GraduationCap, Globe, CheckCircle2, Mail } from 'lucide-react';

const universities = [
  { name: 'Drs.Kiran & Pallavi Patel Global University (KPGU)', city: 'Vadodara', students: '1000+', status: 'Active' }
];

const benefits = [
  { icon: GraduationCap, title: 'Student Safety', desc: 'Only verified university emails can register — ensuring every user is a campus community member.' },
  { icon: Globe, title: 'Eco Impact Tracking', desc: 'Real-time CO₂ savings dashboards for your campus, demonstrating collective environmental impact.' },
  { icon: Building2, title: 'Branded Portal', desc: 'Optional university-branded FuelShare portal with your logo, colors, and custom saved campus locations.' },
  { icon: CheckCircle2, title: 'Admin Dashboard', desc: 'University coordinators get an admin dashboard to view ride statistics and user reports.' },
];

export default function UniversityPartners() {
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
          <div className="absolute top-0 left-1/3 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/3 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl" />
        </div>
        <div className="relative">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 mb-6">
            <Building2 className="text-emerald-400" size={32} />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
            University <span className="text-emerald-400">Partners</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            FuelShare works hand-in-hand with universities to provide safe, verified, and eco-friendly campus carpooling for their students.
          </p>
        </div>
      </section>

      <main className="container mx-auto px-6 pb-20 max-w-5xl">

        {/* Benefits */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-white text-center mb-8">Why Universities Choose FuelShare</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {benefits.map(({ icon: Icon, title, desc }, i) => (
              <div
                key={i}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 flex gap-4 items-start hover:border-emerald-500/30 transition-colors"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                  <Icon className="text-emerald-400" size={22} />
                </div>
                <div>
                  <h3 className="font-bold text-white mb-1">{title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Partner Universities */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-white text-center mb-2">Current Partner Universities</h2>
          <p className="text-slate-500 text-center text-sm mb-8">FuelShare is currently deployed across the following campuses</p>
          <div className="overflow-hidden rounded-2xl border border-white/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-white/10 text-slate-300 text-left">
                  <th className="px-6 py-4 font-semibold">University</th>
                  <th className="px-6 py-4 font-semibold">City / Campus</th>
                  <th className="px-6 py-4 font-semibold">Students</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {universities.map((uni, i) => (
                  <tr
                    key={i}
                    className={`border-t border-white/5 hover:bg-white/5 transition-colors ${i % 2 === 0 ? 'bg-white/[0.02]' : ''}`}
                  >
                    <td className="px-6 py-4 text-white font-medium">{uni.name}</td>
                    <td className="px-6 py-4 text-slate-400">{uni.city}</td>
                    <td className="px-6 py-4 text-slate-400">{uni.students}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${uni.status === 'Active'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${uni.status === 'Active' ? 'bg-emerald-400' : 'bg-amber-400'} animate-pulse`} />
                        {uni.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center">
          <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-3xl p-10">
            <GraduationCap className="text-emerald-400 mx-auto mb-4" size={40} />
            <h2 className="text-2xl font-bold text-white mb-3">Want to Partner With Us?</h2>
            <p className="text-slate-400 mb-6 max-w-lg mx-auto">
              If you're a university administrator or student union representative, we'd love to bring FuelShare to your campus.
            </p>
            <Link
              to="/support"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-8 py-3 rounded-xl transition-colors"
            >
              <Mail size={18} />
              Get in Touch
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
