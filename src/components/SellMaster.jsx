import React, { useState } from "react";

const SellMaster = () => {
  const [sellData, setSellData] = useState([]);
  const [productOptions, setProductOptions] = useState([]);
  const [formData, setFormData] = useState({
    productId: "",
    customerId: "",
    sellDate: "",
    price: "",
    quantity: "",
    remark: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSellData([...sellData, formData]);
    setFormData({
      productId: "",
      customerId: "",
      sellDate: "",
      price: "",
      quantity: "",
      remark: "",
    });
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
              <option value="">Select Product</option>
              {productOptions.map((prod) => (
                <option key={prod.ProductID} value={prod.ProductID}>
                  {prod.ProductName}{" "}
                  {/* Adjust field names to match your API response */}
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
              <option value="">Select Customer</option>
              <option value="C1">Customer 1</option>
              <option value="C2">Customer 2</option>
              <option value="C3">Customer 3</option>
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
              name="price"
              value={formData.price}
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
              name="quantity"
              value={formData.quantity}
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
              name="remark"
              value={formData.remark}
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
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b">ID</th>
              <th className="py-2 px-4 border-b">Product ID</th>
              <th className="py-2 px-4 border-b">Customer ID</th>
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
                <td className="py-2 px-4">{entry.productId}</td>
                <td className="py-2 px-4">{entry.customerId}</td>
                <td className="py-2 px-4">{entry.sellDate}</td>
                <td className="py-2 px-4">{entry.price}</td>
                <td className="py-2 px-4">{entry.quantity}</td>
                <td className="py-2 px-4">{entry.remark}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SellMaster;
