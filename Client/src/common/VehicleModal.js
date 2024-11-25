import React, { useState, useEffect } from "react";
import axios from "axios";
import Modal from "../components/Modal";
import Slider from "react-slick"; // For carousel functionality
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const VehicleModal = ({ isOpen, onClose, vehicle, mode }) => {
    
    const [vehicleData, setVehicleData] = useState(vehicle);
    const token = localStorage.getItem('token');
    const axiosInstance = axios.create({
        baseURL: `${process.env.REACT_APP_API_URL}/api/owner`,
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    useEffect(() => {
        setVehicleData(vehicle); // Update vehicle data when it changes
    }, [vehicle]);

    // Handle vehicle data update in edit mode
    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setVehicleData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Handle form submission for updating vehicle
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // Make API call to update the vehicle
            const response = await axiosInstance.put(
                `/vehicle/${vehicleData._id}`, // Endpoint for the vehicle update
                vehicleData
            );

            if (response.status === 200) {
                // Successfully updated the vehicle
                alert('Vehicle updated successfully!');
                onClose(); // Close the modal
            }
        } catch (error) {
            console.error("Error updating vehicle:", error);
            alert('Error updating vehicle');
        }
    };

    // Carousel settings for Bookings
    const carouselSettings = {
        dots: true,             // Show dots for navigation
        infinite: true,         // Infinite looping
        speed: 500,             // Speed of the transition
        slidesToShow: 1,        // Show one slide at a time
        slidesToScroll: 1,      // Scroll one slide at a time
        arrows: true,           // Display navigation arrows
        autoplay: true,         // Autoplay slides
        autoplaySpeed: 3000,    // Time between slides (3 seconds)
        fade: false,            // Disable fading for better 3D effect compatibility
        pauseOnHover: true,     // Pause autoplay when hovering
        adaptiveHeight: true,   // Adjust height dynamically for each slide
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
                                value={vehicleData.name}
                                onChange={handleEditChange}
                                className="w-full mt-2 p-2 border border-gray-300 rounded-md"
                            />
                        ) : (
                            <p className="w-full mt-2 p-2 border border-gray-300 rounded-md">{vehicleData.name}</p>
                        )}
                    </div>

                    {/* Plate Number */}
                    <div className="mb-6">
                        <label className="block text-gray-700">Plate Number</label>
                        {mode === "edit" ? (
                            <input
                                type="text"
                                name="plateNumber"
                                value={vehicleData.plateNumber}
                                onChange={handleEditChange}
                                className="w-full mt-2 p-2 border border-gray-300 rounded-md"
                            />
                        ) : (
                            <p className="w-full mt-2 p-2 border border-gray-300 rounded-md">{vehicleData.plateNumber}</p>
                        )}
                    </div>

                    {/* Vehicle Status */}
                    <div className="mb-6">
                        <label className="block text-gray-700">Status</label>
                        {mode === "edit" ? (
                            <input
                                type="text"
                                name="status"
                                value={vehicleData.status}
                                onChange={handleEditChange}
                                className="w-full mt-2 p-2 border border-gray-300 rounded-md"
                            />
                        ) : (
                            <p className="w-full mt-2 p-2 border border-gray-300 rounded-md">{vehicleData.status}</p>
                        )}
                    </div>

                    {/* Driver Info */}
                    <div className="mb-6">
                        <label className="block text-gray-700">Driver Name</label>
                        <p className="w-full mt-2 p-2 border border-gray-300 rounded-md">{vehicleData.driver?.name}</p>
                    </div>

                    <div className="mb-6">
                        <label className="block text-gray-700">Driver Phone</label>
                        <p className="w-full mt-2 p-2 border border-gray-300 rounded-md">{vehicleData.driver?.phoneNumber}</p>
                    </div>

                    {/* Bookings as Carousel */}
                    {vehicleData.bookings?.length > 0 && (
    <div className="mb-6">
        <label className="block text-3xl font-semibold text-gray-900 mb-6">Bookings</label>
        <Slider {...carouselSettings}>
            {vehicleData.bookings.map((booking, index) => (
                <div
                    key={booking._id}
                    className="relative w-full h-96 bg-gradient-to-r from-indigo-500 via-purple-400 to-pink-500 rounded-3xl overflow-hidden shadow-xl transform transition-transform duration-500 hover:scale-105 hover:shadow-2xl"
                >
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent p-6 flex flex-col justify-start items-start space-y-4">
                        <div className="text-2xl font-bold text-white">{booking.bookingId._id}</div>

                        {/* Customer Name and Info */}
                        <div className="flex items-center space-x-2 text-lg text-white font-medium">
                            <span className="text-xl">👤</span>
                            <span>Customer: <span className="font-semibold">{booking.bookingId.customerName}</span></span>
                        </div>

                        {/* Phone Number */}
                        <div className="flex items-center space-x-2 text-lg text-white font-medium">
                            <span className="text-xl">📞</span>
                            <span>{booking.bookingId.custPhNo}</span>
                        </div>

                        {/* Email Address */}
                        <div className="flex items-center space-x-2 text-lg text-white font-medium">
                            <span className="text-xl">📧</span>
                            <span>{booking.bookingId.custEmailId}</span>
                        </div>

                        {/* Pickup and Dropoff Locations */}
                        <div className="flex items-center space-x-2 text-lg text-white font-medium">
                            <span className="text-xl">📍</span>
                            <span>Pickup: <span className="font-semibold">{booking.bookingId?.pickupLocation?.address}</span></span>
                        </div>
                        <div className="flex items-center space-x-2 text-lg text-white font-medium">
                            <span className="text-xl">🚗</span>
                            <span>Dropoff: <span className="font-semibold">{booking.bookingId?.dropOffLocation?.address}</span></span>
                        </div>

                        {/* Dates */}
                        <div className="text-sm text-white">
                            <span className="font-semibold">Start Date:</span> {new Date(booking.startDate).toLocaleString()}
                        </div>
                        <div className="text-sm text-white">
                            <span className="font-semibold">End Date:</span> {new Date(booking.endDate).toLocaleString()}
                        </div>
                    </div>

                    {/* Overlay for better text visibility */}
                    <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-black opacity-40"></div>

                    {/* Add subtle icon animation for extra interactivity */}
                    <div className="absolute bottom-4 right-4 text-2xl text-white opacity-60 hover:opacity-100 transition-opacity duration-300">
                        <span>🔄</span>
                    </div>
                </div>
            ))}
        </Slider>
    </div>
)}




                    {/* Button to Close */}
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full bg-green-600 text-white py-2 rounded-full"
                    >
                        Close
                    </button>

                    {/* Only show the Save button in edit mode */}
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
