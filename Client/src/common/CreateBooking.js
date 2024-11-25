import { useState, useEffect } from 'react';
import axios from 'axios';
import PlacesAutocomplete, { geocodeByAddress, getLatLng } from 'react-places-autocomplete';
import jsPDF from 'jspdf'; // Import jsPDF library

const CreateBooking = () => {
  const [formData, setFormData] = useState({
    vehicleId: '',
    pickupLocation: '',
    dropoffLocation: '',
    kmDriven: '',
    customerName: '',
    custPhNo: '',
    custEmailId: '',
    custAddress: '',
    basePay: '',
    perKmCharge: '',
    halt: '',
    tax: '',
    toll: '',
    discount: '',
    startDate: '',
    endDate: '',
    kmDriven: ''
  });
  const [loading, setLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState(null);
  const [vehicles, setVehicles] = useState([]); // Store available vehicles
  const token = localStorage.getItem("token");

  const axiosInstance = axios.create({
    baseURL: `${process.env.REACT_APP_API_URL}/api/booking`,
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
    // Fetch vehicles based on start and end date
    if (formData.startDate && formData.endDate) {
      const fetchVehicles = async () => {
        try {
          const res = await axiosInstance1.get('/vehicles', {
            params: {
              startDate: formData.startDate,
              endDate: formData.endDate,
            },
          });
          if (res.data.vehicles) {
            setVehicles(res.data.vehicles);
          } else {
            setVehicles([]);
            setResponseMessage('No vehicles available for the selected dates.');
          }
        } catch (error) {
          console.error('Error fetching vehicles:', error);
          setResponseMessage('Error fetching vehicles.');
        }
      };
      fetchVehicles();
    }
  }, [formData.startDate, formData.endDate]); // Trigger when dates change

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  const handleSelectLocation = (address, type) => {
    geocodeByAddress(address)
      .then((results) => getLatLng(results[0])) // Geocoding the selected address to get lat and lng
      .then(({ lat, lng }) => {
        setFormData({
          ...formData,
          [type]: address, // Store the address
          [`${type}Lat`]: lat, // Store latitude
          [`${type}Lng`]: lng, // Store longitude
        });
      })
      .catch((error) => console.error('Error selecting location', error));
  };
  const handleDownloadInvoice = (invoice, ownerName) => {
    const doc = new jsPDF();
    
    // Styles
    const primaryColor = "#000000";
    const accentColor = "#FF0000";
    const lineHeight = 10;
    const marginX = 20;
    const address = `Back side of Utkal, Kanika Galeria
Plot No 78, Gautam Nagar
Bhubaneswar, Odisha 751014
India`;

    // Header
    doc.setFillColor(primaryColor);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text(ownerName || 'Owner Name', marginX, 15);  // Ensure ownerName is defined
    doc.setFontSize(12);
    doc.text(address, marginX, 25);
    doc.setFontSize(18);
    doc.setTextColor(accentColor);
    doc.text("INVOICE", 160, 15);

    // Invoice Info
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text(`Invoice#: ${invoice.invoiceId || 'Unknown ID'}`, 160, 25);
    doc.text(`Date: ${invoice.generatedAt ? new Date(invoice.generatedAt).toLocaleDateString() : 'N/A'}`, 160, 35);

    // Customer Info
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Invoice to:`, marginX, 50);
    doc.setFontSize(10);
    doc.text(`Customer Name: ${invoice.customerName || 'N/A'}`, marginX, 55);
    doc.text(`Phone Number: ${invoice.custPhNo || 'N/A'}`, marginX, 60);
    doc.text(`Email: ${invoice.custEmailId || 'N/A'}`, marginX, 65);
    doc.text(`Address: ${invoice.custAddress || 'N/A'}`, marginX, 70);

    // Invoice Breakdown Header
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text("SL.  Total Fare                    Tax Amount        Toll Amount    Discount Amount Final Amount", marginX, 85);

    // Itemized List
    doc.setFontSize(10);
    let yPosition = 95;
    if (invoice.discountAmount && invoice.totalFare) {
        doc.text(`1`, marginX, yPosition);
        doc.text(`${(invoice.totalFare || 0).toFixed(2)}`, marginX + 20, yPosition); 
        doc.text(`${(invoice.taxAmount || 0).toFixed(2)}`, marginX + 60, yPosition);  
        doc.text(`${invoice.tollAmount || 0}`, marginX + 100, yPosition);  
        doc.text(`-${invoice.discountAmount || 0}`, marginX + 130, yPosition);  
        doc.text(`${invoice.finalAmount || 0}`, marginX + 160, yPosition);  
        yPosition += lineHeight;
    }

    // Summary Section
    yPosition += 10;
    doc.text(`Total Fare: ${invoice.totalFare || 0}`, marginX, yPosition);
    doc.text(`Tax Amount: ${invoice.taxAmount || 0}`, marginX, yPosition + lineHeight);
    doc.text(`Toll Amount: ${invoice.tollAmount || 0}`, marginX, yPosition + 2 * lineHeight);
    doc.text(`Discount Amount: -${invoice.discountAmount || 0}`, marginX, yPosition + 3 * lineHeight);
    doc.text(`Final Amount: ${invoice.finalAmount || 0}`, marginX, yPosition + 4 * lineHeight);

    // Footer
    yPosition += 40;
    doc.setFontSize(10);
    doc.setTextColor(primaryColor);
    doc.setTextColor(150, 150, 150);
    doc.text("Payment Info:", marginX, yPosition + 20);
    doc.text(`Account #: 123 456 789`, marginX, yPosition + 30);
    doc.text(`Bank Details: Your bank details here`, marginX, yPosition + 40);

    // Terms & Conditions
    yPosition += 50;
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text("Terms & Conditions:", marginX, yPosition);
    doc.text("Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce eleifend ultricies velit.", marginX, yPosition + lineHeight);

    // Estimated Booking Stamp
    doc.setFontSize(30);
    doc.setTextColor(150, 0, 0);
    doc.setTextColor(0, 0, 0, 0.5);  // Set transparency to 50%
    doc.text("ESTIMATED BOOKING", 105, yPosition + 50, { align: "center" });  // Centered stamp

    // Signature Line
    doc.setFontSize(10);
    doc.setTextColor(primaryColor);
    doc.text("Authorized Sign", 160, yPosition + 70);

    // Save the PDF
    doc.save(`invoice_${invoice.invoiceId || 'Unknown'}_${new Date().getTime()}.pdf`);
};
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Ensure pickup and dropoff locations along with their coordinates are sent
    const dataToSubmit = {
        ...formData,
        pickupLocation: {
            address: formData.pickupLocation,
            lat: formData.pickupLocationLat,
            lng: formData.pickupLocationLng,
        },
        dropoffLocation: {
            address: formData.dropoffLocation,
            lat: formData.dropoffLocationLat,
            lng: formData.dropoffLocationLng,
        },
    };

    try {
        const res = await axiosInstance.post('/bookings', dataToSubmit);
        const invoice = res.data.invoice;
        const ownerName = res.data.ownerName
        // Generate PDF with the invoice data
        handleDownloadInvoice(invoice,ownerName);
        // Show success popup
        alert('Booking created successfully!'); // Replace with your preferred popup UI

        // Clear the form data
        setFormData({
            pickupLocation: '',
            pickupLocationLat: '',
            pickupLocationLng: '',
            dropoffLocation: '',
            dropoffLocationLat: '',
            dropoffLocationLng: '',
            customerName: '',
            custPhNo: '',
            custEmailId: '',
            custAddress: '',
            basePay: '',
            perKmCharge: '',
            halt: '',
            tax: '',
            toll: '',
            discount: '',
            startDate: '',
            endDate: '',
            kmDriven:''
        });

        // Log success response
        console.log('Booking created:', res.data.booking);
    } catch (error) {
        console.error('Error creating booking:', error);

        // Show error popup
        alert('Error creating booking. Please try again.'); // Replace with your preferred popup UI
    } finally {
        setLoading(false);
    }
};

  
  return (
    <div className="bg-gray-100 rounded-lg shadow-lg overflow-y-auto max-h-[90vh] p-4">
      <h1 className="text-3xl font-semibold mb-6">Create Booking</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Pickup and Dropoff Location with Start/End Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <PlacesAutocomplete
            value={formData.pickupLocation}
            onChange={(e) => handleChange({ target: { name: 'pickupLocation', value: e } })}
            onSelect={(address) => handleSelectLocation(address, 'pickupLocation')}
          >
            {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
              <div className="relative">
                <input
                  {...getInputProps({
                    placeholder: 'Pickup Location',
                    className: 'p-3 border border-gray-300 rounded-md w-full',
                  })}
                  required
                />
                {loading && <div className="absolute top-10 left-0 w-full bg-white border border-gray-300 p-2 rounded-md">Loading...</div>}
                {suggestions.length > 0 && (
                  <ul className="absolute top-10 left-0 w-full bg-white border border-gray-300 rounded-md shadow-lg">
                    {suggestions.map((suggestion, index) => (
                      <li
                        key={index}
                        {...getSuggestionItemProps(suggestion)}
                        className="p-2 cursor-pointer hover:bg-gray-100"
                      >
                        {suggestion.description}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </PlacesAutocomplete>

          <PlacesAutocomplete
            value={formData.dropoffLocation}
            onChange={(e) => handleChange({ target: { name: 'dropoffLocation', value: e } })}
            onSelect={(address) => handleSelectLocation(address, 'dropoffLocation')}
          >
            {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
              <div className="relative">
                <input
                  {...getInputProps({
                    placeholder: 'Dropoff Location',
                    className: 'p-3 border border-gray-300 rounded-md w-full',
                  })}
                  required
                />
                {loading && <div className="absolute top-10 left-0 w-full bg-white border border-gray-300 p-2 rounded-md">Loading...</div>}
                {suggestions.length > 0 && (
                  <ul className="absolute top-10 left-0 w-full bg-white border border-gray-300 rounded-md shadow-lg">
                    {suggestions.map((suggestion, index) => (
                      <li
                        key={index}
                        {...getSuggestionItemProps(suggestion)}
                        className="p-2 cursor-pointer hover:bg-gray-100"
                      >
                        {suggestion.description}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </PlacesAutocomplete>
        </div>

        {/* Date Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            className="p-3 border border-gray-300 rounded-md"
            required
          />
          <input
            type="date"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            className="p-3 border border-gray-300 rounded-md"
            required
          />
        </div>

        {/* Vehicle Selection Dropdown */}
        {vehicles.length > 0 && (
          <div className="space-y-4">
            <select
              name="vehicleId"
              value={formData.vehicleId}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md"
              required
            >
              <option value="">Select Vehicle</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle._id} value={vehicle._id}>
                  {vehicle.name} - {vehicle.status} ({vehicle.plateNumber})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Customer Details */}
        <div className="space-y-4">
          <input
            type="text"
            name="customerName"
            placeholder="Customer Name"
            value={formData.customerName}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-md"
            required
          />
          <input
            type="tel"
            name="custPhNo"
            placeholder="Customer Phone Number"
            value={formData.custPhNo}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-md"
            required
          />
          <input
            type="email"
            name="custEmailId"
            placeholder="Customer Email"
            value={formData.custEmailId}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-md"
            required
          />
          <input
            type="text"
            name="custAddress"
            placeholder="Customer Address"
            value={formData.custAddress}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-md"
            required
          />
        
          <input
            type="number"
            name='kmDriven'
            placeholder="Enter km driven"
            value={formData.kmDriven}
            onChange={handleChange}
            className="w-full mt-2 p-2 border border-gray-300 rounded-md"
          />
      
        </div>

        {/* Financial Details */}
        <div className="space-y-4">
          <input
            type="number"
            name="basePay"
            placeholder="Base Pay"
            value={formData.basePay}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-md"
            required
          />
          <input
            type="number"
            name="perKmCharge"
            placeholder="Per KM Charge"
            value={formData.perKmCharge}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-md"
            required
          />
          
          <input
            type="number"
            name="halt"
            placeholder="Halt"
            value={formData.halt}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-md"
            required
          />
          <input
            type="number"
            name="tax"
            placeholder="Tax"
            value={formData.tax}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-md"
            required
          />
          <input
            type="number"
            name="toll"
            placeholder="Toll"
            value={formData.toll}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-md"
            required
          />
          <input
            type="number"
            name="discount"
            placeholder="Discount"
            value={formData.discount}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-md"
            required
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full p-4 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          {loading ? 'Creating Booking...' : 'Create Booking'}
        </button>
      </form>
      {responseMessage && (
        <div className="mt-4 text-center text-xl">
          {responseMessage}
        </div>
      )}
    </div>
  );
};

export default CreateBooking;
