import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../config/axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [companies, setCompanies] = useState([]);
  const [company, setCompany] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Fetch companies from backend
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await api.get("/company/all");
        setCompanies(response.data.companies);
      } catch (err) {
        setError("Failed to load companies");
      }
    };
    fetchCompanies();
  }, []);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await api.post("/users/register", { email, password, name, company });
      setMessage("Signup successful! Redirecting to login");
      setError("");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
      setMessage("");
    }
  };

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
              src="https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=1470&auto=format&fit=crop"
              alt="AI Chatbot"
              className="img-fluid w-75 h-auto rounded shadow-lg animated"
            />
            <p className="text-white mt-4">
              Create your account today and start building intelligent AI
              chatbots for your business.
            </p>
          </div>
        </div>

        <div className="col-md-5 auth-card p-4 shadow rounded bg-white">
          <h2 className="text-center text-primary mb-4 fw-bold">Sign Up</h2>
          {message && <div className="alert alert-success">{message}</div>}
          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSignup}>
            <div className="mb-3">
              <label htmlFor="name" className="form-label">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-control"
                required
              />
            </div>

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
              <label htmlFor="company" className="form-label">
                Select Company
              </label>
              <select
                id="company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="form-select"
                required
              >
                <option value="">Select a company</option>
                {companies.map((comp) => (
                  <option key={comp._id} value={comp._id}>
                    {comp.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className="input-group">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
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
              Sign Up
            </button>
          </form>

          <div className="mt-3 text-center">
            <p className="text-dark">
              Already have an account?{" "}
              <Link to="/login" className="text-decoration-none a-link">
                Login
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

export default Signup;
