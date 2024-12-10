import React, { useState, useEffect } from "react";
import axios from "axios";
import Modal from "../components/Modal";
import Slider from "react-slick"; // For carousel functionality
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const VehicleModal = ({ isOpen, onClose, vehicle, mode }) => {
  const [vehicleData, setVehicleData] = useState(vehicle);
  const token = localStorage.getItem("token");

  const axiosInstance = axios.create({
    baseURL: `${process.env.REACT_APP_API_URL}/api/owner`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  useEffect(() => {
    setVehicleData(vehicle); // Update vehicle data when it changes
  }, [vehicle]);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setVehicleData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axiosInstance.put(
        `/vehicle/${vehicleData._id}`, // Ensure _id is valid
        vehicleData
      );

      if (response.status === 200) {
        alert("Vehicle updated successfully!");
        onClose(); // Close the modal
      }
    } catch (error) {
      console.error("Error updating vehicle:", error);
      alert("Error updating vehicle");
    }
  };

  const carouselSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    adaptiveHeight: true,
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-xl font-bold text-green-600 mb-6">
        {mode === "edit" ? "Edit Vehicle" : "View Vehicle"}
      </h2>

      {vehicleData ? (
        <form onSubmit={handleSubmit}>
          {/* Vehicle Name */}
          <div className="mb-6">
            <label className="block text-gray-700">Vehicle Name</label>
            {mode === "edit" ? (
              <input
                type="text"
                name="name"
                value={vehicleData?.name || ""}
                onChange={handleEditChange}
                className="w-full mt-2 p-2 border border-gray-300 rounded-md"
              />
            ) : (
              <p className="w-full mt-2 p-2 border border-gray-300 rounded-md">
                {vehicleData?.name || "N/A"}
              </p>
            )}
          </div>

          {/* Plate Number */}
          <div className="mb-6">
            <label className="block text-gray-700">Plate Number</label>
            {mode === "edit" ? (
              <input
                type="text"
                name="plateNumber"
                value={vehicleData?.plateNumber || ""}
                onChange={handleEditChange}
                className="w-full mt-2 p-2 border border-gray-300 rounded-md"
              />
            ) : (
              <p className="w-full mt-2 p-2 border border-gray-300 rounded-md">
                {vehicleData?.plateNumber || "N/A"}
              </p>
            )}
          </div>

          {/* Status */}
          <div className="mb-6">
            <label className="block text-gray-700">Status</label>
            <p className="w-full mt-2 p-2 border border-gray-300 rounded-md">
              {vehicleData?.status || "N/A"}
            </p>
          </div>

          {/* Driver Info */}
          <div className="mb-6">
            <label className="block text-gray-700">Driver Name</label>
            <p className="w-full mt-2 p-2 border border-gray-300 rounded-md">
              {vehicleData?.driver?.name || "N/A"}
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700">Driver Phone</label>
            <p className="w-full mt-2 p-2 border border-gray-300 rounded-md">
              {vehicleData?.driver?.phoneNumber || "N/A"}
            </p>
          </div>

          {/* Bookings as Carousel */}
          {vehicleData?.bookings?.length > 0 ? (
            <div className="mb-6">
              <label className="block text-3xl font-semibold text-gray-900 mb-6">
                Bookings
              </label>
              <Slider {...carouselSettings}>
                {vehicleData.bookings.map((booking, index) => (
                  <div
                    key={booking?._id || index}
                    className="relative w-full h-96 rounded-xl overflow-hidden shadow-md transform transition-transform duration-500 hover:scale-105"
                  >
                    {/* Booking Details */}
                    <div className="absolute inset-0 p-6 flex flex-col justify-start space-y-4 bg-white">
                      <div className="text-sm font-bold text-gray-900">
                        {booking?.bookingId?._id || "N/A"}
                      </div>
                      <div className="flex items-center space-x-2 text-lg text-gray-800 font-medium">
                        <span>Customer: </span>
                        <span>{booking?.bookingId?.customerName || "N/A"}</span>
                      </div>
                      <div className="text-sm text-gray-700">
                        <span className="font-semibold">Start Date:</span>{" "}
                        {booking?.startDate
                          ? new Date(booking.startDate).toLocaleString()
                          : "N/A"}
                      </div>
                      <div className="text-sm text-gray-700">
                        <span className="font-semibold">End Date:</span>{" "}
                        {booking?.endDate
                          ? new Date(booking.endDate).toLocaleString()
                          : "N/A"}
                      </div>
                    </div>
                  </div>
                ))}
              </Slider>
            </div>
          ) : (
            <p>No bookings available.</p>
          )}

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="w-full bg-green-600 text-white py-2 rounded-full"
          >
            Close
          </button>

          {/* Save Button for Edit Mode */}
          {mode === "edit" && (
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-full mt-4"
            >
              Save Changes
            </button>
          )}
        </form>
      ) : (
        <div>Loading...</div>
      )}
    </Modal>
  );
};

export default VehicleModal;
