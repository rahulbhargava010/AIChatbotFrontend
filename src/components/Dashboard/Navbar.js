import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
  useNavigate,
} from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Navbar.css";
import { useAuth } from "../Auth/AuthContext";

const Navbar = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const userRole = localStorage.getItem("userRole");
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
    logout();
    navigate("/"); // Redirect to login page
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-black fixed-top">
      <div className="container">
        <Link className="navbar-brand text-red-600" to="/dashboard">
          PropStory
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
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle"
                href="#"
                id="navbarDropdown"
                role="button"
                data-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
              >
                Chatbot
              </a>
              <div className="dropdown-menu" aria-labelledby="navbarDropdown">
                <a className="dropdown-item" href="/dashboard/create">
                  Create Chatbot
                </a>
                <a className="dropdown-item" href="/dashboard/list">
                  Chatbot List
                </a>
                <div className="dropdown-divider"></div>
                <a className="dropdown-item" href="#">
                  Something else here
                </a>
              </div>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/dashboard/create">
                Conversation
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/dashboard/AdminAnalytics">
                Analytics
              </Link>
            </li>
            {/* Show Add Company only for "ps-owner" role */}
            {userRole === "ps-owner" && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/dashboard/addCompany">
                    Add Company
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/dashboard/userList">
                    Users
                  </Link>
                </li>
              </>
            )}
            <li className="nav-item">
              <button
                className="btn btn-link nav-link mt-0"
                onClick={handleLogout}
              >
                Logout
              </button>
              {/* <Link className="nav-link" onClick={handleLogout}>Logout</Link> */}
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
