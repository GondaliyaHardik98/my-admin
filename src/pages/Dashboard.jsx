import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Dashboard = () => {
    const navigate = useNavigate();
    const [userPermissions, setUserPermissions] = useState([]);
    const [userRole, setUserRole] = useState("");
    const [modules, setModules] = useState([]);

    useEffect(() => {
        try {
            const storedPermissions = JSON.parse(sessionStorage.getItem("userPermissions") || "[]");
            const storedRole = sessionStorage.getItem("userRole") || "User";

            setUserPermissions(storedPermissions);
            setUserRole(storedRole);
            fetchModules();
        } catch (error) {
            console.error("Error loading session data:", error);
            setUserPermissions([]);
            setUserRole("User");
        }
    }, []);

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
    const displayedModules = userRole === "Super Admin"
        ? modules
        : modules.filter(module => userPermissions.includes(module.name));

    return (
        <div className="container mx-auto px-6 py-6">
            <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

            {/* Grid Layout for Modules */}
            <div className="grid grid-cols-3 gap-6">
                {displayedModules.map((module) => (
                    <div key={module.name} className={`${moduleColors[module.name] || "bg-gray-500"} p-6 text-white rounded-lg shadow-md`}>
                        <h2 className="text-xl font-semibold">{module.name}</h2>
                        <button
                            className="mt-4 bg-white text-black px-4 py-2 rounded shadow"
                            onClick={() => navigate(module.url)}
                        >
                            Open {module.name}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Dashboard;
