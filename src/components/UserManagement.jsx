import React, { useState, useEffect } from "react";
import axios from "axios";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    permissions: [],
  });
  const [editingUserId, setEditingUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modules, setModules] = useState([]); // ✅ Store fetched modules




  useEffect(() => {
    fetchUsers();
    fetchModules(); 
  }, []);

  // Fetch users from backend
  const fetchUsers = async () => {
    try {
      const token = sessionStorage.getItem("jwtToken");
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Response:", response);
      const data = await response; // ✅ Ensure response is parsed as JSON

        if (data.data.success) {
            console.log("Fetched users:", data.data);
            setUsers(data.data.data); // ✅ Set users correctly
        } else {
            console.error("Error fetching users:", data.message);
        }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchModules = async () => {
    try {
        const token = sessionStorage.getItem("jwtToken");
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/modules`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.success) {
            setModules(response.data.modules); // ✅ Store modules
        }
    } catch (error) {
        console.error("Error fetching modules:", error);
    }
};


  // Handle input field changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle checkbox selection for permissions
  const handleCheckboxChange = (module) => {
    setFormData((prev) => {
      const permissions = prev.permissions.includes(module)
        ? prev.permissions.filter((perm) => perm !== module)
        : [...prev.permissions, module];

      return { ...prev, permissions };
    });
  };

  // Handle user creation or update
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const token = sessionStorage.getItem("jwtToken");
        const requestData = {
            email: formData.email,
            password: formData.password,
            permissions: formData.permissions, // ✅ Send JSON string
      };
      
      console.log("Request Data:", requestData);

      try {
        
        if (editingUserId) {
          await axios.put(`${process.env.REACT_APP_API_URL}/users/${editingUserId}`, requestData, {
            headers: { Authorization: `Bearer ${token}` },
          });
        } else {
          await axios.post(`${process.env.REACT_APP_API_URL}/users`, requestData, {
            headers: { Authorization: `Bearer ${token}` },
          });
        }
        fetchUsers();
        setFormData({ email: "", password: "", permissions: [] });
        setEditingUserId(null);
      } catch (error) {
        console.error("Error saving user:", error);
      }

        
    } catch (error) {
        console.error("Error saving user:", error);
    }
};
  // Handle editing a user
  const handleEdit = (user) => {
    setFormData({ email: user.email, password: "", permissions: user.permissions });
    setEditingUserId(user.id);
  };

  

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">User Management</h2>
      
      {/* User Form */}
      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <div className="grid grid-cols-3 gap-4">
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Email"
            className="border px-3 py-2 w-full"
            required
            disabled={!!editingUserId} // Prevent email modification on edit
          />
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Password"
            className="border px-3 py-2 w-full"
            required={!editingUserId}
          />
        </div>

        {/* Module Selection */}
        <div className="mt-4">
                    <h3 className="font-bold mb-2">Assign Modules</h3>
                    {modules.map((module) => (
                        <label key={module.id} className="block">
                            <input
                                type="checkbox"
                                checked={formData.permissions.includes(module.name)}
                                onChange={() => handleCheckboxChange(module.name)}
                                className="mr-2"
                            />
                            {module.name}
                        </label>
                    ))}
                </div>

        <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded" disabled={loading}>
          {loading ? "Saving..." : editingUserId ? "Update User" : "Create User"}
        </button>
      </form>

      {/* User List */}
      <h2 className="text-xl font-bold mb-4">Existing Users</h2>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-4 py-2">Email</th>
            <th className="border px-4 py-2">Permissions</th>
            <th className="border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border">
              <td className="border px-4 py-2">{user.email}</td>
              <td className="border px-4 py-2">
                {user.permissions.length > 0 ? user.permissions.join(", ") : "No Permissions"}
              </td>
              <td className="border px-4 py-2">
                <button
                  onClick={() => handleEdit(user)}
                  className="bg-yellow-500 text-white px-4 py-1 rounded mr-2"
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
