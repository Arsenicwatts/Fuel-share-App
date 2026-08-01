import React, { useState } from 'react';
import { Search, Calendar, IndianRupee, X } from 'lucide-react';

export default function RideFilters({ rides, onFilter }) {
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');

  const applyFilters = (newSearch, newDate, newPrice) => {
    let filtered = [...rides];

    // Text search
    if (newSearch.trim()) {
      const q = newSearch.toLowerCase();
      filtered = filtered.filter(r =>
        r.start_location?.toLowerCase().includes(q) ||
        r.end_location?.toLowerCase().includes(q) ||
        r.driver_name?.toLowerCase().includes(q) ||
        r.vehicle_model?.toLowerCase().includes(q)
      );
    }

    // Date filter
    const now = new Date();
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    const tomorrowEnd = new Date(todayEnd.getTime() + 86400000);

    if (newDate === 'today') {
      filtered = filtered.filter(r => new Date(r.start_time) <= todayEnd);
    } else if (newDate === 'tomorrow') {
      filtered = filtered.filter(r => {
        const t = new Date(r.start_time);
        return t > todayEnd && t <= tomorrowEnd;
      });
    } else if (newDate === 'week') {
      const weekEnd = new Date(todayEnd.getTime() + 7 * 86400000);
      filtered = filtered.filter(r => new Date(r.start_time) <= weekEnd);
    }

    // Price filter
    if (newPrice === 'low') {
      filtered = filtered.filter(r => r.calculated_cost_per_seat <= 50);
    } else if (newPrice === 'mid') {
      filtered = filtered.filter(r => r.calculated_cost_per_seat > 50 && r.calculated_cost_per_seat <= 100);
    } else if (newPrice === 'high') {
      filtered = filtered.filter(r => r.calculated_cost_per_seat > 100);
    }

    onFilter(filtered);
  };

  const handleSearchChange = (val) => {
    setSearch(val);
    applyFilters(val, dateFilter, priceFilter);
  };

  const handleDateChange = (val) => {
    setDateFilter(val);
    applyFilters(search, val, priceFilter);
  };

  const handlePriceChange = (val) => {
    setPriceFilter(val);
    applyFilters(search, dateFilter, val);
  };

  const clearAll = () => {
    setSearch('');
    setDateFilter('all');
    setPriceFilter('all');
    onFilter(rides);
  };

  const hasActiveFilters = search || dateFilter !== 'all' || priceFilter !== 'all';

  const dateOptions = [
    { key: 'all', label: 'All Dates' },
    { key: 'today', label: 'Today' },
    { key: 'tomorrow', label: 'Tomorrow' },
    { key: 'week', label: 'This Week' }
  ];

  const priceOptions = [
    { key: 'all', label: 'Any Price' },
    { key: 'low', label: '₹0–50' },
    { key: 'mid', label: '₹50–100' },
    { key: 'high', label: '₹100+' }
  ];

  return (
    <div className="bg-white/85 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-white/80 dark:border-slate-700/60 p-4 mb-6 shadow-md">
      <div className="flex flex-col md:flex-row gap-3 items-stretch">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by location, driver, or vehicle..."
            className="input-field pl-9 py-2.5 text-sm"
          />
        </div>

        {/* Date filter */}
        <div className="flex gap-1 bg-slate-100 dark:bg-slate-700/50 p-1 rounded-xl border border-slate-200 dark:border-slate-600">
          {dateOptions.map(opt => (
            <button
              key={opt.key}
              type="button"
              onClick={() => handleDateChange(opt.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                dateFilter === opt.key
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-700 dark:text-slate-300 hover:text-emerald-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Price filter */}
        <div className="flex gap-1 bg-slate-100 dark:bg-slate-700/50 p-1 rounded-xl border border-slate-200 dark:border-slate-600">
          {priceOptions.map(opt => (
            <button
              key={opt.key}
              type="button"
              onClick={() => handlePriceChange(opt.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                priceFilter === opt.key
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-700 dark:text-slate-300 hover:text-emerald-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Clear button */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearAll}
            className="px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center gap-1 self-center"
          >
            <X size={14} /> Clear
          </button>
        )}
      </div>
    </div>
  );
}
