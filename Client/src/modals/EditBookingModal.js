import React, { useState, useEffect } from "react";
import axios from "axios";
import PlacesAutocomplete from 'react-places-autocomplete'; // Import PlacesAutocomplete component

const EditBookingModal = ({ booking, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState(booking || {});
  console.log('formData', formData);
  const token = localStorage.getItem('token');

  const axiosInstance = axios.create({
    baseURL: `${process.env.REACT_APP_API_URL}/api/booking`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
 
  useEffect(() => {
    if (booking) {
      setFormData(booking); // Populate the form with booking details
    }
  }, [booking]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const updatedFormData = { ...prev };

      // Handle nested properties for pickupLocation and dropoffLocation
      if (name === "pickupLocation.address") {
        updatedFormData.pickupLocation = {
          ...prev.pickupLocation,
          address: value,
        };
      } else if (name === "dropoffLocation.address") {
        updatedFormData.dropoffLocation = {
          ...prev.dropoffLocation,
          address: value,
        };
      } else {
        updatedFormData[name] = value; // For basePay and other fields
      }

      return updatedFormData;
    });
  };

  const handleSelectLocation = (address, locationType) => {
    setFormData((prev) => {
      const updatedFormData = { ...prev };
      updatedFormData[locationType] = { ...prev[locationType], address };
      return updatedFormData;
    });
  };

  const handleSave = async () => {
    try {
      // Make API call to save changes to the booking
      await axiosInstance.put(`/bookings/${formData._id}`, formData);
  
    
  
      onSave(); // Refresh the bookings list
      onClose(); // Close the modal
    } catch (error) {
      console.error("Error saving booking:", error);
    }
  };
  

  if (!isOpen) return null; // Don't render if the modal is not open

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">Edit Booking</h2>

        {/* Pickup Location Input with PlacesAutocomplete */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Pickup Location</label>
          <PlacesAutocomplete
            value={formData?.pickupLocation?.address || ""}
            onChange={(e) => handleInputChange({ target: { name: 'pickupLocation.address', value: e } })}
            onSelect={(address) => handleSelectLocation(address, 'pickupLocation')}
          >
            {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
              <div className="relative">
                <input
                  {...getInputProps({
                    placeholder: 'Pickup Location',
                    className: 'w-full mt-1 p-2 border border-gray-300 rounded-md'
                  })}
                  required
                />
                {loading && (
                  <div className="absolute top-10 left-0 w-full bg-white border border-gray-300 p-2 rounded-md">
                    Loading...
                  </div>
                )}
                {suggestions.length > 0 && (
                  <ul className="absolute top-10 left-0 w-full bg-white border border-gray-300 rounded-md shadow-lg">
                    {suggestions.map((suggestion, index) => (
                      <li
                        key={index}
                        {...getSuggestionItemProps(suggestion)}
                        className="p-2 cursor-pointer hover:bg-gray-100"
                      >
                        {suggestion.description}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </PlacesAutocomplete>
        </div>

        {/* Dropoff Location Input with PlacesAutocomplete */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Dropoff Location</label>
          <PlacesAutocomplete
            value={formData?.dropoffLocation?.address || ""}
            onChange={(e) => handleInputChange({ target: { name: 'dropoffLocation.address', value: e } })}
            onSelect={(address) => handleSelectLocation(address, 'dropoffLocation')}
          >
            {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
              <div className="relative">
                <input
                  {...getInputProps({
                    placeholder: 'Dropoff Location',
                    className: 'w-full mt-1 p-2 border border-gray-300 rounded-md'
                  })}
                  required
                />
                {loading && (
                  <div className="absolute top-10 left-0 w-full bg-white border border-gray-300 p-2 rounded-md">
                    Loading...
                  </div>
                )}
                {suggestions.length > 0 && (
                  <ul className="absolute top-10 left-0 w-full bg-white border border-gray-300 rounded-md shadow-lg">
                    {suggestions.map((suggestion, index) => (
                      <li
                        key={index}
                        {...getSuggestionItemProps(suggestion)}
                        className="p-2 cursor-pointer hover:bg-gray-100"
                      >
                        {suggestion.description}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </PlacesAutocomplete>
        </div>

        {/* Base Pay Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Base Pay</label>
          <input
            type="number"
            name="basePay"
            value={formData.basePay || ""}
            onChange={handleInputChange}
            className="w-full mt-1 p-2 border border-gray-300 rounded-md"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-500 text-white rounded-md"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditBookingModal;
