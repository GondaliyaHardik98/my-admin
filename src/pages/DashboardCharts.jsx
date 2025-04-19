import React, {useEffect, useState} from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  BarChart,
  CartesianGrid,
  
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  Legend
} from "chart.js";



import {Box, TextField} from "@mui/material";
import {DatePicker} from "@mui/x-date-pickers/DatePicker";
import {LocalizationProvider} from "@mui/x-date-pickers/LocalizationProvider";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Tooltip, Legend);


export default function DashboardCharts() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState(dayjs().startOf("month"));
  const [toDate, setToDate] = useState(dayjs());
  const [monthlyRevenue, setMonthlyRevenue] = useState(null);


  const [data, setData] = useState({
    summary: {},
    topCustomers: [],
    topProducts: [],
    topChallanProducts: [],
  });

  const userPermissions = JSON.parse(sessionStorage.getItem("userPermissions") || "[]");

  useEffect(() => {

    const permissions = JSON.parse(sessionStorage.getItem("userPermissions") || "[]");
    console.log("User permissions Dashbaord:", permissions);
    const from = fromDate.format("YYYY-MM-DD");
    const to = toDate.format("YYYY-MM-DD");
    setLoading(true);
    axios.get(`${process.env.REACT_APP_API_URL}/dashboard/metrics`, {
      params: {
        from,
        to
      },
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("jwtToken")}`
      }
    }).then(r => {
      setMetrics(r.data.data);
      setLoading(false);
    }).catch(console.error);

    const fetchData = async () => {
      const [customers, products, challans] = await Promise.all([
        axios.get(`${process.env.REACT_APP_API_URL}/dashboard/getTopCustomers`, {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("jwtToken")}`
          }
        }),
        axios.get(`${process.env.REACT_APP_API_URL}/dashboard/getTopChallanProducts`,{
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("jwtToken")}`
          }
        }),
        axios.get(`${process.env.REACT_APP_API_URL}/dashboard/getTopSoldProducts`,{
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("jwtToken")}`
          }
        }),
      ]);

      setData({
        topCustomers: customers.data.data,
        topProducts: products.data.data,
        topChallanProducts: challans.data.data,
      });
    };
    fetchData();

    const fetchRevenueTrend = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/dashboard/getMonthlyRevenueTrend`, {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("jwtToken")}`
          }
        })
        if (res.data.success) setMonthlyRevenue(res.data.data);

        console.log("Monthly Revenue Trend:", res.data.data);
      } catch (err) {
        console.error("Error fetching monthly revenue:", err);
      }
    };
    fetchRevenueTrend();    
    
  }, [fromDate, toDate]);

  if (loading) 
    return <p>Loading metrics…</p>;
  
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];
  const cardConfig = [
    {
      permission: "Challan Management",
      title: "Total Challans",
      key: "totalChallans",
      bg: "bg-blue-100",
      text: ""
    },
    {
      permission: "AMC Renewal Module",
      title: "AMC Renewals (30d)",
      key: "totalAMCrenewals",
      bg: "bg-green-100",
      text: ""
    },
    {
      permission: "Sell Management",
      title: "Machines Sold",
      key: "salesByMachine",
      bg: "bg-yellow-100",
      calc: (data) => data.reduce((sum, m) => sum + m.sellCount, 0)
    },
    {
      permission: "AMC Module",
      title: "Overdue AMCs",
      key: "overdueAMCs",
      bg: "bg-red-100",
      text: "text-red-700 font-bold"
    }
  ];
  

  return (<div className="space-y-8 p-4">
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box display="flex" gap={2} mb={4}>
        <DatePicker label="From" value={fromDate} onChange={newVal => setFromDate(newVal)} renderInput={params => <TextField {...params}/>}/>
        <DatePicker label="To" value={toDate} onChange={newVal => setToDate(newVal)} renderInput={params => <TextField {...params}/>}/>
      </Box>
    </LocalizationProvider>

    
    {userPermissions.includes("Payment Management") && metrics.paymentSummary &&  (
      <>
      <hr/>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="bg-green-100 p-4 rounded shadow text-center">
          <div className="text-sm font-semibold text-gray-600">Total Paid</div>
          <div className="text-3xl font-bold text-green-700">₹{metrics.paymentSummary.totalPaid}</div>
        </div>
        <div className="bg-blue-100 p-4 rounded shadow text-center">
          <div className="text-sm font-semibold text-gray-600">Total Due</div>
          <div className="text-3xl font-bold text-blue-700">₹{metrics.paymentSummary.totalDue}</div>
        </div>
        <div className="bg-red-100 p-4 rounded shadow text-center">
          <div className="text-sm font-semibold text-gray-600">Pending</div>
          <div className="text-3xl font-bold text-red-700">₹{metrics.paymentSummary.pending}</div>
        </div>
        </div>
        <hr />
        
        {monthlyRevenue && (
  <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-lg mt-10">
    <h3 className="text-xl font-semibold mb-4 text-zinc-800 dark:text-black tracking-wide">
      📈 Monthly Revenue Trend
    </h3>
    <Line
      data={{
        labels: monthlyRevenue.labels,
        datasets: [
          {
            label: "Revenue (₹)",
            data: monthlyRevenue.values,
            fill: true,
            borderColor: "#4f46e5", // indigo
            backgroundColor: "rgba(99, 102, 241, 0.1)",
            pointBackgroundColor: "#4f46e5",
            tension: 0.4
          }
        ]
      }}
      options={{
        responsive: true,
        plugins: {
          legend: {
            labels: {
              color: "#374151", // Tailwind slate-700
              font: { weight: "bold" }
            }
          },
          tooltip: {
            callbacks: {
              label: context => `₹${context.raw?.toLocaleString()}`
            }
          }
        },
        scales: {
          x: {
            ticks: { color: "#6b7280" } // gray-500
          },
          y: {
            beginAtZero: true,
            ticks: {
              callback: val => `₹${val}`,
              color: "#6b7280"
            }
          }
        }
      }}
    />
  </div>
)}

        </>
)}

    
<div className="bg-zinc-200 dark:bg-zinc-900 p-6 rounded-lg shadow-md mb-6">
  <h3 className="text-xl font-semibold mb-4 text-zinc-700 dark:text-white">🔟 Top Customers</h3>
  <ul className="space-y-2">
    {data.topCustomers.map((c, i) => (
      <li key={i} className="flex justify-between border-b border-dashed pb-2">
        <span className="text-zinc-600 dark:text-zinc-200">{c.customerName}</span>
        <span className="font-semibold text-green-600 dark:text-green-400">₹{c.totalPaid.toLocaleString()}</span>
      </li>
    ))}
  </ul>
    </div>
    
    <div className="bg-blue-50 grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
  {data.topProducts.map((p, i) => (
    <div key={i} className="bg-gradient-to-br from-indigo-200 to-indigo-400 p-4 rounded-lg shadow text-center">
      <div className="text-white font-semibold text-lg">{p.productName}</div>
      <div className="text-white text-sm mt-1">Sold: {p.quantitySold}</div>
    </div>
  ))}
    </div>
    
    <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-md mb-6">
  <h3 className="text-xl font-semibold mb-4 text-zinc-700 dark:text-white">📋 Top Challan Products</h3>
  <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {data.topChallanProducts.map((c, i) => (
      <li key={i} className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded shadow flex justify-between">
        <span className="text-zinc-700 dark:text-zinc-200">{c.productName}</span>
        <span className="font-semibold text-blue-600 dark:text-blue-300">₹{c.totalChallanAmount}</span>
      </li>
    ))}
  </ul>
</div>



 

    {/* Summary Cards */}
    <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
        {cardConfig
          .filter(c => userPermissions.includes(c.permission))
          .map((card, idx) => (
            <div key={idx} className={`p-6 ${card.bg} rounded shadow`}>
              <h3 className="text-lg font-semibold">{card.title}</h3>
              <p className={`text-3xl ${card.text || ""}`}>
                {card.calc
                  ? card.calc(metrics[card.key] || [])
                  : metrics[card.key] ?? 0}
              </p>
            </div>
          ))}
      </div>

      {/* AMC Chart */}
      {userPermissions.includes("AMC Renewal Module") && metrics.amcChart && (
        <div className="bg-white p-4 rounded shadow mt-8">
          <h3 className="text-lg font-semibold mb-3">AMC Renewals (Weekly)</h3>
          <Line
            data={{
              labels: metrics.amcChart.labels,
              datasets: [
                {
                  label: "Renewals",
                  data: metrics.amcChart.data,
                  fill: false,
                  borderColor: "#3b82f6",
                },
              ],
            }}
          />
        </div>
      )}

      {/* Challan Category Chart */}
      {userPermissions.includes("Challan Management") && metrics.challanCategoryChart && (
        <div className="bg-white p-4 rounded shadow mt-8">
          <h3 className="text-lg font-semibold mb-3">Challans by Category</h3>
          <Pie
            data={{
              labels: metrics.challanCategoryChart.labels,
              datasets: [
                {
                  label: "Challans",
                  data: metrics.challanCategoryChart.data,
                  backgroundColor: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"],
                },
              ],
            }}
          />
        </div>
      )}

      {/* Optional: Sales Bar Chart */}
    {userPermissions.includes("Sell Management") && metrics.salesChart && (
      <div className="bg-white p-4 rounded shadow mt-8">
        <h3 className="text-lg font-semibold mb-3">Sales (Last 12 Months)</h3>
        <Bar
          data={{
            labels: metrics.salesChart.labels,
            datasets: [
              {
                label: "Sales",
                data: metrics.salesChart.data,
                backgroundColor: "#3b82f6",
              },
            ],
          }}
        />
      </div>
    )}
  </div>);
}
