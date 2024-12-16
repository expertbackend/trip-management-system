import React, { useEffect, useState, useRef } from 'react';
import { GoogleMap, Marker, Polyline, useLoadScript, InfoWindow,DirectionsService, DirectionsRenderer } from '@react-google-maps/api';
import io from 'socket.io-client';
import Modal from 'react-modal';

const mapContainerStyle = {
  width: '100%',
  height: '600px',
};

const center = {
  lat: 28.6139, // Default to New Delhi
  lng: 77.209,
};

const polylineOptions = {
  strokeColor: '#FF0000',
  strokeOpacity: 0.8,
  strokeWeight: 3,
};

const OwnerDashboardMap = () => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '',
  });

  const mapRef = useRef(null);
  const tooltipRef = useRef(null);

  const [drivers, setDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [selectedDriver1, setSelectedDriver1] = useState(null);

  const [currentLocation, setCurrentLocation] = useState(null);
  const [pickupLocation, setPickupLocation] = useState(null);
  const [dropoffLocation, setDropoffLocation] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lastKnownLocation, setLastKnownLocation] = useState(null);
  const [tooltipContent, setTooltipContent] = useState(null);
  const [popupContent, setPopupContent] = useState(null);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [infoWindowVisible, setInfoWindowVisible] = useState(false);
  const token = localStorage.getItem('token');
  const socket = io(process.env.REACT_APP_API_URL);
  const [locations, setLocations] = useState([]);
  const [driverHistory, setDriverHistory] = useState([]);
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [error, setError] = useState(null);


  // Fetch drivers
  const fetchDrivers = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/owner/getDrivers`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setDrivers(data.drivers);
    } catch (error) {
      console.error('Error fetching drivers:', error);
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
  // Fetch driver location and booking details
  const fetchDriverLocation = async (driverId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/owner/drivers/${driverId}/location`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      const { latitude, longitude } = data.location;

      // Set current location
      setCurrentLocation({
        lat: latitude,
        lng: longitude,
      });

      // Set pickup and dropoff locations
      if (data.booking) {
        setPickupLocation({
          lat: data.booking.pickupLocation.coordinates.coordinates[1],
          lng: data.booking.pickupLocation.coordinates.coordinates[0],
        });
        setDropoffLocation({
          lat: data.booking.dropoffLocation.coordinates.coordinates[1],
          lng: data.booking.dropoffLocation.coordinates.coordinates[0],
        });
      }

      // Center map on driver's location
      if (mapRef.current) {
        mapRef.current.panTo({ lat: latitude, lng: longitude });
      }
    } catch (error) {
      console.error('Error fetching driver location:', error);
    }
  };
  useEffect(() => {
    let geocodeTimeout;
  
    if (currentLocation) {
      // Set a timeout to debounce geocoding calls
      geocodeTimeout = setTimeout(() => {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: currentLocation }, (results, status) => {
          if (status === 'OK' && results[0]) {
            setTooltipContent({
              ...tooltipContent,
              place: results[0].formatted_address, // Get the place name
            });
          } else {
            setTooltipContent(null);
            setPopupContent(null);
          }
        });
      }, 20000); // 1-second delay
    }
  
    // Cleanup timeout when effect is re-run
    return () => {
      clearTimeout(geocodeTimeout);
    };
  }, [currentLocation, tooltipContent]);
  
  // Socket.io events
  useEffect(() => {
    socket.on('changeLocation', (data) => {
      const { userId, latitude, longitude } = data;

      if (selectedDriver === data.userId) {
        setCurrentLocation({
          lat: data.latitude,
          lng: data.longitude,
        });
        setLocations((prev) => {
          const updatedLocations = prev.filter((loc) => loc.userId !== userId);
          updatedLocations.push({
            userId,
            location: { coordinates: [longitude, latitude] },
            status: 'moving',
          });
          return updatedLocations;
        });
  
        if (mapRef.current) {
          mapRef.current.panTo({ lat: data.latitude, lng: data.longitude });
        }
      }
    });

    socket.on('driverDisconnected', (data) => {
      if (data.userId === selectedDriver) {
        setLastKnownLocation(data.locationName);
        setIsModalOpen(true);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [socket, selectedDriver]);

  useEffect(() => {
    fetchDrivers();
  }, []);

  useEffect(() => {
    if (selectedDriver) {
      fetchDriverLocation(selectedDriver);
      fetchDriverHistory(selectedDriver);
    }
  }, [selectedDriver]);
  const center = pickupLocation || { lat: 0, lng: 0 };

  const fetchDirections = () => {
    if (pickupLocation && dropoffLocation) {
      // Create a DirectionsService instance
      const directionsService = new window.google.maps.DirectionsService();

      directionsService.route(
        {
          origin: pickupLocation,
          destination: dropoffLocation,
          travelMode: "DRIVING",
        },
        (response, status) => {
          if (status === "OK") {
            setDirectionsResponse(response);
          } else {
            setError("Failed to fetch directions. Please try again.");
            console.error("Directions request failed due to", status);
          }
        }
      );
    }
  };

  useEffect(() => {
    // Fetch directions immediately and set an interval
    fetchDirections();

    const intervalId = setInterval(() => {
      fetchDirections();
    }, 20000); // 20 seconds

    return () => clearInterval(intervalId); // Cleanup interval on unmount
  }, [pickupLocation, dropoffLocation]);

  const handleMarkerClick = (marker) => {
    setSelectedMarker(marker);
    
    setInfoWindowVisible(true);
  };

  const handleCloseInfoWindow = () => {
    setInfoWindowVisible(false);
    setSelectedMarker(null);
  };
  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading maps...</div>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Owner Dashboard</h2>

      <Modal isOpen={isModalOpen} onRequestClose={() => setIsModalOpen(false)}>
        <h3>Driver Disconnected</h3>
        <p>Last known location: {lastKnownLocation}</p>
        <button onClick={() => setIsModalOpen(false)}>Close</button>
      </Modal>

      <div className="flex flex-col md:flex-row">
        <div className="w-full md:w-1/3 p-2 mb-4 md:mb-0">
          <label htmlFor="driver-list" className="block mb-2 font-semibold">
            Select a Driver:
          </label>
          <div id="driver-list" className="flex flex-col space-y-2">
            {drivers.map((driver) => (
              <div
                key={driver._id}
                onClick={() => {
                  setSelectedDriver(driver._id);
                  setSelectedDriver1(driver); // Call fetchDriverLocation as well
                }}
                className={`flex items-center p-3 border rounded cursor-pointer ${
                  selectedDriver === driver._id ? 'bg-blue-200 border-blue-400' : 'bg-gray-100 border-gray-300'
                }`}
              >
                <span className="font-semibold">{driver.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full md:w-2/3">
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
                label={`${ selectedDriver1.name} - ${ selectedDriver1.status}`}
                icon={{
                  url: 'https://cdn-icons-png.flaticon.com/512/55/55283.png',
                  scaledSize: new window.google.maps.Size(40, 40),
                }}
                onMouseOver={() =>
                  setTooltipContent({
                    content: 'Loading place...',
                    position: currentLocation,
                    name: selectedDriver1.name, // Replace with dynamic name if needed
                  })
                }
                onMouseOut={() => setTooltipContent(null)}
                onClick={() => handleMarkerClick(currentLocation)} // Open popup on click
              />
            )}
    {selectedDriver && driverHistory.length > 0 && (
        <Polyline path={driverHistory} options={polylineOptions} />
      )}
            {pickupLocation && (
              <Marker
                position={pickupLocation}
                label="Pickup"
                icon="http://maps.google.com/mapfiles/ms/icons/green-dot.png"
              />
            )}
            {dropoffLocation && (
              <Marker
                position={dropoffLocation}
                label="Dropoff"
                icon="http://maps.google.com/mapfiles/ms/icons/red-dot.png"
              />
            )}
         
         {pickupLocation && dropoffLocation && (
        <>
          {/* Render Directions */}
          {directionsResponse && (
            <DirectionsRenderer
              options={{
                directions: directionsResponse,
              }}
            />
          )}
        </>
      )}



            {selectedMarker && infoWindowVisible && (
              <InfoWindow
                position={selectedMarker}
                onCloseClick={handleCloseInfoWindow}
              >
                <div>
                  <div className="font-semibold">{selectedDriver1.name}</div>
                  <div>Speed: {selectedDriver.speed}</div>
                  <div>Place: {tooltipContent?.place || tooltipContent?.content || 'Loading place...'}</div>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboardMap;
