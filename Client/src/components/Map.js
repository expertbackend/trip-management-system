import React, { useEffect, useState } from 'react';
import { GoogleMap, LoadScript, Marker, Polyline, OverlayView } from '@react-google-maps/api';
import io from 'socket.io-client';

// Connect to the Socket.IO server
const socket = io(`${process.env.REACT_APP_API_URL}`); // Update with your server's URL

const mapContainerStyle = {
  width: '100%',
  height: '100vh',
};

const initialCenter = { lat: 20.5937, lng: 78.9629 }; // Center of India

const calculateDistance = (prevLocation, newLocation) => {
  const R = 6371; // Radius of the Earth in km
  const latDiff = ((newLocation.location.coordinates[1] - prevLocation.location.coordinates[1]) * Math.PI) / 180;
  const lngDiff = ((newLocation.location.coordinates[0] - prevLocation.location.coordinates[0]) * Math.PI) / 180;

  const a =
    Math.sin(latDiff / 2) * Math.sin(latDiff / 2) +
    Math.cos((prevLocation.location.coordinates[1] * Math.PI) / 180) *
      Math.cos((newLocation.location.coordinates[1] * Math.PI) / 180) *
      Math.sin(lngDiff / 2) *
      Math.sin(lngDiff / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

const MapComponent = () => {
  const [locations, setLocations] = useState([]);
  const [distances, setDistances] = useState({});
  const [locationHistories, setLocationHistories] = useState({});

  useEffect(() => {
    // Fetch initial locations from the server
    const fetchInitialLocations = async () => {
        try {
          const response = await fetch(`${process.env.REACT_APP_API_URL}/api/locations`);
          const data = await response.json();
          setLocations(data);
          console.log('locationhistory0', data);
      
          // Initialize location histories
          const histories = data.reduce((acc, location) => {
            console.log('jjjjjj',location.location.coordinates)
            const userId = location.userId?._id;
            const coords = location.location.coordinates;
          
            // Initialize the user's history if it doesn't exist
            if (!acc[userId]) {
              acc[userId] = new Set(); // Use a Set to store unique coordinates
            }
          
            // Add the coordinates to the Set
            acc[userId].add(coords.toString()); // Convert to string for uniqueness
          
            return acc;
          }, {});
          
          // Convert Set back to array
          for (const userId in histories) {
            histories[userId] = Array.from(histories[userId]).map(coord => {
              const [lng, lat] = coord.split(',').map(Number); // Split string back to coordinates
              return { lat, lng };
            });
          }
          
      
          console.log('locationhistory1', histories);
          setLocationHistories(histories);
        } catch (error) {
          console.error('Error fetching initial locations:', error);
        }
      };
      

    fetchInitialLocations();

    // Listen for real-time location updates
    socket.on('changeLocation', (data) => {
        setLocations((prevLocations) => {
          const existingLocationIndex = prevLocations.findIndex((loc) => loc.userId === data.userId);
          let updatedLocations = [...prevLocations];
      
          // Prepare the new location structure
          const newLocation = {
            userId: data.userId,
            location: {
              type: 'Point',
              coordinates: [data.longitude, data.latitude],
            },
          };
      
          if (existingLocationIndex !== -1) {
            const prevLocation = updatedLocations[existingLocationIndex];
            const distanceCovered = calculateDistance(prevLocation, newLocation);
      
            // Update existing location
            updatedLocations[existingLocationIndex] = newLocation;
      
            // Update distances
            setDistances((prevDistances) => ({
              ...prevDistances,
              [data.userId]: (prevDistances[data.userId] || 0) + distanceCovered,
            }));
      
            // Update location history
            setLocationHistories((prevHistories) => ({
              ...prevHistories,
              [data.userId]: [...(prevHistories[data.userId] || []), newLocation.location.coordinates],
            }));
          } else {
            // New user location
            updatedLocations.push(newLocation);
            setDistances((prevDistances) => ({
              ...prevDistances,
              [data.userId]: 0,
            }));
            setLocationHistories((prevHistories) => ({
              ...prevHistories,
              [data.userId]: [newLocation.location.coordinates],
            }));
          }
      
          return updatedLocations;
        });
      });
      
      console.log('Path for locationHistories:', locationHistories);

    return () => {
      socket.off('changeLocation');
    };
  }, []);
  
  console.log('distances', distances);

  return (
    <LoadScript googleMapsApiKey="AIzaSyClo2LZZ-ZoLAp-RPzfWDkzn_c7i6EGKDE">
      <GoogleMap mapContainerStyle={mapContainerStyle} center={initialCenter} zoom={5}>
        {locations.map((location) => (
          <React.Fragment key={location.userId}>
            <OverlayView
              position={{ lat: location?.location?.coordinates[1], lng: location?.location?.coordinates[0] }}
              mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
            >
              <div className="user-label">
                {location.userId?.name}
              </div>
            </OverlayView>
            <Marker
              position={{ lat: location?.location?.coordinates[1], lng: location?.location?.coordinates[0] }}
              icon={{
                url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png", // Default blue location pin
                scaledSize: new window.google.maps.Size(30, 30), // Adjust size if needed
              }}
            />
          </React.Fragment>
        ))}
        {Object.keys(locationHistories).map((userId) => {
          const path = locationHistories[userId].map((coords) => (
            console.log('coords', coords.lat),
            {
              lat: coords.lat, // Latitude
              lng: coords.lng, // Longitude
            }
          ));

          // Log the path for debugging
          console.log('Path for userId:', path);

          return (
            <Polyline
              key={userId}
              path={path}
              options={{
                strokeColor: '#FF0000',
                strokeOpacity: 0.8,
                strokeWeight: 2,
              }}
            />
          );
        })}
      </GoogleMap>
    </LoadScript>
  );
};

export default MapComponent;
