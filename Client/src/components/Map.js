import React, { useEffect, useState, useRef } from 'react';
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

  const mapRef = useRef(null); // Reference for the Google Map instance
  const [locations, setLocations] = useState([]);
  const [driverHistory, setDriverHistory] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);

  const socket = io(process.env.REACT_APP_API_URL); // Replace with your backend's Socket.IO endpoint
  const token = localStorage.getItem('token');

  const fetchDrivers = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/owner/getDrivers`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data1 = await response.json();
      const data = data1.drivers;
      setDrivers(data);
    } catch (error) {
      console.error('Error fetching drivers:', error);
    }
  };

  const fetchDriverLocation = async (driverId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/owner/drivers/${driverId}/location`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      const { latitude, longitude, status, drivername } = data.location;
      const location = {
        lat: latitude,
        lng: longitude,
        status,
        drivername,
      };
      setCurrentLocation(location);

      // Center the map on the driver's location
      if (mapRef.current) {
        mapRef.current.panTo(location);
      }
    } catch (error) {
      console.error('Error fetching driver location:', error);
    }
  };

  const fetchDriverHistory = async (driverId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/drivers/${driverId}/history`, {
        headers: {
          Authorization: `Bearer ${token}`,
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

  useEffect(() => {
    socket.on('changeLocation', (data) => {
      const { userId, latitude, longitude } = data;

      setLocations((prev) => {
        const updatedLocations = prev.filter((loc) => loc.userId !== userId);
        updatedLocations.push({
          userId,
          location: { coordinates: [longitude, latitude] },
          status: 'moving',
        });
        return updatedLocations;
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [socket]);

  useEffect(() => {
    fetchDrivers();
  }, []);

  useEffect(() => {
    if (selectedDriver) {
      fetchDriverLocation(selectedDriver);
      fetchDriverHistory(selectedDriver);
    }
  }, [selectedDriver]);

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading maps...</div>;

  return (
    <div className="p-4">
  <h2 className="text-xl font-bold mb-4">Owner Dashboard</h2>

  <div className="flex flex-col md:flex-row">
    {/* Driver List Section - Left side */}
    <div className="w-full md:w-1/3 p-2 mb-4 md:mb-0">
    <div className="mb-4">
  <label htmlFor="driver-list" className="block mb-2 font-semibold">
    Select a Driver:
  </label>
  <div id="driver-list" className="flex flex-col space-y-2">
    {drivers.map((driver) => (
      <div
        key={driver.userId}
        onClick={() => setSelectedDriver(driver._id)}
        className={`flex items-center p-3 border rounded cursor-pointer ${
          selectedDriver === driver._id ? 'bg-blue-200 border-blue-400' : 'bg-gray-100 border-gray-300'
        }`}
      >
        <span className="font-semibold">{driver.name || `Driver ${driver.userId}`}</span>
      </div>
    ))}
  </div>
</div>

    </div>

    {/* Map Section - Right side */}
    <div className="w-full md:w-2/3 sm:w-1/3">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={12}
        onLoad={(map) => (mapRef.current = map)}
      >
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

        {currentLocation && (
          <Marker
            position={currentLocation}
            icon={{
              url: 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png',
              scaledSize: new window.google.maps.Size(50, 50),
            }}
            label={`${currentLocation.drivername} - ${currentLocation.status}`}
          />
        )}

        {selectedDriver && driverHistory.length > 0 && (
          <Polyline path={driverHistory} options={polylineOptions} />
        )}
      </GoogleMap>
    </div>
  </div>
</div>

  );
};

export default OwnerDashboardMap;
