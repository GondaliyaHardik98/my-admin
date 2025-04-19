import React, {useEffect, useState} from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  BarChart,
  CartesianGrid,
  Legend,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

import {Box, TextField} from "@mui/material";
import {DatePicker} from "@mui/x-date-pickers/DatePicker";
import {LocalizationProvider} from "@mui/x-date-pickers/LocalizationProvider";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

export default function DashboardCharts() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState(dayjs().startOf("month"));
  const [toDate, setToDate] = useState(dayjs());

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
