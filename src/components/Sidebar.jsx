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

    const grouped = [
  // ... keep your existing items above
  {
    name: "Jangad Management",
    permission: "Jangad Management",
    children: [
      { name: "Party Management",  path: "/party"  },
      { name: "Worker Management", path: "/worker" },
      { name: "Jangad Management", path: "/jangad" },
    ],
  },
];

    return (
        
        <div className="bg-gray-800 text-white w-64 h-screen p-4">
            <h2 className="text-xl font-bold mb-6">CRM ERP</h2>
            <ul>
                {/* {menuItems.map(({ name, path, permission }) => (
                    (!permission || userPermissions.includes(permission)) && (
                        <li key={name} className="mb-4">
                            <button onClick={() => navigate(path)} className="text-white hover:text-gray-400">
                                {name}
                            </button>
                        </li>
                    )
                ))} */}
                
                {grouped.map(group => (
                    console.log("Checking group:", group, "with permissions:", userPermissions) && 
                    userPermissions.includes(group.permission) && (
                    <li key={group.name} className="mb-2">
                        <div className="text-gray-200 font-semibold">{group.name}</div>
                        <ul className="ml-3 mt-1 space-y-1">
                        {group.children.map(c => (
                            <li key={c.name}>
                            <button onClick={() => navigate(c.path)} className="text-white text-sm hover:text-gray-400">
                                {c.name}
                            </button>
                            </li>
                        ))}
                        </ul>
                    </li>
                    )
                ))}
            </ul>
        </div>
    );
};

export default Sidebar;
