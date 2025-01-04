import React, { useState, useEffect } from "react";
import axios from "axios";

export default function EmployeeForm() {
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    salary: "",
    contact_details: "",
    emergency_contact_1: "",
    emergency_contact_2: "",
    photo: "",
    id_proof: "",
  });
  const [response, setResponse] = useState(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/employees`);
      setEmployees(res.data.data || []);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files[0],
    }));
    console.log("Name of file: " + files[0]);
  };

  const handleEdit = (employee) => {
    setSelectedEmployeeId(employee.id);
    setFormData({
      name: employee.name,
      salary: employee.salary,
      contact_details: employee.contact_details,
      emergency_contact_1: employee.emergency_contact_1,
      emergency_contact_2: employee.emergency_contact_2,
      photo: null,
      id_proof: null,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submit data: " + formData);
    const data = new FormData();
    data.append("name", formData.name);
    data.append("salary", formData.salary);
    data.append("contact_details", formData.contact_details);
    data.append("emergency_contact_1", formData.emergency_contact_1);
    data.append("emergency_contact_2", formData.emergency_contact_2);
    if (formData.photo) {
        data.append("photo", formData.photo);
    }
    if (formData.id_proof) {
        data.append("id_proof", formData.id_proof);
    }
    
    console.log("Data submit: ", data);
    

    const url = selectedEmployeeId
    ? `${process.env.REACT_APP_API_URL}/employees/${selectedEmployeeId}`
    : `${process.env.REACT_APP_API_URL}/employees`;
    const method = selectedEmployeeId ? "PUT" : "POST";


    console.log("URL: ", url);

    try {
        const res = await fetch(url, {
            method,
            body: data,
        });
        const result = await res.json();
        console.log("Result: ", result);
        setResponse({ success: result.success, message: result.message });
        fetchEmployees();
        clearForm();
    } catch (error) {
        console.error("Error submitting form:", error);
        setResponse({ success: false, message: "Failed to save employee." });
    }
  };

  const clearForm = () => {
    setFormData({
      name: "",
      salary: "",
      contact_details: "",
      emergency_contact_1: "",
      emergency_contact_2: "",
      photo: null,
      id_proof: null,
    });
    setSelectedEmployeeId(null);
  };

  return (
    <div className="container mx-auto  p-4">
      <h2 className="text-center mb-4">Employee Management</h2>
      <form onSubmit={handleSubmit} className="card shadow-sm p-4 mb-5">
        <h4 className="card-title mb-4">Add/Edit Employee</h4>
        <div className="row g-3 mb-3">
          <div className="col-md-6">
            <label className="form-label">Employee Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="form-control"
              required
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">Salary</label>
            <input
              type="number"
              name="salary"
              value={formData.salary}
              onChange={handleInputChange}
              className="form-control"
              required
            />
          </div>
        </div>
        <div className="row g-3 mb-3">
          <div className="col-md-6">
            <label className="form-label">Contact Details</label>
            <input
              type="text"
              name="contact_details"
              value={formData.contact_details}
              onChange={handleInputChange}
              className="form-control"
              required
            />
          </div>
          <div className="col-md-3">
            <label className="form-label">Emergency Contact 1</label>
            <input
              type="text"
              name="emergency_contact_1"
              value={formData.emergency_contact_1}
              onChange={handleInputChange}
              className="form-control"
              required
            />
          </div>
          <div className="col-md-3">
            <label className="form-label">Emergency Contact 2</label>
            <input
              type="text"
              name="emergency_contact_2"
              value={formData.emergency_contact_2}
              onChange={handleInputChange}
              className="form-control"
            />
          </div>
        </div>
        <div className="row g-3 mb-4">
          <div className="col-md-6">
            <label className="form-label">Photo</label>
            <input
              type="file"
              name="photo"
              onChange={handleFileChange}
              className="form-control"
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">ID Proof</label>
            <input
              type="file"
              name="id_proof"
              onChange={handleFileChange}
              className="form-control"
            />
          </div>
        </div>
        <div className="d-flex justify-content-center gap-3">
          <button type="submit" className="btn btn-primary">
            {selectedEmployeeId ? "Update" : "Save"}
          </button>
          <button
            type="button"
            onClick={clearForm}
            className="btn btn-secondary"
          >
            Clear
          </button>
        </div>
      </form>

      {response && (
        <div
          className={`alert mt-4 ${
            response.success ? "alert-success" : "alert-danger"
          }`}
        >
          {response.message}
        </div>
      )}

      <div className="mt-5">
        <h3 className="mb-4">Employee List</h3>
        <table className="table table-hover table-bordered">
          <thead className="table-light">
            <tr>
              <th>#</th>
              <th>Photo</th>
              <th>Name</th>
              <th>Salary</th>
              <th>Contact</th>
              <th>Emergency Contact 1</th>
              <th>Emergency Contact 2</th>
              <th>ID Proof</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee, index) => (
              <tr key={employee.id}>
                <td>{index + 1}</td>
                <td>
                  {employee.photo ? (
                    <img
                      src={employee.photo}
                      alt={employee.name}
                      className="rounded-circle"
                      style={{ width: "50px", height: "50px", objectFit: "cover" }}
                    />
                  ) : (
                    "N/A"
                  )}
                </td>
                <td>{employee.name}</td>
                <td>{employee.salary}</td>
                <td>{employee.contact_details}</td>
                <td>{employee.emergency_contact_1}</td>
                <td>{employee.emergency_contact_2 || "N/A"}</td>
                <td>
                  {employee.id_proof ? (
                    <a href={employee.id_proof} target="_blank" rel="noreferrer">
                      View
                    </a>
                  ) : (
                    "N/A"
                  )}
                </td>
                <td>
                  <button
                    onClick={() => handleEdit(employee)}
                    className="btn btn-sm btn-warning me-2"
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => {
                      if (
                        window.confirm(
                          "Are you sure you want to delete this employee?"
                        )
                      ) {
                        // Add delete logic here
                      }
                    }}
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
