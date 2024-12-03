import React, { useState, useEffect } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import Chart from "chart.js/auto";
import { FaCar, FaChartLine, FaMoneyBill, FaRupeeSign } from "react-icons/fa";
import { FiTruck } from "react-icons/fi";
import { MdAttachMoney } from "react-icons/md"; 
const Home = () => {
  const token = localStorage.getItem("token");

  // States for storing financial summary and selected period
  const [financialData, setFinancialData] = useState(null);
  const [period, setPeriod] = useState("last7days"); // Default to 'today'
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [activeTab, setActiveTab] = useState("vehicles"); // Track active tab

  // Pagination states
  const [vehiclePage, setVehiclePage] = useState(1);
  const [driverPage, setDriverPage] = useState(1);
  const [vehiclesPerPage] = useState(2); // Items per page for vehicles
  const [driversPerPage] = useState(2); // Items per page for drivers

  const axiosInstance = axios.create({
    baseURL: `${process.env.REACT_APP_API_URL}/api`, // Replace with the correct base URL for your API
    headers: {
      Authorization: `Bearer ${token}`, // Include the token in the Authorization header
    },
  });

  // Fetch financial data from the API
  useEffect(() => {
    const fetchFinancialData = async () => {
      try {
        const response = await axiosInstance.get(
          `/booking/financial-summary?period=${period}`
        );
        setFinancialData(response.data.data); // Assuming the data comes in 'data' property
      } catch (error) {
        console.error("Error fetching financial data:", error);
      }
    };

    fetchFinancialData();
  }, [period]); // Re-fetch data whenever the period changes

  // Fetch vehicle and driver data from the API
  useEffect(() => {
    const fetchVehicleAndDriverData = async () => {
      try {
        const response = await axiosInstance.get(
          "/booking/vehicle-driver-list"
        );
        setVehicles(response.data.data.vehicles); // Set vehicles data
        setDrivers(response.data.data.drivers); // Set drivers data
      } catch (error) {
        console.error("Error fetching vehicle and driver data:", error);
      }
    };

    fetchVehicleAndDriverData();
  }, []);

  // Calculate the total sum of each financial value for the cards
  const totalFare =
    financialData?.totalFare.reduce((acc, value) => acc + value, 0) || 0;
  const totalTaxAmount =
    financialData?.totalTaxAmount.reduce((acc, value) => acc + value, 0) || 0;
  const totalTollAmount =
    financialData?.totalTollAmount.reduce((acc, value) => acc + value, 0) || 0;
  const totalDiscountAmount =
    financialData?.totalDiscountAmount.reduce((acc, value) => acc + value, 0) ||
    0;
  const totalProfit =
    financialData?.totalProfit.reduce((acc, value) => acc + value, 0) || 0;
  const totalExtraExpanse =
    financialData?.totalExtraExpanse.reduce((acc, value) => acc + value, 0) ||
    0;

  // Prepare data for the Line Chart
  const lineChartData = {
    labels: financialData?.dates || [], // Dates for x-axis (e.g., today, last 7 days, month)
    datasets: [
      {
        label: "Total Fare",
        data: financialData?.totalFare || [], // Data for total fare
        borderColor: "#FF6384",
        fill: false,
        tension: 0.1,
      },
      {
        label: "Total Tax",
        data: financialData?.totalTaxAmount || [], // Data for total tax
        borderColor: "#FFCE56",
        fill: false,
        tension: 0.1,
      },
      {
        label: "Total Toll",
        data: financialData?.totalTollAmount || [], // Data for total toll
        borderColor: "#36A2EB",
        fill: false,
        tension: 0.1,
      },
      {
        label: "Total Discount",
        data: financialData?.totalDiscountAmount || [], // Data for total discount
        borderColor: "#4BC0C0",
        fill: false,
        tension: 0.1,
      },
    ],
  };

  // Render vehicle rows in table with pagination
  const renderVehicleRows = () => {
    const indexOfLastVehicle = vehiclePage * vehiclesPerPage;
    const indexOfFirstVehicle = indexOfLastVehicle - vehiclesPerPage;
    const currentVehicles = vehicles.slice(
      indexOfFirstVehicle,
      indexOfLastVehicle
    );

    return currentVehicles.map((vehicle, index) => {
      let statusColor;
      let statusText;

      // Determine the status color based on the vehicle's current status
      switch (vehicle.status) {
        case "created":
          statusColor = "bg-gray-300 text-gray-800"; // Light Gray for created
          statusText = "Created";
          break;
        case "pending":
          statusColor = "bg-gray-300 text-gray-800"; // Light Gray for created
          statusText = "Pending";
          break;
        case "assigned":
          statusColor = "bg-blue-300 text-blue-800"; // Light Blue for assigned
          statusText = "Assigned";
          break;
        case "running":
          statusColor = "bg-green-300 text-green-800"; // Green for running
          statusText = "Running";
          break;
        case "completed":
          statusColor = "bg-purple-300 text-purple-800"; // Purple for completed
          statusText = "Completed";
          break;
        case "in-progress":
          statusColor = "bg-purple-300 text-purple-800"; // Purple for completed
          statusText = "In-Progress";
          break;
        default:
          statusColor = "bg-gray-200 text-gray-600"; // Default color for unknown status
          statusText = "Unknown";
      }

      return (
        <tr
          key={vehicle._id}
          className={`${
            index % 2 === 0 ? "bg-gray-50" : "bg-white"
          } hover:bg-gray-200 transition-all duration-300 ease-in-out transform `}
        >
          <td className="p-4 text-sm font-medium text-gray-900">
            {vehicle.name}
          </td>
          <td className="p-4 text-sm font-medium text-gray-900">
            {vehicle.plateNumber}
          </td>
          <td className="p-4 text-sm font-medium">
            <span
              className={`inline-flex items-center justify-center px-3 py-1.5 text-xs font-semibold rounded-full ${statusColor}`}
            >
              {statusText}
            </span>
          </td>
          <td className="p-4 text-sm font-medium text-gray-900">
            {vehicle.driver ? vehicle.driver.name : "No Driver"}
          </td>
        </tr>
      );
    });
  };

  // Render driver rows in table with pagination
  const renderDriverRows = () => {
    const indexOfLastDriver = driverPage * driversPerPage;
    const indexOfFirstDriver = indexOfLastDriver - driversPerPage;
    const currentDrivers = drivers.slice(indexOfFirstDriver, indexOfLastDriver);

    return currentDrivers.map((driver, index) => {
      let statusColor;
      let statusText;

      // Determine the status color based on the driver's current status
      switch (driver.status) {
        case "active":
          statusColor = "bg-green-300 text-green-800"; // Green for active
          statusText = "Active";
          break;
        case "inactive":
          statusColor = "bg-gray-300 text-gray-800"; // Gray for inactive
          statusText = "Inactive";
          break;
        case "on_leave":
          statusColor = "bg-yellow-300 text-yellow-800"; // Yellow for on leave
          statusText = "On Leave";
          break;
        default:
          statusColor = "bg-gray-200 text-gray-600"; // Default color for unknown status
          statusText = "Unknown";
      }

      return (
        <tr
          key={driver._id}
          className={`${
            index % 2 === 0 ? "bg-gray-50" : "bg-white"
          } hover:bg-gray-200 transition-all duration-300 ease-in-out transform `}
        >
          <td className="p-4 text-sm font-medium text-gray-900">
            {driver.name}
          </td>
          <td className="p-4 text-sm font-medium text-gray-900">
            {driver.email}
          </td>
          <td className="p-4 text-sm font-medium text-gray-900">
            {driver.phoneNumber}
          </td>

          <td className="p-4 text-sm font-medium">
            <span
              className={`inline-flex items-center justify-center px-3 py-1.5 text-xs font-semibold rounded-full ${statusColor}`}
            >
              {statusText}
            </span>
          </td>
          <td className="p-4 text-sm font-medium text-gray-900">
            {driver.vehicleCount}
          </td>
        </tr>
      );
    });
  };

  // Handle page change for vehicles
  const handleVehiclePageChange = (pageNumber) => {
    setVehiclePage(pageNumber);
  };

  // Handle page change for drivers
  const handleDriverPageChange = (pageNumber) => {
    setDriverPage(pageNumber);
  };

  // Pagination for vehicles
  const totalVehiclePages = Math.ceil(vehicles.length / vehiclesPerPage);
  const vehiclePageNumbers = [];
  for (let i = 1; i <= totalVehiclePages; i++) {
    vehiclePageNumbers.push(i);
  }

  // Pagination for drivers
  const totalDriverPages = Math.ceil(drivers.length / driversPerPage);
  const driverPageNumbers = [];
  for (let i = 1; i <= totalDriverPages; i++) {
    driverPageNumbers.push(i);
  }

  return (
    <div className="overflow-y-auto max-h-[90vh] p-4">
      <h1 className="text-4xl text-center mb-6">Dashboard</h1>

      {/* Filter for period */}
      <div className="flex justify-end mb-6">
        <select
          className="p-2 border rounded"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
        >
          <option value="today">Today</option>
          <option value="last7days" selected>
            Last 7 Days
          </option>
          <option value="month">This Month</option>
        </select>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {financialData && (
          <>
            <div className="p-4 bg-green-700 text-white rounded-lg shadow-md hover:shadow-lg hover:shadow-green-300 hover:bg-green-800 transition-all ease-in-out flex justify-between items-center">
              <span>
                <h3 className="text-3xl font-semibold">Total Fare</h3>
                <p className="text-2xl">{totalFare.toFixed(2)}</p>
              </span>
              <FaRupeeSign className="text-4xl"/>
            </div>
            <div className="p-4 bg-yellow-600 text-white rounded-lg shadow-md hover:shadow-lg hover:shadow-yellow-600 hover:bg-yellow-700 transition-all ease-in-out flex justify-between items-center">
              <span>
                <h3 className="text-3xl font-semibold">Total Tax</h3>
                <p className="text-2xl">{totalTaxAmount.toFixed(2)}</p>
              </span>
              <FaCar className="text-4xl"/>
            </div>
            <div className="p-4 bg-blue-700 text-white rounded-lg shadow-md hover:shadow-lg hover:shadow-blue-600 hover:bg-blue-800 transition-all ease-in-out flex justify-between items-center">
              <span>
                <h3 className="text-3xl font-semibold">Total Toll</h3>
                <p className="text-2xl">{totalTollAmount.toFixed(2)}</p>
              </span>
              <FiTruck className="text-4xl"/>
            </div>
            <div className="p-4 bg-purple-700 text-white rounded-lg shadow-md hover:shadow-lg hover:shadow-purple-500 hover:bg-purple-800 transition-all ease-in-out flex justify-between items-center">
              <span>
                <h3 className="text-3xl font-semibold">Total Discount</h3>
                <p className="text-2xl">{totalDiscountAmount.toFixed(2)}</p>
              </span>
              <FaMoneyBill className="text-4xl"/>
            </div>
            <div className="p-4 bg-sky-700 text-white rounded-lg shadow-md hover:shadow-lg hover:shadow-sky-300 hover:bg-sky-800 transition-all ease-in-out flex justify-between items-center">
              <span>
                <h3 className="text-3xl font-semibold">Profit</h3>
                <p className="text-2xl">{totalProfit.toFixed(2)}</p>
              </span>
              <FaChartLine className="text-4xl" />
            </div>
            <div className="p-4 bg-red-700 text-white rounded-lg shadow-md hover:shadow-lg hover:shadow-red-500 hover:bg-red-800 transition-all ease-in-out flex justify-between items-center">
              <span>
                <h3 className="text-3xl font-semibold">Extra Expense</h3>
                <p className="text-2xl">{totalExtraExpanse.toFixed(2)}</p>
              </span>
              <MdAttachMoney className="text-4xl"/>
            </div>
          </>
        )}
      </div>

      {/* Layout for Tabs and Chart */}
      <div className="  mt-8">
        {/* Left: Tabs for Vehicle and Driver List */}
        <div className="w-full  sm:w-auto ">
          <div className="flex space-x-4 mb-4">
            <button
              className={`p-3 w-full text-center font-semibold text-lg rounded-lg transition-all duration-300 ease-in-out transform ${
                activeTab === "vehicles"
                  ? "bg-indigo-300 text-indigo-900 shadow-sm scale-100 border border-indigo-400"
                  : "bg-transparent text-indigo-600 hover:bg-indigo-100 hover:text-indigo-800 hover:shadow-md"
              }`}
              onClick={() => setActiveTab("vehicles")}
            >
              Vehicles ({vehicles.length})
            </button>
            <button
              className={`p-3 w-full text-center font-semibold text-lg rounded-lg transition-all duration-300 ease-in-out transform ${
                activeTab === "drivers"
                  ? "bg-teal-300 text-teal-900 shadow-sm scale-100 border border-teal-400"
                  : "bg-transparent text-teal-600 hover:bg-teal-100 hover:text-teal-800 hover:shadow-md"
              }`}
              onClick={() => setActiveTab("drivers")}
            >
              Drivers ({drivers.length})
            </button>
          </div>

          {/* Table content based on active tab */}
          <div className="overflow-x-auto">
            {activeTab === "vehicles" ? (
              <div>
                <table className="min-w-full table-auto bg-white shadow-md rounded-lg overflow-hidden border border-gray-300">
                  <thead className="bg-blue-800 text-white">
                    <tr>
                      <th className="p-4 text-left font-semibold text-lg">
                        Name
                      </th>
                      <th className="p-4 text-left font-semibold text-lg">
                        Plate Number
                      </th>
                      <th className="p-4 text-left font-semibold text-lg">
                        Status
                      </th>
                      <th className="p-4 text-left font-semibold text-lg">
                        Driver
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-800">{renderVehicleRows()}</tbody>
                </table>

                {/* Vehicle Pagination */}
                <div className="flex justify-center space-x-2 mt-4">
                  {vehiclePageNumbers.map((number) => (
                    <button
                      key={number}
                      onClick={() => handleVehiclePageChange(number)}
                      className={`p-2 border rounded ${
                        vehiclePage === number ? "bg-blue-600 text-white" : ""
                      }`}
                    >
                      {number}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <table className="min-w-full table-auto bg-white shadow-md rounded-lg overflow-hidden border border-gray-300">
                  <thead className="bg-blue-800 text-white">
                    <tr>
                      <th className="p-4 text-left font-semibold text-lg">
                        Name
                      </th>
                      <th className="p-4 text-left font-semibold text-lg">
                        Email
                      </th>
                      <th className="p-4 text-left font-semibold text-lg">
                        Phone Number
                      </th>
                      <th className="p-4 text-left font-semibold text-lg">
                        Status
                      </th>
                      <th className="p-4 text-left font-semibold text-lg">
                        Vehicle Count
                      </th>
                    </tr>
                  </thead>
                  <tbody>{renderDriverRows()}</tbody>
                </table>

                {/* Driver Pagination */}
                <div className="flex justify-center space-x-2 mt-4">
                  {driverPageNumbers.map((number) => (
                    <button
                      key={number}
                      onClick={() => handleDriverPageChange(number)}
                      className={`p-2 border rounded ${
                        driverPage === number ? "bg-blue-600 text-white" : ""
                      }`}
                    >
                      {number}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Right: Financial Distribution Chart */}
      <div className="w-full sm:w-auto mt-10">
        {financialData && (
          <div>
            <h2 className="text-2xl sm:text-3xl text-center mb-4 font-bold">
              Financial Distribution Over Time
            </h2>
            <div className="w-full sm:w-auto">
              <Line data={lineChartData} options={{ responsive: true }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
