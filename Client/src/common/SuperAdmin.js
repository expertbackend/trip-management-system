import React, { useState, useEffect } from 'react';
import axios from 'axios';

const OwnerForm = ({ onCreateOwner }) => {
  const [ownerData, setOwnerData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    gender: '',
    address: '',
    companyLogo: null,
    password: '',
    role: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setOwnerData({ ...ownerData, [name]: value });
  };

  const handleFileChange = (e) => {
    setOwnerData({ ...ownerData, companyLogo: e.target.files[0] });
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
        <div className="mb-4">
          <label className="block text-gray-700">Gender</label>
          <select
            name="gender"
            value={ownerData.gender}
            onChange={handleChange}
            className="mt-2 p-2 border border-gray-300 rounded-md w-full"
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Address</label>
          <input
            type="text"
            name="address"
            value={ownerData.address}
            onChange={handleChange}
            className="mt-2 p-2 border border-gray-300 rounded-md w-full"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Company Logo</label>
          <input
            type="file"
            name="companyLogo"
            onChange={handleFileChange}
            className="mt-2 p-2 border border-gray-300 rounded-md w-full"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Password</label>
          <input
            type="password"
            name="password"
            value={ownerData.password}
            onChange={handleChange}
            className="mt-2 p-2 border border-gray-300 rounded-md w-full"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Role</label>
          <select
            name="role"
            value={ownerData.role}
            onChange={handleChange}
            className="mt-2 p-2 border border-gray-300 rounded-md w-full"
          >
            <option value="">Select Role</option>
            <option value="owner">Owner</option>
            <option value="operator">Operator</option>
            <option value="driver">Driver</option>
          </select>
        </div>
        <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded-md">
          Create Owner
        </button>
      </form>
    </div>
  );
};

const PaymentRequests = ({ paymentRequests, onApprove, onReject, processingRequest }) => (
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
                  disabled={processingRequest === request._id || request.status === 'Approved' || request.status === 'Rejected'}
                >
                  Approve
                </button>
                <button
                  onClick={() => onReject(request._id)}
                  className="bg-red-500 text-white py-1 px-4 rounded-md"
                  disabled={processingRequest === request._id || request.status === 'Approved' || request.status === 'Rejected'}
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
  const [processingRequest, setProcessingRequest] = useState(null);
  const [newOwnerData, setNewOwnerData] = useState(null);
  const token = localStorage.getItem('token');

  const axiosInstance = axios.create({
    baseURL: `${process.env.REACT_APP_API_URL}/api/owner`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  useEffect(() => {
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
    setProcessingRequest(id);
    try {
      await axiosInstance.patch(`/payment-requests/${id}/approve`);
      setPaymentRequests(paymentRequests.filter((req) => req._id !== id));
    } catch (error) {
      console.error('Error approving payment request:', error);
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleRejectRequest = async (id) => {
    setProcessingRequest(id);
    try {
      await axiosInstance.patch(`/payment-requests/${id}/reject`);
      setPaymentRequests(paymentRequests.filter((req) => req._id !== id));
    } catch (error) {
      console.error('Error rejecting payment request:', error);
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleCreateOwner = async (ownerData) => {
    try {
      // Upload company logo to Cloudinary
      let logoUrl = '';
      if (ownerData.companyLogo) {
        const formData = new FormData();
        formData.append('file', ownerData.companyLogo);
        formData.append('upload_preset', 'testpreset'); // Use your Cloudinary upload preset here
        const uploadResponse = await axios.post('https://api.cloudinary.com/v1_1/dlgyhmuxb/image/upload', formData);
        logoUrl = uploadResponse.data.secure_url; // Get the uploaded logo URL
      }

      // Now send the data to the backend, including the logo URL
      const formData = new FormData();
      Object.keys(ownerData).forEach((key) => {
        if (key !== 'companyLogo') {
          formData.append(key, ownerData[key]);
        } else if (logoUrl) {
          formData.append('companyLogo', logoUrl);
        }
      });
      const fullName = `${ownerData.firstName} ${ownerData.lastName}`;
    
    // Prepare the data to be sent
    const data = {
      name: fullName, // Combine firstName and lastName into a single name field
      email: ownerData.email,
      phoneNumber: ownerData.phoneNumber,
      gender: ownerData.gender,
      address: ownerData.address,
      password: ownerData.password,
      role: ownerData.role,
      companyLogoUrl: logoUrl, // Assuming companyLogo is a URL or base64 string
    };
      const response = await axiosInstance.post('/createOwner', data);
      setNewOwnerData(response.data);
      alert('Owner created successfully');
    } catch (error) {
      console.error('Error creating owner:', error);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <OwnerForm onCreateOwner={handleCreateOwner} />
      <PaymentRequests
        paymentRequests={paymentRequests}
        onApprove={handleApproveRequest}
        onReject={handleRejectRequest}
        processingRequest={processingRequest}
      />
    </div>
  );
};

export default SuperAdminPage;
