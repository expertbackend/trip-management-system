import React from 'react';
import MapComponent from './Map';

function OwnerDashboard() {
  return (
    <div className='overflow-y-auto max-h-[90vh]'>
      {/* <h2>Live Locations:</h2> */}
          <MapComponent/>
      {/* Owner-specific content */}
    </div>
  );
}

export default OwnerDashboard;
