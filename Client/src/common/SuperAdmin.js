import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from "jspdf";
import "jspdf-autotable";
import SearchBar from './SearchBar';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg shadow-blue-200 mt-8">
      <h3 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">Create Owner</h3>
      <ToastContainer />
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="mb-4">
            <label className="block text-lg text-gray-700 mb-2">First Name</label>
            <input
              type="text"
              name="firstName"
              value={ownerData.firstName}
              onChange={handleChange}
              className="w-full p-4 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Enter your first name"
            />
          </div>
          <div className="mb-4">
            <label className="block text-lg text-gray-700 mb-2">Last Name</label>
            <input
              type="text"
              name="lastName"
              value={ownerData.lastName}
              onChange={handleChange}
              className="w-full p-4 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Enter your last name"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="mb-4">
            <label className="block text-lg text-gray-700 mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={ownerData.email}
              onChange={handleChange}
              className="w-full p-4 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Enter your email"
            />
          </div>
          <div className="mb-4">
            <label className="block text-lg text-gray-700 mb-2">Phone Number</label>
            <input
              type="tel"
              name="phoneNumber"
              value={ownerData.phoneNumber}
              onChange={handleChange}
              className="w-full p-4 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Enter your phone number"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-lg text-gray-700 mb-2">Gender</label>
          <select
            name="gender"
            value={ownerData.gender}
            onChange={handleChange}
            className="w-full p-4 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-lg text-gray-700 mb-2">Address</label>
          <input
            type="text"
            name="address"
            value={ownerData.address}
            onChange={handleChange}
            className="w-full p-4 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Enter your address"
          />
        </div>

        <div className="mb-4">
          <label className="block text-lg text-gray-700 mb-2">Company Logo</label>
          <input
            type="file"
            name="companyLogo"
            onChange={handleFileChange}
            className="w-full p-4 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div className="mb-4">
          <label className="block text-lg text-gray-700 mb-2">Password</label>
          <input
            type="password"
            name="password"
            value={ownerData.password}
            onChange={handleChange}
            className="w-full p-4 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Enter your password"
          />
        </div>

        <div className="mb-6">
          <label className="block text-lg text-gray-700 mb-2">Role</label>
          <select
            name="role"
            value={ownerData.role}
            onChange={handleChange}
            className="w-full p-4 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">Select Role</option>
            <option value="owner">Owner</option>
            <option value="operator">Operator</option>
            <option value="driver">Driver</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md transform hover:scale-105 transition-all duration-300 shadow-md focus:outline-none focus:ring-4 focus:ring-blue-500"
        >
          Create Owner
        </button>
      </form>
    </div>
  );
};

