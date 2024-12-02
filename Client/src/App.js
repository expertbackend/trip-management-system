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
import ViewExpenses from './components/ViewExpanses';
import AddExpenses from './components/AddExpanse';
import CreateBooking from './common/CreateBooking';
import BookingsPage from './common/BookingPage';
import AssignDriverPage from './common/AssignBooking';
import TripReport from './common/TripReport';
import ProfilePage from './common/ProfilePage';
import SuperAdminPage from './common/SuperAdmin';
import VehicleManagement from './common/VehicleManagement';
import Announcements from './common/Announcement';

function App() {
  const [role, setRole] = useState(null);
  const [name, setName] = useState(null);
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
  socket.on('reminder', (data) => {
    console.log('New reminder received:', data);

    
  });
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
    const userName = localStorage.getItem('developer');
    setRole(userRole);
    setName(userName)
    setLoading(false);
    startTracking();
  }, []);
  useEffect(() => {
    const correctPassword = "developer"; // Replace with your desired password
    let isRightClickEnabled = false;
  
    const handleRightClick = (event) => {
      if (!isRightClickEnabled) {
        event.preventDefault(); // Disable right-click by default
        const userPassword = prompt("Enter the password to enable right-click:");
        if (userPassword === correctPassword) {
          isRightClickEnabled = true;
          alert("Right-click enabled!");
        } else {
          alert("Incorrect password! Right-click is disabled.");
        }
      }
    };
  
    document.addEventListener("contextmenu", handleRightClick);
  
    // Cleanup the event listener when the component is unmounted
    return () => {
      document.removeEventListener("contextmenu", handleRightClick);
    };
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
  // useEffect(() => {
  //   const handleLocationUpdate = (data) => {
  //     console.log('Location update:', data);
  //     setLocations((prev) => ({
  //       ...prev,
  //       [data.userId]: { latitude: data.latitude, longitude: data.longitude },
  //     }));
  //   };

  //   socket.on('changeLocation', handleLocationUpdate);

  //   // Start location tracking when the component mounts
  //   startTracking();

  //   return () => {
  //     socket.off('changeLocation', handleLocationUpdate);
  //     socket.disconnect();
  //   };
  // }, [socket]);

  // Clear notifications
  const clearNotifications = () => setNotifications([]);

  // Private route component
  const PrivateRoute = ({ component: Component }) => {
    const token = localStorage.getItem('token')
    if(!token){
return <Navigate to ="/login"/>
    }
    return <Component/>
    // return token ? <Component /> : <Navigate to="/login" />;
  };

  // Show loading spinner until user role is determined
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="app flex max-h-[100vh] overflow-scroll ">
      {permissionDenied ? (
        <div>Please allow location permission to use this website.</div>
      ) : (
        <>
          {!isAuthPage && <Sidebar role={role} notifications={notifications} username={name}/>}
          <div className="content flex-grow overflow-scroll">
            {!isAuthPage && (
              <Header notifications={notifications} clearNotifications={clearNotifications} />
            )}
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Register />} />
              <Route path="/details" element={<PrivateRoute component={Home} />}  />
              <Route path="/owner-dashboard" element={<PrivateRoute component={OwnerDashboard} />} />
              <Route path="/driver-dashboard" element={<PrivateRoute component={DriverDashboard} />} />
              <Route path="/operator-dashboard" element={<PrivateRoute component={OperatorDashboard} />} />
              <Route path="/user" element={<PrivateRoute component={UserPage} />} />
              <Route path="/vehicle" element={<PrivateRoute component={VehicleTable} />} />
              <Route path="/booking" element={<PrivateRoute component={BookingPage} />} />
              <Route path="/view-expense" element={<PrivateRoute component={ViewExpenses} />} />
              <Route path="/add-expense" element={<PrivateRoute component={AddExpenses} />} />
              <Route path="/create-booking" element={<PrivateRoute component={CreateBooking} />} />
              <Route path="/view-booking" element={<PrivateRoute component={BookingsPage} />} />
              <Route path="/assign-booking" element={<PrivateRoute component={AssignDriverPage} />} />
              <Route path="/trip-report" element={<PrivateRoute component={TripReport} />} />
              <Route path="/profile" element={<PrivateRoute component={ProfilePage} />} />
              <Route path="/SuperAdmin" element={<PrivateRoute component={SuperAdminPage} />} />
              <Route path="/fms" element={<PrivateRoute component={VehicleManagement} />} />
              <Route path="/announcement" element={<PrivateRoute component={Announcements} />} />

            </Routes>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
