import React, {useState, useEffect} from "react";
import axios from "axios";
import Select from "react-select";
import jsPDF from "jspdf";
import "jspdf-autotable";
import gujaratiFont from "../assets/NotoSansGujarati-Regular.js";

export default function AMCRenewal() {
  const [amcRenewals, setAmcRenewals] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedAmcId, setSelectedAmcId] = useState(null);
  const [response, setResponse] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [formData, setFormData] = useState({
    customerId: "",
    productId: "",
    amcProductName: "",
    amcPrice: "",
    maintenanceStartDate: "",
    maintenanceEndDate: ""
  });

  useEffect(() => {
    fetchCustomers();
    fetchProducts();
    fetchAMCRenewals();
  }, []);

  // Fetch customers for dropdown
  const fetchCustomers = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/amc-renewal/customers`);
      setCustomers(response.data.data.map(cust => ({value: cust.customerId, label: cust.name})));
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  // Fetch products for dropdown
  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/amc-renewal/products`);
      setProducts(response.data.data.map(prod => ({value: prod.productId, label: prod.productName})));
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  // Fetch AMC renewal records
  const fetchAMCRenewals = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/amc-renewal`);
      setAmcRenewals(response.data.data || []);
    } catch (error) {
      console.error("Error fetching AMC renewals:", error);
    }
  };

  // Handle form input changes
  const handleInputChange = e => {
    const {name, value} = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle dropdown changes
  const handleDropDownChange = (selectedOption, action) => {
    setFormData(prev => ({
      ...prev,
      [action.name]: selectedOption
        ? selectedOption.value
        : ""
    }));
  };

  // Handle form submission
  const handleSubmit = async e => {
    e.preventDefault();
    const token = sessionStorage.getItem("jwtToken");


    const url = selectedAmcId
      ? `${process.env.REACT_APP_API_URL}/amc-renewal/${selectedAmcId}`
      : `${process.env.REACT_APP_API_URL}/amc-renewal`;

    const method = selectedAmcId
      ? "put"
      : "post";

    try {
      console.log("FormData:", formData);
      const response = await axios({
        method,
        url,
        data: {
          amcId: selectedAmcId, 
          maintenanceStartDate: formData.maintenanceStartDate,
          maintenanceEndDate: formData.maintenanceEndDate,
          amcPrice: formData.amcPrice,
          amcProductName: formData.amcProductName
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setResponse({success: response.data.success, message: response.data.message});
      if (response.data.success) {
        fetchAMCRenewals();
        clearForm();
      }
    } catch (error) {
      console.error("Error submitting AMC renewal form:", error);
      setResponse({success: false, message: "Error creating or updating AMC renewal record."});
    }
  };

  // Handle editing an existing AMC renewal record
  const handleEdit = amc => {
    setFormData({
      customerId: amc.customerId, productId: amc.productId, amcProductName: amc.amcProductName, amcPrice: amc.amcPrice, maintenanceStartDate: amc.maintenanceStartDate.split("T")[0],
      maintenanceEndDate: amc.maintenanceEndDate.split("T")[0]
    });
    setSelectedAmcId(amc.amcId);
  };

  // Clear form
  const clearForm = () => {
    setFormData({
      customerId: "",
      productId: "",
      amcProductName: "",
      amcPrice: "",
      maintenanceStartDate: "",
      maintenanceEndDate: ""
    });
    setSelectedAmcId(null);
  };

  const handleSearch = e => {
    setSearchQuery(e.target.value);
  };

  const filteredRecords = amcRenewals.filter(amc => amc.customerName.toLowerCase().includes(searchQuery.toLowerCase()));

  const handlePrintAMCInvoice = async amc => {
    const ruleResponse = await axios.get(`${process.env.REACT_APP_API_URL}/rules`);

    const selectedRule = ruleResponse.data.data.find(r => r.isSelected);

    const isGujarati = /[\u0A80-\u0AFF]/.test(selectedRule.ruleText);

    const doc = new jsPDF();
    try {
      doc.addFileToVFS("NotoSansGujarati-Regular.ttf", gujaratiFont);
      doc.addFont("../assets/NotoSansGujarati-Regular.ttf", "Gujarati", "normal");
      console.log("Loaded Font Data:", gujaratiFont);
    } catch (err) {
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

    const totalMonths = calculateMonths(amc.maintenanceStartDate, amc.maintenanceEndDate);

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
          `${totalMonths}`,
          `${ ((amc.amcPrice / 12) * totalMonths).toFixed(2)}`
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
    doc.text(`TOTAL ${ ((amc.amcPrice / 12) * totalMonths).toFixed(2)}`, 160, yPosition);
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
    doc.text("FOR, Bharat Technology", 160, 280, null, null, "right");

    // Save PDF to Preview
    const pdfOutput = doc.output("blob");
    const pdfURL = URL.createObjectURL(pdfOutput);

    // Create a popup for preview
    const previewWindow = window.open(pdfURL, "_blank");
    previewWindow.focus();
  };

  return (<div className="container mx-auto p-4">
    <h2 className="text-2xl font-bold mb-6">AMC Renewal</h2>

    {/* AMC Renewal Form */}
    <form onSubmit={handleSubmit} className="space-y-4 mb-8">
      <div className="grid grid-cols-2 gap-4">
        {/* Customer Dropdown */}
        <div>
          <label className="block font-medium">Select Customer</label>
          <Select name="customerId" value={formData.customerId
              ? customers.find(c => c.value === formData.customerId)
              : null
} onChange={selected => handleDropDownChange(selected, {name: "customerId"})
} options={customers} required="required" placeholder="Select Customer"/>
        </div>

        {/* Product Dropdown */}
        <div>
          <label className="block font-medium">Select Product</label>
          <Select name="productId" value={formData.customerId
              ? products.find(p => p.value === formData.productId)
              : null
} onChange={selected => handleDropDownChange(selected, {name: "productId"})
} options={products} required="required" placeholder="Select Product"/>
        </div>

        {/* AMC Product Name */}
        <div>
          <label className="block font-medium">AMC Product Name</label>
          <input type="text" name="amcProductName" value={formData.amcProductName} onChange={handleInputChange} className="w-full border px-3 py-2 rounded" required="required"/>
        </div>

        {/* AMC Price */}
        <div>
          <label className="block font-medium">AMC Price</label>
          <input type="text" name="amcPrice" value={formData.amcPrice} onChange={handleInputChange} className="w-full border px-3 py-2 rounded" required="required"/>
        </div>

        {/* Start Date */}
        <div>
          <label className="block font-medium">Maintenance Start Date</label>
          <input type="date" name="maintenanceStartDate" value={formData.maintenanceStartDate} onChange={handleInputChange} className="w-full border px-3 py-2 rounded" required="required"/>
        </div>

        {/* End Date */}
        <div>
          <label className="block font-medium">Maintenance End Date</label>
          <input type="date" name="maintenanceEndDate" value={formData.maintenanceEndDate} onChange={handleInputChange} className="w-full border px-3 py-2 rounded" required="required"/>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-center gap-4 mt-4">
        <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded">
          {
            selectedAmcId
              ? "Update AMC"
              : "Create AMC"
          }
        </button>
        <button type="button" onClick={clearForm} className="bg-gray-400 text-white py-2 px-4 rounded">
          Clear
        </button>
      </div>
    </form>

    <input type="text" placeholder="Search AMC Records..." value={searchQuery} onChange={handleSearch} className="w-full border px-3 py-2 mb-4"/>
    <table className="w-full border text-left">
      <thead>
        <tr>
          <th>No</th>
          <th>Customer</th>
          <th>Product</th>
          <th>AMC Name</th>
          <th>AMC Price</th>
          <th>Start Date</th>
          <th>Actions</th>
          <th>Print</th>
        </tr>
      </thead>
      <tbody>
        {
          filteredRecords.length > 0
            ? (filteredRecords.map((amc, index) => (<tr key={amc.amcId}>
              <td>{index + 1}</td>
              <td>{amc.customerName}</td>
              <td>{amc.productName}</td>
              <td>{amc.amcProductName}</td>
              <td>{amc.amcPrice}</td>
              <td>
                {new Date(amc.maintenanceStartDate).toLocaleDateString()}
              </td>
              <td>
                <button onClick={() => handleEdit(amc)} className="bg-yellow-500 text-white px-4 py-2 rounded">
                  Edit
                </button>
                </td>
                <td><button onClick={() => handlePrintAMCInvoice(amc)} className="bg-green-500 text-white px-4 py-2 rounded">Print</button></td>
            </tr>)))
            : (<tr>
              <td colSpan="7" className="text-center">
                No records found.
              </td>
            </tr>)
        }
      </tbody>
    </table>
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
