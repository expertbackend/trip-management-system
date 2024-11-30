import React, { useState } from "react";

const UpdatePopup = ({ selectedDoc, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    documentType: selectedDoc.documentType,
    expiryDate: selectedDoc.expiryDate,
    reminderDate: selectedDoc.reminderDate,
    description: selectedDoc.description,
    amount: selectedDoc.amount,
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    onUpdate(selectedDoc._id, formData); // Call the update API
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-1/3">
        <h2 className="text-xl font-bold mb-4">Update Document</h2>
        <div className="space-y-4">
          <div>
            <label className="block font-medium mb-1">Document Type</label>
            <input
              type="text"
              name="documentType"
              value={formData.documentType}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Expiry Date</label>
            <input
              type="date"
              name="expiryDate"
              value={formData.expiryDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Reminder Date</label>
            <input
              type="date"
              name="reminderDate"
              value={formData.reminderDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md"
            ></textarea>
          </div>
          <div>
            <label className="block font-medium mb-1">Amount</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded-md mr-2"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="bg-blue-500 text-white px-4 py-2 rounded-md"
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdatePopup;
