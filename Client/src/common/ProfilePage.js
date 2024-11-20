import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Avatar from 'react-avatar';

const ProfilePage = () => {
  const { id } = useParams(); // Retrieve the user ID from the URL
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  const axiosInstance = axios.create({
    baseURL: `${process.env.REACT_APP_API_URL}/api/owner`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  useEffect(() => {
    // Fetch profile data
    axiosInstance
      .get(`/getProfile`)
      .then((response) => {
        setProfileData(response.data.profile);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching profile:', error);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <p className="text-center text-gray-500">Loading profile...</p>;
  }

  if (!profileData) {
    return <p className="text-center text-red-500">Profile not found.</p>;
  }

  // Helper function to render owner profile details
  const renderOwnerProfile = () => (
    <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <span className="text-gray-600">Tag Line: {'if you are bad i am your ......'}</span>
      <h3 className="text-xl font-semibold text-gray-800">Owner Details</h3>
      <p className="text-gray-600">Max Vehicles: {profileData.maxVehicles}</p>
      <p className="text-gray-600">Vehicle Count: {profileData.vehicleCount}</p>
    </div>
  );

  // Helper function to render operator or driver profile details
  const renderOperatorOrDriverProfile = () => (
    <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
      <h3 className="text-xl font-semibold text-gray-800">Operator / Driver Details</h3>
      <p className="text-gray-600">Status: {profileData.status}</p>
      <p className="text-gray-600">Owner Name: {profileData.ownerId.name}</p>

      <div className="mt-4 p-4 bg-white shadow-sm rounded-lg">
        <h4 className="text-lg font-semibold text-gray-700">Vehicle Details</h4>
        <p className="text-gray-600">Name: {profileData.vehicle?.name}</p>
        <p className="text-gray-600">Plate Number: {profileData.vehicle?.plateNumber}</p>
        <p className="text-gray-600">Vehicle Status: {profileData.vehicle?.status}</p>
      </div>
    </div>
  );

  return (
    <div className="bg-gradient-to-r p-6 flex items-center justify-center overflow-y-auto max-h-[90vh]">
      <div className="bg-white shadow-lg rounded-lg max-w-lg w-full p-6">
        <div className="flex flex-col items-center">
        <Avatar
      name={profileData.name} 
      size="40" 
      round="20px" 
      className="shadow-md" 
    />
          <h1 className="text-2xl font-bold text-gray-800">{profileData.name}</h1>
          <p className="text-gray-600 text-sm">{profileData.location}</p>
          <div className="mt-4 space-x-6">
            <span className="text-gray-600">Email: {profileData.email}</span>
            <span className="text-gray-600">role: {profileData.role}</span>
            
          </div>
          <div className="mt-6 flex space-x-4">
            <button className="bg-blue-500 text-white py-2 px-4 rounded-full hover:bg-blue-600">
              Connect
            </button>
            <button className="bg-gray-200 text-gray-700 py-2 px-4 rounded-full hover:bg-gray-300">
              Message
            </button>
          </div>
        </div>

        <div className="mt-6">
          {/* Conditionally render sections based on the role */}
          {profileData.role === 'owner' && renderOwnerProfile()}
          {(profileData.role === 'operator' || profileData.role === 'driver') && renderOperatorOrDriverProfile()}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
