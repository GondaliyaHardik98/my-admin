import React, { useDebugValue } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const Navbar = () => {
  const navigate = useNavigate();

  // Decode roles from token
  const token = sessionStorage.getItem("jwtToken");
  let roles = [];

  if (token) {
    try {
      const decoded = jwtDecode(token);
      roles = decoded.roles || [];
      console.log("Roles: ", roles);
    } catch (err) {
      console.error("Error decoding token:", err);
    }
  }

  // Logout handler
  const handleLogout = () => {
    sessionStorage.removeItem("jwtToken");
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container-fluid">
        {/* Company Logo */}
        <a className="navbar-brand" href="/">
          {/* <img src="/src/logo.png" alt="Company Logo" height="40" /> */}
           BHARAT Technology 
        </a>

        {/* Toggle Button for Mobile View */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="show navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            {/* Common Links */}
            <li className="nav-item">
              <button className="nav-link btn" onClick={() => navigate("/")}>Home</button>
            </li>

            {/* Super Admin and Admin Links */}
            {(roles.includes("Super Admin")) && (
              <>
                <li className="nav-item">
                  <button className="nav-link btn" onClick={() => navigate("/customerDetails")}>Customer Management</button>
                </li>
                <li className="nav-item">
                  <button className="nav-link btn" onClick={() => navigate("/employee")}>Employee Management</button>
                </li>
                <li className="nav-item">
                  <button className="nav-link btn" onClick={() => navigate("/productMaster")}>Product Management</button>
                </li>
                <li className="nav-item">
                  <button className="nav-link btn" onClick={() => navigate("/vendorMaster")}>Vendor Management</button>
                </li>
                <li className="nav-item">
                <button className="nav-link btn" onClick={() => navigate("/challan")}>Challans</button>
                </li>
                <li className="nav-item">
                <button className="nav-link btn" onClick={() => navigate("/sellMaster")}>Sales</button>
                </li>
                <li className="nav-item">
                <button className="nav-link btn" onClick={() => navigate("/amcMaster")}>AMC</button>
              </li>
              </>
            )}

            {/* Sales Admin Links */}
            {roles.includes("Sales Admin") && (
              <>
                 <li className="nav-item">
                  <button className="nav-link btn" onClick={() => navigate("/customerDetails")}>Customer Management</button>
                </li>
                
              <li className="nav-item">
                <button className="nav-link btn" onClick={() => navigate("/sellMaster")}>Sales</button>
                </li>
                
                <li className="nav-item">
                  <button className="nav-link btn" onClick={() => navigate("/productMaster")}>Product Management</button>
                </li>
                
              <li className="nav-item">
                <button className="nav-link btn" onClick={() => navigate("/amcMaster")}>AMC</button>
              </li>
              
              </>
              
              
            )}

            {/* Challan Admin Links */}
            {roles.includes("Challan Admin") && (
              <li className="nav-item">
                <button className="nav-link btn" onClick={() => navigate("/challan")}>Challans</button>
              </li>
            )}
          </ul>

          {/* Logout */}
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <button className="nav-link btn btn-danger" onClick={handleLogout}>Logout</button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
