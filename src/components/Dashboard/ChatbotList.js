import React, { useEffect, useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../config/axios";
import generateEmbedScript from "../config/embedScript";
import DataTable from "./DataTable";
import {
  FaPlay,
  FaEdit,
  FaUsers,
  FaComments,
  FaChartLine,
  FaCode,
  FaTrash,
} from "react-icons/fa";
import TestChatbot from "./TestChatbot";
import { LoaderContext } from "../Auth/LoaderContext";
import Swal from "sweetalert2";

const ChatbotList = () => {
  const [chatbots, setChatbots] = useState([]);
  const [error, setError] = useState("");
  const [activeChatbotId, setActiveChatbotId] = useState(null);
  const navigate = useNavigate();
  const { showLoader, hideLoader } = useContext(LoaderContext);

  useEffect(() => {
    const fetchChatbots = async () => {
      showLoader();
      try {
        const token = localStorage.getItem("token");
        const response = await api.get("/chatbots/list", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = Array.isArray(response?.data) ? response.data : [];
        setChatbots(data);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to fetch chatbots");
      } finally {
        hideLoader();
      }
    };

    fetchChatbots();
  }, []);

  const handleDelete = async (chatbotId, e) => {
    e.stopPropagation();

    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won’t be able to undo this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    try {
      const token = localStorage.getItem("token");
      await api.post(
        "/chatbots/delete",
        { chatbotId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setChatbots(chatbots.filter((chatbot) => chatbot._id !== chatbotId));

      Swal.fire("Deleted!", "Chatbot has been removed.", "success");
    } catch (err) {
      Swal.fire("Error!", "Failed to delete the chatbot.", "error");
    }
  };

  const handleCopyScript = async (chatbotId, e) => {
    e.stopPropagation();
    const embedScript = generateEmbedScript(chatbotId);

    try {
      await navigator.clipboard.writeText(embedScript);
      Swal.fire({
        icon: "success",
        title: "Copied!",
        text: "Chatbot script copied to clipboard!",
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Failed to copy the script!",
      });
    }
  };

  const handleTestChatbot = (chatbotId) => {
    setActiveChatbotId(chatbotId);
  };

  const handleRowClick = (item) => {
    navigate(`/dashboard/chatbot/${item._id}`);
  };

  const columns = [
    { key: "name", header: "Name" },
    {
      key: "created_at",
      header: "Created At",
      render: (value) => new Date(value).toLocaleString(),
    },
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

  const actions = [
    // {
    //   label: "Test",
    //   icon: <FaPlay />,
    //   onClick: (e, item) => handleTestChatbot(item._id),
    // },
    {
      label: "Edit",
      icon: <FaEdit />,
      to: (item) => `/dashboard/update/${item._id}`,
    },
    {
      label: "Leads",
      icon: <FaUsers />,
      to: (item) => `/dashboard/leads/${item._id}`,
    },
    {
      label: "Conversations",
      icon: <FaComments />,
      to: (item) => `/dashboard/conversations/${item._id}`,
    },
    {
      label: "Stats",
      icon: <FaChartLine />,
      to: (item) => `/dashboard/AdminAnalytics`,
    },
    {
      label: "Copy Script",
      icon: <FaCode />,
      onClick: (e, item) => handleCopyScript(item._id, e),
    },
    {
      label: "Delete",
      icon: <FaTrash />,
      onClick: (e, item) => handleDelete(item._id, e),
    },
  ];

  return (
    <div>
      {error && <p className="text-danger">{error}</p>}
      <DataTable
        data={chatbots}
        columns={columns}
        actions={actions}
        onRowClick={handleRowClick}
      />

      {activeChatbotId && (
        <div
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            zIndex: 1000,
          }}
        >
          <TestChatbot />
        </div>
      )}
    </div>
  );
};

export default ChatbotList;
