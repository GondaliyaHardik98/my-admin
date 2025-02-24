import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Navbar = () => {
  const navigate = useNavigate();
  const [userPermissions, setUserPermissions] = useState([]);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [modules, setModules] = useState([]);



  // Load user permissions from sessionStorage
  useEffect(() => {
    try {
      const permissions = JSON.parse(sessionStorage.getItem("userPermissions") || "[]");
      setUserPermissions(permissions);
      fetchModules();
    } catch (error) {
      console.error("Error parsing user permissions:", error);
      setUserPermissions([]);
    }
  }, []);

  // Fetch available modules dynamically
  const fetchModules = async () => {
    try {
      const token = sessionStorage.getItem("jwtToken");
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/modules`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        console.log("Fetched modules:", response.data.modules);
        setModules(response.data.modules);
      }
    } catch (error) {
      console.error("Error fetching modules:", error);
    }
  };

  // Handle menu toggle manually
  const toggleNavbar = () => {
    setIsNavOpen(!isNavOpen);
  };

  // Handle menu item clicks and close the menu
  const handleMenuClick = (path) => {
    navigate(path);
    setIsNavOpen(false);
  };

  // Logout handler
  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container-fluid">
        {/* Logo */}
        <a className="navbar-brand" href="/">BHARAT Technology</a>

        {/* Toggle Button for Mobile View */}
        <button className="navbar-toggler" type="button" onClick={toggleNavbar} aria-expanded={isNavOpen} aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navbar Items */}
        <div className={`navbar-collapse ${isNavOpen ? "show" : ""}`}>
          <ul className="navbar-nav me-auto">
            {/* Home Button */}
            <li className="nav-item">
              <button className="nav-link" onClick={() => handleMenuClick("/")}>Home</button>
            </li>

            {/* Dynamically Render User-Specific Modules */}
            {modules.map((module) =>
              userPermissions.includes(module.name) && (
                <li className="nav-item" key={module.id}>
                  <button className="nav-link" onClick={() => handleMenuClick(module.url)}>
                    {module.name}
                  </button>
                </li>
              ) 
            )}
          </ul>

          {/* Logout Button */}
          <ul className="navbar-nav">
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
