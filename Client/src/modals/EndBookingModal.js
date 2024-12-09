import React, { useState } from 'react';
import axios from 'axios';

const EndBookingModal = ({ bookingId, onClose, onBookingEnded }) => {
  const [kmDriven, setKmDriven] = useState('');
  const [extraExpanse, setExtraExpanse] = useState('');
  const [extraExpanseDescription, setExtraExpanseDescription] = useState('');
  const [startDashboardImage, setStartDashboardImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showMessage, setShowMessage] = useState(false); // To control the success/error message
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  const [messageText, setMessageText] = useState(''); // The message to display
  const [isUploading, setIsUploading] = useState(false); // To track upload progress
  const [uploadProgress, setUploadProgress] = useState(0); // To track the upload progress percentage

  const token = localStorage.getItem('token');

  const axiosInstance = axios.create({
    baseURL: `${process.env.REACT_APP_API_URL}/api/booking`, // Replace with your actual API URL
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const handleImagesChange = async (e) => {
    const { files } = e.target;
    const fileArray = Array.from(files);
    const uploadedImages = [];

    setIsUploading(true); // Set upload status to true

    for (const file of fileArray) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'testpreset'); // Use your Cloudinary upload preset here

      try {
        // Upload the image to Cloudinary
        const response = await axios.post('https://api.cloudinary.com/v1_1/dlgyhmuxb/image/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percent); // Update the progress state
          },
        });

        // Push the secure URL of the uploaded image to the array
        uploadedImages.push(response.data.secure_url);
      } catch (error) {
        console.error('Error uploading image:', error);
      }
    }

    // Update the state with the uploaded images (store URLs)
    setStartDashboardImage(uploadedImages[0]); // Save the URL of the first image uploaded

    setIsUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Create the payload as a JSON object
    const payload = {
      kmDriven,
      extraExpanse,
      extraExpanseDescription,
      startDashboardImage, // This will now be the URL of the uploaded image
    };

    try {
      // Send the payload as a JSON object in the request body
      const response = await axiosInstance.put(`/end/${bookingId}`, payload, {
        headers: { 'Content-Type': 'application/json' }, // Use JSON content-type
      });

      // Success handling
      if (response.status === 200) {
        setMessageType('success');
        setMessageText('Booking ended successfully!');
        onBookingEnded(); // Refresh the booking list or update UI
      }
    } catch (error) {
      // Error handling
      console.error('Error ending booking:', error);
      setMessageType('error');
      setMessageText(error.response?.data?.message || 'Failed to end the booking. Please try again.');
    } finally {
      setLoading(false);
      setShowMessage(true); // Show the success/error message
    }
  };

  const handleMessageClose = () => {
    setShowMessage(false);
    if (messageType === 'success') {
      onClose(); // Close the modal if the booking ended successfully
    }
  };

  return (
    <>
      {/* Modal for inputting booking data */}
      <div className="fixed inset-0 flex justify-center items-center bg-gray-700 bg-opacity-50 z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg w-96">
          <h2 className="text-xl font-semibold mb-4">End Booking</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700">Kilometers Driven</label>
              <input
                type="number"
                value={kmDriven}
                onChange={(e) => setKmDriven(e.target.value)}
                required
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Extra Expenses</label>
              <input
                type="number"
                value={extraExpanse}
                onChange={(e) => setExtraExpanse(e.target.value)}
                required
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Extra Expenses Description</label>
              <textarea
                value={extraExpanseDescription}
                onChange={(e) => setExtraExpanseDescription(e.target.value)}
                required
                className="w-full p-2 border border-gray-300 rounded-md"
              ></textarea>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Start Dashboard Image</label>
              <input
                type="file"
                onChange={handleImagesChange} // Handle file change and upload to Cloudinary
                required
                className="w-full p-2 border border-gray-300 rounded-md"
              />
              {isUploading && (
                <div className="mt-2 text-sm text-gray-600">Uploading image... {uploadProgress}%</div>
              )}
            </div>
            <div className="flex justify-between">
              <button
                type="button"
                onClick={onClose}
                className="bg-gray-300 px-4 py-2 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || isUploading}
                className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600"
              >
                {loading ? 'Ending Booking...' : 'End Booking'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Success/Error Message Popup */}
      {showMessage && (
        <div className="fixed inset-0 flex justify-center items-center bg-gray-700 bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className={`text-xl font-semibold mb-4 ${messageType === 'success' ? 'text-green-600' : 'text-red-600'}`}>
              {messageType === 'success' ? 'Success' : 'Error'}
            </h2>
            <p className="mb-4">{messageText}</p>
            <button
              onClick={handleMessageClose}
              className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600"
            >
              {messageType === 'success' ? 'Okay' : 'Try Again'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default EndBookingModal;
