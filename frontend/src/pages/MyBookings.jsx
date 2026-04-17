import React, { useState, useEffect } from 'react';
import { MapPin, Clock, Navigation, Trash2, Car, Users, Leaf, Star, Receipt, AlertCircle } from 'lucide-react';

export default function MyBookings({ user, API_URL }) {
  const [roleTab, setRoleTab] = useState('passenger'); // 'driver' or 'passenger'
  const [timeTab, setTimeTab] = useState('upcoming');
  const [data, setData] = useState({ driver: { upcoming: [], past: [] }, passenger: { upcoming: [], past: [] } });
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      const res = await fetch(`${API_URL}?action=my_bookings&user_id=${user.id}`);
      const json = await res.json();
      if (!json.error) setData(json);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const fetchVehicle = async () => {
    try {
      const res = await fetch(`${API_URL}?action=user_vehicles&user_id=${user.id}`);
      const json = await res.json();
      if (json) setVehicle(json);
    } catch (err) { console.error(err); }
  };

  const handleCancelRide = async (ride) => {
    if (!window.confirm('Are you sure you want to cancel this?')) return;
    if (ride.user_role === 'driver') {
      await fetch(`${API_URL}?action=delete_ride`, {
        method: "POST", headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ride_id: ride.ride_id })
      });
    } else {
      await fetch(`${API_URL}?action=cancel_request`, {
        method: "POST", headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ride_id: ride.ride_id, passenger_id: user.id })
      });
    }
    fetchBookings();
  };

  useEffect(() => {
    fetchBookings();
    fetchVehicle();
  }, [user]);

  const rides = data[roleTab]?.[timeTab] || [];

  // Countdown helper
  const getCountdown = (startTime) => {
    const now = new Date();
    const dep = new Date(startTime);
    const diff = dep - now;
    if (diff <= 0) return null;
    const hrs = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    if (hrs > 24) return `${Math.floor(hrs / 24)}d ${hrs % 24}h`;
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins}m`;
  };

  const totalDriverRides = (data.driver?.upcoming?.length || 0) + (data.driver?.past?.length || 0);
  const totalPassengerRides = (data.passenger?.upcoming?.length || 0) + (data.passenger?.past?.length || 0);
  const estimatedSavings = ((totalPassengerRides + totalDriverRides) * 3.5).toFixed(0);

  return (
    <div className="animate-in fade-in duration-500 max-w-6xl mx-auto">

      {/* Profile Header - inspired by the design */}
      <div className="bg-white/20 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-lg border border-white/40 mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Avatar */}
          <div className="relative">
            <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-lg">
              <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${user.name}`} alt="avatar" className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800">{user.name}</h1>
            <div className="flex flex-wrap items-center gap-3 mt-1.5">
              <span className="text-slate-500 text-sm flex items-center gap-1">📧 {user.email}</span>
              {user.phone && <span className="text-slate-500 text-sm flex items-center gap-1">📱 {user.phone}</span>}
            </div>
            {vehicle && (
              <div className="mt-3 inline-flex items-center gap-2 bg-white/50 backdrop-blur border border-white/60 rounded-xl px-4 py-2 shadow-sm">
                <Car size={16} className="text-emerald-600" />
                <span className="text-sm font-semibold text-slate-700">Primary Vehicle</span>
                <span className="text-sm text-slate-500">{vehicle.model} • {vehicle.capacity} seats</span>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="flex gap-3">
            <div className="bg-emerald-500/10 backdrop-blur rounded-xl p-3 text-center min-w-[80px] border border-emerald-500/20">
              <p className="text-2xl font-black text-emerald-700">{totalDriverRides + totalPassengerRides}</p>
              <p className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider">Rides</p>
            </div>
            <div className="bg-emerald-500/10 backdrop-blur rounded-xl p-3 text-center min-w-[80px] border border-emerald-500/20">
              <p className="text-2xl font-black text-emerald-700">₹{estimatedSavings}</p>
              <p className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider">Saved</p>
            </div>
          </div>
        </div>
      </div>

      {/* Role Toggle - As Driver / As Rider */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex bg-white/30 backdrop-blur-md p-1 rounded-xl border border-white/40 shadow-sm">
          <button
            onClick={() => { setRoleTab('driver'); setTimeTab('upcoming'); }}
            className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${roleTab === 'driver' ? 'bg-white/80 shadow-sm text-emerald-700' : 'text-slate-500 hover:text-slate-700'}`}
          >
            As Driver
          </button>
          <button
            onClick={() => { setRoleTab('passenger'); setTimeTab('upcoming'); }}
            className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${roleTab === 'passenger' ? 'bg-white/80 shadow-sm text-emerald-700' : 'text-slate-500 hover:text-slate-700'}`}
          >
            As Rider
          </button>
        </div>

        <div className="flex bg-white/20 backdrop-blur p-1 rounded-lg border border-white/30">
          <button
            onClick={() => setTimeTab('upcoming')}
            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${timeTab === 'upcoming' ? 'bg-emerald-500 text-white shadow' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setTimeTab('past')}
            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${timeTab === 'past' ? 'bg-slate-600 text-white shadow' : 'text-slate-500 hover:text-slate-700'}`}
          >
            History
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center text-slate-500 py-16 font-medium">Loading your journeys...</div>
      ) : rides.length === 0 ? (
        <div className="text-center py-16 bg-white/10 backdrop-blur rounded-2xl border border-dashed border-white/30">
          <Navigation size={48} className="mx-auto mb-4 text-emerald-600 opacity-40" />
          <p className="text-slate-500 font-semibold text-lg">
            No {timeTab === 'upcoming' ? 'upcoming' : 'past'} rides {roleTab === 'driver' ? 'posted by you' : 'you requested'}.
          </p>
          <p className="text-slate-400 text-sm mt-1">
            {roleTab === 'driver' ? 'Post a ride to start sharing fuel costs!' : 'Browse available rides on the dashboard.'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {rides.map(ride => {
            const countdown = getCountdown(ride.start_time);
            const depDate = new Date(ride.start_time);
            const isToday = new Date().toDateString() === depDate.toDateString();
            const costDisplay = parseFloat(ride.calculated_cost_per_seat || 0);

            return (
              <div key={ride.ride_id} className="bg-white/20 backdrop-blur-xl rounded-2xl shadow-lg border border-white/40 overflow-hidden transition-all hover:shadow-xl">
                {/* Countdown Badge */}
                {timeTab === 'upcoming' && countdown && (
                  <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-1.5 text-white text-xs font-bold flex items-center gap-1.5">
                    <AlertCircle size={14} />
                    Departs in {countdown}
                  </div>
                )}
                {timeTab === 'past' && (
                  <div className="bg-slate-600 px-4 py-1.5 text-white text-xs font-bold flex items-center gap-1.5">
                    <Star size={14} />
                    Completed
                  </div>
                )}

                <div className="p-5 md:p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* LEFT: Route info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold uppercase mb-1">
                        <Clock size={12} />
                        {isToday ? 'TODAY' : depDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}, {depDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <h3 className="text-lg font-bold text-slate-800">
                        {ride.start_location} to {ride.end_location}
                      </h3>

                      <div className="flex flex-wrap items-center gap-3 mt-3">
                        {/* Driver/Vehicle */}
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full overflow-hidden border-2 border-white shadow-sm bg-slate-100">
                            <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${ride.driver_name}`} alt="" className="w-full h-full" />
                          </div>
                          <span className="text-sm font-semibold text-slate-700">{ride.driver_name}</span>
                        </div>
                        <span className="text-slate-300">•</span>
                        <span className="text-sm text-slate-500 flex items-center gap-1"><Car size={13} /> {ride.vehicle_model}</span>

                        {roleTab === 'driver' && ride.confirmed_riders !== undefined && (
                          <>
                            <span className="text-slate-300">•</span>
                            <span className="text-sm text-emerald-600 font-semibold flex items-center gap-1">
                              <Users size={13} /> {ride.confirmed_riders} rider{ride.confirmed_riders !== 1 ? 's' : ''} confirmed
                            </span>
                          </>
                        )}

                        {roleTab === 'passenger' && ride.passenger_status && (
                          <>
                            <span className="text-slate-300">•</span>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${ride.passenger_status === 'accepted' ? 'bg-emerald-100 text-emerald-700' :
                                ride.passenger_status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                  'bg-red-100 text-red-700'
                              }`}>
                              {ride.passenger_status === 'accepted' ? 'Confirmed ✓' :
                                ride.passenger_status === 'pending' ? 'Pending ⏳' : 'Declined'}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* RIGHT: Cost + Actions */}
                    <div className="flex items-center gap-3 md:flex-col md:items-end">
                      <span className="text-2xl font-black text-emerald-700">₹{Math.round(costDisplay)}</span>

                      <div className="flex gap-2">
                        {timeTab === 'upcoming' && (
                          <button
                            onClick={() => handleCancelRide(ride)}
                            className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-sm rounded-xl transition-all border border-red-200 flex items-center gap-1.5"
                          >
                            <Trash2 size={14} /> Cancel
                          </button>
                        )}
                        {timeTab === 'past' && (
                          <div className="flex items-center gap-1.5 text-sm text-emerald-600 font-semibold">
                            <Leaf size={14} />
                            ~{(parseFloat(ride.distance_km || 0) * 0.192).toFixed(1)}kg CO₂ saved
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
