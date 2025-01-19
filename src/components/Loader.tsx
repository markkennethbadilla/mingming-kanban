import React from "react";

const Loader: React.FC = () => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "87vh",
        backgroundColor: "var(--background-color)",
        textAlign: "center",
        padding: "20px",
      }}
    >
      {/* Cat Animation */}
      <div style={{ marginBottom: "12px" }}> {/* Reduced spacing */}
        <img
          src="cat-loading.gif" // Replace with a path to your cat animation GIF
          alt="Loading cat animation"
          style={{
            height: "150px", // Larger fixed height
            width: "auto", // Proportional width
            objectFit: "contain",
          }}
        />
      </div>

      {/* Loading Message */}
      <p
        style={{
          fontSize: "1.5rem", // Slightly larger font size
          fontWeight: "600",
          color: "var(--text-color)",
          margin: "0", // Removed bottom margin for compact design
        }}
      >
        Hang tight, we&apos;re fetching content! 🐾
      </p>
    </div>
  );
};

export default Loader;
