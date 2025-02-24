import React from "react";
import { useNavigate } from "react-router-dom";

const Sidebar = ({ userPermissions }) => {
    const navigate = useNavigate();
    
    const menuItems = [
        { name: "Dashboard", path: "/" },
        { name: "Employee Management", path: "/employees", permission: "Employee Management" },
        { name: "Customer Management", path: "/customers", permission: "Customer Management" },
        { name: "Sell Management", path: "/sell", permission: "Sell Management" },
        { name: "AMC/AMC Renewal", path: "/amc", permission: "AMC/AMC Renewal Module" },
        { name: "User Management", path: "/user-management", permission: "User Management" }
    ];

    return (
        <div className="bg-gray-800 text-white w-64 h-screen p-4">
            <h2 className="text-xl font-bold mb-6">CRM ERP</h2>
            <ul>
                {menuItems.map(({ name, path, permission }) => (
                    (!permission || userPermissions.includes(permission)) && (
                        <li key={name} className="mb-4">
                            <button onClick={() => navigate(path)} className="text-white hover:text-gray-400">
                                {name}
                            </button>
                        </li>
                    )
                ))}
            </ul>
        </div>
    );
};

export default Sidebar;
