import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from './Modal'; // Assuming Modal component is available
import { FaCar, FaTruckLoading } from 'react-icons/fa';
import jsPDF from 'jspdf'; // Import jsPDF library

const BookingPage = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [drivers1, setDrivers1] = useState([]);  // Drivers for the selected date
  const [bookings1, setBookings1] = useState([]);  // All bookings
  const [selectedDate, setSelectedDate] = useState('');  // Selected date
  const [selectedDriver1, setSelectedDriver1] = useState('');  // Selected driver for assignment
  const [selectedBooking1, setSelectedBooking1] = useState('');  // Selected booking for assignment
  const [searchQuery, setSearchQuery] = useState('');  // Search filter
  const [startDate, setStartDate] = useState('');  // Start date for filtering bookings
  const [endDate, setEndDate] = useState('');  // End date for filtering bookings
  const [currentPage, setCurrentPage] = useState(1);  // Pagination for bookings
  const usersPerPage = 5;
  const token = localStorage.getItem('token');  // Assuming the token is stored in localStorage
  const [currentStep, setCurrentStep] = useState(1);
  const [vehicles, setVehicles] = useState([]); // State to hold vehicles list
  const [vehicles1, setVehicles1] = useState([]); // State to hold vehicles list

  const [selectedVehicleId, setSelectedVehicleId] = useState(null); // State for selected vehicle ID

  const [newBooking, setNewBooking] = useState({
    pickupLocation: '',
    dropoffLocation: '',
    vehicleId: '',
    kmDriven: 0,          // Set to 0 instead of an empty string
    basePay: 0,           // Set to 0 instead of an empty string
    perKmCharge: 0,       // Set to 0 instead of an empty string
    halt: 0,              // Set to 0 instead of an empty string
    tax: 0,               // Set to 0 instead of an empty string
    toll: 0,              // Set to 0 instead of an empty string
    discount: 0,          // Set to 0 instead of an empty string
    startDate: '',        // Start date remains as a string initially
    endDate: '',          // End date remains as a string initially
    customerName: '',
    custPhNo: '',
    custEmailId: '',
    custAddress: ''
  });
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
  // Fetch Bookings from API based on role
  const fetchBookings = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/booking/bookings`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Add Bearer token
          },
        }
      );
      console.log('sdvadvasdv',response.data.bookings)
      setBookings1(response.data.bookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  // Fetch Completed Drivers based on selected date
  const fetchDrivers = async (date) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/booking/drivers`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { date },  // Pass selected date as a query parameter
      });
      setDrivers1(response.data.drivers);  // Update drivers list based on the selected date
    } catch (error) {
      console.error('Error fetching drivers:', error);
    }
  };

  // Initial fetch of bookings when the component mounts
  useEffect(() => {
    fetchBookings();  // Fetch bookings by default
    fetchVehicles()
  }, []);
  const handleNextStep = () => {
    if (currentStep === 1) {
      // Validate start and end date for step 1
      if (!newBooking.startDate || !newBooking.endDate) {
        alert('Please enter both start date and end date.');
        return;
      }
    }
    setCurrentStep(currentStep + 1);
  };

  // Handle previous step
  const handlePreviousStep = () => {
    setCurrentStep(currentStep - 1);
  };
  // Trigger the driver API call when selectedDate changes
  useEffect(() => {
    if (selectedDate) {
      fetchDrivers(selectedDate);  // Fetch drivers based on the selected date
    }
  }, [selectedDate]);  // Re-run whenever selectedDate changes

  // Handle Date Change to trigger driver API call
  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);  // Set selected date
  };
  const fetchVehicles = async () => {
    try {
      const response = await axiosInstance.get('/vehicles'); // Replace with actual endpoint
      setVehicles(response.data.vehicles); // Assuming response has a 'vehicles' array
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      alert('An error occurred while fetching vehicles.');
    }
};
  // Handle the booking creation logic
  const handleCreateBooking = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/booking/bookings`,
        newBooking,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const invoice = response.data.invoice;
      const ownerName = response.data.ownerName
console.log('hahahahahinvoice',response.data.invoice)
      // Generate PDF with the invoice data
      handleDownloadInvoice(invoice,ownerName);
      alert(response.data.message);  // Show success message
      setIsCreateModalOpen(false);  // Close the modal after success
      fetchBookings();  // Refresh bookings list after creating a new booking
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('There was an error creating the booking.');
    }
  };

  // Filter bookings based on search query and date range
  const filterBookings = () => {
    return bookings1.filter((booking) => {
        console.log(booking)
      const matchesSearchQuery =
        booking.vehicle.plateNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.driver?.name.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesDateRange =
        (startDate ? new Date(booking.date) >= new Date(startDate) : true) &&
        (endDate ? new Date(booking.date) <= new Date(endDate) : true);

      return matchesSearchQuery && matchesDateRange;
    });
  };
  useEffect(() => {
    // If both start and end dates are selected, fetch available vehicles
    if (newBooking.startDate && newBooking.endDate) {
        fetchAvailableVehicles(newBooking.startDate, newBooking.endDate);
    }
}, [newBooking.startDate, newBooking.endDate]);
const fetchAvailableVehicles = async (startDate, endDate) => {
  try {
      const response = await axiosInstance1.get(`/pending-bookings?startDate=${startDate}&endDate=${endDate}`);
      const availableVehicles = response.data
      setVehicles1(availableVehicles);  // Update the available vehicles
  } catch (error) {
      console.error('Error fetching available vehicles:', error);
  }
};

  // Handle assigning driver to a booking
  const handleAssignDriver = async (e) => {
    e.preventDefault();
    if (!selectedDriver1 || !selectedBooking1) {
      alert('Please select both a booking and a driver.');
      return;
    }

    try {
      // Making a POST request to the API with the bookingId as a URL parameter
      const id = selectedBooking1
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/booking/bookings/${id}/assign-driver`, // Use the bookingId in the URL
        {
          driverId: selectedDriver1, // Pass the driverId in the body
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`, // Token for authentication
          },
        }
      );
      alert(response.data.message);  // Show success message
      setIsAssignModalOpen(false);  // Close modal after success
    } catch (error) {
        // Log and show error message from the response if available
        if (error.response && error.response.data && error.response.data.message) {
          // API error message is available in error.response.data.message
          alert(error.response.data.message);
        } else {
          // Fallback in case the error response doesn't contain a message
          alert('There was an error assigning the driver.');
        }
        console.error('Error assigning driver:', error); // Log error for debugging
      }
};

const handleDownloadInvoice = (invoice, ownerName) => {
    const doc = new jsPDF();
    
    // Styles
    const primaryColor = "#000000";
    const accentColor = "#FF0000";
    const lineHeight = 10;
    const marginX = 20;
    const address = `Back side of Utkal, Kanika Galeria
Plot No 78, Gautam Nagar
Bhubaneswar, Odisha 751014
India`;

    // Header
    doc.setFillColor(primaryColor);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text(ownerName || 'Owner Name', marginX, 15);  // Ensure ownerName is defined
    doc.setFontSize(12);
    doc.text(address, marginX, 25);
    doc.setFontSize(18);
    doc.setTextColor(accentColor);
    doc.text("INVOICE", 160, 15);

    // Invoice Info
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text(`Invoice#: ${invoice.invoiceId || 'Unknown ID'}`, 160, 25);
    doc.text(`Date: ${invoice.generatedAt ? new Date(invoice.generatedAt).toLocaleDateString() : 'N/A'}`, 160, 35);

    // Customer Info
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Invoice to:`, marginX, 50);
    doc.setFontSize(10);
    doc.text(`Customer Name: ${invoice.customerName || 'N/A'}`, marginX, 55);
    doc.text(`Phone Number: ${invoice.custPhNo || 'N/A'}`, marginX, 60);
    doc.text(`Email: ${invoice.custEmailId || 'N/A'}`, marginX, 65);
    doc.text(`Address: ${invoice.custAddress || 'N/A'}`, marginX, 70);

    // Invoice Breakdown Header
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text("SL.  Total Fare                    Tax Amount        Toll Amount    Discount Amount Final Amount", marginX, 85);

    // Itemized List
    doc.setFontSize(10);
    let yPosition = 95;
    if (invoice.discountAmount && invoice.totalFare) {
        doc.text(`1`, marginX, yPosition);
        doc.text(`${(invoice.totalFare || 0).toFixed(2)}`, marginX + 20, yPosition); 
        doc.text(`${(invoice.taxAmount || 0).toFixed(2)}`, marginX + 60, yPosition);  
        doc.text(`${invoice.tollAmount || 0}`, marginX + 100, yPosition);  
        doc.text(`-${invoice.discountAmount || 0}`, marginX + 130, yPosition);  
        doc.text(`${invoice.finalAmount || 0}`, marginX + 160, yPosition);  
        yPosition += lineHeight;
    }

    // Summary Section
    yPosition += 10;
    doc.text(`Total Fare: ${invoice.totalFare || 0}`, marginX, yPosition);
    doc.text(`Tax Amount: ${invoice.taxAmount || 0}`, marginX, yPosition + lineHeight);
    doc.text(`Toll Amount: ${invoice.tollAmount || 0}`, marginX, yPosition + 2 * lineHeight);
    doc.text(`Discount Amount: -${invoice.discountAmount || 0}`, marginX, yPosition + 3 * lineHeight);
    doc.text(`Final Amount: ${invoice.finalAmount || 0}`, marginX, yPosition + 4 * lineHeight);

    // Footer
    yPosition += 40;
    doc.setFontSize(10);
    doc.setTextColor(primaryColor);
    doc.setTextColor(150, 150, 150);
    doc.text("Payment Info:", marginX, yPosition + 20);
    doc.text(`Account #: 123 456 789`, marginX, yPosition + 30);
    doc.text(`Bank Details: Your bank details here`, marginX, yPosition + 40);

    // Terms & Conditions
    yPosition += 50;
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text("Terms & Conditions:", marginX, yPosition);
    doc.text("Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce eleifend ultricies velit.", marginX, yPosition + lineHeight);

    // Estimated Booking Stamp
    doc.setFontSize(30);
    doc.setTextColor(150, 0, 0);
    doc.setTextColor(0, 0, 0, 0.5);  // Set transparency to 50%
    doc.text("ESTIMATED BOOKING", 105, yPosition + 50, { align: "center" });  // Centered stamp

    // Signature Line
    doc.setFontSize(10);
    doc.setTextColor(primaryColor);
    doc.text("Authorized Sign", 160, yPosition + 70);

    // Save the PDF
    doc.save(`invoice_${invoice.invoiceId || 'Unknown'}_${new Date().getTime()}.pdf`);
};


  const resetModalState = () => {
    setSelectedBooking1(''); // Reset the booking selection
    setSelectedDate(''); // Reset the date
    setSelectedDriver1(''); // Reset the driver selection
  };
  // Pagination logic for bookings
  const indexOfLastBooking = currentPage * usersPerPage;
  const indexOfFirstBooking = indexOfLastBooking - usersPerPage;
  const filteredBookings = filterBookings();
  const currentBookings = filteredBookings.slice(indexOfFirstBooking, indexOfLastBooking);
  const totalPages = Math.ceil(filteredBookings.length / usersPerPage);
  const calculateEstimateTotal = () => {
    const { basePay, perKmCharge, kmDriven, halt, tax, toll, discount } = newBooking;
    
    const total = (basePay + perKmCharge * kmDriven) + halt + tax + toll - discount;
    return total.toFixed(2);  // Return the total with 2 decimal places
  };
  
  // Pagination function
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="w-full p-4 bg-white">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="btn btn-primary flex items-center gap-2 p-3 rounded-lg"
        >
          <FaCar /> Create Booking
        </button>
        <Modal
  isOpen={isCreateModalOpen}
  onClose={() => setIsCreateModalOpen(false)}
  className="modal max-w-lg mx-auto p-8 bg-white rounded-lg shadow-lg"
  overlayClassName="modal-overlay"
  animationEnter="zoomIn"
  animationExit="zoomOut"
