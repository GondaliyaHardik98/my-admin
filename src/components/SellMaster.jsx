import React, { useState, useEffect } from "react";
import axios from "axios";

const SellMaster = () => {
  const [sellData, setSellData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [SelectedSellId, setSelectedSellId] = useState(null);
  const [customerData, setDataCustomer] = useState([]);
  const [productData, setProductData] = useState([]);
  const [formData, setFormData] = useState({
    sellId: 0,
    productId: "",
    customerId: "",
    sellDate: "",
    sellPrice: "",
    sellQuantity: "",
    sellRemark: "",
  });

  useEffect(() => {
    populateData();
    fetchSell();
  }, []);
  const fetchSell = async () => {
    try {
      const getAllData = await axios.get("http://localhost:3002/api/sell");
      setSellData(getAllData.data.data);
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
    } catch (error) {
      console.error("Error fetching", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  const clearRecord = () => {
    setFormData({
      productId: "",
      customerId: "",
      sellDate: "",
      sellPrice: "",
      sellQuantity: "",
      sellRemark: "",
    });
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    SaveRecord();
  };
  const handleEdit = (entry) => {
    setSelectedSellId(entry.sellId); // Set the selected vendor's ID
    const formatDate = (dateString) => {
      if (!dateString) return "";
      const date = new Date(dateString);
      return date.toISOString().split("T")[0];
    };
    setFormData({
      productId: entry.productId,
      customerId: entry.customerId,
      sellDate: formatDate(entry.sellDate),
      sellPrice: entry.sellPrice,
      sellQuantity: entry.sellQuantity,
      sellRemark: entry.sellRemark,
    });
  };
  const handleDeleteSell = async (id) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      try {
        console.log(id, "delete id");
        const response = await fetch(`http://localhost:3002/api/sell/${id}`, {
          method: "DELETE",
        });
        const result = await response.json();

        if (result.success) {
          fetchSell();
          clearRecord();
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
  const SaveRecord = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const _saveData = {
        productId: formData.productId,
        customerId: formData.customerId,
        sellDate: formData.sellDate,
        sellPrice: formData.sellPrice,
        sellQuantity: formData.sellQuantity,
        sellRemark: formData.sellRemark,
      };
      console.log(_saveData, "SaveData");
      const url = SelectedSellId
        ? `http://localhost:3002/api/sell/${SelectedSellId}`
        : "http://localhost:3002/api/sell";
      const method = SelectedSellId ? "PUT" : "POST";

      console.log(SelectedSellId, "SelectedProductId");
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
        throw new Error(data.message || "Failed to create sell");
      }

      // setSuccess(true);
      fetchSell();
      clearRecord();
    } catch (error) {
      setError(error.message);
      console.error("Error creating sell:", error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">SellMaster</h2>
      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Product ID */}
          <div>
            <label className="block text-sm font-medium mb-1">Product ID</label>
            <select
              name="productId"
              value={formData.productId}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            >
              <option value="">Select product</option>
              {productData.map((product) => (
                <option key={product.productId} value={product.productId}>
                  {" "}
                  {product.productName}
                </option>
              ))}
            </select>
          </div>

          {/* Customer ID */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Customer ID
            </label>

            <select
              name="customerId"
              value={formData.customerId}
              onChange={handleInputChange}
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

          {/* Sell Date */}
          <div>
            <label className="block text-sm font-medium mb-1">Sell Date</label>
            <input
              type="date"
              name="sellDate"
              value={formData.sellDate}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Price */}
          <div>
            <label className="block text-sm font-medium mb-1">Price</label>
            <input
              type="number"
              name="sellPrice"
              value={formData.sellPrice}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium mb-1">Quantity</label>
            <input
              type="number"
              name="sellQuantity"
              value={formData.sellQuantity}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>

          {/* Remark */}
          <div>
            <label className="block text-sm font-medium mb-1">Remark</label>
            <input
              type="text"
              name="sellRemark"
              value={formData.sellRemark}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
        </div>

        <button
          type="submit"
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
        >
          Add Sell Entry
        </button>
      </form>

      {/* Responsive Data Table */}
      <div className="container mx-auto mt-8 p-4 overflow-x-auto">
        <table className="w-full border border-gray-300 text-left">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b">ID</th>
              <th className="py-2 px-4 border-b">Product</th>
              <th className="py-2 px-4 border-b">Customer</th>
              <th className="py-2 px-4 border-b">Sell Date</th>
              <th className="py-2 px-4 border-b">Price</th>
              <th className="py-2 px-4 border-b">Quantity</th>
              <th className="py-2 px-4 border-b">Remark</th>
            </tr>
          </thead>
          <tbody>
            {sellData.map((entry, index) => (
              <tr key={index} className="border-b">
                <td className="py-2 px-4">{index + 1}</td>
                <td className="py-2 px-4">{entry.productName}</td>
                <td className="py-2 px-4">{entry.customerName}</td>
                <td className="py-2 px-4">{entry.sellDate}</td>
                <td className="py-2 px-4">{entry.sellPrice}</td>
                <td className="py-2 px-4">{entry.sellQuantity}</td>
                <td className="py-2 px-4">{entry.sellRemark}</td>
                <td className="py-2 px-4">
                  <button onClick={() => handleEdit(entry)}>Edit</button>
                </td>
                <td>
                  <button onClick={() => handleDeleteSell(entry.sellId)}>
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

export default SellMaster;
