import React, { useEffect, useState } from "react";
import * as tf from "@tensorflow/tfjs";

const TrainModel = () => {
  const [backend, setBackend] = useState("Loading...");

  const trainAndSaveModel = async () => {
    try {
      // Check WebGL support and fallback to CPU if necessary
      const isWebGLAvailable = await tf.setBackend("webgl").then(() => true).catch(() => false);
      if (!isWebGLAvailable) {
        await tf.setBackend("cpu");
        console.warn("WebGL is not supported. Falling back to CPU backend.");
      }
      await tf.ready();
      setBackend(tf.getBackend());
      console.log(`Using ${tf.getBackend()} backend.`);

      // Create a Convolutional Neural Network model for image classification
      const model = tf.sequential();

      // Add Conv2D layer, use relu activation function for feature extraction
      model.add(tf.layers.conv2d({
        filters: 32,
        kernelSize: 3,
        activation: 'relu',
        inputShape: [224, 224, 3], // Expecting an image with size 224x224 and 3 channels (RGB)
      }));

      // Add MaxPooling2D layer for down-sampling
      model.add(tf.layers.maxPooling2d({ poolSize: [2, 2] }));

      // Add a second Conv2D layer and MaxPooling2D for more feature extraction
      model.add(tf.layers.conv2d({ filters: 64, kernelSize: 3, activation: "relu" }));
      model.add(tf.layers.maxPooling2d({ poolSize: [2, 2] }));

      // Flatten the output to feed into the Dense layers
      model.add(tf.layers.flatten());

      // Fully connected Dense layers for classification
      model.add(tf.layers.dense({ units: 128, activation: "relu" }));
      model.add(tf.layers.dense({ units: 3, activation: "softmax" })); // 3 classes for classification

      model.compile({
        optimizer: "adam",
        loss: "categoricalCrossentropy",
        metrics: ["accuracy"],
      });

      // Example of training with random data (replace with actual image data)
      const xs = tf.randomNormal([100, 224, 224, 3]); // 100 images of size 224x224 with 3 channels
      const ys = tf.oneHot(tf.randomUniform([100], 0, 3, "int32"), 3); // Random labels for 3 classes

      await model.fit(xs, ys, { epochs: 10 });
      console.log("Model training complete.");

      // Save the model to local storage
      await model.save("localstorage://my-model");
      console.log("Model saved to local storage.");
    } catch (error) {
      console.error("Error during model training:", error);
    }
  };

  useEffect(() => {
    trainAndSaveModel();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">TensorFlow.js Model Training</h1>
      <p className="text-lg">Backend in use: {backend}</p>
      <p className="mt-2">
        {backend === "cpu" && "WebGL is not supported, using CPU backend instead."}
      </p>
    </div>
  );
};

export default TrainModel;
