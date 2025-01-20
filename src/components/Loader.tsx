import React from "react";
import Image from "next/image";

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

      <div style={{ marginBottom: "12px" }}>
        {" "}
        {/* Reduced spacing */}
        <Image
          src="/cat-loading.gif" // Replace with a path to your cat animation GIF
          alt="Loading cat animation"
          height={150} // Larger fixed height
          width={200} // Fixed width to maintain aspect ratio
          objectFit="contain"
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
