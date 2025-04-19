import axios from "axios";
import React, { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";

function ProductMachineMaster() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [response, setResponse] = useState(null);
  const [productMachineData, setProductData] = useState([]);
  const [SelectedProductId, setSelectedproductId] = useState(null);
  const [vendors, setVendors] = useState([]); // State to store products
  const [formData, setFormData] = useState({
    productId: 0,
    productMachineCode: "",
    vendorId: "",
    productName: "",
    productDesription: "",
    productPrice: "",
    productQuantity: "",
    productRemark: "",
    categoryId: ""

  });

  const [categories, setCategories] = useState([]);


  // Fetch products from the API when component mounts
  useEffect(() => {
    fetchVendor();
    fetchProductCategory();
    fetchProducts();
  }, []);

  const fetchProductCategory = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/productCategory`
      ); // Replace with your API URL
      //const data = await response.json();
      setCategories(response.data.data);
      console.log(response.data.data, "data");
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const fetchVendor = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/productMachine`
      ); // Replace with your API URL
      //const data = await response.json();
      setVendors(response.data.data);
      console.log(response.data.data, "data");
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };
  const fetchProducts = async () => {
    try {
      const getAllData = await axios.get(
        `${process.env.REACT_APP_API_URL}/productMachineAll`
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
        productName: formData.productName,
        vendorId: formData.vendorId,
        categoryId: formData.categoryId
      };
      console.log(_saveData, "SaveData");
      const url = SelectedProductId
        ? `${process.env.REACT_APP_API_URL}/productMachine/${SelectedProductId}`
        : `${process.env.REACT_APP_API_URL}/productMachine`;
      const method = SelectedProductId ? "PUT" : "POST";

      console.log(SelectedProductId, "SelectedProductId");
      console.log("URL: ", url);
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(_saveData),
      });

      const data = await response.json();
      console.log("saveData", _saveData);
      console.log("Response:", data);

      if (!response.ok) {
        alert(data.message);
        throw new Error(data.message || "Failed to create ProductMachine");
      }

      // setSuccess(true);
      fetchProducts();
      alert("Record created successfully.");
      clearRecord();
    } catch (error) {
      setError(error.message);
      alert("Error. " + error.message); 

      console.error("Error creating Prodcut Master:", error);
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
      productName: product.productName,
      vendorId: product.vendorId,
      categoryId: product.categoryId
    });
  };
  const handleDeleteProduct = async (productId) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      try {
        console.log(productId, "delete id");
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/productMachine/${productId}`,
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
      productName: "",
      vendorId: "",
      categoryId: ""
    });
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Create New Machine</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Inline Fields for Product Code, Vendor, Product Name */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Product Code */}
          <div>
            <label className="block font-medium">
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="productName"
              value={formData.productName}
              onChange={handleInputChange}
              required
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
          <div>
          <label>Category</label>
          <select
            value={formData.categoryId}
            onChange={e => setFormData(f => ({ ...f, categoryId: e.target.value }))}
              required
               className="w-full border border-gray-300 rounded px-3 py-2"
          >
            <option value="">Select Category</option>
            {categories.map(cat => (
              <option key={cat.categoryId} value={cat.categoryId}>
                {cat.categoryName}
              </option>
            ))}
          </select>
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
              <option value="">Select Vendor</option>
              {vendors.map((product) => (
                <option key={product.vendorId} value={product.vendorId}>
                  {product.vendorName}{" "}
                  {/* Adjust field names according to your API response */}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-center gap-4 space-x-4 mt-4">
          <button
            type="submit"
            // disabled={loading}
            className="w-36 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
          >
            Save
            {/* {loading ? "Creating..." : "Create Product"} */}
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
              <th className="py-2 px-4 border-b">Product Name</th>
              <th className="py-2 px-4 border-b">Category Name</th>
              <th className="py-2 px-4 border-b">Vendor</th>
              <th className="py-2 px-4 border-b">Action</th>
            </tr>
          </thead>
          <tbody>
            {productMachineData.map((product, index) => (
              <tr key={index} className="border-b">
                <td className="py-2 px-4">{index + 1}</td>
                <td className="py-2 px-4">{product.productName}</td>
                <td className="py-2 px-4">{product.categoryName}</td>
                <td className="py-2 px-4">{product.vendorName}</td>

                <td className="py-2 px-4 border-b">
                  <button
                    onClick={() => handleEdit(product)}
                    className="text-blue-500 hover:text-blue-700 mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product.productId)}
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
}

export default ProductMachineMaster;
