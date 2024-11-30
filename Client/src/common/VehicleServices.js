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
    servicingMileage:""
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
      const response = await axiosInstance.get(
        "/vehicle-document"
      );
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

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.text("Vehicle Services", 10, 10);
    let y = 20;
    filteredServices.forEach((service) => {
      doc.text(
        `Type: ${service.serviceType}, Date: ${service.serviceDate}, Company: ${service.companyName}, Amount: ${service.amount}`,
        10,
        y
      );
      y += 10;
    });
    doc.save("VehicleServices.pdf");
  };

  const filteredServices = services
  ?.filter(
    (service) =>
      service.serviceType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.serviceDate?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.vehicleId.plateNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.vehicleId.name?.toLowerCase().includes(searchQuery.toLocaleLowerCase())
  )
  .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const fetchVehicles = async () => {
    try {
      const response = await axiosInstance1.get("/vehicles"); // Change this based on your actual API endpoint
      setVehicles(response.data.vehicles);
      console.log('hahahahahaah',response.data)
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
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Vehicle Services</h2>

      {/* Search and Download PDF */}
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Search services..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border border-gray-300 rounded-md px-4 py-2 w-1/2"
        />
        <button
          onClick={handleDownloadPDF}
          className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
        >
          Download PDF
        </button>
      </div>
      {/* Service Table */}
      <table className="w-full border-collapse border border-gray-300 mb-6">
      <thead>
        <tr className="bg-gray-100">
          <th className="border border-gray-300 px-4 py-2">Sl. No</th>
          <th className="border border-gray-300 px-4 py-2">Vehicle Number</th>
          <th className="border border-gray-300 px-4 py-2">Vehicle Model</th>
          <th className="border border-gray-300 px-4 py-2">Service Type</th>
          <th className="border border-gray-300 px-4 py-2">Service Date</th>
          <th className="border border-gray-300 px-4 py-2">Odometer Reading</th>
          <th className="border border-gray-300 px-4 py-2">Servicing Mileage</th>
          <th className="border border-gray-300 px-4 py-2">Remaining KM</th>
          <th className="border border-gray-300 px-4 py-2">Amount</th>
          <th className="border border-gray-300 px-4 py-2">Company Name</th>
          <th className="border border-gray-300 px-4 py-2">Description</th>
        </tr>
      </thead>
      <tbody>
        {filteredServices?.map((service, index) => (
          <tr key={service._id} className="hover:bg-gray-50">
            <td className="border border-gray-300 px-4 py-2">{index + 1}</td>
            <td className="border border-gray-300 px-4 py-2">{service.vehicleId.plateNumber}</td>
            <td className="border border-gray-300 px-4 py-2">{service.vehicleId.name}</td>
            <td className="border border-gray-300 px-4 py-2">{service.serviceType}</td>
            <td className="border border-gray-300 px-4 py-2">{service.serviceDate}</td>
            <td className="border border-gray-300 px-4 py-2">{service.odometerReading}</td>
            <td className="border border-gray-300 px-4 py-2">{service.servicingMileage}</td>
            <td className="border border-gray-300 px-4 py-2">
              <input
                type="number"
                placeholder="Enter current odometer"
                onChange={(e) => handleCurrentOdometerChange(service._id, e.target.value)}
                className="border rounded-md px-2 py-1 w-full"
              />
              {remainingKM[service._id] !== undefined && (
                <div className="mt-2 text-sm text-gray-600">
                  {remainingKM[service._id] >= 0
                    ? `${remainingKM[service._id]} km remaining`
                    : `Service overdue by ${Math.abs(remainingKM[service._id])} km`}
                </div>
              )}
            </td>
            <td className="border border-gray-300 px-4 py-2">{service.amount}</td>
            <td className="border border-gray-300 px-4 py-2">{service.companyName}</td>
            <td className="border border-gray-300 px-4 py-2">{service.description}</td>
          </tr>
        ))}
      </tbody>
    </table>

      {/* Create Service Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="bg-blue-500 text-white px-4 py-2 mt-6 rounded-md hover:bg-blue-600"
      >
        Create Service
      </button>

      {/* Modal for Creating Service */}
      {isModalOpen && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
    <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
      <h3 className="text-lg font-bold mb-4">Add Service</h3>
      <form onSubmit={handleAddService} className="space-y-4">
        {/* Select Vehicle */}
        <select
          value={serviceData.vehicleId}
          onChange={(e) =>
            setServiceData({ ...serviceData, vehicleId: e.target.value })
          }
          className="border border-gray-300 rounded-md px-4 py-2 w-full"
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
            setServiceData({ ...serviceData, serviceType: e.target.value })
          }
          className="border border-gray-300 rounded-md px-4 py-2 w-full"
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
            setServiceData({ ...serviceData, serviceDate: e.target.value })
          }
          className="border border-gray-300 rounded-md px-4 py-2 w-full"
        />

        {/* Odometer Reading */}
        <input
          type="number"
          placeholder="Odometer Reading"
          value={serviceData.odometerReading}
          onChange={(e) =>
            setServiceData({ ...serviceData, odometerReading: e.target.value })
          }
          className="border border-gray-300 rounded-md px-4 py-2 w-full"
        />

        {/* Servicing Mileage */}
        <input
          type="number"
          placeholder="Servicing Mileage"
          value={serviceData.servicingMileage}
          onChange={(e) =>
            setServiceData({ ...serviceData, servicingMileage: e.target.value })
          }
          className="border border-gray-300 rounded-md px-4 py-2 w-full"
        />

        {/* Amount */}
        <input
          type="number"
          placeholder="Amount"
          value={serviceData.amount}
          onChange={(e) =>
            setServiceData({ ...serviceData, amount: e.target.value })
          }
          className="border border-gray-300 rounded-md px-4 py-2 w-full"
        />

        {/* Company Name */}
        <input
          type="text"
          placeholder="Company Name"
          value={serviceData.companyName}
          onChange={(e) =>
            setServiceData({ ...serviceData, companyName: e.target.value })
          }
          className="border border-gray-300 rounded-md px-4 py-2 w-full"
        />

        {/* Description */}
        <textarea
          placeholder="Description"
          value={serviceData.description}
          onChange={(e) =>
            setServiceData({ ...serviceData, description: e.target.value })
          }
          className="border border-gray-300 rounded-md px-4 py-2 w-full"
        />

        {/* Actions */}
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
            Add Service
          </button>
        </div>
      </form>
    </div>
  </div>
)}

      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 disabled:opacity-50"
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default VehicleServices;
