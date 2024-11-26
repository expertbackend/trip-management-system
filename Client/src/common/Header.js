import React, { useEffect, useState,useRef } from 'react';
import { FaBell } from 'react-icons/fa';
import { io } from 'socket.io-client';

function Header({ clearNotifications }) {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const token = localStorage.getItem('token'); // Assuming you store the JWT token in localStorage
  const notificationRef = useRef(null);
  const handleClickOutside = (event) => {
    if (notificationRef.current && !notificationRef.current.contains(event.target)) {
      setShowNotifications(false); // Close the notification panel
    }
  };

  useEffect(() => {
    if (showNotifications) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside); // Cleanup
    };
  }, [showNotifications]);
  // Socket.IO client setup
  const socket = io(process.env.REACT_APP_API_URL, {
    auth: {
      token: token,  // Pass the token for authentication
    },
  });
 
  // Toggle notification dropdown
  const toggleNotifications = () => {
    setShowNotifications((prev) => !prev);
  };

  // Fetch all notifications from the server on initial load
  const fetchNotifications = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/firebase/getAllNotification`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      const data = await response.json();
      // Initially mark all notifications as unread
      const notificationsWithReadStatus = data.map((notification) => ({
        ...notification,
        read: false,
      }));
      setNotifications(notificationsWithReadStatus);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    fetchNotifications(); // Fetch notifications when the component mounts

    // Listen for new notifications from the server (real-time)
    socket.on('notification', (newNotification) => {
        console.log('New notification received:', newNotification);

      setNotifications((prevNotifications) => [newNotification, ...prevNotifications]);
    });

    return () => {
      socket.off('notification'); // Clean up the listener when the component is unmounted
    };
  }, []);

  // Mark a notification as read
  const handleNotificationClick = (index) => {
    setNotifications((prevNotifications) =>
      prevNotifications.map((notification, i) =>
        i === index ? { ...notification, read: true } : notification
      )
    );
  };

  // Calculate unread notifications count
  const unreadCount = notifications.filter((notification) => !notification.read).length;

  return (
    <div className="w-full h-16 bg-gray-900 text-white flex items-center justify-end px-4 shadow-md relative">
    {/* Notification Icon */}
    <div className="relative">
      <button onClick={toggleNotifications} className="relative">
        <FaBell className="text-2xl sm:text-xl text-white cursor-pointer" />
        {/* Display unread notification count */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>
  
      {/* Notifications Dropdown */}
      {showNotifications && (
        <div className="absolute right-0 mt-2 w-64 sm:w-48 bg-gray-800 text-white shadow-lg rounded-md p-3 z-10 max-w-xs h-[30vh] overflow-y-auto"
        ref={notificationRef}>
          {notifications.length === 0 ? (
            <p className="text-sm">No notifications</p>
          ) : (
            <div>
              {notifications.map((notification, index) => (
                <div
                  key={index}
                  className={`p-2 border-b border-gray-700 last:border-b-0 ${notification.read ? 'opacity-50' : ''}`}
                  onClick={() => handleNotificationClick(index)}
                >
                  <h4 className="font-semibold text-sm sm:text-base">{notification.title}</h4>
                  <p className="text-xs sm:text-sm text-gray-400">{notification.body}</p>
                  <small className="text-xs text-gray-500">
                    {new Date(notification.timestamp).toLocaleString()}
                  </small>
                </div>
              ))}
              <button
                onClick={clearNotifications}
                className="mt-2 text-blue-400 hover:underline text-xs sm:text-sm"
              >
                Clear All
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  </div>
  
  );
}

export default Header;
