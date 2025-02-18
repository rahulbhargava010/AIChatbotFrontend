import React, { useState } from "react";
import { useAuth } from "./AuthContext"; // Import AuthContext
import { useNavigate } from "react-router-dom";
import api from "../config/axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Auth.css";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/users/login", { email, password });
      login(response.data.token); // Call login function from AuthContext
      setMessage("Login successful! Redirecting...");
      setError("");
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to log in.");
      setMessage("");
    }
  };

    return (
        <div className="container-fluid vh-100 d-flex justify-content-center align-items-center auth-container">
        <div className="row w-100 align-items-center justify-content-center ms-auto">
            <div className="col-md-6 d-none d-md-block text-center">
                <img 
                    src="https://magicpage-dev.propstory.com/ImageUploads/VBHC%20Landscape/1nnx5253om78z32r9.png" 
                    alt="AI Chatbot"
                    className="img-fluid w-50 h-auto animated"
                />
            </div>
    
            <div className="col-md-5 auth-card p-4 shadow rounded bg-white">
                <h2 className="text-center text-primary mb-4">Login</h2>
                {message && <div className="alert alert-success">{message}</div>}
                {error && <div className="alert alert-danger">{error}</div>}
                
                <form onSubmit={handleLogin}>
                    <div className="mb-3">
                        <label htmlFor="email" className="form-label">Email</label>
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
                        <label htmlFor="password" className="form-label">Password</label>
                        <input
                            id="password"
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="form-control"
                        />
                    </div>
                    <button type="submit" className="btn btn-primary w-100">Login</button>
                </form>
            </div>
            <div className="col-lg-1">

            </div>
        </div>
    </div>
    
    );
};

export default Login;
