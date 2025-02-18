import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    const [company, setCompany] = useState('user'); 
    

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (type === 'signup') {
                await api.post('/users/register', { name, email, password,company });
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
        <div className="container-fluid vh-100 d-flex align-items-center justify-content-center auth-container mt-4">
        <div className="row d-flex align-items-center justify-content-evenly">
            
        {type !== 'forgot-password' && (
            <div className="col-md-5 d-none d-md-block p-0">
                <img 
                    src="https://magicpage-dev.propstory.com/ImageUploads/VBHC%20Landscape/1nnx5253om78z32r9.png" 
                    alt="AI Chatbot"
                    className="img-fluid w-100 h-100 animated"
                />
            </div>
        )}

            <div className='col-lg-2'>
                 
            </div>
    
            <div  
            className={`p-4 d-flex flex-column justify-content-center auth-card rounded 
                        ${type === 'forgot-password' ? 'col-lg-12 mx-auto' : 'col-md-5'}`}
        >
                <h2 className="text-center text-primary fw-bold mb-4">
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

{type === 'signup' && (
            <div className="mb-3 select-wrapper">
                <label htmlFor="company" className="form-label">Select company</label>
                <select
                    id="company"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="form-control form-select"
                >
                    <option value="propstory">PropStory</option>
                    <option value="shapoorji">Shapoorji Pallonji</option>
                    <option value="purva">Puravankara</option>
                    <option value="kolte">Kolte Patil</option>

                </select>
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
                        <p className="text-dark">
                            Don’t have an account? <a href="/signup" className="text-decoration-none a-link fw-bold">Sign Up</a>
                        </p>
                    )}
                    {type === 'signup' && (
                        <p>
                            Already have an account? <a href="/" className="text-decoration-none a-link">Login</a>
                        </p>
                    )}
                    {type === 'login' && (
                        <p>
                            <a href="/forgot-password" className="text-decoration-none a-link fw-bold">Forgot Password?</a>
                        </p>
                    )}
                </div>
            </div>
        </div>
    </div>
    
    );
};

export default AuthForm;