const PaymentRequests = ({ paymentRequests, onApprove, onReject, processingRequest }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredRequests, setFilteredRequests] = useState(paymentRequests);
  const itemsPerPage = 5;

  useEffect(() => {
    // Reset filteredRequests to paymentRequests whenever paymentRequests changes
    setFilteredRequests(paymentRequests);
  }, [paymentRequests]);

  // Pagination logic
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRequests = filteredRequests.slice(startIndex, startIndex + itemsPerPage);

  // Search functionality
  const handleSearch = (query) => {
    const lowerCaseQuery = query.toLowerCase();
    const filtered = paymentRequests.filter((request) =>
      request.ownerId.name.toLowerCase().includes(lowerCaseQuery) ||
      request.amount.toString().includes(lowerCaseQuery) ||
      request.status.toLowerCase().includes(lowerCaseQuery)
    );
    setFilteredRequests(filtered);
    setCurrentPage(1); // Reset to first page on new search
  };

  // Handle PDF download
  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const tableColumn = ["Owner Name", "Amount", "Status"];
    const tableRows = paginatedRequests.map((request) => [
      request.ownerId.name,
      `₹ ${request.amount}`,
      request.status,
    ]);

    doc.text("Payment Requests Report", 14, 10);
    doc.autoTable({ head: [tableColumn], body: tableRows, startY: 20 });
    doc.save("payment_requests_report.pdf");
  };

  return (
    <div className="mt-8">
      <h3 className="text-2xl font-bold text-gray-800 mb-6">Payment Requests</h3>
      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search..."
          onChange={(e) => handleSearch(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md w-full"
        />
      </div>

      {/* PDF Download Button */}
      <button
        onClick={handleDownloadPDF}
        className="bg-blue-500 text-white px-4 py-2 rounded-md mb-4"
      >
        Download PDF
      </button>

      {/* Table */}
      {filteredRequests.length === 0 ? (
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
            {paginatedRequests.map((request) => (
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

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className={`px-4 py-2 rounded-md ${currentPage === 1 ? "bg-gray-300 text-gray-600" : "bg-blue-500 text-white"}`}
        >
          Previous
        </button>
        <p className="text-gray-600">
          Page {currentPage} of {totalPages}
        </p>
        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className={`px-4 py-2 rounded-md ${currentPage === totalPages ? "bg-gray-300 text-gray-600" : "bg-blue-500 text-white"}`}
        >
          Next
        </button>
      </div>
    </div>
  );
};


const OwnersTable = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredOwners, setFilteredOwners] = useState([]);
  const itemsPerPage = 5;
  const token = localStorage.getItem('token');
  const [isLoadingOwners, setIsLoadingOwners] = useState(true);

  const axiosInstance = axios.create({
    baseURL: `${process.env.REACT_APP_API_URL}/api/owner`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  useEffect(() => {
    const fetchOwners = async () => {
      try {
        const response = await axiosInstance.get('/getOwners'); 
        setFilteredOwners(response.data.Owners); 
        console.log('Fetched Owners:', response.data.Owners);
      } catch (error) {
        console.error('Error fetching owners:', error);
      } finally {
        setIsLoadingOwners(false);
      }
    };

    fetchOwners();
  }, []);

  // Pagination logic
  const totalPages = Math.ceil(filteredOwners.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOwners = filteredOwners.slice(startIndex, startIndex + itemsPerPage);

  // PDF download
  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const tableColumn = ["Name", "Email", "Phone Number", "Gender", "Role", "Last Login", "Address"];
    const tableRows = filteredOwners.map((owner) => [
      owner.name,
      owner.email,
      owner.phoneNumber,
      owner.gender,
      owner.role,
      owner.lastLogin ? new Date(owner.lastLogin).toLocaleString() : "N/A",
      owner.address,
    ]);

    doc.text("Owner Users Report", 14, 10);
    doc.autoTable({ head: [tableColumn], body: tableRows, startY: 20 });
    doc.save("owners_report.pdf");
  };

  // Search functionality
  const handleSearch = (query) => {
    const lowerCaseQuery = query.toLowerCase();
    const filtered = filteredOwners.filter((owner) =>
      owner?.name?.toLowerCase().includes(lowerCaseQuery) ||
      owner?.email?.toLowerCase().includes(lowerCaseQuery) ||
      owner.phoneNumber?.toString().includes(lowerCaseQuery) ||
      owner.gender?.toLowerCase().includes(lowerCaseQuery) ||
      owner.role?.toLowerCase().includes(lowerCaseQuery) ||
      owner.address?.toLowerCase().includes(lowerCaseQuery)
    );
    setFilteredOwners(filtered);
    setCurrentPage(1); // Reset to first page on new search
  };

  return (
    <div className="mt-8">
      <h3 className="text-2xl font-semibold text-gray-800 mb-6">Owner Users</h3>
      <p className="text-gray-600 mb-4">Total Owners: {filteredOwners.length}</p>

      <div className="flex justify-between mb-4">
        <button
          onClick={handleDownloadPDF}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-300"
        >
          Download PDF
        </button>
        <SearchBar onSearch={handleSearch} />
      </div>

      {isLoadingOwners ? (
        <p className="text-gray-600">Loading owners...</p>
      ) : filteredOwners.length === 0 ? (
        <p className="text-gray-600">No owners found.</p>
      ) : (
        <table className="min-w-full bg-white border-collapse border border-gray-300 shadow-sm rounded-md">
          <thead className="bg-gray-200">
            <tr>
              <th className="py-2 px-4 border-b text-left">Name</th>
              <th className="py-2 px-4 border-b text-left">Email</th>
              <th className="py-2 px-4 border-b text-left">Phone Number</th>
              <th className="py-2 px-4 border-b text-left">Gender</th>
              <th className="py-2 px-4 border-b text-left">Role</th>
              <th className="py-2 px-4 border-b text-left">Last Login</th>
              <th className="py-2 px-4 border-b text-left">Address</th>
            </tr>
          </thead>
          <tbody>
            {paginatedOwners.map((owner) => (
              <tr key={owner._id}>
                <td className="py-2 px-4 border-b">{owner.name}</td>
                <td className="py-2 px-4 border-b">{owner.email}</td>
                <td className="py-2 px-4 border-b">{owner.phoneNumber}</td>
                <td className="py-2 px-4 border-b">{owner.gender}</td>
                <td className="py-2 px-4 border-b">{owner.role}</td>
                <td className="py-2 px-4 border-b">{owner.lastLogin ? new Date(owner.lastLogin).toLocaleString() : "N/A"}</td>
                <td className="py-2 px-4 border-b">{owner.address}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className={`px-4 py-2 rounded-md ${
            currentPage === 1 ? "bg-gray-300 text-gray-600" : "bg-blue-500 text-white"
          } hover:bg-blue-600 transition duration-300`}
        >
          Previous
        </button>
        <p className="text-gray-600">
          Page {currentPage} of {totalPages}
        </p>
        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className={`px-4 py-2 rounded-md ${
            currentPage === totalPages ? "bg-gray-300 text-gray-600" : "bg-blue-500 text-white"
          } hover:bg-blue-600 transition duration-300`}
        >
          Next
        </button>
      </div>
    </div>
  );
};


const SuperAdminPage = () => {
  const [paymentRequests, setPaymentRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingRequest, setProcessingRequest] = useState(null);
  const [newOwnerData, setNewOwnerData] = useState(null);
  const token = localStorage.getItem('token');
  const [owners, setOwners] = useState([]);
  const [isLoadingOwners, setIsLoadingOwners] = useState(true);

  const axiosInstance = axios.create({
    baseURL: `${process.env.REACT_APP_API_URL}/api/owner`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  // useEffect(() => {
  //   const fetchOwners = async () => {
  //     try {
  //       const response = await axiosInstance.get('/getOwners'); // Replace with your API endpoint for fetching owners
  //       setOwners(response.data.Owners);
  //       console.log('datardddd',response.data,owners)
  //     } catch (error) {
  //       console.error('Error fetching owners:', error);
  //     } finally {
  //       setIsLoadingOwners(false);
  //     }
  //   };

  //   fetchOwners();
  // }, []);
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
      toast.success('Owner Created Successfully!');
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
      <OwnersTable />

    </div>
  );
};

export default SuperAdminPage;
