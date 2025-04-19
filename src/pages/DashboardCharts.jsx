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

  useEffect(() => {
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

  return (<div className="space-y-8 p-4">
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box display="flex" gap={2} mb={4}>
        <DatePicker label="From" value={fromDate} onChange={newVal => setFromDate(newVal)} renderInput={params => <TextField {...params}/>}/>
        <DatePicker label="To" value={toDate} onChange={newVal => setToDate(newVal)} renderInput={params => <TextField {...params}/>}/>
      </Box>
    </LocalizationProvider>

    {/* Summary Cards */}
    <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
      <div className="p-6 bg-blue-100 rounded shadow">
        <h3 className="text-lg font-semibold">Total Challans</h3>
        <p className="text-3xl">{metrics.totalChallans}</p>
      </div>
      <div className="p-6 bg-green-100 rounded shadow">
        <h3 className="text-lg font-semibold">AMC Renewals (30d)</h3>
        <p className="text-3xl">{metrics.totalAMCrenewals}</p>
      </div>
      <div className="p-6 bg-yellow-100 rounded shadow">
        <h3 className="text-lg font-semibold">Machines Sold</h3>
        <p className="text-3xl">
          {metrics.salesByMachine.reduce((sum, m) => sum + m.sellCount, 0)}
        </p>
      </div>
      <div className="p-6 bg-red-100 rounded shadow">
        <h3 className="text-lg font-semibold">Overdue AMCs</h3>
        <p className="text-3xl text-red-700 font-bold">
          {metrics.overdueAMCs}
        </p>
      </div>
    </div>

    <div className="grid grid-cols-3 md:grid-cols-3 gap-4">
      <div className="bg-white p-4 rounded shadow mt-8">
        <h3 className="text-lg font-semibold mb-3">AMC Renewals (Weekly)</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={metrics.amcTrend}>
            <CartesianGrid strokeDasharray="3 3"/>
            <XAxis dataKey="week"/>
            <YAxis/>
            <Tooltip/>
            <Line type="monotone" dataKey="renewals" stroke="#1976d2" strokeWidth={2}/>
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="bg-white p-4 rounded shadow mt-6">
        <h3 className="text-lg font-semibold mb-3">
          Challans Issued (Weekly)
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={metrics.challanTrend}>
            <CartesianGrid strokeDasharray="3 3"/>
            <XAxis dataKey="week"/>
            <YAxis/>
            <Tooltip/>
            <Line type="monotone" dataKey="challans" stroke="#f57c00" strokeWidth={2}/>
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>

    {/* Bar Chart: Revenue by Machine */}
    <div className="h-64 bg-white rounded shadow p-4">
      <h4 className="font-semibold">Revenue by Machine</h4>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart data={metrics.salesByMachine} margin={{
            top: 20,
            right: 20
          }}>
          <XAxis dataKey="productName"/>
          <YAxis/>
          <Tooltip/>
          <Bar dataKey="totalRevenue" fill="#8884d8"/>
        </BarChart>
      </ResponsiveContainer>
    </div>

    <div className="bg-white p-4 rounded shadow mt-8">
      <h3 className="text-lg font-semibold mb-3">Top 5 Customers</h3>
      <table className="w-full border text-left">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-2 px-4">#</th>
            <th className="py-2 px-4">Customer</th>
            <th className="py-2 px-4">Total Spent</th>
          </tr>
        </thead>
        <tbody>
          {
            metrics.topCustomers
              ?.length
                ? (metrics.topCustomers.map((customer, index) => (<tr key={index} className="border-t hover:bg-gray-50">
                  <td className="py-2 px-4">{index + 1}</td>
                  <td className="py-2 px-4">{customer.customerName}</td>
                  <td className="py-2 px-4">
                    ₹ {
                      customer.totalSpent
                        ?.toLocaleString()
                    }
                  </td>
                </tr>)))
                : (<tr>
                  <td colSpan="3" className="py-4 text-center text-gray-400">
                    No customer data
                  </td>
                </tr>)
          }
        </tbody>
      </table>
    </div>

    {/* Pie Chart: Sales Distribution */}
    <div className="h-64 bg-white rounded shadow p-4">
      <h4 className="font-semibold">Sales Distribution</h4>
      <ResponsiveContainer width="100%" height="85%">
        <PieChart>
          <Pie data={metrics.salesByMachine} dataKey="sellCount" nameKey="productName" label="label" outerRadius={80}>
            {metrics.salesByMachine.map((entry, idx) => (<Cell key={idx} fill={COLORS[idx % COLORS.length]}/>))}
          </Pie>
          <Tooltip/>
        </PieChart>
      </ResponsiveContainer>
    </div>
  </div>);
}
