import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CreateRide from './pages/Createride';

export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState('login');

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

  const handleRideCreated = () => {
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
            {page === 'dashboard' && <Dashboard API_URL={API_URL} />}
            
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