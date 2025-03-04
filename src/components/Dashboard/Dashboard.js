import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../config/axios";
import generateEmbedScript from "../config/embedScript";
import DataTable from "./DataTable"; // Import the reusable component
import {
  FaPlay,
  FaEdit,
  FaUsers,
  FaComments,
  FaChartLine,
  FaCode,
  FaTrash,
} from "react-icons/fa";

const Dashboard = () => {
  const [chatbots, setChatbots] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChatbots = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await api.get("/chatbots/list", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = Array.isArray(response?.data) ? response.data : [];
        setChatbots(data);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to fetch chatbots");
      }
    };

    fetchChatbots();
  }, []);

  const handleDelete = async (chatbotId, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this chatbot?"))
      return;

    try {
      const token = localStorage.getItem("token");
      await api.post(
        "/chatbots/delete",
        { chatbotId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setChatbots(chatbots.filter((chatbot) => chatbot._id !== chatbotId));
    } catch (err) {
      console.error("Error deleting chatbot:", err);
    }
  };

  const handleCopyScript = (chatbotId, e) => {
    e.stopPropagation();
    const embedScript = generateEmbedScript(chatbotId);
    navigator.clipboard.writeText(embedScript);
    alert("Chatbot script copied to clipboard!");
  };

  const columns = [
    { key: "name", header: "Name" },
    {
      key: "createdAt",
      header: "Created At",
      render: (value) => new Date(value).toLocaleString(),
    },
    { key: "size", header: "Size" },
  ];

  const actions = [
    {
      label: "Test",
      icon: <FaPlay />,
      to: (item) => `/dashboard/chatbot-test/${item._id}`,
    },
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
      to: (item) => `/dashboard/stats/${item._id}`,
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
      <DataTable data={chatbots} columns={columns} actions={actions} />
    </div>
  );
};

export default Dashboard;
