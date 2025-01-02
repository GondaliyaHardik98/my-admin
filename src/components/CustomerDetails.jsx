import React, { useState, useEffect } from "react";
import axios from "axios";
import { AlertCircle, CheckCircle2 } from "lucide-react";

const CustomerDetails = () => {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [response, setResponse] = useState(null);
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
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/customer`
      ); // Replace with your actual API URL
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
      setResponse(null);

      const _saveData = {
        name: formData.name,
        gstNo: formData.gstNo,
        mobileNo: formData.mobileNo,
        address: formData.address,
        remark: formData.remark,
      };

      const url = selectedCustomerId
        ? `${process.env.REACT_APP_API_URL}/customer/${selectedCustomerId}`
        : `${process.env.REACT_APP_API_URL}/customer`;
      const method = selectedCustomerId ? "PUT" : "POST";

      console.log(selectedCustomerId, "checkid");
      console.log("Method: ", method);
      console.log("URL: ", url);
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(_saveData),
      });

      const data = await response.json();
      console.log(_saveData, "saveData");

      setResponse({
        success: data.success,
        message: data.message,
      });

      if (data.success) {
        clearRecord();
        fetchCustomers();
      }
    } catch (error) {
      setResponse({
        success: false,
        message: "Error submitting form. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };
  const handleCustomer = async (customer) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      try {
        const id = customer.customerId;
        console.log(id, "delete id");
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/customer/${id}`,
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
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Customer Management</h2>

      {/* Form */}
      <form className="space-y-4">
        <div>
          <input
            type="text"
            name="id"
            value={formData.id}
            onChange={handleChange}
            hidden
          />
        </div>

        {/* Name and GST No Row */}
        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className="block font-medium">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block font-medium">GST No</label>
            <input
              type="text"
              name="gstNo"
              value={formData.gstNo}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
          {/* Mobile No Field */}
          <div>
            <label className="block font-medium">Mobile No</label>
            <input
              type="number"
              name="mobileNo"
              value={formData.mobileNo}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
        </div>

        {/* Address and Remark Row */}
        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className="block font-medium">Address</label>
            <textarea
              rows={2}
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block font-medium">Remark</label>
            <textarea
              rows={2}
              type="text"
              name="remark"
              value={formData.remark}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
        </div>

        {/* Save and Clear Buttons */}
        <div className="flex justify-center space-x-4 mt-4">
          <button
            type="submit"
            onClick={addCustomer}
            className="w-36 bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
          >
            Save
          </button>
          <button
            type="button"
            onClick={clearCustomer}
            className="w-32 bg-gray-400 text-white px-6 py-2 rounded hover:bg-gray-500"
          >
            Clear
          </button>
        </div>
      </form>
      {response && (
        <div
          className={`mt-4 p-4 rounded-lg flex items-center space-x-2 ${
            response.success
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {response.success ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span>{response.message}</span>
        </div>
      )}

      {/* Table */}
      <div className="container mx-auto mt-8 p-4">
        <h2 className="text-xl font-semibold mb-4">Customer List</h2>
        <table className="w-full border border-gray-300 text-left">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">ID</th>
              <th className="py-2 px-4 border-b">Name</th>
              <th className="py-2 px-4 border-b">GST No</th>
              <th className="py-2 px-4 border-b">Mobile No</th>
              <th className="py-2 px-4 border-b">Address</th>
              <th className="py-2 px-4 border-b">Remark</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer, index) => (
              <tr key={index} className="border-b">
                <td className="py-2 px-4">{index + 1}</td>
                <td className="py-2 px-4">{customer.name}</td>
                <td className="py-2 px-4">{customer.gstNo}</td>
                <td className="py-2 px-4">{customer.mobileNo}</td>
                <td className="py-2 px-4">{customer.address}</td>
                <td className="py-2 px-4">{customer.remark}</td>

                <td className="py-2 px-4 border-b">
                  <button
                    onClick={() => handleEdit(customer)}
                    className="text-blue-500 hover:text-blue-700 mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleCustomer(customer)}
                    className="text-red-500 hover:text-red-700"
                  >
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
