import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const jwtToken = sessionStorage.getItem("jwtToken");

  if (!jwtToken) {
    // Redirect to login if the token is not present
    return <Navigate to="/login" />;
  }

  // Allow access to the protected route
  return children;
};

export default ProtectedRoute;
