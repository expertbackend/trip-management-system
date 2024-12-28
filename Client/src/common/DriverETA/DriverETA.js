import React, { useState, useEffect } from "react";
import axios from "axios";

const getETA = async (origin, destination) => {
  const API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin}&destinations=${destination}&key=${API_KEY}`;

  try {
    const response = await axios.get(url);
    const { rows } = response.data;
    const eta = rows[0].elements[0].duration.text; // ETA in human-readable format
    return eta;
  } catch (error) {
    console.error("Error fetching ETA:", error);
    return "N/A";
  }
};

const DriverETA = ({ driverLocation, pickupLocation }) => {
  const [eta, setEta] = useState<string>("Calculating...");

  useEffect(() => {
    if (driverLocation && pickupLocation) {
      const origin = `${driverLocation.lat},${driverLocation.lng}`;
      const destination = `${pickupLocation.lat},${pickupLocation.lng}`;
      getETA(origin, destination).then(setEta);
    }
  }, [driverLocation, pickupLocation]);

  return <div>Estimated Time of Arrival: {eta}</div>;
};

export default DriverETA;
