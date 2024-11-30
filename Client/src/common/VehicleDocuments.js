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
    const filtered = documents?.filter((doc) =>
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

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.text("Vehicle Documents", 10, 10);
    let y = 20;
    filteredDocuments.forEach((document) => {
      doc.text(
        `Type: ${document.documentType}, Expiry: ${document.expiryDate}, Reminder: ${document.reminderDate}, Desc: ${document.description}, Amount: ${document.amount}`,
        10,
        y
      );
      y += 10;
    });
    doc.save("VehicleDocuments.pdf");
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

  const paginatedDocuments = filteredDocuments?.slice(
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
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Vehicle Documents
      </h2>

      {/* Search and Download Buttons */}
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Search documents..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring focus:ring-blue-300"
        />
        <button
          onClick={handleDownloadPDF}
          className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
        >
          Download PDF
        </button>
      </div>

      {/* Document Table */}
      <table className="w-full border-collapse border border-gray-300">
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
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
            <h3 className="text-lg font-bold mb-4">Add Document</h3>
            <form onSubmit={handleAddDocument} className="space-y-4">
            <select
  value={documentData.vehicleId} // This will bind the value to the selected vehicle ID
  onChange={(e) => setDocumentData({ ...documentData, vehicleId: e.target.value })} // Update the vehicleId in state
  className="border border-gray-300 rounded-md px-4 py-2 w-full"
>
  <option value="">Select Vehicle</option> {/* Placeholder option */}
  {vehicles.map((vehicle) => (
    <option key={vehicle._id} value={vehicle._id}>
      {vehicle.name} {vehicle.plateNumber} {/* Show the vehicle name or any other field */}
    </option>
  ))}
</select>

              <select
    value={documentData.documentType}
    onChange={(e) => setDocumentData({ ...documentData, documentType: e.target.value })}
    className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring focus:ring-blue-300 w-full"
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
              <input
                type="date"
                value={documentData.expiryDate}
                onChange={(e) =>
                  setDocumentData({ ...documentData, expiryDate: e.target.value })
                }
                className="border border-gray-300 rounded-md px-4 py-2 w-full"
              />
              <input
                type="date"
                value={documentData.reminderDate}
                onChange={(e) =>
                  setDocumentData({
                    ...documentData,
                    reminderDate: e.target.value,
                  })
                }
                className="border border-gray-300 rounded-md px-4 py-2 w-full"
              />
              <input
                type="number"
                placeholder="Amount"
                value={documentData.amount}
                onChange={(e) =>
                  setDocumentData({ ...documentData, amount: e.target.value })
                }
                className="border border-gray-300 rounded-md px-4 py-2 w-full"
              />
              <textarea
                placeholder="Description"
                value={documentData.description}
                onChange={(e) =>
                  setDocumentData({
                    ...documentData,
                    description: e.target.value,
                  })
                }
                className="border border-gray-300 rounded-md px-4 py-2 w-full"
              />
               <input
  type="checkbox"
  checked={documentData.isDailyReminder} // Binds checkbox to the state
  onChange={(e) =>
    setDocumentData({
      ...documentData,
      isDailyReminder: e.target.checked, // Updates the state with the new checkbox value
    })
  }
  className="border border-gray-300 rounded-md"
/>


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
