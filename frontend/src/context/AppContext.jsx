import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const AppContext = createContext(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export function AppProvider({ children }) {
  const navigate = useNavigate();

  // ======================== THEME ========================
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('fuelshare_theme');
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('fuelshare_theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  // ======================== AUTH ========================
  const [user, setUser] = useState(() => {
    // 1. Check sessionStorage first
    const sessionUser = sessionStorage.getItem('fuelshare_user');
    if (sessionUser) {
      try {
        const parsed = JSON.parse(sessionUser);
        if (parsed && !parsed.id && parsed.user_id) parsed.id = parsed.user_id;
        return parsed;
      } catch (e) {
        sessionStorage.removeItem('fuelshare_user');
      }
    }

    // 2. Check localStorage (Remember Me) with 24-hour expiration
    const persistentUser = localStorage.getItem('fuelshare_user');
    if (persistentUser) {
      try {
        const parsed = JSON.parse(persistentUser);
        const now = Date.now();
        if (parsed.expiry && now > parsed.expiry) {
          localStorage.removeItem('fuelshare_user');
          return null;
        }
        if (parsed && !parsed.id && parsed.user_id) parsed.id = parsed.user_id;
        return parsed;
      } catch (e) {
        localStorage.removeItem('fuelshare_user');
      }
    }

    return null;
  });

  const login = (userData, rememberMe = false) => {
    if (userData && !userData.id && userData.user_id) {
      userData.id = userData.user_id;
    }

    setUser(userData);

    if (rememberMe) {
      const storedData = {
        ...userData,
        expiry: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
      };
      localStorage.setItem('fuelshare_user', JSON.stringify(storedData));
      sessionStorage.removeItem('fuelshare_user');
    } else {
      sessionStorage.setItem('fuelshare_user', JSON.stringify(userData));
      localStorage.removeItem('fuelshare_user');
    }

    navigate('/dashboard');
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('fuelshare_user');
    localStorage.removeItem('fuelshare_user');
    navigate('/');
  };

  // ======================== TOAST ========================
  const [toast, setToast] = useState(null);
  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }, []);

  // ======================== API ========================
  const API_URL = `http://${window.location.hostname}/fuelshare-backend/api/api.php`;
  const NODE_URL = `http://${window.location.hostname}:5000`;

  // ======================== RIDES ========================
  const [rides, setRides] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Dynamically compute CO2 saved (kg) from user's actual database rides for 100% cross-device consistency
  const totalCO2Saved = React.useMemo(() => {
    if (!user || !Array.isArray(rides)) return 0;

    let totalKmShared = 0;

    rides.forEach(ride => {
      const isDriver = ride.driver_email === user.email;
      const acceptedRequests = (ride.requests || []).filter(r => r.status === 'accepted');

      if (isDriver) {
        // Driver saves CO2 for every passenger sharing the trip
        totalKmShared += (ride.distance_km || 0) * acceptedRequests.length;
      } else {
        // Passenger saves CO2 if accepted on this ride
        const isAccepted = (ride.requests || []).some(r => r.email === user.email && r.status === 'accepted');
        if (isAccepted) {
          totalKmShared += (ride.distance_km || 0);
        }
      }
    });

    // Average car emission saved: ~0.15 kg CO2 per passenger-km shared
    return Math.round(totalKmShared * 0.15 * 10) / 10;
  }, [user, rides]);

  const fetchRides = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}?action=get_rides`);
      const data = await res.json();
      if (!data.error) setRides(data);
    } catch (err) {
      console.error("Failed to fetch rides:", err);
    } finally {
      setIsLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    if (user) {
      fetchRides();
      // Fast 2-second polling for instant request/response/chat updates
      const intervalId = setInterval(fetchRides, 2000);

      const handleFocus = () => fetchRides();
      window.addEventListener('focus', handleFocus);

      return () => {
        clearInterval(intervalId);
        window.removeEventListener('focus', handleFocus);
      };
    } else {
      setRides([]);
      setIsLoading(false);
    }
  }, [user, fetchRides]);

  // ======================== RIDE ACTIONS ========================

  const requestSeat = async (ride_id, passenger) => {
    await fetch(`${API_URL}?action=request_seat`, {
      method: "POST", headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ride_id, passenger_id: passenger.id })
    });
    fetchRides();
  };

  const respondRequest = async (ride_id, passenger_email, response_status) => {
    await fetch(`${API_URL}?action=respond_request`, {
      method: "POST", headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ride_id, passenger_email, response_status })
    });
    fetchRides();
  };

  const cancelRequest = async (ride_id) => {
    if (!window.confirm("Are you sure you want to cancel your seat request?")) return;
    const passengerId = user.id || user.user_id;
    if (!passengerId) {
      showToast('Error: Please log out and log back in.');
      return;
    }
    try {
      const res = await fetch(`${API_URL}?action=cancel_request`, {
        method: "POST", headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ride_id, passenger_id: passengerId })
      });
      const result = await res.json();
      if (result.success) showToast('Seat request cancelled.');
      else showToast('Failed to cancel: ' + (result.error || 'Unknown error'));
    } catch (err) {
      showToast('Network error cancelling request.');
    }
    fetchRides();
  };

  const sendMessage = async (ride_id, passenger_email, senderUser, text) => {
    await fetch(`${API_URL}?action=send_message`, {
      method: "POST", headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ride_id, passenger_email, sender_id: senderUser.id, text })
    });
    fetchRides();
  };

  const deleteRide = async (ride_id) => {
    await fetch(`${API_URL}?action=delete_ride`, {
      method: "POST", headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ride_id })
    });
    fetchRides();
  };

  const completeRide = async (ride_id) => {
    try {
      const res = await fetch(`${API_URL}?action=complete_ride`, {
        method: "POST", headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ride_id })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Ride marked as Completed! 🎉');
        fetchRides();
      } else {
        showToast('Failed to complete ride');
      }
    } catch (err) {
      showToast('Network error completing ride');
    }
  };

  const rideCreated = () => {
    showToast('Ride published successfully!');
    fetchRides();
    navigate('/dashboard');
  };

  // ======================== CONTEXT VALUE ========================
  const value = {
    // Auth
    user, setUser, login, logout,
    // Theme
    theme, toggleTheme,
    // Data
    rides, isLoading, totalCO2Saved, fetchRides,
    // Actions
    requestSeat, respondRequest, cancelRequest, sendMessage, deleteRide, completeRide, rideCreated,
    // UI
    toast, showToast,
    // Config
    API_URL, NODE_URL
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
