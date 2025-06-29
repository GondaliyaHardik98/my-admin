import React, { useState, useEffect, useRef } from "react";
import axios from "axios";


export default function EmployeeForm() {
  const [employees, setEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [proofUrl, setProofUrl] = useState(null);

  const photoRef = useRef(null);
  const idProofRef = useRef(null);

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
      const token = sessionStorage.getItem("jwtToken"); // Retrieve token from sessionStorage
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/employees`, {
        headers: {
          Authorization: `Bearer ${token}`, // Add Authorization header
        },
      });
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
    setFormData((prev) => {
      const updatedFormData = {
        ...prev,
        [name]: files[0], // Update the specific file field (photo or id_proof)
      };
      console.log(name, " Name of file: " + files[0].name);
      return updatedFormData;
    });
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
      currentPhoto: employee.photo, // Store current photo filename
      currentIdProof: employee.id_proof // Store current ID proof filename
    });
  };

  const handleEmployee = async (employee) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      try {
        const id = employee.id;
        console.log(id, "delete id");
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/employees/${id}`,
          {
            method: "DELETE",
          }
        );
        const result = await response.json();
        console.log(result, "delete result");
        alert(result.message);
        if (result.success) {
          fetchEmployees();
        } 
      } catch (error) {
        console.error("Error deleting record:", error);
        alert("An error occurred.");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("salary", formData.salary);
    formDataToSend.append("contact_details", formData.contact_details);
    formDataToSend.append("emergency_contact_1", formData.emergency_contact_1);
    formDataToSend.append("emergency_contact_2", formData.emergency_contact_2);
    
    if (formData.photo) {
      formDataToSend.append("photo", formData.photo);
    }
    if (formData.id_proof) {
      formDataToSend.append("id_proof", formData.id_proof);
    }
  

    const url = selectedEmployeeId
        ? `${process.env.REACT_APP_API_URL}/employees/${selectedEmployeeId}`
        : `${process.env.REACT_APP_API_URL}/employees`;
    const method = selectedEmployeeId ? "put" : "post";

    console.log("URL: ", url);
    console.log("Method: ", method);
    console.log("FormData Entries: ", formData);

    try {
      const token = sessionStorage.getItem("jwtToken"); // Retrieve token from sessionStorage
      const config = {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      };
      console.log("Config: ", config);
     
        const res = await axios({
            method,
            url,
            data: formDataToSend,
            headers: config.headers,
        });

        console.log("Response: ", res);
        setResponse({ success: res.data.success, message: res.data.message });

        if (res.data.success) {
            fetchEmployees();
            clearForm();
        }
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

    if (photoRef.current) photoRef.current.value = "";
    if (idProofRef.current) idProofRef.current.value = "";
  };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  // Filter records based on search query (by Employee Name or Mobile Number)
  const filteredRecords = employees.filter(
    (employee) =>
      employee.name.toLowerCase().includes(searchQuery.toLowerCase())  );

  return (
    <div className="container mx-auto  p-4">
      <h2 className="text-center mb-4">Employee Management</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data" className="card shadow-sm p-4 mb-5">
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
            {formData.currentPhoto && (
      <div className="mb-2">
        <img 
          src={`${process.env.REACT_APP_API_URL}/uploads/Employee/Photos/${formData.currentPhoto}`}
          alt="Current" 
          style={{ width: '50px', height: '50px', objectFit: 'cover' }}
          className="me-2"
        />
        <span>Current: {formData.currentPhoto}</span>
      </div>
    )}
            <input
              type="file"
              name="photo"
              ref={photoRef}
              onChange={handleFileChange}
              className="form-control"
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">ID Proof</label>
            {formData.currentIdProof && (
      <div className="mb-2">
         <button
    className="btn btn-link p-0"
    onClick={() => {
      setProofUrl(`${process.env.REACT_APP_API_URL}/uploads/Employee/ID_Proofs/${formData.currentIdProof}`);
      setShowModal(true);
      console.log("ID Proof URL: ", `${process.env.REACT_APP_API_URL}/uploads/Employee/ID_Proofs/${formData.currentIdProof}`);
    }}
  >
          View Current
        </button>
        <span>Current: {formData.currentIdProof}</span>
      </div>
    )}
            <input
              type="file"
              name="id_proof"
              ref={idProofRef}
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

{showModal && (
    <div className="modal show d-block" tabIndex="-1" role="dialog" onClick={() => setShowModal(false)}>
      <div className="modal-dialog modal-xl" role="document" onClick={(e) => e.stopPropagation()} style={{ width: "400px", maxWidth: "100%" }}>
        <div className="modal-content" style={{ height: "400px" }}>
          <div className="modal-header">
            <h5 className="modal-title">ID Proof Preview</h5>
            <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
          </div>
          <div className="modal-body text-center">
            {proofUrl?.toLowerCase().endsWith(".pdf") ? (
              <iframe
                src={proofUrl}
                title="PDF Preview"
                width="100%"
                height="600px"
                frameBorder="0"
              ></iframe>
            ) : (
              <img src={proofUrl} alt="ID Proof" className="img-fluid" />
            )}
          </div>
        </div>
      </div>
    </div>
  )}

<input
       type="text"
       placeholder="Search by name..."
       value={searchQuery}
       onChange={handleSearch}
       className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
     />

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
          {filteredRecords.length > 0 ? (
              filteredRecords.map((employee, index) => (
              <tr key={employee.id}>
                <td>{index + 1}</td>
                <td>
                  {employee.photo ? (
                    <img
                      src={`${process.env.REACT_APP_API_URL}/uploads/Employee/Photos/${employee.photo}`}
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
  <button
    className="btn btn-link p-0"
    onClick={() => {
      setProofUrl(`${process.env.REACT_APP_API_URL}/uploads/Employee/ID_Proofs/${employee.id_proof}`);
      setShowModal(true);
      console.log("ID Proof URL: ", `${process.env.REACT_APP_API_URL}/uploads/Employee/ID_Proofs/${employee.id_proof}`);
    }}
  >
    View
  </button>
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
                    onClick={() => handleEmployee(employee)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
              ))
            ) : (<tr><td colSpan="9" className="text-center">No records found</td></tr>)}
            
          </tbody>
        </table>
      </div>
    </div>
  
  

  
    
  );

  
}
