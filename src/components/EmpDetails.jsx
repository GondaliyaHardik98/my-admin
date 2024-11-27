import { useState, useEffect } from "react";
import { AlertCircle, CheckCircle2, Upload } from "lucide-react";
import axios from "axios";

export default function EmployeeForm() {
  const [employeesData, setEmployee] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [showDocumentModal, setShowDocumentModal] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    salary: "",
    contact_details: "",
    emergency_contact_1: "",
    emergency_contact_2: "",
  });
  const [selectedDocument, setSelectedDocument] = useState({
    url: "",
    type: "",
    name: "",
  });
  const [fileNames, setFileNames] = useState({
    photo: "",
    id_proof: "",
  });
  const [files, setFiles] = useState({
    photo: null,
    id_proof: null,
  });

  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);

  useEffect(() => {
    fetchEmployee();
  }, []);
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const downloadDocument = async (url, name) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = name || "document";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Error downloading document:", error);
      alert("Error downloading document. Please try again.");
    }
  };
  const handleDocumentClick = (url, type, name) => {
    // Check if it's an image
    const isImage = url?.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/);

    if (isImage) {
      setSelectedDocument({ url, type: "image", name });
      setShowDocumentModal(true);
    } else {
      // For non-image files, trigger download
      downloadDocument(url, name);
    }
  };
  const handleFileChange = (e) => {
    const { name, files: fileList } = e.target;
    setFiles((prev) => ({
      ...prev,
      [name]: fileList[0],
    }));
  };
  const handleEdit = (employee) => {
    setSelectedEmployeeId(employee.id); // Set the selected customer's ID
    console.log(employee, "check data");
    setFormData({
      name: employee.name,
      salary: employee.salary,
      contact_details: employee.contact_details,
      emergency_contact_1: employee.emergency_contact_1,
      emergency_contact_2: employee.emergency_contact_2,
    });

    setFileNames({
      photo: employee.photo ? employee.photo.split("/").pop() : "",
      id_proof: employee.id_proof ? employee.id_proof.split("/").pop() : "",
    });
    setFiles({
      photo: employee.photo,
      id_proof: employee.id_proof,
    });
  };
  const handleDeleteEmployee = async (id) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      try {
        console.log(id, "delete id");
        const response = await fetch(
          `http://localhost:3002/api/employees/${id}`,
          {
            method: "DELETE",
          }
        );
        const result = await response.json();

        if (result.success) {
          // Remove the deleted customer from the state
          //setCustomers(customers.filter((customer) => customer.id !== id));
          fetchEmployee();
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
  const fetchEmployee = async () => {
    try {
      const response = await axios.get("http://localhost:3002/api/employees"); // Replace with your actual API URL
      setEmployee(response.data.data);
      //setEmployee(Array.isArray(response.data.data) ? response.data.data : []);
      console.log(response.data);
    } catch (error) {
      console.error("Error fetching customer data:", error);
    }
  };
  const SaveRecord = async () => {
    setLoading(true);
    setResponse(null);

    try {
      const formDataToSend = new FormData();

      // Append text fields
      Object.keys(formData).forEach((key) => {
        if (formData[key]) {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Append files
      Object.keys(files).forEach((key) => {
        if (files[key]) {
          formDataToSend.append(key, files[key]);
        }
      });

      const isEdit = !!selectedEmployeeId;

      const apiUrl = isEdit
        ? `http://localhost:3002/api/employees/${selectedEmployeeId}` // Edit endpoint with ID
        : "http://localhost:3002/api/employees"; // Create endpoint
      const method = isEdit ? "PUT" : "POST";

      const response = await fetch(apiUrl, {
        method: method,
        body: formDataToSend,
      });
      const data = await response.json();

      setResponse({
        success: data.success,
        message: data.message,
      });

      if (data.success) {
        clearRecord();
        fetchEmployee();
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
      name: "",
      salary: "",
      contact_details: "",
      emergency_contact_1: "",
      emergency_contact_2: "",
    });
    setFiles({
      photo: null,
      id_proof: null,
    });
    // Reset file input elements
    document.getElementById("photo").value = "";
    document.getElementById("id_proof").value = "";
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Create Employee</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name Field */}
        <div className="grid grid-cols-5 gap-4">
          <div>
            <label className="block font-medium">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
          <div>
            {/* Salary Field */}
            <label className="block text-sm font-medium mb-1">Salary</label>
            <input
              type="number"
              name="salary"
              value={formData.salary}
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
              type="text"
              name="contact_details"
              value={formData.contact_details}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Emergency Contact 1
            </label>
            <input
              type="text"
              name="emergency_contact_1"
              value={formData.emergency_contact_1}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>

          {/* Emergency Contact 2 */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Emergency Contact 2
            </label>
            <input
              type="text"
              name="emergency_contact_2"
              value={formData.emergency_contact_2}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-medium mb-1">Photo</label>
            <div className="flex flex-col gap-2">
              {fileNames.photo && (
                <div className="text-sm text-gray-600">
                  Current file: {fileNames.photo}
                </div>
              )}
              <div className="flex items-center space-x-2">
                <Upload className="w-4 h-4 text-gray-500" />
                <input
                  type="file"
                  id="photo"
                  name="photo"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
            </div>
          </div>

          {/* ID Proof Upload */}
          <div>
            <label className="block text-sm font-medium mb-1">ID Proof</label>
            <div className="flex flex-col gap-2">
              {fileNames.id_proof && (
                <div className="text-sm text-gray-600">
                  Current file: {fileNames.id_proof}
                </div>
              )}
              <div className="flex items-center space-x-2">
                <Upload className="w-4 h-4 text-gray-500" />
                <input
                  type="file"
                  id="id_proof"
                  name="id_proof"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-center gap-4 space-x-4 mt-4">
          {" "}
          {/* Submit Button */}
          <button
            type="submit"
            className="w-36 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
          >
            Save
          </button>
          {/* Submit Button */}
          <button
            type="submit"
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
              <th className="py-2 px-4 border-b">Salary</th>
              <th className="py-2 px-4 border-b">Contact Details</th>
              <th className="py-2 px-4 border-b">Emergency Contact 1</th>
              <th className="py-2 px-4 border-b">Emergency Contact 2</th>
              <th className="py-2 px-4 border-b">Photo</th>
              <th className="py-2 px-4 border-b">Id Proof</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {employeesData.map((employee, index) => (
              <tr key={index} className="border-b">
                <td className="py-2 px-4">{index + 1}</td>
                <td className="py-2 px-4">{employee.name}</td>
                <td className="py-2 px-4">{employee.salary}</td>
                <td className="py-2 px-4">{employee.contact_details}</td>
                <td className="py-2 px-4">{employee.emergency_contact_1}</td>
                <td className="py-2 px-4">{employee.emergency_contact_2}</td>
                <td className="py-2 px-4">
                  <a
                    href={employee.photo}
                    onClick={(e) => {
                      e.preventDefault();
                      handleDocumentClick(
                        employee.photo,
                        "image",
                        `Photo_${employee.name}`
                      );
                    }}
                    className="text-blue-500"
                  >
                    View Photo
                  </a>
                </td>
                <td className="py-2 px-4">
                  <a
                    href={employee.id_proof}
                    onClick={(e) => {
                      e.preventDefault();
                      handleDocumentClick(
                        employee.id_proof,
                        "document",
                        `ID_Proof_${employee.name}`
                      );
                    }}
                    className="text-blue-500"
                  >
                    View Document
                  </a>
                </td>
                <td className="py-2 px-4 border-b">
                  <button
                    onClick={() => handleEdit(employee)}
                    className="text-blue-500 hover:text-blue-700 mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteEmployee(employee.id)}
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
