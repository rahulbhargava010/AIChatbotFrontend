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
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
      setMessage("");
    }
  };

  return (
    <div className="auth-container d-flex justify-content-center align-items-center vh-100">
      <div className="row w-100 align-items-center justify-content-center">
        <div className="col-md-6 d-none d-md-block text-center">
          <img
            src="https://magicpage-dev.propstory.com/ImageUploads/VBHC%20Landscape/1nnx5253om78z32r9.png"
            alt="AI Chatbot"
            className="img-fluid w-50 h-auto animated"
          />
        </div>

        <div className="col-md-5 p-4">
          <div
            className="card p-4 shadow-lg"
            style={{ maxWidth: "400px", width: "100%" }}
          >
            <h2 className="text-center mb-4 text-primary fw-bold">Sign Up</h2>
            {message && <div className="alert alert-success">{message}</div>}
            {error && <p className="alert alert-danger">{error}</p>}
            <form onSubmit={handleSignup}>
              <div className="mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                {/* <label htmlFor="company" className="form-label">
              Select Company
            </label> */}
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
                <input
                  type="email"
                  className="form-control"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <div className="input-group">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-control"
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary border-1 d-flex align-items-center justify-content-center"
                    style={{ width: "46px", height: "46px" }}
                    onClick={togglePasswordVisibility}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
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

            <p className="text-center mt-3">
              Already have an account?{" "}
              <Link className="a-link" to="/">
                Login
              </Link>
            </p>
          </div>
        </div>
        <div class="col-lg-1"></div>
      </div>
    </div>

    // <div className="auth-container d-flex justify-content-center align-items-center vh-100">

    // </div>
  );
};

export default Signup;
