import React, { useState, useEffect } from "react";
import axios from "axios";
import Modal from "../components/Modal";
import Select from "react-select"; // Import react-select

const UserModal = ({ isOpen, onClose, user, mode }) => {
  const [userData, setUserData] = useState(user);
  const [allPermissions, setAllPermissions] = useState([]);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [defaultPermissions, setDefaultPermissions] = useState([]);
  const token = localStorage.getItem("token");

  // Axios instance with Authorization header
  const axiosInstance = axios.create({
    baseURL: `${process.env.REACT_APP_API_URL}/api/owner`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  useEffect(() => {
    setUserData(user); // Update user data when the user prop changes
    setSelectedPermissions(user?.permissions || []); // Initialize permissions
    setDefaultPermissions(user?.permissions || []); // Initialize default permissions
    fetchAllPermissions(); // Fetch all permissions once modal opens
  }, [user, isOpen]);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const fetchAllPermissions = async () => {
    try {
      const response = await axiosInstance.get("/getAllPermission"); // Endpoint to get all permissions
      setAllPermissions(response.data.permissions);
    } catch (error) {
      console.error("Error fetching permissions:", error);
      alert("Error fetching permissions. Please try again.");
    }
  };

  const handlePermissionChange = (selectedOptions) => {
    const newPermissions = selectedOptions ? selectedOptions.map(option => option.value) : [];
    console.log("Selected Permissions:", newPermissions);  // Check the selected permissions
    setSelectedPermissions(newPermissions);
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { email, ...dataToUpdate } = userData;
      const payload = { ...dataToUpdate, permissions: selectedPermissions };

      const response = await axiosInstance.put(
        `/update/${userData._id}`,
        payload
      );

      if (response.status === 200) {
        alert("User updated successfully!");
        onClose();
      }
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Error updating user. Please try again.");
    }
  };

  // Format the permissions for react-select
  const permissionsOptions = allPermissions.map(permission => ({
    value: permission._id,
    label: `${permission.name} ${permission.resource}`,
  }));

  // Prepare the default selected options for react-select from user.permissions
  const defaultSelectedPermissions = permissionsOptions.filter(option =>
    selectedPermissions.includes(option.value)
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-xl font-bold text-green-600 mb-6">
        {mode === "edit" ? "Edit User" : "View User"}
      </h2>

      {userData ? (
        <form onSubmit={handleSubmit}>
          {/* Name */}
          <div className="mb-6">
            <label className="block text-gray-700">Name</label>
            {mode === "edit" ? (
              <input
                type="text"
                name="name"
                value={userData.name}
                onChange={handleEditChange}
                className="w-full mt-2 p-2 border border-gray-300 rounded-md"
              />
            ) : (
              <p className="w-full mt-2 p-2 border border-gray-300 rounded-md">
                {userData.name}
              </p>
            )}
          </div>

          {/* Role */}
          <div className="mb-6">
            <label className="block text-gray-700">Role</label>
            {mode === "edit" ? (
              <select
                name="role"
                value={userData.role}
                onChange={handleEditChange}
                className="w-full mt-2 p-2 border border-gray-300 rounded-md"
              >
                <option value="operator">Operator</option>
                <option value="driver">Driver</option>
              </select>
            ) : (
              <p className="w-full mt-2 p-2 border border-gray-300 rounded-md">
                {userData.role}
              </p>
            )}
          </div>

          {/* Status */}
          <div className="mb-6">
            <label className="block text-gray-700">Status</label>
            {mode === "edit" ? (
              <select
                name="status"
                value={userData.status}
                onChange={handleEditChange}
                className="w-full mt-2 p-2 border border-gray-300 rounded-md"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            ) : (
              <p className="w-full mt-2 p-2 border border-gray-300 rounded-md">
                {userData.status}
              </p>
            )}
          </div>

          {/* Permissions */}
          <div className="mb-6">
            <label className="block text-gray-700">Assigned Permissions</label>
            {mode === "edit" ? (
              <div>
                <input
                  type="text"
                  value={defaultPermissions.map(permission => `${permission.name} (${permission.resource})`)} // Display default permissions as comma separated values
                  className="w-full mt-2 p-2 border border-gray-300 rounded-md"
                  readOnly
                />
                <Select
  isMulti
  options={permissionsOptions}
  value={defaultSelectedPermissions}
  onChange={handlePermissionChange}
  className="mt-2"
  placeholder="Select Permissions"
/>

              </div>
            ) : (
              <ul className="mt-2 list-disc pl-4">
                {userData.permissions?.map((permission) => (
                  <li key={permission.name}>{permission.resource}</li>
                ))}
              </ul>
            )}
          </div>

          {/* Buttons */}
          <button
            type="button"
            onClick={onClose}
            className="w-full bg-green-600 text-white py-2 rounded-full"
          >
            Close
          </button>

          {mode === "edit" && (
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-full mt-4"
            >
              Save Changes
            </button>
          )}
        </form>
      ) : (
        <div>Loading...</div>
      )}
    </Modal>
  );
};

export default UserModal;
