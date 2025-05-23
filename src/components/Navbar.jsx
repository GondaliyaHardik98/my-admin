import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Navbar = () => {
  const navigate = useNavigate();
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [modules, setModules] = useState([]);
  const [openDropdown, setOpenDropdown] = useState(null);

 
  const toggleDropdown = (key) => setOpenDropdown(openDropdown === key ? null : key);

  // Load user permissions from sessionStorage
  useEffect(() => {
    try {
      fetchModules();
    } catch (error) {
      console.log("Error parsing user permissions:", error);
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
        const permissions = JSON.parse(sessionStorage.getItem("userPermissions") || "[]");
        console.log("User permissions loaded from sessionStorage:", permissions);
       
        const filtered = response.data.modules.filter((m) => permissions.includes(m.name));
        console.log("Filtered modules:", filtered);
        setModules(filtered);
      }
    } catch (error) {
      console.error("Error fetching modules:", error);
    }
  };

  const groupedModules = modules.reduce((acc, mod) => {
    const cat = mod.category || "Others";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(mod);
    return acc;
  }, {});

  // Handle menu toggle manually
  const toggleNavbar = () => {
    setIsNavOpen(!isNavOpen);
  };

  // Handle menu item clicks and close the menu
  const handleMenuClick = (path) => {
    navigate(path);
    setIsNavOpen(false);
    toggleDropdown(null); // Close any open dropdowns
  };

  // Logout handler
  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm px-3">
    <div className="container-fluid">
      <a className="navbar-brand fw-bold text-uppercase" href="/">BHARAT Technology</a>

      <button
        className="navbar-toggler"
        type="button"
        onClick={toggleNavbar}
        aria-expanded={isNavOpen}
        aria-label="Toggle navigation"
      >
        <span className="navbar-toggler-icon"></span>
      </button>

      <div className={`navbar-collapse ${isNavOpen ? "show" : ""}`}>
        <ul className="navbar-nav me-auto">
          <li className="nav-item">
            <button className="nav-link  text-white" onClick={() => handleMenuClick("/")}>Home</button>
          </li>

          {Object.entries(groupedModules).map(([category, items]) => (
            <li key={category} className="nav-item dropdown position-relative">
            <button
              className="nav-link dropdown-toggle text-white"
              onClick={() => toggleDropdown(category)}
            >
              {category}
            </button>
          
            {openDropdown === category && (
              <ul className="dropdown-menu show border-0 shadow-sm mt-2 position-absolute">
                {items.map((m) => (
                  <li key={m.id}>
                    <button className="dropdown-item" onClick={() => handleMenuClick(m.url)}>
                      {m.name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </li>
          
          ))}
        </ul>

        <ul className="navbar-nav">
          <li className="nav-item">
            <button className="nav-link btn btn-danger  text-white" onClick={handleLogout}>Logout</button>
          </li>
        </ul>
      </div>
    </div>
  </nav>
  );
};

export default Navbar;
