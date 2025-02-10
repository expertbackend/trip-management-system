import React from 'react';
import MapComponent from './Map';
import OCRApp from './MeterUpload';
import ImageUploader from './MeterUpload';
import TrainModel from './trainModel';

function OwnerDashboard() {
  return (
    <div className='overflow-y-auto max-h-[90vh]'>
      <MapComponent />
    </div>
  );
}

export default OwnerDashboard;
