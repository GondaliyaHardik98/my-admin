import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import DashboardCharts from "./DashboardCharts";

const Dashboard = () => {
    const navigate = useNavigate();
    
    const [userRole, setUserRole] = useState("");
    const [modules, setModules] = useState([]);

    useEffect(() => {
        try {
            
            
        } catch (error) {
            console.error("Error loading session data:", error);
          
            setUserRole("User");
        }
    }, []);

   

    // Predefined module colors
    const moduleColors = {
        "User Management": "bg-purple-500",
        "Employee Management": "bg-blue-500",
        "Customer Management": "bg-green-500",
        "Sell Management": "bg-yellow-500",
        "Payment Module": "bg-red-500",
        "AMC Master": "bg-indigo-500",
        "AMC Module": "bg-orange-500",
        "Product Management": "bg-teal-500",
        "Products (Machines)": "bg-pink-500",
        "Vendor Management": "bg-orange-500",
        "Challan Management": "bg-gray-500",
        "Rules": "bg-cyan-500"
    };

    // Filter modules based on permissions
   

    return (
        <div className="container mx-auto px-6 py-6">
            <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

          
            <div className="container mx-auto mt-6">
                {/* <h1 className="text-2xl font-bold mb-4">Dashboard</h1> */}
                <DashboardCharts />
            </div>
        </div>
    );
};

export default Dashboard;
