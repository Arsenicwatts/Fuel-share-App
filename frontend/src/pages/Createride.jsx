import React, { useState, useRef } from 'react';
import { Settings, MapPin, Navigation, Map } from 'lucide-react';
import { useJsApiLoader, Autocomplete } from '@react-google-maps/api';

const libraries = ['places'];

export default function CreateRide({ user, API_URL, onRideCreated }) {
  const { isLoaded } = useJsApiLoader({ id: 'google-map-script', googleMapsApiKey: "YOUR_API_KEY_HERE", libraries });
  const [loading, setLoading] = useState(false);
  const originRef = useRef();
  const destRef = useRef();

  const [formData, setFormData] = useState({
    start_location: '',
    end_location: '',
    distance: '',
    start_time: '',
    vehicle_id: user?.vehicle?.id || 1, // Defaulting for demo
    mileage: user?.vehicle?.mileage || 15, // Defaulting for demo
    capacity: user?.vehicle?.capacity || 4 // Defaulting for demo
  });

  const calculateDistance = async () => {
    if (!originRef.current?.value || !destRef.current?.value) return;

    // eslint-disable-next-line no-undef
    const directionService = new google.maps.DirectionsService();
    try {
      const results = await directionService.route({
        origin: originRef.current.value,
        destination: destRef.current.value,
        // eslint-disable-next-line no-undef
        travelMode: google.maps.TravelMode.DRIVING
      });
      const distText = results.routes[0].legs[0].distance.text;
      const distVal = parseFloat(distText.replace(/,/g, '').replace(' km', ''));
      setFormData({ ...formData, distance: distVal, start_location: originRef.current.value, end_location: destRef.current.value });
    } catch (err) {
      console.warn("Maps API not ready or missing key. Mocking distance for demo:", err);
      // Fallback for development without billing-enabled API key
      setFormData({ ...formData, distance: 12.5, start_location: originRef.current.value, end_location: destRef.current.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      const newRide = {
        ride_id: Date.now(),
        driver_name: user?.name || "Student Demo",
        vehicle_model: user?.vehicle?.model || "Demo Vehicle",
        start_location: formData.start_location,
        end_location: formData.end_location,
        distance_km: parseFloat(formData.distance),
        calculated_cost_per_seat: ((parseFloat(formData.distance) / formData.mileage) * 96.72) / formData.capacity,
        start_time: formData.start_time || new Date().toISOString()
      };
      onRideCreated(newRide);
      setLoading(false);
    }, 1000);
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="mb-8 border-b border-slate-100 pb-6">
          <h2 className="text-2xl font-bold text-slate-900">Post a New Ride</h2>
          <p className="text-slate-500">Details will be processed by our Python Engine.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">From</label>
              <div className="relative">
                <MapPin size={18} className="absolute left-3 top-3.5 text-slate-400 z-10" />
                <input required ref={originRef} className="input-field pl-10" placeholder="Source Location" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">To</label>
              <div className="relative">
                <Navigation size={18} className="absolute left-3 top-3.5 text-slate-400 z-10" />
                <input required ref={destRef} className="input-field pl-10" placeholder="Destination Location" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6 items-end">
            <div className="col-span-2 relative">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Distance (km)</label>
              <div className="flex gap-2">
                <button type="button" onClick={calculateDistance} className="bg-emerald-100 hover:bg-emerald-200 text-emerald-700 p-3 rounded-xl transition-colors shrink-0" title="Auto-Calculate Route">
                  <Map size={20} />
                </button>
                <input required type="number" step="0.1" name="distance" value={formData.distance} className="input-field flex-1" placeholder="Search route..." onChange={handleChange} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Departure Time</label>
              <input required type="datetime-local" name="start_time" className="input-field" onChange={handleChange} />
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-lg flex items-center gap-3 text-sm text-slate-600">
            <Settings size={20} className="text-slate-400" />
            <span>Mileage ({formData.mileage} km/l) and Capacity ({formData.capacity}) taken from your vehicle profile.</span>
          </div>

          <button disabled={loading} className="btn-primary w-full py-3 text-lg">
            {loading ? 'Calculating Fair Price...' : 'Publish Ride'}
          </button>
        </form>
      </div>
    </div>
  );
}