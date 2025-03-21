import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaBars,
  FaRobot,
  FaChartBar,
  FaUsers,
  FaBuilding,
  FaSignOutAlt,
  FaTachometerAlt,
  FaComments,
} from "react-icons/fa";
import { useAuth } from "../Auth/AuthContext";
import "./Sidebar.css";

const Sidebar = ({ onSidebarToggle }) => {
  const [isOpen, setIsOpen] = useState(true); // Expanded by default
  const navigate = useNavigate();
  const { logout } = useAuth();
  const userRole = localStorage.getItem("userRole");

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
    onSidebarToggle(!isOpen); // Notify parent to adjust layout
  };

  const handleItemClick = () => {
    if (isOpen) {
      setIsOpen(false);
      onSidebarToggle(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className={`sidebar ${isOpen ? "open" : "collapsed"}`}>
      {/* Sidebar Toggle Button */}
      <div className="menu-toggle">
        <FaBars className="menu-icon" onClick={toggleSidebar} />
      </div>

      {/* Sidebar Menu */}
      <ul className="sidebar-menu">
        <li>
          <Link to="/dashboard" className="menu-item">
            <FaTachometerAlt className="icon" />
            {isOpen && <span>Dashboard</span>}
          </Link>
        </li>

        <li>
          <Link to="/dashboard/AdminAnalytics" className="menu-item">
            <FaChartBar className="icon" />
            {isOpen && <span>Analytics</span>}
          </Link>
        </li>

        {/* Show Company & Users only for "ps-owner" */}
        {userRole === "ps-owner" && (
          <>
            <li>
              <Link to="/dashboard/chatbotList" className="menu-item">
                <FaComments className="icon" />
                {isOpen && <span>Chatbot List</span>}
              </Link>
            </li>
            <li>
              <Link to="/dashboard/companyList" className="menu-item">
                <FaBuilding className="icon" />
                {isOpen && <span>Company</span>}
              </Link>
            </li>
            <li>
              <Link to="/dashboard/userList" className="menu-item">
                <FaUsers className="icon" />
                {isOpen && <span>Users</span>}
              </Link>
            </li>
          </>
        )}

        <li className="logout-container">
          <button className="logout-btn menu-item" onClick={handleLogout}>
            <FaSignOutAlt className="icon" />
            {isOpen && <span>Logout</span>}
          </button>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