>
  <h2 className="text-xl font-bold text-blue-600 mb-6">Create Booking</h2>

  <form onSubmit={handleCreateBooking}> {/* Form submission will only happen when the 'Create Booking' button is clicked */}
    {/* Step 1: Pickup and Dropoff Location with Start/End Date */}
    {currentStep === 1 && (
      <div>
        <div className="mb-4">
          <label className="block text-gray-700">Pickup Location</label>
          <input
            type="text"
            placeholder="Enter pickup location"
            required
            value={newBooking.pickupLocation}
            onChange={(e) =>
              setNewBooking({ ...newBooking, pickupLocation: e.target.value })
            }
            className="w-full mt-2 p-2 border border-gray-300 rounded-md"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Dropoff Location</label>
          <input
            type="text"
            placeholder="Enter dropoff location"
            required
            value={newBooking.dropoffLocation}
            onChange={(e) =>
              setNewBooking({ ...newBooking, dropoffLocation: e.target.value })
            }
            className="w-full mt-2 p-2 border border-gray-300 rounded-md"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Start Date</label>
          <input
            type="date"
            required
            value={newBooking.startDate}
            onChange={(e) =>
              setNewBooking({ ...newBooking, startDate: e.target.value })
            }
            className="w-full mt-2 p-2 border border-gray-300 rounded-md"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">End Date</label>
          <input
            type="date"
            required
            value={newBooking.endDate}
            onChange={(e) =>
              setNewBooking({ ...newBooking, endDate: e.target.value })
            }
            className="w-full mt-2 p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div className="mb-4">
                <label className="block text-gray-700">Customer Name</label>
                <input
                  type="text"
                  placeholder="Enter customer name"
                  value={newBooking.customerName}
                  onChange={(e) =>
                    setNewBooking({ ...newBooking, customerName: e.target.value })
                  }
                  className="w-full mt-2 p-2 border border-gray-300 rounded-md"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700">Customer Phone Number</label>
                <input
                  type="tel"
                  placeholder="Enter customer phone number"
                  value={newBooking.custPhNo}
                  onChange={(e) =>
                    setNewBooking({ ...newBooking, custPhNo: e.target.value })
                  }
                  className="w-full mt-2 p-2 border border-gray-300 rounded-md"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700">Customer Email</label>
                <input
                  type="email"
                  placeholder="Enter customer email"
                  value={newBooking.custEmailId}
                  onChange={(e) =>
                    setNewBooking({ ...newBooking, custEmailId: e.target.value })
                  }
                  className="w-full mt-2 p-2 border border-gray-300 rounded-md"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700">Customer Address</label>
                <input
                  type="text"
                  placeholder="Enter customer address"
                  value={newBooking.custAddress}
                  onChange={(e) =>
                    setNewBooking({ ...newBooking, custAddress: e.target.value })
                  }
                  className="w-full mt-2 p-2 border border-gray-300 rounded-md"
                />
              </div>
      </div>
    )}

    {/* Step 2: Vehicle and Pricing Information */}
    {currentStep === 2 && (
      <div>
        <div>
              <div className="mb-4">
                <label className="block text-gray-700">Vehicle</label>
                <select
                  value={newBooking.vehicleId}
                  onChange={(e) =>
                    setNewBooking({ ...newBooking, vehicleId: e.target.value })
                  }
                  className="w-full mt-2 p-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Select a vehicle</option>
                  {vehicles1.map((vehicle) => (
                    <option key={vehicle._id} value={vehicle._id}>
                      {vehicle.name} {vehicle.plateNumber}
                    </option>
                  ))}
                </select>
              </div></div>

        <div className="mb-4">
          <label className="block text-gray-700">Km Driven</label>
          <input
            type="number"
            placeholder="Enter km driven"
            value={newBooking.kmDriven}
            onChange={(e) =>
              setNewBooking({ ...newBooking, kmDriven: parseFloat(e.target.value) })
            }
            className="w-full mt-2 p-2 border border-gray-300 rounded-md"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Base Pay</label>
          <input
            type="number"
            placeholder="Enter base pay"
            value={newBooking.basePay}
            onChange={(e) =>
              setNewBooking({ ...newBooking, basePay: parseFloat(e.target.value) })
            }
            className="w-full mt-2 p-2 border border-gray-300 rounded-md"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Per Km Charge</label>
          <input
            type="number"
            placeholder="Enter per km charge"
            value={newBooking.perKmCharge}
            onChange={(e) =>
              setNewBooking({ ...newBooking, perKmCharge: parseFloat(e.target.value) })
            }
            className="w-full mt-2 p-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>
    )}

    {/* Step 3: Other Charges */}
    {currentStep === 3 && (
  <div>
    {/* Halt Charges */}
    <div className="mb-4">
      <label className="block text-gray-700">Halt Charges</label>
      <input
        type="number"
        placeholder="Enter halt charges"
        value={newBooking.halt}
        onChange={(e) =>
          setNewBooking({ ...newBooking, halt: parseFloat(e.target.value) })
        }
        className="w-full mt-2 p-2 border border-gray-300 rounded-md"
      />
    </div>

    {/* Tax */}
    <div className="mb-4">
      <label className="block text-gray-700">Tax</label>
      <input
        type="number"
        placeholder="Enter tax"
        value={newBooking.tax}
        onChange={(e) =>
          setNewBooking({ ...newBooking, tax: parseFloat(e.target.value) })
        }
        className="w-full mt-2 p-2 border border-gray-300 rounded-md"
      />
    </div>

    {/* Toll Charges */}
    <div className="mb-4">
      <label className="block text-gray-700">Toll Charges</label>
      <input
        type="number"
        placeholder="Enter toll charges"
        value={newBooking.toll}
        onChange={(e) =>
          setNewBooking({ ...newBooking, toll: parseFloat(e.target.value) })
        }
        className="w-full mt-2 p-2 border border-gray-300 rounded-md"
      />
    </div>

    {/* Discount */}
    <div className="mb-4">
      <label className="block text-gray-700">Discount</label>
      <input
        type="number"
        placeholder="Enter discount"
        value={newBooking.discount}
        onChange={(e) =>
          setNewBooking({ ...newBooking, discount: parseFloat(e.target.value) })
        }
        className="w-full mt-2 p-2 border border-gray-300 rounded-md"
      />
    </div>

    {/* Display Invoice Summary */}
    <div className="mt-6">
     

      <button
        type="button"
        onClick={handleDownloadInvoice }
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 mt-4"
      >
        Download Estimate Invoice
      </button>
    </div>
  </div>
)}



    {/* Navigation Buttons */}
    <div className="flex justify-between items-center mt-6">
      {currentStep > 1 && (
        <button
          type="button"  
          onClick={handlePreviousStep}
          className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
        >
          Previous
        </button>
      )}

      {currentStep < 3 ? (
        <button
          type="button"  
          onClick={handleNextStep}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Next
        </button>
      ) : (
        <button
          type="button"  
          onClick={handleCreateBooking}  
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          Create Booking
        </button>
      )}
    </div>
  </form>
