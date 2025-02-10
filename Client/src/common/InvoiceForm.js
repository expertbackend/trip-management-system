import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function InvoiceForm() {
  const [formData, setFormData] = useState({
    vehicleId: '',
    basePay: '',
    perKmCharge: '',
    kmDriven: '',
    halt: '',
    tax: '',
    toll: '',
    discount: '',
    advance: '',
    extraExpanse: '',
    totalNetMaterialWeight: '',
    perTonPrice: '',
  });

  const [vehicles, setVehicles] = useState([]);
  const [invoiceData, setInvoiceData] = useState(null);
  const [error, setError] = useState('');

  // Fetch vehicles on component mount
  useEffect(() => {
    async function fetchVehicles() {
      try {
        const response = await axios.get('http://localhost:3001/api/vehicles');
        setVehicles(response.data);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch vehicles');
      }
    }
    fetchVehicles();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  const navigate = useNavigate();

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInvoiceData(null);

    try {
      const response = await axios.post('http://localhost:3001/api/generate-invoice', formData);
      navigate('/invoice-preview', { state: { invoiceData: response.data } });

      setInvoiceData(response.data);
    } catch (err) {
      console.error(err);
      setError('Failed to generate invoice. Please try again.');
    }
  };

  // Create form elements dynamically
  const createInputField = (name, label) => {
    return React.createElement(
      'div',
      { className: 'mb-4' },
      React.createElement('label', { className: 'block text-gray-700 mb-2' }, label),
      React.createElement('input', {
        type: 'text',
        name: name,
        value: formData[name],
        onChange: handleChange,
        className: 'w-full px-4 py-2 border rounded-md',
        required: true,
      })
    );
  };

  // Input fields list
  const inputFields = [
    { name: 'basePay', label: 'Base Pay' },
    { name: 'perKmCharge', label: 'Per KM Charge' },
    { name: 'kmDriven', label: 'KM Driven' },
    { name: 'halt', label: 'Halt Charges' },
    { name: 'tax', label: 'Tax (%)' },
    { name: 'toll', label: 'Toll Charges' },
    { name: 'discount', label: 'Discount (%)' },
    { name: 'advance', label: 'Advance Paid' },
    { name: 'extraExpanse', label: 'Extra Expenses' },
    { name: 'totalNetMaterialWeight', label: 'Total Net Material Weight' },
    { name: 'perTonPrice', label: 'Per Ton Price' },
  ];

  return React.createElement(
    'div',
    { className: 'max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md' },
    React.createElement('h2', { className: 'text-2xl font-bold mb-4 text-gray-800' }, 'Generate Invoice'),
    React.createElement(
      'form',
      { onSubmit: handleSubmit, className: 'space-y-4' },
      React.createElement(
        'div',
        { className: 'mb-4' },
        React.createElement('label', { className: 'block text-gray-700 mb-2' }, 'Select Vehicle'),
        React.createElement(
          'select',
          {
            name: 'vehicleId',
            value: formData.vehicleId,
            onChange: handleChange,
            className: 'w-full px-4 py-2 border rounded-md',
            required: true,
          },
          React.createElement(
            'option',
            { value: '' },
            'Select a vehicle'
          ),
          vehicles.map((vehicle) =>
            React.createElement(
              'option',
              { key: vehicle._id, value: vehicle._id },
              `${vehicle.name} (${vehicle.licensePlate})`
            )
          )
        )
      ),
      ...inputFields.map((field) => createInputField(field.name, field.label)),
      React.createElement(
        'button',
        {
          type: 'submit',
          className: 'bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700',
        },
        'Generate Invoice'
      )
    ),
    error &&
      React.createElement(
        'p',
        { className: 'text-red-500 mt-4' },
        error
      ),
    invoiceData &&
      React.createElement(
        'div',
        { className: 'mt-6 p-4 bg-gray-100 rounded-md' },
        React.createElement('h3', { className: 'text-lg font-semibold' }, 'Invoice Details'),
        Object.keys(invoiceData).map((key) =>
          React.createElement(
            'p',
            { key, className: 'text-gray-700' },
            `${key}: ${invoiceData[key]}`
          )
        )
      )
  );
}

export default InvoiceForm;
