import React, {useState, useEffect} from "react";
import axios from "axios";
import {CheckCircle2, AlertCircle} from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function AMCRecord() {
  const [amcRecords, setAmcData] = useState([]);
  const [sellRecords, setSellRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [selectedAmcId, setSelectedAmcId] = useState(null);
  const [response, setResponse] = useState(null);
  const [formData, setFormData] = useState({
    sellId: "", // Selected sell record
    amcPrice: "", // AMC Price
    customerId: "", // Customer ID
    productId: "", // Product ID
    maintenanceStartDate: "", // Maintenance Start Date
    maintenanceEndDate: "", // Maintenance End Date
    amcProductName: "", // AMC Product Name
  });

  useEffect(() => {
    fetchAMCRecords();
    fetchSellRecords();
  }, []);

  const fetchAMCRecords = async () => {
    try {
      const token = sessionStorage.getItem("jwtToken");
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/amc`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log("AMC Records:", response.data.data);  
      setAmcData(response.data.data || []);
    } catch (error) {
      console.error("Error fetching AMC records:", error);
    }
  };

  const fetchSellRecords = async () => {
    try {
      const token = sessionStorage.getItem("jwtToken");
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/sell`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setSellRecords(response.data.data || []);
    } catch (error) {
      console.error("Error fetching sell records:", error);
    }
  };

  const calculateMonths = (s, e) => {

      // Parse the input dates into proper Date objects
    const startDate = new Date(s);
    const endDate = new Date(e);

    console.log("Parsed StartDate:", startDate);
    console.log("Parsed EndDate:", endDate);

    // Ensure startDate is before endDate
    if (startDate > endDate) {
      console.error("Error: Start date is after End date.");
      return 0; // Return 0 or handle the error appropriately
    }

    // Calculate the year and month difference
    const yearsDiff = endDate.getFullYear() - startDate.getFullYear();
    const monthsDiff = endDate.getMonth() - startDate.getMonth();

    // Calculate the total months difference
    const totalMonths = yearsDiff * 12 + monthsDiff;

    console.log("Total Months:", totalMonths + 1); // Include the starting month
    return totalMonths + 1; // Add 1 to include the starting month
  };

  const handlePrintAMCInvoice = amc => {
    const doc = new jsPDF();

   
    const totalMonths = calculateMonths(amc.maintenanceStartDate, amc.maintenanceEndDate);


    // Set title and header
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(18);
    doc.text("CONTRACT PAPER", 105, 20, null, null, "center");

    doc.setFontSize(12);
    const date = new Date();
    doc.text(`TO. ${amc.customerName} `, 20, 40);
    doc.text("DATE:          /      /20", 160, 40);

    doc.text("Contact No:-", 20, 50);
    doc.text(`No:- BT/${amc.amcId}`, 160, 50);

    doc.text(`M/C No:- ${amc.productId}`, 20, 60);

    // Draw table
    doc.autoTable({
      startY: 70,
      head: [
        [
          "NO",
          "Product name",
          "DESCRIPTION",
          "QTY",
          "RATE",
          "MONTH",
          "AMOUNT"
        ]
      ],
      body: [
        [
          "01",
          `${amc.productName}`,
          "ANNUAL MAINTENANCE CONTRACT\nCHARGE FOR SCANING MACHINE",
          "01",
          `${amc.amcPrice}`,
          `${totalMonths}`,
          `${amc.amcPrice * totalMonths}`
        ]
      ],
      theme: "grid",
      headStyles: {
        fillColor: [
          255, 255, 255
        ],
        textColor: [
          0, 0, 0
        ],
        halign: "center"
      },
      bodyStyles: {
        textColor: [
          0, 0, 0
        ],
        fontSize: 10
      }
    });

    // Add additional text
    doc.text(`TOTAL ${amc.amcPrice * totalMonths}`, 160, doc.lastAutoTable.finalY + 10);

    doc.text(`AMC PERIOD FROM DATE:  ${formatDate(amc.maintenanceStartDate)}  TO  ${formatDate(amc.maintenanceEndDate)}`, 20, doc.lastAutoTable.finalY + 20);

    doc.setFontSize(10);
    doc.text("CONDITION", 20, doc.lastAutoTable.finalY + 30);
    doc.text("1: THIS CONTRACT PAPER IS ONLY FOR MACHINE MAINTENANCE.", 20, doc.lastAutoTable.finalY + 40);
    doc.text("2: ENGINEER IS NOT RESPONSIBLE FOR DAMAGE ANY PART OF MACHINE DURING REPAIRING.", 20, doc.lastAutoTable.finalY + 50);
    doc.text("NOTE:- SUNDAY WE PROVIDE HALF-DAY SERVICE", 20, doc.lastAutoTable.finalY + 60);
    doc.text(": SUNDAY WE ACCEPT ONLY M/C SHUT DOWN COMPLAINT", 20, doc.lastAutoTable.finalY + 70);

    // Footer
    doc.setFont("Helvetica", "normal");
    doc.setTextColor(255, 0, 0);
    doc.text("CUSTOMER SIGN & STAMP", 20, 280);
    doc.text("FOR, Bharat Technology", 160, 280, null, null, "right");

    // Save PDF to Preview
    const pdfOutput = doc.output("blob");
    const pdfURL = URL.createObjectURL(pdfOutput);

    // Create a popup for preview
    const previewWindow = window.open(pdfURL, "_blank");
    previewWindow.focus();
  };

  const handleInputChange = e => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting form data:", formData);
  
    const token = sessionStorage.getItem("jwtToken");
    const url = selectedAmcId
      ? `${process.env.REACT_APP_API_URL}/amc/${selectedAmcId}` // Update API endpoint
      : `${process.env.REACT_APP_API_URL}/amc`; // Create API endpoint
  
    const method = selectedAmcId ? "put" : "post";
    console.log("Method: " + method);
    try {
     
      if (selectedAmcId) {
        const response = await axios({
          method,
          url,
          data: {
            amcId: selectedAmcId,
            amcProductName: formData.amcProductName,
            maintenanceStartDate: formData.maintenanceStartDate,
            maintenanceEndDate: formData.maintenanceEndDate,
            amcPrice: formData.amcPrice,
          },
          headers: { Authorization: `Bearer ${token}` },
        });
        setResponse({
          success: response.data.success,
          message: response.data.message,
        });
        if (response.data.success) {
          fetchAMCRecords(); // Refresh AMC records
          clearForm(); // Clear the form
        }
      } else {
        const response = await axios({
          method,
          url,
          data: {
            sellId: formData.sellId,
            amcProductName: formData.amcProductName,
            maintenanceStartDate: formData.maintenanceStartDate,
            maintenanceEndDate: formData.maintenanceEndDate,
            amcPrice: formData.amcPrice,
          },
          headers: { Authorization: `Bearer ${token}` },
         });
        
         setResponse({
          success: response.data.success,
          message: response.data.message,
         });
         if (response.data.success) {
          fetchAMCRecords(); // Refresh AMC records
          clearForm(); // Clear the form
        }
      }
    
  
    
  
     
    } catch (error) {
      console.error("Error submitting AMC form:", error);
      setResponse({
        success: false,
        message: "Error creating or updating AMC record.",
      });
    }
  };
  
  

  const handleUpdate = async () => {
    setResponse(null);
    try {
      const response = await axios.put(`${process.env.REACT_APP_API_URL}/amc`, selectedRecord);
      setResponse({success: response.data.success, message: response.data.message});
      if (response.data.success) {
        fetchAMCRecords();
        setSelectedRecord(null);
      }
    } catch (error) {
      console.error("Error updating AMC record:", error);
      setResponse({success: false, message: "Error updating AMC record. Please try again."});
    }
  };

  // Populate form for editing
  const handleEdit = (amc, recordId) => {

    const formatDate = (date) => {
      return date ? new Date(date).toISOString().split("T")[0] : ""; // Convert to YYYY-MM-DD format
    };
    setFormData({
      sellId: amc.sellId || "", // Selected sell record
      amcPrice: amc.amcPrice || "", // AMC price
      customerId: amc.customerId || "", // Customer ID for dropdown
      productId: amc.productId || "", // Product ID for dropdown
      maintenanceStartDate: formatDate(amc.maintenanceStartDate), // Format the start date
      maintenanceEndDate: formatDate(amc.maintenanceEndDate), // Format the end date
  
      amcProductName: amc.amcProductName || "", // AMC Product name
    });
    setSelectedAmcId(amc.amcId); // Set selected AMC record ID for editing
  }

  // Clear form
  const clearForm = () => {
    setFormData({
      sellId: "",
      amcPrice: "",
      customerId: "",
      productId: "",
      maintenanceStartDate: "",
      maintenanceEndDate: "",
      amcProductName: "",
    });
    setSelectedAmcId(null);
  };

  return (<div className="container mx-auto p-4">
    <h2 className="text-2xl font-bold mb-6">AMC Master</h2>

    {/* AMC Form */}
    <form onSubmit={handleSubmit} className="space-y-4 mb-8">
      <div className="grid grid-cols-2 gap-4">
        {/* Existing Dropdown for Sell/AMC Record */}
        <div>
          <label className="block font-medium">Select Record</label>
          <select name="sellId" value={formData.sellId} onChange={handleInputChange} className="w-full border border-gray-300 rounded px-3 py-2" required="required">
            <option value="">Select Sell or AMC Record</option>
            {
              sellRecords.map(sell => (<option key={`sell-${sell.sellId || Math.random()}`} value={`${sell.sellId}`}>
                Sell: {sell.customerName}
                - {sell.productName}
                ( {new Date(sell.sellDate).toLocaleDateString()})
              </option>))
            }
          </select>
        </div>
        <div>
          <label className="block font-medium">AMC Product Name</label>
          <input type="text" name="amcProductName" value={formData.amcProductName} onChange={handleInputChange} className="w-full border border-gray-300 rounded px-3 py-2" required />
        </div>
        <div>
          <label className="block font-medium">AMC Price</label>
          <input type="text" name="amcPrice" value={formData.amcPrice} onChange={handleInputChange} className="w-full border border-gray-300 rounded px-3 py-2" required />
        </div>
        {/* New Input Fields for Start and End Dates */}
        <div>
          <label className="block font-medium">Maintenance Start Date</label>
          <input type="date" name="maintenanceStartDate" value={formData.maintenanceStartDate} onChange={handleInputChange} className="w-full border border-gray-300 rounded px-3 py-2" required="required"/>
        </div>
        <div>
          <label className="block font-medium">Maintenance End Date</label>
          <input type="date" name="maintenanceEndDate" value={formData.maintenanceEndDate} onChange={handleInputChange} className="w-full border border-gray-300 rounded px-3 py-2" required="required"/>
        </div>
      </div>
      <div className="flex justify-center gap-4 mt-4">
        <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
          {
            selectedAmcId
              ? "Update AMC"
              : "Create AMC"
          }
        </button>
        <button type="button" onClick={clearForm} className="bg-gray-400 text-white py-2 px-4 rounded hover:bg-gray-500">
          Clear
        </button>
      </div>
    </form>

    {/* AMC Table */}
    <h2 className="text-xl font-bold mt-8">AMC Records</h2>
    <div className="overflow-x-auto">
      <table className="w-full border border-gray-300 text-left">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-2 px-4 border-b">Customer</th>
            <th className="py-2 px-4 border-b">Product</th>
            <th className="py-2 px-4 border-b">AMC Name</th>
            <th className="py-2 px-4 border-b">Sell Date</th>
            <th className="py-2 px-4 border-b">AMC Price</th>
            <th className="py-2 px-4 border-b">Actions</th>
            <th className="py-2 px-4 border-b">Print</th>
          </tr>
        </thead>
        <tbody>
          {
            amcRecords.map(amc => (<tr key={amc.amcId} className="hover:bg-gray-50">
              <td className="py-2 px-4 border-b">{amc.customerName}</td>
              <td className="py-2 px-4 border-b">{amc.productName}</td>
              <td className="py-2 px-4 border-b">{amc.amcProductName}</td>
              <td className="py-2 px-4 border-b">
                {new Date(amc.sellDate).toLocaleDateString()}
              </td>
              <td className="py-2 px-4 border-b">₹ {amc.amcPrice || 0}</td>
              <td className="py-2 px-4 border-b">
                <button onClick={() => handleEdit(amc)} className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 mr-2">
                  Edit
                </button>
              </td>
              <td>
                <button onClick={() => handlePrintAMCInvoice(amc)} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mr-2">
                  Print
                </button>
              </td>
            </tr>))
          }
        </tbody>
      </table>
    </div>
  </div>);
}

const formatDate = dateString => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
};