</Modal>



        {/* Assign Driver Button */}
        <button
          onClick={() => setIsAssignModalOpen(true)}
          className="btn btn-primary flex items-center gap-2 p-3 rounded-lg"
        >
          <FaTruckLoading /> Assign Driver
        </button>

        {/* Modal for Assigning a Driver */}
        <Modal
          isOpen={isAssignModalOpen}
          onClose={() => {
            resetModalState(); // Reset the modal state when it's closed
            setIsAssignModalOpen(false); // Close the modal
          }}
          className="modal max-w-lg mx-auto p-8 bg-white rounded-lg shadow-lg"
          overlayClassName="modal-overlay"
          animationEnter="zoomIn"
          animationExit="zoomOut"
        >
          <form onSubmit={handleAssignDriver}>
            {/* Pending Booking Dropdown */}
            <div className="max-w-screen-sm mx-auto mb-4">
  <label className="block text-gray-700">Select Pending Booking</label>
  <select
    value={selectedBooking1}
    onChange={(e) => setSelectedBooking1(e.target.value)}
    required
    className="w-full mt-2 p-2 border border-gray-300 rounded-md text-sm sm:text-base lg:text-lg"
  >
    <option value="">Select Booking</option>
    {bookings1.map((booking) => (
      <option key={booking._id} value={booking._id}>
        {booking.customerName} booked {booking.vehicle?.name} from{' '}
        {new Date(booking.startDate).toLocaleDateString()} to{' '}
        {new Date(booking.endDate).toLocaleDateString()}
      </option>
    ))}
  </select>
