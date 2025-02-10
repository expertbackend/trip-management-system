import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import Modal from './Modal'; // Assume Modal is a reusable component
import { FaAlignRight, FaCar, FaCheck, FaMotorcycle, FaTruck } from 'react-icons/fa';
import axios from 'axios';
import VehicleModal from '../common/VehicleModal';

const VehicleTable = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const vehiclesPerPage = 5;
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [isVehicleModalOpen1, setIsVehicleModalOpen1] = useState(false);
  const [vehicles, setVehicles] = useState([]); // State to hold vehicles list
  const [drivers, setDrivers] = useState([]); // State to hold drivers list
  const [newVehicleData, setNewVehicleData] = useState({ name: '', plateNumber: '', type: 'car',branchId: '' }); // State for new vehicle data
  const [selectedDriver, setSelectedDriver] = useState(null); // State for selected driver
  const [selectedVehicleId, setSelectedVehicleId] = useState(null); // State for selected vehicle ID
  const [error, setError] = useState(""); // State for selected vehicle ID
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [modalMode, setModalMode] = useState('view');
  const token = localStorage.getItem('token'); // Assuming the token is stored in localStorage
  const [isVehicleStarted, setIsVehicleStarted] = useState(false);
  const [actionType, setActionType] = useState(""); 
  const [isModalOpen1, setIsModalOpen1] = useState(false); // modal visibility state
  const [enteredMeterReading, setEnteredMeterReading] = useState("");
  // Fetch vehicles and drivers when the component mounts

  useEffect(() => {
    console.log('Fetching vehicles...');
    fetchVehicles();
    fetchDrivers();
  }, []);

  // Axios instance with authorization header
  const axiosInstance = axios.create({
    baseURL: `${process.env.REACT_APP_API_URL}/api/owner`, // Replace with the base URL for your API
    headers: {
      Authorization: `Bearer ${token}`, // Include the token in the Authorization header
    },
  });
  const axiosInstance1 = axios.create({
    baseURL: `${process.env.REACT_APP_API_URL}/api/booking`, // Replace with the base URL for your API
    headers: {
      Authorization: `Bearer ${token}`, // Include the token in the Authorization header
    },
  });
  const [vehiclesByBranch, setVehiclesByBranch] = useState([]);

  const fetchVehicles = async () => {
    try {
      const response = await axiosInstance.get('/getVehicleByBranch');  // API endpoint to get vehicles grouped by branch
      setVehiclesByBranch(response.data.data); 
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      alert('An error occurred while fetching vehicles.');
    }
  };
  
  const [branches, setBranches] = useState([]);  // State to store fetched branches

  // Call getBranches API when the modal opens
  useEffect(() => {
    if (isVehicleModalOpen) {
      // Fetch branches only when the modal is open
      const fetchBranches = async () => {
        try {
          const response = await axiosInstance.get('/getbranches');  // Adjust the endpoint as necessary
          const data = response.data;
          setBranches(data.branches);  // Assuming 'branches' is the key in response
        } catch (error) {
          console.error('Error fetching branches:', error);
        }
      };

      fetchBranches();
    }
  }, [isVehicleModalOpen]); 
  const fetchDrivers = async () => {
    try {
      const response = await axiosInstance.get('/drivers'); // Replace with actual endpoint
      setDrivers(response.data.drivers); // Assuming response has a drivers array
    } catch (error) {
      console.error('Error fetching drivers:', error);
      alert('An error occurred while fetching drivers.');
    }
  };

  const handleCreateVehicle = async (e) => {
    e.preventDefault();

    try {
      // Send the request to create a new vehicle
      const response = await axiosInstance.post('/add-vehicle', newVehicleData); // Replace with actual endpoint

      // Check if the response contains a success message
      if (response.data && response.data.message) {
        alert(response.data.message); // Show the success message returned by the backend
      } else {
        // If no message is provided, assume success and show a generic success message
        alert("Vehicle created successfully");
        window.location.reload();
      }

      // Close the modal and refresh the vehicle list
      setIsVehicleModalOpen(false);
      fetchVehicles();

    } catch (error) {
      console.error('Error creating vehicle:', error);

      // Check if the error response contains a message
      if (error.response && error.response.data && error.response.data.message) {
        alert(error.response.data.message); // Show error message from the API
      } else {
        alert('An error occurred while creating the vehicle. Please try again.'); // Generic error message
      }
    }
  };



  const handleAssignVehicleToDriver = async (e) => {
    e.preventDefault();

    // Check if both vehicle and driver are selected
    if (!selectedDriver || !selectedVehicleId) {
      alert("Please select both vehicle and driver.");
      return;
    }

    try {
      // Send the request to assign the vehicle to the driver
      const response = await axiosInstance.post('/assign-vehicle', {
        vehicleId: selectedVehicleId,
        driverId: selectedDriver
      });

      // If the response has a success message, show it
      if (response.data && response.data.message) {
        alert(response.data.message); // This will show success or error message
      } else {
        // If no message in the response, you can assume a success status and show a success message
        alert("Vehicle successfully assigned to the driver.");
        window.location.reload();
      }

      // Close the modal and refresh the vehicle list
      setIsVehicleModalOpen1(false);
      fetchVehicles();

    } catch (error) {
      console.error('Error assigning vehicle:', error);

      // Handle the error response if there is one
      if (error.response && error.response.data && error.response.data.message) {
        alert(error.response.data.message); // Show error message from the API
      } else {
        alert("An error occurred while assigning the vehicle. Please try again."); // Generic error message
      }
    }
  };
  function formatDateTime(dateString) {
    const date = new Date(dateString);
    if (isNaN(date)) {
      return "Not Given Date"; // Fallback if date is invalid
  }
    const options = {
      year: 'numeric',
      month: 'short', // Use 'long' for full month name or '2-digit' for numeric
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true, // Set to false for 24-hour format
    };
    return date.toLocaleString('en-US', options);
  }

  
  const downloadPDF = () => {
    const doc = new jsPDF();
    const title = "Vehicles by Branch Report";
    
    // Set font for title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(title, 105, 15, { align: "center" });
    
    // Adjust for spacing between branches
    let currentY = 30;
    
    vehiclesByBranch.forEach((item, index) => {
      const branch = item.branch.name;
      
      // Branch Header - Bold and Larger font
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(`Branch: ${branch}`, 10, currentY);
      
      // Add some spacing before the vehicle table
      currentY += 10;
  
      // Vehicle Table - Styling for header
      const vehicleData = item.vehicles.map((vehicle) => [
        vehicle.name,
        vehicle.plateNumber,
        vehicle.vehicleType,
        vehicle.owner.name,
        vehicle.owner.email,
        vehicle.status,
        new Date(vehicle.createdAt1).toLocaleDateString(),
      ]);
      
      // Table headers
      const tableHeaders = [
        "Name", "Plate Number", "Vehicle Type", "Owner Name", "Owner Email", "Status", "Created Date"
      ];
  
      // Add Vehicle Table with dynamic spacing
      doc.autoTable({
        startY: currentY,
        head: [tableHeaders],
        body: vehicleData,
        styles: { 
          font: 'helvetica', 
          fontSize: 10, 
          cellPadding: 5, 
          valign: 'middle', 
          halign: 'center',
          lineWidth: 0.1, 
          lineColor: [0, 122, 255],  // Blue border
          fillColor: [230, 230, 250], // Light purple for header row
        },
        alternateRowStyles: { fillColor: [255, 255, 255] }, // White for alternate rows
        margin: { left: 10, right: 10 },
      });
      
      // Adjust currentY for next table
      currentY = doc.lastAutoTable.finalY + 10;  // Keep dynamic space between tables
  
      // Ensure page break if content exceeds the page height
      if (currentY > 250) {
        doc.addPage();
        currentY = 30; // Reset for new page
      }
    });
  
    // Save the PDF
    doc.save("Vehicles_By_Branch.pdf");
  };
  
  
  
  const handleStartVehicle = () => {
    if (vehiclesByBranch[0].vehicles[0].vehicleType !== "others") {
      setError("Vehicle type is not 'others'. Cannot start the vehicle.");
      return;
    }
    setActionType("start");
    setIsModalOpen1(true);
    console.log('hahahahaha11111',isModalOpen1)
  };

  const handleEndVehicle = () => {
    if (vehiclesByBranch[0].vehicles[0].vehicleType !== "others") {
      setError("Vehicle type is not 'others'. Cannot end the vehicle.");
      return;
    }
    setActionType("end");
    setIsModalOpen1(true);
  };

  const handleMeterReadingSubmit = async () => {
    if (!enteredMeterReading) {
      setError("Please enter the meter reading.");
      return;
    }

    try {
      // Calculate the total hours based on the action type (start or end)
      const response = await axiosInstance.post(`/startAndEnd`, {
        vehicleId: vehiclesByBranch[0].vehicles[0]._id,
        currentMeterReading: enteredMeterReading,
        vehicleType: vehiclesByBranch[0].vehicles[0].vehicleType,
        actionType:actionType
      });

      if (response.data.success) {
        setIsVehicleStarted(actionType === "start");
        alert(`${actionType === "start" ? "Vehicle started" : "Vehicle ended"}!`);
        setIsModalOpen1(false);
      }
    } catch (err) {
      setError("Error processing the vehicle action. Please try again.");
      console.error(err);
    }
  };

  const closeModal = () => {
    setIsModalOpen1(false);
    setEnteredMeterReading("");
    setError(null);
  };

  if (!vehiclesByBranch) {
    return <div>Loading...</div>;
  }

  const filteredVehiclesByBranch = vehiclesByBranch
    .map((branchGroup) => ({
      ...branchGroup,
      vehicles: branchGroup.vehicles.filter((vehicle) => {
        const vehicleDate = new Date(vehicle.createdAt);
console.log('vehicleDate',vehicleDate)
        // Normalize start and end dates
        const startDateObj = startDate
          ? new Date(new Date(startDate).setHours(0, 0, 0, 0))
          : null;
        const endDateObj = endDate
          ? new Date(new Date(endDate).setHours(23, 59, 59, 999))
          : null;

        // Check if vehicle's createdAt falls within date range
        const isDateInRange =
          (!startDateObj || vehicleDate >= startDateObj) &&
          (!endDateObj || vehicleDate <= endDateObj);

        // Search query matching (branch, vehicle name, plate number)
        const searchQueryLower = searchQuery.toLowerCase();
        const isMatch =
          branchGroup.branch.name.toLowerCase().includes(searchQueryLower) ||
          vehicle.name.toLowerCase().includes(searchQueryLower) ||
          vehicle.plateNumber.toLowerCase().includes(searchQueryLower);

        return isDateInRange && isMatch;
      }),
    }))
    .filter((branchGroup) => branchGroup.vehicles.length > 0);


  const indexOfLastVehicle = currentPage * vehiclesPerPage;
  const indexOfFirstVehicle = indexOfLastVehicle - vehiclesPerPage;
  const currentVehicles = filteredVehiclesByBranch.slice(indexOfFirstVehicle, indexOfLastVehicle);

  const totalPages = Math.ceil(filteredVehiclesByBranch.length / vehiclesPerPage);
 

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const handleView = (vehicle) => {
    setModalMode('view');
    setSelectedVehicle(vehicle);
    setIsModalOpen(true);
  };

  const handleEdit = (vehicle) => {
    setModalMode('edit');
    setSelectedVehicle(vehicle);
    console.log('selectedVehicle,',selectedVehicle)
    setIsModalOpen(false);
    alert('please contact to our admin!!!!')
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };
console.log('vehiclesByBranch',vehiclesByBranch)
  return (
    <div className="w-full p-4 bg-white overflow-y-auto ">
      {/* Filter Inputs */}

      {/* Modal Buttons */}
      <div className="flex flex-col gap-3 justify-normal sm:flex-row sm:justify-between items-center mb-4">
        <button onClick={() => setIsVehicleModalOpen(true)} className="btn btn-primary flex items-center w-full bg-green-600 text-white sm:w-auto gap-2 p-3 rounded-lg">
          <FaCar /> Create Vehicle
        </button>
        <button onClick={() => setIsVehicleModalOpen1(true)} className="btn btn-secondary flex items-center gap-2 bg-blue-600 text-white w-full sm:w-auto p-3 rounded-lg">
          <FaCheck/>Assign Vehicle
        </button>
        <button onClick={downloadPDF} className="bg-red-500 text-white w-full sm:w-auto px-4 py-2 rounded-lg flex items-center">
          <span className="mr-2">&#128196;</span> PDF
        </button>
      </div>

      {/* Create Vehicle Modal */}
      <Modal isOpen={isVehicleModalOpen} onClose={() => setIsVehicleModalOpen(false)} className="modal">
        <h2 className="text-xl font-bold text-green-600 mb-6">Create Vehicle</h2>
        <form onSubmit={handleCreateVehicle}>
          <div className="mb-4">
            <label className="block text-gray-700">Vehicle Name</label>
            <input
              type="text"
              value={newVehicleData.name}
              onChange={(e) => setNewVehicleData({ ...newVehicleData, name: e.target.value })}
              className="w-full mt-2 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-300 focus:border-blue-300"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Plate Number</label>
            <input
              type="text"
              value={newVehicleData.plateNumber}
              onChange={(e) => setNewVehicleData({ ...newVehicleData, plateNumber: e.target.value })}
              className="w-full mt-2 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-300 focus:border-blue-300"
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700">Vehicle Type</label>
            <select
              value={newVehicleData.type}
              onChange={(e) => setNewVehicleData({ ...newVehicleData, type: e.target.value })}
              className="w-full mt-2 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-300 focus:border-blue-300"
            >
              <option value="car">Car</option>
              <option value="truck">Truck</option>
              <option value="bike">Bike</option>
              <option value="others">Machinary Vehicles</option>
            </select>
          </div>
          <div className="mb-6">
          <label className="block text-gray-700">Select Branch</label>
          <select
            value={newVehicleData.branchId}
            onChange={(e) => setNewVehicleData({ ...newVehicleData, branchId: e.target.value })}
            className="w-full mt-2 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-300 focus:border-blue-300"
          >
            <option value="">Select Branch</option>
            {branches.map((branch) => (
              <option key={branch._id} value={branch._id}>
                {branch.name}
              </option>
            ))}
          </select>
        </div>
          <button type="submit" className="w-full bg-green-600 text-white py-2 rounded-full">Create Vehicle</button>
        </form>
      </Modal>

      {/* Assign Vehicle Modal */}
      <Modal isOpen={isVehicleModalOpen1} onClose={() => setIsVehicleModalOpen1(false)} className="modal">
        <h2 className="text-xl font-bold text-green-600 mb-6">Assign Vehicle</h2>
        <form onSubmit={handleAssignVehicleToDriver}>
          <div className="mb-6">
            <label className="block text-gray-700">Select Vehicle</label>
            <select
              onChange={(e) => setSelectedVehicleId(e.target.value)}
              className="w-full mt-2 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-300 focus:border-blue-300"
            >
              <option value="">Select Vehicle</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle._id} value={vehicle._id}>{vehicle.plateNumber}</option>
              ))}
            </select>
          </div>
          <div className="mb-6">
            <label className="block text-gray-700">Select Driver</label>
            <select
              onChange={(e) => setSelectedDriver(e.target.value)}
              className="w-full mt-2 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-300 focus:border-blue-300"
            >
              <option value="">Select Driver</option>
              {drivers.map((driver) => (
                <option key={driver._id} value={driver._id}>{driver.name}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="w-full bg-green-600 text-white py-2 rounded-full">Assign Vehicle</button>
        </form>
      </Modal>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="VEHICLE NO."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-300 focus:border-blue-300"
          />
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">&#128269;</span>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}  // Updates the start date
            className="border w-full sm:w-auto rounded-lg px-4 py-2 focus:outline-none bg-gray-50"
          />
          <span className="text-sm font-medium">TO</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}  // Updates the end date
            className="border rounded-lg px-4 py-2 focus:outline-none w-full sm:w-auto bg-gray-50"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6">
  {currentVehicles.map((branchGroup, branchIndex) => (
    <div key={branchIndex} className="space-x-6">
      <div className="border-b border-gray-300 pb-4">
        {/* Branch Name */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          {branchGroup.branch.name}
        </h2>
        
        {/* Vehicles */}
        <div className=" grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {branchGroup.vehicles.map((vehicle, vehicleIndex) => {
            const vehicleTypeIcon = vehicle.vehicleType ? (
              vehicle.vehicleType === 'bike' ? (
                <FaMotorcycle className="text-gray-500" />
              ) : vehicle.vehicleType === 'car' ? (
                <FaCar className="text-gray-500" />
              ) : vehicle.vehicleType === 'truck' ? (
                <FaTruck className="text-gray-500" />
              ) : null
            ) : null;

            return (
              <div
                key={vehicleIndex}
                className="max-w-[380px] rounded-lg border border-gray-300 shadow-xl transform hover:scale-105 transition-transform duration-300 ease-in-out"
              >
                <div className="bg-gradient-to-r from-sky-600 to-teal-500 text-white p-4 rounded-t-lg">
                  <h2 className="text-xl font-semibold">{vehicle.name || "N/A"}</h2>
                  <p className="text-sm">
                    {`Plate Number: ${vehicle.plateNumber || "N/A"}`}
                  </p>
                </div>
                <div className="p-4 bg-white rounded-b-lg shadow-sm">
                  <div className="mb-4">
                    <div className="text-gray-800 font-medium">Driver</div>
                    <p>{vehicle.driver?.name || "Not Assigned"}</p>
                  </div>
                  <div className="mb-4">
                    <div className="text-gray-800 font-medium">Driver Phone</div>
                    <p>{vehicle.driver?.phoneNumber || "Not Assigned"}</p>
                  </div>
                  <div className="mb-4">
                    <div className="text-gray-800 font-medium">Status</div>
                    <p
                      className={`font-bold ${
                        vehicle.status === "completed"
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      {vehicle.status || "Not Given"}
                    </p>
                  </div>
                  <div className="mb-4">
                    <div className="text-gray-800 font-medium">Vehicle Type</div>
                    <div className="flex items-center space-x-2">
                      <span>{vehicle.vehicleType?.toUpperCase() || "N/A"}</span>
                    </div>
                  </div>
                  {
  vehicle.vehicleType === 'others' && (
    <div className="mb-4">
      <div className="text-gray-800 font-medium">Total Hours For The Day</div>
      <div className="flex items-center space-x-2">
        <span>{vehicle?.totalHours}Hr</span>
      </div>
    </div>
  )
}

                  <div className="mb-4">
                    <div className="text-gray-800 font-medium">Date</div>
                    <p>{new Date(vehicle.createdAt1).toLocaleDateString()}</p>
                  </div>
                  {/* Actions */}
                  <div className="flex gap-2 mt-4">
                    <button
                      className="px-4 py-2 text-xs text-white bg-blue-500 rounded hover:bg-blue-600"
                      onClick={() => handleEdit(vehicle)}
                    >
                      Edit
                    </button>
                    <button
                      className="px-4 py-2 text-xs text-white bg-gray-500 rounded hover:bg-gray-600"
                      onClick={() => handleView(vehicle)}
                    >
                      View
                    </button>
                  </div>
                  <div className="flex gap-2 mt-4">
            <button
              className="px-4 py-2 text-xs text-white bg-blue-500 rounded hover:bg-blue-600"
              onClick={handleStartVehicle}
              disabled={isVehicleStarted}
            >
              {isVehicleStarted ? "Vehicle Started" : "Start Vehicle"}
            </button>
            {isVehicleStarted && (
              <button
                className="px-4 py-2 text-xs text-white bg-gray-500 rounded hover:bg-gray-600"
                onClick={handleEndVehicle}
              >
                End Vehicle
              </button>
            )}
          </div>
          {isModalOpen1 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-md shadow-lg w-96">
            <h3 className="text-xl font-semibold mb-4">
              {actionType === "start" ? "Start Vehicle" : "End Vehicle"}
            </h3>
            <div className="mb-4">
              <label htmlFor="meterReading" className="block text-sm font-medium">
                Enter Meter Reading:
              </label>
              <input
                type="number"
                id="meterReading"
                value={enteredMeterReading}
                onChange={(e) => setEnteredMeterReading(e.target.value)}
                placeholder="Enter Meter Reading"
                className="mt-1 px-3 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <div className="flex justify-end gap-3">
              <button
                onClick={handleMeterReadingSubmit}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
              >
                Submit
              </button>
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  ))}
</div>

{/* Pagination */}
<div className="flex justify-center mt-6 space-x-4">
  <button
    onClick={() => paginate(currentPage - 1)}
    disabled={currentPage === 1}
    className="px-4 py-2 mx-1 bg-gray-300 rounded-lg disabled:opacity-50"
  >
    Previous
  </button>
  {Array.from({ length: totalPages }, (_, index) => (
    <button
      key={index}
      onClick={() => paginate(index + 1)}
      className={`px-4 py-2 mx-1 rounded-lg ${
        currentPage === index + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200'
      }`}
    >
      {index + 1}
    </button>
  ))}
  <button
    onClick={() => paginate(currentPage + 1)}
    disabled={currentPage === totalPages}
    className="px-4 py-2 mx-1 bg-gray-300 rounded-lg disabled:opacity-50"
  >
    Next
  </button>
</div>

    

      <VehicleModal
      isOpen={isModalOpen}
      onClose={handleCloseModal}
      vehicle={selectedVehicle}
      mode={modalMode}
    />
    </div>
  );
};

export default VehicleTable;
