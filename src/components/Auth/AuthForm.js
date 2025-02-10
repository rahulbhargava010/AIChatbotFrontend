import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import api from "../config/axios";

import 'bootstrap/dist/css/bootstrap.min.css';
import './AuthForm.css';

const AuthForm = ({ type }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (type === 'signup') {
                const response = await api.post('/users/register', { name, email, password });
                setMessage('Signup successful! Redirecting to login...');
                setTimeout(() => navigate('/'), 2000);
            } else if (type === 'login') {
                const response = await api.post('/users/login', { email, password });
                localStorage.setItem('token', response.data.token);
                setMessage('Login successful! Redirecting to dashboard...');
                setTimeout(() => navigate('/dashboard'), 2000);
            } else if (type === 'forgot-password') {
                await api.post('/users/forgot-password', { email });
                setMessage('Password reset link sent to your email!');
            }
            setError('');
        } catch (err) {
            setError(err.response?.data?.error || 'An error occurred.');
            setMessage('');
        }
    };

    return (
        <div className="auth-container d-flex justify-content-center align-items-center vh-100">
            <div className="auth-card p-4 shadow rounded bg-white">
                <h2 className="text-center text-primary mb-4">
                    {type === 'signup' ? 'Sign Up' : type === 'login' ? 'Login' : 'Forgot Password'}
                </h2>
                {message && <div className="alert alert-success">{message}</div>}
                {error && <div className="alert alert-danger">{error}</div>}
                <form onSubmit={handleSubmit}>
                    {type === 'signup' && (
                        <div className="mb-3">
                            <label htmlFor="name" className="form-label">Name</label>
                            <input
                                id="name"
                                type="text"
                                placeholder="Enter your name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="form-control"
                            />
                        </div>
                    )}
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
                    {type !== 'forgot-password' && (
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
                    )}
                    <button type="submit" className="btn btn-primary w-100">
                        {type === 'signup' ? 'Sign Up' : type === 'login' ? 'Login' : 'Send Reset Link'}
                    </button>
                </form>
                <div className="mt-3 text-center">
                    {type === 'login' && (
                        <p>
                            Don’t have an account? <a href="/signup" className="text-decoration-none">Sign Up</a>
                        </p>
                    )}
                    {type === 'signup' && (
                        <p>
                            Already have an account? <a href="/" className="text-decoration-none">Login</a>
                        </p>
                    )}
                    {type === 'login' && (
                        <p>
                            <a href="/forgot-password" className="text-decoration-none">Forgot Password?</a>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthForm;