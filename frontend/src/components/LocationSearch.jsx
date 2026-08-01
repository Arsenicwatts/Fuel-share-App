import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Loader2, X, GraduationCap, Crosshair, PlusCircle } from 'lucide-react';

/**
 * Built-in Campus & Landmark Presets dictionary for instant college/transit search
 * Covers Gujarat (Vadodara, Surat, Rajkot, Ahmedabad, Gandhinagar, Anand) and Pan-India Metros
 */
const POPULAR_PRESETS = [
  // Vadodara & Surrounding
  { shortName: 'Alkapuri, Vadodara', displayName: 'Alkapuri, Vadodara, Gujarat', lat: 22.3107, lng: 73.1706, isCollege: false },
  { shortName: 'Gotri, Vadodara', displayName: 'Gotri, Vadodara, Gujarat', lat: 22.3218, lng: 73.1423, isCollege: false },
  { shortName: 'MS University (MSU), Vadodara', displayName: 'Maharaja Sayajirao University of Baroda, Sayajiganj, Vadodara', lat: 22.3129, lng: 73.1925, isCollege: true },
  { shortName: 'Fatehgunj, Vadodara', displayName: 'Fatehgunj, Vadodara, Gujarat', lat: 22.3215, lng: 73.1874, isCollege: false },
  { shortName: 'Manjalpur, Vadodara', displayName: 'Manjalpur, Vadodara, Gujarat', lat: 22.2742, lng: 73.1925, isCollege: false },
  { shortName: 'Makarpura GIDC, Vadodara', displayName: 'Makarpura GIDC, Vadodara, Gujarat', lat: 22.2471, lng: 73.1983, isCollege: false },
  { shortName: 'Sama Savli Road, Vadodara', displayName: 'Sama Savli Road, Vadodara, Gujarat', lat: 22.3482, lng: 73.1991, isCollege: false },
  { shortName: 'Vadodara Junction Railway Station', displayName: 'Vadodara Junction Railway Station, Sayajiganj, Vadodara', lat: 22.3103, lng: 73.1812, isCollege: false },
  { shortName: 'Vasna / Saiyed Vasna, Vadodara', displayName: 'Vasna Road, Saiyed Vasna, Vadodara, Gujarat', lat: 22.2965, lng: 73.1491, isCollege: false },
  { shortName: 'Parul University, Waghodia', displayName: 'Parul University, Post Limda, Waghodia, Vadodara', lat: 22.2891, lng: 73.3636, isCollege: true },
  { shortName: 'GSFC University, Fertilizernagar', displayName: 'GSFC University, Fertilizernagar, Vadodara', lat: 22.3688, lng: 73.1421, isCollege: true },
  { shortName: 'Navrachana University, Bhayli', displayName: 'Navrachana University, Vasna-Bhayli Road, Vadodara', lat: 22.2811, lng: 73.1192, isCollege: true },

  // Ahmedabad & Gandhinagar
  { shortName: 'GTU Campus, Chandkheda', displayName: 'Gujarat Technological University, Chandkheda, Ahmedabad, Gujarat', lat: 23.1062, lng: 72.5956, isCollege: true },
  { shortName: 'Nirma University, SG Highway', displayName: 'Nirma University, S.G. Highway, Ahmedabad, Gujarat', lat: 23.1288, lng: 72.5441, isCollege: true },
  { shortName: 'IIM Ahmedabad, Vastrapur', displayName: 'Indian Institute of Management (IIMA), Vastrapur, Ahmedabad', lat: 23.0315, lng: 72.5312, isCollege: true },
  { shortName: 'Prahlad Nagar, Ahmedabad', displayName: 'Prahlad Nagar, SG Highway, Ahmedabad, Gujarat', lat: 23.0123, lng: 72.5111, isCollege: false },
  { shortName: 'Bopal / South Bopal, Ahmedabad', displayName: 'Bopal, SP Ring Road, Ahmedabad, Gujarat', lat: 23.0334, lng: 72.4645, isCollege: false },
  { shortName: 'PDPU / PDEU, Raisan', displayName: 'Pandit Deendayal Energy University, Raisan, Gandhinagar', lat: 23.1558, lng: 72.6664, isCollege: true },
  { shortName: 'IIT Gandhinagar, Palaj', displayName: 'Indian Institute of Technology Gandhinagar, Palaj, Gandhinagar', lat: 23.2114, lng: 72.6842, isCollege: true },
  { shortName: 'Infocity, Gandhinagar', displayName: 'Infocity IT Park, Sector 0, Gandhinagar, Gujarat', lat: 23.1950, lng: 72.6320, isCollege: false },
  { shortName: 'L.D. College of Engineering, Navrangpura', displayName: 'L.D. College of Engineering, Navrangpura, Ahmedabad', lat: 23.0347, lng: 72.5471, isCollege: true },
  { shortName: 'Ahmedabad Railway Station (Kalupur)', displayName: 'Ahmedabad Junction Railway Station, Kalupur, Ahmedabad', lat: 23.0271, lng: 72.6012, isCollege: false },
  { shortName: 'SVP International Airport (AMD)', displayName: 'Sardar Vallabhbhai Patel International Airport, Hansol, Ahmedabad', lat: 23.0772, lng: 72.6347, isCollege: false },
  { shortName: 'ISCON Circle, SG Highway', displayName: 'ISCON Cross Road, S.G. Highway, Satellite, Ahmedabad', lat: 23.0278, lng: 72.5074, isCollege: false },

  // Surat, Rajkot, Anand
  { shortName: 'SVNIT Surat, Ichchhanath', displayName: 'Sardar Vallabhbhai National Institute of Technology, Surat', lat: 21.1644, lng: 72.7853, isCollege: true },
  { shortName: 'Vesu, Surat', displayName: 'Vesu Main Road, Surat, Gujarat', lat: 21.1415, lng: 72.7712, isCollege: false },
  { shortName: 'Adajan, Surat', displayName: 'Adajan Gam, Surat, Gujarat', lat: 21.1956, lng: 72.7934, isCollege: false },
  { shortName: 'Surat Railway Station', displayName: 'Surat Junction Railway Station, Varachha, Surat, Gujarat', lat: 21.2048, lng: 72.8407, isCollege: false },
  { shortName: 'Marwadi University, Rajkot', displayName: 'Marwadi University, Rajkot-Morbi Road, Rajkot, Gujarat', lat: 22.3689, lng: 70.7972, isCollege: true },
  { shortName: 'Charusat University, Changa / Anand', displayName: 'Charotar University of Science and Technology, Changa, Anand', lat: 22.5996, lng: 72.8205, isCollege: true },
  { shortName: 'VV Nagar (Vallabh Vidyanagar), Anand', displayName: 'Vallabh Vidyanagar, Anand, Gujarat', lat: 22.5534, lng: 72.9247, isCollege: true },

  // Pan-India Metros
  { shortName: 'Vijay Nagar, Indore', displayName: 'Vijay Nagar, Indore, Madhya Pradesh', lat: 22.7533, lng: 75.8937, isCollege: false },
  { shortName: 'MP Nagar, Bhopal', displayName: 'Maharana Pratap Nagar, Bhopal, Madhya Pradesh', lat: 23.2333, lng: 77.4333, isCollege: false },
  { shortName: 'Mumbai Central Railway Station', displayName: 'Mumbai Central Railway Station, Mumbai, Maharashtra', lat: 18.9696, lng: 72.8193, isCollege: false },
  { shortName: 'IIT Bombay, Powai', displayName: 'Indian Institute of Technology Bombay, Powai, Mumbai', lat: 19.1334, lng: 72.9133, isCollege: true },
  { shortName: 'Delhi University (DU North Campus)', displayName: 'University of Delhi, University Enclave, New Delhi', lat: 28.6893, lng: 77.2104, isCollege: true },
  { shortName: 'IIT Delhi, Hauz Khas', displayName: 'Indian Institute of Technology Delhi, Hauz Khas, New Delhi', lat: 28.5450, lng: 77.1926, isCollege: true },
  { shortName: 'IISc Bangalore, Malleshwaram', displayName: 'Indian Institute of Science, Malleshwaram, Bengaluru, Karnataka', lat: 13.0183, lng: 77.5670, isCollege: true }
];

export default function LocationSearch({ placeholder, icon: Icon = MapPin, onSelect, initialValue = '', onOpenMapPicker }) {
  const [query, setQuery] = useState(initialValue);
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selected, setSelected] = useState(!!initialValue);
  const debounceRef = useRef(null);
  const containerRef = useRef(null);

  // Sync internal input query when initialValue prop changes (e.g. from Map Pinning, GPS, or Saved Places)
  useEffect(() => {
    setQuery(initialValue || '');
    setSelected(!!initialValue);
  }, [initialValue]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchLocations = async (searchText) => {
    if (searchText.length < 2) {
      setResults([]);
      return;
    }

    setIsSearching(true);

    const qLower = searchText.toLowerCase();
    const presetMatches = POPULAR_PRESETS.filter(p =>
      p.shortName.toLowerCase().includes(qLower) ||
      p.displayName.toLowerCase().includes(qLower)
    );

    let apiResults = [];

    // Source 1: Photon Komoot API
    try {
      const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(searchText)}&limit=10&lang=en`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.features && Array.isArray(data.features)) {
        apiResults = data.features.map(feature => {
          const p = feature.properties || {};
          const coords = feature.geometry?.coordinates || [0, 0]; // [lng, lat]

          const name = p.name || p.street || p.district || p.city || 'Location';
          const parts = [];
          if (p.name) parts.push(p.name);
          if (p.street && p.street !== p.name) parts.push(p.street);
          if (p.district && p.district !== p.name && p.district !== p.street) parts.push(p.district);
          if (p.city && p.city !== p.name) parts.push(p.city);
          if (p.state && p.state !== p.city) parts.push(p.state);

          return {
            shortName: parts.slice(0, 3).join(', ') || name,
            displayName: parts.join(', ') || `${name}, India`,
            lat: coords[1],
            lng: coords[0],
            isCollege: (p.type === 'college' || p.type === 'university' || (p.name && p.name.toLowerCase().includes('university')))
          };
        });
      }
    } catch (err) {
      console.warn('Photon search error:', err);
    }

    // Source 2: Nominatim Backup search if Photon returns few results
    if (apiResults.length < 3) {
      try {
        const nomUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchText + ', India')}&limit=6&addressdetails=1`;
        const nomRes = await fetch(nomUrl);
        const nomData = await nomRes.json();
        if (Array.isArray(nomData)) {
          const nomResults = nomData.map(item => ({
            shortName: item.display_name.split(',').slice(0, 3).join(', '),
            displayName: item.display_name,
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon),
            isCollege: item.type === 'university' || item.type === 'college'
          }));
          apiResults = [...apiResults, ...nomResults];
        }
      } catch (e) {
        // Fallback silently
      }
    }

    // Combine presets + API results without duplicates
    const combined = [...presetMatches];
    apiResults.forEach(item => {
      if (!combined.some(c => Math.abs(c.lat - item.lat) < 0.002 && Math.abs(c.lng - item.lng) < 0.002)) {
        combined.push(item);
      }
    });

    setResults(combined.slice(0, 10));
    setShowDropdown(true);
    setIsSearching(false);
  };

  // GPS Current Location Detection with reverse geocoding
  const handleGPSLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(`https://photon.komoot.io/reverse?lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          if (data.features && data.features.length > 0) {
            const p = data.features[0].properties || {};
            const name = p.name || p.street || p.suburb || p.district || p.city || 'Current Location';
            const city = p.city || p.county || p.state || '';
            const shortName = `🎯 ${name}${city ? ', ' + city : ''}`;
            const displayName = `${name}, ${p.street || ''}, ${p.city || ''}, ${p.state || ''}`.replace(/,\s*,/g, ',');

            handleSelect({
              shortName,
              displayName,
              lat: latitude,
              lng: longitude
            });
          } else {
            handleSelect({
              shortName: `🎯 Current GPS Location (${latitude.toFixed(3)}, ${longitude.toFixed(3)})`,
              displayName: `GPS Position (${latitude}, ${longitude})`,
              lat: latitude,
              lng: longitude
            });
          }
        } catch (err) {
          handleSelect({
            shortName: `🎯 Current Location`,
            displayName: `GPS Location (${latitude.toFixed(3)}, ${longitude.toFixed(3)})`,
            lat: latitude,
            lng: longitude
          });
        }
        setIsLocating(false);
      },
      (err) => {
        alert("Unable to detect GPS position. Please check location permissions.");
        setIsLocating(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setSelected(false);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchLocations(value), 300);
  };

  const handleSelect = (result) => {
    setQuery(result.shortName);
    setSelected(true);
    setShowDropdown(false);
    setResults([]);
    onSelect?.({
      displayName: result.displayName || result.shortName,
      shortName: result.shortName,
      lat: result.lat,
      lng: result.lng
    });
  };

  const handleSelectCustomQuery = () => {
    if (!query) return;
    setShowDropdown(false);
    if (onOpenMapPicker) {
      onOpenMapPicker(query);
    } else {
      handleSelect({
        shortName: query,
        displayName: `${query}, India`,
        lat: 22.3072,
        lng: 73.1812
      });
    }
  };

  const handleClear = () => {
    setQuery('');
    setSelected(false);
    setResults([]);
    onSelect?.(null);
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative flex items-center">
        <Icon size={18} className={`absolute left-3 z-10 ${selected ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'}`} />
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => results.length > 0 && setShowDropdown(true)}
          placeholder={placeholder}
          className={`input-field pl-10 pr-20 ${selected ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/30 font-bold' : ''}`}
          autoComplete="off"
        />

        <div className="absolute right-3 flex items-center gap-1.5 z-10">
          {isSearching && (
            <Loader2 size={16} className="text-emerald-600 animate-spin" />
          )}

          {/* GPS Detector Button */}
          <button
            type="button"
            onClick={handleGPSLocation}
            disabled={isLocating}
            className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            title="Detect My Current GPS Location"
          >
            {isLocating ? <Loader2 size={16} className="animate-spin text-emerald-600" /> : <Crosshair size={16} />}
          </button>

          {selected && !isSearching && (
            <button
              type="button"
              onClick={handleClear}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Dropdown Results */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
          {/* Custom Write-In Option */}
          {query.length >= 2 && (
            <button
              type="button"
              onClick={handleSelectCustomQuery}
              className="w-full text-left px-4 py-3 bg-emerald-50/80 dark:bg-emerald-900/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors flex items-center gap-3 border-b border-emerald-200 dark:border-emerald-800"
            >
              <PlusCircle size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-black text-emerald-900 dark:text-emerald-200 truncate">Use "{query}" as custom location</p>
                <p className="text-xs text-emerald-700 dark:text-emerald-400">Click to pin custom address</p>
              </div>
            </button>
          )}

          {results.map((result, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelect(result)}
              className="w-full text-left px-4 py-3 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors flex items-start gap-3 border-b border-slate-100 dark:border-slate-700/60 last:border-0"
            >
              {result.isCollege ? (
                <GraduationCap size={18} className="text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
              ) : (
                <MapPin size={18} className="text-teal-600 dark:text-teal-400 mt-0.5 shrink-0" />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{result.shortName}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400 truncate">{result.displayName}</p>
              </div>
            </button>
          ))}
          <div className="px-4 py-2 text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center">
            <span>Multi-Source Geocoding Engine</span>
            <span>Photon + Nominatim + Custom Pin</span>
          </div>
        </div>
      )}
    </div>
  );
}
