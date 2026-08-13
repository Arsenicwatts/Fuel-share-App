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
  const [dbCO2Saved, setDbCO2Saved] = useState(0);

  // Exact database-derived CO2 saved metric matching confirmed shared rides
  const totalCO2Saved = dbCO2Saved;

  const fetchRides = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}?action=get_rides`);
      const data = await res.json();
      if (!data.error) setRides(data);

      if (user) {
        const userIdQuery = user.id ? `user_id=${user.id}` : `email=${encodeURIComponent(user.email)}`;
        const co2Res = await fetch(`${API_URL}?action=get_co2_impact&${userIdQuery}`);
        const co2Data = await co2Res.json();
        if (co2Data && typeof co2Data.co2_kg === 'number') {
          setDbCO2Saved(co2Data.co2_kg);
        }
      }
    } catch (err) {
      console.error("Failed to fetch rides/CO2:", err);
    } finally {
      setIsLoading(false);
    }
  }, [API_URL, user]);

  const [notifications, setNotifications] = useState([]);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(`${API_URL}?action=get_notifications&user_id=${user.id}`);
      const data = await res.json();
      if (data && Array.isArray(data.notifications)) {
        setNotifications(data.notifications);
        setUnreadNotificationsCount(data.unread_count || 0);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  }, [API_URL, user]);

  const markNotificationsRead = async () => {
    if (!user) return;
    try {
      await fetch(`${API_URL}?action=mark_notifications_read`, {
        method: "POST", headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id })
      });
      setUnreadNotificationsCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error("Failed to mark notifications read:", err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchRides();
      fetchNotifications();
      // Fast 2-second polling for instant request/response/chat updates
      const intervalId = setInterval(() => {
        fetchRides();
        fetchNotifications();
      }, 2000);

      const handleFocus = () => {
        fetchRides();
        fetchNotifications();
      };
      window.addEventListener('focus', handleFocus);

      return () => {
        clearInterval(intervalId);
        window.removeEventListener('focus', handleFocus);
      };
    } else {
      setRides([]);
      setNotifications([]);
      setUnreadNotificationsCount(0);
      setIsLoading(false);
    }
  }, [user, fetchRides, fetchNotifications]);

  // ======================== RIDE ACTIONS ========================

  const requestSeat = async (ride_id, passenger) => {
    await fetch(`${API_URL}?action=request_seat`, {
      method: "POST", headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ride_id, passenger_id: passenger.id })
    });
    fetchRides();
    fetchNotifications();
  };

  const respondRequest = async (ride_id, passenger_email, response_status) => {
    await fetch(`${API_URL}?action=respond_request`, {
      method: "POST", headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ride_id, passenger_email, response_status })
    });
    fetchRides();
    fetchNotifications();
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
      const data = await res.json();
      if (data.success) {
        showToast('Seat request cancelled');
        fetchRides();
        fetchNotifications();
      }
    } catch (err) {
      showToast('Failed to cancel request');
    }
  };

  const sendMessage = async (ride_id, passenger_email, text) => {
    const sender_id = user.id || user.user_id;
    await fetch(`${API_URL}?action=send_message`, {
      method: "POST", headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ride_id, passenger_email, sender_id, text })
    });
    fetchRides();
    fetchNotifications();
  };

  const deleteRide = async (ride_id) => {
    if (!window.confirm("Are you sure you want to delete this ride offer?")) return;
    try {
      await fetch(`${API_URL}?action=delete_ride`, {
        method: "POST", headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ride_id })
      });
      showToast('Ride offer deleted');
      fetchRides();
      fetchNotifications();
    } catch (err) {
      showToast('Failed to delete ride');
    }
  };

  const completeRide = async (ride_id) => {
    if (!window.confirm("Mark this ride as completed?")) return;
    try {
      await fetch(`${API_URL}?action=complete_ride`, {
        method: "POST", headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ride_id })
      });
      showToast('Ride completed!');
      fetchRides();
      fetchNotifications();
    } catch (err) {
      showToast('Network error completing ride');
    }
  };

  const rideCreated = () => {
    showToast('Ride published successfully!');
    fetchRides();
    fetchNotifications();
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
    // Notifications
    notifications, unreadNotificationsCount, fetchNotifications, markNotificationsRead,
    // Actions
    requestSeat, respondRequest, cancelRequest, sendMessage, deleteRide, completeRide, rideCreated,
    // UI
    toast, showToast,
    // Config
    API_URL, NODE_URL
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
