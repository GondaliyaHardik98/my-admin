import React, { useEffect, useState } from "react";
import axios from "axios";

function SalaryMaster() {
  const [salaryData, setSalaryData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [SelectedSalaryId, setSelectedSalaryId] = useState(null);
  const [employeeData, setEmployeeData] = useState([]);
  const [formData, setFormData] = useState({
    salaryId: 0,
    engineerId: 0,
    salary: 0,
    salaryDate: "",
    salaryMonth: "",
    salaryRemark: "",
  });

  useEffect(() => {
    populateData();
    fetchSalary();
  }, []);

  const fetchSalary = async () => {
    try {
      const getAllData = await axios.get("http://localhost:3002/api/salary");
      setSalaryData(getAllData.data.data);
      console.log(getAllData.data.data, "getAllData");
    } catch (error) {
      console.error("Error fetching Salary:", error);
    }
  };

  const populateData = async () => {
    try {
      const employeeData = await axios.get(
        "http://localhost:3002/api/challanEmployee"
      );
      setEmployeeData(employeeData.data.data);
      console.log(employeeData.data.data, "employeeData");
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

  const handleSubmit = (e) => {
    e.preventDefault();
    SaveRecord();
  };

  const SaveRecord = async () => {
    setLoading(true);
    setResponse(null);

    try {
      const _saveData = {
        engineerId: formData.engineerId,
        salary: formData.salary,
        salaryDate: formData.salaryDate,
        salaryMonth: formData.salaryMonth,
        salaryRemark: formData.salaryRemark,
      };
      console.log(_saveData, "savdata");
      const isEdit = !!SelectedSalaryId;

      const apiUrl = isEdit
        ? `http://localhost:3002/api/salary/${SelectedSalaryId}` // Edit endpoint with ID
        : "http://localhost:3002/api/salary"; // Create endpoint
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
        fetchSalary();
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
      salaryId: 0,
      engineerId: 0,
      salary: 0,
      salaryDate: "",
      salaryMonth: "",
      salaryRemark: "",
    });
  };
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };
  const handleEdit = (entry) => {
    setSelectedSalaryId(entry.salaryId); // Set the selected vendor's ID

    setFormData({
      engineerId: entry.engineerId,
      salary: entry.salary,
      salaryDate: formatDate(entry.salaryDate),
      salaryMonth: entry.salaryMonth,
      salaryRemark: entry.salaryRemark,
    });
  };
  const handleDeleteEmployee = async (id) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      try {
        console.log(id, "delete id");
        const response = await fetch(`http://localhost:3002/api/salary/${id}`, {
          method: "DELETE",
        });
        const result = await response.json();

        if (result.success) {
          // Remove the deleted customer from the state
          //setCustomers(customers.filter((customer) => customer.id !== id));
          fetchSalary();
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
  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">SalaryMaster</h2>
      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Engineer ID */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Engineer ID
            </label>
            <select
              name="engineerId"
              value={formData.engineerId}
              onChange={handleInputChange}
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

          {/* Salary */}
          <div>
            <label className="block text-sm font-medium mb-1">Salary</label>
            <input
              type="number"
              name="salary"
              value={formData.salary}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>

          {/* Salary Date */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Salary Date
            </label>
            <input
              type="date"
              name="salaryDate"
              value={formData.salaryDate}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>
          {/* Month */}
          <div>
            <label className="block text-sm font-medium mb-1">Month</label>
            <input
              type="text"
              name="salaryMonth"
              value={formData.salaryMonth}
              onChange={handleInputChange}
              placeholder="e.g., January"
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Remark */}
          <div>
            <label className="block text-sm font-medium mb-1">Remark</label>
            <textarea
              rows={2}
              type="text"
              name="salaryRemark"
              value={formData.salaryRemark}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
        </div>

        <div className="flex justify-center space-x-4 mt-4">
          <button
            type="submit"
            onClick={handleSubmit}
            className="w-36 bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
          >
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

      {/* Responsive Data Table */}
      <div className="container mx-auto mt-8 p-4 overflow-x-auto">
        <table className="w-full border border-gray-300 text-left">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b">ID</th>
              <th className="py-2 px-4 border-b">Engineer ID</th>
              <th className="py-2 px-4 border-b">Salary</th>
              <th className="py-2 px-4 border-b">Salary Date</th>
              <th className="py-2 px-4 border-b">Month</th>
              <th className="py-2 px-4 border-b">Remark</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {salaryData.map((entry, index) => (
              <tr key={index} className="border-b">
                <td className="py-2 px-4">{index + 1}</td>
                <td className="py-2 px-4">{entry.engineerName}</td>
                <td className="py-2 px-4">{entry.salary}</td>
                <td className="py-2 px-4">{formatDate(entry.salaryDate)}</td>
                <td className="py-2 px-4">{entry.salaryMonth}</td>
                <td className="py-2 px-4">{entry.salaryRemark}</td>

                <td className="py-2 px-4 border-b">
                  <button
                    onClick={() => handleEdit(entry)}
                    className="text-blue-500 hover:text-blue-700 mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteEmployee(entry.salaryId)}
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

export default SalaryMaster;
