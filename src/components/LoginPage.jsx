import React, { useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      // Make a request to login API
      const response = await axios.post(`${process.env.REACT_APP_API_URL}auth/login`, {
        email,
        password,
      });

      const { token } = response.data;
      console.log("date: " , response.data);
      sessionStorage.setItem("jwtToken", token); // Save token

      // Decode the token to get roles
      const decoded = jwtDecode(token); // Correctly imported function
      console.log("Decoded token:", decoded); // Log the decoded token

      const userRoles = decoded.roles;

      console.log("userRoles: ", userRoles);

      // Redirect based on roles
      if (userRoles.includes("Sales Admin")) {
        window.location.href = "/sellMaster";
      } else if (userRoles.includes("Super Admin")) {
        window.location.href = "/employee";
      }
      else if (userRoles.includes("Challan Admin")) {
        window.location.href = "/challanMaster";
      }
      else {
        setError("Access Denied. No valid role assigned.");
      }
    } catch (err) {
      console.error("Error logging in:", err);
      setError("Invalid email or password.");
     
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Login</h2>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Login
        </button>
      </form>
    </div>
  );
}

export default LoginPage;
