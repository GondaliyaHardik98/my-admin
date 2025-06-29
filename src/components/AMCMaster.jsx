import React, {useState, useEffect} from "react";
import axios from "axios";
import {CheckCircle2, AlertCircle} from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import Select from "react-select";
import WebFont from "webfontloader";
import gujaratiFont from "../assets/NotoSansGujarati-Regular.js";

export default function AMCRecord() {
  const [amcRecords, setAmcData] = useState([]);
  const [sellRecords, setSellRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [selectedAmcId, setSelectedAmcId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAmc, setSelectedAmc] = useState(null);
  const [selectedYear, setSelectedYear] = useState("");  // Stores the selected year
  const [availableYears, setAvailableYears] = useState([]); // Stores unique years

  const [editingPayment, setEditingPayment] = useState(null);

  const [response, setResponse] = useState(null);
  const [formData, setFormData] = useState({
    sellId: "", // Selected sell record
    amcPrice: "", // AMC Price
    customerId: "", // Customer ID
    productId: "", // Product ID
    maintenanceStartDate: "", // Maintenance Start Date
    maintenanceEndDate: "", // Maintenance End Date
    amcProductName: "" // AMC Product Name
  });

  const [expandedRow, setExpandedRow] = useState(null);
  const [paymentAmounts, setPaymentAmounts] = useState({}); // Store entered amounts for each AMC

  const [paymentHistory, setPaymentHistory] = useState({});
  const [newPayments, setNewPayments] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

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
      //console.log("AMC Records:", response.data.data);
      const records = response.data.data || [];
      setAmcData(records);


      const years = [...new Set(records.map(amc => new Date(amc.maintenanceStartDate).getFullYear()))];
      setAvailableYears(years.sort((a, b) => b - a)); // Sort in descending order (latest first)

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

      const productOptions = response.data.data.map(sell => ({
        value: sell.sellId,
        label: `${sell.customerName} - ${sell.productName}( ${new Date(sell.sellDate).toLocaleDateString()})`
      }));
      setSellRecords(productOptions);
    } catch (error) {
      console.error("Error fetching sell records:", error);
    }
  };

  const calculateMonthsAndDays = (s, e) => {
    // Parse the input dates into proper Date objects
    const startDate = new Date(s);
    const endDate = new Date(e);

    console.log("Parsed StartDate:", startDate);
    console.log("Parsed EndDate:", endDate);

    // Ensure startDate is before endDate
    if (startDate > endDate) {
        console.error("Error: Start date is after End date.");
        return { text: "Invalid Date Range", decimal: 0 }; // Handle the error appropriately
    }

    // Calculate the year and month difference
    const yearsDiff = endDate.getFullYear() - startDate.getFullYear();
    const monthsDiff = endDate.getMonth() - startDate.getMonth();

    // Calculate total months
    let totalMonths = yearsDiff * 12 + monthsDiff;

    // Calculate remaining days
    const tempStart = new Date(startDate);
    tempStart.setMonth(tempStart.getMonth() + totalMonths);

    let daysDiff = Math.floor((endDate - tempStart) / (1000 * 60 * 60 * 24));

    if (daysDiff < 0) {
        totalMonths -= 1;
        const prevMonthDate = new Date(tempStart);
        prevMonthDate.setMonth(prevMonthDate.getMonth() - 1);
        daysDiff = Math.floor((endDate - prevMonthDate) / (1000 * 60 * 60 * 24));
    }

    // Convert days to fraction of a month
    const daysInMonth = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0).getDate(); // Get total days in the last month
    const fractionalMonth = (daysDiff / daysInMonth).toFixed(2); // Convert days into decimal form
    const totalDecimalMonths = (totalMonths + parseFloat(fractionalMonth)).toFixed(2);

    console.log(`Total Duration: ${totalMonths} months ${daysDiff} days (Decimal: ${totalDecimalMonths})`);

    return {
        text: `${totalMonths} months ${daysDiff} days`,
        decimal: totalDecimalMonths
    };
};


  // const handlePrintAMCInvoice = async (amc) => {
  //   const doc = new jsPDF();
  //   const response = await axios.get(`${process.env.REACT_APP_API_URL}/amc/product-code/${amc.amcId}`);
  //   console.log("response: ", response);
  //   const productCode = response.data.data[0].productCode;
  //   console.log("response: productCode: ", productCode);

  //   const todayDate = new Date().toLocaleDateString()

  //   const totalMonths = calculateMonths(amc.maintenanceStartDate, amc.maintenanceEndDate);

  //   const pageWidth = doc.internal.pageSize.getWidth();  Get page width
  // const logoWidth = 120;  Desired logo width
  // const logoHeight = 25;  Desired logo height
  // const logoX = (pageWidth - logoWidth) / 2;  Center the logo horizontally

  // const logoUrl = `${window.location.origin}/logo.png`;  Path to the logo in the public folder

  // const img = new Image();
  // img.src = logoUrl;

  // await new Promise((resolve, reject) => {
  //   img.onload = () => {
  //     doc.addImage(img, "PNG", logoX, 10, logoWidth, logoHeight);  Add logo at the top center
  //     resolve();
  //   };
  //   img.onerror = (err) => reject(err);
  // });

  // let yPosition = 10 + logoHeight + 10;

  //    Set title and header
  //   doc.setFont("Helvetica", "bold");
  //   doc.setFontSize(18);
  //   doc.text("CONTRACT PAPER", 105, 20, null, null, "center");

  //   doc.line(20, 25, 200, 25);

  //   doc.setFontSize(12);
  //   const date = new Date();
  //   doc.text(`TO. ${amc.customerName} `, 20, 65);
  //   doc.text(`DATE: ${formatDate(new Date())}` , 160, 65);

  //   doc.text("Contact No:-", 20, 50);
  //   doc.text(`No:- BT/${amc.amcId}`, 160, 50);

  //   doc.text(`M/C No:- ${productCode}`, 20, 60);

  //    Draw table
  //   doc.autoTable({
  //     startY: 70,
  //     head: [
  //       [
  //         "NO",
  //         "Product name",
  //         "DESCRIPTION",
  //         "QTY",
  //         "RATE",
  //         "MONTH",
  //         "AMOUNT"
  //       ]
  //     ],
  //     body: [
  //       [
  //         "01",
  //         `${amc.productName}`,
  //         "ANNUAL MAINTENANCE CONTRACT\nCHARGE FOR SCANING MACHINE",
  //         "01",
  //         `${amc.amcPrice}`,
  //         `${totalMonths}`,
  //         `${((amc.amcPrice/12) * totalMonths).toFixed(2)}`
  //       ]
  //     ],
  //     theme: "grid",
  //     headStyles: {
  //       fillColor: [
  //         255, 255, 255
  //       ],
  //       textColor: [
  //         255, 0, 0
  //       ],
  //       halign: "center",
  //       lineWidth: 0.05,  Add border line width
  //       lineColor: [0, 0, 0],  Black border color
  //     },
  //     bodyStyles: {
  //       textColor: [
  //         0, 0, 0
  //       ],
  //       fontSize: 10,
  //       lineWidth: 0.05,  Add border line width
  //       lineColor: [0, 0, 0],  Black border color
  //     }
  //   });

  //    Add additional text
  //   doc.text(`TOTAL ${((amc.amcPrice / 12) * totalMonths).toFixed(2)}`, 160, doc.lastAutoTable.finalY + 10);

  //   doc.setTextColor(0, 0, 255);

  //   doc.text(`AMC PERIOD FROM DATE:`, 20, doc.lastAutoTable.finalY + 20 );
  //   doc.setTextColor(0, 0, 0);

  //   doc.text(`${formatDate(amc.maintenanceStartDate)}  TO  ${formatDate(amc.maintenanceEndDate)}`, 76, doc.lastAutoTable.finalY + 20);

  //   doc.setFontSize(12);

  //   doc.setTextColor(255, 0, 0);
  //   doc.text("CONTRACT PAPER", 105, 20, null, null, "center");
  //   doc.text("CONDITION", 80, doc.lastAutoTable.finalY + 40, null, null, "center");
  //   doc.setTextColor(0, 0, 0);

  //   doc.setFontSize(10);

  //   doc.text("1: THIS CONTRACT PAPER IS ONLY FOR MACHINE MAINTENANCE.", 20, doc.lastAutoTable.finalY + 50);
  //   doc.text("2: ENGINEER IS NOT RESPONSIBLE FOR DAMAGE ANY PART OF MACHINE DURING REPAIRING.", 20, doc.lastAutoTable.finalY + 60);
  //   doc.setTextColor(255, 0, 0);

  //   doc.text("NOTE", 20, doc.lastAutoTable.finalY + 75);
  //   doc.setTextColor(0, 0, 0);

  //   doc.text(":- SUNDAY WE PROVIDE HALF-DAY SERVICE", 40, doc.lastAutoTable.finalY + 75);
  //   doc.text(": SUNDAY WE ACCEPT ONLY M/C SHUT DOWN COMPLAINT", 40, doc.lastAutoTable.finalY + 85);

  //    Footer
  //   doc.setFont("Helvetica", "normal");
  //   doc.setTextColor(255, 0, 0);
  //   doc.text("CUSTOMER SIGN & STAMP", 20, 280);
  //   doc.text("FOR, Bharat Technology", 160, 280, null, null, "right");

  //    Save PDF to Preview
  //   const pdfOutput = doc.output("blob");
  //   const pdfURL = URL.createObjectURL(pdfOutput);

  //    Create a popup for preview
  //   const previewWindow = window.open(pdfURL, "_blank");
  //   previewWindow.focus();
  // };

  const handlePrintAMCInvoice = async (amc)=> {
    const ruleResponse = await axios.get(`${process.env.REACT_APP_API_URL}/rules`);

    const selectedRule = ruleResponse.data.data.find(r => r.isSelected);

    const isGujarati = /[\u0A80-\u0AFF]/.test(selectedRule.ruleText);


    const doc = new jsPDF();
    try {
      doc.addFileToVFS("NotoSansGujarati-Regular.ttf", gujaratiFont);
      doc.addFont("../assets/NotoSansGujarati-Regular.ttf", "Gujarati", "normal");
      console.log("Loaded Font Data:", gujaratiFont);
    }catch(err){
      console.error("Error loading font:", err);
      return;
    }


    const pageWidth = doc.internal.pageSize.getWidth();
    const logoWidth = 120;
    const logoHeight = 20;
    const logoX = (pageWidth - logoWidth) / 2;

    const logoUrl = `${window.location.origin}/logo.png`;

    const img = new Image();
    img.src = logoUrl;

    await new Promise((resolve, reject) => {
      img.onload = () => {
        doc.addImage(img, "PNG", logoX, 10, logoWidth, logoHeight);
        resolve();
      };
      img.onerror = err => reject(err);
    });

    // Starting y-position after the logo
    let yPosition = 10 + logoHeight + 15; // Logo height + spacing

    // Title and header
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(18);
    doc.text("CONTRACT PAPER", 105, yPosition, null, null, "center");
    yPosition += 10;

    doc.line(20, yPosition, 200, yPosition);
    yPosition += 10;

    doc.setFontSize(12);
    doc.text(`TO. ${amc.customerName} `, 20, yPosition);
    doc.text(`DATE: ${formatDate(new Date())}`, 160, yPosition);
    yPosition += 10;

    doc.text("Contact No:-", 20, yPosition);
    doc.text(`No:- BT/${amc.amcId}`, 160, yPosition);
    yPosition += 10;

    const response = await axios.get(`${process.env.REACT_APP_API_URL}/amc/product-code/${amc.amcId}`);
    const productCode = response.data.data[0].productCode;
    doc.text(`M/C No:- ${productCode}`, 20, yPosition);
    yPosition += 10;

    //const totalMonths = calculateMonthsAndDays(amc.maintenanceStartDate, amc.maintenanceEndDate);
    const { text: totalMonthsText, decimal: totalDecimalMonths } = calculateMonthsAndDays(amc.maintenanceStartDate, amc.maintenanceEndDate);


    // Table
    doc.autoTable({
      startY: yPosition,
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
          `${totalMonthsText}`,
          `${ ((amc.amcPrice / 12) * totalDecimalMonths).toFixed(2)}`
        ]
      ],
      theme: "grid",
      headStyles: {
        fillColor: [
          255, 255, 255
        ],
        textColor: [
          255, 0, 0
        ],
        halign: "center",
        lineWidth: 0.05,
        lineColor: [0, 0, 0]
      },
      bodyStyles: {
        textColor: [
          0, 0, 0
        ],
        fontSize: 10,
        lineWidth: 0.05,
        lineColor: [0, 0, 0]
      }
    });

    yPosition = doc.lastAutoTable.finalY + 10;

    // Additional text
    doc.text(`TOTAL ${ ((amc.amcPrice / 12) * totalDecimalMonths).toFixed(2)}`, 160, yPosition);
    yPosition += 10;

    doc.setTextColor(0, 0, 255);
    doc.text("AMC PERIOD FROM DATE:", 20, yPosition);
    doc.setTextColor(0, 0, 0);
    doc.text(`${formatDate(amc.maintenanceStartDate)}  TO  ${formatDate(amc.maintenanceEndDate)}`, 76, yPosition);
    yPosition += 20;

    doc.setFontSize(12);
    doc.setTextColor(255, 0, 0);
    doc.text("CONDITION", 105, yPosition, null, null, "center");
    doc.setTextColor(0, 0, 0);
    yPosition += 10;

    if (selectedRule) {
      if (isGujarati) {
        doc.setFont("Gujarati");
      } else {
        doc.setFont("Helvetica");
      }
      const ruleText = selectedRule.ruleText;
      const marginLeft = 20;
      const pageWidth = 150; // Maximum text width before wrapping
      const lineHeight = 8;

      let splitText = doc.splitTextToSize(ruleText, pageWidth);
      doc.text(splitText, marginLeft, yPosition);
    }

    // Footer
    doc.setFont("Helvetica", "normal");
    doc.setTextColor(255, 0, 0);
    doc.text("CUSTOMER SIGN & STAMP", 20, 280);
    doc.text("FOR, BHARAT TECHNOLOGY", 160, 280, null, null, "right");

    // Save PDF to Preview
    const pdfOutput = doc.output("blob");
    const pdfURL = URL.createObjectURL(pdfOutput);

    // Create a popup for preview
    const previewWindow = window.open(pdfURL, "_blank");
    previewWindow.focus();


  };

  const handleInputChange = e => {
    const {name, value} = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    console.log("Submitting form data:", formData);

    const token = sessionStorage.getItem("jwtToken");
    const url = selectedAmcId
      ? `${process.env.REACT_APP_API_URL}/amc/${selectedAmcId}` // Update API endpoint
      : `${process.env.REACT_APP_API_URL}/amc`; // Create API endpoint

    const method = selectedAmcId
      ? "put"
      : "post";
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
            amcPrice: formData.amcPrice
          },
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setResponse({success: response.data.success, message: response.data.message});
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
            amcPrice: formData.amcPrice
          },
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setResponse({success: response.data.success, message: response.data.message});
        if (response.data.success) {
          fetchAMCRecords(); // Refresh AMC records
          clearForm(); // Clear the form
        }
      }
    } catch (error) {
      console.error("Error submitting AMC form:", error);
      setResponse({success: false, message: "Error creating or updating AMC record."});
    }
  };

  const fetchPaymentHistory = async (amcId) => {
    try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/amc/payment-history/${amcId}`);
        console.log("Payment History:", response.data.data);
        setPaymentHistory({ [amcId]: Array.isArray(response.data.data) ? response.data.data : [] });
        setSelectedAmc(amcId);
        setIsModalOpen(true);
    } catch (error) {
        console.error("Error fetching payment history:", error);
        setPaymentHistory({ [amcId]: [] });
    }
};



  const togglePaymentHistory = async (amcId) => {
    if (expandedRow === amcId) {
      setExpandedRow(null);
    } else {
      const payments = await fetchPaymentHistory(amcId);
      setAmcData((prevRecords) =>
        prevRecords.map((record) =>
          record.amcId === amcId ? { ...record, payments } : record
        )
      );
      setExpandedRow(amcId);
    }
  };

  const handlePaymentChange = (amcId, value) => {
    setPaymentAmounts({ ...paymentAmounts, [amcId]: value });
  };

  const submitPayment = async (amcId) => {
    const amountPaid = paymentAmounts[amcId];
    if (!amountPaid || isNaN(amountPaid) || amountPaid <= 0) {
      alert("Please enter a valid payment amount.");
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/amc/payment/${amcId}`,
        { amountPaid },
        { headers: { Authorization: `Bearer ${sessionStorage.getItem("jwtToken")}` } }
      );

      if (response.data.success) {
        alert("Payment recorded successfully.");
        setPaymentAmounts({ ...paymentAmounts, [amcId]: "" });
        togglePaymentHistory(amcId);
        fetchAMCRecords(); // Refresh AMC data to update total paid & remaining balance
      }
    } catch (error) {
      console.error("Error adding payment:", error);
    }
  };

  const handleDropDownChange = (selectedOption, action) => {
    const {name} = action; // Extract 'name' from action
    const value = selectedOption
      ? selectedOption.value
      : ""; // Get value from selected option
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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

  const handlePaymentSubmit = async (amcId) => {
    console.log("Submitting payment for AMC:", amcId);
    if (!newPayments[amcId]) return;

    try {
    const response =   await axios.post(`${process.env.REACT_APP_API_URL}/amc/payments`, {
        amcId,
        amountPaid: newPayments[amcId],
        paymentDate: new Date().toISOString().split("T")[0],
        paymentMethod: "Cash",
      });
      
      console.log("Payment Response:", response.data);

      setNewPayments((prev) => ({ ...prev, [amcId]: "" }));
      fetchPaymentHistory(amcId);
    } catch (error) {
      console.error("Error adding payment:", error);
    }
  };

  // Populate form for editing
  const handleEdit = (amc, recordId) => {
    const formatDate = date => {
      return date
        ? new Date(date).toISOString().split("T")[0]
        : ""; // Convert to YYYY-MM-DD format
    };
    setFormData({
      sellId: amc.sellId || "", // Selected sell record
      amcPrice: amc.amcPrice || "", // AMC price
      customerId: amc.customerId || "", // Customer ID for dropdown
      productId: amc.productId || "", // Product ID for dropdown
      maintenanceStartDate: formatDate(amc.maintenanceStartDate), // Format the start date
      maintenanceEndDate: formatDate(amc.maintenanceEndDate), // Format the end date

      amcProductName: amc.amcProductName || "" // AMC Product name
    });
    setSelectedAmcId(amc.amcId); // Set selected AMC record ID for editing
  };

  // Clear form
  const clearForm = () => {
    setFormData({
      sellId: "",
      amcPrice: "",
      customerId: "",
      productId: "",
      maintenanceStartDate: "",
      maintenanceEndDate: "",
      amcProductName: ""
    });
    setSelectedAmcId(null);
  };

  const handleSearch = event => {
    //console.log("Search Query:", event.target.value);
    setSearchQuery(event.target.value);
  };

  // Filtered records based on search query
  const filteredRecords = amcRecords.filter(amc => {
    const amcYear = new Date(amc.maintenanceStartDate).getFullYear();
    return (
        amc.customerName.toLowerCase().includes(searchQuery.toLowerCase()) &&
        (selectedYear === "" || amcYear.toString() === selectedYear)
    );
});
  // Object.values(amc).some(
  //   (value) =>
  //     typeof value === "string" &&
  //     value.toLowerCase().includes(searchQuery.toLowerCase())
  // ));


  const handleDelete = async (id) => {
  if (!window.confirm("Are you sure you want to delete this record?")) return;

  try {
    const token = sessionStorage.getItem("jwtToken");
    const res = await axios.delete(`${process.env.REACT_APP_API_URL}/amc/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    alert(res.data.message);
    fetchAMCRecords(); // or fetchAMCs or fetchRenewals
  } catch (err) {
    alert(err.response?.data?.message || "Error deleting");
  }
  };
  

  const updatePayment = async (paymentId) => {
    try {
      const token = sessionStorage.getItem("jwtToken");
      await axios.put(`${process.env.REACT_APP_API_URL}/amc/payment/${paymentId}`, editingPayment, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Payment updated.");
      setEditingPayment(null);
      fetchPaymentHistory(selectedAmc);
    } catch (error) {
      alert("Error updating payment.");
    }
  };

  const deletePayment = async (paymentId) => {
    if (!window.confirm("Delete this payment?")) return;
    try {
      const token = sessionStorage.getItem("jwtToken");
      await axios.delete(`${process.env.REACT_APP_API_URL}/amc/payment/${paymentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Payment deleted.");
      fetchPaymentHistory(selectedAmc);
    } catch (error) {
      alert("Error deleting payment.");
    }
  };



  return (<div className="container mx-auto p-4">
    <h2 className="text-2xl font-bold mb-6">AMC Master</h2>

    {/* AMC Form */}
    <form onSubmit={handleSubmit} className="space-y-4 mb-8">
      <div className="grid grid-cols-2 gap-4">
        {/* Existing Dropdown for Sell/AMC Record */}
        <div>
          <label className="block font-medium">Select Record</label>
          <Select name="sellId" value={formData.sellId
              ? sellRecords.find(sellRecord => sellRecord.value === formData.sellId)
              : null
} onChange={selectedOption => handleDropDownChange(selectedOption, {name: "sellId"})
} className="w-full border border-gray-300 rounded px-3 py-2" required="required" options={sellRecords}/>
        </div>
        <div>
          <label className="block font-medium">AMC Product Name</label>
          <input type="text" name="amcProductName" value={formData.amcProductName} onChange={handleInputChange} className="w-full border border-gray-300 rounded px-3 py-2" required="required"/>
        </div>
        <div>
          <label className="block font-medium">AMC Price</label>
          <input type="text" name="amcPrice" value={formData.amcPrice} onChange={handleInputChange} className="w-full border border-gray-300 rounded px-3 py-2" required="required"/>
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

    <div className="flex gap-4 mb-4">
    {/* Search Box */}
    <input 
        type="text" 
        placeholder="Search AMC Records..." 
        value={searchQuery} 
        onChange={handleSearch} 
        className="border border-gray-300 rounded px-3 py-2 w-full"
    />

    {/* Year Dropdown */}
    <select 
        value={selectedYear} 
        onChange={(e) => setSelectedYear(e.target.value)} 
        className="border border-gray-300 rounded px-3 py-2"
    >
        <option value="">All Years</option> 
        {availableYears.map(year => (
            <option key={year} value={year}>{year}</option>
        ))}
    </select>
</div>

    <div className="overflow-x-auto">
      <table className="w-full border border-gray-300 text-left">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-2 px-4 border-b">No</th>
            <th className="py-2 px-4 border-b">Customer</th>
            <th className="py-2 px-4 border-b">Product</th>
            <th className="py-2 px-4 border-b">AMC Name</th>
            <th className="py-2 px-4 border-b">Sell Date</th>
            <th className="py-2 px-4 border-b">AMC Price</th>
            <th className="py-2 px-4 border-b">AMC Start Date</th>
            <th className="py-2 px-4 border-b">Payment Status</th>
            <th className="py-2 px-4 border-b">Actions</th>
            <th className="py-2 px-4 border-b">Print</th>
            <th className="py-2 px-4 border-b">Delete</th>

          </tr>
        </thead>
        <tbody>
          {
            filteredRecords.length > 0
              ? (filteredRecords.map((amc, index) => (<tr key={amc.amcId} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b">{index + 1}</td>
                <td className="py-2 px-4 border-b">{amc.customerName}</td>
                <td className="py-2 px-4 border-b">{amc.productName}</td>
                <td className="py-2 px-4 border-b">{amc.amcProductName}</td>
                <td className="py-2 px-4 border-b">
                  {new Date(amc.sellDate).toLocaleDateString()}
                </td>
                <td className="py-2 px-4 border-b">₹ {amc.amcPrice || 0}</td>
                <td className="py-2 px-4 border-b">
                  {" "}
                  {new Date(amc.maintenanceStartDate).toLocaleDateString()}
                </td>
                <td>
                <button className="btn btn-info btn-sm" onClick={() => fetchPaymentHistory(amc.amcId)}>
                  View Payments
                </button>
                <input
                  type="number"
                  placeholder="Amount"
                  value={newPayments[amc.amcId] || ""}
                  onChange={(e) => setNewPayments((prev) => ({ ...prev, [amc.amcId]: e.target.value }))}
                  className="form-control form-control-sm mt-1"
                />
                <button className="btn btn-success btn-sm mt-1" onClick={() => handlePaymentSubmit(amc.amcId)}>
                  Add Payment
                </button>
              </td>
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
                <td>
                  <button
                    onClick={() => handleDelete(amc.amcId)}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  >
                    Delete
                  </button>

                </td>
              </tr>)))
              : (<tr>
                <td colSpan="9" className="py-2 px-4 border-b text-center">
                  No records found.
                </td>
              </tr>)
          }
        </tbody>
      </table>
    </div>

    {/* Modal */}
    {isModalOpen && selectedAmc && (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg w-96 max-h-[80vh] overflow-y-auto">
          <h3 className="text-xl font-bold mb-4">Payment History</h3>

          {Array.isArray(paymentHistory[selectedAmc]) && paymentHistory[selectedAmc].length > 0 ? (
            <ul>
              {paymentHistory[selectedAmc].map((payment) => (
                <li key={payment.paymentId} className="border-b py-2 flex flex-col gap-2">
                  {editingPayment?.paymentId === payment.paymentId ? (
                    <>
                      <input
                        type="number"
                        value={editingPayment.amountPaid}
                        onChange={(e) => setEditingPayment({ ...editingPayment, amountPaid: e.target.value })}
                        className="border px-2 py-1 rounded"
                      />
                      <input
                        type="text"
                        value={editingPayment.paymentMethod || ""}
                        onChange={(e) => setEditingPayment({ ...editingPayment, paymentMethod: e.target.value })}
                        className="border px-2 py-1 rounded"
                      />
                      <input
                        type="text"
                        value={editingPayment.remark || ""}
                        onChange={(e) => setEditingPayment({ ...editingPayment, remark: e.target.value })}
                        className="border px-2 py-1 rounded"
                      />
                      <div className="flex gap-2">
                        <button onClick={() => updatePayment(payment.paymentId)} className="bg-green-500 text-white px-2 py-1 rounded">Save</button>
                        <button onClick={() => setEditingPayment(null)} className="bg-gray-400 text-white px-2 py-1 rounded">Cancel</button>
                      </div>
                    </>
                  ) : (
                    <>
                      <span>{formatDate(payment.paymentDate)} - ₹{payment.amountPaid}</span>
                      <div className="flex gap-2">
                        <button onClick={() => setEditingPayment(payment)} className="text-yellow-600 hover:underline">Edit</button>
                        <button onClick={() => deletePayment(payment.paymentId)} className="text-red-600 hover:underline">Delete</button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p>No payments recorded.</p>
          )}

          <button
            className="bg-red-500 text-white px-4 py-2 mt-4 rounded"
            onClick={() => {
              setIsModalOpen(false);
              setEditingPayment(null);
            }}
          >
            Close
          </button>
        </div>
      </div>
  )}



  </div>);
}

const formatDate = dateString => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
};
