import React, { useState, useEffect } from "react";
import axios from "axios";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export default function ChallanMaster() {
  const [errorMessage, setErrorMessage] = useState(null);
  const [customerId, setCustomerID] = useState("");
  const [engineerId, setEngineerID] = useState("");
  const [challanData, setChallanData] = useState([]);
  const [SelectedChallanId, setSelectedChallanId] = useState(null);
  const [employeeData, setEmployeeData] = useState([]);
  const [customerData, setDataCustomer] = useState([]);
  const [productData, setProductData] = useState([]);
  const [response, setResponse] = useState(null);
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
      setErrorMessage({ message: "Failed to fetch challan data" });
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

      setErrorMessage({ message: "Failed to fetch master data" });
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

  const handleEngineerIDChange = (e) => {
    const newEngineerId = e.target.value;
    setEngineerID(newEngineerId);

    setFormData((prevData) =>
      prevData.map((item) => ({
        ...item,
        engineerIdId: newEngineerId,
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

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
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
    setErrorMessage({
      message: "",
    });
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
      setErrorMessage({
        message: "Failed to fetch challan details",
      });
    }
  };

  const saveRecord = async (e) => {
    e.preventDefault();
    setResponse(null);
    try {
      if (!customerId) {
        setErrorMessage({
          message: "Please select a customer",
        });
        return;
      }
      console.log("1");
      const isValid = formData.every(
        (item) => item.productId && item.engineerId && item.challanPrice
      );

      if (!isValid) {
        setErrorMessage({
          message: "Please fill in all required fields for each entry",
        });
        return;
      }
      setErrorMessage(null);
      let response;
      // If we're updating (SelectedChallanId exists)
      if (SelectedChallanId) {
        response = await axios.put(
          `http://localhost:3002/api/challan/${customerId}`, // Changed to use customerId
          formData.map((item) => ({
            ...item,
            customerId: customerId,
          }))
        );
      } else {
        // Handle new challan creation
        response = await axios.post(
          "http://localhost:3002/api/challan",
          formData.map((item) => ({
            ...item,
            customerId: customerId,
          }))
        );
      }

      setResponse({
        success: response.data.success,
        message: response.data.success
          ? "Data saved successfully."
          : "Failed to save data.",
      });

      if (response.data.success) {
        await fetchChallan();
        clearRecord();
        //setErrorMessage("Data save Successfully");
      }
    } catch (error) {
      setResponse({
        success: false,
        message: "Error submitting form. Please try again.",
      });
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

      <form onSubmit={saveRecord} className="space-y-4">
        <div className="grid grid-cols-4 gap-4">
          <div>
            {" "}
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

          <div>
              <label className="block font-medium">Select Engineer</label>
              <select
                value={engineerId}
                onChange={handleCustomerIDChange                }
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
              <label className="block font-medium">Date</label>
              <input
                type="date"
                value={formData.challanDate}
                onChange={handleDateChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block font-medium">Select Payment</label>
              <select
                value={engineerId}
                onChange={handleCustomerIDChange                }
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              >
                <option value="">Select Payment Status</option>
               
                  <option key="0" value="Pending">
                    Pending
                  </option>
                  <option key="1" value="Cash">
                    Cash
                  </option>
               
              </select>
            </div>
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

        <div className="flex justify-center gap-4 space-x-4 mt-4">
          <button
            type="submit"
            className="w-36 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
          >
            {/* {SelectedChallanId ? "Update" : "Submit"} */}
            Save
          </button>
          <button
            type="button"
            onClick={clearRecord}
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

      <div className="container mx-auto mt-8 p-4 overflow-x-auto">
        <h2 className="text-xl font-semibold mb-4">Challan List</h2>
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-300 text-left">
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
              {challanData.map((challan, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">{index + 1}</td>
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
