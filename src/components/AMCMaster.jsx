import React, { useState, useEffect } from "react";
import axios from "axios";
export default function AMCMaster() {
  const [amcData, setAmcData] = useState([]);
  useEffect(() => {
    fetchAMCData();
  }, []);

  const fetchAMCData = async () => {
    try {
      const getAllData = await axios.get("http://localhost:3002/api/amcdata");
      setAmcData(getAllData.data.data);
      console.log(getAllData.data.data, "getAllData");
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };
  return (
    <div className="container mx-auto mt-8 p-4 overflow-x-auto">
      <h2 className="text-xl font-semibold mb-4">Product List</h2>
      <table className="w-full border border-gray-300 text-left">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">ID</th>
            <th className="py-2 px-4 border-b">sell ID</th>
            <th className="py-2 px-4 border-b">Date</th>
            <th className="py-2 px-4 border-b">Remark</th>
          </tr>
        </thead>
        <tbody>
          {amcData.map((amc, index) => (
            <tr key={index} className="border-b">
              <td className="py-2 px-4">{index + 1}</td>
              <td className="py-2 px-4">{amc.sellId}</td>
              <td className="py-2 px-4">{amc.amcDate}</td>
              <td className="py-2 px-4">{amc.amcRemark}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
