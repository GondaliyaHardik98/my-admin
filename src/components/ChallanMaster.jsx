import React, { useState, useEffect } from "react";
import axios from "axios";

export default function ChallanMaster() {
  const [errorMessage, setErrorMessage] = useState("");
  const [customerId, setCustomerID] = useState("");
  const [challanData, setChallanData] = useState([]);
  const [SelectedChallanId, setSelectedChallanId] = useState(null);
  const [employeeData, setEmployeeData] = useState([]);
  const [customerData, setDataCustomer] = useState([]);
  const [productData, setProductData] = useState([]);
  const [formData, setFormData] = useState([
    {
      challanId: "",
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
    } catch (error) {
      console.error("Error fetching products:", error);
      setErrorMessage("Failed to fetch challan data");
    }
  };

  const populateData = async () => {
    try {
      const [customerRes, productRes, employeeRes] = await Promise.all([
        axios.get("http://localhost:3002/api/challanCustomer"),
        axios.get("http://localhost:3002/api/challanProduct"),
        axios.get("http://localhost:3002/api/challanEmployee"),
      ]);

      setDataCustomer(customerRes.data.data);
      setProductData(productRes.data.data);
      setEmployeeData(employeeRes.data.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      setErrorMessage("Failed to fetch master data");
    }
  };

  const handleCustomerIDChange = (e) => {
    const newCustomerId = e.target.value;
    setCustomerID(newCustomerId);

    setFormData((prevData) =>
      prevData.map((item) => ({
        ...item,
        customerId: newCustomerId,
      }))
    );
  };

  const handleInputChange = (index, field, value) => {
    setFormData((prevData) => {
      const newData = [...prevData];
      newData[index] = {
        ...newData[index],
        [field]: value,
      };
      return newData;
    });
  };

  const addProductRow = () => {
    setFormData((prevData) => [
      ...prevData,
      {
        challanId: "",
        customerId: customerId, // Use the currently selected customer
        productId: "",
        engineerId: "",
        challanPrice: "",
        challanDate: "",
        challanRemark: "",
      },
    ]);
  };

  const clearRecord = () => {
    setFormData([
      {
        challanId: "",
        customerId: "",
        productId: "",
        engineerId: "",
        challanPrice: "",
        challanDate: "",
        challanRemark: "",
      },
    ]);
    setCustomerID("");
    setSelectedChallanId(null);
    setErrorMessage("");
  };

  const handleEdit = async (challan) => {
    try {
      setSelectedChallanId(challan.challanId);
      setCustomerID(challan.customerId);

      // Fetch all challans for this customer
      const response = await axios.get(
        `http://localhost:3002/api/challan/${challan.customerId}`
      );

      if (response.data.success && Array.isArray(response.data.data)) {
        const formattedData = response.data.data.map((item) => ({
          challanId: item.challanId, // Important: Keep the challanId for updates
          customerId: item.customerId,
          productId: item.productId,
          engineerId: item.engineerId,
          challanPrice: item.challanPrice,
          challanDate: formatDate(item.challanDate),
          challanRemark: item.challanRemark,
        }));

        setFormData(formattedData);
      }
    } catch (error) {
      console.error("Error fetching records:", error);
      setErrorMessage("Failed to fetch challan details");
    }
  };

  const saveRecord = async (e) => {
    e.preventDefault();

    try {
      if (!customerId) {
        setErrorMessage("Please select a customer");
        return;
      }

      const isValid = formData.every(
        (item) => item.productId && item.engineerId && item.challanPrice
      );

      if (!isValid) {
        setErrorMessage("Please fill in all required fields for each entry");
        return;
      }

      // If we're updating (SelectedChallanId exists)
      if (SelectedChallanId) {
        const response = await axios.put(
          `http://localhost:3002/api/challan/${customerId}`, // Changed to use customerId
          formData.map((item) => ({
            ...item,
            customerId: customerId,
          }))
        );

        if (response.data.success) {
          await fetchChallan();
          clearRecord();
        }
      } else {
        // Handle new challan creation
        const response = await axios.post(
          "http://localhost:3002/api/challan",
          formData.map((item) => ({
            ...item,
            customerId: customerId,
          }))
        );

        if (response.data.success) {
          await fetchChallan();
          clearRecord();
        }
      }
    } catch (error) {
      console.error("Error saving challan:", error);
      setErrorMessage(error.message || "Failed to save challan");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  const handleDeleteProduct = async (challanId) => {
    if (!window.confirm("Are you sure you want to delete this record?")) {
      return;
    }

    try {
      const response = await axios.delete(
        `http://localhost:3002/api/challan/${challanId}`
      );

      if (response.data.success) {
        await fetchChallan();
        alert("Record deleted successfully.");
      } else {
        throw new Error("Failed to delete record");
      }
    } catch (error) {
      console.error("Error deleting record:", error);
      alert(error.message || "An error occurred while deleting");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Challan Master</h2>

      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {errorMessage}
        </div>
      )}

      <form onSubmit={saveRecord} className="space-y-4">
        <div className="mb-4">
          <label className="block font-medium">Customer</label>
          <select
            value={customerId}
            onChange={handleCustomerIDChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
            required
          >
            <option value="">Select customer</option>
            {customerData.map((customer) => (
              <option key={customer.customerId} value={customer.customerId}>
                {customer.name}
              </option>
            ))}
          </select>
        </div>

        {formData.map((item, index) => (
          <div
            key={index}
            className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end mb-4"
          >
            <div>
              <label className="block font-medium">Product</label>
              <select
                value={item.productId}
                onChange={(e) =>
                  handleInputChange(index, "productId", e.target.value)
                }
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              >
                <option value="">Select product</option>
                {productData.map((prod) => (
                  <option key={prod.productId} value={prod.productId}>
                    {prod.productName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium">Engineer</label>
              <select
                value={item.engineerId}
                onChange={(e) =>
                  handleInputChange(index, "engineerId", e.target.value)
                }
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              >
                <option value="">Select engineer</option>
                {employeeData.map((emp) => (
                  <option key={emp.engineerId} value={emp.engineerId}>
                    {emp.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium">Price</label>
              <input
                type="number"
                value={item.challanPrice}
                onChange={(e) =>
                  handleInputChange(index, "challanPrice", e.target.value)
                }
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
                placeholder="Enter Price"
              />
            </div>

            <div>
              <label className="block font-medium">Date</label>
              <input
                type="date"
                value={item.challanDate}
                onChange={(e) =>
                  handleInputChange(index, "challanDate", e.target.value)
                }
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block font-medium">Remark</label>
              <input
                type="text"
                value={item.challanRemark}
                onChange={(e) =>
                  handleInputChange(index, "challanRemark", e.target.value)
                }
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="Enter Remark"
              />
            </div>

            {index === formData.length - 1 && (
              <button
                type="button"
                onClick={addProductRow}
                className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
              >
                +
              </button>
            )}
          </div>
        ))}

        <div className="flex gap-4">
          <button
            type="submit"
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 flex-1"
          >
            {SelectedChallanId ? "Update" : "Submit"}
          </button>
          <button
            type="button"
            onClick={clearRecord}
            className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
          >
            Clear
          </button>
        </div>
      </form>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Challan List</h2>
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border-b">ID</th>
                <th className="py-2 px-4 border-b">Customer</th>
                <th className="py-2 px-4 border-b">Product</th>
                <th className="py-2 px-4 border-b">Engineer</th>
                <th className="py-2 px-4 border-b">Price</th>
                <th className="py-2 px-4 border-b">Date</th>
                <th className="py-2 px-4 border-b">Remark</th>
                <th className="py-2 px-4 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {challanData.map((challan) => (
                <tr key={challan.challanId} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">{challan.challanId}</td>
                  <td className="py-2 px-4 border-b">{challan.customarName}</td>
                  <td className="py-2 px-4 border-b">{challan.productName}</td>
                  <td className="py-2 px-4 border-b">{challan.engineerName}</td>
                  <td className="py-2 px-4 border-b">{challan.challanPrice}</td>
                  <td className="py-2 px-4 border-b">
                    {formatDate(challan.challanDate)}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {challan.challanRemark}
                  </td>
                  <td className="py-2 px-4 border-b">
                    <button
                      onClick={() => handleEdit(challan)}
                      className="text-blue-500 hover:text-blue-700 mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(challan.challanId)}
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
    </div>
  );
}
