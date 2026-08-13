import React, { useState, useEffect } from 'react';
import { Bookmark, Plus, Settings, X, MapPin, Trash2, Edit3, Tag } from 'lucide-react';
import LocationSearch from './LocationSearch';
import { useApp } from '../context/AppContext';

export default function SavedPlacesBar({ onSelectPlace, onOpenMapPicker }) {
  const { user, API_URL } = useApp();
  const activeUserKey = user?.id || user?.user_id || user?.email || 'guest';
  const storageKey = `fuelshare_saved_places_${activeUserKey}`;

  const [savedPlaces, setSavedPlaces] = useState(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      const parsed = stored ? JSON.parse(stored) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  });

  const [showManager, setShowManager] = useState(false);
  const [editingId, setEditingId] = useState(null); // null or id string
  const [placeLabel, setPlaceLabel] = useState('');
  const [selectedLoc, setSelectedLoc] = useState(null);

  // Fetch saved places from DB for true cross-device synchronization
  useEffect(() => {
    if (!user) return;
    const fetchDBPlaces = async () => {
      try {
        const userId = user?.id || user?.user_id;
        const query = userId ? `user_id=${userId}` : `email=${encodeURIComponent(user.email)}`;
        const res = await fetch(`${API_URL}?action=get_saved_places&${query}`);
        const dbPlaces = await res.json();
        if (Array.isArray(dbPlaces) && dbPlaces.length > 0) {
          setSavedPlaces(dbPlaces);
          localStorage.setItem(storageKey, JSON.stringify(dbPlaces));
        }
      } catch (err) {
        console.warn("DB saved places fetch error, relying on local copy:", err);
      }
    };
    fetchDBPlaces();
  }, [user, API_URL, storageKey]);

  const updatePlaces = (updater) => {
    setSavedPlaces(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      const cleanList = Array.isArray(next) ? next : [];

      // Update local storage for instant zero-latency UI
      try {
        localStorage.setItem(storageKey, JSON.stringify(cleanList));
      } catch (e) {
        console.error('Failed to update local storage:', e);
      }

      // Sync to MySQL Database for cross-device persistence
      if (user) {
        const userId = user?.id || user?.user_id;
        fetch(`${API_URL}?action=update_saved_places`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: userId,
            email: user.email,
            saved_places: cleanList
          })
        }).catch(err => console.error("Failed to sync saved places to DB:", err));
      }

      return cleanList;
    });
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setPlaceLabel('');
    setSelectedLoc(null);
    setShowManager(true);
  };

  const handleEditPlace = (place) => {
    setEditingId(place.id);
    setPlaceLabel(place.label);
    setSelectedLoc(place.location);
    setShowManager(true);
  };

  const handleSavePlace = () => {
    if (!placeLabel.trim() || !selectedLoc) {
      alert("Please enter a name for your place and select a location.");
      return;
    }

    if (editingId) {
      updatePlaces(prev => prev.map(p => p.id === editingId ? { ...p, label: placeLabel.trim(), location: selectedLoc } : p));
    } else {
      const newPlace = {
        id: 'place_' + Date.now(),
        label: placeLabel.trim(),
        location: selectedLoc
      };
      updatePlaces(prev => [...prev, newPlace]);
    }

    setEditingId(null);
    setPlaceLabel('');
    setSelectedLoc(null);
  };

  const handleDeletePlace = (id) => {
    updatePlaces(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-1">
          <Bookmark size={14} className="text-emerald-600 dark:text-emerald-400" />
          My Saved Places:
        </span>
        {Array.isArray(savedPlaces) && savedPlaces.length > 0 && (
          <button
            type="button"
            onClick={handleOpenAdd}
            className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            <Settings size={12} /> Manage Places
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {Array.isArray(savedPlaces) && savedPlaces.map((item) => {
          if (!item.location || !item.location.displayName) return null;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectPlace?.(item.location)}
              className="bg-slate-100 hover:bg-emerald-50 dark:bg-slate-800 dark:hover:bg-emerald-900/30 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 hover:border-emerald-500 px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm group"
            >
              <Tag size={13} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="group-hover:text-emerald-600 dark:group-hover:text-emerald-400 truncate max-w-[160px]">
                {item.label}: <span className="font-semibold text-slate-500 dark:text-slate-400">{item.location.shortName || item.location.displayName.split(',')[0]}</span>
              </span>
            </button>
          );
        })}

        <button
          type="button"
          onClick={handleOpenAdd}
          className="bg-emerald-50 dark:bg-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1 shadow-sm"
        >
          <Plus size={13} /> {savedPlaces.length > 0 ? 'Add Place' : 'Save Your Custom Place (e.g. Home, Gym, Office)'}
        </button>
      </div>

      {/* Saved Places Manager Modal */}
      {showManager && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-md p-6 space-y-5">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-3">
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <Bookmark size={18} className="text-emerald-600 dark:text-emerald-400" />
                {editingId ? 'Edit Saved Place' : 'Add Custom Saved Place'}
              </h3>
              <button onClick={() => setShowManager(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X size={18} />
              </button>
            </div>

            {/* Add / Edit Form */}
            <div className="space-y-4 bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  1. Give your location a custom name / nickname
                </label>
                <input
                  type="text"
                  placeholder="e.g. Home, Office, Gym, Parents Flat, TCS Campus..."
                  value={placeLabel}
                  onChange={(e) => setPlaceLabel(e.target.value)}
                  className="input-field w-full text-sm"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    2. Search address or Pick on Map
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      onOpenMapPicker?.((pinnedLoc) => {
                        setSelectedLoc(pinnedLoc);
                      });
                    }}
                    className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <MapPin size={13} /> Pick on Map
                  </button>
                </div>

                <LocationSearch
                  placeholder="Search address, society, college or city..."
                  icon={MapPin}
                  onSelect={setSelectedLoc}
                  initialValue={selectedLoc?.displayName || ''}
                  onOpenMapPicker={(q) => {
                    onOpenMapPicker?.((pinnedLoc) => {
                      setSelectedLoc(pinnedLoc);
                    });
                  }}
                />
              </div>

              <button
                type="button"
                onClick={handleSavePlace}
                disabled={!placeLabel.trim() || !selectedLoc}
                className="btn-primary w-full py-2 text-sm font-extrabold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingId ? 'Update Custom Place' : 'Save Custom Place'}
              </button>
            </div>

            {/* Existing Saved Places List */}
            {savedPlaces.length > 0 && (
              <div className="space-y-2 pt-2">
                <p className="text-xs font-extrabold text-slate-500 uppercase">Your Saved Custom Places ({savedPlaces.length})</p>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {savedPlaces.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600">
                      <div className="min-w-0 flex-1 pr-2">
                        <p className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                          <Tag size={13} className="text-emerald-600 dark:text-emerald-400" />
                          {item.label}
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 truncate">{item.location.displayName}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleEditPlace(item)}
                          className="p-1.5 text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                          title="Edit Place"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeletePlace(item.id)}
                          className="p-1.5 text-slate-500 hover:text-red-600 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                          title="Delete Place"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowManager(false)}
              className="w-full py-2.5 text-sm font-bold border border-slate-300 dark:border-slate-600 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
