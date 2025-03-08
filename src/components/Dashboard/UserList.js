import React, { useState, useEffect, useContext } from "react";
import api from "../config/axios";
import { FaToggleOn, FaToggleOff, FaTrashAlt } from "react-icons/fa";
import DataTable from "./DataTable"; // Import the DataTable component
import "./Dashboard.css";
import { LoaderContext } from "../Auth/LoaderContext";

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { showLoader, hideLoader } = useContext(LoaderContext);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    showLoader();
    try {
      const token = localStorage.getItem("token");
      const response = await api.post(
        "/users/allUsers",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setUsers(response.data.user);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      hideLoader();
    }
  };

  const toggleActivation = async (userId, isActive) => {
    try {
      const token = localStorage.getItem("token");
      await api.post(
        "/users/activate",
        { userId, isActive: !isActive },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      fetchUsers(); // Refresh the user list after toggling activation
    } catch (error) {
      console.error("Error updating user status:", error);
    }
  };

  const handleDelete = async (userId) => {
    const loggedInUserId = localStorage.getItem("userId");

    if (userId === loggedInUserId) {
      alert("You cannot delete your own account.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      const token = localStorage.getItem("token");
      await api.post(
        "/users/remove",
        { userId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setUsers(users.filter((user) => user._id !== userId)); // Update the user list after deletion
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  // Define columns for the DataTable
  const columns = [
    { key: "name", header: "Name" },
    { key: "email", header: "Email" },
    {
      key: "isActive",
      header: "Status",
      render: (value) => (
        <span className={value === "active" ? "text-success" : "text-danger"}>
          {value === "active" ? "Active" : "Inactive"}
        </span>
      ),
    },
  ];

  // Define actions for the DataTable
  const actions = [
    {
      label: "Toggle Activation",
      icon: (item) =>
        item.isActive === "active" ? (
          <FaToggleOn className="text-success" size={24} />
        ) : (
          <FaToggleOff className="text-danger" size={24} />
        ),
      onClick: (e, item) =>
        toggleActivation(item._id, item.isActive === "active"),
    },
    {
      label: "Delete",
      icon: <FaTrashAlt />,
      onClick: (e, item) => handleDelete(item._id),
    },
  ];

  return (
    <div className="dashboard-container container">
      <div className="d-flex justify-content-between align-items-center mb-5">
        <h3 className="m-0">Users List</h3>
      </div>

      {/* Use the DataTable component */}
      <DataTable
        data={users}
        columns={columns}
        actions={actions}
        searchTerm={searchTerm}
        onSearchChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>
  );
};

export default UserList;
