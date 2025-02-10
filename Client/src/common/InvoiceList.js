import React, { useEffect, useState } from 'react';
import axios from 'axios';

function InvoiceList() {
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    async function fetchInvoices() {
      try {
        const response = await axios.get('http://localhost:3001/api/invoices');
        setInvoices(response.data);
      } catch (error) {
        console.error(error);
        alert('Failed to fetch invoices.');
      }
    }

    fetchInvoices();
  }, []);

  return React.createElement(
    'div',
    { className: 'max-w-5xl mx-auto p-6 bg-white rounded-lg shadow-md' },
    React.createElement('h2', { className: 'text-2xl font-bold mb-4 text-gray-800' }, 'Invoice List'),
    React.createElement(
      'table',
      { className: 'w-full border-collapse border border-gray-300' },
      React.createElement(
        'thead',
        null,
        React.createElement(
          'tr',
          null,
          ['Invoice ID', 'Customer Name', 'Total Fare', 'Final Amount', 'Generated At'].map((header) =>
            React.createElement(
              'th',
              { className: 'border border-gray-300 p-2 text-left' },
              header
            )
          )
        )
      ),
      React.createElement(
        'tbody',
        null,
        invoices.map((invoice) =>
          React.createElement(
            'tr',
            { key: invoice._id },
            React.createElement('td', { className: 'border border-gray-300 p-2' }, invoice.invoice.invoiceId),
            React.createElement('td', { className: 'border border-gray-300 p-2' }, invoice.invoice.customerName),
            React.createElement('td', { className: 'border border-gray-300 p-2' }, invoice.invoice.totalFare),
            React.createElement('td', { className: 'border border-gray-300 p-2' }, invoice.invoice.finalAmount),
            React.createElement('td', { className: 'border border-gray-300 p-2' }, new Date(invoice.invoice.generatedAt).toLocaleDateString())
          )
        )
      )
    )
  );
}

export default InvoiceList;
