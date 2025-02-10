import React, { useState } from "react";
import * as tf from "@tensorflow/tfjs";

// Function to load the model from localStorage or other source
const loadModel = async () => {
  try {
    const model = await tf.loadLayersModel("localstorage://my-model");
    return model;
  } catch (error) {
    console.error("Failed to load the model:", error);
    return null;
  }
};

// Function to preprocess the image for the model
const loadImageAsTensor = async (imageFile) => {
  const img = new Image();
  img.src = URL.createObjectURL(imageFile);
  
  // Wait for the image to load
  await new Promise((resolve) => {
    img.onload = resolve;
  });

  // Resize the image to the expected input size (224x224)
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (ctx) {
    canvas.width = 224;  // Expected width by the model
    canvas.height = 224; // Expected height by the model
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Convert the image to a tensor, normalize, and add a batch dimension
    let tensor = tf.browser.fromPixels(canvas);
    tensor = tensor.expandDims(0).toFloat().div(tf.scalar(255)); // Normalize and add batch dimension

    return tensor;
  }
  throw new Error("Unable to process the image.");
};

const MeterUpload = () => {
  const [image, setImage] = useState(null);
  const [status, setStatus] = useState("Upload an image to start.");
  const [hrs, setHrs] = useState(null);

  // Handle image upload
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(file);
      setStatus("Image uploaded. Processing...");
    }
  };

  // Extract hours (or other values) from the image
  const extractHrsFromImage = async () => {
    if (!image) {
      setStatus("Please upload an image first.");
      return;
    }

    setStatus("Processing...");
    const model = await loadModel();

    if (!model) {
      setStatus("Model could not be loaded.");
      return;
    }

    // Load and preprocess the image
    const imgTensor = await loadImageAsTensor(image);

    // Make prediction using the model
    const prediction = model.predict(imgTensor);

    // Assuming the model returns the output as a single value (e.g., hours)
    const predictedHrs = prediction.dataSync()[0];
    setHrs(predictedHrs.toString());
    setStatus("Extraction complete!");
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Image Hour Extraction</h1>
      <p className="text-lg">{status}</p>

      {/* File input for image upload */}
      <input
        type="file"
        onChange={handleImageUpload}
        className="my-4"
        accept="image/*"
      />

      {/* Button to trigger extraction */}
      <button
        onClick={extractHrsFromImage}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Extract Hours
      </button>

      {/* Display extracted hours */}
      {hrs !== null && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold">Predicted Hours:</h2>
          <p className="text-lg">{hrs} hours</p>
        </div>
      )}
    </div>
  );
};

export default MeterUpload;
