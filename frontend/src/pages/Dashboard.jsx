import React from 'react';
import RideCard from '../components/RideCard';
import { Car, Leaf, Users } from 'lucide-react';

export default function Dashboard({ rides, user, totalCO2Saved, handleRequestSeat, handleRespondRequest, handleSendMessage, handleDeleteRide }) {
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
            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 text-center border border-white/20 min-w-[140px]">
              <Leaf className="mx-auto mb-2 text-emerald-200" size={28} />
              <p className="text-4xl font-bold">{totalCO2Saved.toFixed(1)}</p>
              <p className="text-sm font-semibold text-emerald-100 mt-1">kg CO₂ Saved</p>
            </div>
            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 text-center border border-white/20 min-w-[140px]">
              <Users className="mx-auto mb-2 text-emerald-200" size={28} />
              <p className="text-4xl font-bold">{rides.length}</p>
              <p className="text-sm font-semibold text-emerald-100 mt-1">Active Rides</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8 pl-2">
        <h2 className="text-3xl font-bold text-slate-800">Available Rides</h2>
        <p className="text-slate-500 font-medium mt-1">Find a ride to split the cost.</p>
      </div>

      {rides.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rides.map(ride => (
            <RideCard
              key={ride.ride_id}
              ride={ride}
              currentUser={user}
              onRequestSeat={() => handleRequestSeat(ride.ride_id, user)}
              onRespondRequest={(passenger_email, status) => handleRespondRequest(ride.ride_id, passenger_email, status, ride.distance_km)}
              onSendMessage={(passenger_email, text) => handleSendMessage(ride.ride_id, passenger_email, user, text)}
              onDelete={() => handleDeleteRide(ride.ride_id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
          <Car size={48} className="mx-auto mb-4 text-slate-300" />
          <p className="text-slate-500 font-semibold text-lg">No ride are available currently.</p>
        </div>
      )}
    </div>
  );
}