</div>


            {/* Date picker for selecting the date */}
            <label>Select Date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              className="border rounded-md p-2"
            />

            {/* Completed Driver Dropdown */}
            <div className="mb-4">
              <label className="block text-gray-700">Select Driver</label>
              <select
                value={selectedDriver1}
                onChange={(e) => setSelectedDriver1(e.target.value)}
                required
                className="w-full mt-2 p-2 border border-gray-300 rounded-md"
              >
                <option value="">Select Driver</option>
                {drivers1.map((driver) => (
                  <option key={driver._id} value={driver._id}>
                    {driver.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-full hover:bg-blue-700 transition duration-300"
            >
              Assign Driver
            </button>
          </form>
        </Modal>
      </div>

      {/* Search and Filter Section */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search by Vehicle No. or Pickup Location"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#FFF0F0] rounded-lg focus:outline-none"
          />
        </div>

        {/* Date filter for booking */}
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border rounded-lg px-4 py-2 focus:outline-none"
          />
          <span className="text-sm font-medium">TO</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border rounded-lg px-4 py-2 focus:outline-none"
          />
        </div>
      </div>

      {/* Bookings Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-white border-b">
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">SL No.</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Plate Number</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Driver Name</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">GPS (KM)</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
            </tr>
          </thead>
          <tbody>
            {currentBookings.map((booking, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-[#F0F0FF]'}>
                <td className="px-4 py-2 text-sm text-gray-900">
                  {index + 1 + (currentPage - 1) * usersPerPage}
                </td>
                <td className="px-4 py-2 text-sm text-gray-900">{booking.vehicle.plateNumber}</td>
                <td className="px-4 py-2 text-sm text-gray-900">
                  {booking.driver ? booking.driver.name : 'Vehicle Not Assigned'}
                </td>
                <td className="px-4 py-2 text-sm text-gray-900">{booking.kmDriven}</td>
                <td className="px-4 py-2">
                  <div className="flex items-center">
                    <span
                      className={`w-4 h-4 mr-1 inline-block rounded-full ${
                        booking.status === 'COMPLETED' ? 'bg-green-500' : 'bg-red-500'
                      }`}
                    />
                    <span
                      className={`text-xs font-medium ${
                        booking.status === 'COMPLETED' ? 'text-green-500' : 'text-red-500'
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-2 text-sm text-gray-900">{booking.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-4">
        <button
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 mx-1 bg-blue-500 text-white rounded-full disabled:opacity-50"
        >
          Prev
        </button>
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => paginate(i + 1)}
            className={`px-4 py-2 mx-1 ${
              currentPage === i + 1 ? 'bg-blue-700' : 'bg-blue-500'
            } text-white rounded-full`}
          >
            {i + 1}
          </button>
        ))}
        <button
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-4 py-2 mx-1 bg-blue-500 text-white rounded-full disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default BookingPage;
