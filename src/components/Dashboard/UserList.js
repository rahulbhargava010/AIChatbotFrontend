import React, { useState, useEffect } from "react";
import api from "../config/axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaToggleOn, FaToggleOff, FaTrashAlt } from "react-icons/fa";

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;

  useEffect(() => {
    fetchUsers();
  }, []);

  // ✅ Fetch users from the API
  const fetchUsers = async () => {
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
      console.log("RES:", response);
      setUsers(response.data.user);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const toggleActivation = async (userId, isActive) => {
    try {
      const token = localStorage.getItem("token");

      const response = await api.post(
        "/users/activate",
        { userId, isActive: !isActive },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        fetchUsers();
      } else {
        alert("Failed to update user status.");
      }
    } catch (error) {
      console.error("Error updating user status:", error);
      alert("Failed to update user status.");
    }
  };

  const handleDelete = async (userId) => {
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this user?"
    );
    if (!isConfirmed) return;

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
      setUsers(users.filter((user) => user._id !== userId));
      alert("User deleted successfully!");
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user.");
    }
  };

  const handleSearch = (event) => {
    setSearch(event.target.value);
    setCurrentPage(1);
  };

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(search.toLowerCase())
  );

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="container mt-5">
      <div className="card shadow-lg p-4">
        <h2 className="text-center mb-4">Users List</h2>
        <div className="d-flex justify-content-center align-items-center mb-3">
          <input
            type="text"
            className="form-control w-50"
            placeholder="🔍 Search user..."
            value={search}
            onChange={handleSearch}
          />
        </div>
        <div className="table-responsive">
          <table className="table table-bordered text-center align-middle">
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.length > 0 ? (
                currentUsers.map((user, index) => (
                  <tr key={user._id}>
                    <td>{index + 1 + indexOfFirstUser}</td>
                    <td>{user.name}</td>
                    <td>
                      {user.isActive == "active" ? (
                        <FaToggleOn
                          className="text-success"
                          size={45}
                          style={{ cursor: "pointer" }}
                          onClick={() => toggleActivation(user._id, true)}
                        />
                      ) : (
                        <FaToggleOff
                          className="text-danger"
                          size={45}
                          style={{ cursor: "pointer" }}
                          onClick={() => toggleActivation(user._id, false)}
                        />
                      )}
                    </td>
                    <td>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(user._id)}
                      >
                        <FaTrashAlt /> Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-muted align-middle">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {filteredUsers.length > usersPerPage && (
          <nav>
            <ul className="pagination justify-content-center">
              <li
                className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
              >
                <button
                  className="page-link"
                  onClick={() => paginate(currentPage - 1)}
                >
                  Previous
                </button>
              </li>
              {Array.from(
                { length: Math.ceil(filteredUsers.length / usersPerPage) },
                (_, i) => (
                  <li
                    key={i}
                    className={`page-item ${
                      currentPage === i + 1 ? "active" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => paginate(i + 1)}
                    >
                      {i + 1}
                    </button>
                  </li>
                )
              )}
              <li
                className={`page-item ${
                  currentPage === Math.ceil(filteredUsers.length / usersPerPage)
                    ? "disabled"
                    : ""
                }`}
              >
                <button
                  className="page-link"
                  onClick={() => paginate(currentPage + 1)}
                >
                  Next
                </button>
              </li>
            </ul>
          </nav>
        )}
      </div>
    </div>
  );
};

export default UserList;
