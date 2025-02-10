import React from 'react';
import { useLocation } from 'react-router-dom'; // Assuming you're using React Router
import { jsPDF } from 'jspdf';
import axios from 'axios';

function InvoicePreview() {
  const location = useLocation();
  const { invoiceData } = location.state; // Get data passed from form submission

  const handleDownloadPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text('Invoice', 10, 10);

    // Add invoice details to the PDF
    Object.keys(invoiceData).forEach((key, index) => {
      doc.text(`${key}: ${invoiceData[key]}`, 10, 20 + index * 10);
    });

    doc.save(`invoice_${invoiceData.invoice.invoiceId}.pdf`);
  };

  const handleSaveToDB = async () => {
    try {
      const response = await axios.post('http://localhost:3001/api/invoices', invoiceData);
      alert('Invoice saved successfully!');
    } catch (error) {
      console.error(error);
      alert('Failed to save invoice to the database.');
    }
  };

  return React.createElement(
    'div',
    { className: 'max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md' },
    React.createElement('h2', { className: 'text-2xl font-bold mb-4 text-gray-800' }, 'Invoice Preview'),
    Object.keys(invoiceData).map((key) =>
      React.createElement(
        'p',
        { key, className: 'text-gray-700 mb-2' },
        `${key}: ${invoiceData[key]}`
      )
    ),
    React.createElement(
      'button',
      {
        onClick: handleDownloadPDF,
        className: 'bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 mr-2',
      },
      'Download PDF'
    ),
    React.createElement(
      'button',
      {
        onClick: handleSaveToDB,
        className: 'bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700',
      },
      'Save to Database'
    )
  );
}

export default InvoicePreview;
