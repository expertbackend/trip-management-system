import React, { useState, useEffect } from "react";
import axios from "axios";

const TripReport = () => {
  const [vehicleId, setVehicleId] = useState("");
  const [vehicles, setVehicles] = useState([]);
  const [period, setPeriod] = useState("day");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [vehicleLoading, setVehicleLoading] = useState(false);
  const token = localStorage.getItem("token");

  const axiosInstance = axios.create({
    baseURL: `${process.env.REACT_APP_API_URL}/api/booking`,
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

  const fetchVehicles = async () => {
    try {
      setVehicleLoading(true);
      const response = await axiosInstance1.get("/vehicles");
      setVehicles(response.data.vehicles);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      alert("Failed to fetch vehicles. Please try again.");
    } finally {
      setVehicleLoading(false);
    }
  };

  const fetchTripReports = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/reports/trips", {
        params: { vehicleId, period, startDate, endDate },
      });
      setReport(response.data.report);
    } catch (error) {
      console.error("Error fetching trip reports:", error);
      alert("Failed to fetch trip reports. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  return (
    <div className="mx-auto bg-white shadow-md  rounded overflow-y-auto max-h-[90vh] p-6">
      <h1 className="text-2xl font-bold mb-4">Vehicle-Wise Trip Report</h1>
      <div className="grid grid-cols-4 gap-4 mb-4">
        {/* Vehicle Selection */}
        <div>
          <label htmlFor="vehicleId" className="block text-sm font-medium text-gray-700">
            Select Vehicle
          </label>
          <select
            id="vehicleId"
            value={vehicleId}
            onChange={(e) => setVehicleId(e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Select Vehicle</option>
            {vehicleLoading ? (
              <option value="">Loading...</option>
            ) : (
              vehicles.map((vehicle) => (
                <option key={vehicle._id} value={vehicle._id}>
                  {vehicle.name} - {vehicle.plateNumber}
                </option>
              ))
            )}
          </select>
        </div>
        {/* Period Selection */}
        <div>
          <label htmlFor="period" className="block text-sm font-medium text-gray-700">
            Select Period
          </label>
          <select
            id="period"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="day">Day</option>
            <option value="week">Week</option>
            <option value="month">Month</option>
          </select>
        </div>
        {/* Start Date */}
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
            Start Date
          </label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        {/* End Date */}
        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
            End Date
          </label>
          <input
            type="date"
            id="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>
      <button
        onClick={fetchTripReports}
        disabled={loading}
        className="bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700"
      >
        {loading ? "Loading..." : "Fetch Report"}
      </button>

      {/* Report Table */}
      {report && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Report Summary</h2>
          <table className="min-w-full bg-white">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-2 px-4 border-b">Period</th>
                <th className="py-2 px-4 border-b">Vehicle Name</th>
                <th className="py-2 px-4 border-b">Plate Number</th>
                <th className="py-2 px-4 border-b">Total Trips</th>
                <th className="py-2 px-4 border-b">Total Fare</th>
                <th className="py-2 px-4 border-b">Total KM</th>
                <th className="py-2 px-4 border-b">Extra Expenses</th>
                <th className="py-2 px-4 border-b">Total Profit</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-2 px-4 border-b">{report.period}</td>
                <td className="py-2 px-4 border-b">{report.vehicleName}</td>
                <td className="py-2 px-4 border-b">{report.plateNumber}</td>
                <td className="py-2 px-4 border-b">{report.totalTrips}</td>
                <td className="py-2 px-4 border-b">{report.totalFare}</td>
                <td className="py-2 px-4 border-b">{report.totalKmDriven}</td>
                <td className="py-2 px-4 border-b">{report.extraExpenses}</td>
                <td className="py-2 px-4 border-b">{report.totalProfit}</td>
              </tr>
            </tbody>
          </table>

          <h2 className="text-xl font-semibold mt-6 mb-4">Trip Details</h2>
          <table className="min-w-full bg-white">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-2 px-4 border-b">Booking ID</th>
                <th className="py-2 px-4 border-b">Driver Name</th>
                <th className="py-2 px-4 border-b">Trip Date</th>
                <th className="py-2 px-4 border-b">Fare</th>
                <th className="py-2 px-4 border-b">KM Driven</th>
                <th className="py-2 px-4 border-b">Extra Expenses</th>
                <th className="py-2 px-4 border-b">Profit</th>
              </tr>
            </thead>
            <tbody>
              {report.bookings.map((booking) => (
                <tr key={booking.bookingId}>
                  <td className="py-2 px-4 border-b">{booking.bookingId}</td>
                  <td className="py-2 px-4 border-b">{booking.driverName}</td>
                  <td className="py-2 px-4 border-b">
                    {new Date(booking.tripDate).toLocaleDateString()}
                  </td>
                  <td className="py-2 px-4 border-b">{booking.fare}</td>
                  <td className="py-2 px-4 border-b">{booking.kmDriven}</td>
                  <td className="py-2 px-4 border-b">{booking.extraExpenses}</td>
                  <td className="py-2 px-4 border-b">{booking.profit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TripReport;
