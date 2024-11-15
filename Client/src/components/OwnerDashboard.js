import React from 'react';
import MapComponent from './Map';

function OwnerDashboard() {
  return (
    <div>
      <h1>Owner Dashboard</h1>
      {/* <h2>Live Locations:</h2> */}
          <MapComponent/>
      {/* Owner-specific content */}
    </div>
  );
}

export default OwnerDashboard;
