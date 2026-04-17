import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CreateRide from './pages/Createride';
import Profile from './pages/Profile';
import MyBookings from './pages/MyBookings';

export default function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('fuelshare_user');
    if (!savedUser) return null;
    const parsed = JSON.parse(savedUser);
    // Polyfill id for legacy sessions
    if (parsed && !parsed.id && parsed.user_id) {
      parsed.id = parsed.user_id;
    }
    return parsed;
  });

  const [page, setPage] = useState(user ? 'dashboard' : 'login');
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const [rides, setRides] = useState([]);
  const [totalCO2Saved, setTotalCO2Saved] = useState(() => {
    const savedCO2 = localStorage.getItem('fuelshare_co2');
    return savedCO2 ? parseFloat(savedCO2) : 0;
  });

  const API_URL = `http://${window.location.hostname}/fuelshare-backend/api/api.php`;

  const fetchRides = async () => {
    try {
      const res = await fetch(`${API_URL}?action=get_rides`);
      const data = await res.json();
      if (!data.error) setRides(data);
    } catch (err) {
      console.error("Failed to fetch rides:", err);
    }
  };

  useEffect(() => {
    if (user) {
      // Fetch immediately on load
      fetchRides();

      // Poll every 5 seconds to sync data across devices (Phone vs PC)
      const intervalId = setInterval(() => {
        fetchRides();
      }, 5000);

      return () => clearInterval(intervalId);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('fuelshare_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('fuelshare_user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('fuelshare_co2', totalCO2Saved.toString());
  }, [totalCO2Saved]);

  const handleRequestSeat = async (ride_id, passenger) => {
    await fetch(`${API_URL}?action=request_seat`, {
      method: "POST", headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ride_id, passenger_id: passenger.id })
    });
    fetchRides();
  };

  const handleRespondRequest = async (ride_id, passenger_email, response_status, distance_km) => {
    await fetch(`${API_URL}?action=respond_request`, {
      method: "POST", headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ride_id, passenger_email, response_status })
    });

    if (response_status === 'accepted') {
      const savings = distance_km * 0.192;
      setTotalCO2Saved(prevCO2 => prevCO2 + savings);
    }
    fetchRides();
  };

  const handleCancelRequest = async (ride_id) => {
    if (!window.confirm("Are you sure you want to cancel your seat request?")) return;

    // Resolve user ID - could be stored as .id or .user_id depending on session age
    const passengerId = user.id || user.user_id;
    if (!passengerId) {
      showToast('Error: Please log out and log back in.');
      console.error('Cancel failed: user.id is missing. User object:', user);
      return;
    }

    try {
      const res = await fetch(`${API_URL}?action=cancel_request`, {
        method: "POST", headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ride_id: ride_id, passenger_id: passengerId })
      });
      const result = await res.json();
      console.log('Cancel result:', result, 'ride_id:', ride_id, 'passenger_id:', passengerId);

      if (result.success) {
        showToast('Seat request cancelled.');
      } else {
        showToast('Failed to cancel: ' + (result.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('Cancel fetch error:', err);
      showToast('Network error cancelling request.');
    }
    fetchRides();
  };

  const handleSendMessage = async (ride_id, passenger_email, senderUser, text) => {
    await fetch(`${API_URL}?action=send_message`, {
      method: "POST", headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ride_id, passenger_email, sender_id: senderUser.id, text })
    });
    fetchRides();
  };

  const handleDeleteRide = async (ride_id) => {
    await fetch(`${API_URL}?action=delete_ride`, {
      method: "POST", headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ride_id })
    });
    fetchRides();
  };

  const handleLogin = (userData) => {
    setUser(userData);
    setPage('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setPage('login');
  };

  const handleRideCreated = () => {
    showToast('Ride published successfully!');
    fetchRides();
    setPage('dashboard');
  };

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100 font-sans relative text-slate-800">
      <style>
        {`
          @keyframes blob {
            0% { transform: translate(0px, 0px) scale(1); }
            33% { transform: translate(30px, -50px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
            100% { transform: translate(0px, 0px) scale(1); }
          }
          .animate-blob { animation: blob 7s infinite; }
          .animation-delay-2000 { animation-delay: 2s; }
          .animation-delay-4000 { animation-delay: 4s; }
        `}
      </style>

      {/* Liquid animated blobs container - strictly constrained to prevent scrollbars */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-cyan-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {/* Main App Content - relative z-index to sit on top of background */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar
          user={user}
          page={page}
          setPage={setPage}
          onLogout={handleLogout}
        />

        <main className="container mx-auto px-4 py-8">
          {!user ? (
            <Login onLogin={handleLogin} />
          ) : (
            <>
              {page === 'dashboard' && <Dashboard rides={rides} user={user} totalCO2Saved={totalCO2Saved} handleRequestSeat={handleRequestSeat} handleRespondRequest={handleRespondRequest} handleSendMessage={handleSendMessage} handleDeleteRide={handleDeleteRide} handleCancelRequest={handleCancelRequest} />}

              {page === 'create' && (
                <CreateRide
                  user={user}
                  API_URL={API_URL}
                  onRideCreated={handleRideCreated}
                />
              )}

              {page === 'profile' && (
                <Profile user={user} onUpdateUser={setUser} API_URL={API_URL} onLogout={handleLogout} />
              )}

              {page === 'my_bookings' && <MyBookings user={user} API_URL={API_URL} />}
            </>
          )}
        </main>

        {user && <Footer />}
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-[100] animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="bg-white/80 backdrop-blur-md px-6 py-4 rounded-2xl shadow-xl shadow-teal-500/10 border border-white/60 font-bold text-teal-800 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
            </div>
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}