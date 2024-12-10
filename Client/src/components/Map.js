import io from 'socket.io-client';
import React, { useEffect, useState, useRef } from 'react';
import { GoogleMap, Marker, Polyline, useLoadScript } from '@react-google-maps/api';

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
  const [isPlaying, setIsPlaying] = useState(false); // Track if the playback is in progress

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

  const animatePlayback = (path) => {
    if (path.length === 0) return;

    let index = 0;
    const totalPoints = path.length;

    // Use a car image URL instead of FontAwesome icon
    const carIconURL = 'https://cdn-icons-png.flaticon.com/512/55/55283.png'; // Replace with actual car icon URL

    // Create a custom marker with the car icon
    const marker = new window.google.maps.Marker({
      position: path[0],
      map: mapRef.current,
      icon: {
        url: carIconURL,
        scaledSize: new window.google.maps.Size(40, 40), // Adjust size to fit the map
        anchor: new window.google.maps.Point(20, 20), // Center the icon
      },
    });

    // Function to move the car along the path
    const interval = setInterval(() => {
      const markerPosition = path[index];
      marker.setPosition(markerPosition);
      mapRef.current.panTo(markerPosition); // Keep the map centered on the car

      index++;

      // Stop playback when the car reaches the endpoint
      if (index >= totalPoints) {
        clearInterval(interval);
        setIsPlaying(false); // Stop playback
      }
    }, 500); // Slow playback speed (500ms per step)
  };

  const stopPlayback = () => {
    setIsPlaying(false);
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

  useEffect(() => {
    if (selectedDriver && driverHistory.length > 0 && isPlaying) {
      animatePlayback(driverHistory); // Trigger playback when driver is selected
    }
  }, [selectedDriver, driverHistory, isPlaying]);

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

      {/* Conditionally render the driver list or the "No user" message */}
      {drivers.length === 0 ? (
        <div className="text-center p-4 bg-gray-100 border border-gray-300 rounded-md">
          No users available
        </div>
      ) : (
        <div id="driver-list" className="flex flex-col space-y-2">
          {drivers.map((driver) => (
            <div
              key={driver.userId}
              onClick={() => {
                setSelectedDriver(driver._id);
                setIsPlaying(true); // Start playback when a driver is selected
              }}
              className={`flex items-center p-3 border rounded cursor-pointer ${
                selectedDriver === driver._id
                  ? 'bg-blue-200 border-blue-400'
                  : 'bg-gray-100 border-gray-300'
              }`}
            >
              <span className="font-semibold">
                {driver.name || `Driver ${driver.userId}`}
              </span>
            </div>
          ))}
        </div>
      )}
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


      {/* Button to stop playback */}
      {isPlaying && (
        <div className="mt-4">
          <button
            className="bg-red-500 text-white py-2 px-4 rounded"
            onClick={stopPlayback}
          >
            Stop Playback
          </button>
        </div>
      )}
    </div>
  );
};

export default OwnerDashboardMap;
