import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CreateRide from './pages/Createride';
import Profile from './pages/Profile';

export default function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('fuelshare_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [page, setPage] = useState(user ? 'dashboard' : 'login');

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
    alert('Ride published successfully!');
    fetchRides();
    setPage('dashboard');
  };

  return (
    <div className="min-h-[100dvh] app-background font-sans relative text-slate-800">
      <Navbar
        user={user}
        setPage={setPage}
        onLogout={handleLogout}
      />

      <main className="container mx-auto px-4 py-8">
        {!user ? (
          <Login onLogin={handleLogin} />
        ) : (
          <>
            {page === 'dashboard' && <Dashboard rides={rides} user={user} totalCO2Saved={totalCO2Saved} handleRequestSeat={handleRequestSeat} handleRespondRequest={handleRespondRequest} handleSendMessage={handleSendMessage} handleDeleteRide={handleDeleteRide} />}

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
          </>
        )}
      </main>
    </div>
  );
}