import React, { useEffect, useState, useRef } from 'react';
import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
import {
  Login,
  OwnerDashboard,
  DriverDashboard,
  OperatorDashboard,
  Sidebar,
  Register,
  UserPage,
  VehicleTable,
  BookingPage,
  ProfilePage,
} from './components';
import Header from './common/Header';
import Home from './common/Home';
import MapComponent from './components/Map';
import { requestFCMToken } from './utils/firebaseUtils';
import { getMessaging, onMessage } from 'firebase/messaging';
import { io } from 'socket.io-client';

function App() {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [fcmToken, setFcmToken] = useState(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [locations, setLocations] = useState({});
  const tokenSavedRef = useRef(false);

  const location = useLocation();
  const token = localStorage.getItem('token');
  const userId = 'user123'; // Replace with dynamic user ID as needed
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  // Initialize socket
  const socket = useRef(
    io(`${process.env.REACT_APP_API_URL}`, {
      auth: { token },
    })
  ).current;

  // Fetch FCM Token
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const token = await requestFCMToken();
        if (token) {
          setFcmToken(token);
          localStorage.setItem('deviceToken', token);
          tokenSavedRef.current = true;
        }
      } catch (error) {
        console.error('Error fetching FCM token:', error);
      }
    };
    fetchToken();
  }, []);

  // Listen for FCM messages
  useEffect(() => {
    const messaging = getMessaging();
    const unsubscribe = onMessage(messaging, (payload) => {
      alert(`Notification: ${payload.notification.title}\n${payload.notification.body}`);
      setNotifications((prev) => [
        ...prev,
        {
          title: payload.notification.title,
          body: payload.notification.body,
          timestamp: new Date().toLocaleString(),
        },
      ]);
    });

    return () => unsubscribe();
  }, []);

  // Load user role from local storage
  useEffect(() => {
    const userRole = localStorage.getItem('role');
    setRole(userRole);
    setLoading(false);
  }, []);

  // Start location tracking
  const startTracking = async () => {
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported by this browser.');
      return;
    }

    try {
      const permissionStatus = await navigator.permissions.query({ name: 'geolocation' });
      if (permissionStatus.state === 'denied') {
        setPermissionDenied(true);
        return;
      }

      navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          console.log(`Latitude: ${latitude}, Longitude: ${longitude}, Accuracy: ${accuracy}`);
          socket.emit('sendLocation', { userId, latitude, longitude, accuracy });
        },
        (error) => console.error('Error obtaining location:', error),
        { enableHighAccuracy: true, maximumAge: 0, timeout: 30000 }
      );
    } catch (error) {
      console.error('Error checking location permissions:', error);
    }
  };

  // Handle incoming location updates
  useEffect(() => {
    const handleLocationUpdate = (data) => {
      console.log('Location update:', data);
      setLocations((prev) => ({
        ...prev,
        [data.userId]: { latitude: data.latitude, longitude: data.longitude },
      }));
    };

    socket.on('changeLocation', handleLocationUpdate);

    // Start location tracking when the component mounts
    startTracking();

    return () => {
      socket.off('changeLocation', handleLocationUpdate);
      socket.disconnect();
    };
  }, [socket]);

  // Clear notifications
  const clearNotifications = () => setNotifications([]);

  // Private route component
  const PrivateRoute = ({ component: Component }) => {
    return role ? <Component /> : <Navigate to="/login" />;
  };

  // Show loading spinner until user role is determined
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
            {!isAuthPage && (
              <Header notifications={notifications} clearNotifications={clearNotifications} />
            )}
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Register />} />
              <Route path="/details" element={<Home />} />
              <Route path="/owner-dashboard" element={<PrivateRoute component={OwnerDashboard} />} />
              <Route path="/driver-dashboard" element={<PrivateRoute component={DriverDashboard} />} />
              <Route path="/operator-dashboard" element={<PrivateRoute component={OperatorDashboard} />} />
              <Route path="/user" element={<PrivateRoute component={UserPage} />} />
              <Route path="/vehicle" element={<PrivateRoute component={VehicleTable} />} />
              <Route path="/booking" element={<PrivateRoute component={BookingPage} />} />
              <Route path="/profile" element={<PrivateRoute component={ProfilePage} />} />
            </Routes>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
