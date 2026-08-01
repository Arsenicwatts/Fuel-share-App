import React from 'react';
import { Fuel } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-white/20 dark:border-slate-800 bg-white/10 dark:bg-slate-900/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Fuel className="text-emerald-600 dark:text-emerald-400" size={22} />
            <span className="text-lg font-bold text-slate-700 dark:text-white">Fuel<span className="text-emerald-600 dark:text-emerald-400">Share</span></span>
          </div>

          <div className="flex flex-wrap gap-6 text-sm font-medium text-slate-500 dark:text-slate-400">
            <a href="#" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">University Partners</a>
            <a href="#" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Support</a>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-200/30 dark:border-slate-700/30 text-center">
          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
            © {new Date().getFullYear()} FuelShare Academic Collective. Premium Student Carpooling.
          </p>
        </div>
      </div>
    </footer>
  );
}
