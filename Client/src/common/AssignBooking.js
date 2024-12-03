"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";

const AssignDriverPage = () => {
  const [drivers1, setDrivers1] = useState([]); // Drivers list (Completed Drivers)
  const [bookings1, setBookings1] = useState([]); // Pending bookings list
  const [selectedBooking1, setSelectedBooking1] = useState(""); // Selected booking
  const [selectedDriver1, setSelectedDriver1] = useState(""); // Selected driver
  const [selectedDate, setSelectedDate] = useState(""); // Selected date
  const [loadingBookings, setLoadingBookings] = useState(false); // Loading state for bookings
  const [loadingDrivers, setLoadingDrivers] = useState(false); // Loading state for drivers
  const [message, setMessage] = useState("");
  const token = localStorage.getItem('token');

  const axiosInstance = axios.create({
    baseURL: `${process.env.REACT_APP_API_URL}/api/booking`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  // Fetch pending bookings when the component is loaded (no date required)
  useEffect(() => {
    const fetchPendingBookings = async () => {
      setLoadingBookings(true); // Start loading for bookings
      try {
        const bookingsResponse = await axiosInstance.get("/bookings");
        setBookings1(bookingsResponse.data.bookings);
      } catch (error) {
        console.error("Error fetching bookings:", error);
        setBookings1([]); // Handle error
      } finally {
        setLoadingBookings(false); // Stop loading for bookings
      }
    };

    fetchPendingBookings();
  }, []); // Empty dependency array to trigger only once on component mount

  // Fetch available drivers when a booking is selected and a date is picked
  useEffect(() => {
    const fetchDrivers = async () => {
      if (selectedBooking1 && selectedDate) {
        setLoadingDrivers(true); // Start loading for drivers
        try {
          const driverResponse = await axiosInstance.get("/drivers", {
            params: { date: selectedDate },
          });
          setDrivers1(driverResponse.data.drivers);
        } catch (error) {
          console.error("Error fetching drivers:", error);
          setDrivers1([]); // Handle error
        } finally {
          setLoadingDrivers(false); // Stop loading for drivers
        }
      }
    };

    fetchDrivers();
  }, [selectedBooking1, selectedDate]); // Trigger fetch when selectedBooking1 or selectedDate changes

  // Handle assigning a driver to a booking
  const handleAssignDriver = async () => {
    if (!selectedBooking1 || !selectedDriver1) {
      setMessage("Please select both a booking and a driver.");
      return;
    }

    try {
      setMessage("");
      
      // Corrected API URL with both bookingId and driverId in the URL
      const response = await axiosInstance.put(`/bookings/${selectedBooking1}/assign-driver`,{
        driverId:selectedDriver1
      });
      
      setMessage(response.data.message);
      alert(response.data.message)
      setSelectedBooking1(""); // Clear booking selection
      setSelectedDriver1(""); // Clear driver selection
    } catch (error) {
      alert(error.response?.data?.message || "Failed to assign driver.");
      
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
  <h1 className="text-3xl font-semibold mb-6 text-center text-gray-800">Assign Driver</h1>

  {/* Pending Booking Dropdown */}
  <div className="mb-6">
    <label className="block text-gray-700 font-medium mb-2">Select Pending Booking</label>
    <select
      value={selectedBooking1}
      onChange={(e) => setSelectedBooking1(e.target.value)}
      required
      className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
    >
      <option value="">Select Booking</option>
      {loadingBookings ? (
        <option>Loading bookings...</option>
      ) : bookings1.length === 0 ? (
        <option>No bookings available</option>
      ) : (
        bookings1.map((booking) => (
          <option key={booking._id} value={booking._id}>
            {booking.customerName} booked {booking.vehicle?.name} from{' '}
            {new Date(booking.startDate).toLocaleDateString()} to{' '}
            {new Date(booking.endDate).toLocaleDateString()} status is:{booking.status}
          </option>
        ))
      )}
    </select>
  </div>

  {/* Date Picker */}
  {selectedBooking1 && (
    <div className="mb-6">
      <label className="block text-gray-700 font-medium mb-2">Select Date</label>
      <input
        type="date"
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)} // Update selected date
        className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
  )}

  {/* Completed Driver Dropdown */}
  {selectedDate && (
    <div className="mb-6">
      <label className="block text-gray-700 font-medium mb-2">Select Driver</label>
      <select
        value={selectedDriver1}
        onChange={(e) => setSelectedDriver1(e.target.value)}
        required
        disabled={loadingDrivers || !selectedBooking1}
        className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">Select Driver</option>
        {loadingDrivers ? (
          <option>Loading drivers...</option>
        ) : drivers1.length === 0 ? (
          <option>No drivers available</option>
        ) : (
          drivers1.map((driver) => (
            <option key={driver._id} value={driver._id}>
              {driver.name}
            </option>
          ))
        )}
      </select>
    </div>
  )}

  {/* Assign Driver Button */}
  <div className="mb-4">
    <button
      className={`w-full bg-blue-500 text-white py-3 rounded-lg font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
        loadingBookings || loadingDrivers || !selectedBooking1 || !selectedDriver1
          ? "opacity-50 cursor-not-allowed"
          : "hover:bg-blue-600"
      }`}
      onClick={handleAssignDriver}
      disabled={loadingBookings || loadingDrivers || !selectedBooking1 || !selectedDriver1}
    >
      {loadingBookings || loadingDrivers ? "Loading..." : "Assign Driver"}
    </button>
  </div>

  {/* Message (Success or Error) */}
  {message && (
    <p
      className={`mt-4 text-center ${
        message.includes("success") ? "text-green-500" : "text-red-500"
      }`}
    >
      {message}
    </p>
  )}
</div>

  );
};

export default AssignDriverPage;
