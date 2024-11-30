import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AddExpenses() {
  const [fuelExpanse, setFuelExpanse] = useState('');
  const [driverExpanse, setDriverExpanse] = useState('');
  const [vehicleExpanse, setVehicleExpanse] = useState('');
  const [vehicleExpanseDescription, setVehicleExpanseDescription] = useState('');

  const [date, setDate] = useState('');
  const [message, setMessage] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [drivers, setDrivers] = useState([]); // State to hold the list of drivers
  const [selectedDriver, setSelectedDriver] = useState(''); // State for the selected driver
  const token = localStorage.getItem('token');

  const axiosInstance = axios.create({
    baseURL: `${process.env.REACT_APP_API_URL}/api/booking`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  useEffect(() => {
    // Fetch the drivers when the component mounts
    const fetchDrivers = async () => {
      try {
        const response = await axiosInstance.get('/alldrivers');
        setDrivers(response.data); // Store drivers in state
      } catch (error) {
        console.error('Error fetching drivers:', error);
        setMessage('Error fetching drivers');
      }
    };

    fetchDrivers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.put('/add-daily-expanse', {
        fuelExpanse,
        driverExpanse,
        vehicleExpanse,
        vehicleExpanseDescription,
        date,
        driverId: selectedDriver, // Send selected driver to the backend
      });
      setMessage('Expense added successfully');
      setFuelExpanse('');
      setDriverExpanse('');
      setVehicleExpanse('');
      setDate('');
      setShowPopup(true);
    } catch (error) {
      console.error('Error submitting expense:', error);
      setMessage(error.response.data.message);
      setShowPopup(true);
    }
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  return (
    <div className="flex justify-center items-center bg-gray-100 py-8 px-4 overflow-y-auto max-h-[90vh]">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-lg">
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">Add Daily Expenses</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="fuelExpanse" className="block text-gray-600 font-medium">Fuel Expense</label>
            <input
              type="number"
              id="fuelExpanse"
              value={fuelExpanse}
              onChange={(e) => setFuelExpanse(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
              placeholder="Enter fuel expense"
            />
          </div>
          <div>
            <label htmlFor="driverExpanse" className="block text-gray-600 font-medium">Driver Expense</label>
            <input
              type="number"
              id="driverExpanse"
              value={driverExpanse}
              onChange={(e) => setDriverExpanse(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
              placeholder="Enter driver expense"
            />
          </div>
          <div>
            <label htmlFor="vehicleExpanse" className="block text-gray-600 font-medium">Vehicle Expense</label>
            <input
              type="number"
              id="vehicleExpanse"
              value={vehicleExpanse}
              onChange={(e) => setVehicleExpanse(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
              placeholder="Enter vehicle expense"
            />
          </div>
          <div>
            <label htmlFor="vehicleExpanse" className="block text-gray-600 font-medium">Vehicle Expense description</label>
            <input
              type="text"
              id="vehicleExpanse"
              value={vehicleExpanseDescription}
              onChange={(e) => setVehicleExpanseDescription(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
              placeholder="Enter vehicle expense"
            />
          </div>
          <div>
            <label htmlFor="driver" className="block text-gray-600 font-medium">Select Driver</label>
            <select
              id="driver"
              value={selectedDriver}
              onChange={(e) => setSelectedDriver(e.target.value)}
              className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Select Driver</option>
              {drivers.map(driver => (
                <option key={driver._id} value={driver._id}>
                  {driver.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="date" className="block text-gray-600 font-medium">Date</label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700"
          >
            Submit
          </button>
        </form>

        {message && (
          <p className={`mt-4 text-center ${message === 'Expense added successfully' ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </p>
        )}

        {showPopup && (
          <div className="fixed inset-0 flex justify-center items-center bg-gray-900 bg-opacity-50 z-50">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <p className={`text-center ${message === 'Expense added successfully' ? 'text-green-600' : 'text-red-600'}`}>
                {message}
              </p>
              <button
                className="mt-4 py-2 px-6 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                onClick={closePopup}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AddExpenses;
