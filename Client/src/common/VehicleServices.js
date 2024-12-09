import React, { useState, useEffect } from "react";
import axios from "axios";
import jsPDF from "jspdf";

const VehicleServices = () => {
  const [serviceData, setServiceData] = useState({
    vehicleId: "",
    serviceType: "",
    serviceDate: "",
    odometerReading: "",
    amount: "",
    companyName: "",
    description: "",
    servicingMileage: "",
  });
  const [currentOdometer, setCurrentOdometer] = useState(null);
  const [services, setServices] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const serviceTypeOptions = [
    "Engine Oil Change",
    "ATF Brake Oil Change",
    "Gearbox Oil Change",
    "Battery Change",
    "Coolant Change",
    "Spark Plug Change",
    "Full Service",
    "Mini Vehicle Service",
    "Others",
  ];
  const token = localStorage.getItem("token");
  const [vehicles, setVehicles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const totalPages = Math.ceil(services.length / itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

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
  useEffect(() => {
    // if (serviceData.vehicleId) {
    //   fetchServices(serviceData.vehicleId);
    // }
    // fetchVehicles();
  }, [serviceData.vehicleId]);
  useEffect(() => {
    fetchVehicles();
    fetchServices();
  }, []);
  const fetchServices = async () => {
    try {
      const response = await axiosInstance.get("/vehicle-document");
      setServices(response.data);
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  const handleAddService = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post("/vehicle-document", serviceData);
      alert("Service added successfully!");
      fetchServices(serviceData.vehicleId);
      setServiceData({
        vehicleId: "",
        serviceType: "",
        serviceDate: "",
        odometerReading: "",
        amount: "",
        companyName: "",
        description: "",
      });
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error adding service:", error);
    }
  };

  const handleDownloadPDF = async () => {
    const token = localStorage.getItem("token");

    const axiosInstance = axios.create({
      baseURL: `${process.env.REACT_APP_API_URL}/api/owner`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const response = await axiosInstance.get("/getProfile");
    const companyData = response.data.profile;
    console.log("getData", response.data);

    const companyName = companyData.name || "Your Company Name";
    const companyAddress = companyData.address || "Goutam Nagar";
    const companyPhone = companyData.phoneNumber || "1234567890";

    const doc = new jsPDF();
    const primaryColor = "#343A40";
    const accentColor = "#007BFF";
    const lightGray = "#F8F9FA";

    // Title Section with Logo
    const logoWidth = 30;
    const logoHeight = 15;
    // Add placeholder for logo (replace with actual logo path if needed)
    doc.setFillColor(lightGray);
    doc.rect(14, 14, 30, 20, "F"); // Placeholder for logo background
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(primaryColor);
    doc.text("Vehicle Services Report", 50, 25);

    // Add a line under the title
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(14, 35, 196, 35);

    // Company Information Section
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text(`Company Name: ${companyName}`, 14, 40);
    doc.text(`Address: ${companyAddress}`, 14, 45);
    doc.text(`Contact: ${companyPhone}`, 14, 50);

    // Invoice Date and Number
    doc.setFont("helvetica", "bold");
    doc.setTextColor(primaryColor);
    const currentDate = new Date().toLocaleDateString();
    doc.text(`Date: ${currentDate}`, 150, 40);
    doc.text("Invoice #: 00123", 150, 45);

    // Table Headers with Background
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.setFillColor(primaryColor);
    doc.rect(14, 60, 182, 10, "F");
    doc.text("Type", 16, 67);
    doc.text("Service Date", 50, 67);
    doc.text("Company", 100, 67);
    doc.text("Amount", 150, 67);
    doc.text("Plate Number", 180, 67);

    // Table Rows with Alternating Colors
    let y = 75;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(primaryColor);

    filteredServices.forEach((service, index) => {
      // Alternate row background
      if (index % 2 === 0) {
        doc.setFillColor(lightGray);
        doc.rect(14, y - 7, 182, 8, "F");
      }

      doc.text(service.serviceType, 16, y);
      doc.text(formatDate(service.serviceDate), 50, y);
      doc.text(service.companyName, 100, y);
      doc.text(`$${service.amount.toFixed(2)}`, 150, y);
      doc.text(service.vehicleId?.plateNumber || "Not Provided", 180, y);

      y += 8;

      // Page break if content exceeds page
      if (y > 270) {
        doc.addPage();
        y = 20;

        // Repeat headers on new page
        doc.setFillColor(primaryColor);
        doc.rect(14, y, 182, 10, "F");
        doc.setTextColor(255, 255, 255);
        doc.text("Type", 16, y + 7);
        doc.text("Service Date", 50, y + 7);
        doc.text("Company", 100, y + 7);
        doc.text("Amount", 150, y + 7);
        doc.text("Plate Number", 180, y + 7);
        y += 15;
      }
    });

    // Summary Section
    const totalAmount = filteredServices.reduce(
      (sum, service) => sum + service.amount,
      0
    );
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setFillColor(lightGray);
    doc.rect(14, y, 182, 10, "F");
    doc.text(`Total Amount: $${totalAmount.toFixed(2)}`, 150, y + 7);

    // Footer Section
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(100, 100, 100);
    y += 20;
    doc.text("Thank you for choosing our services!", 14, y);
    doc.text("For inquiries, contact support@company.com", 14, y + 5);

    // Save the PDF
    doc.save("VehicleServices.pdf");
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { year: "numeric", month: "2-digit", day: "2-digit" };
    return new Intl.DateTimeFormat("en-GB", options).format(date);
  };

  const filteredServices = services
    ?.filter(
      (service) =>
        service.serviceType
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        service.companyName
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        service.serviceDate
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        service.vehicleId.plateNumber
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        service.vehicleId.name
          ?.toLowerCase()
          .includes(searchQuery.toLocaleLowerCase())
    )
    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const fetchVehicles = async () => {
    try {
      const response = await axiosInstance1.get("/vehicles"); // Change this based on your actual API endpoint
      setVehicles(response.data.vehicles);
      console.log("hahahahahaah", response.data);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
    }
  };
  const [remainingKM, setRemainingKM] = useState({});

  const handleCurrentOdometerChange = (serviceId, currentOdometer) => {
    const service = filteredServices.find((s) => s._id === serviceId);
    if (service) {
      const kmDriven = Number(currentOdometer) - service.odometerReading;
      const remaining = service.servicingMileage - kmDriven;

      setRemainingKM((prev) => ({
        ...prev,
        [serviceId]: remaining,
      }));
    }
  };
  return (
    <div className="w-full mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Vehicle Services
      </h2>

      {/* Search and Download PDF */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
        <input
          type="text"
          placeholder="Search services..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border border-gray-300 rounded-md px-4 py-2 w-full  sm:w-auto focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
        />
        <span className=" flex flex-col sm:flex-row gap-4 justify-center space-x-4">
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-500 text-white px-4 py-2  rounded-md hover:bg-blue-600 mx-auto   items-center justify-center w-full sm:w-auto"
          >
            Create Service
          </button>
          <button
            onClick={handleDownloadPDF}
            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 w-full sm:w-auto ml-0"
          >
            Download PDF
          </button>
        </span>
      </div>
      {/* Service Table */}
      <div className="w-full overflow-hidden rounded-md">
        <div className="overflow-scroll">
          <table className="w-full border-collapse border border-gray-300 mb-6">
            <thead>
              <tr className="bg-sky-700 text-white">
                <th className="border border-white px-4 py-2">Sl. No</th>
                <th className="border border-white px-4 py-2">
                  Vehicle Number
                </th>
                <th className="border border-white px-4 py-2">Vehicle Model</th>
                <th className="border border-white px-4 py-2">Service Type</th>
                <th className="border border-white px-4 py-2">Service Date</th>
                <th className="border border-white px-4 py-2">
                  Odometer Reading
                </th>
                <th className="border border-white px-4 py-2">
                  Servicing Mileage
                </th>
                <th className="border border-white px-4 py-2">Remaining KM</th>
                <th className="border border-white px-4 py-2">Amount</th>
                <th className="border border-white px-4 py-2">Company Name</th>
                <th className="border border-white px-4 py-2">Description</th>
              </tr>
            </thead>
            <tbody>
              {filteredServices?.map((service, index) => (
                <tr key={service._id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2">
                    {index + 1}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {service.vehicleId.plateNumber}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {service.vehicleId.name}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {service.serviceType}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {service.serviceDate}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {service.odometerReading}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {service.servicingMileage}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <input
                      type="number"
                      placeholder="Enter current odometer"
                      onChange={(e) =>
                        handleCurrentOdometerChange(service._id, e.target.value)
                      }
                      className="border rounded-md px-2 py-1 w-full"
                    />
                    {remainingKM[service._id] !== undefined && (
                      <div className="mt-2 text-sm text-gray-600">
                        {remainingKM[service._id] >= 0
                          ? `${remainingKM[service._id]} km remaining`
                          : `Service overdue by ${Math.abs(
                              remainingKM[service._id]
                            )} km`}
                      </div>
                    )}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {service.amount}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {service.companyName}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {service.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Service Button */}
      {/* <button
        onClick={() => setIsModalOpen(true)}
        className="bg-blue-500 text-white px-4 py-2 mt-6 rounded-md hover:bg-blue-600 mx-auto   items-center justify-center"
      >
        Create Service
      </button> */}

      {/* Modal for Creating Service */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 overflow-hidden">
          <div className="bg-white p-4 rounded-lg shadow-lg w-1/2 sm:overflow-y-scroll">
            <h3 className="text-lg font-bold mb-4">Add Service</h3>
            <form onSubmit={handleAddService} className="space-y-4">
              {/* Select Vehicle */}
              <select
                value={serviceData.vehicleId}
                onChange={(e) =>
                  setServiceData({ ...serviceData, vehicleId: e.target.value })
                }
                className="border border-gray-400 rounded-md px-4 py-2 w-full focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
              >
                <option value="" disabled>
                  Select Vehicle
                </option>
                {vehicles.map((vehicle) => (
                  <option key={vehicle._id} value={vehicle._id}>
                    {vehicle.name} (Vehicle Number: {vehicle.plateNumber})
                  </option>
                ))}
              </select>

              {/* Select Service Type */}
              <select
                value={serviceData.serviceType}
                onChange={(e) =>
                  setServiceData({
                    ...serviceData,
                    serviceType: e.target.value,
                  })
                }
                className="border border-gray-400 rounded-md px-4 py-2 w-full focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
              >
                <option value="" disabled>
                  Select Service Type
                </option>
                {serviceTypeOptions.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>

              {/* Service Date */}
              <input
                type="date"
                placeholder="Service Date"
                value={serviceData.serviceDate}
                onChange={(e) =>
                  setServiceData({
                    ...serviceData,
                    serviceDate: e.target.value,
                  })
                }
                className="border border-gray-400 rounded-md px-4 py-2 w-full focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
              />

              {/* Odometer Reading */}
              <input
                type="number"
                placeholder="Odometer Reading"
                value={serviceData.odometerReading}
                onChange={(e) =>
                  setServiceData({
                    ...serviceData,
                    odometerReading: e.target.value,
                  })
                }
                className="border border-gray-400 rounded-md px-4 py-2 w-full focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
              />

              {/* Servicing Mileage */}
              <input
                type="number"
                placeholder="Servicing Mileage"
                value={serviceData.servicingMileage}
                onChange={(e) =>
                  setServiceData({
                    ...serviceData,
                    servicingMileage: e.target.value,
                  })
                }
                className="border border-gray-400 rounded-md px-4 py-2 w-full focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
              />

              {/* Amount */}
              <input
                type="number"
                placeholder="Amount"
                value={serviceData.amount}
                onChange={(e) =>
                  setServiceData({ ...serviceData, amount: e.target.value })
                }
                className="border border-gray-400 rounded-md px-4 py-2 w-full focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
              />

              {/* Company Name */}
              <input
                type="text"
                placeholder="Company Name"
                value={serviceData.companyName}
                onChange={(e) =>
                  setServiceData({
                    ...serviceData,
                    companyName: e.target.value,
                  })
                }
                className="border border-gray-400 rounded-md px-4 py-2 w-full focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
              />

              {/* Description */}
              <textarea
                placeholder="Description"
                value={serviceData.description}
                onChange={(e) =>
                  setServiceData({
                    ...serviceData,
                    description: e.target.value,
                  })
                }
                className="border border-gray-400 rounded-md px-4 py-2 w-full focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
              />

              {/* Actions */}
              <div className="flex flex-col sm:flex-row justify-normal lg:justify-between gap-4">
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
                  Add Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-center mt-4 space-y-4 sm:space-y-0">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 disabled:opacity-50  w-full sm:w-auto"
        >
          Previous
        </button>
        <span className="text-center">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 disabled:opacity-50 w-full sm:w-auto"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default VehicleServices;
