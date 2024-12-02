import React, { useState } from 'react';
import TyreManagement from './TyreManagement';
import VehicleDocuments from './VehicleDocuments';
import VehicleServices from './VehicleServices';
import VehicleExpense from './VehicleExpense'; // Import the Expenses component

const VehicleManagement = () => {
  const [activeTab, setActiveTab] = useState('tyres');

  return (
    <div className="vehicle-management">
      <div className="tabs flex flex-col sm:flex-row space-x-4 shadow-lg sm:shadow-none border-gray-300 pb-2 mb-4 justify-center">
        <button
          onClick={() => setActiveTab('tyres')}
          className={`${
            activeTab === 'tyres'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-blue-600'
          } py-2 px-4 transition-colors duration-300 font-semibold`}
        >
          Tyre Management
        </button>
        <button
          onClick={() => setActiveTab('docs')}
          className={`${
            activeTab === 'docs'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-blue-600'
          } py-2 px-4 transition-colors duration-300 font-semibold`}
        >
          Vehicle Documents
        </button>
        <button
          onClick={() => setActiveTab('services')}
          className={`${
            activeTab === 'services'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-blue-600'
          } py-2 px-4 transition-colors duration-300 font-semibold`}
        >
          Vehicle Services
        </button>
        <button
          onClick={() => setActiveTab('expenses')}
          className={`${
            activeTab === 'expenses'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-blue-600'
          } py-2 px-4 transition-colors duration-300 font-semibold`}
        >
          Expenses
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'tyres' && <TyreManagement />}
        {activeTab === 'docs' && <VehicleDocuments />}
        {activeTab === 'services' && <VehicleServices />}
        {activeTab === 'expenses' && <VehicleExpense />}
      </div>
    </div>
  );
};

export default VehicleManagement;
