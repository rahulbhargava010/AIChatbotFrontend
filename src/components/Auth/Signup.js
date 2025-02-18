import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import api from "../config/axios";

const Signup = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const [company, setCompany] = useState('user'); 

    const handleSignup = async (e) => {
        e.preventDefault();
        try {
            await api.post('/users/register', { email, password, name, company });
            navigate('/');
        } catch (err) {
            setError(err.response.data.error || 'Something went wrong');
        }
    };

    return (
        <div className="auth-container">
            <h2>Sign Up</h2>
            {error && <p className="error">{error}</p>}
            <form onSubmit={handleSignup}>
                <input
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />

                <div className="mb-3 select-wrapper">
                    <label htmlFor="company" className="form-label">Select Company</label>
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

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                
                <button type="submit">Sign Up</button>
            </form>
            <p>
                Already have an account? <a href="/">Login</a>
            </p>
        </div>
    );
};

export default Signup;
