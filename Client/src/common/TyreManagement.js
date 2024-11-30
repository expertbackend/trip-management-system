import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaUser } from "react-icons/fa";
import { jsPDF } from "jspdf";

const TyreManagement = () => {
  const token = localStorage.getItem('token');

  const axiosInstance = axios.create({
    baseURL: `${process.env.REACT_APP_API_URL}/api/tyre`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const axiosInstance1 = axios.create({
    baseURL: `${process.env.REACT_APP_API_URL}/api/owner`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const [tyreData, setTyreData] = useState({
    tyreBrand: "",
    tyreSerielNo: "",
    tyreAmount: "",
    purchaseFrom: "",
    vehicleId: "",
    tyrePosition: "",
    tyreMileage: "",
    installedAtKm: "",
  });

  const [statusQuery, setStatusQuery] = useState({
    vehicleId: "",
    tyrePosition: "",
    currentKm: "",
  });

  const [status, setStatus] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [tyres, setTyres] = useState([]);
  const [isCreateTyreModalOpen, setIsCreateTyreModalOpen] = useState(false);
  const [isCheckStatusModalOpen, setIsCheckStatusModalOpen] = useState(false);
  const [filteredTyres, setFilteredTyres] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  useEffect(() => {
    fetchVehicles();
    fetchTyres();
  }, []);

  // Fetch list of vehicles from API
  const fetchVehicles = async () => {
    try {
      const response = await axiosInstance1.get("/vehicles"); // Change this based on your actual API endpoint
      setVehicles(response.data.vehicles);
      console.log('hahahahahaah',response.data)
    } catch (error) {
      console.error("Error fetching vehicles:", error);
    }
  };

  // Fetch tyres list from API
  const fetchTyres = async () => {
    try {
      const response = await axiosInstance.get();
      console.log('response.data',response.data.data)
      setFilteredTyres(response.data.data);
      setTyres(response.data.data)
    } catch (error) {
      console.error("Error fetching tyres:", error);
    }
  };

  // Handle registering a new tyre
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post("/register", tyreData);
      alert("Tyre registered successfully!");
      setIsCreateTyreModalOpen(false); // Close modal after successful registration
      fetchTyres(); // Refresh the tyre list
    } catch (error) {
      console.error("Error registering tyre:", error);
    }
  };

  // Check tyre status based on query parameters
  const checkTyreStatus = async () => {
    try {
        const { vehicleId, tyrePosition, currentKm } = statusQuery;
console.log('statusQuery',statusQuery)
        // Corrected API endpoint to match the backend route '/check/:vehicleId/:tyrePosition'
        const response = await axiosInstance.get(`/check/${vehicleId}/${tyrePosition}?currentKm=${currentKm}`);

        // Once we get the response, update the status with the response data
        setStatus(response.data);
        alert(response.data?.message)
    } catch (error) {
        console.error("Error checking tyre status:", error);
    }
};

const handleClickAction = (plateNumber,tyrePosition) => {
    console.log(`Clicked action for vehicle with plate number: ${plateNumber} ${tyrePosition}`);
    setStatusQuery({
        vehicleId: plateNumber, // Assuming vehiclePlate is the vehicle ID in your system
        tyrePosition,
        currentKm: "", // You can leave currentKm empty or set an initial value
      });
    setIsCheckStatusModalOpen(true);
  };

  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    
    // Filter tyres based on the query
    const filtered = tyres.filter((tyre) => 
      tyre.vehicle.plateNumber.toLowerCase().includes(query) ||
    tyre.purchaseFrom.toLowerCase().includes(query) ||    
     tyre.tyreBrand.toLowerCase().includes(query)

    );
    console.log('filtered',filtered)
    setFilteredTyres(filtered);
  };

  const generatePDF = (data) => {
    console.log('data',data)
    const doc = new jsPDF();
  
    // Add Header
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Tyre Records", doc.internal.pageSize.getWidth() / 2, 20, { align: "center" });
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, doc.internal.pageSize.getWidth() / 2, 30, { align: "center" });
  
    // Define Table Data
    const tableColumnHeaders = [
      "Serial No.",
      "Brand",
      "Vehicle Plate",
      "Position",
      "Mileage",
      "Installed at KM",
      "Amount",
      "Purchased From",
    ];
    const tableRows = data.map((tyre) => [
      tyre.tyreSerielNo,
      tyre.tyreBrand,
      tyre.vehicle?.plateNumber || "N/A",
      tyre.tyrePosition,
      tyre.tyreMileage || "N/A",
      tyre.installedAtKm || "N/A",
      tyre.tyreAmount || "N/A",
      tyre.purchaseFrom,
    ]);
  
    // Add AutoTable for Stylish Table
    doc.autoTable({
      head: [tableColumnHeaders],
      body: tableRows,
      startY: 40, // Start below the header
      theme: "grid", // Use a grid theme
      styles: {
        fontSize: 10,
        halign: "center", // Center align text
      },
      headStyles: {
        fillColor: [22, 160, 133], // Custom greenish color for header
        textColor: 255, // White text for header
        fontSize: 12,
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240], // Light gray for alternate rows
      },
      margin: { top: 40 },
    });
  
    // Add Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      const pageHeight = doc.internal.pageSize.getHeight();
      doc.setFontSize(10);
      doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.getWidth() - 20, pageHeight - 10, {
        align: "right",
      });
    }
  
    // Save the PDF
    doc.save("tyre_records_stylish.pdf");
  };
  const indexOfLastTyre = currentPage * itemsPerPage;
  const indexOfFirstTyre = indexOfLastTyre - itemsPerPage;
  const currentTyres = filteredTyres.slice(indexOfFirstTyre, indexOfLastTyre);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-gray-800 text-center">Tyre Management</h2>



      {/* Create Tyre Form */}
      {isCreateTyreModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50">
          <div className="bg-white p-6 shadow-lg rounded-lg w-full md:w-1/2 lg:w-1/3">
            <form className="space-y-6" onSubmit={handleRegister}>
              <h3 className="text-xl font-semibold text-gray-700">Register Tyre</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Tyre Brand"
                  value={tyreData.tyreBrand}
                  onChange={(e) => setTyreData({ ...tyreData, tyreBrand: e.target.value })}
                  className="border p-3 rounded-lg w-full focus:ring focus:ring-blue-300"
                />
                <input
                  type="text"
                  placeholder="Serial Number"
                  value={tyreData.tyreSerielNo}
                  onChange={(e) => setTyreData({ ...tyreData, tyreSerielNo: e.target.value })}
                  className="border p-3 rounded-lg w-full focus:ring focus:ring-blue-300"
                />
                <input
                  type="number"
                  placeholder="Amount"
                  value={tyreData.tyreAmount}
                  onChange={(e) => setTyreData({ ...tyreData, tyreAmount: e.target.value })}
                  className="border p-3 rounded-lg w-full focus:ring focus:ring-blue-300"
                />
                <input
                  type="text"
                  placeholder="Purchased From"
                  value={tyreData.purchaseFrom}
                  onChange={(e) => setTyreData({ ...tyreData, purchaseFrom: e.target.value })}
                  className="border p-3 rounded-lg w-full focus:ring focus:ring-blue-300"
                />

                {/* Vehicle ID Dropdown */}
                <select
                  value={tyreData.vehicleId}
                  onChange={(e) => setTyreData({ ...tyreData, vehicleId: e.target.value })}
                  className="border p-3 rounded-lg w-full focus:ring focus:ring-blue-300"
                >
                  <option value="">Select Vehicle</option>
                  {vehicles.map((vehicle) => (
                    <option key={vehicle._id} value={vehicle._id}>
                      {vehicle.name} ({vehicle.plateNumber})
                    </option>
                  ))}
                </select>

                <select
  value={statusQuery.tyrePosition}
  onChange={(e) => setStatusQuery({ ...statusQuery, tyrePosition: e.target.value })}
  className="border p-3 rounded-lg w-full focus:ring focus:ring-green-300"
>
  <option value="">Select Tyre Position</option>
  <option value="front-left">Front Left</option>
  <option value="front-right">Front Right</option>
  <option value="rear-left-1">Rear Left 1</option>
  <option value="rear-right-1">Rear Right 1</option>
  <option value="rear-left-2">Rear Left 2</option>
  <option value="rear-right-2">Rear Right 2</option>
  <option value="rear-left-3">Rear Left 3</option>
  <option value="rear-right-3">Rear Right 3</option>
  <option value="rear-left-4">Rear Left 4</option>
  <option value="rear-right-4">Rear Right 4</option>
  <option value="rear-left-5">Rear Left 5</option>
  <option value="rear-right-5">Rear Right 5</option>
  <option value="spare">Spare</option>
</select>

                <input
                  type="number"
                  placeholder="Mileage"
                  value={tyreData.tyreMileage}
                  onChange={(e) => setTyreData({ ...tyreData, tyreMileage: e.target.value })}
                  className="border p-3 rounded-lg w-full focus:ring focus:ring-blue-300"
                />
                <input
                  type="number"
                  placeholder="Installed at KM"
                  value={tyreData.installedAtKm}
                  onChange={(e) => setTyreData({ ...tyreData, installedAtKm: e.target.value })}
                  className="border p-3 rounded-lg w-full focus:ring focus:ring-blue-300"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 focus:ring focus:ring-blue-300 transition-all"
              >
                Register Tyre
              </button>
            </form>

            <button
              onClick={() => setIsCreateTyreModalOpen(false)}
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Check Tyre Status Form */}
      {isCheckStatusModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50">
          <div className="bg-white p-6 shadow-lg rounded-lg w-full md:w-1/2 lg:w-1/3">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Check Tyre Status</h3>
            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); checkTyreStatus(); }}>
              <input
                type="number"
                placeholder="Enter Current KM"
                value={statusQuery.currentKm}
                onChange={(e) => setStatusQuery({ ...statusQuery, currentKm: e.target.value })}
                className="border p-3 rounded-lg w-full focus:ring focus:ring-blue-300"
              />
              <button
                type="submit"
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 focus:ring focus:ring-green-300 transition-all"
              >
                Check Status
              </button>
            </form>
            {status && (
  <div className="mt-6 max-w-md mx-auto bg-white shadow-lg rounded-lg p-6 space-y-4">
    <h4 className="text-2xl font-semibold text-center text-gray-700">Tyre Status</h4>
    <div className="flex justify-between text-gray-600">
      <span className="font-medium">Tyre Name:</span>
      <span>{status.tyreName}</span>
    </div>
    <div className="flex justify-between text-gray-600">
      <span className="font-medium">Vehicle:</span>
      <span>{status.vehicle}</span>
    </div>
    <div className="flex justify-between text-gray-600">
      <span className="font-medium">Tyre Position:</span>
      <span>{status.tyrePosition}</span>
    </div>
    <div className="flex justify-between text-gray-600">
      <span className="font-medium">KM Driven:</span>
      <span>{status.kmDriven} km</span>
    </div>
    <div className="flex justify-between text-gray-600">
      <span className="font-medium"> Remaining KM :</span>
      <span>{status.remainingLife} km</span>
    </div>
    <div className={`${status.remainingLife <25?'text-red-500 flex justify-between' : 'text-green-500 flex justify-between'}`}>
      <span className="font-medium">Remaining Life:</span>
      <span >{status.remainingLife}%</span>
    </div>

    {/* Optional: Add a progress bar for the remaining life */}
    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4 flex justify-end">
    <div
  className={`${status.remainingLife < 25 ? 'bg-red-500' : 'bg-green-500'} h-2.5 rounded-full`}
  style={{ width: `${status.remainingLife}%` }}
></div>

    </div>
  </div>
)}

          </div>
        </div>
      )}

      {/* All Tyres */}
      <div className="bg-white p-6 shadow-lg rounded-lg">
      <h3 className="text-xl font-semibold text-gray-700 mb-4">All Tyres</h3>

      <div className="mb-4 flex items-center space-x-4">
        <input
          type="text"
          placeholder="Search by Vehicle Number"
          value={searchQuery}
          onChange={handleSearchChange}
          className="border p-3 rounded-lg w-full md:w-1/2 lg:w-1/3"
        />
        <button
           onClick={() => generatePDF(filteredTyres)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 focus:outline-none"
        >
          Download PDF
        </button>
        <button
          onClick={() => setIsCreateTyreModalOpen(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 focus:outline-none"
        >
          Create Tyre
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border-collapse border border-gray-300 text-sm">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-3">Serial No.</th>
              <th className="border p-3">Brand</th>
              <th className="border p-3">Vehicle Plate</th>
              <th className="border p-3">Position</th>
              <th className="border p-3">Mileage</th>
              <th className="border p-3">Installed at KM</th>
              <th className="border p-3">Amount</th>
              <th className="border p-3">Purchased From</th>
              <th className="border p-3">Created At</th>
              <th className="border p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {currentTyres.map((tyre) => (
              <tr key={tyre.tyreSerielNo} className="hover:bg-gray-100">
                <td className="border p-3">{tyre.tyreSerielNo}</td>
                <td className="border p-3">{tyre.tyreBrand}</td>
                <td className="border p-3">{tyre.vehicle.plateNumber}</td>
                <td className="border p-3">{tyre.tyrePosition}</td>
                <td className="border p-3">{tyre.tyreMileage}</td>
                <td className="border p-3">{tyre.installedAtKm}</td>
                <td className="border p-3">{tyre.tyreAmount}</td>
                <td className="border p-3">{tyre.purchaseFrom}</td>
                <td className="border p-3">{tyre.createdAt}</td>
                <td className="border p-3">
                  <button
                    onClick={() => handleClickAction(tyre.vehicle._id, tyre.tyrePosition)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <span role="img" aria-label="action">🔧</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex justify-center space-x-4">
        {Array.from({ length: Math.ceil(filteredTyres.length / itemsPerPage) }, (_, index) => (
          <button
            key={index + 1}
            onClick={() => paginate(index + 1)}
            className={`px-4 py-2 border rounded-lg ${currentPage === index + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
    </div>
  );
};

export default TyreManagement;
