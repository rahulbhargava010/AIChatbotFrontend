import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import * as jwtDecode from 'jwt-decode';
// import Login from './components/Auth/Login';
// import Signup from './components/Auth/Signup';
import AuthForm from './components/Auth/AuthForm';
import CreateChatbot from './components/Dashboard/CreateChatbot';
import TrainChatbot from './components/Dashboard/TrainChatbot';
import TestChatbot from './components/Dashboard/TestChatbot';
import LeadsTable from './components/Dashboard/LeadsTable';
import Conversations from './components/Dashboard/Conversations';
import UpdateChatbot from './components/Dashboard/UpdateChatbot';
import ChatbotWidget from './components/Dashboard/ChatbotWidget';
import TemplateSelection from './components/Dashboard/TemplateSelection';
// import ForgotPassword from './components/Auth/ForgotPassword';
import ResetPassword from './components/Auth/ResetPassword';
import Dashboard from './components/Dashboard/Dashboard';
import AdminAnalytics from './components/Dashboard/AdminAnalytics';
import ChatStats from './components/Dashboard/ChatStats';
import Navbar from "./components/Dashboard/Navbar"; // Import Navbar
import { v4 as uuidv4 } from "uuid";
import api from "./components/config/axios";
import { Helmet } from "react-helmet-async";
import { NewDash } from './components/Dashboard/NewDash';

const sessionId = localStorage.getItem("uniqueSessionId") || uuidv4();
localStorage.setItem("uniqueSessionId", sessionId);
// import './App.css';

const Header = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token'); // Clear token
        navigate('/'); // Redirect to login
    };

    api.post("/analytics/saveEvent", {
        eventType: "page_view",
        sessionId,
    });

    return (
        <>
            <Helmet>
                <title>Home | AI Chatbot</title>
                <meta name="description" content="Welcome to AI Chatbot, the best chatbot for customer support and automation." />
                <meta name="keywords" content="AI Chatbot, Customer Support, Automation, Live Chat" />
            </Helmet>
            <nav className="navbar navbar-expand-lg navbar-light bg-light">
                <div className="container-fluid">
                    <Link className="navbar-brand" to="/dashboard">Chatbot Dashboard</Link>
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
                    {/* <div className="collapse navbar-collapse" id="navbarNav">
                        <ul className="navbar-nav">
                            <li className="nav-item">
                                <Link className="nav-link" to="/dashboard/create">Create Chatbot</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to="/dashboard/list">Chatbot List</Link>
                            </li>
                            <li className="nav-item">
                                <button className="btn btn-link nav-link" onClick={handleLogout}>Logout</button>
                            </li>
                        </ul>
                    </div> */}
                </div>
            </nav>
        </>
    );
};




const App = () => {

    
    return (
        <Router>
            <Navbar />
            <Routes>
                <Route path="/" element={<AuthForm type="login" />} />
                <Route path="/signup" element={<AuthForm type="signup" />} />
                <Route path="/forgot-password" element={<AuthForm type="forgot-password" />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/newdash" element={<NewDash />} />
                
                <Route path="/dashboard/create-chatbot" element={<CreateChatbot />} />
                <Route path="/dashboard/train/:chatbotId" element={<TrainChatbot />} />
                <Route path="/dashboard/update/:chatbotId" element={<UpdateChatbot />} />
                <Route path="/dashboard/chatbot-test/:chatbotId" element={<TestChatbot />} />
                <Route path="/dashboard/conversations/:chatbotId" element={<Conversations/>} />
                <Route path="/dashboard/select-template/:chatbotId" element={<TemplateSelection />} />
                <Route path="/dashboard/AdminAnalytics" element={<AdminAnalytics />} />
                <Route path="/dashboard/leads/:chatbotId" element={<LeadsTable />} />
                <Route path="/dashboard/stats/:chatbotId" element={<ChatStats />} />
                <Route path="/chatbot-widget/:chatbotId" element={<ChatbotWidget />} />
            </Routes>
        </Router>
    );
};

export default App;
