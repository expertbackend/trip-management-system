import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const AddBranchForm = () => {
  const [branchName, setBranchName] = useState('');
  const [ownerId, setOwnerId] = useState('');
  const [owners, setOwners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const token = localStorage.getItem('token');

  const axiosInstance = axios.create({
    baseURL: `${process.env.REACT_APP_API_URL}/api`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  // Fetch owners for dropdown list
  useEffect(() => {
    const fetchOwners = async () => {
      try {
        const response = await axiosInstance.get('/owner/getOwners'); // API to fetch owners
        setOwners(response.data.Owners); // Assuming the response has a "Owners" array
      } catch (error) {
        console.error('Error fetching owners:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOwners();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!branchName || !ownerId) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const response = await axiosInstance.post('/owner/createbranch', {
        name: branchName,
        ownerId,
      });

      toast.success(response.data.message);
      setBranchName('');
      setOwnerId('');
    } catch (error) {
      console.error('Error adding branch:', error);
      toast.error('Error adding branch');
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg mt-8">
      <h3 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">Add Branch</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-lg text-gray-700 mb-2">Branch Name</label>
          <input
            type="text"
            value={branchName}
            onChange={(e) => setBranchName(e.target.value)}
            className="w-full p-4 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Enter branch name"
          />
        </div>

        <div className="mb-4">
          <label className="block text-lg text-gray-700 mb-2">Select Owner</label>
          <select
            value={ownerId}
            onChange={(e) => setOwnerId(e.target.value)}
            className="w-full p-4 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">Select Owner</option>
            {isLoading ? (
              <option>Loading owners...</option>
            ) : (
              owners.map((owner) => (
                <option key={owner._id} value={owner._id}>
                  {owner.name}
                </option>
              ))
            )}
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md transform hover:scale-105 transition-all duration-300 shadow-md focus:outline-none focus:ring-4 focus:ring-blue-500"
        >
          Add Branch
        </button>
      </form>
    </div>
  );
};

export default AddBranchForm;
