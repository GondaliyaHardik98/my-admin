import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import EmployeeDetails from "./components/EmpDetails";
import CustomerDetails from "./components/CustomerDetails";
import VendorMaster from "./components/VendorMaster";
import ProductMaster from "./components/ProductMaster";
import ChallanMaster from "./components/ChallanMaster";
import SellMaster from "./components/SellMaster";
import SalaryMaster from "./components/SalaryMaster";

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="p-5">
          <Routes>
            <Route path="/employee" element={<EmployeeDetails />} />
            <Route path="/customerDetails" element={<CustomerDetails />} />
            <Route path="/vendorMaster" element={<VendorMaster />} />
            <Route path="/productMaster" element={<ProductMaster />} />
            <Route path="/challanMaster" element={<ChallanMaster />} />
            <Route path="/sellMaster" element={<SellMaster />} />
            <Route path="/salaryMaster" element={<SalaryMaster />} />
            {/* Add other routes here if needed */}
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
