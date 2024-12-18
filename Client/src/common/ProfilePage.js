import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Avatar from 'react-avatar';
import BadgeDisplay from './BadgeDisplay';
import { jsPDF } from 'jspdf';
const ProfilePage = () => {
  const { id } = useParams(); // Retrieve the user ID from the URL
  const [profileData, setProfileData] = useState(null);
  const [plans, setPlans] = useState([]);
  const [planHistory, setPlanHistory] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const token = localStorage.getItem('token');
const userId = localStorage.getItem('tokenId')
  const axiosInstance = axios.create({
    baseURL: `${process.env.REACT_APP_API_URL}/api/owner`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch the profile data
        const profileResponse = await axiosInstance.get('/getProfile');
        const profile = profileResponse.data.profile || null;
        setProfileData(profile);

        // Fetch additional data only if the role is 'owner'
        if (profile?.role === 'owner') {
          const [plansResponse, historyResponse] = await Promise.all([
            axiosInstance.get('/plans'),
            axiosInstance.get('/plan-history'),
          ]);
          setPlans(plansResponse.data || []);
          setPlanHistory(historyResponse.data.planHistory || []);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setMessage({ type: 'Error', text: 'Error fetching data.' });
        setIsModalOpen(true);
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handlePlanSelect = (planId) => {
    setSelectedPlan(planId);
  };

  const handleBuyPlan = async () => {
    if (!selectedPlan) {
      alert('Please select a plan.');
      return;
    }

    try {
      const response = await axiosInstance.post('/buy-plan', { planId: selectedPlan });
      setMessage({ type: 'Success', text: response.data.message });
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error buying plan:', error);
      setMessage({ type: 'Error', text: 'Error buying plan.' });
      setIsModalOpen(true);
    }
  };
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState(''); // State for search term

  const rowsPerPage = 5; // Number of rows to display per page

  // Calculate total pages
  const totalPages = Math.ceil(planHistory.length / rowsPerPage);

  // Slice the planHistory data to only show the rows for the current page
  const currentData = planHistory.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // Handle page change
  const handlePageChange = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };
  const filteredPlanHistory = currentData.filter((history) =>
    history.planName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    history.purchasedAt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Function to generate PDF
  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text('Plan History', 20, 20);

    const tableData = filteredPlanHistory.map((history) => [
      history.planName,
      new Date(history.purchasedAt).toLocaleDateString(),
      history.expiryDate ? new Date(history.expiryDate).toLocaleDateString() : 'N/A',
      `₹ ${history.amount || '0'}`,
    ]);

    doc.autoTable({
      head: [['Plan Name', 'Purchased At', 'Expiry Date', 'Amount']],
      body: tableData,
    });

    doc.save('PlanHistory.pdf');
  };

  const renderPlanHistory = () => (
    <div className="mt-8">
      <h3 className="text-2xl font-bold text-gray-800 mb-6">Plan History</h3>
      <input
        type="text"
        placeholder="Search by plan name or purchased date"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4 p-2 border border-gray-300 rounded-md"
      />
      <div className="mt-4">
        <button
          onClick={generatePDF}
          className="py-2 px-4 bg-blue-500 text-white rounded-md"
        >
          Download PDF
        </button>
      </div>
      {planHistory.length === 0 ? (
        <p className="text-gray-600">No plan history available.</p>
      ) : (
        <div className='overflow-hidden'>
          <div className='overflow-x-scroll rounded-md '>
          <table className="min-w-full bg-white border-collapse border border-gray-300 shadow-md shadow-gray-100 rounded-md">
        <thead className="bg-sky-700 text-white">
          <tr>
            <th className="py-2 px-4 border-b">Plan Name</th>
            <th className="py-2 px-4 border-b">Purchased At</th>
            <th className="py-2 px-4 border-b">Expiry Date</th>
            <th className="py-2 px-4 border-b">Amount</th>
          </tr>
        </thead>
        <tbody>
          {filteredPlanHistory.map((history) => (
            <tr key={history._id}>
              <td className="py-2 px-4 border-b">{history.planName}</td>
              <td className="py-2 px-4 border-b">
                {new Date(history.purchasedAt).toLocaleDateString()}
              </td>
              <td className="py-2 px-4 border-b">
                {history.expiryDate
                  ? new Date(history.expiryDate).toLocaleDateString()
                  : 'N/A'}
              </td>
              <td className="py-2 px-4 border-b">&#x20B9; {history.amount || '0'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination controls */}
      <div className="mt-4 flex justify-between items-center">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          className="px-4 py-2 bg-sky-700 text-white rounded-md disabled:opacity-50"
          disabled={currentPage === 1}
        >
          Previous
        </button>

        <span className="text-sm">
          Page {currentPage} of {totalPages}
        </span>

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          className="px-4 py-2 bg-sky-700 text-white rounded-md disabled:opacity-50"
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
        </div>
        </div>
      )}
    </div>
  );
  const renderPlans = () => (
    <div className="mt-8">
      <h3 className="text-2xl font-bold text-gray-800 mb-6">Available Plans</h3>
      {plans.length === 0 ? (
        <p className="text-gray-600">No plans available.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan._id}
              className={`p-6 border rounded-lg shadow-lg ${
                selectedPlan === plan._id ? 'bg-blue-500 text-white' : 'bg-white text-gray-800'
              } cursor-pointer transition-all`}
              onClick={() => handlePlanSelect(plan._id)}
            >
              <h4 className="text-lg font-semibold">{plan.name}</h4>
              <p className="text-sm">{plan.description || 'No description available'}</p>
              <p className="mt-4 text-xl font-bold">&#x20B9; {plan.price} /month</p>
            </div>
          ))}
        </div>
      )}
      <div className="mt-6 flex justify-center">
        <button
          onClick={handleBuyPlan}
          disabled={!selectedPlan}
          className={`py-2 px-4 rounded-lg ${
            selectedPlan ? 'bg-green-500 text-white' : 'bg-gray-400 text-gray-800 cursor-not-allowed'
          }`}
        >
          {selectedPlan ? 'Buy Selected Plan' : 'Select a Plan'}
        </button>
      </div>
    </div>
  );

 

  if (loading) {
    return <p className="text-center text-gray-500">Loading profile...</p>;
  }

  if (!profileData) {
    return <p className="text-center text-red-500">Profile not found.</p>;
  }
console.log('hhahahahahprofile',profileData)
  return (
    <div className="p-6 overflow-y-scroll min-h-[100vh]">
      <div className="flex flex-col items-center">
        <BadgeDisplay userId={userId}/>
        <Avatar name={profileData.name} size="100" round className="shadow-md" />
        <h1 className="text-2xl font-bold mt-4">{profileData.name}</h1>
        <p className="text-gray-600">{profileData.location}</p>
        <p className="text-gray-600 mt-2">Role: {profileData.role}</p>
      </div>

      {/* Role-Specific Details */}
      <div className="mt-6">
  {profileData.role === 'owner' ? (
    <>
      <div className="mt-6">
        <h3 className="text-xl font-bold text-gray-800">Owner Details</h3>
        <p>Max Vehicles: {profileData.maxVehicles}</p>
        <p>Vehicle Count: {profileData.vehicleCount}</p>
      </div>
      {renderPlans()}
      {renderPlanHistory()}
    </>
  ) : profileData.role === 'superadmin' ? (
    <>
      <div className="mt-6">
        <h3 className="text-xl font-bold text-gray-800">Superadmin Details</h3>
        <p>
          <strong>ID:</strong> {profileData._id}
        </p>
        <p>
          <strong>Name:</strong> {profileData.name}
        </p>
        <p>
          <strong>Email:</strong> {profileData.email}
        </p>
        <p>
          <strong>Role:</strong> {profileData.role}
        </p>
        <p>
          <strong>Phone Number:</strong> {profileData.phoneNumber}
        </p>
        <p>
          <strong>Status:</strong> {profileData.status}
        </p>
        <p>
          <strong>Booking Status:</strong> {profileData.bookingStatus}
        </p>
        <div className="mt-4">
          <h4 className="text-lg font-semibold text-gray-700">Additional Data:</h4>
          <p>
            <strong>Max Vehicles:</strong> {profileData.maxVehicles}
          </p>
          <p>
            <strong>Vehicle Count:</strong> {profileData.vehicleCount}
          </p>
          <p>
            <strong>Permissions:</strong>{' '}
            {profileData.permissions.length > 0 ? profileData.permissions.join(', ') : 'No Permissions'}
          </p>
        </div>
      </div>
    </>
  ) : (
    <div className="mt-6">
      <h3 className="text-xl font-bold text-gray-800 capitalize">{profileData.role}</h3>
      <p>Status: {profileData.status}</p>
      <p>Owner Name: {profileData.ownerId?.name || 'N/A'}</p>
    </div>
  )}
</div>


      {/* Modal for Feedback */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <h2 className="text-xl font-bold mb-4">{message?.type}</h2>
            <p className="mb-6">{message?.text}</p>
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
