import React, { useState } from 'react';
import axios from 'axios';
import api from "../config/axios";

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
        <div className="auth-container">
            <h2>Forgot Password</h2>
            {message && <p className="success">{message}</p>}
            {error && <p className="error">{error}</p>}
            <form onSubmit={handleForgotPassword}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <button type="submit">Send Reset Link</button>
            </form>
        </div>
    );
};

export default ForgotPassword;