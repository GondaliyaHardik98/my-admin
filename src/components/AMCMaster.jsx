import React, { useState, useEffect } from "react";
import axios from "axios";
import { CheckCircle2, AlertCircle } from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function AMCRecord() {
  const [amcRecords, setAMCRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [response, setResponse] = useState(null);

  useEffect(() => {
    fetchAMCRecords();
  }, []);

  const fetchAMCRecords = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/amc`);
      setAMCRecords(response.data.data || []);
    } catch (error) {
      console.error("Error fetching AMC records:", error);
    }
  };

  const handleEdit = (record) => {
    setSelectedRecord(record);
  };

  const handlePrintAMCInvoice = (amc) => {
    const doc = new jsPDF();
  
    // Add the custom font (if needed)
    // doc.addFileToVFS("CustomFont.ttf", customFont);
    // doc.addFont("CustomFont.ttf", "CustomFont", "normal");
    // doc.setFont("CustomFont");
  
    // Add a logo
    const logoUrl = "https://example.com/logo.png"; // Replace with your actual logo URL
    //doc.addImage(logoUrl, "PNG", 10, 10, 50, 20);
  
    // Title
    doc.setFontSize(16);
    doc.text("AMC Record Invoice", 105, 40, { align: "center" });
  
    // AMC Details
    doc.setFontSize(12);
    doc.text(`AMC ID: ${amc.amcId}`, 20, 60);
    doc.text(`Sell Date: ${formatDate(amc.sellDate)}`, 20, 70);
    doc.text(`Maintenance Start Date: ${formatDate(amc.maintenanceStartDate)}`, 20, 80);
    doc.text(`Maintenance End Date: ${formatDate(amc.maintenanceEndDate) || "N/A"}`, 20, 90);
    doc.text(`Customer: ${amc.customerName}`, 20, 100);
    doc.text(`Product: ${amc.productName}`, 20, 110);
  
    // Save PDF to Preview
    const pdfOutput = doc.output("blob");
    const pdfURL = URL.createObjectURL(pdfOutput);
  
    // Create a popup for preview
    const previewWindow = window.open(pdfURL, "_blank");
    previewWindow.focus();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedRecord((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdate = async () => {
    setResponse(null);
    try {
      const response = await axios.put(`${process.env.REACT_APP_API_URL}/amc`, selectedRecord);
      setResponse({ success: response.data.success, message: response.data.message });
      if (response.data.success) {
        fetchAMCRecords();
        setSelectedRecord(null);
      }
    } catch (error) {
      console.error("Error updating AMC record:", error);
      setResponse({ success: false, message: "Error updating AMC record. Please try again." });
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">AMC Records</h2>

      {/* Response Notification */}
      {response && (
        <div
          className={`mt-4 p-4 rounded ${
            response.success ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
          }`}
        >
          {response.success ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span>{response.message}</span>
        </div>
      )}

      {/* AMC Records Table */}
      <table className="w-full border border-gray-300 text-left">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">AMC ID</th>
            <th className="py-2 px-4 border-b">Customer</th>
            <th className="py-2 px-4 border-b">Product</th>
            <th className="py-2 px-4 border-b">Sell Date</th>
            <th className="py-2 px-4 border-b">Maintenance Start Date</th>
            <th className="py-2 px-4 border-b">Maintenance End Date</th>
            <th className="py-2 px-4 border-b">Actions</th>
            <th className="py-2 px-4 border-b">Print</th>
          </tr>
        </thead>
        <tbody>
          {amcRecords.map((record) => (
            <tr key={record.amcId} className="hover:bg-gray-50">
              <td className="py-2 px-4 border-b">{record.amcId}</td>
              <td className="py-2 px-4 border-b">{record.customerName}</td>
              <td className="py-2 px-4 border-b">{record.productName}</td>
              <td className="py-2 px-4 border-b">{formatDate(record.sellDate )}</td>
              <td className="py-2 px-4 border-b">{formatDate(record.maintenanceStartDate)}</td>
              <td className="py-2 px-4 border-b">{formatDate(record.maintenanceEndDate) || "N/A"}</td>
              <td className="py-2 px-4 border-b">
                <button
                  onClick={() => handleEdit(record)}
                  className="text-blue-500 hover:text-blue-700 mr-2"
                >
                  Edit
                </button>
              </td>
              <td className="py-2 px-4 border-b">
                <button
                  onClick={() => handlePrintAMCInvoice(record)}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Print Invoice
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Edit AMC Record */}
      {selectedRecord && (
        <div className="mt-6 p-4 border rounded">
          <h3 className="text-lg font-bold mb-4">Edit AMC Record</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium">Maintenance Start Date</label>
              <input
                type="date"
                name="maintenanceStartDate"
                value={selectedRecord.maintenanceStartDate}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block font-medium">Maintenance End Date</label>
              <input
                type="date"
                name="maintenanceEndDate"
                value={selectedRecord.maintenanceEndDate || ""}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-center gap-4">
            <button
              onClick={handleUpdate}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Save
            </button>
            <button
              onClick={() => setSelectedRecord(null)}
              className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};
