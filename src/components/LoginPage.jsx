import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/auth/login`, {
                email,
                password,
            });

          if (response.data.success) {
            console.log("response.data: ", response.data);
                const { token, user } = response.data;

                // Store token and user details in session storage
            sessionStorage.setItem("jwtToken", token);
            sessionStorage.setItem("userRole", response.data.user.role);
            sessionStorage.setItem("userPermissions", JSON.stringify(user.permissions || [])); // Save permissions
            console.log("Login successful! Redirecting...");
                navigate("/"); // Redirect to main dashboard
                window.location.reload(); // Refresh to update Navbar based on permissions
            } else {
                setError(response.data.message);
            }
        } catch (error) {
          console.log("Error logging in:", error);
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
};

export default LoginPage;
