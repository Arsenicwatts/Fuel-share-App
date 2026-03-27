import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CreateRide from './pages/Createride';

export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState('login');

  const [rides, setRides] = useState([
    { ride_id: 1, driver_name: "John Doe", vehicle_model: "Honda City", start_location: "Campus Gate", end_location: "City Center", distance_km: 15, calculated_cost_per_seat: 45, start_time: new Date().toISOString() },
    { ride_id: 2, driver_name: "Jane Smith", vehicle_model: "Swift", start_location: "Hostel A", end_location: "Train Station", distance_km: 8, calculated_cost_per_seat: 25, start_time: new Date().toISOString() }
  ]);

  const [totalCO2Saved, setTotalCO2Saved] = useState(0);

  const handleBookSeat = (distance_km) => {
    // 192g CO2 saved per km per passenger (converted to kg)
    const savings = distance_km * 0.192;
    setTotalCO2Saved((prev) => prev + savings);
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
            {page === 'dashboard' && <Dashboard rides={rides} totalCO2Saved={totalCO2Saved} handleBookSeat={handleBookSeat} API_URL={API_URL} />}

            {page === 'create' && (
              <CreateRide
                user={user}
                API_URL={API_URL}
                onRideCreated={handleRideCreated}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}