import React from "react";
import "./Loader.css"; // Add some styles for the loader

const Loader = () => {
  return (
    <div className="loader-overlay">
      <div className="loader-spinner"></div>
    </div>
  );
};

export default Loader;
