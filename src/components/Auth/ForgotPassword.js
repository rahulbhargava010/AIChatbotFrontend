import React, { useState } from "react";
import { Link } from "react-router-dom";
import api from "../config/axios";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/users/forgot-password", { email });
      setMessage(
        response.data.message ||
          "Password reset link has been sent to your email!"
      );
      setError("");
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
      setMessage("");
    }
  };

  return (
    <div className="auth-container d-flex vh-100 align-items-center justify-content-center">
      <div className="row w-100 align-items-center justify-content-center">
        <div className="col-md-6 d-none d-md-block text-center">
          <div className="p-4">
            <Link to="/" className="text-decoration-none">
              <h2 className="mb-4 text-white">
                <span className="text-primary">Prop</span>Bot
              </h2>
            </Link>
            <img
              src="https://images.unsplash.com/photo-1579389083078-4e7018379f7e?q=80&w=1470&auto=format&fit=crop"
              alt="Reset Password"
              className="img-fluid w-75 h-auto rounded shadow-lg animated"
            />
            <p className="text-white mt-4">
              Don't worry, we'll help you reset your password and get back to
              your account.
            </p>
          </div>
        </div>

        <div className="col-md-5 auth-card p-4 shadow-lg rounded bg-white">
          <h2 className="text-center mb-4 text-primary fw-bold">
            Forgot Password
          </h2>
          {message && <div className="alert alert-success">{message}</div>}
          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleForgotPassword}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <input
                id="email"
                className="form-control"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary w-100 mt-3">
              Send Reset Link
            </button>
          </form>

          <div className="mt-3 text-center">
            <p className="text-dark">
              Remembered your password?{" "}
              <Link className="a-link" to="/login">
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

export default ForgotPassword;
