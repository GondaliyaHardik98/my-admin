// pages/SalaryMaster.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

const SalaryMaster = () => {
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({
    employeeId: "",
    month_year: "",
    basic_salary: "",
    advance_withdrawal: "",
    emi_deduction: "",
    net_paid: "",
    payment_date: "",
    remark: ""
  });
  const [ledger, setLedger] = useState([]);
  const [summary, setSummary] = useState([]);

  useEffect(() => {
    GetEmployeeList();

  }, []);

  const GetEmployeeList = async () => {
    const res = await axios.get(`${process.env.REACT_APP_API_URL}/employees/list`);
    if (res.data.success) {
      setEmployees(res.data.data);
    }
    
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const salary = parseFloat(formData.basic_salary || 0);
    const advance = parseFloat(formData.advance_withdrawal || 0);
    const emi = parseFloat(formData.emi_deduction || 0);
    const netPaid = salary - advance - emi;
    const dataToSend = { ...formData, net_paid: netPaid };

    const res = await axios.post(`${process.env.REACT_APP_API_URL}/salary/pay`, dataToSend);
    alert(res.data.message);
    fetchLedger(dataToSend.employeeId);
    fetchSummary(dataToSend.employeeId);
    setFormData({
      employeeId: "",
      month_year: "",
      basic_salary: "",
      advance_withdrawal: "",
      emi_deduction: "",
      net_paid: "",
      payment_date: "",
      remark: ""
    });

    // Reset form data
    setLedger([]);
    setSummary([]);
    document.querySelector("form").reset();
  };

  const fetchLedger = async (id) => {
    let url = `${process.env.REACT_APP_API_URL}/salary/ledger/${id}`;
    console.log(url);
    const res = await axios.get(url);

    setLedger(res.data.data);
  };

  const fetchSummary = async (id) => {
    const res = await axios.get(`${process.env.REACT_APP_API_URL}/salary/summary/${id}`);
    setSummary(res.data.data);
  };

  return (
    <div className="container py-4">
      <h2 className="mb-4">Salary Management</h2>

      {/* Salary Form */}
      <form className="card p-4 mb-4 shadow" onSubmit={handleSubmit}>
        <div className="row mb-3">
          <div className="col-md-4">
            <label>Employee</label>
            <select
              className="form-select"
              name="employeeId"
              onChange={(e) => {
                handleChange(e);
                fetchLedger(e.target.value);
                fetchSummary(e.target.value);
              }}
              required
            >
              <option value="">Select</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>
          </div>
          <div className="col-md-4">
            <label>Month-Year</label>
            <input
              type="month"
              name="month_year"
              className="form-control"
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-4">
            <label>Payment Date</label>
            <input
              type="date"
              name="payment_date"
              className="form-control"
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-3">
            <label>Basic Salary</label>
            <input
              type="number"
              name="basic_salary"
              className="form-control"
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-3">
            <label>Advance</label>
            <input
              type="number"
              name="advance_withdrawal"
              className="form-control"
              onChange={handleChange}
            />
          </div>
          <div className="col-md-3">
            <label>EMI Deduction</label>
            <input
              type="number"
              name="emi_deduction"
              className="form-control"
              onChange={handleChange}
            />
          </div>
          <div className="col-md-3">
            <label>Remark</label>
            <input
              type="text"
              name="remark"
              className="form-control"
              onChange={handleChange}
            />
          </div>
        </div>

        <button type="submit" className="btn btn-primary">Submit Salary</button>
      </form>

      {/* Summary Table */}
      <div className="card p-3 shadow mb-4">
        <h5 className="mb-3">Monthly Salary Summary</h5>
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Month</th>
              <th>Basic</th>
              <th>Advance</th>
              <th>EMI</th>
              <th>Net Paid</th>
              <th>Date</th>
              <th>Remark</th>
            </tr>
          </thead>
          <tbody>
            {summary.map((s, idx) => (
              <tr key={idx}>
                <td>{s.month_year}</td>
                <td>₹{s.basic_salary}</td>
                <td>₹{s.advance_withdrawal}</td>
                <td>₹{s.emi_deduction}</td>
                <td>₹{s.net_paid}</td>
                <td>{s.payment_date}</td>
                <td>{s.remark}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Ledger Table */}
      <div className="card p-3 shadow">
        <h5 className="mb-3">Salary Ledger</h5>
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Remark</th>
            </tr>
          </thead>
          <tbody>
            {ledger.map((l, idx) => (
              <tr key={idx}>
                <td>{new Date(l.date).toLocaleDateString()}</td>
                <td>{l.type}</td>
                <td>₹{l.amount}</td>
                <td>{l.remark}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SalaryMaster;
