import React, { useState, useEffect } from "react";
import axios from "axios";

const CustomerDetails = () => {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    id: 0,
    name: "",
    gstNo: "",
    mobileNo: "",
    address: "",
    remark: "",
  });
  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleEdit = (customer) => {
    setSelectedCustomerId(customer.customerId); // Set the selected customer's ID
    setFormData({
      name: customer.name,
      gstNo: customer.gstNo,
      mobileNo: customer.mobileNo,
      address: customer.address,
      remark: customer.remark,
    });
  };
  const fetchCustomers = async () => {
    try {
      const response = await axios.get("http://localhost:3002/api/customer"); // Replace with your actual API URL
      setCustomers(response.data.data);
    } catch (error) {
      console.error("Error fetching customer data:", error);
    }
  };

  const addCustomer = (e) => {
    e.preventDefault();
    saveRecord();
  };
  const clearCustomer = (e) => {
    clearRecord();
  };

  const clearRecord = () => {
    setFormData({
      name: "",
      gstNo: "",
      mobileNo: "",
      address: "",
      remark: "",
    });
  };

  const saveRecord = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const _saveData = {
        name: formData.name,
        gstNo: formData.gstNo,
        mobileNo: formData.mobileNo,
        address: formData.address,
        remark: formData.remark,
      };

      const url = selectedCustomerId
        ? `http://localhost:3002/api/customer/${selectedCustomerId}`
        : "http://localhost:3002/api/customer";
      const method = selectedCustomerId ? "PUT" : "POST";

      console.log(selectedCustomerId, "checkid");
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(_saveData),
      });

      const data = await response.json();
      console.log(_saveData, "saveData");

      if (!response.ok) {
        throw new Error(data.message || "Failed to create employee");
      }

      setSuccess(true);
      clearRecord();
      fetchCustomers();
    } catch (error) {
      setError(error.message);
      console.error("Error creating employee:", error);
    } finally {
      setLoading(false);
    }
  };
  const handleCustomer = async (id) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      try {
        console.log(id, "delete id");
        const response = await fetch(
          `http://localhost:3002/api/customer/${id}`,
          {
            method: "DELETE",
          }
        );
        const result = await response.json();

        if (result.success) {
          // Remove the deleted customer from the state
          //setCustomers(customers.filter((customer) => customer.id !== id));
          fetchCustomers();
          alert("Record deleted successfully.");
        } else {
          alert("Failed to delete record.");
        }
      } catch (error) {
        console.error("Error deleting record:", error);
        alert("An error occurred.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-5">
      <h1 className="text-2xl font-bold mb-5">Customer Management</h1>

      {/* Form */}
      <form className="bg-white p-6 rounded-lg shadow-md w-full max-w-md mb-8">
        <div>
          <input
            type="text"
            name="id"
            value={formData.id}
            onChange={handleChange}
            hidden
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700">Name:</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="mt-1 p-2 w-full border border-gray-300 rounded"
            />
          </div>
          <div>
            <label className="block text-gray-700">GST No:</label>
            <input
              type="text"
              name="gstNo"
              value={formData.gstNo}
              onChange={handleChange}
              className="mt-1 p-2 w-full border border-gray-300 rounded"
            />
          </div>
          <div>
            <label className="block text-gray-700">Mobile No:</label>
            <input
              type="text"
              name="mobileNo"
              value={formData.mobileNo}
              onChange={handleChange}
              className="mt-1 p-2 w-full border border-gray-300 rounded"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-gray-700">Address:</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="mt-1 p-2 w-full border border-gray-300 rounded"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-gray-700">Remark:</label>
            <input
              type="text"
              name="remark"
              value={formData.remark}
              onChange={handleChange}
              className="mt-1 p-2 w-full border border-gray-300 rounded"
            />
          </div>
        </div>
        <div>
          <button
            type="submit"
            onClick={addCustomer}
            className="mt-4 w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          >
            Save
          </button>
          <button
            type="submit"
            onClick={clearCustomer}
            className="mt-4 w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          >
            Clear
          </button>
        </div>
      </form>

      {/* Table */}
      <div className="w-full max-w-4xl bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Customer List</h2>
        <table className="min-w-full border-collapse text-center">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">ID</th>
              <th className="py-2 px-4 border-b">Name</th>
              <th className="py-2 px-4 border-b">GST No</th>
              <th className="py-2 px-4 border-b">Mobile No</th>
              <th className="py-2 px-4 border-b">Address</th>
              <th className="py-2 px-4 border-b">Remark</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer, index) => (
              <tr key={index} className="border-b">
                <td className="py-2 px-4">{customer.customerId}</td>
                <td className="py-2 px-4">{customer.name}</td>
                <td className="py-2 px-4">{customer.gstNo}</td>
                <td className="py-2 px-4">{customer.mobileNo}</td>
                <td className="py-2 px-4">{customer.address}</td>
                <td className="py-2 px-4">{customer.remark}</td>
                <td className="py-2 px-4">
                  <button onClick={() => handleEdit(customer)}>Edit</button>
                </td>
                <td className="py-2 px-4">
                  <button onClick={() => handleCustomer(customer.customerId)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CustomerDetails;
