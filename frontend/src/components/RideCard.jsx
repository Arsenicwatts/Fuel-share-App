import React, { useState } from 'react';
import { MapPin, Clock, Car, ChevronRight } from 'lucide-react';

export default function RideCard({ ride, onBookSeat }) {
  const [isBooked, setIsBooked] = useState(false);
  const date = new Date(ride.start_time);

  return (
    <div className={`bg-white rounded-2xl p-6 shadow-sm border flex flex-col h-full ${isBooked ? 'border-emerald-300 bg-emerald-50/20' : 'border-slate-100 card-hover'}`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">{ride.driver_name}</h3>
          <div className="flex items-center text-slate-500 text-sm gap-1">
            <Car size={14} />
            <span>{ride.vehicle_model}</span>
          </div>
        </div>
        <div className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full font-bold text-lg border border-emerald-100">
          ₹{Math.round(ride.calculated_cost_per_seat)}
        </div>
      </div>

      <div className="space-y-4 mb-6 flex-grow">
        <div className="flex gap-3">
          <div className="flex flex-col items-center mt-1">
            <div className="w-2 h-2 rounded-full bg-slate-300"></div>
            <div className="w-0.5 h-full bg-slate-100 my-1"></div>
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          </div>
          <div className="flex-1">
            <div className="mb-3">
              <p className="text-xs text-slate-400 uppercase font-semibold">From</p>
              <p className="text-slate-800 font-medium">{ride.start_location}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase font-semibold">To</p>
              <p className="text-slate-800 font-medium">{ride.end_location}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-600 bg-slate-50 p-3 rounded-lg">
          <Clock size={18} className="text-emerald-500" />
          <span className="font-medium">
            {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          <span className="text-slate-400 text-sm">
            • {date.toLocaleDateString()}
          </span>
        </div>
      </div>

      <button
        onClick={() => {
          setIsBooked(true);
          onBookSeat(ride.distance_km);
        }}
        disabled={isBooked}
        className={`w-full flex items-center justify-center gap-2 group transition-all py-2.5 rounded-xl font-bold ${isBooked
          ? 'bg-emerald-100 text-emerald-700 cursor-not-allowed'
          : 'btn-primary'
          }`}
      >
        {isBooked ? 'Seat Booked ✓' : 'Book Seat'}
        {!isBooked && <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />}
      </button>
    </div>
  );
}