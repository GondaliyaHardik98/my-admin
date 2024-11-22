import axios from "axios";
import React, { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Upload } from "lucide-react";

function ProductMaster() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [response, setResponse] = useState(null);
  const [productData, setProductData] = useState([]);
  const [SelectedProductId, setSelectedproductId] = useState(null);
  const [products, setProducts] = useState([]); // State to store products
  const [selectedProduct, setSelectedProduct] = useState("");
  const [formData, setFormData] = useState({
    productId: 0,
    productCode: "",
    vendorId: "",
    productName: "",
    productDesription: "",
    productPrice: 0,
    productQuantity: 0,
    productRemark: "",
  });

  // Fetch products from the API when component mounts
  useEffect(() => {
    fetchVendor();
    fetchProducts();
  }, []);

  const fetchVendor = async () => {
    try {
      const response = await axios.get("http://localhost:3002/api/product"); // Replace with your API URL
      //const data = await response.json();
      setProducts(response.data.data);
      console.log(response.data.data, "data");
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };
  const fetchProducts = async () => {
    try {
      const getAllData = await axios.get(
        "http://localhost:3002/api/productAll"
      );
      setProductData(getAllData.data.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };
  const handleProductChange = (e) => {
    setFormData({
      ...formData,
      vendorId: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    SaveRecord();
  };

  const SaveRecord = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const _saveData = {
        productCode: formData.productCode,
        vendorId: formData.vendorId,
        productName: formData.productName,
        productDesription: formData.productDesription,
        productQuantity: formData.productQuantity,
        productPrice: formData.productPrice,
        productRemark: formData.productRemark,
      };
      console.log(_saveData, "SaveData");
      const url = SelectedProductId
        ? `http://localhost:3002/api/product/${SelectedProductId}`
        : "http://localhost:3002/api/product";
      const method = SelectedProductId ? "PUT" : "POST";

      console.log(SelectedProductId, "SelectedProductId");
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

      // setSuccess(true);
      fetchProducts();
      clearRecord();
    } catch (error) {
      setError(error.message);
      console.error("Error creating employee:", error);
    } finally {
      setLoading(false);
    }
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleEdit = (product) => {
    setSelectedproductId(product.productId); // Set the selected vendor's ID
    setFormData({
      productCode: product.productCode,
      vendorId: product.vendorId,
      productName: product.productName,
      productDesription: product.productDesription,
      productPrice: product.productPrice,
      productQuantity: product.productQuantity,
      productRemark: product.productRemark,
    });
  };
  const handleDeleteProduct = async (productId) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      try {
        console.log(productId, "delete id");
        const response = await fetch(
          `http://localhost:3002/api/product/${productId}`,
          {
            method: "DELETE",
          }
        );
        const result = await response.json();

        if (result.success) {
          fetchProducts();
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
  const clearProduct = (e) => {
    clearRecord();
  };
  const clearRecord = () => {
    setFormData({
      productId: 0,
      productCode: "",
      vendorId: "",
      productName: "",
      productDesription: "",
      productPrice: 0,
      productQuantity: 0,
      productRemark: "",
    });
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Create New Product</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Inline Fields for Product Code, Vendor, Product Name */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Product Code */}
          <div>
            <label className="block font-medium">
              Product Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="productCode"
              value={formData.productCode}
              onChange={handleInputChange}
              required
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>

          {/* Vendor */}
          <div>
            <label className="block text-sm font-medium mb-1">Vendor</label>
            <select
              value={formData.vendorId}
              onChange={handleProductChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            >
              <option value="">Select Product</option>
              {products.map((product) => (
                <option key={product.vendorId} value={product.vendorId}>
                  {product.vendorName}{" "}
                  {/* Adjust field names according to your API response */}
                </option>
              ))}
            </select>
          </div>

          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Product Name
            </label>
            <input
              type="text"
              name="productName"
              value={formData.productName}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
          {/* Price */}
          <div>
            <label className="block text-sm font-medium mb-1">Price</label>
            <input
              type="number"
              name="productPrice"
              value={formData.productPrice}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium mb-1">Quantity</label>
            <input
              type="number"
              name="productQuantity"
              value={formData.productQuantity}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
        </div>

        {/* Additional Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              rows={2}
              type="text"
              name="productDesription"
              value={formData.productDesription}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>

          {/* Remark */}
          <div>
            <label className="block text-sm font-medium mb-1">Remark</label>
            <textarea
              rows={2}
              type="text"
              name="productRemark"
              value={formData.productRemark}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-center gap-4 space-x-4 mt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-52 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Creating..." : "Create Product"}
          </button>
          <button
            type="button"
            onClick={clearProduct}
            className="w-32 bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition-colors"
          >
            Clear
          </button>
        </div>
      </form>

      {/* Response Message */}
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

      {/* Product List Table */}
      <div className="container mx-auto mt-8 p-4 overflow-x-auto">
        <h2 className="text-xl font-semibold mb-4">Product List</h2>
        <table className="w-full border border-gray-300 text-left">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">ID</th>
              <th className="py-2 px-4 border-b">Product Code</th>
              <th className="py-2 px-4 border-b">Vendor</th>
              <th className="py-2 px-4 border-b">Product Name</th>
              <th className="py-2 px-4 border-b">Description</th>
              <th className="py-2 px-4 border-b">Price</th>
              <th className="py-2 px-4 border-b">Quantity</th>
              <th className="py-2 px-4 border-b">Remark</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {productData.map((product, index) => (
              <tr key={index} className="border-b">
                <td className="py-2 px-4">{product.productId}</td>
                <td className="py-2 px-4">{product.productCode}</td>
                <td className="py-2 px-4">{product.vendorName}</td>
                <td className="py-2 px-4">{product.productName}</td>
                <td className="py-2 px-4">{product.productDesription}</td>
                <td className="py-2 px-4">{product.productPrice}</td>
                <td className="py-2 px-4">{product.productQuantity}</td>
                <td className="py-2 px-4">{product.productRemark}</td>
                <td className="py-2 px-4">
                  <button onClick={() => handleEdit(product)}>Edit</button>
                </td>
                <td>
                  <button
                    onClick={() => handleDeleteProduct(product.productId)}
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
}

export default ProductMaster;
