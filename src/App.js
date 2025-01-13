import React from "react";
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
import ProductMachineMaster from "./components/ProductMachineMaster";
import ChallanMaster from "./components/ChallanMaster";
import SellMaster from "./components/SellMaster";
import SalaryMaster from "./components/SalaryMaster";
import AMCMaster from "./components/AMCMaster";
import LoginPage from "./components/LoginPage";
import ProtectedRoute from "./components/ProtectedRoute";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

// Layout Component (handles navbar visibility)
const Layout = ({ children }) => {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";
  const token = sessionStorage.getItem("jwtToken");

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Show Navbar only if token exists and not on the login page */}
      {token && !isLoginPage && <Navbar />}
      <div className="p-5">{children}</div>
    </div>
  );
};

// Route configuration with their components
const protectedRoutes = [
  { path: "/employee", element: <EmployeeDetails /> },
  { path: "/customerDetails", element: <CustomerDetails /> },
  { path: "/vendorMaster", element: <VendorMaster /> },
  { path: "/productMaster", element: <ProductMaster /> },
  { path: "/productMachineMaster", element: <ProductMachineMaster /> },
  { path: "/challanMaster", element: <ChallanMaster /> },
  { path: "/sellMaster", element: <SellMaster /> },
  { path: "/amcMaster", element: <AMCMaster /> },
  { path: "/salaryMaster", element: <SalaryMaster /> },
];

const App = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Routes */}
          {protectedRoutes.map(({ path, element }) => (
            <Route
              key={path}
              path={path}
              element={<ProtectedRoute>{element}</ProtectedRoute>}
            />
          ))}

          {/* Default route for authenticated users */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Navigate to="/employee" replace />
              </ProtectedRoute>
            }
          />

          {/* Catch-all route */}
          <Route
            path="*"
            element={
              <ProtectedRoute>
                <Navigate to="/employee" replace />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
