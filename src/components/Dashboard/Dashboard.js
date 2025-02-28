import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import api from "../config/axios";
import generateEmbedScript from "../config/embedScript";
import ReactPaginate from "react-paginate";
import {
  FaPlay,
  FaEdit,
  FaUsers,
  FaComments,
  FaChartLine,
  FaCode,
  FaTrash,
} from "react-icons/fa";
import "./Dashboard.css";

const Dashboard = () => {
  const [chatbots, setChatbots] = useState([]);
  const [error, setError] = useState("");
  const [responseMessage, setResponseMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 6;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChatbots = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await api.get("/chatbots/list", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setChatbots(Array.isArray(response?.data) ? response.data : []);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to fetch chatbots");
      }
    };

    fetchChatbots();
  }, []);

  const handleCreateChatbot = () => {
    navigate("/dashboard/create-chatbot");
  };

  const handleDelete = async (chatbotId, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this chatbot?"))
      return;

    try {
      const token = localStorage.getItem("token");
      const response = await api.post(
        `/chatbots/delete`,
        { chatbotId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResponseMessage(response.data.message);
      setChatbots(chatbots.filter((chatbot) => chatbot._id !== chatbotId));
    } catch (err) {
      console.error("Error deleting chatbot:", err);
      setResponseMessage(
        err.response?.data?.error || "Failed to delete chatbot."
      );
    }
  };

  const handleCopyScript = (chatbotId, e) => {
    e.stopPropagation();
    const embedScript = generateEmbedScript(chatbotId);
    navigator.clipboard.writeText(embedScript);
    alert("Chatbot script copied to clipboard!");
  };

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  const offset = currentPage * itemsPerPage;
  const currentChatbots = chatbots.slice(offset, offset + itemsPerPage);

  return (
    <div className="dashboard-container container">
      <div className="d-flex justify-content-between align-items-center mb-5">
        <h3 className="m-0">My Chatbots</h3>
        <button className="create-btn mb-3" onClick={handleCreateChatbot}>
          + Create Chatbot
        </button>
      </div>

      {error && <p className="text-danger">{error}</p>}

      <div className="d-flex flex-wrap gap-3">
        {currentChatbots.map((chatbot) => (
          <div
            key={chatbot._id}
            className="chatbot-card p-3"
            onClick={() => navigate(`/dashboard/chatbot/${chatbot._id}`)}
            style={{ cursor: "pointer" }}
          >
            <h5 className="flex-grow-1">{chatbot.name}</h5>
            <div
              className="chatbot-actions"
              onClick={(e) => e.stopPropagation()}
            >
              <Link
                className="btn"
                to={`/dashboard/chatbot-test/${chatbot._id}`}
                onClick={(e) => e.stopPropagation()}
              >
                <FaPlay />
              </Link>
              <Link
                className="btn"
                to={`/dashboard/update/${chatbot._id}`}
                onClick={(e) => e.stopPropagation()}
              >
                <FaEdit />
              </Link>
              <Link
                className="btn"
                to={`/dashboard/leads/${chatbot._id}`}
                onClick={(e) => e.stopPropagation()}
              >
                <FaUsers />
              </Link>
              <Link
                className="btn"
                to={`/dashboard/conversations/${chatbot._id}`}
                onClick={(e) => e.stopPropagation()}
              >
                <FaComments />
              </Link>
              <Link
                className="btn"
                to={`/dashboard/stats/${chatbot._id}`}
                onClick={(e) => e.stopPropagation()}
              >
                <FaChartLine />
              </Link>
              <a
                className="btn"
                href="#"
                onClick={(e) => handleCopyScript(chatbot._id, e)}
              >
                <FaCode />
              </a>
              <a
                className="btn btn-danger"
                href="#"
                onClick={(e) => handleDelete(chatbot._id, e)}
              >
                <FaTrash />
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
        pageCount={Math.ceil(chatbots.length / itemsPerPage)}
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

export default Dashboard;
