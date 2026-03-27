import React, { useState } from 'react';
import { MapPin, Clock, Car, ChevronRight, Trash2, User, Phone, Users, MessageCircle } from 'lucide-react';
import ChatBox from './ChatBox';

export default function RideCard({ ride, currentUser, onRequestSeat, onRespondRequest, onSendMessage, onDelete }) {
  const [activeChat, setActiveChat] = useState(null);
  const date = new Date(ride.start_time);

  const isOwner = currentUser?.email === ride.driver_email;
  const seatsLeft = ride.available_seats !== undefined ? ride.available_seats : 4;
  const isFull = seatsLeft <= 0;

  // Determine current user's request status
  const userRequest = (ride.requests || []).find(r => r.email === currentUser?.email);
  const userStatus = userRequest?.status; // 'pending', 'accepted', 'declined', or undefined

  return (
    <div className={`bg-white rounded-2xl p-6 shadow-sm border flex flex-col h-full ${userStatus === 'accepted' ? 'border-emerald-300 bg-emerald-50/20' : 'border-slate-100 card-hover'}`}>
      {/* Driver Info */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-lg text-slate-800">{ride.driver_name}</h3>
          <p className="text-slate-500 text-sm flex items-center gap-1">
            <Car size={14} />
            {ride.vehicle_model}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full text-sm">
            ₹{Math.round(ride.calculated_cost_per_seat)}
          </span>
          {isOwner && (
            <button onClick={onDelete} className="text-red-500 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-colors" title="Delete Ride Offer">
              <Trash2 size={16} />
            </button>
          )}
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
      <div className="flex justify-between items-center text-sm font-semibold text-slate-600 mb-4 px-2">
        <span>{seatsLeft} seat{seatsLeft !== 1 ? 's' : ''} available</span>
      </div>

      {isOwner ? (
        <div className="w-full">
          <div className="text-center py-2.5 rounded-xl font-bold bg-slate-100 text-slate-500 border border-slate-200">
            Your active ride offer
          </div>
          {ride.requests && ride.requests.length > 0 && (
            <div className="mt-3 p-3 bg-slate-50 border border-slate-100 rounded-lg text-sm text-left animate-in fade-in slide-in-from-bottom-2">
              <p className="font-bold text-slate-700 mb-2 flex items-center gap-1"><Users size={14} /> Passenger Requests ({ride.requests.length}):</p>
              <div className="space-y-2">
                {ride.requests.map((p, idx) => (
                  <div key={idx} className="bg-white p-2.5 rounded shadow-sm border border-slate-100 flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-800 flex items-center gap-1">
                        <User size={12} className="text-emerald-500" /> {p.name}
                      </span>

                      {p.status === 'pending' && (
                        <div className="flex gap-2">
                          <button onClick={() => onRespondRequest(p.email, 'accepted')} disabled={isFull} className="text-xs bg-emerald-100 text-emerald-700 font-bold px-2 py-1 rounded hover:bg-emerald-200 disabled:opacity-50">Accept</button>
                          <button onClick={() => onRespondRequest(p.email, 'declined')} className="text-xs bg-red-100 text-red-700 font-bold px-2 py-1 rounded hover:bg-red-200">Decline</button>
                        </div>
                      )}
                      {p.status === 'accepted' && <span className="text-xs font-bold text-emerald-600">Accepted ✓</span>}
                      {p.status === 'declined' && <span className="text-xs font-bold text-red-500">Declined ❌</span>}
                    </div>
                    {/* Privacy check: Only show phone bio if explicitly accepted */}
                    {p.status === 'accepted' && (
                      <div className="mt-1 flex flex-col gap-1 w-full">
                        {p.phone && (
                          <span className="text-slate-500 text-xs flex items-center gap-1">
                            <Phone size={12} /> {p.phone}
                          </span>
                        )}
                        {p.bio && <span className="text-slate-400 text-xs italic bg-slate-50 p-1.5 rounded text-left mt-1">"{p.bio}"</span>}

                        <button onClick={() => setActiveChat(activeChat === p.email ? null : p.email)} className="mt-1 text-xs font-bold text-emerald-600 bg-emerald-50 py-1.5 rounded flex justify-center items-center gap-1 hover:bg-emerald-100 transition-colors w-full">
                          <MessageCircle size={14} /> {activeChat === p.email ? 'Close Chat' : 'Message Passenger'}
                        </button>

                        {activeChat === p.email && (
                          <ChatBox
                            messages={p.chat || []}
                            currentUser={currentUser}
                            onSendMessage={(text) => onSendMessage(p.email, text)}
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
          <button
            onClick={onRequestSeat}
            disabled={isFull || !!userStatus}
            className={`w-full flex items-center justify-center gap-2 group transition-all py-2.5 rounded-xl font-bold ${userStatus === 'pending' ? 'bg-amber-100 text-amber-700 cursor-not-allowed border border-amber-200' :
              userStatus === 'accepted' ? 'bg-emerald-100 text-emerald-700 cursor-not-allowed border border-emerald-200' :
                userStatus === 'declined' ? 'bg-red-100 text-red-700 cursor-not-allowed border border-red-200' :
                  isFull ? 'bg-slate-200 text-slate-500 cursor-not-allowed' :
                    'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5'
              }`}
          >
            {userStatus === 'pending' ? 'Request Pending ⏳' :
              userStatus === 'accepted' ? 'Request Accepted ✓' :
                userStatus === 'declined' ? 'Request Declined ❌' :
                  isFull ? 'Seats Not Available' : 'Request Seat'}
            {!isFull && !userStatus && <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />}
          </button>

          {userStatus === 'accepted' && (
            <div className="w-full animate-in fade-in slide-in-from-top-2">
              <button onClick={() => setActiveChat(activeChat ? null : currentUser.email)} className="w-full py-2 bg-white border border-emerald-200 text-emerald-600 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-50 transition-colors">
                <MessageCircle size={18} /> {activeChat ? 'Hide Chat' : 'Chat with Driver'}
              </button>
              {activeChat === currentUser.email && (
                <ChatBox
                  messages={userRequest?.chat || []}
                  currentUser={currentUser}
                  onSendMessage={(text) => onSendMessage(currentUser.email, text)}
                />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}