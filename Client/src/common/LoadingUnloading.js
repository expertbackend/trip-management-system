import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import Modal from "../components/Modal";

const LoadingUnloadingPage = () => {
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedBooking1, setSelectedBooking1] = useState(null);

  const [shortageWeight, setShortageWeight] = useState("");
  const [receivedRemainingAmount, setReceivedRemainingAmount] = useState("");
  const [extraExpanse, setExtraExpanse] = useState("");
  const [receivedMaterialWeight, setReceivedMaterialWeight] = useState("");
  const [remainingAmount, setRemainingAmount] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal visibility state
  const [modalAmount, setModalAmount] = useState(null); // Modal amount state

  const token = localStorage.getItem("token");

  const axiosInstance = axios.create({
    baseURL: `${process.env.REACT_APP_API_URL}/api/booking`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  // Fetch bookings
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await axiosInstance.get("/completedbookings");
        const formattedBookings = response.data.bookings.map((booking) => ({
          value: booking._id,
          label: `Booking #${booking._id} from ${booking.pickupLocation.address} to ${booking.dropoffLocation.address} on ${booking.startDate}`,
        }));
        setBookings(formattedBookings);
      } catch (err) {
        setError("Failed to fetch bookings");
      }
    };

    fetchBookings();
  }, []);

  // Fetch remaining amount and totalNetMaterialWeight
  useEffect(() => {
    const fetchRemainingAmount = async () => {
      if (!selectedBooking) return;

      try {
        const response = await axiosInstance.get(`/booking/${selectedBooking}`);
        const bookingData = response.data;
        setRemainingAmount(bookingData.remainingAmount);
        setSelectedBooking1(bookingData.totalNetMaterialWeight);
      } catch (err) {
        setError("Failed to fetch booking details");
      }
    };

    fetchRemainingAmount();
  }, [selectedBooking]);

  // Handle received material weight change
  const handleReceivedMaterialWeightChange = (e) => {
    const value = parseFloat(e.target.value);
    setReceivedMaterialWeight(value);
    if (selectedBooking1) {
      const calculatedShortageWeight = selectedBooking1 - value;
      setShortageWeight(calculatedShortageWeight > 0 ? calculatedShortageWeight : 0);
    }
  };

  // Submit unloading details
  const handleUnloadingSubmit = async () => {
    console.log('clickkkkkk111')
    try {
      if (!selectedBooking) return alert("Please select a booking.");
if(!shortageWeight || receivedRemainingAmount || extraExpanse ) return alert('Please fill the fields to create unloading details')
      const response = await axiosInstance.post(`/booking/${selectedBooking}/unloading`, {
        shortageWeight,
        receivedRemainingAmount: parseFloat(receivedRemainingAmount),
        extraExpanse: parseFloat(extraExpanse),
      });
console.log('data',response.data.message)
      setMessage(response.data.message);
      setModalAmount(response.data.remainingAmount);
      setIsModalOpen(true);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit unloading details");
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Loading & Unloading Management</h1>

      <div className="mb-6">
        <label className="block text-lg font-semibold mb-2">Select Booking</label>
        <Select
          options={bookings}
          onChange={(option) => setSelectedBooking(option?.value || null)}
          placeholder="Choose a Booking"
        />
      </div>

      {remainingAmount !== null && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Remaining Amount</h2>
          <p>Remaining Amount: {remainingAmount}</p>
        </div>
      )}
      {selectedBooking1 !== null && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Total Net Material Weight</h2>
          <p>Loading Time Total Weight: {selectedBooking1}</p>
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Unloading Details</h2>
        <div className="mb-4">
          <label className="block font-semibold mb-1">Received Material Weight</label>
          <input
            type="number"
            value={receivedMaterialWeight}
            onChange={handleReceivedMaterialWeightChange}
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="Enter received material weight"
          />
        </div>

        <div className="mb-4">
          <label className="block font-semibold mb-1">Shortage Weight (in tons)</label>
          <input
            type="number"
            value={shortageWeight}
            readOnly
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="Calculated shortage weight"
          />
        </div>

        <button
          onClick={handleUnloadingSubmit}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Submit Unloading Details
        </button>
      </div>

      {/* Modal Integration */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)} // Close modal on click
        showCloseIcon={true} // Show close icon
        className="max-w-sm"
      >
        <div>
          <h2 className="text-2xl font-semibold mb-4">{message || error}</h2>
          {modalAmount !== null && (
            <p className="text-lg">Received Remaining Amount: {modalAmount}</p>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default LoadingUnloadingPage;
