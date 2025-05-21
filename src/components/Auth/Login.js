import React, { useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { useNavigate, Link } from "react-router-dom";
import api from "../config/axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Auth.css";
import "./AuthForm.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Login = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/users/login", { email, password });
      const { token, user } = response.data;

      if (user.isActive !== "active") {
        setError("Your account is inactive. Please contact support.");
        setMessage("");
        return;
      }

      login(token, user);
      setMessage("Login successful! Redirecting");
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
      <div className="row w-100 align-items-center justify-content-center">
        <div className="col-md-6 d-none d-md-block text-center">
          <div className="p-4">
            <Link to="/" className="text-decoration-none">
              <h2 className="mb-4 text-white">
                <span className="text-primary">Prop</span>Bot
              </h2>
            </Link>
            <img
              src="https://images.unsplash.com/photo-1577563908411-5077b6dc7624?q=80&w=1470&auto=format&fit=crop"
              alt="AI Chatbot"
              className="img-fluid w-75 h-auto rounded shadow-lg animated"
            />
            <p className="text-white mt-4">
              Welcome back! Log in to access your PropBot dashboard and manage
              your AI chatbot.
            </p>
          </div>
        </div>

        <div className="col-md-5 auth-card p-4 shadow rounded bg-white">
          <h2 className="text-center text-primary mb-4 fw-bold">Login</h2>
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
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className="input-group">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-control"
                  required
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary border-1 d-flex align-items-center justify-content-center"
                  style={{ width: "46px", height: "46px" }}
                  onClick={togglePasswordVisibility}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <FaEyeSlash size={18} />
                  ) : (
                    <FaEye size={18} />
                  )}
                </button>
              </div>
            </div>
            <button type="submit" className="btn btn-primary w-100">
              Login
            </button>
          </form>
          <div className="mt-3 text-center">
            <p className="text-dark">
              Don't have an account?{" "}
              <Link to="/signup" className="text-decoration-none a-link">
                Sign Up
              </Link>
            </p>
            <p>
              <Link
                to="/forgot-password"
                className="text-decoration-none a-link"
              >
                Forgot Password?
              </Link>
            </p>
            <p className="mt-3">
              <Link to="/" className="text-decoration-none a-link">
                <i className="fas fa-arrow-left me-1"></i> Back to Home
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
