// src/components/ProductCategory.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export default function ProductCategory() {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({ categoryName: "" });
  const [selectedId, setSelectedId] = useState(null);
  const [response, setResponse] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // 1️⃣ Fetch all categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/productCategory`);
      setCategories(res.data.data || []);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  // 2️⃣ Handle form submit (create or update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let res;
      if (selectedId) {
        res = await axios.put(
          `${process.env.REACT_APP_API_URL}/productCategory/${selectedId}`,
          formData
        );
      } else {
        res = await axios.post(
          `${process.env.REACT_APP_API_URL}/productCategory`,
          formData
        );
      }
      setResponse({ success: res.data.success, message: res.data.message || "Saved!" });
      setFormData({ categoryName: "" });
      setSelectedId(null);
      fetchCategories();
    } catch (err) {
      console.error("Error saving category:", err);
      setResponse({ success: false, message: "Save failed." });
    }
  };

  // 3️⃣ Prefill the form for editing
  const handleEdit = (cat) => {
    setSelectedId(cat.categoryId);
    setFormData({ categoryName: cat.categoryName });
    setResponse(null);
  };

  // 4️⃣ Soft‑delete a category
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    try {
      const res = await axios.delete(
        `${process.env.REACT_APP_API_URL}/productCategory/${id}`
      );
      setResponse({ success: res.data.success, message: res.data.message });
      fetchCategories();
    } catch (err) {
      console.error("Error deleting category:", err);
      setResponse({ success: false, message: "Delete failed." });
    }
  };

  // 5️⃣ Search filter
  const filtered = categories.filter((c) =>
    c.categoryName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Product Category Management</h2>

      {/* 📝 Form */}
      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <div>
          <label className="block font-medium">Category Name</label>
          <input
            type="text"
            name="categoryName"
            value={formData.categoryName}
            onChange={(e) => setFormData({ categoryName: e.target.value })}
            required
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>
        <div className="flex space-x-4">
          <button
            type="submit"
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
          >
            {selectedId ? "Update" : "Create"}
          </button>
          <button
            type="button"
            onClick={() => {
              setFormData({ categoryName: "" });
              setSelectedId(null);
              setResponse(null);
            }}
            className="bg-gray-400 text-white px-6 py-2 rounded hover:bg-gray-500"
          >
            Clear
          </button>
        </div>
      </form>

      {/* ⚠️ Feedback */}
      {response && (
        <div
          className={`mt-4 p-4 rounded-lg flex items-center space-x-2 ${
            response.success ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
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

      {/* 🔍 Search */}
      <input
        type="text"
        placeholder="Search Categories..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
      />

      {/* 📋 Category List */}
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-300 text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 border-b">#</th>
              <th className="py-2 px-4 border-b">Name</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((cat, idx) => (
                <tr key={cat.categoryId} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">{idx + 1}</td>
                  <td className="py-2 px-4 border-b">{cat.categoryName}</td>
                  <td className="py-2 px-4 border-b">
                    <button
                      onClick={() => handleEdit(cat)}
                      className="text-blue-500 hover:text-blue-700 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(cat.categoryId)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="py-2 px-4 text-center">
                  No categories found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
