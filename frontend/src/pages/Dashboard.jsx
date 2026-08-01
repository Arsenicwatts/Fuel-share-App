import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import RideCard from '../components/RideCard';
import MapView from '../components/MapView';
import RideFilters from '../components/RideFilters';
import SkeletonCard from '../components/SkeletonCard';
import { Car, Leaf, Users, Map, LayoutGrid, Search } from 'lucide-react';

export default function Dashboard() {
  const { rides, user, isLoading, totalCO2Saved, requestSeat } = useApp();
  const [viewMode, setViewMode] = useState('cards');
  const [filteredRides, setFilteredRides] = useState(rides);

  // Sync filtered rides when source rides change
  useEffect(() => {
    setFilteredRides(rides);
  }, [rides]);

  return (
    <div>
      {/* Eco-Metrics Banner */}
      <div className="mb-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h2 className="text-3xl font-bold mb-2">FuelShare Impact 🌍</h2>
            <p className="text-emerald-100 font-medium">Every shared ride takes a car off the road.</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-white/20 backdrop-blur-xl rounded-2xl p-4 text-center border border-white/40 shadow-lg min-w-[140px]">
              <Leaf className="mx-auto mb-2 text-emerald-100" size={28} />
              <p className="text-4xl font-bold">{totalCO2Saved.toFixed(1)}</p>
              <p className="text-sm font-semibold text-emerald-50 mt-1">kg CO₂ Saved</p>
            </div>
            <div className="bg-white/20 backdrop-blur-xl rounded-2xl p-4 text-center border border-white/40 shadow-lg min-w-[140px]">
              <Users className="mx-auto mb-2 text-emerald-100" size={28} />
              <p className="text-4xl font-bold">{rides.length}</p>
              <p className="text-sm font-semibold text-emerald-50 mt-1">Active Rides</p>
            </div>
          </div>
        </div>
      </div>

      {/* Header + View Toggle */}
      <div className="mb-4 pl-2 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Available Rides</h2>
          <p className="text-slate-700 dark:text-slate-300 font-medium mt-1">Find a ride to split the cost.</p>
        </div>

        {rides.length > 0 && (
          <div className="flex bg-white/80 dark:bg-slate-800/50 backdrop-blur-md p-1 rounded-xl border border-slate-200 dark:border-slate-700/40 shadow-sm">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${viewMode === 'cards' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-700 dark:text-slate-300 hover:text-emerald-600'}`}
            >
              <LayoutGrid size={16} /> Cards
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${viewMode === 'map' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-700 dark:text-slate-300 hover:text-emerald-600'}`}
            >
              <Map size={16} /> Map
            </button>
          </div>
        )}
      </div>

      {/* Search & Filters */}
      {rides.length > 0 && (
        <RideFilters rides={rides} onFilter={setFilteredRides} />
      )}

      {/* Content */}
      {isLoading ? (
        /* Loading Skeletons - 3 compact skeletons max */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
          {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filteredRides.length > 0 ? (
        <>
          {viewMode === 'map' ? (
            <div className="animate-in fade-in duration-300">
              <MapView rides={filteredRides} user={user} onRequestSeat={requestSeat} />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
              {filteredRides.map(ride => (
                <RideCard key={ride.ride_id} ride={ride} />
              ))}
            </div>
          )}
        </>
      ) : rides.length > 0 ? (
        /* Filters returned no results */
        <div className="text-center py-20 bg-white/85 dark:bg-slate-800/80 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 shadow-md">
          <Search size={48} className="mx-auto mb-4 text-emerald-600 opacity-60" />
          <p className="text-slate-900 dark:text-slate-100 font-bold text-xl">No rides match your filters.</p>
          <p className="text-slate-600 dark:text-slate-400 font-medium text-sm mt-1">Try broadening your search term or clearing date/price filters.</p>
        </div>
      ) : (
        <div className="text-center py-20 bg-white/85 dark:bg-slate-800/80 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 shadow-md">
          <Car size={48} className="mx-auto mb-4 text-emerald-600 opacity-60" />
          <p className="text-slate-900 dark:text-slate-100 font-bold text-xl">No active rides available right now.</p>
          <p className="text-slate-600 dark:text-slate-400 font-medium text-sm mt-1 mb-4">Be the first student to post a ride and offer seats!</p>
          <a
            href="/create"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all hover:scale-105"
          >
            Post a Ride →
          </a>
        </div>
      )}
    </div>
  );
}