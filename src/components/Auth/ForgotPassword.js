import React, { useState } from 'react';
import axios from 'axios';
import api from "../config/axios";
import { Link } from "react-router-dom";



const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/users/forgot-password', { email });
            setMessage(response.data.message);
        } catch (err) {
            setError(err.response.data.error || 'Something went wrong');
        }
    };

    return (
        <div className="auth-container d-flex vh-100 align-items-center justify-content-center">
        <div className="card p-4 shadow-lg" style={{ maxWidth: "400px", width: "100%" }}>
          <h2 className="text-center mb-4 text-primary fw-bold">Forgot Password</h2>
          {error && <p className="alert alert-danger">{error}</p>}
          <form onSubmit={handleForgotPassword}>
            <input
              className="form-control"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button type="submit" className="btn btn-primary w-100 mt-3">Send Reset Link</button>
          </form>
          <p className="text-center mt-3">
          Remembered your password ?  <Link className="a-link" to="/">Login</Link>
          </p>
        </div>
      </div>
      
    );
};

export default ForgotPassword;