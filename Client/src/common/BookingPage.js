import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaDownload, FaEdit, FaEye, FaStop, FaTimes } from "react-icons/fa";
import jsPDF from "jspdf"; // For PDF generation
import Modal from "../components/Modal";
import BookingModal from "./BookingModal";
import "jspdf-autotable"; // Import the jsPDF autotable plugin
import { FaPlay } from "react-icons/fa6";
import EditBookingModal from "../modals/EditBookingModal";

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
  const [showModal, setShowModal] = useState(false); // For modal visibility
  const [bookingToStart, setBookingToStart] = useState(null);
  const [successMessage, setSuccessMessage] = useState(""); // For success message
  const [errorMessage, setErrorMessage] = useState("");
  const [editing, setEditBooking] = useState("");
  const [isEditModalOpen,setIsEditModalOpen] = useState("")

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
    setShowModal(true); // Open the modal
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
      const response = await axios.get('/api/bookings');
      setBookings(response.data); // Example: Update your state
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  };
    

  const cancelStartBooking = () => {
    setShowModal(false); // Close the modal
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
// Function to handle ending a booking
const handleEndBooking = (bookingId) => {
  console.log("Ending booking with ID:", bookingId);
  // Example logic for ending the booking
  const confirmEnd = window.confirm("Are you sure you want to end this booking?");
  if (confirmEnd) {
    // API call or state update to mark the booking as ended
    axios
      .put(`/api/bookings/end/${bookingId}`)
      .then((response) => {
        console.log("Booking ended successfully:", response.data);
        alert("Booking has been ended.");
        // Logic to refresh the booking list or update the UI
        fetchBookings(); // Example function to refresh bookings
      })
      .catch((error) => {
        console.error("Error ending booking:", error);
        alert("Failed to end the booking. Please try again.");
      });
  }
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
            <option value="Completed">Completed</option>
            <option value="Pending">Pending</option>
            <option value="Cancelled">Cancelled</option>
            <option value="In-Progress">In-Progress</option>
          </select>
        </div>
        <button
          onClick={() => handleDownload("all")}
          className="bg-green-500 text-white px-4 py-2 rounded-lg w-full sm:w-auto"
        >
          Download All Bookings as PDF
        </button>
      </div>


      {/* Table */}
      <div className="overflow-x-auto min-w-full">
        <table className="table-auto w-full border border-gray-200 shadow-lg rounded-lg text-base">
          <thead>
            <tr className="bg-sky-700 text-white font-semibold">
              <th className="px-4 py-2">SL No.</th> {/* Serial Number Column */}
              <th className="px-4 py-2">Customer Name</th>
              <th className="px-4 py-2">Vehicle</th>
              <th className="px-4 py-2">Vehicle No</th>
              <th className="px-4 py-2">Driver</th>
              <th className="px-4 py-2">Pickup Location</th>
              <th className="px-4 py-2">Dropoff Location</th>
              <th className="px-4 py-2">Fare</th>
              <th className="px-4 py-2">Net Material Weight</th>
              <th className="px-4 py-2">Per Ton Price</th>
              <th className="px-4 py-2">Total Value(Fare + Total Net Material Price)</th>
              <th className="px-4 py-2">KM</th>
              <th className="px-4 py-2">Dates & Days</th> {/* Updated Column Name */}
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody className="whitespace-nowrap">
  {currentBookings.map((booking, index) => {
const serialNumber = index + (currentPage * bookingsPerPage) + 1;

    return (
      <tr key={booking._id} className="border-t hover:bg-gray-100 transition">
        <td className="px-4 py-2">{serialNumber}</td> {/* Serial Number for each row */}
        <td className="px-4 py-2">{booking.customerName || "N/A"}</td>
        <td className="px-4 py-2">{booking.vehicle?.name || "N/A"}</td>
        <td className="px-4 py-2">{booking.vehicle?.plateNumber || "N/A"}</td>
        <td className="px-4 py-2">{booking.driver?.name || "N/A"}</td>
        <td className="px-4 py-2">{booking.pickupLocation?.address || "N/A"}</td>
        <td className="px-4 py-2">{booking.dropoffLocation?.address || "N/A"}</td>
        <td className="px-4 py-2">₹{booking.basePay?.toFixed(2) || "N/A"}</td>
        <td className="px-4 py-2">{booking.totalNetMaterialWeight?.toFixed(2) || "N/A"}</td>
        <td className="px-4 py-2">₹{booking.perTonPrice?.toFixed(2) || "N/A"}</td>
        <td className="px-4 py-2">
  ₹{isNaN(((parseFloat(booking.perTonPrice) * parseFloat(booking.totalNetMaterialWeight)) + parseFloat(booking.basePay)))
      ? "0.00"
      : ((parseFloat(booking.perTonPrice) * parseFloat(booking.totalNetMaterialWeight)) + parseFloat(booking.basePay)).toFixed(2)}
</td>
        <td className="px-4 py-2">{booking.kmDriven || "N/A"}</td>
        <td className="px-4 py-2">
          {`Start: ${formatDate(booking.startDate)}\nEnd: ${formatDate(booking.endDate)}\nDays: ${calculateDaysCount(booking.startDate, booking.endDate)}`}
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
            <button
              onClick={() => openStartBookingModal(booking)}
              className="text-yellow-500"
              title="Start Booking"
            >
              <FaPlay /> {/* Play Icon to signify start */}
            </button>
          </div>
          <button
      onClick={() => handleEditBooking(booking)}
      className="text-purple-500"
      title="Edit Booking"
    >
      <FaEdit /> {/* Edit Icon */}
    </button>

    {/* End Booking */}
    <button
      onClick={() => handleEndBooking(booking._id)}
      className="text-orange-500"
      title="End Booking"
    >
      <FaStop /> {/* Stop Icon to signify end */}
    </button>
        </td>
      </tr>
    );
  })}
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
      {showModal && (
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
    </div>
  );
};

export default BookingsPage;
