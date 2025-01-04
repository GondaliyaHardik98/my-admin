import React, { useState, useEffect } from "react";
import axios from "axios";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function ChallanMaster() {
  const [customers, setCustomers] = useState([]);
  const [engineers, setEngineers] = useState([]);
  const [products, setProducts] = useState([]);
  const [challanData, setChallanData] = useState([]);
  const [formData, setFormData] = useState({
    customerId: "",
    engineerId: "",
    challanDate: "",
    paymentType: "",
    products: [{ productId: "", price: "", remark: "" }],
  });
  const [response, setResponse] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editChallanId, setEditChallanId] = useState(null);
  const [previewPDF, setPreviewPDF] = useState(null);

  useEffect(() => {
    fetchDropdownData();
    fetchChallanData();
  }, []);

  const fetchDropdownData = async () => {
    try {
      const [customerRes, engineerRes, productRes] = await Promise.all([
        axios.get(`${process.env.REACT_APP_API_URL}/customer`),
        axios.get(`${process.env.REACT_APP_API_URL}/employees`),
        axios.get(`${process.env.REACT_APP_API_URL}/productAll`),
      ]);
      setCustomers(customerRes.data.data || []);
      setEngineers(engineerRes.data.data || []);
      setProducts(productRes.data.data || []);
    } catch (error) {
      console.error("Error fetching dropdown data:", error);
    }
  };

  const fetchChallanData = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/challan`
      );
      setChallanData(response.data.data || []);
    } catch (error) {
      console.error("Error fetching challan data:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProductChange = (index, field, value) => {
    const updatedProducts = [...formData.products]; // Clone the products array
    updatedProducts[index] = {
      ...updatedProducts[index],
      [field]: value, // Update the specific field
    };
  
    setFormData((prev) => ({
      ...prev,
      products: updatedProducts, // Update the form data with the modified products array
    }));
  };

  const addProductRow = () => {
    setFormData((prev) => ({
      ...prev,
      products: [...prev.products, { productId: "", price: "", remark: "" }],
    }));
  };

  const removeProductRow = (index) => {
    const updatedProducts = [...formData.products];
    updatedProducts.splice(index, 1);
    setFormData((prev) => ({ ...prev, products: updatedProducts }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setResponse(null);
      // if (isEditMode) {
      //   await axios.put(
      //     `${process.env.REACT_APP_API_URL}/challan/${editChallanId}`,
      //     formData
      //   );
      // } else {
      //   await axios.post(`${process.env.REACT_APP_API_URL}/challan`, formData);
      // }

      console.log("Products before submit:", formData.products);


      const formattedProducts = formData.products.map((p) => ({
        productId: p[0], // Replace with the correct index mapping
        price: p[1],
        remark: p[2],
      }));

      const _saveData = {
        customerId: formData.customerId,
        engineerId: formData.engineerId,
        challanDate: formData.challanDate,
        paymentType: formData.paymentType,
        products: formData.products.map((p) => ({
          productId: p.productId,
          price: p.price,
          remark: p.remark,
        })), // Ensure the mapping is correct
      };

      console.log(_saveData, "saveData");
      console.log(_saveData.products, "Products sent to backend");



      const url = editChallanId
      ? `${process.env.REACT_APP_API_URL}/challan/${editChallanId}`
      : `${process.env.REACT_APP_API_URL}/challan`;
      const method = editChallanId ? "PUT" : "POST";
      
      console.log(editChallanId, "checkid");
      console.log("Method: ", method);
      console.log("URL: ", url);

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(_saveData),
      });

      const data = await response.json();
      console.log("Response: " + data);
    


      setResponse({
        success: data.success,
        message: data.message,
      });
      if (data.success) {
        clearForm();
        fetchChallanData();
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setResponse({
        success: false,
        message: "Error saving challan. Please try again.",
      });
    }
  };

  const handlePrintInvoice = (challan) => {
    try {
      const doc = new jsPDF();
      const logoUrl = "https://example.com/logo.png"; // Replace with your actual logo URL or base64 string

      // Add Logo
      // doc.addImage(logoUrl, "PNG", 10, 10, 50, 20);

      // Title
      doc.setFontSize(16);
      doc.text("Challan Invoice", 105, 40, { align: "center" });

      // Invoice Details
      doc.setFontSize(12);
      doc.text(`Challan ID: ${challan.challanId}`, 20, 60);
      doc.text(`Challan Date: ${formatDate(challan.date)}`, 20, 70);
      doc.text(`Customer: ${challan.customerName}`, 20, 80);
      doc.text(`Engineer: ${challan.engineerName}`, 20, 90);
      doc.text(`Payment Type: ${challan.paymentType}`, 20, 100);

      // Table for Products
      const tableColumn = ["Product Name", "Price", "Remark"];
      const tableRows = challan.products.map((p) => [
        p.productName,
        `${p.price} Rs.`,
        p.remark || "-",
      ]);

      doc.autoTable({
        startY: 110,
        head: [tableColumn],
        body: tableRows,
      });

      // Save PDF to Preview
      const pdfOutput = doc.output("blob");
      const pdfURL = URL.createObjectURL(pdfOutput);
      setPreviewPDF(pdfURL);
    } catch (error) {
      console.error("Error generating PDF:", error);
      setResponse({ success: false, message: "Failed to generate PDF." });
    }
  };

  const handleDownloadPDF = () => {
    if (previewPDF) {
      const link = document.createElement("a");
      link.href = previewPDF;
      link.download = "Challan_Invoice.pdf";
      link.click();
      setPreviewPDF(null);
    }
  };

  const clearForm = () => {
    setFormData({
      customerId: "",
      engineerId: "",
      challanDate: "",
      paymentType: "",
      products: [{ productId: "", price: "", remark: "" }],
    });
    setIsEditMode(false);
    setEditChallanId(null);
  };

  const handleEdit = (challan) => {
    const date = new Date(challan.date);
    const formattedDate = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

    setIsEditMode(true);
    setEditChallanId(challan.challanId);
    setFormData({
      customerId: challan.customerId,
      engineerId: challan.engineerId,
      challanDate: formattedDate,
      paymentType: challan.paymentType,
      products: challan.products.map((p) => ({
        productId: p.productId,
        price: p.price,
        remark: p.remark,
      })),
    });
  };

  const handleDelete = async (challanId) => {
    if (window.confirm("Are you sure you want to delete this challan?")) {
      try {
        await axios.delete(
          `${process.env.REACT_APP_API_URL}/challan/${challanId}`
        );
        fetchChallanData();
      } catch (error) {
        console.error("Error deleting challan:", error);
      }
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Challan Master</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Form Fields */}
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
            <label className="block font-medium">Engineer</label>
            <select
              name="engineerId"
              value={formData.engineerId}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            >
              <option value="">Select Engineer</option>
              {engineers.map((engineer) => (
                <option key={engineer.engineerId} value={engineer.engineerId}>
                  {engineer.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-medium">Date</label>
            <input
              type="date"
              name="challanDate"
              value={formData.challanDate}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block font-medium">Payment Type</label>
            <select
              name="paymentType"
              value={formData.paymentType}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            >
              <option value="">Select Payment Type</option>
              <option value="Cash">Cash</option>
              <option value="Card">Card</option>
              <option value="Online">Online</option>
            </select>
          </div>
        </div>

        {/* Products Section */}
        <h3 className="text-xl font-medium mt-6">Products</h3>
        {formData.products.map((product, index) => (
          <div key={index} className="grid grid-cols-4 gap-4 items-center mb-4">
            <div>
              <label className="block font-medium">Product</label>
              <select
                value={product.productId}
                onChange={(e) =>
                  handleProductChange(index, "productId", e.target.value)
                }
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              >
                <option value="">Select Product</option>
                {products.map((p) => (
                  <option key={p.productId} value={p.productId}>
                    {p.productName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-medium">Price</label>
              <input
                type="number"
                value={product.price}
                onChange={(e) =>
                  handleProductChange(index, "price", e.target.value)
                }
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block font-medium">Remark</label>
              <input
                type="text"
                value={product.remark}
                onChange={(e) =>
                  handleProductChange(index, "remark", e.target.value)
                }
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
            <div>
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => removeProductRow(index)}
                  className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={addProductRow}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          + Add Product
        </button>

        {/* Form Buttons */}
        <div className="flex justify-center gap-4 mt-6">
          <button
            type="submit"
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          >
            {isEditMode ? "Update" : "Save"}
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
      {response && (
        <div
          className={`mt-4 p-4 rounded ${
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

      {/* Table Section */}
      <div className="mt-8">
        <h3 className="text-xl font-bold mb-4">Challan List</h3>
        <table className="w-full border border-gray-300 text-left">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">ID</th>
              <th className="py-2 px-4 border-b">Customer</th>
              <th className="py-2 px-4 border-b">Engineer</th>
              <th className="py-2 px-4 border-b">Date</th>
              <th className="py-2 px-4 border-b">Payment Type</th>
              <th className="py-2 px-4 border-b">Products</th>
              <th className="py-2 px-4 border-b">Actions</th>
              <th className="py-2 px-4 border-b">Print</th>
            </tr>
          </thead>
          <tbody>
            {challanData.map((challan) => (
              <tr key={challan.challanId}>
                <td className="py-2 px-4 border-b">{challan.challanId}</td>
                <td className="py-2 px-4 border-b">{challan.customerName}</td>
                <td className="py-2 px-4 border-b">{challan.engineerName}</td>
                <td className="py-2 px-4 border-b">
                  {formatDate(challan.date)}
                </td>
                <td className="py-2 px-4 border-b">{challan.paymentType}</td>
                <td className="py-2 px-4 border-b">
                  {challan.products.map((p) => (
                    <div key={p.productId}>
                      {p.productName} - ₹ {p.price}
                    </div>
                  ))}
                </td>
                <td className="py-2 px-4 border-b">
                  <button
                    onClick={() => handleEdit(challan)}
                    className="text-blue-500 hover:text-blue-700 mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(challan.challanId)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </td>
                <td className="py-2 px-4 border-b">
                  <button
                    onClick={() => handlePrintInvoice(challan)}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    Print Challan
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* PDF Preview Modal */}
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
      </div>
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
