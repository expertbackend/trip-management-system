import React, { useState, useEffect } from "react";
import axios from "axios";
import Modal from "../components/Modal"; // Assuming Modal is a reusable component
import Slider from "react-slick"; // For carousel functionality
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const BookingModal = ({ isOpen, onClose, booking, mode }) => {
    console.log('booking',booking)
  const [bookingData, setBookingData] = useState(booking);
  const token = localStorage.getItem("token");
  const axiosInstance = axios.create({
    baseURL: `${process.env.REACT_APP_API_URL}/api/bookings`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  useEffect(() => {
    setBookingData(booking); // Update booking data when it changes
  }, [booking]);

  // Handle booking data update in edit mode
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setBookingData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission for adding or updating booking
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let response;
      if (mode === "edit") {
        response = await axiosInstance.put(
          `/booking/${bookingData._id}`, // Endpoint for booking update
          bookingData
        );
      } else {
        response = await axiosInstance.post(
          `/booking`, // Endpoint for adding a new booking
          bookingData
        );
      }

      if (response.status === 200) {
        alert(mode === "edit" ? "Booking updated successfully!" : "Booking added successfully!");
        onClose(); // Close the modal
      }
    } catch (error) {
      console.error("Error handling booking:", error);
      alert("Error handling booking");
    }
  };

  // Carousel settings for Bookings (if you want to display multiple bookings in a carousel)
  const carouselSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    autoplay: true,
    autoplaySpeed: 3000,
    fade: false,
    pauseOnHover: true,
    adaptiveHeight: true,
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="transform transition-all duration-500 ease-in-out max-w-3xl mx-auto">
    <div className="bg-white p-8 rounded-2xl shadow-lg border-t-4 border-green-600">
      <h2 className="text-4xl font-extrabold text-green-600 mb-6 text-center animate__animated animate__fadeIn">
        {mode === "edit" ? "Edit Booking" : mode === "view" ? "View Booking" : "Add New Booking"}
      </h2>
  
      {bookingData ? (
        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Customer Details Card */}
          <div className="bg-white p-8 rounded-xl shadow-lg border-t-4 border-indigo-600">
            <h3 className="text-3xl font-semibold text-gray-800 mb-6">Customer Details</h3>
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-lg">Customer Name:</span>
                <span className="font-semibold text-gray-800 text-lg">{bookingData.customerName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-lg">Phone Number:</span>
                <span className="font-semibold text-gray-800 text-lg">{bookingData.custPhNo}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-lg">Email:</span>
                <span className="font-semibold text-gray-800 text-lg">{bookingData.custEmailId}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-lg">Vehicle:</span>
                <span className="font-semibold text-gray-800 text-lg">{bookingData.vehicle.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-lg">Pickup Location:</span>
                <span className="font-semibold text-gray-800 text-lg">{bookingData.pickupLocation.address || "Same as below"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-lg">Dropoff Location:</span>
                <span className="font-semibold text-gray-800 text-lg">{bookingData.dropoffLocation?.address || "Default address"}</span>
              </div>
              {/* Total Fare */}
              <div className="flex justify-between items-center mt-6">
                <span className="text-gray-600 text-lg">Total Fare:</span>
                <span className="font-semibold text-green-600 text-xl">
                  {bookingData.totalEstimatedAmount ? `${bookingData.totalEstimatedAmount}` : "Calculating..."}
                </span>
              </div>
            </div>
          </div>
  
          {/* Booking Dates */}
          <div className="space-y-8">
            <div className="flex flex-col">
              <label className="text-gray-700 text-xl">Start Date</label>
              <input
                type="date"
                name="startDate"
                value={new Date(bookingData.startDate).toLocaleDateString("en-IN").split('/').reverse().join('-')}
                onChange={mode !== "view" ? handleEditChange : undefined}
                className="w-full mt-4 p-4 text-xl border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300"
                disabled={mode === "view"}
              />
            </div>
  
            <div className="flex flex-col">
              <label className="text-gray-700 text-xl">End Date</label>
              <input
                type="date"
                name="endDate"
                value={new Date(bookingData.endDate).toLocaleDateString("en-IN").split('/').reverse().join('-')}
                onChange={mode !== "view" ? handleEditChange : undefined}
                className="w-full mt-4 p-4 text-xl border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300"
                disabled={mode === "view"}
              />
            </div>
          </div>
  
          {/* Carousel for Bookings (optional) */}
          {bookingData.bookings && bookingData.bookings.length > 0 && (
            <div className="space-y-6">
              <label className="block text-4xl font-bold text-gray-900 mb-6">Bookings</label>
              <Slider {...carouselSettings}>
                {bookingData.bookings.map((bookingItem) => (
                  <div
                    key={bookingItem._id}
                    className="relative w-full h-96 bg-gradient-to-r from-indigo-600 via-purple-400 to-pink-500 rounded-3xl overflow-hidden shadow-2xl transform transition-transform duration-500 ease-in-out hover:scale-105"
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent p-6 flex flex-col justify-start items-start space-y-4">
                      <div className="text-2xl font-semibold text-white">{bookingItem.bookingId._id}</div>
                      <div className="text-lg text-white">Customer: {bookingItem.bookingId.customerName}</div>
                    </div>
                  </div>
                ))}
              </Slider>
            </div>
          )}
  
          {/* Action Buttons */}
          <div className="space-y-6">
            <button
              type="button"
              onClick={onClose}
              className="w-full py-4 bg-green-600 text-white rounded-xl font-semibold shadow-lg hover:bg-green-700 transition-all duration-300 transform hover:scale-105"
            >
              Close
            </button>
  
            {mode !== "view" && (
              <button
                type="submit"
                className="w-full py-4 bg-blue-600 text-white rounded-xl font-semibold shadow-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105"
              >
                {mode === "edit" ? "Save Changes" : "Add Booking"}
              </button>
            )}
          </div>
        </form>
      ) : (
        <div className="text-center text-gray-600 text-xl">Loading...</div>
      )}
    </div>
  </Modal>
  
  
  
  );
};

export default BookingModal;
