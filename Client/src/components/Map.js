import React, { useEffect, useState } from 'react';
import { GoogleMap, Marker, Polyline, useLoadScript } from '@react-google-maps/api';
import io from 'socket.io-client';

const mapContainerStyle = {
  width: '100%',
  height: '600px',
};

const center = {
  lat: 28.6139, // Default to New Delhi (can be any other central location)
  lng: 77.209,
};

const polylineOptions = {
  strokeColor: '#FF0000',
  strokeOpacity: 0.8,
  strokeWeight: 3,
};

const OwnerDashboardMap = () => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '', // Your Google Maps API Key
  });

  const [locations, setLocations] = useState([]); // Stores live driver locations
  const [driverHistory, setDriverHistory] = useState([]); // Stores history for selected driver
  const [selectedDriver, setSelectedDriver] = useState(null); // Tracks selected driver
  const [drivers, setDrivers] = useState([]); // List of all drivers for dropdown
  const [currentLocation, setCurrentLocation] = useState(null); // Stores current location of selected driver

  // Initialize Socket.IO
  const socket = io(process.env.REACT_APP_API_URL); // Replace with your backend's Socket.IO endpoint
  const token = localStorage.getItem('token');

  // Fetch list of drivers from the backend
  const fetchDrivers = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/owner/getDrivers`, {
        headers: {
          Authorization: `Bearer ${token}`, // Include the token in the Authorization header
        },
      });
      const data1 = await response.json();
      const data = data1.drivers;
      setDrivers(data); // Update state with the list of drivers
    } catch (error) {
      console.error('Error fetching drivers:', error);
    }
  };

  // Fetch current location of the selected driver
  const fetchDriverLocation = async (driverId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/owner/drivers/${driverId}/location`, {
        headers: {
          Authorization: `Bearer ${token}`, // Include the token in the Authorization header
        },
      });
      const data = await response.json();
      console.log('datatatatatatataatt',data)
      const { latitude, longitude } = data.location;
      setCurrentLocation({
        lat: latitude,
        lng: longitude,
      });
    } catch (error) {
      console.error('Error fetching driver location:', error);
    }
  };

  // Fetch location history for the selected driver
  const fetchDriverHistory = async (driverId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/drivers/${driverId}/history`, {
        headers: {
          Authorization: `Bearer ${token}`, // Include the token in the Authorization header
        },
      });
      const data = await response.json();
      const historyPath = data.map((loc) => ({
        lat: loc.location.coordinates[1],
        lng: loc.location.coordinates[0],
      }));
      setDriverHistory(historyPath);
    } catch (error) {
      console.error('Error fetching driver history:', error);
    }
  };

  // Handle real-time driver updates
  useEffect(() => {
    socket.on('changeLocation', (data) => {
      const { userId, latitude, longitude } = data; // Get the user's ID and new coordinates
    
      // Find the previous location for this user
      const previousLocation = locations.find(loc => loc.userId === userId);
    
      // Determine whether the user is moving or parked
      const status = previousLocation
        ? getDistance(previousLocation.location.coordinates[1], previousLocation.location.coordinates[0], latitude, longitude) > MOVEMENT_THRESHOLD
          ? 'moving'
          : 'parked'
        : 'parked'; // If no previous location, assume parked initially
    
      // Update the location and status in the state or database
      setLocations((prev) => {
        const updatedLocations = prev.filter(loc => loc.userId !== userId); // Remove old location
        updatedLocations.push({
          userId,
          location: { coordinates: [longitude, latitude] },
          status, // Add status (moving or parked)
        });
        return updatedLocations;
      });
    });
    

    return () => {
      socket.disconnect();
    };
  }, [socket, selectedDriver]);

  useEffect(() => {
    fetchDrivers(); // Fetch the list of drivers on component mount
  }, []);

  useEffect(() => {
    if (selectedDriver) {
      fetchDriverLocation(selectedDriver); // Fetch current location when a driver is selected
      fetchDriverHistory(selectedDriver); // Fetch history when a driver is selected
    }
  }, [selectedDriver]);

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading maps...</div>;
console.log('currentlocation',currentLocation)
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Owner Dashboard</h2>

      {/* Dropdown to Select Driver */}
      <div className="mb-4">
        <label htmlFor="driver-select" className="block mb-2 font-semibold">
          Select a Driver:
        </label>
        <select
          id="driver-select"
          value={selectedDriver || ''}
          onChange={(e) => setSelectedDriver(e.target.value)}
          className="p-2 border rounded w-full"
        >
          <option value="">-- Select a Driver --</option>
          {drivers.map((driver) => (
            <option key={driver.userId} value={driver._id}>
              Driver {driver.name} {/* Replace with driver's name or other details */}
            </option>
          ))}
        </select>
      </div>

      {/* Google Map */}
      <GoogleMap mapContainerStyle={mapContainerStyle} center={center} zoom={12}>
        {/* Live Driver Markers */}
        {locations.map((loc) => (
          <Marker
            key={loc.userId}
            position={{
              lat: loc.location.coordinates[1],
              lng: loc.location.coordinates[0],
            }}
            label={`Driver ${loc.userId}`}
          />
        ))}

        {/* Current Location Marker */}
        {currentLocation && (
          <Marker
            position={currentLocation}
            icon={{
              url: 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png', // Custom Location Pin icon
              scaledSize: new window.google.maps.Size(50, 50), // Make it a little larger
            }}
          />
        )}

        {/* Driver History Polyline */}
        {selectedDriver && driverHistory.length > 0 && (
          <Polyline path={driverHistory} options={polylineOptions} />
        )}
      </GoogleMap>
    </div>
  );
};

export default OwnerDashboardMap;
