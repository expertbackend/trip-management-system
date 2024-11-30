import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaDownload, FaEye, FaTimes } from "react-icons/fa";
import jsPDF from "jspdf"; // For PDF generation
import Modal from "../components/Modal";
import BookingModal from "./BookingModal";
import "jspdf-autotable"; // Import the jsPDF autotable plugin

const BookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [bookingsPerPage] = useState(5); // Adjust per page items
  const [selectedBooking, setSelectedBooking] = useState(null); // State for selected booking
  const [isModalOpen, setIsModalOpen] = useState(false);
  const token = localStorage.getItem("token");
  const [mode, setMode] = useState("add");

  const axiosInstance = axios.create({
    baseURL: `${process.env.REACT_APP_API_URL}/api/booking`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await axiosInstance.get("/bookings");
        setBookings(response.data.bookings);
        setFilteredBookings(response.data.bookings);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch bookings.");
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  // Pagination Logic
  const indexOfLastBooking = (currentPage + 1) * bookingsPerPage;
  const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage;
  const currentBookings = filteredBookings.slice(indexOfFirstBooking, indexOfLastBooking);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Format Date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(
      new Date(dateString)
    );
  };
  const generatePDF = (tyresToDownload) => {
    const doc = new jsPDF();
    
    // Define table columns for tyre records
    const tableColumns = [
      "Serial No.",
      "Brand",
      "Vehicle Plate",
      "Position",
      "Mileage",
      "Installed at KM",
      "Amount",
      "Purchased From",
      "Created At"
    ];
  
    if (!tyresToDownload.length) {
      alert("No data available to download.");
      return;
    }
  
    // Prepare data for the table
    const tableData = tyresToDownload.map((tyre) => [
      tyre.tyreSerielNo || "N/A",
      tyre.tyreBrand || "N/A",
      tyre.vehicle?.plateNumber || "N/A",
      tyre.tyrePosition || "N/A",
      tyre.tyreMileage || "N/A",
      tyre.installedAtKm || "N/A",
      `${tyre.tyreAmount?.toFixed(2) || "N/A"}`,
      tyre.purchaseFrom || "N/A",
      tyre.createdAt || "N/A"
    ]);
  
    // Add title to the PDF
    doc.text("Tyre Records Overview", 10, 10);
  
    // Add table to the PDF
    doc.autoTable({
      head: [tableColumns],
      body: tableData,
      startY: 20, // Start table from Y position 20 to leave space for the title
      theme: "grid", // Grid style for better visibility of data
      headStyles: { fillColor: [0, 0, 0] }, // Black background for headers
      styles: {
        fontSize: 10,
        cellPadding: 2,
        valign: "middle",
      },
    });
  
    // Save the generated PDF
    doc.save("tyre_records.pdf");
  };
  // Handle Search
  const handleSearch = (query) => {
    setSearchQuery(query);
    const lowerCaseQuery = query.toLowerCase();
    setFilteredBookings(
      bookings.filter(
        (booking) =>
          booking.customerName?.toLowerCase().includes(lowerCaseQuery) ||
          booking.vehicle?.name?.toLowerCase().includes(lowerCaseQuery) ||
          booking.driver?.name?.toLowerCase().includes(lowerCaseQuery) ||
          booking.pickupLocation?.address?.toLowerCase().includes(lowerCaseQuery) ||
          booking.dropoffLocation?.address?.toLowerCase().includes(lowerCaseQuery)
      )
    );
  };

  // Handle Filter
  const handleFilter = (status) => {
    setStatusFilter(status);
    if (status === "All") {
      setFilteredBookings(bookings);
    } else {
      setFilteredBookings(
        bookings.filter((booking) => booking.status.toLowerCase() === status.toLowerCase())
      );
    }
  };

  // Handle Individual Download or All Download
  const handleDownload = (type, bookingId) => {
    if (type === "all") {
      generatePDF(filteredBookings); // Download all bookings
    } else if (type === "individual" && bookingId) {
      const selectedBooking = filteredBookings.find((booking) => booking._id === bookingId);
      if (selectedBooking) {
        generatePDF([selectedBooking]); // Download selected booking as a single PDF
      }
    }
  };

  // Handle Cancel Booking
  const handleCancelBooking = async (id) => {
    // Show confirmation prompt
    const isConfirmed = window.confirm("Are you sure you want to cancel this booking?");

    if (isConfirmed) {
      try {
        // API call to cancel the booking
        const response = await axiosInstance.delete(`/bookings/${id}`);

        // Check if the response is successful
        if (response.status === 200) {
          // Remove the canceled booking from the state
          setBookings(bookings.filter((booking) => booking._id !== id));
          setFilteredBookings(filteredBookings.filter((booking) => booking._id !== id));

          alert("Booking canceled successfully!");
          window.location.reload()
        }
      } catch (err) {
        // Check if the error response is from the server
        if (err.response) {
          // If error response exists, show error message from backend
          alert(err.response.data.message || "An error occurred while canceling the booking.");
        } else {
          // If error response doesn't exist, show a general error message
          alert("An error occurred. Please try again later.");
        }
      }
    }
  };



  // Calculate the number of days between two dates
  const calculateDaysCount = (startDate, endDate) => {
    if (!startDate || !endDate) return "N/A";

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Calculate time difference in days
    const timeDiff = end - start;
    const days = timeDiff / (1000 * 3600 * 24); // Convert time difference to days

    // Include the end date by adding 1 to the result
    return days >= 0 ? (days + 1) : "Invalid Date Range"; // Ensure valid range
  };


  // Handle View Booking
  const handleViewBooking = (booking) => {
    setSelectedBooking(booking);
    setMode("view");
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };
  if (loading) return <div>Loading bookings...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className=" mx-auto p-6 overflow-y-auto max-h-[100vh]">
      <h1 className="text-3xl font-semibold mb-6">Bookings Overview</h1>

      {/* Search and Filter */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4 w-2/3">
          <input
            type="text"
            placeholder="Search by Customer Name, Driver Name, or Vehicle Name"
            className="w-full py-3 px-5 text-xl bg-gray-100 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-500 placeholder-opacity-70 transition-all duration-300"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          // className="px-4 py-2 border border-gray-300 rounded-lg w-2/5"
          />
          <select
            value={statusFilter}
            onChange={(e) => handleFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg w-2/5"
          >
            <option value="All">All</option>
            <option value="Completed">Completed</option>
            <option value="Pending">Pending</option>
            <option value="Cancelled">Cancelled</option>
            <option value="In-Progress">In-Progress</option>
          </select>
        </div>
        <button
          onClick={() => handleDownload("all")}
          className="bg-green-500 text-white px-4 py-2 rounded-lg"
        >
          Download All Bookings as PDF
        </button>
      </div>


      {/* Table */}
      <div className="overflow-x-auto min-w-full">
        <table className="table-auto w-full border border-gray-200 shadow-lg rounded-lg text-base">
          <thead>
            <tr className="bg-blue-300 text-gray-700 font-semibold">
              <th className="px-4 py-2">SL No.</th> {/* Serial Number Column */}
              <th className="px-4 py-2">Customer Name</th>
              <th className="px-4 py-2">Vehicle</th>
              <th className="px-4 py-2">Vehicle No</th>
              <th className="px-4 py-2">Driver</th>
              <th className="px-4 py-2">Pickup Location</th>
              <th className="px-4 py-2">Dropoff Location</th>
              <th className="px-4 py-2">Fare</th>
              <th className="px-4 py-2">KM</th>
              <th className="px-4 py-2">Dates & Days</th> {/* Updated Column Name */}
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentBookings.map((booking, index) => (
              <tr key={booking._id} className="border-t hover:bg-gray-100 transition">
                <td className="px-4 py-2">{index + 1}</td> {/* Serial Number for each row */}
                <td className="px-4 py-2">{booking.customerName || "N/A"}</td>
                <td className="px-4 py-2">{booking.vehicle?.name || "N/A"}</td>
                <td className="px-4 py-2">{booking.vehicle?.plateNumber || "N/A"}</td>
                <td className="px-4 py-2">{booking.driver?.name || "N/A"}</td>
                <td className="px-4 py-2">{booking.pickupLocation?.address || "N/A"}</td>
                <td className="px-4 py-2">{booking.dropoffLocation?.address || "N/A"}</td>
                <td className="px-4 py-2">₹{booking.fare?.toFixed(2) || "N/A"}</td>
                <td className="px-4 py-2">{booking.kmDriven || "N/A"}</td>
                <td className="px-4 py-2">
                  {`Start: ${formatDate(booking.startDate)}\nEnd: ${formatDate(
                    booking.endDate
                  )}\nDays: ${calculateDaysCount(booking.startDate, booking.endDate)}`}
                </td>
                <td className="px-4 py-2">{booking.status || "N/A"}</td>
                <td className="px-4 py-2">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleViewBooking(booking)}
                      className="text-blue-500"
                      title="view booking"
                    >
                      <FaEye />
                    </button>
                    <button
                      onClick={() => handleCancelBooking(booking._id)}
                      className="text-red-500"
                      title="cancel booking"
                    >
                      <FaTimes />
                    </button>
                    <button
                      onClick={() => handleDownload("individual", booking._id)}
                      className="text-green-500"
                      title="download booking"
                    >
                      <FaDownload />
                    </button>
                  </div>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>



      {/* Pagination */}
      <div className="flex justify-center mt-6">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 0}
          className="bg-gray-300 text-gray-600 px-4 py-2 rounded-lg mr-2"
        >
          Prev
        </button>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={indexOfLastBooking >= filteredBookings.length}
          className="bg-gray-300 text-gray-600 px-4 py-2 rounded-lg"
        >
          Next
        </button>
      </div>
      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        booking={selectedBooking}
        mode={mode}
      />
    </div>
  );
};

export default BookingsPage;
