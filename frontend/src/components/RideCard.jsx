import React, { useState } from 'react';
import { MapPin, Clock, Car, ChevronRight, Trash2, User, Phone, Users, MessageCircle, CheckCircle, Leaf } from 'lucide-react';
import ChatBox from './ChatBox';
import RoutePreview from './RoutePreview';
import { useApp } from '../context/AppContext';

export function formatRideDateTime(dateString) {
  if (!dateString) return { formatted: '', isToday: false, isTomorrow: false, timeOnly: '' };
  const d = new Date(dateString);
  const now = new Date();
  
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today.getTime() + 86400000);
  const targetDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  
  const timeOnly = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  if (targetDate.getTime() === today.getTime()) {
    return { formatted: `Today at ${timeOnly}`, isToday: true, isTomorrow: false, timeOnly };
  } else if (targetDate.getTime() === tomorrow.getTime()) {
    return { formatted: `Tomorrow at ${timeOnly}`, isToday: false, isTomorrow: true, timeOnly };
  } else {
    const dayStr = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    return { formatted: `${dayStr} • ${timeOnly}`, isToday: false, isTomorrow: false, timeOnly };
  }
}

export default function RideCard({ ride }) {
  const { user: currentUser, requestSeat, respondRequest, sendMessage, deleteRide, completeRide, cancelRequest } = useApp();
  const [activeChat, setActiveChat] = useState(null);
  const dateTimeInfo = formatRideDateTime(ride.start_time);

  const isOwner = currentUser?.email === ride.driver_email;
  const seatsLeft = ride.available_seats !== undefined ? ride.available_seats : 4;
  const isFull = seatsLeft <= 0;

  const userRequest = (ride.requests || []).find(r => r.email === currentUser?.email);
  const userStatus = userRequest?.status;

  const getCountdown = () => {
    const now = new Date();
    const date = new Date(ride.start_time);
    const diff = date - now;
    if (diff <= 0) return null;
    const hrs = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    if (hrs > 48) return null;
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins}m`;
  };
  const countdown = getCountdown();

  return (
    <div className={`bg-white/85 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-md border border-white/80 dark:border-slate-700/60 flex flex-col h-full overflow-hidden ${userStatus === 'accepted' ? 'shadow-emerald-500/20 bg-emerald-50/80 dark:bg-emerald-900/30' : 'card-hover'}`}>
      {countdown && (
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-1.5 text-white text-xs font-bold flex items-center gap-1.5">
          <Clock size={12} />
          Departs in {countdown}
        </div>
      )}

      <div className="p-6 flex flex-col h-full">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">{ride.driver_name}</h3>
            <p className="text-slate-700 dark:text-slate-300 text-sm font-semibold flex items-center gap-1">
              <Car size={14} className="text-emerald-600 dark:text-emerald-400" />
              {ride.vehicle_model}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <span className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 font-black px-3 py-1 rounded-full text-sm">
              ₹{Math.round(parseFloat(ride.calculated_cost_per_seat || ride.cost_per_seat || 0))}
            </span>
            <span className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <Leaf size={11} /> ~{(((parseFloat(ride.distance_km || ride.distance || 0) / 18.0) * 2.31) / 2.0).toFixed(1)}kg CO₂ saved/seat
            </span>
            {isOwner && (
              <div className="flex items-center gap-1.5 mt-1">
                <button
                  onClick={() => completeRide(ride.ride_id)}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-1"
                  title="Mark Ride Completed"
                >
                  <CheckCircle size={13} /> Complete
                </button>
                <button onClick={() => deleteRide(ride.ride_id)} className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 p-1.5 rounded-lg transition-colors" title="Delete Ride Offer">
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3.5 mb-4">
          <div className="flex gap-3">
            <div className="flex flex-col items-center mt-1">
              <div className="w-2.5 h-2.5 rounded-full bg-indigo-500"></div>
              <div className="w-0.5 h-full bg-slate-300 dark:bg-slate-600 my-1"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
            </div>
            <div className="flex-1">
              <div className="mb-2">
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-extrabold">FROM</p>
                <p className="text-slate-900 dark:text-slate-100 font-bold text-base leading-snug">{ride.start_location}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-extrabold">TO</p>
                <p className="text-slate-900 dark:text-slate-100 font-bold text-base leading-snug">{ride.end_location}</p>
              </div>
            </div>
          </div>

          {/* Compact Mini Route Map */}
          <RoutePreview
            startLat={ride.start_lat}
            startLng={ride.start_lng}
            endLat={ride.end_lat}
            endLng={ride.end_lng}
          />

          {/* Departure Schedule Box */}
          <div className="flex items-center gap-2.5 text-slate-900 dark:text-slate-100 bg-slate-50/90 dark:bg-slate-700/50 px-4 py-3 rounded-xl border border-slate-200/80 dark:border-slate-600/80">
            <Clock size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="font-extrabold text-sm">
              {dateTimeInfo.formatted}
            </span>
          </div>
        </div>

        <div className="text-sm font-extrabold text-slate-900 dark:text-slate-100 mb-3 px-1">
          {seatsLeft} seat{seatsLeft !== 1 ? 's' : ''} available
        </div>

        {isOwner ? (
          <div className="w-full">
            <div className="text-center py-2.5 rounded-xl font-bold bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-600">
              Your active ride offer
            </div>
            {ride.requests && ride.requests.length > 0 && (
              <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-700/30 border border-slate-100 dark:border-slate-700 rounded-lg text-sm text-left animate-in fade-in slide-in-from-bottom-2">
                <p className="font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1"><Users size={14} /> Passenger Requests ({ride.requests.length}):</p>
                <div className="space-y-2">
                  {ride.requests.map((p, idx) => (
                    <div key={idx} className="bg-white dark:bg-slate-800 p-2.5 rounded shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                          <User size={12} className="text-emerald-500" /> {p.name}
                        </span>
                        {p.status === 'pending' && (
                          <div className="flex gap-2">
                            <button onClick={() => respondRequest(ride.ride_id, p.email, 'accepted', ride.distance_km)} disabled={isFull} className="text-xs bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 font-bold px-2 py-1 rounded hover:bg-emerald-200 disabled:opacity-50">Accept</button>
                            <button onClick={() => respondRequest(ride.ride_id, p.email, 'declined', ride.distance_km)} className="text-xs bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 font-bold px-2 py-1 rounded hover:bg-red-200">Decline</button>
                          </div>
                        )}
                        {p.status === 'accepted' && <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Accepted ✓</span>}
                        {p.status === 'declined' && <span className="text-xs font-bold text-red-500">Declined ❌</span>}
                      </div>
                      {p.status === 'accepted' && (
                        <div className="mt-1 flex flex-col gap-1 w-full">
                          {p.phone && (
                            <span className="text-slate-500 dark:text-slate-400 text-xs flex items-center gap-1">
                              <Phone size={12} /> {p.phone}
                            </span>
                          )}
                          {p.bio && <span className="text-slate-400 text-xs italic bg-slate-50 dark:bg-slate-700 p-1.5 rounded text-left mt-1">"{p.bio}"</span>}
                          <button onClick={() => setActiveChat(activeChat === p.email ? null : p.email)} className="mt-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 py-1.5 rounded flex justify-center items-center gap-1 hover:bg-emerald-100 transition-colors w-full">
                            <MessageCircle size={14} /> {activeChat === p.email ? 'Close Chat' : 'Message Passenger'}
                          </button>
                          {activeChat === p.email && (
                            <ChatBox
                              messages={p.chat || []}
                              currentUser={currentUser}
                              onSendMessage={(text) => sendMessage(ride.ride_id, p.email, text)}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="w-full flex flex-col gap-2">
            <div className="w-full flex items-center gap-2">
              <button
                onClick={() => requestSeat(ride.ride_id, currentUser)}
                disabled={isFull || !!userStatus}
                className={`flex-1 flex items-center justify-center gap-2 group transition-all py-2.5 rounded-xl font-bold ${userStatus === 'pending' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 cursor-not-allowed border border-amber-200 dark:border-amber-800' :
                  userStatus === 'accepted' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 cursor-not-allowed border border-emerald-200 dark:border-emerald-800' :
                    userStatus === 'declined' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 cursor-not-allowed border border-red-200 dark:border-red-800' :
                      isFull ? 'bg-slate-200 dark:bg-slate-700 text-slate-500 cursor-not-allowed' :
                        'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5'
                }`}
              >
                {userStatus === 'pending' ? 'Request Pending ⏳' :
                  userStatus === 'accepted' ? 'Request Accepted ✓' :
                    userStatus === 'declined' ? 'Request Declined ❌' :
                      isFull ? 'Seats Not Available' : 'Request Seat'}
                {!isFull && !userStatus && <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />}
              </button>
              {(userStatus === 'pending' || userStatus === 'accepted') && (
                <button
                  onClick={() => cancelRequest(ride.ride_id)}
                  className="p-2.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 hover:text-red-700 rounded-xl transition-colors border border-red-200 dark:border-red-800 flex-shrink-0"
                  title="Cancel Request"
                >
                  <Trash2 size={20} />
                </button>
              )}
            </div>

            {userStatus === 'accepted' && (
              <div className="w-full animate-in fade-in slide-in-from-top-2">
                <button onClick={() => setActiveChat(activeChat ? null : currentUser.email)} className="w-full py-2 bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors">
                  <MessageCircle size={18} /> {activeChat ? 'Hide Chat' : 'Chat with Driver'}
                </button>
                {activeChat === currentUser.email && (
                  <ChatBox
                    messages={userRequest?.chat || []}
                    currentUser={currentUser}
                    onSendMessage={(text) => sendMessage(ride.ride_id, currentUser.email, text)}
                  />
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}