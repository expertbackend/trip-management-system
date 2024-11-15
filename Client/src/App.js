import React, { useEffect, useState, useRef } from 'react';
import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
import Login from './components/Login';
import OwnerDashboard from './components/OwnerDashboard';
import DriverDashboard from './components/DriverDashboard';
import OperatorDashboard from './components/OperatorDashboard';
import Sidebar from './components/Sidebar';
import Register from './components/Register';
import Home from './common/Home';
import { requestFCMToken } from './utils/firebaseUtils';
import { getMessaging, onMessage } from 'firebase/messaging';
import Header from './common/Header';
import { io } from 'socket.io-client';
import MapComponent from './components/Map';
import UserPage from './components/UserPage';
import VehicleTable from './components/VehiclePage';
import BookingPage from './components/BookingPage';
import ProfilePage from './components/ProfilePage';

function App() {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const location = useLocation();
  const [fcmToken, setFcmToken] = useState(null);
  const tokenSavedRef = useRef(false);
  const token = localStorage.getItem('token')
  const [permissionDenied, setPermissionDenied] = useState(false);

  // Socket.IO setup
  const socket = io(`${process.env.REACT_APP_API_URL}`, {
    auth: {
      token: token, // Replace this with the actual token
    },
  });  const userId = 'user123'; // Replace with dynamic user ID as needed
  const [locations, setLocations] = useState({});

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const token = await requestFCMToken();
        setFcmToken(token);
        if (token) {
          localStorage.setItem('deviceToken', token);
        }
        if (!tokenSavedRef.current) {
          tokenSavedRef.current = true;
        }
      } catch (error) {
        console.log('Error fetching token:', error);
      }
    };

    fetchToken();
  }, []);

  const clearNotifications = () => {
    setNotifications([]);
  };

  // Listen for incoming FCM messages
  useEffect(() => {
    const messaging = getMessaging();
    const unsubscribe = onMessage(messaging, (payload) => {
      alert(`Notification Title: ${payload.notification.title}\nMessage: ${payload.notification.body}`);
      setNotifications((prevNotifications) => [
        ...prevNotifications,
        {
          title: payload.notification.title,
          body: payload.notification.body,
          timestamp: new Date().toLocaleString(),
        },
      ]);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const userRole = localStorage.getItem('role');
    setRole(userRole);
    setLoading(false);
  }, []);

  // Private route component
  const PrivateRoute = ({ component: Component }) => {
    return role ? <Component /> : <Navigate to="/login" />;
  };

  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  // Start tracking location
  const startTracking = async () => {
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported by this browser.');
      return;
    }

    try {
      const permissionStatus = await navigator.permissions.query({ name: 'geolocation' });

      if (permissionStatus.state === 'denied') {
        setPermissionDenied(true); // Set permissionDenied to true if permission is denied
        return;
      }

      // Request location if permission is promptable or granted
      navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          console.log(`Latitude: ${latitude}, Longitude: ${longitude}, Accuracy: ${accuracy} meters`);

          // Emit location data to the server
          socket.emit('sendLocation', { userId, latitude, longitude, accuracy });
        },
        (error) => {
          console.error('Error obtaining location:', error);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 30000,
        }
      );

    } catch (error) {
      console.error('Error checking location permissions:', error);
    }
  };



  // Listen for location updates from the server
  useEffect(() => {
    socket.on('changeLocation', (data) => {
      console.log('data',data)

      setLocations((prevLocations) => ({
        ...prevLocations,
        [data.userId]: { latitude: data.latitude, longitude: data.longitude },
      }));
    });

    // Start tracking the location when the component mounts
    startTracking();

    return () => {
      socket.disconnect();
    };
  }, [socket]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="app flex">
    {permissionDenied ? (
      <div>Please allow location permission to use this website.</div>
    ) : (
      <>
        {!isAuthPage && <Sidebar role={role} notifications={notifications} />}
        <div className="content flex-grow">
          {!isAuthPage && <Header notifications={notifications} clearNotifications={clearNotifications} />}
          
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/details" element={<Home />} />
            <Route path="/signup" element={<Register />} />
            <Route path="/owner-dashboard" element={<PrivateRoute component={OwnerDashboard} />} />
            <Route path="/driver-dashboard" element={<PrivateRoute component={DriverDashboard} />} />
            <Route path="/operator-dashboard" element={<PrivateRoute component={OperatorDashboard} />} />
            <Route path="/user" element={<PrivateRoute component={UserPage} />} />
            <Route path="/vehicle" element={<PrivateRoute component={VehicleTable} />} />
            <Route path="/booking" element={<PrivateRoute component={BookingPage} />} />
            <Route path="/profile" element={<PrivateRoute component={ProfilePage} />} />

          </Routes>
  
          {/* <div>
            <ul>
              {Object.entries(locations).map(([userId, coords]) => (
                <li key={userId}>
                  {userId}: {coords.latitude}, {coords.longitude}
                </li>
              ))}
            </ul>
          </div> */}
        </div>
      </>
    )}
  </div>
  
  );
}

export default App;
