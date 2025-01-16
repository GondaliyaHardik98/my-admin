import React, { useState, useEffect } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { jwtDecode } from "jwt-decode";

export default function SellMaster() {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [sellData, setSellData] = useState([]);
  const [formData, setFormData] = useState({
    customerId: "",
    productId: "",
    sellDate: "",
    price: "",
    remark: "",
  });
  const [installmentData, setInstallmentData] = useState({});
  const [installmentHistory, setInstallmentHistory] = useState([]);
  const [selectedSellId, setSelectedSellId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [response, setResponse] = useState(null);
  const [previewPDF, setPreviewPDF] = useState(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    fetchDropdownData();
    fetchSellData();
    checkRole();
  }, []);

  const checkRole = () => {
    const token = sessionStorage.getItem("jwtToken");
    if (token) {
      const decoded = jwtDecode(token);
      const roles = decoded.roles || [];
      setIsSuperAdmin(roles.includes("Super Admin"));
    }
  };

  const fetchDropdownData = async () => {
    try {
      const token = sessionStorage.getItem("jwtToken");
      const [customerRes, productRes] = await Promise.all([
        axios.get(`${process.env.REACT_APP_API_URL}/customer`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${process.env.REACT_APP_API_URL}/productAll`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setCustomers(customerRes.data.data || []);
      setProducts(productRes.data.data || []);
    } catch (error) {
      console.error("Error fetching dropdown data:", error);
    }
  };

  const fetchSellData = async () => {
    try {
      const token = sessionStorage.getItem("jwtToken");
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/sell`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSellData(response.data.data || []);
    } catch (error) {
      console.error("Error fetching sell records:", error);
    }
  };

  const fetchInstallmentHistory = async (sellId) => {
    try {
      const token = sessionStorage.getItem("jwtToken");
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/sell/installments/${sellId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setInstallmentHistory(response.data.data || []);
      setSelectedSellId(sellId);
      setShowModal(true);
    } catch (error) {
      console.error("Error fetching installment history:", error);
    }
  };

  const handlePrintInvoice = (sell) => {
    try {
      const doc = new jsPDF();
      const logoUrl = "%PUBLIC_URL%/logo192.png"; // Replace with actual logo URL or base64 string

      console.log("Print invoice");
      // Add Logo
      //doc.addImage(logoUrl, "PNG", 10, 10, 50, 20);

      // Title
      doc.setFontSize(16);
      doc.text("Sell Invoice", 105, 40, { align: "center" });

      // Invoice Details
      doc.setFontSize(12);
      doc.text(`Invoice ID: ${sell.sellId}`, 20, 60);
      doc.text(
        `Sell Date: ${new Date(sell.sellDate).toLocaleDateString()}`,
        20,
        70
      );
      doc.text(`Customer: ${sell.customerName}`, 20, 80);

      // Table for Products
      const tableColumn = ["Product Name", "Price"];
      const tableRows = [[sell.productName, `${sell.price} Rs.`]];

      doc.autoTable({
        startY: 90,
        head: [tableColumn],
        body: tableRows,
      });

      // Footer Details
      const finalY = doc.lastAutoTable.finalY + 10;
      doc.text(`Total Price: ${sell.price} Rs.`, 20, finalY);
      doc.text(`Paid Amount: ${sell.totalPaid} Rs.`, 20, finalY + 10);
      doc.text(`Balance Amount: ${sell.balance} Rs.`, 20, finalY + 20);

      // Save PDF to Preview
      const pdfOutput = doc.output("blob");
      setPreviewPDF(URL.createObjectURL(pdfOutput));
    } catch (error) {
      console.error("Error generating PDF:", error);
      setResponse({ success: false, message: "Failed to generate PDF." });
    }
  };

  const handleDownloadPDF = () => {
    const link = document.createElement("a");
    link.href = previewPDF;
    link.download = "Sell_Invoice.pdf";
    link.click();
    setPreviewPDF(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddInstallment = async (sellId) => {
    const installment = installmentData[sellId];
    if (!installment || !installment.amountPaid || !installment.paymentDate) {
      setResponse({
        success: false,
        message: "Please fill all installment details.",
      });
      return;
    }

    try {
      const token = sessionStorage.getItem("jwtToken");
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/sell/installment`,
        {
          sellId,
          ...installment,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setResponse({
        success: response.data.success,
        message: response.data.message,
      });
      if (response.data.success) {
        fetchSellData();
        setInstallmentData((prev) => ({ ...prev, [sellId]: {} })); // Clear installment input for this sellId
      }
    } catch (error) {
      console.error("Error adding installment:", error);
      setResponse({ success: false, message: "Error adding installment." });
    }
  };

  const handleInstallmentInputChange = (sellId, field, value) => {
    setInstallmentData((prev) => ({
      ...prev,
      [sellId]: { ...(prev[sellId] || {}), [field]: value },
    }));
  };


  const handleEdit = (sellId, customerId, productId, sellDate) => {
    setFormData({
      customerId,
      productId,
      sellDate: new Date(sellDate).toISOString().split("T")[0], // Convert to yyyy-mm-dd format
      price: "", // Keep price blank for Sell Admin
      remark: "",
    });
    setSelectedSellId(sellId); // Track which sell record is being edited
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const data = {
      customerId: formData.customerId,
      productId: formData.productId,
      sellDate: formData.sellDate,
    };
  
    if (isSuperAdmin) {
      data.price = formData.price;
    }
  
    try {
      const token = sessionStorage.getItem("jwtToken");
      const url = selectedSellId
        ? `${process.env.REACT_APP_API_URL}/sell/${selectedSellId}`
        : `${process.env.REACT_APP_API_URL}/sell`;
      const method = selectedSellId ? "PUT" : "POST";
  
      const response = await axios({
        method,
        url,
        data: data,
        headers: { Authorization: `Bearer ${token}` },
      });
  
      setResponse({
        success: response.data.success,
        message: response.data.message,
      });
      if (response.data.success) {
        fetchSellData();
        clearForm();
      }
    } catch (error) {
      console.error("Error submitting sell form:", error);
      setResponse({ success: false, message: "Error updating sell record." });
    }
  };
  

  const clearForm = () => {
    setFormData({
      customerId: "",
      productId: "",
      sellDate: "",
      price: "",
      remark: "",
    });

    setSelectedSellId(null);
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Sell Master</h2>
      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className="block font-medium">Customer</label>
            <select
              name="customerId"
              value={formData.customerId}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            >
              <option value="">Select Customer</option>
              {customers.map((customer) => (
                <option key={customer.customerId} value={customer.customerId}>
                  {customer.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-medium">Product</label>
            <select
              name="productId"
              value={formData.productId}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            >
              <option value="">Select Product</option>
              {products.map((product) => (
                <option key={product.productId} value={product.productId}>
                  {product.productName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-medium">Sell Date</label>
            <input
              type="date"
              name="sellDate"
              value={formData.sellDate}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>
          {isSuperAdmin && (
            <div>
              <label className="block font-medium">Price</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
          )}
        </div>
        <div>
          <label className="block font-medium">Remark</label>
          <textarea
            name="remark"
            value={formData.remark}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>
        <div className="flex justify-center gap-4 mt-4">
          <button
            type="submit"
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          >
            Save
          </button>
          <button
            type="button"
            onClick={clearForm}
            className="bg-gray-400 text-white py-2 px-4 rounded hover:bg-gray-500"
          >
            Clear
          </button>
        </div>
      </form>
      <h2 className="text-xl font-bold mt-8">Sell Records</h2>
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-300 text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 border-b">Customer</th>
              <th className="py-2 px-4 border-b">Product</th>
              <th className="py-2 px-4 border-b">Sell Date</th>
              {isSuperAdmin && <th className="py-2 px-4 border-b">Price</th>}
              {isSuperAdmin && <th className="py-2 px-4 border-b">Paid</th>}
              {isSuperAdmin && <th className="py-2 px-4 border-b">Remaining</th>}
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sellData.map((sell) => (
              <tr key={sell.sellId} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b">{sell.customerName}</td>
                <td className="py-2 px-4 border-b">{sell.productName}</td>
                <td className="py-2 px-4 border-b">
                  {new Date(sell.sellDate).toLocaleDateString()}
                </td>
                {isSuperAdmin && <td className="py-2 px-4 border-b">{sell.price}</td>}
                {isSuperAdmin && <td className="py-2 px-4 border-b">{sell.totalPaid}</td>}
                {isSuperAdmin && <td className="py-2 px-4 border-b">{sell.balance}</td>}
                {isSuperAdmin && <td className="py-2 px-4 border-b">
                  <div className="space-y-2">
                    <button
                      onClick={() => fetchInstallmentHistory(sell.sellId)}
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full"
                    >
                      View Installments
                    </button>
                    <div className="space-y-1">
                      <input
                        type="number"
                        placeholder="Amount Paid"
                        value={installmentData[sell.sellId]?.amountPaid || ""}
                        onChange={(e) =>
                          handleInstallmentInputChange(
                            sell.sellId,
                            "amountPaid",
                            e.target.value
                          )
                        }
                        className="w-full border border-gray-300 rounded px-3 py-2"
                      />
                      <input
                        type="date"
                        placeholder="Payment Date"
                        value={installmentData[sell.sellId]?.paymentDate || ""}
                        onChange={(e) =>
                          handleInstallmentInputChange(
                            sell.sellId,
                            "paymentDate",
                            e.target.value
                          )
                        }
                        className="w-full border border-gray-300 rounded px-3 py-2"
                      />
                      <textarea
                        placeholder="Remark"
                        value={installmentData[sell.sellId]?.remark || ""}
                        onChange={(e) =>
                          handleInstallmentInputChange(
                            sell.sellId,
                            "remark",
                            e.target.value
                          )
                        }
                        className="w-full border border-gray-300 rounded px-3 py-2"
                      />
                      <button
                        onClick={() => handleAddInstallment(sell.sellId)}
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 w-full"
                      >
                        Add Installment
                      </button>
                    </div>
                  </div>
                </td>}
                {isSuperAdmin && <td className="py-2 px-4 border-b">
                  <button
                    onClick={() => handlePrintInvoice(sell)}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    Print Invoice
                  </button>
                </td>}
                <td>
                <button
            onClick={() =>
              handleEdit(sell.sellId, sell.customerId, sell.productId, sell.sellDate)
            }
            className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 w-full"
          >
            Edit Details
          </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {previewPDF && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded shadow-lg w-3/4">
            <h2 className="text-xl font-bold mb-4">Invoice Preview</h2>
            <iframe
              src={previewPDF}
              className="w-full h-96"
              title="PDF Preview"
              frameBorder="0"
            />
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setPreviewPDF(null)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 mr-2"
              >
                Close
              </button>
              <button
                onClick={handleDownloadPDF}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Download
              </button>
            </div>
          </div>
        </div>
      )}
          {showModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded shadow-lg w-3/4">
            <h2 className="text-xl font-bold mb-4">Installment History</h2>
            <table className="w-full border border-gray-300 text-left">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-4 border-b">Payment Date</th>
                  <th className="py-2 px-4 border-b">Amount Paid</th>
                  <th className="py-2 px-4 border-b">Remark</th>
                </tr>
              </thead>
              <tbody>
                {installmentHistory.map((installment, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b">
                      {new Date(installment.paymentDate).toLocaleDateString()}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {installment.amountPaid} Rs.
                    </td>
                    <td className="py-2 px-4 border-b">{installment.remark}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

