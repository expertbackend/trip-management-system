import React, { useEffect, useState, useRef } from 'react';
import { FaBell, FaCalendarAlt } from 'react-icons/fa';
import { io } from 'socket.io-client';

function Header({ clearNotifications }) {
  const [notifications, setNotifications] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showReminders, setShowReminders] = useState(false);
  const token = localStorage.getItem('token');
  const notificationRef = useRef(null);
  const reminderRef = useRef(null);
const tokenId = localStorage.getItem('tokenId')
  // const ws = new WebSocket("ws://localhost:8080");
  // ws.onopen = () => {

  //   console.log("Connected to WebSocket server");
  //   if (tokenId) {
  //     ws.send(JSON.stringify({ type: 'register', tokenId }));
  //     console.log("Token ID sent:", tokenId);
  //   } else {
  //     console.log("No tokenId found in localStorage");
  //   }
  // };
  
  // ws.onmessage = (event) => {
  //   const data = JSON.parse(event.data);
  //   if (data.type === "reminder") {
  //     console.log("New reminder received:", data);
  //     // Update the UI with the reminder
  //     showReminder(data);
  //   }
  // };

  // ws.onerror = (error) => {
  //   console.error("WebSocket error:", error);
  // };

  // ws.onclose = () => {
  //   console.log("WebSocket connection closed");
  // };

  const showReminder = (reminder) => {
    setReminders((prevReminders) => [reminder, ...prevReminders]);
  };

  const handleClickOutside = (event, container) => {
    if (container.current && !container.current.contains(event.target)) {
      setShowNotifications(false);
      setShowReminders(false);
    }
  };

  useEffect(() => {
    if (showNotifications) {
      document.addEventListener("mousedown", (e) => handleClickOutside(e, notificationRef));
    } else if (showReminders) {
      document.addEventListener("mousedown", (e) => handleClickOutside(e, reminderRef));
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showNotifications, showReminders]);

  // Socket.IO client setup
  const socket = io(process.env.REACT_APP_API_URL, {
    auth: {
      token: token,
    },
  });

  // Toggle notification dropdown
  const toggleNotifications = () => {
    setShowNotifications((prev) => !prev);
  };

  // Toggle reminder dropdown
  const toggleReminders = () => {
    setShowReminders((prev) => !prev);
  };

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
    fetchNotifications();

    socket.on('notification', (newNotification) => {
      console.log('New notification received:', newNotification);
      setNotifications((prevNotifications) => [newNotification, ...prevNotifications]);
    });

    return () => {
      socket.off('notification');
    };
  }, []);

  // Mark notification as read
  const handleNotificationClick = (index) => {
    setNotifications((prevNotifications) =>
      prevNotifications.map((notification, i) =>
        i === index ? { ...notification, read: true } : notification
      )
    );
  };

  // Mark reminder as read
  const handleReminderClick = (index) => {
    setReminders((prevReminders) =>
      prevReminders.map((reminder, i) =>
        i === index ? { ...reminder, read: true } : reminder
      )
    );
  };

  // Calculate unread notifications and reminders count
  const unreadNotificationsCount = notifications.filter((notification) => !notification.read).length;
  const unreadRemindersCount = reminders.filter((reminder) => !reminder.read).length;

  return (
    <div className="w-full h-16 bg-gray-50 text-black flex items-center justify-end px-4 shadow-md  relative">
      {/* Notification Icon */}
      <div className="relative">
        <button onClick={toggleNotifications} className="relative">
          <FaBell className="text-2xl sm:text-xl text-black cursor-pointer" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
              {unreadNotificationsCount}
            </span>
          )}
        </button>

        {showNotifications && (
          <div
            className="absolute right-0 mt-2 w-64 sm:w-48 bg-gray-800 text-white shadow-lg rounded-md p-3 z-10 max-w-xs h-[30vh] overflow-y-auto"
            ref={notificationRef}
          >
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
              </div>
            )}
          </div>
        )}
      </div>

    
    </div>
  );
}

export default Header;
