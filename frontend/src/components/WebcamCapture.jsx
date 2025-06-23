import React, { useRef } from 'react';
import Webcam from 'react-webcam';

const videoConstraints = {
  width: 400,
  height: 300,
  facingMode: "user",
};

const WebcamCapture = ({ onCapture }) => {
  const webcamRef = useRef(null);

  const capture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      // Convert base64 to Blob
      fetch(imageSrc)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], "screenshot.jpg", { type: "image/jpeg" });
          onCapture(file); // Pass file to parent
        });
    }
  };

  return (
    <div>
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        videoConstraints={videoConstraints}
      />
      <button onClick={capture} style={{ marginTop: 10 }}>Capture Face</button>
    </div>
  );
};

export default WebcamCapture;
