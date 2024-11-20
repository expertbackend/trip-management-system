import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Sample owner form fields
const OwnerForm = ({ onCreateOwner }) => {
  const [ownerData, setOwnerData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setOwnerData({ ...ownerData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreateOwner(ownerData);
  };

  return (
    <div className="mt-8">
      <h3 className="text-2xl font-bold text-gray-800 mb-6">Create Owner</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700">First Name</label>
          <input
            type="text"
            name="firstName"
            value={ownerData.firstName}
            onChange={handleChange}
            className="mt-2 p-2 border border-gray-300 rounded-md w-full"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Last Name</label>
          <input
            type="text"
            name="lastName"
            value={ownerData.lastName}
            onChange={handleChange}
            className="mt-2 p-2 border border-gray-300 rounded-md w-full"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Email</label>
          <input
            type="email"
            name="email"
            value={ownerData.email}
            onChange={handleChange}
            className="mt-2 p-2 border border-gray-300 rounded-md w-full"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Phone Number</label>
          <input
            type="tel"
            name="phoneNumber"
            value={ownerData.phoneNumber}
            onChange={handleChange}
            className="mt-2 p-2 border border-gray-300 rounded-md w-full"
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded-md">
          Create Owner
        </button>
      </form>
    </div>
  );
};

const PaymentRequests = ({ paymentRequests, onApprove, onReject }) => (
    <div className="mt-8">
      <h3 className="text-2xl font-bold text-gray-800 mb-6">Payment Requests</h3>
      {paymentRequests?.length === 0 ? (
        <p className="text-gray-600">No payment requests available.</p>
      ) : (
        <table className="min-w-full bg-white border-collapse border border-gray-300 shadow-sm rounded-md">
          <thead className="bg-gray-200">
            <tr>
              <th className="py-2 px-4 border-b">Owner Name</th>
              <th className="py-2 px-4 border-b">Amount</th>
              <th className="py-2 px-4 border-b">Status</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paymentRequests.map((request) => (
              <tr key={request._id}>
                <td className="py-2 px-4 border-b">{request.ownerId.name}</td>
                <td className="py-2 px-4 border-b">&#x20B9; {request.amount}</td>
                <td className="py-2 px-4 border-b">{request.status}</td>
                <td className="py-2 px-4 border-b">
                  <button
                    onClick={() => onApprove(request._id)}
                    className="bg-green-500 text-white py-1 px-4 rounded-md mr-2"
                    disabled={request.status === 'Approved' || request.status === 'Rejected'}
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => onReject(request._id)}
                    className="bg-red-500 text-white py-1 px-4 rounded-md"
                    disabled={request.status === 'Approved' || request.status === 'Rejected'}
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
  
  

const SuperAdminPage = () => {
  const [paymentRequests, setPaymentRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newOwnerData, setNewOwnerData] = useState(null);
  const [processingRequest, setProcessingRequest] = useState(null); // Add state for tracking the request being processed
  const token = localStorage.getItem('token');

  const axiosInstance = axios.create({
    baseURL: `${process.env.REACT_APP_API_URL}/api/owner`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  useEffect(() => {
    // Fetch payment requests from the backend
    const fetchPaymentRequests = async () => {
      try {
        const response = await axiosInstance.get('/payment-requests');
        setPaymentRequests(response.data);
      } catch (error) {
        console.error('Error fetching payment requests:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPaymentRequests();
  }, []);

  const handleApproveRequest = async (id) => {
    setProcessingRequest(id); // Set the request being processed
    try {
      await axiosInstance.patch(`/payment-requests/${id}/approve`);
      setPaymentRequests(paymentRequests.filter((req) => req._id !== id)); // Update the state
    } catch (error) {
      console.error('Error approving payment request:', error);
    } finally {
      setProcessingRequest(null); // Reset after the request is done
    }
  };

  const handleRejectRequest = async (id) => {
    setProcessingRequest(id); // Set the request being processed
    try {
      await axiosInstance.patch(`/payment-requests/${id}/reject`);
      setPaymentRequests(paymentRequests.filter((req) => req._id !== id)); // Update the state
    } catch (error) {
      console.error('Error rejecting payment request:', error);
    } finally {
      setProcessingRequest(null); // Reset after the request is done
    }
  };

  const handleCreateOwner = async (ownerData) => {
    try {
      const response = await axiosInstance.post('/api/owners', ownerData);
      console.log('Owner created:', response.data);
      // Optionally clear the form after success
      setNewOwnerData(null);
    } catch (error) {
      console.error('Error creating owner:', error);
    }
  };

  return (
    <div className="container mx-auto overflow-y-auto max-h-[90vh] p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Super Admin Dashboard</h1>

      <PaymentRequests
        paymentRequests={paymentRequests}
        onApprove={handleApproveRequest}
        onReject={handleRejectRequest}
        processingRequest={processingRequest} // Pass the state to PaymentRequests
      />

      <OwnerForm onCreateOwner={handleCreateOwner} />
    </div>
  );
};

export default SuperAdminPage;
