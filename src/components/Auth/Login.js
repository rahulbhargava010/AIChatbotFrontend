import React, { useState, useEffect } from "react";
import { useAuth } from "./AuthContext"; // Import AuthContext
import { useNavigate } from "react-router-dom";
import api from "../config/axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Auth.css";

const Login = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/users/login", { email, password });
      const { token, user } = response.data;
      // console.log("USER:", user);
      login(token, user); // Call login function from AuthContext
      setMessage("Login successful! Redirecting...");
      setError("");
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to log in.");
      setMessage("");
    }
  };

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  return (
    <div className="auth-container d-flex justify-content-center align-items-center vh-100">
      <div className="auth-card p-4 shadow rounded bg-white">
        <h2 className="text-center text-primary mb-4">Login</h2>
        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-control"
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-control"
            />
          </div>
          <button type="submit" className="btn btn-primary w-100">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
