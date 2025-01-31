import React, { useState, useEffect } from "react";
import axios from "axios";

function RuleSettings() {
  const [rules, setRules] = useState([]);
    const [formData, setFormData] = useState({ ruleText: "" });
    const [editingRuleId, setEditingRuleId] = useState(null); // Stores rule being edited


  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/rules`);
      setRules(Array.isArray(response.data.data) ? response.data.data : []);
    } catch (error) {
      console.error("Error fetching rules:", error);
      setRules([]);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ruleText: e.target.value });
    };
    
    const handleDeleteRule = async (id) => {
        if (!window.confirm("Are you sure you want to delete this rule?")) {
          return;
        }
    
        try {
          await axios.delete(`${process.env.REACT_APP_API_URL}/rules/${id}`);
          fetchRules();
        } catch (error) {
          console.error("Error deleting rule:", error);
        }
      };

  const handleSaveRule = async () => {
    if (!formData.ruleText.trim()) {
        alert("Please enter a valid rule.");
        return;
      }
  
      try {
        if (editingRuleId) {
          // **Update existing rule**
          await axios.put(`${process.env.REACT_APP_API_URL}/rules/${editingRuleId}`, formData);
          setEditingRuleId(null); // Reset editing state
        } else {
          // **Add new rule**
          await axios.post(`${process.env.REACT_APP_API_URL}/rules`, formData);
        }
  
        setFormData({ ruleText: "" });
        fetchRules();
      } catch (error) {
        console.error("Error saving rule:", error);
      }
  };

  const handleSelectRule = async (id) => {
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/rules/select/${id}`);
      fetchRules();
    } catch (error) {
      console.error("Error selecting rule:", error);
    }
    };
    
    const handleEditRule = (rule) => {
        setFormData({ ruleText: rule.ruleText });
        setEditingRuleId(rule.id);
      };
    
      const handleCancelEdit = () => {
        setEditingRuleId(null);
        setFormData({ ruleText: "" });
      };


  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Manage AMC Rules</h2>

      {/* Rule Input */}
      <div className="mb-4">
        <label className="block font-medium">Enter Rule</label>
        <textarea
          name="ruleText"
          value={formData.ruleText}
          onChange={handleInputChange}
          className="w-full border rounded p-2"
                  placeholder="Enter the rule for AMC printing..."
                  rows={20} // ✅ Sets the default height to 30 lines
  style={{ resize: "vertical" }} // ✅ Allows vertical resizing
        />
      </div>

      <button
        onClick={handleSaveRule}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        {editingRuleId ? "Update Rule" : "Add Rule"}
          </button>
          {editingRuleId && (
        <button onClick={handleCancelEdit} className="bg-gray-500 text-white px-4 py-2 rounded">
          Cancel
        </button>
      )}

      {/* Display Saved Rules */}
      <h3 className="text-xl font-bold mt-6">Saved Rules</h3>
      <table className="w-full mt-4 border">
        <thead>
          <tr>
            <th className="border p-2">Rule</th>
            <th className="border p-2">Select</th>
            <th className="border p-2">Actions</th>

          </tr>
        </thead>
        <tbody>
          {rules.length > 0 ? (
            rules.map((rule) => (
              <tr key={rule.id} className="border">
                <td className="p-2">{rule.ruleText}</td>
                <td className="p-2">
                  <button
                    onClick={() => handleSelectRule(rule.id)}
                    className={`px-4 py-1 rounded ${
                      rule.isSelected ? "bg-green-500 text-white" : "bg-gray-300"
                    }`}
                  >
                    {rule.isSelected ? "Selected" : "Select"}
                  </button>
                    </td>
                    <td className="p-2">
                  <button
                    onClick={() => handleEditRule(rule)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded mr-2"
                  >
                    Edit
                        </button>
                        <button
                    onClick={() => handleDeleteRule(rule.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="2" className="text-center p-4">
                No rules found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default RuleSettings;
