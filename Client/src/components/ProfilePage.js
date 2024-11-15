import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

// Modal component for Success/Error feedback
const Modal = ({ isOpen, message, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-800 bg-opacity-50">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-96 max-w-full">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">{message.type}</h2>
        <p className="text-lg text-center text-gray-700 mb-6">{message.text}</p>
        <div className="flex justify-center">
          <button
            onClick={onClose}
            className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white px-6 py-2 rounded-lg shadow-md hover:shadow-xl transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const PlanPage = () => {
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [message, setMessage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const token = localStorage.getItem('token');

  const axiosInstance = axios.create({
    baseURL: `${process.env.REACT_APP_API_URL}/api/owner`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  // Socket.IO client setup


  // Fetch plans on page load
  useEffect(() => {
    axiosInstance
      .get('/plans')
      .then((response) => setPlans(response.data))
      .catch((error) => {
        console.error('Error fetching plans:', error);
        setMessage({ type: 'Error', text: 'Error fetching plans.' });
        setIsModalOpen(true);
      });

   

   
  }, []);

  const handlePlanSelect = (planId) => {
    setSelectedPlan(planId);
  };

  const handleBuyPlan = async () => {
    if (!selectedPlan) {
      return alert('Please select a plan.');
    }

    try {
      const response = await axiosInstance.post('/buy-plan', { planId: selectedPlan });
      setMessage({ type: 'Success', text: response.data.message });
      setIsModalOpen(true);
     
      // Emit a "newNotification" event from the backend when the plan is bought successfully
    } catch (error) {
      console.error('Error buying plan:', error);
      setMessage({ type: 'Error', text: 'Error buying plan.' });
      setIsModalOpen(true);
    }
  };

  return (
    <div className="plan-page py-12 bg-gradient-to-r from-purple-300 via-indigo-200 to-blue-300 min-h-screen">
      <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">Available Plans</h2>

      {plans.length === 0 ? (
        <p className="text-center text-lg text-gray-600">No plans available.</p>
      ) : (
        <div className="plan-list grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {plans.map((plan) => (
            <div
              key={plan._id}
              className={`plan-card p-6 border-2 rounded-3xl shadow-xl transition-all transform hover:scale-105 hover:shadow-2xl cursor-pointer ${selectedPlan === plan._id ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white' : 'bg-white text-gray-800'}`}
              onClick={() => handlePlanSelect(plan._id)}
            >
              <div className="relative">
                <div className="absolute top-2 right-2 px-3 py-1 text-xs font-semibold text-white bg-blue-500 rounded-full shadow-lg">
                  {plan.popular && 'Most Popular'}
                </div>
                <h3 className="text-2xl font-semibold text-gray-800">{plan.name}</h3>
                <p className="mt-3 text-sm text-gray-500">{plan.description || 'Plan description not available'}</p>
                <div className="mt-5 flex justify-between items-center">
                  <span className="text-4xl font-bold text-gray-900">&#x20B9; {plan.price}</span>
                  <span className="text-lg font-medium text-gray-500">/month</span>
                </div>
                <ul className="mt-6 text-sm text-gray-600 space-y-2">
                  <li><i className="fas fa-check-circle text-teal-500 mr-2"></i>{`Max Vehicles: ${plan.maxVehicles}`}</li>
                  <li><i className="fas fa-check-circle text-teal-500 mr-2"></i>{`Storage: ${plan.storage}`}</li>
                  <li><i className="fas fa-check-circle text-teal-500 mr-2"></i>{`Support: ${plan.support}`}</li>
                </ul>
              </div>
              <button
                className={`mt-8 w-full py-3 rounded-lg text-lg font-semibold ${selectedPlan === plan._id ? 'bg-teal-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'} transition-colors`}
              >
                {selectedPlan === plan._id ? 'Selected' : 'Select Plan'}
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 flex justify-center">
        <button
          onClick={handleBuyPlan}
          disabled={!selectedPlan}
          className={`buy-plan-button w-80 py-4 text-xl font-semibold text-white rounded-full shadow-2xl ${selectedPlan ? 'bg-gradient-to-r from-green-400 to-teal-500 hover:from-green-500 hover:to-teal-600' : 'bg-gray-400 cursor-not-allowed'} transition-all`}
        >
          {selectedPlan ? 'Buy Plan' : 'Select a Plan First'}
        </button>
      </div>

      {/* Modal Popup for Success/Error */}
      <Modal isOpen={isModalOpen} message={message} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default PlanPage;
