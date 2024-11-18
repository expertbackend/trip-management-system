import React, { useState, useEffect } from "react";
import axios from "axios";
import { jsPDF } from "jspdf";

function ViewExpenses() {
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1); // Track current page
  const [itemsPerPage, setItemsPerPage] = useState(10); // Items per page
  const [driverFilter, setDriverFilter] = useState(""); // Driver filter
  const [startDateFilter, setStartDateFilter] = useState(""); // Start date filter
  const [endDateFilter, setEndDateFilter] = useState(""); // End date filter

  const token = localStorage.getItem("token");

  const axiosInstance = axios.create({
    baseURL: `${process.env.REACT_APP_API_URL}/api/booking`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  // Fetch expenses on component mount
  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const response = await axiosInstance.get("/view-expanse");
        const driverExpenses = response.data.driverExpenses;
        // Filter out drivers with no expenses
        const driversWithExpenses = driverExpenses.filter(driver => driver.expenses.length > 0);
        setExpenses(driversWithExpenses);
        setFilteredExpenses(driversWithExpenses); // Set initial filtered expenses
        console.log('Fetched Expenses:', response.data);
      } catch (error) {
        console.error("Error fetching expenses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, []);

  // Helper function to format dates consistently (YYYY-MM-DD)
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Get month (01-12)
    const day = String(date.getDate()).padStart(2, '0'); // Get day (01-31)
    const year = date.getFullYear(); // Get year (YYYY)
    return `${year}-${month}-${day}`; // Return formatted date in YYYY-MM-DD
  };

  // Apply filters
  useEffect(() => {
    let filtered = expenses;

    if (driverFilter) {
      filtered = filtered.filter((expense) =>
        expense.driverName.toLowerCase().includes(driverFilter.toLowerCase())
      );
    }

    if (startDateFilter && endDateFilter) {
      filtered = filtered.filter((expense) => {
        const expenseDate = formatDate(expense.expenses[0]?.date); // Get the first expense date
        return expenseDate >= startDateFilter && expenseDate <= endDateFilter;
      });
    }

    setFilteredExpenses(filtered);
    setPage(1); // Reset to first page when filters change
  }, [driverFilter, startDateFilter, endDateFilter, expenses]);

  // Pagination logic
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedExpenses = filteredExpenses.slice(startIndex, endIndex);

  // Calculate total expenses for a driver
  const calculateTotalExpense = (driverExpenses) => {
    return driverExpenses.reduce((total, expense) => total + parseFloat(expense.amount || 0), 0);
  };

  // Generate PDF of all expenses or individual driver expenses
  const generatePDF = (isAll = true, driverName = "") => {
    const doc = new jsPDF();
  
    // Data for the PDF
    const expensesToPrint = isAll
      ? filteredExpenses
      : expenses.filter((exp) => exp.driverName === driverName);
  
    // Title based on whether we are printing for all drivers or a specific driver
    doc.text(isAll ? "All Driver Expenses" : `${driverName}'s Expenses`, 14, 10);
  
    // Table Column Titles
    const header = ["Driver Name", "Expense Type", "Amount", "Date"];
    
    // Create an array of rows for the table
    const body = expensesToPrint.map((driverExpense) => {
      const driverTotal = calculateTotalExpense(driverExpense.expenses).toFixed(2); // Calculate total for each driver
  
      // Initialize the array for storing the expenses data
      const expenseDetails = driverExpense.expenses.map((expense, index) => {
        // If it's the first expense for this driver, include the driver's name, else leave it empty
        return [
          index === 0 ? driverExpense.driverName : "", // Only show driver name on the first expense row
          expense.expenseType || "N/A",
          expense.amount || "0.00",
          formatDate(expense.date), // Ensure consistent date format
        ];
      });
  
      // Add the total row for this driver at the end of the list
      expenseDetails.push([
        "",
        "Total Expense",
        driverTotal, // Display total for the driver
        ""
      ]);
  
      return expenseDetails;
    }).flat(); // Flatten the array to display all expenses in one row per driver
  
    // Add a final total row for all drivers if "isAll" is true
    if (isAll) {
      const totalExpense = filteredExpenses.reduce((total, driverExpense) => {
        return total + calculateTotalExpense(driverExpense.expenses);
      }, 0).toFixed(2); // Total expense for all drivers
  
      // Add total expense row at the bottom
      body.push(["", "", "", `Total Expense: ${totalExpense}`]);
    }
  
    // Stylish table options
    doc.autoTable({
      head: [header],
      body: body,
      startY: 20,
      theme: 'grid',
      styles: {
        fontSize: 10,
        cellPadding: 4,
        halign: 'center',
        valign: 'middle',
        overflow: 'linebreak',
        font: 'helvetica',
        lineColor: [0, 0, 0],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [100, 100, 255], // Blue header background
        textColor: [255, 255, 255], // White text in header
        fontStyle: 'bold',
      },
      bodyStyles: {
        fillColor: [240, 240, 240], // Light gray background for body rows
      },
      margin: { top: 30 },
    });
  
    // Save the PDF
    doc.save(isAll ? "All_Driver_Expenses.pdf" : `${driverName}_Expenses.pdf`);
  };
  
  

  return (
    <div className="overflow-y-auto max-h-[90vh] p-4">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Driver-wise Expenses</h2>

      {/* Filter Inputs */}
      <div className="mb-4 flex justify-between items-center gap-4">
        {/* Driver name filter */}
        <input
          type="text"
          placeholder="Filter by driver name"
          value={driverFilter}
          onChange={(e) => setDriverFilter(e.target.value)}
          className="border p-2 rounded"
        />

        {/* Start date filter */}
        <input
          type="date"
          value={startDateFilter}
          onChange={(e) => setStartDateFilter(e.target.value)}
          className="border p-2 rounded"
        />

        {/* End date filter */}
        <input
          type="date"
          value={endDateFilter}
          onChange={(e) => setEndDateFilter(e.target.value)}
          className="border p-2 rounded"
        />

        {/* Download All Expenses PDF button */}
        <button
          onClick={() => generatePDF(true)}
          className="bg-blue-500 text-white p-2 rounded"
        >
          Download All Expenses PDF
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading expenses...</p>
      ) : filteredExpenses.length === 0 ? (
        <p className="text-gray-500">No expenses available for the selected filters.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-3 text-left">Sl No.</th>
                <th className="border border-gray-300 p-3 text-left">Driver Name</th>
                <th className="border border-gray-300 p-3 text-left">Expense Type</th>
                <th className="border border-gray-300 p-3 text-left">Amount</th>
                <th className="border border-gray-300 p-3 text-left">Date</th>
                <th className="border border-gray-300 p-3 text-left">Total Expense</th>
                <th className="border border-gray-300 p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedExpenses.map((driverExpense, index) => {
                const hasExpenses = driverExpense.expenses.length > 0;
                const expenseDate = hasExpenses ? formatDate(driverExpense.expenses[0].date) : "N/A"; // Get the first expense date
                return (
                  <React.Fragment key={index}>
                    {hasExpenses ? (
                      driverExpense.expenses.map((expense, expenseIndex) => (
                        <tr key={expenseIndex} className="text-gray-700">
                          {expenseIndex === 0 && (
                            <td
                              rowSpan={driverExpense.expenses.length}
                              className="border border-gray-300 p-3 font-semibold"
                            >
                              {startIndex + index + 1}
                            </td>
                          )}
                          {expenseIndex === 0 && (
                            <td
                              rowSpan={driverExpense.expenses.length}
                              className="border border-gray-300 p-3 font-semibold"
                            >
                              {driverExpense.driverName}
                            </td>
                          )}
                          <td className="border border-gray-300 p-3">{expense.expenseType || "N/A"}</td>
                          <td className="border border-gray-300 p-3">{expense.amount || "0.00"}</td>
                          <td className="border border-gray-300 p-3">{expenseDate}</td> {/* Display single date */}
                          {expenseIndex === 0 && (
                            <td
                              rowSpan={driverExpense.expenses.length}
                              className="border border-gray-300 p-3 font-bold bg-gray-100"
                            >
                              {calculateTotalExpense(driverExpense.expenses).toFixed(2)}
                            </td>
                          )}
                          {expenseIndex === 0 && (
                            <td
                              rowSpan={driverExpense.expenses.length}
                              className="border border-gray-300 p-3"
                            >
                              <button
                                onClick={() => generatePDF(false, driverExpense.driverName)}
                                className="bg-green-500 text-white p-2 rounded"
                              >
                                Download PDF
                              </button>
                            </td>
                          )}
                        </tr>
                      ))
                    ) : null} {/* Skip rendering if no expenses */}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => setPage(Math.max(page - 1, 1))}
              className="bg-gray-500 text-white p-2 rounded"
            >
              Previous
            </button>
            <span className="text-gray-700">{`Page ${page} of ${Math.ceil(filteredExpenses.length / itemsPerPage)}`}</span>
            <button
              onClick={() => setPage(Math.min(page + 1, Math.ceil(filteredExpenses.length / itemsPerPage)))}
              className="bg-gray-500 text-white p-2 rounded"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ViewExpenses;
