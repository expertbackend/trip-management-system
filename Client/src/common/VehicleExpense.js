import React, { useEffect, useState } from "react";
import axios from "axios";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const ExpenseManagement = () => {
  const [expenses, setExpenses] = useState([]);
  const [totalProfit, setTotalProfit] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [totalReceivedAmount, settotalReceivedAmount] = useState(0);

  const [finalProfit, setFinalProfit] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dateRange, setDateRange] = useState("last1month"); // Default to Last 1 Month
  const [customDates, setCustomDates] = useState({ from: "", to: "" });

  const token = localStorage.getItem("token");

  const axiosInstance = axios.create({
    baseURL: `${process.env.REACT_APP_API_URL}/api/tyre`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  useEffect(() => {
    const fetchFilteredData = async () => {
      try {
        setLoading(true);

        let params = {};
        if (dateRange === "custom" && customDates.from && customDates.to) {
          params.startDate = customDates.from;
          params.endDate = customDates.to;
        } else {
          params.range = dateRange; // Pass predefined ranges (e.g., 'last1month', 'last3months')
        }

        const response = await axiosInstance.get("/calculate-profit", { params });
        const { totalBookingProfit, finalProfit, expensesData, totalExpenses ,totalReceivedAmount} = response.data;

        setTotalProfit(totalBookingProfit);
        setFinalProfit(finalProfit);
        setTotalExpense(totalExpenses);
        setExpenses(expensesData);
        settotalReceivedAmount(totalReceivedAmount)
      } catch (err) {
        setError("Failed to fetch data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredData();
  }, [dateRange, customDates]);

  const handleDateRangeChange = (range) => {
    setDateRange(range);
    if (range !== "custom") {
      setCustomDates({ from: "", to: "" });
    }
  };

  const handleCustomDateChange = (field, date) => {
    setCustomDates((prev) => ({
      ...prev,
      [field]: date,
    }));
    setDateRange("custom");
  };

  // Calculate expenses by category
  const expenseByCategory = expenses.reduce((categories, expense) => {
    Object.entries(expense).forEach(([category, amount]) => {
      if (category !== "vehicleId") {
        categories[category] = (categories[category] || 0) + amount;
      }
    });
    return categories;
  }, {});

  // Chart Data
  const pieChartData = {
    labels: Object.keys(expenseByCategory),
    datasets: [
      {
        data: Object.values(expenseByCategory),
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
      },
    ],
  };

  const barChartData = {
    labels: Object.keys(expenseByCategory),
    datasets: [
      {
        label: "Expenses by Category",
        data: Object.values(expenseByCategory),
        backgroundColor: "#36A2EB",
        borderColor: "#2C8D99",
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="expense-management p-6 bg-gray-50 rounded-lg shadow-xl">
    <h2 className="text-3xl font-semibold mb-6 text-center text-gray-700">Expense Dashboard</h2>
  
    {loading && <p className="text-xl text-gray-600 text-center animate-pulse">Loading...</p>}
    {error && <p className="text-xl text-red-500 text-center">{error}</p>}
  
    {/* Filter Section */}
    <div className="filter-section mb-6 flex justify-between items-center">
      <label className="text-lg font-medium text-gray-600">Filter by:</label>
      <select
        value={dateRange}
        onChange={(e) => handleDateRangeChange(e.target.value)}
        className="p-3 border rounded-lg bg-white shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <option value="last1month">Last 1 Month</option>
        <option value="last3months">Last 3 Months</option>
        <option value="last6months">Last 6 Months</option>
        <option value="lastyear">Last Year</option>
        <option value="custom">Custom Date Range</option>
      </select>
  
      {dateRange === "custom" && (
        <div className="mt-4 flex gap-8">
          <div className="w-1/2">
            <label className="block text-sm font-medium text-gray-600 mb-2">From Date</label>
            <input
              type="date"
              value={customDates.from}
              onChange={(e) => handleCustomDateChange("from", e.target.value)}
              className="p-3 border rounded-lg bg-white shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="w-1/2">
            <label className="block text-sm font-medium text-gray-600 mb-2">To Date</label>
            <input
              type="date"
              value={customDates.to}
              onChange={(e) => handleCustomDateChange("to", e.target.value)}
              className="p-3 border rounded-lg bg-white shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      )}
    </div>
  
    {/* Summary Cards */}
    <div className="summary-cards grid grid-cols-3 gap-6 mb-8">
      {/* Total Expenses Card */}
      <div className="card bg-gradient-to-r from-teal-400 via-blue-500 to-indigo-600 text-white p-6 rounded-lg shadow-lg text-center transition-all transform hover:scale-105 hover:shadow-xl">
        <h3 className="text-xl font-semibold mb-3">Total Expenses</h3>
        <p className="text-3xl font-bold">₹ {totalExpense}</p>
      </div>
      <div className="card bg-gradient-to-r from-teal-400 via-blue-500 to-indigo-600 text-white p-6 rounded-lg shadow-lg text-center transition-all transform hover:scale-105 hover:shadow-xl">
        <h3 className="text-xl font-semibold mb-3">Total Recieved Amount</h3>
        <p className="text-3xl font-bold">₹ {totalReceivedAmount}</p>
      </div>
      {/* Total Profit Card */}
      <div className="card bg-gradient-to-r from-green-400 to-blue-500 text-white p-6 rounded-lg shadow-lg text-center transition-all transform hover:scale-105 hover:shadow-xl">
        <h3 className="text-xl font-semibold mb-3">Total Profit By Bookings</h3>
        <p className="text-3xl font-bold">₹ {totalProfit}</p>
      </div>
  
      {/* Final Profit Card */}
      <div className="card bg-gradient-to-r from-purple-700 to-pink-500 text-white p-6 rounded-lg shadow-lg text-center transition-all transform hover:scale-105 hover:shadow-xl">
        <h3 className="text-xl font-semibold mb-3">Final Profit After Expense</h3>
        <p className="text-3xl font-bold">₹ {finalProfit}</p>
      </div>
    </div>
  
    {/* Chart Section */}
    <div className="charts grid grid-cols-1 sm:grid-cols-2 gap-6">
      {/* Pie Chart */}
      <div className="bg-gradient-to-r from-pink-500 via-red-500 to-orange-500 p-4 border rounded-lg shadow-2xl transition-all transform hover:scale-105 hover:shadow-xl w-full h-[300px] flex flex-col justify-between">
        <h3 className="text-2xl font-semibold text-white mb-4">Expenses by Category (Pie Chart)</h3>
        <div className="relative w-full h-full">
          <Pie data={pieChartData} options={{ responsive: true, maintainAspectRatio: false }} />
        </div>
      </div>
  
      {/* Bar Chart */}
      <div className="bg-gradient-to-r from-indigo-600 via-blue-500 to-teal-400 p-4 border rounded-lg shadow-2xl transition-all transform hover:scale-105 hover:shadow-xl w-full h-[300px] flex flex-col justify-between">
        <h3 className="text-2xl font-semibold text-white mb-4">Expenses by Category (Bar Chart)</h3>
        <div className="relative w-full h-full">
          <Bar data={barChartData} options={{ responsive: true, maintainAspectRatio: false }} />
        </div>
      </div>
    </div>
  </div>
  
  

  );
};

export default ExpenseManagement;
