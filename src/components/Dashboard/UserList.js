import React, { useState, useEffect } from "react";
import api from "../config/axios";
import { FaToggleOn, FaToggleOff, FaTrashAlt } from "react-icons/fa";
import ReactPaginate from "react-paginate";
import "./Dashboard.css";

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const usersPerPage = 6;

  useEffect(() => {
    fetchUsers();
  }, []);

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
      setUsers(response.data.user);
    } catch (error) {
      console.error("Error fetching users:", error);
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
      fetchUsers();
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
      setUsers(users.filter((user) => user._id !== userId));
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  const offset = currentPage * usersPerPage;
  const currentUsers = users.slice(offset, offset + usersPerPage);

  return (
    <div className="dashboard-container container">
      <div className="d-flex justify-content-between align-items-center mb-5">
        <h3 className="m-0">Users List</h3>
        {/* <input
          type="text"
          className="form-control w-50"
          placeholder="🔍 Search user..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        /> */}
      </div>

      <div className="d-flex flex-wrap gap-3">
        {currentUsers.map((user) => (
          <div key={user._id} className="chatbot-card p-3">
            <h5 className="flex-grow-1">{user?.name}</h5>
            <div className="chatbot-actions">
              {user.isActive === "active" ? (
                <FaToggleOn
                  className="text-success btn"
                  size={24}
                  onClick={() => toggleActivation(user._id, true)}
                />
              ) : (
                <FaToggleOff
                  className="text-danger btn"
                  size={24}
                  onClick={() => toggleActivation(user._id, false)}
                />
              )}
              <a
                className="btn btn-danger"
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleDelete(user._id);
                }}
              >
                <FaTrashAlt />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <ReactPaginate
        previousLabel={"<"}
        nextLabel={">"}
        breakLabel={"..."}
        pageCount={Math.ceil(users.length / usersPerPage)}
        marginPagesDisplayed={2}
        pageRangeDisplayed={3}
        onPageChange={handlePageClick}
        containerClassName={"pagination justify-content-center mt-4"}
        pageClassName={"page-item"}
        pageLinkClassName={"page-link"}
        previousClassName={"page-item"}
        previousLinkClassName={"page-link"}
        nextClassName={"page-item"}
        nextLinkClassName={"page-link"}
        breakClassName={"page-item disabled"}
        breakLinkClassName={"page-link"}
        activeClassName={"active"}
      />
    </div>
  );
};

export default UserList;
