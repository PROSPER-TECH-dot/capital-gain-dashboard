import React from "react";

const RechargePage = () => {
  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "80vh",
      flexDirection: "column",
      textAlign: "center",
      padding: "20px"
    }}>
      
      <h1 style={{ fontSize: "28px", color: "#ff4444", marginBottom: "10px" }}>
        Deposits Temporarily Disabled
      </h1>

      <p style={{ fontSize: "16px", maxWidth: "500px", lineHeight: "1.6" }}>
        We are currently performing maintenance on our payment system.
        Deposits are temporarily unavailable while we resolve a payment gateway issue.
      </p>

      <p style={{ marginTop: "15px", fontWeight: "bold" }}>
        Please try again later.
      </p>

      <div style={{
        marginTop: "30px",
        padding: "15px 25px",
        backgroundColor: "#f5f5f5",
        borderRadius: "8px"
      }}>
        <strong>Status:</strong> Payment system under maintenance
      </div>

    </div>
  );
};

export default RechargePage;                
