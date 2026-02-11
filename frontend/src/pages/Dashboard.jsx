import React, { useState, useEffect } from 'react';
import RideCard from '../components/RideCard';
import { Car } from 'lucide-react';

// Mock data incase backend isn't connected
const MOCK_RIDES = [
  { ride_id: 1, driver_name: "John Doe", vehicle_model: "Honda City", start_location: "Campus Gate", end_location: "City Center", distance_km: 15, calculated_cost_per_seat: 45, start_time: new Date().toISOString() },
  { ride_id: 2, driver_name: "Jane Smith", vehicle_model: "Swift", start_location: "Hostel A", end_location: "Train Station", distance_km: 8, calculated_cost_per_seat: 25, start_time: new Date().toISOString() }
];

export default function Dashboard({ API_URL }) {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, fetch from API_URL
    // fetch(`${API_URL}?action=get_rides`)...
    
    // Simulating API delay
    setTimeout(() => {
      setRides(MOCK_RIDES);
      setLoading(false);
    }, 800);
  }, [API_URL]);

  if (loading) {
    return <div className="text-center py-20 text-slate-500">Loading rides...</div>;
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800">Available Rides</h2>
        <p className="text-slate-500">Find a ride to split the cost.</p>
      </div>

      {rides.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rides.map(ride => (
            <RideCard key={ride.ride_id} ride={ride} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
          <Car size={48} className="mx-auto mb-4 text-slate-300" />
          <p className="text-slate-500">No active rides found.</p>
        </div>
      )}
    </div>
  );
}