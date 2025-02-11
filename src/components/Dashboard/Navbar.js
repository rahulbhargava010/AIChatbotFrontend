import React from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import "bootstrap/dist/css/bootstrap.min.css";
import "./Navbar.css";

const Navbar = () => {
    const navigate = useNavigate();
    // const location = useLocation();
    // const navigate = useNavigate();
    // console.log("location: ", location);
    // console.log("location pathname: ", location.pathname);
    // // Hide navbar on authentication pages
    // const hideNavbarPaths = ["/signin", "/signup", "/forgot-password", "/chatbot-widget"];
    // if (hideNavbarPaths.includes(location.pathname)) {
    //     console.log("found ", location.pathname);
    //     return null;
    // }

    const handleLogout = () => {
        localStorage.removeItem('token'); // Clear token
        navigate('/'); // Redirect to login
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
            <div className="container">
                <Link className="navbar-brand" to="/dashboard">PS Chatbot</Link>
                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav"
                    aria-controls="navbarNav"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav">
                        <li class="nav-item dropdown">
                            <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            Chatbot
                            </a>
                            <div class="dropdown-menu" aria-labelledby="navbarDropdown">
                            <a class="dropdown-item" href="/dashboard/create">Create Chatbot</a>
                            <a class="dropdown-item" href="/dashboard/list">Chatbot List</a>
                            <div class="dropdown-divider"></div>
                            <a class="dropdown-item" href="#">Something else here</a>
                            </div>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/dashboard/create">Conversation</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/dashboard/AdminAnalytics">Analytics</Link>
                        </li>
                        <li className="nav-item">
                            {/* <button className="btn btn-link nav-link" >Logout</button> */}
                            <Link className="nav-link" onClick={handleLogout}>Logout</Link>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
