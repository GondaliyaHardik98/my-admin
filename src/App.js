import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation  } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import UserManagement from "./components/UserManagement";
import EmployeeManagement from "./components/EmpDetails";
import CustomerManagement from "./components/CustomerDetails";
import SellManagement from "./components/SellMaster";
//import PaymentModule from "./components/pa";
import AMCRenewal from "./components/AMCRenewal";
import AMCMaster from "./components/AMCMaster";
import ProductManagement from "./components/ProductMaster";
import ProductMachineManagement from "./components/ProductMachineMaster";
import VendorManagement from "./components/VendorMaster";
import ChallanManagement from "./components/ChallanMaster";
import RuleSettings from "./components/RuleSettings";
import LoginPage from "./components/LoginPage";
import Navbar from "./components/Navbar";
import ProductCategory from "./components/ProductCategory";
import PaymentMaster from "./components/PaymentMaster"; 


const ProtectedRoute = ({ children }) => {
    const token = sessionStorage.getItem("jwtToken");
    return token ? children : <Navigate to="/login" />;
};

export default function App() {
    return (
        <Router>
              <Main />
           
        </Router>
    );
}


const Main = () => {
    const location = useLocation(); // Get current route

    return (
        <>
            {/* ✅ Show Navbar only if NOT on Login Page */}
            {location.pathname !== "/login" && <Navbar />}
            
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/user-management" element={<ProtectedRoute><UserManagement /></ProtectedRoute>} />
                <Route path="/employees" element={<ProtectedRoute><EmployeeManagement /></ProtectedRoute>} />
                <Route path="/customerDetails" element={<ProtectedRoute><CustomerManagement /></ProtectedRoute>} />
                <Route path="/sell" element={<ProtectedRoute><SellManagement /></ProtectedRoute>} />
                <Route path="/amcRenew" element={<ProtectedRoute><AMCRenewal /></ProtectedRoute>} />
                <Route path="/amc" element={<ProtectedRoute><AMCMaster /></ProtectedRoute>} />
                <Route path="/products" element={<ProtectedRoute><ProductManagement /></ProtectedRoute>} />
                <Route path="/product-machines" element={<ProtectedRoute><ProductMachineManagement /></ProtectedRoute>} />
                <Route path="/vendors" element={<ProtectedRoute><VendorManagement /></ProtectedRoute>} />
                <Route path="/challans" element={<ProtectedRoute><ChallanManagement /></ProtectedRoute>} />
                <Route path="/rules" element={<ProtectedRoute><RuleSettings /></ProtectedRoute>} />
                <Route path="/product-categories" element={<ProtectedRoute><ProductCategory /></ProtectedRoute>}/>
                <Route path="/payment-management" element={<ProtectedRoute><PaymentMaster /></ProtectedRoute>}/>
            </Routes>
        </>
    );
};