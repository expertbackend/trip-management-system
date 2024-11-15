import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import moment from 'moment';

const SOCKET_SERVER_URL = 'https://trip-management-system-1.onrender.com'; // Replace with your backend URL
const API_URL = 'https://trip-management-system-1.onrender.com'; // Replace with your backend API URL

function DriverDashboard() {
  const [notifications, setNotifications] = useState([]);
  const [todayBookings, setTodayBookings] = useState([]);
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [completedBookings, setCompletedBookings] = useState([]);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [loadingBookings, setLoadingBookings] = useState(false);

  // Modal states for ending bookings
  const [kmDriven, setKmDriven] = useState('');
  const [extraExpanse, setExtraExpanse] = useState('');
  const [description, setDescription] = useState('');
  const [currentBookingId, setCurrentBookingId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const handleCloseModal = () => setSelectedBooking(null);
  // Connect to Socket.IO
  useEffect(() => {
    const socket = io(SOCKET_SERVER_URL, {
      auth: {
        token: localStorage.getItem('token'),
      },
    });

    socket.on('notifyUpcomingBooking', (data) => {
      setNotifications((prev) => [
        ...prev,
        {
          title: 'Upcoming Booking Alert',
          body: `Booking ID ${data.bookingId} is starting in 15 minutes.`,
          timestamp: new Date().toISOString(),
          bookingId: data.bookingId,
        },
      ]);
    });

    socket.on('connect', () => setIsSocketConnected(true));
    socket.on('disconnect', () => setIsSocketConnected(false));

    return () => {
      socket.disconnect();
    };
  }, []);

  // Fetch bookings data
  useEffect(() => {
    const fetchBookings = async () => {
      setLoadingBookings(true);
      try {
        // Fetch all bookings
        const allBookingsResponse = await axios.get(`${API_URL}/api/booking/bookings1`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
  
        const allBookings = allBookingsResponse.data.bookings;
  
        if (allBookings) {
          // Get all date keys
          const dateKeys = Object.keys(allBookings);
  
          // Flatten bookings grouped by date into a single array
          const flattenedBookings = dateKeys.flatMap((date) => allBookings[date]);
  
          console.log('All Bookings:', flattenedBookings);
  
          // Filter bookings for today
          const today = moment().startOf('day');
          const endOfToday = moment().endOf('day');
  
          const todayBookingsFiltered = flattenedBookings.filter((booking) =>
            moment(booking.startDate).isBetween(today, endOfToday, null, '[]')
          );
  
          // Filter upcoming bookings
          const upcomingFiltered = flattenedBookings.filter((booking) =>
            moment(booking.startDate).isAfter(endOfToday)
          );
  
          // Filter completed bookings
          const completedFiltered = flattenedBookings.filter(
            (booking) => booking.status === 'completed'
          );
  
          console.log('Today Bookings:', todayBookingsFiltered);
          console.log('Upcoming Bookings:', upcomingFiltered);
          console.log('Completed Bookings:', completedFiltered);
  
          setTodayBookings(todayBookingsFiltered);
          setUpcomingBookings(upcomingFiltered);
          setCompletedBookings(completedFiltered);
        } else {
          console.error('No bookings found.');
        }
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setLoadingBookings(false);
      }
    };
  
    fetchBookings();
  }, []);
  
  
  

  // Start booking
  const handleStartBooking = async (bookingId) => {
    try {
      await axios.put(
        `${API_URL}/api/booking/start/${bookingId}`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setTodayBookings((prev) =>
        prev.map((b) => (b._id === bookingId ? { ...b, status: 'in-progress' } : b))
      );
    } catch (error) {
      console.error('Error starting booking:', error);
    }
  };

  // End booking with modal
  const handleEndBooking = (bookingId) => {
    setCurrentBookingId(bookingId);
    setShowModal(true);
  };

  const handleModalSubmit = async () => {
    if (!kmDriven || !extraExpanse) {
      alert('Please provide kilometers driven and extra expenses.');
      return;
    }
    try {
      const response = await axios.put(
        `${API_URL}/api/booking/end/${currentBookingId}`,
        { kmDriven: parseFloat(kmDriven), extraExpanse: parseFloat(extraExpanse), description },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setTodayBookings((prev) =>
        prev.map((b) =>
          b._id === currentBookingId ? { ...b, status: 'completed', profit: response.data.profit } : b
        )
      );
      setShowModal(false);
      setKmDriven('');
      setExtraExpanse('');
      setDescription('');
    } catch (error) {
      console.error('Error ending booking:', error);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-semibold text-center text-gray-800 mb-8">Driver Dashboard</h1>

      {/* Today's Bookings */}
      <div className="mb-8">
      <h2 className="text-2xl font-semibold text-gray-700 mb-6">
        Today's Bookings
      </h2>
      {loadingBookings ? (
        <p className="text-center text-gray-500">Loading bookings...</p>
      ) : todayBookings.length === 0 ? (
        <p className="text-center text-gray-600">No bookings for today.</p>
      ) : (
        todayBookings.map((booking) => (
          <div
            key={booking._id}
            onClick={() => setSelectedBooking(booking)}
            className="bg-white shadow-lg border border-gray-200 p-6 rounded-lg mb-4 transition-transform transform hover:scale-105 cursor-pointer"
          >
            <div className="flex justify-between items-center mb-4">
              <p className="text-lg font-medium text-gray-800">
                Booking ID: <span className="font-normal">{booking._id}</span>
              </p>
              <p className="text-lg font-medium text-gray-800">
              Start Date: <span className="font-normal">{moment(booking.startDate).format("dddd, MMMM Do YYYY, hh:mm A")}</span>
              </p>
              <p className="text-lg font-medium text-gray-800">
                Time:{" "}
                <span className="font-normal">
                  {moment(booking.startDate).format("hh:mm A")}
                </span>
              </p>
            </div>
            <p className="text-gray-700">
              <span className="font-semibold">Customer Name:</span>{" "}
              {booking.invoice.customerName}
            </p>
            <p className="text-lg font-medium text-gray-800">
              End Date: <span className="font-normal">{moment(booking.endDate).format("dddd, MMMM Do YYYY, hh:mm A")}</span>
              </p>
              <p className="text-lg font-medium text-gray-800">
  Duration:{" "}
  <span className="font-normal">
    {Math.max(
      moment(booking.endDate).diff(moment(booking.startDate), "days"), 
      1
    )}{" "}
    {Math.max(
      moment(booking.endDate).diff(moment(booking.startDate), "days"), 
      1
    ) === 1
      ? "day"
      : "days"}
  </span>
</p>
          </div>
        ))
      )}

      {/* Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg w-full max-w-lg shadow-lg relative">
            <button
              onClick={handleCloseModal}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              &times;
            </button>
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">
              Booking Details
            </h3>
            <div className="border-t border-gray-200 pt-4">
              <p className="text-gray-700">
                <span className="font-semibold">Booking ID:</span>{" "}
                {selectedBooking._id}
              </p>
              <p className="text-gray-700">
                <span className="font-semibold">Customer Name:</span>{" "}
                {selectedBooking.invoice.customerName}
              </p>
              <p className="text-gray-700">
                <span className="font-semibold">Estimated Amount:</span>{" "}
                {selectedBooking.invoice.finalAmount}
              </p>
              <p className="text-gray-700">
                <span className="font-semibold">Phone Number:</span>{" "}
                {selectedBooking.invoice.custPhNo}
              </p>
              <p className="text-gray-700">
                <span className="font-semibold">Email ID:</span>{" "}
                {selectedBooking.invoice.custEmailId}
              </p>
              <p className="text-gray-700">
                <span className="font-semibold">Vehicle No:</span>{" "}
                {selectedBooking.vehicle.plateNumber}
              </p>
              <p className="text-gray-700">
                <span className="font-semibold">Address:</span>{" "}
                {selectedBooking.invoice.custAddress}
              </p>
              <p className="text-gray-700">
                <span className="font-semibold">Start Date:</span>{" "}
                {moment(selectedBooking.startDate).format(
                  "MMMM Do YYYY, hh:mm A"
                )}
              </p>
              <p className="text-gray-700">
                <span className="font-semibold">End Date:</span>{" "}
                {moment(selectedBooking.endDate).format(
                  "MMMM Do YYYY, hh:mm A"
                )}
              </p>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              {selectedBooking.status === "assigned" && (
                <button
                  onClick={() => handleStartBooking(selectedBooking._id)}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                >
                  Start Booking
                </button>
              )}
              {selectedBooking.status === "in-progress" && (
                <button
                  onClick={() => handleEndBooking(selectedBooking._id)}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                >
                  End Booking
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>


      {/* Upcoming Bookings */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Upcoming Bookings</h2>
        {upcomingBookings.length === 0 ? (
          <p className="text-center text-gray-600">No upcoming bookings.</p>
        ) : (
          upcomingBookings.map((booking) => (
            <div key={booking._id} className="bg-white shadow-lg p-4 rounded-lg mb-4">
              <p>Booking ID: {booking._id}</p>
              <p>Start Time: {moment(booking.startDate).format('MMM DD, YYYY hh:mm A')}</p>
            </div>
          ))
        )}
      </div>

      {/* Completed Bookings */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Completed Bookings</h2>
        {completedBookings.length === 0 ? (
          <p className="text-center text-gray-600">No completed bookings.</p>
        ) : (
          completedBookings.map((booking) => (
            <div key={booking._id} className="bg-white shadow-lg p-4 rounded-lg mb-4">
              <p>Booking ID: {booking._id}</p>
              <p>Customer Name {booking.invoice.customerName}</p>
              <p>Profit: {booking.profit} Rupees</p>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">End Booking</h2>
            <input
              type="number"
              value={kmDriven}
              onChange={(e) => setKmDriven(e.target.value)}
              placeholder="Kilometers Driven"
              className="block w-full border border-gray-300 p-2 mb-4"
            />
            <input
              type="number"
              value={extraExpanse}
              onChange={(e) => setExtraExpanse(e.target.value)}
              placeholder="Extra Expenses"
              className="block w-full border border-gray-300 p-2 mb-4"
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
              className="block w-full border border-gray-300 p-2 mb-4"
            />
            <div className="flex justify-end">
              <button
                onClick={handleModalSubmit}
                className="bg-blue-600 text-white px-4 py-2 rounded mr-2"
              >
                Submit
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-400 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DriverDashboard;
