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

  const [rides, setRides] = useState(() => {
    const savedRides = localStorage.getItem('fuelshare_rides');
    if (savedRides) return JSON.parse(savedRides);

    return [];
  });

  const [totalCO2Saved, setTotalCO2Saved] = useState(() => {
    const savedCO2 = localStorage.getItem('fuelshare_co2');
    return savedCO2 ? parseFloat(savedCO2) : 0;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('fuelshare_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('fuelshare_user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('fuelshare_rides', JSON.stringify(rides));
  }, [rides]);

  useEffect(() => {
    localStorage.setItem('fuelshare_co2', totalCO2Saved.toString());
  }, [totalCO2Saved]);

  const handleRequestSeat = (ride_id, passenger) => {
    // Add passenger to the requests queue with a pending status
    setRides(prev => prev.map(ride =>
      ride.ride_id === ride_id
        ? {
          ...ride,
          requests: [...(ride.requests || []), { ...passenger, status: 'pending' }]
        }
        : ride
    ));
  };

  const handleRespondRequest = (ride_id, passenger_email, response_status, distance_km) => {
    setRides(prev => prev.map(ride => {
      if (ride.ride_id !== ride_id) return ride;

      const updatedRequests = (ride.requests || []).map(req =>
        req.email === passenger_email ? { ...req, status: response_status } : req
      );

      // If securely accepted, decrease seats and update CO2
      let newSeats = ride.available_seats;
      if (response_status === 'accepted') {
        newSeats = Math.max(0, ride.available_seats - 1);
        const savings = distance_km * 0.192;
        setTotalCO2Saved(prevCO2 => prevCO2 + savings);
      }

      return { ...ride, requests: updatedRequests, available_seats: newSeats };
    }));
  };

  const handleSendMessage = (ride_id, passenger_email, senderUser, text) => {
    setRides(prev => prev.map(ride => {
      if (ride.ride_id !== ride_id) return ride;

      const updatedRequests = (ride.requests || []).map(req => {
        if (req.email === passenger_email) {
          return {
            ...req,
            chat: [...(req.chat || []), {
              sender: senderUser.email,
              senderName: senderUser.name,
              text,
              timestamp: new Date().toISOString()
            }]
          };
        }
        return req;
      });

      return { ...ride, requests: updatedRequests };
    }));
  };

  const handleDeleteRide = (ride_id) => {
    setRides(prev => prev.filter(ride => ride.ride_id !== ride_id));
  };

  // Configuration for your backend
  const API_URL = "http://localhost/fuelshare-backend/api/api.php";

  const handleLogin = (userData) => {
    setUser(userData);
    setPage('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setPage('login');
  };

  const handleRideCreated = (newRide) => {
    if (newRide) {
      setRides([newRide, ...rides]);
    }
    alert('Ride published successfully!');
    setPage('dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
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
              <Profile user={user} onUpdateUser={setUser} />
            )}
          </>
        )}
      </main>
    </div>
  );
}