import React, { useState, useEffect } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import UpdatePopup from "./UpdatePopup";
import { FaEdit } from "react-icons/fa";

const VehicleDocuments = () => {
  const [documentData, setDocumentData] = useState({
    vehicleId: "",
    documentType: "",
    expiryDate: "",
    reminderDate: "",
    description: "",
    amount: "",
    isDailyReminder:false
  });
  const token = localStorage.getItem("token");
  const [showPopup, setShowPopup] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null); 
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
  const [documents, setDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [vehicles, setVehicles] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchDocuments();
    fetchVehicles();
  }, []);

  useEffect(() => {
    const filtered = (Array.isArray(documents) ? documents : []).filter((doc) =>
      doc.documentType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.vehicleId.plateNumber?.toLowerCase().includes(searchQuery.toLocaleLowerCase())
    );
    setFilteredDocuments(filtered);
  }, [searchQuery, documents]);
  const fetchVehicles = async () => {
    try {
      const response = await axiosInstance1.get("/vehicles"); // Change this based on your actual API endpoint
      setVehicles(response.data.vehicles);
      console.log('hahahahahaah',response.data)
    } catch (error) {
      console.error("Error fetching vehicles:", error);
    }
  };
  const fetchDocuments = async () => {
    try {
      const response = await axiosInstance.get("/vehicles");
      setDocuments(response.data); // Assuming the API returns { documents: [...] }
      setFilteredDocuments(response.data);
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  const handleAddDocument = async (e) => {
    e.preventDefault();
    try {
        console.log('documentData.isDailyRemainder',documentData)
      await axiosInstance.post("/vehicle", documentData);
      alert("Document added successfully!");
      fetchDocuments();
      setDocumentData({
        vehicleId: "",
        documentType: "",
        expiryDate: "",
        reminderDate: "",
        description: "",
        amount: "",
        isDailyReminder:false
      });
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error adding document:", error);
    }
  };

 // Function to format date in DD/MM/YYYY format
const formatDate = (dateString) => {
  const date = new Date(dateString);

  const options = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  };

  return new Intl.DateTimeFormat('en-GB', options).format(date); // en-GB format for DD/MM/YYYY
};

// Example Usage in handleDownloadPDF
const handleDownloadPDF = async () => {
  const token = localStorage.getItem("token");

  const axiosInstance = axios.create({
    baseURL: `${process.env.REACT_APP_API_URL}/api/owner`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  try {
    // Fetch company profile
    const profileResponse = await axiosInstance.get("/getProfile");
    const profile = profileResponse.data.profile;
    const companyName = profile.name || "Your Company Name";
    const companyPhone = profile.phoneNumber || "1234567890";
    const companyLogo = profile.logo; // Assuming this is a base64 or URL string
    const companyAddress = profile.address || "Goutam Nagar";

    // Initialize jsPDF
    const doc = new jsPDF();

    // Add Header with Logo (if available)
    const logoWidth = 30;
    const logoHeight = 30;
    const logoX = 14;
    const logoY = 10;

    if (companyLogo) {
      doc.addImage(companyLogo, "JPEG", logoX, logoY, logoWidth, logoHeight);
    }

    // Company Info (Name, Address, Phone) aligned to the left
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(companyName, 14, 20); // Company name on the left
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    // Address and Phone also aligned to the left
    doc.text(`Address: ${companyAddress}`, 14, 25); // Address on the left
    doc.text(`Phone: ${companyPhone}`, 14, 30); // Phone on the left

    // Title Section (Invoice Type)
    doc.setFont("helvetica", "italic");
    doc.setTextColor(100, 100, 100);
    doc.text("Tax Invoice / Bill of Supply", 160, 15);

    // Invoice Details (Invoice No and Date)
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("Invoice No:", 160, 40);
    doc.setFont("helvetica", "normal");
    doc.text("INV-123456", 185, 40); // Replace with actual invoice number

    doc.setFont("helvetica", "bold");
    doc.text("Date:", 160, 45);
    doc.setFont("helvetica", "normal");
    doc.text(new Date().toLocaleDateString(), 185, 45);

    // Table Headers with Vehicle No
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    const headers = ["Sl No.", "Vehicle No", "Type", "Expiry Date", "Reminder Date", "Description", "Amount"];
    const headerXPositions = [14, 30, 70, 100, 130, 160, 190]; // Adjust column widths

    // Add Table Header
    headers.forEach((header, index) => {
      doc.text(header, headerXPositions[index], 65);
    });

    // Draw table header line
    doc.setLineWidth(0.5);
    doc.line(14, 67, 200, 67);

    // Table Content (Fill the rows with document data)
    let y = 75;
    filteredDocuments.forEach((document, index) => {
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");

      const vehicleNo = document.vehicleId?.plateNumber || "N/A"; // Fetching Vehicle No
      const data = [
        (index + 1).toString(),
        vehicleNo,
        document.documentType || "N/A",
        formatDate(document.expiryDate) || "N/A",
        formatDate(document.reminderDate) || "N/A",
        document.description || "N/A",
        document.amount?.toString() || "0",
      ];

      // Draw table rows with the exact alignment and styling
      data.forEach((value, i) => {
        doc.text(value, headerXPositions[i], y, { align: "left" }); // Align to left for better readability
      });

      y += 8;

      if (y > 270) {
        doc.addPage();
        y = 20;

        // Repeat table headers
        headers.forEach((header, i) => {
          doc.text(header, headerXPositions[i], y);
        });

        doc.line(14, y + 2, 200, y + 2);
        y += 10;
      }
    });

    // Summary Section: Total Amount (Add this at the end of the document)
    const totalAmount = filteredDocuments.reduce((sum, document) => sum + (document.amount || 0), 0);
    y += 10; // Adjust y for summary section
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Total Amount:", 140, y); // Total Amount positioned slightly to the left
    doc.setFont("helvetica", "normal");
    doc.text(`${totalAmount.toFixed(2)}`, 180, y); // Right aligned Total amount

    // Footer Section
    y += 10;
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(100, 100, 100);
    doc.text("Thank you for your business!", 14, y);

    // Save PDF
    doc.save("Invoice.pdf");
  } catch (error) {
    console.error("Error generating PDF:", error);
    alert("Failed to generate PDF. Please try again.");
  }
};

  const handlePagination = (direction) => {
    if (direction === "prev" && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    } else if (
      direction === "next" &&
      currentPage < Math.ceil(filteredDocuments.length / itemsPerPage)
    ) {
      setCurrentPage(currentPage + 1);
    }
  };

  const paginatedDocuments = (Array.isArray(filteredDocuments) ? filteredDocuments : []).slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  const openUpdatePopup = (doc) => {
    setSelectedDoc(doc);
    setShowPopup(true);
  };

  const closeUpdatePopup = () => {
    setShowPopup(false);
    setSelectedDoc(null);
  };

  const handleUpdate = async (documentId, updatedData) => {
    try {
      const response = await axiosInstance.put(
        `/vehicle-documents/${documentId}`,
        updatedData
      );
      console.log("Document updated successfully:", response.data);
      closeUpdatePopup();
      // Refresh the documents list here if needed
    } catch (error) {
      console.error("Error updating document:", error);
    }
  };

  return (
    <div className=" p-3 bg-white rounded-lg shadow-md ">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Vehicle Documents
      </h2>

      {/* Search and Download Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
        <input
          type="text"
          placeholder="Search documents..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className=" w-full sm:w-auto border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring focus:ring-blue-300"
        />
        <button
          onClick={handleDownloadPDF}
          className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 w-full sm:w-auto"
        >
          Download PDF
        </button>
      </div>

      {/* Document Table */}
      <div className="w-full overflow-hidden">
        <div className="overflow-scroll">
      <table className="w-full border-collapse border border-gray-300 ">
        <thead>
          <tr className="bg-gray-100">
          <th className="border border-gray-300 px-4 py-2">Sl.NO</th>

          <th className="border border-gray-300 px-4 py-2">Vehicle Number</th>
          <th className="border border-gray-300 px-4 py-2">Vehicle Name</th>
            <th className="border border-gray-300 px-4 py-2">Document Type</th>
            <th className="border border-gray-300 px-4 py-2">Expiry Date</th>
            <th className="border border-gray-300 px-4 py-2">Reminder Date</th>
            <th className="border border-gray-300 px-4 py-2">Description</th>
            <th className="border border-gray-300 px-4 py-2">Amount</th>
            <th className="border border-gray-300 px-4 py-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {paginatedDocuments?.map((doc,index) => (
            <tr key={doc._id} className="hover:bg-gray-50">
              <td className="border border-gray-300 px-4 py-2">
        {index + 1} {/* This will display the serial number */}
      </td>
              <td className="border border-gray-300 px-4 py-2">
                {doc?.vehicleId?.plateNumber}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {doc?.vehicleId?.name}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {doc.documentType}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {doc.expiryDate}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {doc.reminderDate}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {doc.description}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {doc.amount}
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">
          <button
            onClick={() => openUpdatePopup(doc)}
            className="text-blue-500 hover:text-blue-700"
          >
            <FaEdit/>
          </button>
        </td>

            </tr>
          ))}
        </tbody>
      </table>
      </div>
      </div>

      {/* Pagination */}
      <div className="flex justify-between mt-4">
        <button
          onClick={() => handlePagination("prev")}
          className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
        >
          Previous
        </button>
        <button
          onClick={() => handlePagination("next")}
          className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
        >
          Next
        </button>
      </div>

      {/* Create Document Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="bg-blue-500 text-white px-4 py-2 mt-6 rounded-md hover:bg-blue-600"
      >
        Create Document
      </button>

      {/* Modal */}
      {isModalOpen && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
    <div className="relative bg-white p-6 rounded-lg shadow-lg w-1/3 max-h-[90vh] overflow-y-auto">
      {/* Close Icon */}
      <button
        onClick={() => setIsModalOpen(false)}
        className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 focus:outline-none"
      >
        ✕
      </button>

      <h3 className="text-lg font-bold mb-4">Add Document</h3>
      <form onSubmit={handleAddDocument} className="space-y-4">
        {/* Vehicle Selection */}
        <label htmlFor="vehicle" className="block text-gray-700 font-medium">
          Select Vehicle
        </label>
        <select
          id="vehicle"
          value={documentData.vehicleId}
          onChange={(e) =>
            setDocumentData({ ...documentData, vehicleId: e.target.value })
          }
          className="border border-gray-300 rounded-md px-4 py-2 w-full"
        >
          <option value="">Select Vehicle</option>
          {vehicles.map((vehicle) => (
            <option key={vehicle._id} value={vehicle._id}>
              {vehicle.name} {vehicle.plateNumber}
            </option>
          ))}
        </select>

        {/* Document Type */}
        <label htmlFor="documentType" className="block text-gray-700 font-medium">
          Select Document Type
        </label>
        <select
          id="documentType"
          value={documentData.documentType}
          onChange={(e) =>
            setDocumentData({ ...documentData, documentType: e.target.value })
          }
          className="border border-gray-300 rounded-md px-4 py-2 w-full"
        >
          <option value="" disabled>
            Select Document Type
          </option>
          <option value="Pollution Control">Pollution Control</option>
          <option value="Permit Renewal">Permit Renewal</option>
          <option value="Temporary Permit">Temporary Permit</option>
          <option value="Drivers Badge">Drivers Badge</option>
          <option value="Fitness Certificate">Fitness Certificate</option>
          <option value="Driver Badge">Driver Badge</option>
          <option value="Free Permit">Free Permit</option>
          <option value="Explosive License">Explosive License</option>
          <option value="Insurance">Insurance</option>
          <option value="Road Tax">Road Tax</option>
          <option value="Other">Other</option>
        </select>

        {/* Expiry Date */}
        <label htmlFor="expiryDate" className="block text-gray-700 font-medium">
          Expiry Date
        </label>
        <input
          type="date"
          id="expiryDate"
          value={documentData.expiryDate}
          onChange={(e) =>
            setDocumentData({ ...documentData, expiryDate: e.target.value })
          }
          className="border border-gray-300 rounded-md px-4 py-2 w-full"
        />

        {/* Reminder Date */}
        <label htmlFor="reminderDate" className="block text-gray-700 font-medium">
          Reminder Date
        </label>
        <input
          type="date"
          id="reminderDate"
          value={documentData.reminderDate}
          onChange={(e) =>
            setDocumentData({
              ...documentData,
              reminderDate: e.target.value,
            })
          }
          className="border border-gray-300 rounded-md px-4 py-2 w-full"
        />

        {/* Amount */}
        <label htmlFor="amount" className="block text-gray-700 font-medium">
          Amount
        </label>
        <input
          type="number"
          id="amount"
          placeholder="Enter Amount"
          value={documentData.amount}
          onChange={(e) =>
            setDocumentData({ ...documentData, amount: e.target.value })
          }
          className="border border-gray-300 rounded-md px-4 py-2 w-full"
        />

        {/* Description */}
        <label htmlFor="description" className="block text-gray-700 font-medium">
          Description
        </label>
        <textarea
          id="description"
          placeholder="Enter Description"
          value={documentData.description}
          onChange={(e) =>
            setDocumentData({
              ...documentData,
              description: e.target.value,
            })
          }
          className="border border-gray-300 rounded-md px-4 py-2 w-full"
        />

        {/* Daily Reminder */}
        <label htmlFor="dailyReminder" className="flex items-center text-gray-700 font-medium">
          <input
            type="checkbox"
            id="dailyReminder"
            checked={documentData.isDailyReminder}
            onChange={(e) =>
              setDocumentData({
                ...documentData,
                isDailyReminder: e.target.checked,
              })
            }
            className="mr-2"
          />
          Set Daily Reminder
        </label>

        {/* Buttons */}
        <div className="flex justify-between">
          <button
            type="button"
            onClick={() => setIsModalOpen(false)}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Add Document
          </button>
        </div>
      </form>
    </div>
  </div>
)}

       {showPopup && (
        <UpdatePopup
          selectedDoc={selectedDoc}
          onClose={closeUpdatePopup}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
};

export default VehicleDocuments;
