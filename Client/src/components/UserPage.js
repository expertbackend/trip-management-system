import React, { useState, useEffect } from "react";
import axios from "axios";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import Modal from "./Modal"; // Assuming Modal component is in the same directory
import {
  FaCheckCircle,
  FaEdit,
  FaEye,
  FaLock,
  FaNode,
  FaTimesCircle,
  FaUserPlus,
} from "react-icons/fa";
import UserModal from "../modals/UserModal";

const UserPage = () => {
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [permissions, setPermissions] = useState([]);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
    phoneNumber: "",
  });
  const [selectedUser1, setSelectedUser1] = useState(null); // State to store selected user details
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("view");

  // Fetch users
  useEffect(() => {
    setCurrentPage(1);
    const fetchPermissions = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/owner/getAllPermission`,
          {
            headers: {
              Authorization: `Bearer ${token}`, // Add Bearer token
            },
          }
        );
        setPermissions(response.data.permissions);
      } catch (error) {
        console.error("Error fetching permissions:", error);
      }
    };

    fetchPermissions();
  }, [searchQuery]);
  const fetchUsers = async () => {
    try {
      // Retrieve the token from local storage or another secure storage method
      const token = localStorage.getItem("token"); // Adjust if token is stored elsewhere

      // Make the request with the token in the Authorization header
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/owner/users`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Add Bearer token
          },
        }
      );

      setUsers(response.data.users);
    } catch (error) {
      console.error("Error fetching users:", error);
      // Handle token errors, such as redirecting to login if token is invalid or expired
      if (error.response && error.response.status === 401) {
        console.error("Unauthorized: Token may be invalid or expired");
        // Redirect to login or show an error message
      }
    }
  };
  useEffect(() => {
    fetchUsers(); // Fetch users
  }, []);
  const handleStatusToggle = async (userId) => {
    try {
      // Show a confirmation prompt before toggling the status
      const userConfirmed = window.confirm(
        "Are you sure you want to toggle the user status?"
      );
      if (!userConfirmed) return;

      // Send request to the backend to toggle the user status
      const response = await axiosInstance.put(`/updateStatus/${userId}`);

      if (response.status === 200) {
        alert(`User status updated to ${response.data.user.status}`);
        // After updating, re-fetch the users
        fetchUsers(); // This will update the users in the state
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update user status. Please try again.");
    }
  };

  const handleViewClick = (user) => {
    setModalMode("view");
    setSelectedUser1(user);
    setIsModalOpen(true); // Open the modal
  };
  const handleEditClick = (user) => {
    setModalMode("edit");
    setSelectedUser1(user);
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false); // Close the modal
  };
  const handleUserSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");

      // Send the newUser data in the body of the request and Authorization header in headers
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/owner/createUser`,
        newUser, // Send the newUser data as the body of the POST request
        {
          headers: {
            Authorization: `Bearer ${token}`, // Add Bearer token in headers
          },
        }
      );

      // Refresh the page or handle response accordingly
      window.location.reload();
      alert(response.data.message);
      setIsUserModalOpen(false);
    } catch (error) {
      console.error("Error creating user:", error);
      alert("Error creating user");
    }
  };

  const handlePermissionSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");

      // Prepare data and config
      const data = {
        targetUserId: selectedUser, // User to whom permissions are being assigned
        permissions: selectedPermissions, // Array of selected permission IDs
      };

      const config = {
        headers: {
          Authorization: `Bearer ${token}`, // Add Bearer token in headers
        },
      };

      // Make the POST request
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/owner/assign-permissions`,
        data, // Sending the data as the second argument
        config // Passing the config (headers) as the third argument
      );

      // Success response handling
      alert(response.data.message);
      setIsPermissionModalOpen(false);
      window.location.reload(); // Refresh the page or update state as needed
    } catch (error) {
      console.error("Error assigning permissions:", error);
      alert("Error assigning permissions");
    }
  };

  // Filter users based on search query
  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate pagination for filtered data
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  // Total pages for the filtered data
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const token = localStorage.getItem("token");
  const axiosInstance = axios.create({
    baseURL: `${process.env.REACT_APP_API_URL}/api/owner`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  // Pagination function
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Function to download PDF
  const downloadUserPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("User List", 14, 22);
    if (!filteredUsers.length) {
      alert("No data available to download.");
      return;
    }
    const columns = ["ID", "FULL NAME", "EMAIL", "Permissions"];
    const data = filteredUsers.map((user, index) => [
      index + 1,
      user.name,
      user.email,
      user.bookingStatus,
    ]);

    doc.autoTable({
      head: [columns],
      body: data,
      startY: 30,
      margin: { top: 20 },
      pageBreak: "auto",
    });

    doc.save("user_list.pdf");
  };
  const phoneRegex = /^[6-9]\d{9}$/;

  return (
    <div className="w-full p-4 bg-white">
      <div className="flex  flex-col sm:flex-row justify-normal sm:justify-between items-center mb-4 gap-4">
        <button
          onClick={() => setIsUserModalOpen(true)}
          className="btn btn-primary flex items-center gap-2 p-3 rounded-lg bg-green-600 text-white w-full sm:w-auto "
        >
          <FaUserPlus /> Add User
        </button>

        <button
          onClick={() => setIsPermissionModalOpen(true)}
          className="btn btn-primary flex items-center gap-2 p-3 rounded-lg bg-blue-600 text-white  w-full sm:w-auto"
        >
          <FaUserPlus /> Assign Permission
        </button>

        <Modal
          isOpen={isUserModalOpen}
          onClose={() => setIsUserModalOpen(false)}
          className="modal min-w-lg mx-auto p-8 bg-white rounded-lg shadow-lg"
          overlayClassName="modal-overlay"
          animationEnter="zoomIn"
          animationExit="zoomOut"
        >
          <h2 className="text-xl font-bold text-blue-600 mb-6">Add User</h2>
          <form onSubmit={handleUserSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700">Username</label>
              <input
                type="text"
                placeholder="Enter username"
                required
                value={newUser.name}
                onChange={(e) =>
                  setNewUser({ ...newUser, name: e.target.value })
                }
                className="w-full mt-2 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-300 focus:border-blue-300"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Email</label>
              <input
                type="email"
                placeholder="Enter email"
                required
                value={newUser.email}
                onChange={(e) =>
                  setNewUser({ ...newUser, email: e.target.value })
                }
                className="w-full mt-2 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-300 focus:border-blue-300"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Phone Number</label>
              <input
                type="text"
                placeholder="Enter phone number"
                required
                maxLength="10"
                value={newUser.phoneNumber}
                onChange={(e) => {
                  const phone = e.target.value;

                  // Allow only numbers (use a regex to remove non-numeric characters)
                  if (/^\d*$/.test(phone)) {
                    setNewUser({ ...newUser, phoneNumber: phone });
                  }
                }}
                className="w-full mt-2 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-300 focus:border-blue-300"
              />
              <p className="text-red-500 text-sm mt-1">
                {newUser.phoneNumber &&
                  !/^[6789]\d{9}$/.test(newUser.phoneNumber) &&
                  "Please enter a valid Indian phone number starting with 7, 8, or 9."}
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700">Password</label>
              <input
                type="password"
                placeholder="Enter password"
                required
                value={newUser.password}
                onChange={(e) =>
                  setNewUser({ ...newUser, password: e.target.value })
                }
                className="w-full mt-2 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-300 focus:border-blue-300"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Role</label>
              <select
                required
                value={newUser.role}
                onChange={(e) =>
                  setNewUser({ ...newUser, role: e.target.value })
                }
                className="w-full mt-2 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-300 focus:border-blue-300"
              >
                <option value="">Select role</option>
                <option value="operator">Operator</option>
                <option value="driver">Driver</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-full hover:bg-blue-700 transition duration-300"
            >
              Add User
            </button>
          </form>
        </Modal>

        {/* Modal for Permission Assignment */}
        <Modal
          isOpen={isPermissionModalOpen}
          onClose={() => setIsPermissionModalOpen(false)}
          className="modal max-w-lg mx-auto p-8 bg-white rounded-lg shadow-lg"
          overlayClassName="modal-overlay"
          animationEnter="zoomIn"
          animationExit="zoomOut"
        >
          <h2 className="text-xl font-bold text-blue-600 mb-6">
            Assign Permissions
          </h2>
          <form onSubmit={handlePermissionSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700">Select User</label>
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                required
                className="w-full mt-2 p-2 border border-gray-300 rounded-md"
              >
                <option value="">Choose a user</option>
                {users.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Permissions</label>
              <p className="text-sm text-gray-500 mb-2">
                Hold <strong>Ctrl</strong> (or <strong>Cmd</strong> on Mac) and
                click to select multiple permissions.
              </p>
              <select
                multiple
                onChange={(e) =>
                  setSelectedPermissions(
                    Array.from(
                      e.target.selectedOptions,
                      (option) => option.value
                    )
                  )
                }
                className="w-full mt-2 p-2 border border-gray-300 rounded-md"
              >
                {permissions.map((permission) => (
                  <option key={permission._id} value={permission._id}>
                    {permission.name} - {permission.resource}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-full hover:bg-blue-700 transition duration-300"
            >
              Assign Permissions
            </button>
          </form>
        </Modal>

        <button
          onClick={downloadUserPDF}
          className="bg-red-500 text-white px-4 py-2 rounded-lg flex items-center w-full sm:w-auto"
        >
          <span className="mr-2">&#128196;</span> PDF
        </button>
      </div>
      <div className=" flex  flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search by username or email"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-300 focus:border-blue-300"
          />
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            &#128269;
          </span>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border rounded-lg px-4 py-2 focus:outline-none w-full sm:auto bg-gray-50"
          />
          <span className="text-sm font-medium">TO</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border rounded-lg px-4 py-2 focus:outline-none w-full sm:auto bg-gray-50"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-white border-b">
              <th className="px-4 py-2 text-left">Sl. No</th>{" "}
              {/* Serial number column */}
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Role</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.map((user, index) => {
              // Calculate serial number for each user based on current page and index
              const serialNumber = index + (currentPage - 1) * usersPerPage + 1;

              return (
                <tr key={user.id} className="bg-gray-50 border-b">
                  <td className="px-4 py-2">{serialNumber}</td>{" "}
                  {/* Display serial number */}
                  <td className="px-4 py-2">{user.name}</td>
                  <td className="px-4 py-2">{user.email}</td>
                  <td className="px-4 py-2">{user.role}</td>
                  <td className="px-4 py-2">
                    <div className="flex justify-between">
                      {/* Active/Inactive Icon */}
                      {user.status === "active" ? (
                        <button
                          onClick={() => handleStatusToggle(user._id)} // Trigger status toggle
                          className="text-green-600 hover:text-green-800"
                        >
                          <FaCheckCircle title="Active" /> {/* Active icon */}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStatusToggle(user._id)} // Trigger status toggle
                          className="text-red-600 hover:text-red-800"
                        >
                          <FaTimesCircle title="Inactive" />{" "}
                          {/* Inactive icon */}
                        </button>
                      )}
                      {/* Edit Icon */}
                      <button
                        // onClick={() => handleEditClick(user._id)} // Trigger the edit modal or functionality
                        className="text-blue-600 hover:text-blue-800"
                        onClick={() => handleEditClick(user)}
                      >
                        <FaEdit title="Edit" /> {/* Edit icon */}
                      </button>

                      {/* View Profile Icon */}
                      <button
                        onClick={() => handleViewClick(user)} // Trigger the view profile modal or page
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <FaEye title="View Profile" /> {/* View profile icon */}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

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
              currentPage === i + 1 ? "bg-blue-700" : "bg-blue-500"
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
      <UserModal
        user={selectedUser1}
        isOpen={isModalOpen}
        onClose={closeModal}
        mode={modalMode}
      />
    </div>
  );
};

export default UserPage;
