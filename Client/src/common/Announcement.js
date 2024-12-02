import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Announcements = () => {
  const [reminders, setReminders] = useState([]); // State to store reminders
  const [loading, setLoading] = useState(true); // State to manage loading state
  const [currentPage, setCurrentPage] = useState(1); // Current page state
  const [totalPages, setTotalPages] = useState(1); // Total number of pages
  const remindersPerPage = 5; // Number of reminders per page
  const tokenId = localStorage.getItem('tokenId'); // Get tokenId from localStorage
  const token = localStorage.getItem('token');

  const axiosInstance = axios.create({
    baseURL: `${process.env.REACT_APP_API_URL}/api/tyre`, // Set your base URL from environment variable
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  // Fetch all reminders from the backend API with pagination
  const fetchReminders = async () => {
    try {
      setLoading(true);

      // Fetch reminders with pagination parameters
      const response = await axiosInstance.get('/reminders', {
        params: {
          page: currentPage,
          limit: remindersPerPage,
        },
      });

      // If the request was successful, update the state with the reminders
      if (response.status === 200) {
        setReminders(response.data); // Set the fetched reminders to the state
        // Set total pages based on the number of reminders
        setTotalPages(Math.ceil(response.data.length / remindersPerPage)); 
      } else {
        console.error('Failed to fetch reminders:', response.data.message);
      }
    } catch (error) {
      console.error('Error fetching reminders:', error);
    } finally {
      setLoading(false);
    }
  };

  // WebSocket for real-time updates
  useEffect(() => {
    if (!tokenId) {
      console.log('No tokenId found in localStorage');
      return; // Do not create WebSocket connection if token is missing
    }

    // Initialize WebSocket connection
    const ws = new WebSocket('wss://trip-management-system-1.onrender.com');

    // On connection open
    ws.onopen = () => {
      console.log('Connected to WebSocket server');
      ws.send(JSON.stringify({ type: 'register', tokenId })); // Send tokenId to register with WebSocket server
      console.log('Token ID sent:', tokenId);
    };

    // On receiving a message
    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'reminder') {
          console.log('New reminder received:', data);
      
          // Create a reminder object matching the expected structure
          const newReminder = {
            _id: new Date().toISOString(), // Generate a unique ID (or use a real one if provided)
            reminderMessage: data.message,
            // Add other default properties if necessary
          };
      
          // Add the new reminder to the state
          setReminders((prevReminders) => {
            const updatedReminders = [newReminder, ...prevReminders];
            // Update total pages after updating the reminders state
            setTotalPages(Math.ceil(updatedReminders.length / remindersPerPage));
            return updatedReminders;
          });
        }
      };

    // On WebSocket error
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    // On WebSocket close
    ws.onclose = () => {
      console.log('WebSocket connection closed');
    };

    // Cleanup WebSocket connection when component unmounts
    return () => {
      ws.close();
    };
  }, [tokenId]); // Only run effect when tokenId changes

  // Paginate reminders based on the current page
  const paginateReminders = () => {
    const startIndex = (currentPage - 1) * remindersPerPage;
    const endIndex = startIndex + remindersPerPage;
    return reminders.slice(startIndex, endIndex);
  };

  // Handle page change (Previous/Next)
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage); // Update the current page state
    }
  };

  // Fetch reminders when the page changes
  useEffect(() => {
    fetchReminders();
  }, [currentPage]); // Refetch reminders when page changes

  return (
    <div className="announcement-page bg-gradient-to-b from-white to-blue-100 min-h-screen p-8 flex flex-col items-center">
    <h1 className="text-4xl font-extrabold text-center mb-10 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 animate-fade-in">
      🚀 Real-Time Announcements
    </h1>
  
    {loading ? (
      <div className="text-center text-xl text-gray-600 animate-pulse">
        Fetching reminders...
      </div>
    ) : (
      <div className="w-full max-w-3xl">
        {reminders.length === 0 ? (
          <p className="text-center text-gray-500 italic text-lg">
            No reminders available. Please check back later!
          </p>
        ) : (
          <div>
            {/* Display all reminders */}
            <h2 className="text-2xl font-semibold mb-6 text-gray-800 border-b-4 border-blue-400 inline-block animate-slide-in">
              📋 All Reminders
            </h2>
  
            <div className="space-y-6">
              {paginateReminders().map((reminder, index) => (
                <div
                  key={reminder._id}
                  className={`p-6 bg-gradient-to-r from-blue-100 to-purple-100 text-gray-800 rounded-lg shadow-md transform transition-all duration-300 ${
                    index % 2 === 0 ? 'animate-fade-in-left' : 'animate-fade-in-right'
                  } hover:scale-105 hover:shadow-lg`}
                >
                  <h2 className="font-semibold text-xl">{reminder.reminderMessage}</h2>
                </div>
              ))}
            </div>
  
            {/* Pagination Controls */}
            <div className="pagination mt-10 flex justify-center items-center space-x-4">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-6 py-2 bg-blue-500 text-white rounded-l-lg shadow-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-gray-700 text-lg">
                Page <span className="font-bold text-gray-800">{currentPage}</span> of{' '}
                <span className="font-bold text-gray-800">{totalPages}</span>
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-6 py-2 bg-blue-500 text-white rounded-r-lg shadow-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    )}
  </div>
  
  
  
  );
};

export default Announcements;
