import React, { useEffect, useState } from "react";

function SalaryMaster() {
  const [salaryData, setSalaryData] = useState([]);
  const [formData, setFormData] = useState({
    engineerId: "",
    salary: "",
    salaryDate: "",
    month: "",
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
    setSalaryData([...salaryData, formData]);
    setFormData({
      engineerId: "",
      salary: "",
      salaryDate: "",
      month: "",
      remark: "",
    });
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">SalaryMaster</h2>
      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <option value="">Select Engineer</option>
              <option value="E1">Engineer 1</option>
              <option value="E2">Engineer 2</option>
              <option value="E3">Engineer 3</option>
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Month */}
          <div>
            <label className="block text-sm font-medium mb-1">Month</label>
            <input
              type="text"
              name="month"
              value={formData.month}
              onChange={handleInputChange}
              placeholder="e.g., January"
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
          Add Salary Entry
        </button>
      </form>

      {/* Responsive Data Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b">ID</th>
              <th className="py-2 px-4 border-b">Engineer ID</th>
              <th className="py-2 px-4 border-b">Salary</th>
              <th className="py-2 px-4 border-b">Salary Date</th>
              <th className="py-2 px-4 border-b">Month</th>
              <th className="py-2 px-4 border-b">Remark</th>
            </tr>
          </thead>
          <tbody>
            {salaryData.map((entry, index) => (
              <tr key={index} className="border-b">
                <td className="py-2 px-4">{index + 1}</td>
                <td className="py-2 px-4">{entry.engineerId}</td>
                <td className="py-2 px-4">{entry.salary}</td>
                <td className="py-2 px-4">{entry.salaryDate}</td>
                <td className="py-2 px-4">{entry.month}</td>
                <td className="py-2 px-4">{entry.remark}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SalaryMaster;
