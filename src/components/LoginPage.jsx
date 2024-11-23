import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const LoginPage = ({ setIsLoggedIn }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  // Static credentials and JWT token
  const validEmail = process.env.REACT_APP_LOGIN_EMAIL || "admin@example.com";
  const validPassword = process.env.REACT_APP_LOGIN_PASSWORD || "password123";
  const staticJwtToken =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbWluQGV4YW1wbGUuY29tIiwiaWF0IjoxNzE4NTA1NjAwLCJleHAiOjE3NTAwNDE2MDB9.abc123";

  const handleLogin = (e) => {
    e.preventDefault();

    if (email === validEmail && password === validPassword) {
      // Store JWT and email in session storage
      sessionStorage.setItem("jwtToken", staticJwtToken);
      sessionStorage.setItem("email", email);

      // Update isLoggedIn state and redirect to Employee
      setIsLoggedIn(true);
      navigate("/employee");
    } else {
      setErrorMessage("Invalid email or password.");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="w-full max-w-md p-6 bg-white border border-gray-300 shadow-md rounded">
        <h1 className="text-2xl font-bold text-center mb-6">Login</h1>
        {errorMessage && (
          <p className="text-red-500 text-center">{errorMessage}</p>
        )}
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label htmlFor="email" className="block font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded"
              autoComplete="current-password"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
