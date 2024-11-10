import React, { useState, useEffect } from "react";
import axios from "axios";

export default function ChallanMaster() {
  const [errorMessage, setErrorMessage] = useState("");
  const [customerId, setCustomerID] = useState("");
  const [challanData, setChallanData] = useState("");
  const [SelectedChallanId, setSelectedChallanId] = useState(null);
  const [employeeData, setEmployeeData] = useState([]);
  const [customerData, setDataCustomer] = useState([]);
  const [productData, setProductData] = useState([]);
  const [formData, setFormData] = useState([
    {
      challanId: 0,
      customerId: "",
      productId: "",
      engineerId: "",
      challanPrice: "",
      challanDate: "",
      challanRemark: "",
    },
  ]);

  useEffect(() => {
    populateData();
    fetchChallan();
  }, []);

  const fetchChallan = async () => {
    try {
      const getAllData = await axios.get("http://localhost:3002/api/challan");
      setChallanData(getAllData.data.data);
      console.log(getAllData.data.data, "getAllData");
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const populateData = async () => {
    try {
      const customerData = await axios.get(
        "http://localhost:3002/api/challanCustomer"
      );
      setDataCustomer(customerData.data.data);
      console.log(customerData.data.data, "customerData");

      const productData = await axios.get(
        "http://localhost:3002/api/challanProduct"
      );
      setProductData(productData.data.data);
      console.log(productData.data.data, "productData");

      const employeeData = await axios.get(
        "http://localhost:3002/api/challanEmployee"
      );
      setEmployeeData(employeeData.data.data);
      console.log(employeeData.data.data, "employeeData");
    } catch (error) {
      console.error("Error fetching", error);
    }
  };

  const handleCustomerIDChange = (e) => {
    setCustomerID(e.target.value); // Update customerID state
    console.log(customerId);
  };
  const handleInputChange = (index, e) => {
    const { name, value } = e.target;
    const updatedProducts = [...formData];
    updatedProducts[index][name] = value;
    setFormData(updatedProducts);
  };

  const addProductRow = () => {
    setFormData([
      ...formData,
      {
        customerId: "",
        productId: "",
        engineerId: "",
        challanPrice: "",
        challanDate: "",
        challanRemark: "",
      },
    ]);
  };
  const addChallan = (e) => {
    e.preventDefault();
    saveRecord();
  };

  const saveRecord = async () => {
    try {
      const _saveData = formData.map((item) => ({
        customerId: customerId, // Parent record - assuming the first row holds CustomerID
        productId: item.productId,
        engineerId: item.engineerId,
        challanPrice: item.challanPrice,
        challanDate: item.challanDate,
        challanRemark: item.challanRemark,
      }));

      console.log(_saveData, "Save Data");

      const url = SelectedChallanId
        ? `http://localhost:3002/api/challan/${SelectedChallanId}`
        : "http://localhost:3002/api/challan";
      const method = SelectedChallanId ? "PUT" : "POST";
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
        throw new Error(data.message || "Failed to create challan");
      }

      // setSuccess(true);
      // fetchProducts();
      // clearRecord();
    } catch (error) {
      console.error("Error creating challan:", error);
    }
  };

  const handleEdit = (challan) => {
    setSelectedChallanId(challan.challanId); // Set the selected vendor's ID
    setFormData({
      customerId: challan.customerId,
      productId: challan.productId,
      engineerId: challan.engineerId,
      challanPrice: challan.challanPrice,
      challanDate: challan.challanDate,
      challanRemark: challan.challanRemark,
    });
  };
  const handleDeleteProduct = async (challanId) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      try {
        console.log(challanId, "delete id");
        const response = await fetch(
          `http://localhost:3002/api/product/${challanId}`,
          {
            method: "DELETE",
          }
        );
        const result = await response.json();

        if (result.success) {
          // fetchProducts();
          // clearRecord();
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
      <h2 className="text-2xl font-bold mb-6">Challan Master</h2>

      <form className="space-y-4">
        {/* Customer ID */}
        <div className="mb-4">
          <label className="block font-medium">Customer ID</label>
          <select
            name="customerId"
            value={formData.customerId}
            onChange={handleCustomerIDChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
            required
          >
            <option value="">Select customer</option>
            {customerData.map((customer) => (
              <option key={customer.customerId} value={customer.customerId}>
                {" "}
                {customer.name}
              </option>
            ))}
          </select>
        </div>

        {/* Product Rows */}
        {formData.map((product, index) => (
          <div
            key={index}
            className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end mb-4"
          >
            {/* Product ID */}
            <div>
              <label className="block font-medium">Product ID</label>
              <select
                name="productId"
                value={product.productId}
                onChange={(e) => handleInputChange(index, e)}
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              >
                <option value="">Select product</option>
                {productData.map((pro) => (
                  <option key={pro.productId} value={pro.productId}>
                    {pro.productName}
                  </option>
                ))}
              </select>
            </div>

            {/* Engineer ID */}
            <div>
              <label className="block font-medium">Engineer ID</label>
              <select
                name="engineerId"
                value={product.engineerId}
                onChange={(e) => handleInputChange(index, e)}
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              >
                <option value="">Select employee</option>
                {employeeData.map((empData) => (
                  <option key={empData.engineerId} value={empData.engineerId}>
                    {empData.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Price */}
            <div>
              <label className="block font-medium">Price</label>
              <input
                type="number"
                name="challanPrice"
                value={product.challanPrice}
                onChange={(e) => handleInputChange(index, e)}
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="Enter Price"
              />
            </div>

            {/* Date */}
            <div>
              <label className="block font-medium">Date</label>
              <input
                type="date"
                name="challanDate"
                value={product.challanDate}
                onChange={(e) => handleInputChange(index, e)}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>

            {/* Remark */}
            <div>
              <label className="block font-medium">Remark</label>
              <input
                type="text"
                name="challanRemark"
                value={product.challanRemark}
                onChange={(e) => handleInputChange(index, e)}
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="Enter Remark"
              />
            </div>

            {/* Add Button */}
            {index === formData.length - 1 && (
              <button
                type="button"
                onClick={addProductRow}
                className="bg-green-500 text-white py-2 px-4 rounded"
              >
                +
              </button>
            )}
          </div>
        ))}

        {/* Submit Button */}
        <button
          type="submit"
          onClick={addChallan}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        >
          Submit
        </button>
      </form>
      <div className="container mx-auto mt-8 p-4 overflow-x-auto">
        <h2 className="text-xl font-semibold mb-4">Product List</h2>
        <table className="w-full border border-gray-300 text-left">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">ID</th>
              <th className="py-2 px-4 border-b">Customer</th>
              <th className="py-2 px-4 border-b">produc</th>
              <th className="py-2 px-4 border-b">Engineer</th>
              <th className="py-2 px-4 border-b">Price</th>
              <th className="py-2 px-4 border-b">Date</th>
              <th className="py-2 px-4 border-b">Remark</th>
            </tr>
          </thead>
          {/* <tbody>
            {challanData.map((challan, index) => (
              <tr key={index} className="border-b">
                <td className="py-2 px-4">{challan.challanId}</td>
                <td className="py-2 px-4">{challan.customerId}</td>
                <td className="py-2 px-4">{challan.productId}</td>
                <td className="py-2 px-4">{challan.engineerId}</td>
                <td className="py-2 px-4">{challan.challanPrice}</td>
                <td className="py-2 px-4">{challan.challanDate}</td>
                <td className="py-2 px-4">{challan.challanRemark}</td>
                <td className="py-2 px-4">
                  <button onClick={() => handleEdit(challan)}>Edit</button>
                </td>
                <td>
                  <button
                    onClick={() => handleDeleteProduct(challan.challanId)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody> */}
        </table>
      </div>
    </div>
  );
}
