import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useLocation,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import EmployeeDetails from "./components/EmpDetails";
import CustomerDetails from "./components/CustomerDetails";
import VendorMaster from "./components/VendorMaster";
import ProductMaster from "./components/ProductMaster";
import ChallanMaster from "./components/ChallanMaster";
import SellMaster from "./components/SellMaster";
import SalaryMaster from "./components/SalaryMaster";
import AMCMaster from "./components/AMCMaster";
import LoginPage from "./components/LoginPage";

// Create a wrapper component for layout
const Layout = ({ isLoggedIn, children }) => {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Only show Navbar if logged in AND not on login page */}
      {isLoggedIn && !isLoginPage && <Navbar />}
      <div className="p-5">{children}</div>
    </div>
  );
};

const App = () => {
  // State to manage login status
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check session storage to maintain login state on page reload
  useEffect(() => {
    const token = sessionStorage.getItem("jwtToken");
    if (token) {
      setIsLoggedIn(true); // Set logged-in state if token exists
    }
  }, []);

  return (
    <Router>
      <Layout isLoggedIn={isLoggedIn}>
        <Routes>
          {/* Public Route for Login */}
          <Route
            path="/login"
            element={
              isLoggedIn ? (
                <Navigate to="/employee" replace />
              ) : (
                <LoginPage setIsLoggedIn={setIsLoggedIn} />
              )
            }
          />

          {/* Default route: Redirect to login if not logged in */}
          <Route
            path="/"
            element={
              isLoggedIn ? (
                <Navigate to="/employee" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Protected Routes */}
          {isLoggedIn ? (
            <>
              <Route path="/employee" element={<EmployeeDetails />} />
              <Route path="/customerDetails" element={<CustomerDetails />} />
              <Route path="/vendorMaster" element={<VendorMaster />} />
              <Route path="/productMaster" element={<ProductMaster />} />
              <Route path="/challanMaster" element={<ChallanMaster />} />
              <Route path="/sellMaster" element={<SellMaster />} />
              <Route path="/amcMaster" element={<AMCMaster />} />
              <Route path="/salaryMaster" element={<SalaryMaster />} />
            </>
          ) : (
            <Route path="*" element={<Navigate to="/login" replace />} />
          )}
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
