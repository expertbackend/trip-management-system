import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaDownload, FaEdit, FaEye, FaStop, FaTimes } from "react-icons/fa";
import jsPDF from "jspdf"; // For PDF generation
import Modal from "../components/Modal";
import BookingModal from "./BookingModal";
import "jspdf-autotable"; // Import the jsPDF autotable plugin
import { FaPlay } from "react-icons/fa6";
import EditBookingModal from "../modals/EditBookingModal";
import EndBookingModal from "../modals/EndBookingModal";
import Rating from "./Rating";

const BookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [bookingsPerPage] = useState(10); // Adjust per page items
  const [selectedBooking, setSelectedBooking] = useState(null); // State for selected booking
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mode, setMode] = useState("add");
  const [showModal, setShowModal] = useState(false); // For modal visibility
  const [showModal1, setShowModal1] = useState(false); // For modal visibility
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [bookingToStart, setBookingToStart] = useState(null);
  const [successMessage, setSuccessMessage] = useState(""); // For success message
  const [errorMessage, setErrorMessage] = useState("");
  const [editing, setEditBooking] = useState("");
  const [isEditModalOpen,setIsEditModalOpen] = useState("")
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [viewType, setViewType] = useState('grid');
  const token = localStorage.getItem("token");
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
  const openStartBookingModal = (booking) => {
    setBookingToStart(booking); // Set the booking to be started
    console.log('booking',booking)
    setShowModal1(true); // Open the modal
  };

  // Confirm the action and trigger the start booking function
  const openEditBookingModal = (booking) => {
    console.log("Open Edit Modal for booking:", booking);
    // Implement modal logic or state here to open the modal
    setEditBooking(booking); // Example: Use state to manage the modal
    setIsEditModalOpen(true); // Example: Open the modal
  };
  const fetchBookings = async () => {
    try {
      const response = await axiosInstance.get('/');
      setBookings(response.data); // Example: Update your state
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  };
    

  const cancelStartBooking = () => {
    setShowModal1(false); // Close the modal
  };
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

  const closePopup = () => {
    setSuccessMessage("");
    setErrorMessage("");
  };
  const generatePDF = (bookingsToDownload) => {
    const doc = new jsPDF();
  
    if (!bookingsToDownload.length) {
      alert("No data available to download.");
      return;
    }
  
    // Create PDF structure with customer, vehicle, and booking details
    bookingsToDownload.forEach((booking) => {
      // Add Title for the invoice
      doc.text("Invoice for Booking", 10, 10);
      doc.text(`Booking ID: ${booking._id}`, 10, 20);
  
      // Add customer details
      doc.text(`Customer Name: ${booking.customerName}`, 10, 30);
      doc.text(`Phone: ${booking.custPhNo}`, 10, 40);
      doc.text(`Email: ${booking.custEmailId}`, 10, 50);
      doc.text(`Customer Address: ${booking.custAddress}`, 10, 60);
  
      // Add booking details
      doc.text(`Pickup Location: ${booking.pickupLocation?.address || "N/A"}`, 10, 70);
      doc.text(`Dropoff Location: ${booking.dropoffLocation?.address || "N/A"}`, 10, 80);
      doc.text(`Booking Status: ${booking.status}`, 10, 90);
  
      // Add vehicle details
      doc.text(`Vehicle Name: ${booking.vehicle?.name || "N/A"}`, 10, 100);
      doc.text(`Vehicle Plate Number: ${booking.vehicle?.plateNumber || "N/A"}`, 10, 110);
      
      // Add invoice details (fare, charges, etc.)
      doc.text(`Base Pay: ₹${booking.basePay?.toFixed(2) || "N/A"}`, 10, 120);
      doc.text(`Total Estimated Amount: ₹${booking.totalEstimatedAmount?.toFixed(2) || "N/A"}`, 10, 130);
      doc.text(`Advance: ₹${booking.advance?.toFixed(2) || "N/A"}`, 10, 140);
      doc.text(`Remaining Amount: ₹${booking.remainingAmount?.toFixed(2) || "N/A"}`, 10, 150);
      
      // Include per ton charges if applicable (calculated from the perTonPrice and totalNetMaterialWeight)
      const perTonCharge = (booking.perTonPrice * booking.totalNetMaterialWeight).toFixed(2);
      doc.text(`Per Ton Charge: ₹${booking.perTonPrice}`, 10, 160);
      
      // If there is extra expense or unloading fee, add it to the invoice
      if (booking.unloading) {
        doc.text(`Unloading Material Weight: ₹${booking.totalNetMaterialWeight?.toFixed(2) || "0.00"}`, 10, 170);
        doc.text(`Unloading Shortage Material Weight: ₹${booking.shortageWeight?.toFixed(2) || "0.00"}`, 10, 170);

      }
      doc.text(`Unloading Material Weight: ₹${booking.totalNetMaterialWeight?.toFixed(2) || "0.00"}`, 10, 170);

      // Optional: Add tax or discount if applicable
      doc.text(`Tax: ₹${booking.tax?.toFixed(2) || "0.00"}`, 10, 180);
      doc.text(`Discount: ₹${booking.discount?.toFixed(2) || "0.00"}`, 10, 190);
      
      // Add the generated date for the invoice
      const generatedAt = new Date(booking.invoice?.generatedAt).toLocaleDateString();
      doc.text(`Invoice Generated On: ${generatedAt}`, 10, 200);
  
      // Adding a separator line after each booking's invoice details
      doc.setLineWidth(0.5);
      doc.line(10, 210, 200, 210);
      doc.setLineWidth(0); // Reset the line width after the separator
  
      // Add some space between invoices
      doc.addPage();
    });
  
    // Save PDF with a custom filename
    doc.save("invoice_bookings.pdf");
  };


  
  
  // Handle Search
  const handleSearch = () => {
    const lowerCaseQuery = searchQuery.toLowerCase();
    const start = startDate ? new Date(startDate).setHours(0, 0, 0, 0) : null;
    const end = endDate ? new Date(endDate).setHours(23, 59, 59, 999) : null;

    const filtered = bookings.filter((booking) => {
      const bookingDate = new Date(booking.startDate).getTime(); // Replace `booking.date` with your booking date field
      const matchesQuery =
        booking.customerName?.toLowerCase().includes(lowerCaseQuery) ||
        booking.vehicle?.name?.toLowerCase().includes(lowerCaseQuery);
      const matchesStatus =
        statusFilter === "All" ||
        booking.status.toLowerCase() === statusFilter.toLowerCase();
      const matchesDate =
        (!start || bookingDate >= start) && (!end || bookingDate <= end);

      return matchesQuery && matchesStatus && matchesDate;
    });

    setFilteredBookings(filtered);
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
      const selectedBooking = filteredBookings.find(
        (booking) => booking._id === bookingId
      );
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

  const handleStartBooking = async (bookingId) => {
    try {
      // Show a loading spinner or feedback to the user (optional)
      console.log('Starting booking with ID:', bookingId);
  
      // Make the API call to start the booking
      const response = await axiosInstance.put(`/start/${bookingId}`);
      
      // Handle successful booking start
      if (response.status === 200) {
        console.log('Booking started successfully:', response.data);
        
        // Set the success message based on the response from the server
        setSuccessMessage(response.data.message);  // Assuming your API sends a 'message' field in the response
        setErrorMessage("");  // Clear any previous error messages
  
        // You can add additional logic to update the UI if necessary, 
        // such as refreshing the bookings table or changing booking status
      }
    } catch (error) {
      console.error('Error starting booking:', error.response || error.message);
      
      // Show an error message if the API call fails
      setErrorMessage("An error occurred while starting the booking. Please try again.");
      setSuccessMessage("");  // Clear any previous success messages
    }
  };
  
  const confirmStartBooking = async () => {
    // Trigger the API call and update the message directly within the handleStartBooking function
    await handleStartBooking(bookingToStart._id);
  
    // Close the confirmation modal after the API call
    setShowModal(false); // Close the modal once the API response is received
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
// Function to handle editing a booking
const handleEditBooking = (booking) => {
  console.log("Editing booking:", booking);
  setSelectedBooking(booking);
  setIsEditModalOpen(true);
};
const closeEditBookingModal = () => {
  setSelectedBooking(null);
  setIsEditModalOpen(false);
};
const handleEndBooking = (bookingId) => {
  setSelectedBookingId(bookingId);  // Store the booking ID to pass to the modal
  setShowModal(true);  // Show the modal
};

const handleBookingEnded = () => {
  fetchBookings();  // Refresh the booking list after booking is ended
};

const handleDateFilter = () => {
  console.log('bookings',bookings)
  const filtered = bookings.filter((booking) => {
    const bookingDate = new Date(booking.startDate).getTime(); // Replace `booking.date` with your booking date field
    return (
      (!startDate || bookingDate >= startDate) &&
      (!startDate || bookingDate <= endDate)
    );
  });

  setFilteredBookings(filtered);
};
const [bookings1, setBookings1] = useState([
  {
    _id: 1,
    customerName: "John Doe",
    initialRating: 5, // Default rating for this booking
    vehicle: { name: "Car", plateNumber: "ABC123" },
    status: "completed",
  },
  {
    _id: 2,
    customerName: "Jane Smith",
    initialRating: 4, // Default rating for this booking
    vehicle: { name: "Truck", plateNumber: "XYZ456" },
    status: "in-progress",
  },
  {
    _id: 3,
    customerName: "Alex Brown",
    initialRating: 5, // Default rating for this booking
    vehicle: { name: "Bike", plateNumber: "LMN789" },
    status: "completed",
  },
]);

const handleRatingChange = (bookingId, rating) => {
  // Find the booking by ID and update its rating
  setBookings1((prevBookings) =>
    prevBookings.map((booking) =>
      booking._id === bookingId ? { ...booking, initialRating: rating } : booking
    )
  );
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
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-4 ">
          <input
            type="text"
            placeholder="Search by Customer Name, Driver Name, or Vehicle Name"
            className="w-full py-3 px-5 text-sm bg-gray-100 rounded-xl border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-300 focus:border-blue-300 placeholder-gray-500 placeholder-opacity-70 transition-all duration-300 sm:w-auto"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          // className="px-4 py-2 border border-gray-300 rounded-lg w-2/5"
          />
          <select
            value={statusFilter}
            onChange={(e) => handleFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg  w-full sm:w-auto focus:outline-none focus:ring-1 focus:ring-blue-300 focus:border-blue-300"
          >
            <option value="All">All</option>
            <option value="assigned">Assigned</option>
            <option value="Completed">Completed</option>
            <option value="Pending">Pending</option>
            <option value="Cancelled">Cancelled</option>
            <option value="In-Progress">In-Progress</option>
          </select>
        </div>
        <div className="flex space-x-4 mb-4">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="border rounded p-2"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="border rounded p-2"
        />
        <button
          onClick={handleSearch}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Apply Date Filter
        </button>
</div>
        <button
          onClick={() => handleDownload("all")}
          className="bg-green-500 text-white px-4 py-2 rounded-lg w-full sm:w-auto"
        >
          Download All Bookings as PDF
        </button>
      </div>


   {/* Table */}
   <div className="flex justify-end space-x-4 mb-6">
        <button
          onClick={() => setViewType("grid")}
          className={`px-4 py-2 rounded-lg ${
            viewType === "grid"
              ? "bg-sky-500 text-white"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          Grid View
        </button>
        <button
          onClick={() => setViewType("list")}
          className={`px-4 py-2 rounded-lg ${
            viewType === "list"
              ? "bg-sky-500 text-white"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          List View
        </button>
        <button
          onClick={() => setViewType("table")}
          className={`px-4 py-2 rounded-lg ${
            viewType === "table"
              ? "bg-sky-500 text-white"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          Table View
        </button>
      </div>

      {/* Render Based on View Type */}
      {viewType === "grid" && (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
    {currentBookings.map((booking, index) => {
      const serialNumber = index + currentPage * bookingsPerPage + 1;
      const isCompleted = booking.status === "completed";

      return (
        <div
          key={booking._id}
          className="max-w-[380px] rounded-lg border border-gray-300 shadow-xl transform hover:scale-105 transition-transform duration-300 ease-in-out"
        >
          <div className="bg-gradient-to-r from-sky-600 to-teal-500 text-white p-4 rounded-t-lg">
            <h2 className="text-xl font-semibold">{booking.customerName || "N/A"}</h2>
            <p className="text-sm">{`Booking #${serialNumber}`}</p>
          </div>
          <div className="p-4 bg-white rounded-b-lg shadow-sm">
            <div className="mb-4">
              <div className="text-gray-800 font-medium">Vehicle</div>
              <p>{booking.vehicle?.name || "N/A"} - {booking.vehicle?.plateNumber || "N/A"}</p>
            </div>
            <div className="mb-4">
              <div className="text-gray-800 font-medium">Driver</div>
              <p>{booking.driver?.name || "N/A"}</p>
            </div>
            <div className="mb-4">
              <div className="text-gray-800 font-medium">Fare</div>
              <p>₹{booking.basePay?.toFixed(2) || "N/A"}</p>
            </div>
            <div className="mb-4">
              <div className="text-gray-800 font-medium">Status</div>
              <p
                className={`font-bold ${isCompleted ? 'text-green-500' : 'text-red-500'}`}
              >
                {booking.status || "N/A"}
              </p>
            </div>

            {/* Show additional information if status is 'Completed' */}
            {isCompleted && (
              <>
                <div className="mb-4">
                  <div className="text-gray-800 font-medium">Start Date</div>
                  <p>{booking.startDate || "N/A"}</p>
                </div>
                <div className="mb-4">
                  <div className="text-gray-800 font-medium">End Date</div>
                  <p>{new Date(booking.endDate).toLocaleDateString()
                  || "N/A"}</p>
                </div>
                <div className="mb-4">
                  <div className="text-gray-800 font-medium">Pickup Location</div>
                  <p>{booking?.pickupLocation?.address || "N/A"}</p>
                </div>
                <div className="mb-4">
                  <div className="text-gray-800 font-medium">Dropoff Location</div>
                  <p>{booking?.dropoffLocation?.address || "N/A"}</p>
                </div>
                <div className="mb-4">
                  <div className="text-gray-800 font-medium">Profit</div>
                  <p>₹{booking.profit?.toFixed(2) || "N/A"}</p>
                </div>
              </>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between mt-6">
              <div className="flex flex-col space-y-4">
                <button
                  onClick={() => handleViewBooking(booking)}
                  className="text-blue-500 hover:text-blue-700 transition duration-200 px-4 py-2 rounded-md border border-blue-500 hover:bg-blue-50"
                  title="View Booking"
                >
                  <FaEye />
                </button>
                <button
                  onClick={() => handleCancelBooking(booking._id)}
                  className="text-red-500 hover:text-red-700 transition duration-200 px-4 py-2 rounded-md border border-red-500 hover:bg-red-50"
                  title="Cancel Booking"
                >
                  <FaTimes />
                </button>
                <button
                  onClick={() => handleDownload("individual", booking._id)}
                  className="text-green-500 hover:text-green-700 transition duration-200 px-4 py-2 rounded-md border border-green-500 hover:bg-green-50"
                  title="Download Booking"
                >
                  <FaDownload />
                </button>
              </div>
              <div className="flex flex-col space-y-4">
                <button
                  onClick={() => openStartBookingModal(booking)}
                  disabled={isCompleted}
                  className={`text-yellow-500 hover:text-yellow-700 transition duration-200 px-4 py-2 rounded-md border border-yellow-500 hover:bg-yellow-50 ${isCompleted ? 'cursor-not-allowed opacity-50' : ''}`}
                  title="Start Booking"
                >
                  <FaPlay />
                </button>
                <button
                  onClick={() => handleEditBooking(booking)}
                  className="text-purple-500 hover:text-purple-700 transition duration-200 px-4 py-2 rounded-md border border-purple-500 hover:bg-purple-50"
                  title="Edit Booking"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleEndBooking(booking._id)}
                  disabled={isCompleted}
                  className={`text-orange-500 hover:text-orange-700 transition duration-200 px-4 py-2 rounded-md border border-orange-500 hover:bg-orange-50 ${isCompleted ? 'cursor-not-allowed opacity-50' : ''}`}
                  title="End Booking"
                >
                  <FaStop />
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    })}
  </div>
)}

{viewType === "list" && (
  <div className="flex flex-col space-y-4">
  {currentBookings.map((booking, index) => {
    const serialNumber = index + (currentPage * bookingsPerPage) + 1;
    const isCompleted = booking.status === "completed"; // Check if booking is completed

    return (
      <div
        key={booking._id}
        className="flex flex-col p-4 border border-gray-300 shadow-xl rounded-lg"
      >
        <div className="bg-gradient-to-r from-sky-600 to-teal-500 text-white p-4 rounded-t-lg">
          <h2 className="text-xl font-semibold">{booking.customerName || "N/A"}</h2>
          <p className="text-sm">{`Booking #${serialNumber}`}</p>
        </div>
        <div className="p-4 bg-white rounded-b-lg shadow-sm">
          <div className="mb-4">
            <div className="text-gray-800 font-medium">Vehicle</div>
            <p>{booking.vehicle?.name || "N/A"} - {booking.vehicle?.plateNumber || "N/A"}</p>
          </div>
          <div className="mb-4">
            <div className="text-gray-800 font-medium">Driver</div>
            <p>{booking.driver?.name || "N/A"}</p>
          </div>
          <div className="mb-4">
            <div className="text-gray-800 font-medium">Fare</div>
            <p>₹{booking.basePay?.toFixed(2) || "N/A"}</p>
          </div>
          <div className="mb-4">
            <div className="text-gray-800 font-medium">Profit</div>
            <p>₹{booking.profit?.toFixed(2) || "N/A"}</p>
          </div>
          <div className="mb-4">
            <div className="text-gray-800 font-medium">Status</div>
            <p className={`font-bold ${isCompleted ? 'text-green-500' : 'text-red-500'}`}>{booking.status || "N/A"}</p>
          </div>

          {/* Display additional information if status is 'Completed' */}
          {isCompleted && (
            <>
              <div className="mb-4">
                <div className="text-gray-800 font-medium">Start Date</div>
                <p>{new Date(booking.startDate).toLocaleDateString() || "N/A"}</p>
              </div>
              <div className="mb-4">
                <div className="text-gray-800 font-medium">End Date</div>
                <p>{new Date(booking.endDate).toLocaleDateString() || "N/A"}</p>
              </div>
              <div className="mb-4">
                <div className="text-gray-800 font-medium">Pickup Location</div>
                <p>{booking.pickupLocation.address || "N/A"}</p>
              </div>
              <div className="mb-4">
                <div className="text-gray-800 font-medium">Dropoff Location</div>
                <p>{booking.dropoffLocation.address || "N/A"}</p>
              </div>
            </>
          )}

          {/* Add Rating Component for Each Booking */}
          <div className="mb-4">
            <div className="text-gray-800 font-medium">Rating</div>
            <Rating
              initialRating={booking.initialRating || 5} // Set default rating to 5 if not present
              onRate={(rating) => handleRatingChange(booking._id, rating)} // Handle rating change
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4 mt-4">
            <button
              onClick={() => handleViewBooking(booking)}
              className="text-blue-500 hover:text-blue-700 transition duration-200 px-4 py-2 rounded-md border border-blue-500 hover:bg-blue-50"
              title="View Booking"
            >
              <FaEye />
            </button>
            <button
              onClick={() => handleCancelBooking(booking._id)}
              className="text-red-500 hover:text-red-700 transition duration-200 px-4 py-2 rounded-md border border-red-500 hover:bg-red-50"
              title="Cancel Booking"
            >
              <FaTimes />
            </button>
            <button
              onClick={() => handleDownload("individual", booking._id)}
              className="text-green-500 hover:text-green-700 transition duration-200 px-4 py-2 rounded-md border border-green-500 hover:bg-green-50"
              title="Download Booking"
            >
              <FaDownload />
            </button>
          </div>

          <div className="flex space-x-4 mt-4">
            <button
              onClick={() => openStartBookingModal(booking)}
              disabled={isCompleted} // Disable button if completed
              className={`text-yellow-500 hover:text-yellow-700 transition duration-200 px-4 py-2 rounded-md border border-yellow-500 hover:bg-yellow-50 ${isCompleted ? 'cursor-not-allowed opacity-50' : ''}`}
              title="Start Booking"
            >
              <FaPlay />
            </button>
            <button
              onClick={() => handleEditBooking(booking)}
              className="text-purple-500 hover:text-purple-700 transition duration-200 px-4 py-2 rounded-md border border-purple-500 hover:bg-purple-50"
              title="Edit Booking"
            >
              <FaEdit />
            </button>
            <button
              onClick={() => handleEndBooking(booking._id)}
              disabled={isCompleted} // Disable button if completed
              className={`text-orange-500 hover:text-orange-700 transition duration-200 px-4 py-2 rounded-md border border-orange-500 hover:bg-orange-50 ${isCompleted ? 'cursor-not-allowed opacity-50' : ''}`}
              title="End Booking"
            >
              <FaStop />
            </button>
          </div>
        </div>
      </div>
    );
  })}
</div>
)}

{viewType === "table" && (
  <div className="overflow-x-auto">
    <table className="min-w-full table-auto border-collapse">
      <thead className="bg-gradient-to-r from-sky-600 to-teal-500 text-white">
        <tr>
          <th className="px-6 py-4 text-left">Booking #</th>
          <th className="px-6 py-4 text-left">Customer Name</th>
          <th className="px-6 py-4 text-left">Vehicle</th>
          <th className="px-6 py-4 text-left">Driver</th>
          <th className="px-6 py-4 text-left">Fare</th>
          <th className="px-6 py-4 text-left">Status</th>
          <th className="px-6 py-4 text-left">Actions</th>
        </tr>
      </thead>
      <tbody>
        {currentBookings.map((booking, index) => {
          const serialNumber = index + (currentPage * bookingsPerPage) + 1;

          return (
            <tr key={booking._id} className="border-b hover:bg-gray-50">
              <td className="px-6 py-4">{serialNumber}</td>
              <td className="px-6 py-4">{booking.customerName || "N/A"}</td>
              <td className="px-6 py-4">{booking.vehicle?.name || "N/A"} - {booking.vehicle?.plateNumber || "N/A"}</td>
              <td className="px-6 py-4">{booking.driver?.name || "N/A"}</td>
              <td className="px-6 py-4">₹{booking.basePay?.toFixed(2) || "N/A"}</td>
              <td className="px-6 py-4">
                <p className={`font-bold ${booking.status === 'completed' ? 'text-green-500' : 'text-red-500'}`}>
                  {booking.status || "N/A"}
                </p>
              </td>
              <td className="px-6 py-4">
                <div className="flex space-x-4">
                  <button
                    onClick={() => handleViewBooking(booking)}
                    className="text-blue-500 hover:text-blue-700 transition duration-200 px-4 py-2 rounded-md border border-blue-500 hover:bg-blue-50"
                    title="View Booking"
                  >
                    <FaEye />
                  </button>
                  <button
                    onClick={() => handleCancelBooking(booking._id)}
                    className="text-red-500 hover:text-red-700 transition duration-200 px-4 py-2 rounded-md border border-red-500 hover:bg-red-50"
                    title="Cancel Booking"
                  >
                    <FaTimes />
                  </button>
                  <button
                    onClick={() => handleDownload("individual", booking._id)}
                    className="text-green-500 hover:text-green-700 transition duration-200 px-4 py-2 rounded-md border border-green-500 hover:bg-green-50"
                    title="Download Booking"
                  >
                    <FaDownload />
                  </button>
                  {/* Disable Play and End buttons if status is 'Completed' */}
                  <button
                    onClick={() => openStartBookingModal(booking)}
                    className={`text-yellow-500 hover:text-yellow-700 transition duration-200 px-4 py-2 rounded-md border border-yellow-500 hover:bg-yellow-50 ${booking.status === 'completed' ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title="Start Booking"
                    disabled={booking.status === 'completed'}
                  >
                    <FaPlay />
                  </button>
                  <button
                    onClick={() => handleEditBooking(booking)}
                    className="text-purple-500 hover:text-purple-700 transition duration-200 px-4 py-2 rounded-md border border-purple-500 hover:bg-purple-50"
                    title="Edit Booking"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleEndBooking(booking._id)}
                    className={`text-orange-500 hover:text-orange-700 transition duration-200 px-4 py-2 rounded-md border border-orange-500 hover:bg-orange-50 ${booking.status === 'Completed' ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title="End Booking"
                    disabled={booking.status === 'completed'}
                  >
                    <FaStop />
                  </button>
                </div>
                {/* Show individual fields if status is 'Completed' */}
                {booking.status === 'completed' && (
                  <div className="mt-4 space-y-4">
                    <div>
                      <div className="text-gray-800 font-medium">Start Date</div>
                      <p>{booking.startDate || "N/A"}</p>
                    </div>
                    <div>
                      <div className="text-gray-800 font-medium">End Date</div>
                      <p>{booking.endDate || "N/A"}</p>
                    </div>
                    <div>
                      <div className="text-gray-800 font-medium">Pickup Location</div>
                      <p>{booking.pickupLocation.address || "N/A"}</p>
                    </div>
                    <div>
                      <div className="text-gray-800 font-medium">Dropoff Location</div>
                      <p>{booking.dropoffLocation.address || "N/A"}</p>
                    </div>
                    <div>
                      <div className="text-gray-800 font-medium">Profit</div>
                      <p>₹{booking.profit?.toFixed(2) || "N/A"}</p>
                    </div>
                  </div>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
)}


      {/* Pagination */}
      <div className="flex justify-center mt-6 space-x-4">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 0}
          className="bg-gradient-to-r from-gray-400 to-gray-500 text-white px-6 py-2 rounded-full transition-all hover:bg-gray-600 disabled:opacity-50"
        >
          Prev
        </button>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={indexOfLastBooking >= filteredBookings.length}
          className="bg-gradient-to-r from-gray-400 to-gray-500 text-white px-6 py-2 rounded-full transition-all hover:bg-gray-600 disabled:opacity-50"
        >
          Next
        </button>
      </div>



      {showModal1 && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h2 className="text-lg font-semibold mb-4">Are you sure you want to start the booking?</h2>
            <div className="flex justify-between">
              <button onClick={confirmStartBooking} className="bg-yellow-500 text-white px-4 py-2 rounded-lg">Yes</button>
              <button onClick={cancelStartBooking} className="bg-gray-500 text-white px-4 py-2 rounded-lg">No</button>
            </div>
          </div>
        </div>
      )}
      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        booking={selectedBooking}
        mode={mode}
      />
      {(successMessage || errorMessage) && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50">
          <div className={`bg-white rounded-lg p-6 max-w-sm w-full ${successMessage ? 'border-green-500' : 'border-red-500'} border`}>
            <h2 className="text-lg font-semibold mb-4">{successMessage || errorMessage}</h2>
            <button onClick={closePopup} className="bg-blue-500 text-white px-4 py-2 rounded-lg">
              Close
            </button>
          </div>
        </div>
      )}
      <EditBookingModal
        booking={selectedBooking}
        isOpen={isEditModalOpen}
        onClose={closeEditBookingModal}
        onSave={fetchBookings}
      />
      {showModal && (
        <EndBookingModal
          bookingId={selectedBookingId}
          onClose={() => setShowModal(false)}
          onBookingEnded={handleBookingEnded}
        />
      )}
    </div>
  );
};

export default BookingsPage;
