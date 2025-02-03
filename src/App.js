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
// import ForgotPassword from './components/Auth/ForgotPassword';
import ResetPassword from './components/Auth/ResetPassword';
import Dashboard from './components/Dashboard/Dashboard';

// import './App.css';

const Header = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token'); // Clear token
        navigate('/'); // Redirect to login
    };

    return (
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
                <div className="collapse navbar-collapse" id="navbarNav">
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
                </div>
            </div>
        </nav>
    );
};

// const ProtectedRoute = ({ children }) => {
//     const token = localStorage.getItem('token');
//     console.log('token', token);
//     if (!token) {
//         return <Navigate to="/" replace />; // Redirect to login if no token
//     }

//     try {
//         // const { exp } = jwtDecode(token);
//         // if (Date.now() >= exp * 1000) {
//         //     localStorage.removeItem('token'); // Token expired, clear it
//         //     return <Navigate to="/" replace />; // Redirect to login
//         // }
//     } catch (err) {
//         console.error('Token decoding error:', err);
//         localStorage.removeItem('token');
//         return <Navigate to="/" replace />;
//     }

//     return children; // Render protected content
// };

// const App = () => {
//     return (
//         <Router>
//             <AppContent />
//         </Router>
//     );
// };

const App = () => {
    
    // const navigate = useNavigate();

    // useEffect(() => {
    //     const token = localStorage.getItem('token');
    //     if (token) {
    //         try {
    //             // const { exp } = jwtDecode(token);
    //             // if (Date.now() < exp * 1000) {
    //                 navigate('/dashboard/list'); // Redirect to dashboard if token is valid
    //             // } else {
    //             //     localStorage.removeItem('token');
    //             //     navigate('/'); // Redirect to login if token is expired
    //             // }
    //         } catch (err) {
    //             console.error('Token decoding error:', err);
    //             localStorage.removeItem('token');
    //             navigate('/'); // Redirect to login on error
    //         }
    //     }
    // }, [navigate]);
    
    return (
        <Router>
            <Routes>
                <Route path="/" element={<AuthForm type="login" />} />
                <Route path="/signup" element={<AuthForm type="signup" />} />
                <Route path="/forgot-password" element={<AuthForm type="forgot-password" />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/dashboard/create-chatbot" element={<CreateChatbot />} />
                <Route path="/dashboard/train/:chatbotId" element={<TrainChatbot />} />
                <Route path="/dashboard/update/:chatbotId" element={<UpdateChatbot />} />
                <Route path="/dashboard/chatbot-test/:chatbotId" element={<TestChatbot />} />
                <Route path="/dashboard/conversations/:chatbotId" element={<Conversations />} />

                <Route path="/dashboard/leads/:chatbotId" element={<LeadsTable />} />
                <Route path="/chatbot-widget/:chatbotId" element={<ChatbotWidget />} />
            </Routes>
        </Router>
    );
};

export default App;
