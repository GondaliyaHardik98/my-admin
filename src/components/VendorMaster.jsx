import { useState, useEffect } from "react";
import { AlertCircle, CheckCircle2, Upload } from "lucide-react";
import axios from "axios";

export default function VendorMaster() {
  const [vendorData, setVendor] = useState([]);
  const [SelectedVendorId, setSelectedVendorId] = useState(null);

  const [formData, setFormData] = useState({
    vendorId: 0,
    vendorName: "",
    vendorGSTNo: "",
    vendorMobileNo: "",
    vendorAddress: "",
    vendorRemark: "",
  });

  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);

  useEffect(() => {
    fetchVendor();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEdit = (vendor) => {
    setSelectedVendorId(vendor.vendorId); // Set the selected vendor's ID
    setFormData({
      vendorName: vendor.vendorName,
      vendorGSTNo: vendor.vendorGSTNo,
      vendorMobileNo: vendor.vendorMobileNo,
      vendorAddress: vendor.vendorAddress,
      vendorRemark: vendor.vendorRemark,
    });
  };
  const handleDeleteEmployee = async (id) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      try {
        console.log(id, "delete id");
        const response = await fetch(`http://localhost:3002/api/vendor/${id}`, {
          method: "DELETE",
        });
        const result = await response.json();

        if (result.success) {
          // Remove the deleted customer from the state
          //setCustomers(customers.filter((customer) => customer.id !== id));
          fetchVendor();
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
  const handleSubmit = async (e) => {
    e.preventDefault();
    SaveRecord();
  };
  const fetchVendor = async () => {
    try {
      const response = await axios.get("http://localhost:3002/api/vendor"); // Replace with your actual API URL
      setVendor(response.data.data);
      console.log(response.data, "vendordata");
    } catch (error) {
      console.error("Error fetching customer data:", error);
    }
  };
  const SaveRecord = async () => {
    setLoading(true);
    setResponse(null);

    try {
      const _saveData = {
        vendorName: formData.vendorName,
        vendorGSTNo: formData.vendorGSTNo,
        vendorMobileNo: formData.vendorMobileNo,
        vendorAddress: formData.vendorAddress,
        vendorRemark: formData.vendorRemark,
      };
      console.log(_saveData, "savdata");
      const isEdit = !!SelectedVendorId;

      const apiUrl = isEdit
        ? `http://localhost:3002/api/vendor/${SelectedVendorId}` // Edit endpoint with ID
        : "http://localhost:3002/api/vendor"; // Create endpoint
      const method = isEdit ? "PUT" : "POST";

      const response = await fetch(apiUrl, {
        method: method,
        //body: _saveData,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(_saveData),
      });

      const data = await response.json();

      setResponse({
        success: data.success,
        message: data.message,
      });

      if (data.success) {
        // Clear form on success
        clearRecord();
        //fetchEmployee();
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

  const clearRecord = () => {
    setFormData({
      vendorName: "",
      vendorGSTNo: "",
      vendorMobileNo: "",
      vendorAddress: "",
      vendorRemark: "",
    });
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Create Vendor</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name Field */}
        <div className="grid grid-cols-5 gap-4">
          <div>
            <label className="block font-medium">
              Vendor Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="vendorName"
              value={formData.vendorName}
              onChange={handleInputChange}
              required
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
          <div>
            {/* Salary Field */}
            <label className="block text-sm font-medium mb-1">GSTNo</label>
            <input
              type="text"
              name="vendorGSTNo"
              value={formData.vendorGSTNo}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
          <div>
            {/* Contact Details */}
            <label className="block text-sm font-medium mb-1">
              Contact Details
            </label>
            <input
              type="number"
              name="vendorMobileNo"
              value={formData.vendorMobileNo}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {/* Emergency Contact 1 */}
          <div>
            <label className="block text-sm font-medium mb-1">Address</label>
            <textarea
              rows={2}
              type="text"
              name="vendorAddress"
              value={formData.vendorAddress}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>

          {/* Emergency Contact 2 */}
          <div>
            <label className="block text-sm font-medium mb-1">Remark</label>
            <textarea
              rows={2}
              type="text"
              name="vendorRemark"
              value={formData.vendorRemark}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
        </div>

        <div className="flex justify-center gap-4 space-x-4 mt-4">
          {/* Submit Button */}
          <button
            type="submit"
            // disabled={loading}
            className="w-36 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
          >
            Save
            {/* {loading ? "Creating..." : "Create Vendor"} */}
          </button>
          {/* Submit Button */}
          <button
            type="submit"
            //disabled={loading}
            className="w-32 bg-gray-400 text-white px-6 py-2 rounded hover:bg-gray-500"
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

      {/* Table */}
      <div className="container mx-auto mt-8 p-4">
        <h2 className="text-xl font-semibold mb-4">Employee List</h2>
        <table className="w-full border border-gray-300 text-left">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">ID</th>
              <th className="py-2 px-4 border-b">Name</th>
              <th className="py-2 px-4 border-b">GST No</th>
              <th className="py-2 px-4 border-b">Mobile No</th>
              <th className="py-2 px-4 border-b">Addtess</th>
              <th className="py-2 px-4 border-b">Remark</th>
            </tr>
          </thead>
          <tbody>
            {vendorData.map((vendor, index) => (
              <tr key={index} className="border-b">
                <td className="py-2 px-4">{vendor.vendorId}</td>
                <td className="py-2 px-4">{vendor.vendorName}</td>
                <td className="py-2 px-4">{vendor.vendorGSTNo}</td>
                <td className="py-2 px-4">{vendor.vendorMobileNo}</td>
                <td className="py-2 px-4">{vendor.vendorAddress}</td>
                <td className="py-2 px-4">{vendor.vendorRemark}</td>
                <td className="py-2 px-4">
                  <button onClick={() => handleEdit(vendor)}>Edit</button>
                </td>
                <td className="py-2 px-4">
                  <button onClick={() => handleDeleteEmployee(vendor.vendorId)}>
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
