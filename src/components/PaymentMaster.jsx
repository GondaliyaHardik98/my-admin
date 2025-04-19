import React, { useEffect, useState } from "react";
import axios from "axios";

export default function PaymentMaster() {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [paymentType, setPaymentType] = useState("");
  const [productCategories, setProductCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [reportData, setReportData] = useState(null);
  const [pendingSummary, setPendingSummary] = useState(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (paymentType === "productMachine" && selectedCustomerId && selectedCategoryId) {
      axios.get(`${process.env.REACT_APP_API_URL}/payment/pending/productMachine/${selectedCustomerId}/${selectedCategoryId}`).then(res => setPendingSummary(res.data.data)).catch(console.error);
    } else if (paymentType === "challan" && selectedCustomerId) {
      axios.get(`${process.env.REACT_APP_API_URL}/payment/pending/challan/${selectedCustomerId}`).then(res => setPendingSummary(res.data.data)).catch(console.error);
    } else if (paymentType === "amc" && selectedCustomerId) {
      axios.get(`${process.env.REACT_APP_API_URL}/payment/pending/amc/${selectedCustomerId}`).then(res => setPendingSummary(res.data.data)).catch(console.error);
    } else {
      setPendingSummary(null);
    }
  }, [paymentType, selectedCustomerId, selectedCategoryId]);

  const fetchCustomers = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/customer`);
      setCustomers(res.data.data);
    } catch (err) {
      console.error("Error fetching customers", err);
    }
  };

  const handleCustomerChange = async e => {
    const customerId = e.target.value;
    setSelectedCustomerId(customerId);
    setPaymentType("");
    setSelectedCategoryId("");
    setPaymentAmount("");
    setPaymentDate("");
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/payment/data/${customerId}`);
      setReportData(res.data.data);
    } catch (err) {
      console.error("Error fetching customer payment data", err);
    }
  };

  const handlePaymentTypeChange = async e => {
    const type = e.target.value;
    setPaymentType(type);
    setSelectedCategoryId("");
    if (type === "productMachine" && selectedCustomerId) {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/payment/categories/${selectedCustomerId}`);
      setProductCategories(res.data.data);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!paymentAmount || !paymentDate) return alert("Enter amount and date");
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/payment`, {
        customerId: selectedCustomerId,
        paymentType,
        productCategoryId: paymentType === "productMachine" ? selectedCategoryId : null,
        paymentAmount,
        paymentDate
      });
      alert("Payment recorded!");
      setPaymentAmount("");
      setPaymentDate("");
    } catch (err) {
      console.error("Error recording payment", err);
      alert("Payment failed");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6">Record Payment</h2>

      {/* Horizontal Form Section */}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-6 gap-4 items-end mb-6">
          <div>
            <label className="block font-medium mb-1">Customer</label>
            <select value={selectedCustomerId} onChange={handleCustomerChange} className="w-full border p-2 rounded">
              <option value="">-- Select Customer --</option>
              {customers.map(c => (
                <option key={c.customerId} value={c.customerId}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium mb-1">Payment Type</label>
            <select value={paymentType} onChange={handlePaymentTypeChange} className="w-full border p-2 rounded">
              <option value="">-- Select Type --</option>
              <option value="productMachine">Product Machine</option>
              <option value="challan">Challan</option>
              <option value="amc">AMC</option>
            </select>
          </div>

          {paymentType === "productMachine" && (
            <div>
              <label className="block font-medium mb-1">Product Category</label>
              <select value={selectedCategoryId} onChange={e => setSelectedCategoryId(e.target.value)} className="w-full border p-2 rounded">
                <option value="">-- Select Category --</option>
                {productCategories.map(cat => (
                  <option key={cat.categoryId} value={cat.categoryId}>{cat.categoryName}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block font-medium mb-1">Payment Amount</label>
            <input type="number" className="w-full border p-2 rounded" value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} required />
          </div>

          <div>
            <label className="block font-medium mb-1">Payment Date</label>
            <input type="date" className="w-full border p-2 rounded" value={paymentDate} onChange={e => setPaymentDate(e.target.value)} required />
          </div>

          <div>
            <button type="submit" className="w-full bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
              Record Payment
            </button>
          </div>
        </div>
      </form>

      <hr className="my-6 border-t-1 border-gray-200" />

    

      <div className="grid grid-cols-3 gap-6 mt-6">
        {reportData && (
          <div>
            <h4 className="font-semibold mb-2">Product Machine Sales</h4>
            <ul className="list-disc list-inside text-sm">
              {reportData.productMachine.map((item, i) => (
                <li key={i}>{item.productName} (Category: {item.categoryName}) — ₹{item.price}</li>
              ))}
            </ul>
          </div>
        )}

        {reportData && (
          <div>
            <h4 className="font-semibold mb-2">Challans</h4>
            <ul className="list-disc list-inside text-sm">
              {reportData.challans.map((c, i) => (
                <li key={i}>Challan #{c.challanId} ({c.paymentType || "N/A"}) — ₹{c.totalAmount?.toLocaleString() || 0} 📅 {new Date(c.challanDate).toLocaleDateString()}</li>
              ))}
            </ul>
          </div>
        )}

        {reportData && (
          <div>
            <h4 className="font-semibold mb-2">AMC Renewals</h4>
            <ul className="list-disc list-inside text-sm">
              {reportData.amcs.map((a, i) => (
                <li key={i}>AMC from {a.maintenanceStartDate}</li>
              ))}
            </ul>
          </div>
        )}
          </div>
          
          {pendingSummary && (
        <div className="mb-1 bg-yellow-50 border border-yellow-300 p-1 rounded w-1/2">
          <p className="font-semibold">Total Due: <span className="text-gray-800">₹{pendingSummary.totalDue}</span></p>
          <p className="font-semibold">Total Paid: <span className="text-gray-800">₹{pendingSummary.totalPaid}</span></p>
          <p className="font-semibold">Pending Amount: <span className="text-red-500 font-bold">₹{pendingSummary.pending}</span></p>
        </div>
      )}
    </div>
  );
}