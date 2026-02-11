import React, { useState } from 'react';
import { Settings, MapPin, Navigation } from 'lucide-react';

export default function CreateRide({ user, API_URL, onRideCreated }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    start_location: '',
    end_location: '',
    distance: '',
    start_time: '',
    vehicle_id: user.vehicle?.id || 1, // Defaulting for demo
    mileage: user.vehicle?.mileage || 15, // Defaulting for demo
    capacity: user.vehicle?.capacity || 4 // Defaulting for demo
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulating API call for GitHub structure demo
    // In real usage, uncomment fetch below
    /*
    await fetch(`${API_URL}?action=create_ride`, {
        method: 'POST',
        body: JSON.stringify({ driver_id: user.id, ...formData })
    });
    */
    
    setTimeout(() => {
        onRideCreated();
        setLoading(false);
    }, 1500);
  };

  const handleChange = (e) => setFormData({...formData, [e.target.name]: e.target.value});

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
                <MapPin size={18} className="absolute left-3 top-3.5 text-slate-400" />
                <input required name="start_location" className="input-field pl-10" placeholder="Source" onChange={handleChange} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">To</label>
              <div className="relative">
                <Navigation size={18} className="absolute left-3 top-3.5 text-slate-400" />
                <input required name="end_location" className="input-field pl-10" placeholder="Destination" onChange={handleChange} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
               <label className="block text-sm font-semibold text-slate-700 mb-2">Distance (km)</label>
               <input required type="number" name="distance" className="input-field" placeholder="e.g. 12.5" onChange={handleChange} />
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