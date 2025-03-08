import React, { useEffect, useContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
  useNavigate,
} from "react-router-dom";
import * as jwtDecode from "jwt-decode";
import { AuthProvider } from "./components/Auth/AuthContext";
import AppRoutes from "./components/routes/AppRoutes";
import { LoaderProvider } from "./components/Auth/LoaderContext";
import { LoaderContext } from "./components/Auth/LoaderContext";
import Loader from "./components/Dashboard/Loader";

// import Login from './components/Auth/Login';
// import Signup from './components/Auth/Signup';

import CreateChatbot from "./components/Dashboard/CreateChatbot";
import TrainChatbot from "./components/Dashboard/TrainChatbot";
import TestChatbot from "./components/Dashboard/TestChatbot";
import LeadsTable from "./components/Dashboard/LeadsTable";
import Conversations from "./components/Dashboard/Conversations";
import UpdateChatbot from "./components/Dashboard/UpdateChatbot";
import ChatbotWidget from "./components/Dashboard/ChatbotWidget";
import TemplateSelection from "./components/Dashboard/TemplateSelection";
// import ForgotPassword from './components/Auth/ForgotPassword';
import ResetPassword from "./components/Auth/ResetPassword";
import Dashboard from "./components/Dashboard/Dashboard";
import AdminAnalytics from "./components/Dashboard/AdminAnalytics";
import ChatStats from "./components/Dashboard/ChatStats";
import Navbar from "./components/Dashboard/Navbar"; // Import Navbar
import { v4 as uuidv4 } from "uuid";
import api from "./components/config/axios";
import { Helmet } from "react-helmet-async";

const sessionId = localStorage.getItem("uniqueSessionId") || uuidv4();
localStorage.setItem("uniqueSessionId", sessionId);
// import './App.css';

const Header = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token"); // Clear token
    navigate("/"); // Redirect to login
  };

  api.post("/analytics/saveEvent", {
    eventType: "page_view",
    sessionId,
  });

  return (
    <>
      <Helmet>
        <title>Home | AI Chatbot</title>
        <meta
          name="description"
          content="Welcome to AI Chatbot, the best chatbot for customer support and automation."
        />
        <meta
          name="keywords"
          content="AI Chatbot, Customer Support, Automation, Live Chat"
        />
      </Helmet>
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <div className="container-fluid">
          <Link className="navbar-brand" to="/dashboard">
            Chatbot Dashboard
          </Link>
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
    // <Router>
    //   <Navbar />
    //   <Routes>
    //     <Route path="/dashboard" element={<Dashboard />} />
    //   </Routes>
    // </Router>
    <AuthProvider>
      <LoaderProvider>
        <Router>
          <AppContent />
        </Router>
      </LoaderProvider>
    </AuthProvider>
  );
};

const AppContent = () => {
  const { LoaderContext } = require("./components/Auth/LoaderContext");
  const { isLoading } = React.useContext(LoaderContext);

  return (
    <>
      {isLoading && <Loader />}
      <AppRoutes />
    </>
  );
};

export default App;
