import React, { useEffect, useState, useRef } from 'react';
import { GoogleMap, LoadScript, Marker, Polyline, OverlayView } from '@react-google-maps/api';
import io from 'socket.io-client';

const mapContainerStyle = {
  width: '100%',
  height: '100vh',
};

const initialCenter = { lat: 20.5937, lng: 78.9629 }; // Center of India

const calculateDistance = (prevLocation, newLocation) => {
  const R = 6371; // Radius of Earth in km
  const latDiff = ((newLocation.lat - prevLocation.lat) * Math.PI) / 180;
  const lngDiff = ((newLocation.lng - prevLocation.lng) * Math.PI) / 180;

  const a =
    Math.sin(latDiff / 2) * Math.sin(latDiff / 2) +
    Math.cos((prevLocation.lat * Math.PI) / 180) *
      Math.cos((newLocation.lat * Math.PI) / 180) *
      Math.sin(lngDiff / 2) *
      Math.sin(lngDiff / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

const MapComponent = () => {
  const [locations, setLocations] = useState([]);
  const [distances, setDistances] = useState({});
  const locationHistories = useRef({}); // Use `useRef` to store paths without triggering re-renders

  useEffect(() => {
    const fetchInitialLocations = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/locations`);
        const data = await response.json();
        setLocations(data);

        // Initialize location histories
        data.forEach((location) => {
          const userId = location.userId?._id;
          if (!locationHistories.current[userId]) {
            locationHistories.current[userId] = [
              { lat: location.location.coordinates[1], lng: location.location.coordinates[0] },
            ];
          }
        });
      } catch (error) {
        console.error('Error fetching initial locations:', error);
      }
    };

    fetchInitialLocations();

    // Listen for real-time location updates
    const socket = io(`${process.env.REACT_APP_API_URL}`);
    socket.on('changeLocation', (data) => {
      setLocations((prevLocations) => {
        const existingLocationIndex = prevLocations.findIndex((loc) => loc.userId === data.userId);
        const updatedLocations = [...prevLocations];
        const newLocation = {
          userId: data.userId,
          location: {
            type: 'Point',
            coordinates: [data.longitude, data.latitude],
          },
        };

        if (existingLocationIndex !== -1) {
          const prevLocation = updatedLocations[existingLocationIndex];
          const distanceCovered = calculateDistance(
            {
              lat: prevLocation.location.coordinates[1],
              lng: prevLocation.location.coordinates[0],
            },
            { lat: data.latitude, lng: data.longitude }
          );

          // Update existing location
          updatedLocations[existingLocationIndex] = newLocation;

          // Update distances
          setDistances((prevDistances) => ({
            ...prevDistances,
            [data.userId]: (prevDistances[data.userId] || 0) + distanceCovered,
          }));
        } else {
          // New user location
          updatedLocations.push(newLocation);
          setDistances((prevDistances) => ({
            ...prevDistances,
            [data.userId]: 0,
          }));
        }

        // Append to location history
        locationHistories.current[data.userId] = [
          ...(locationHistories.current[data.userId] || []),
          { lat: data.latitude, lng: data.longitude },
        ];

        return updatedLocations;
      });
    });

    return () => socket.off('changeLocation');
  }, []);

  return (
    <LoadScript googleMapsApiKey="AIzaSyClo2LZZ-ZoLAp-RPzfWDkzn_c7i6EGKDE">
      <GoogleMap mapContainerStyle={mapContainerStyle} center={initialCenter} zoom={5}>
        {locations.map((location) => (
          <React.Fragment key={location.userId}>
            <OverlayView
              position={{
                lat: location?.location?.coordinates[1],
                lng: location?.location?.coordinates[0],
              }}
              mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
            >
              <div className="user-label">{location.userId?.name}</div>
            </OverlayView>
            <Marker
              position={{
                lat: location?.location?.coordinates[1],
                lng: location?.location?.coordinates[0],
              }}
              icon={{
                url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                scaledSize: new window.google.maps.Size(30, 30),
              }}
            />
          </React.Fragment>
        ))}
        {Object.keys(locationHistories.current).map((userId) => (
          <Polyline
            key={userId}
            path={locationHistories.current[userId]}
            options={{
              strokeColor: '#FF0000',
              strokeOpacity: 0.8,
              strokeWeight: 2,
            }}
          />
        ))}
      </GoogleMap>
    </LoadScript>
  );
};

export default MapComponent;
