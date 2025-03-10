import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Bar, Doughnut } from "react-chartjs-2";
import generateEmbedScript from "../config/embedScript";
import { Chart, registerables } from "chart.js";
import api from "../config/axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "./ChatbotCard.css";
import {
  FaRobot,
  FaUsers,
  FaPlay,
  FaEdit,
  FaComments,
  FaChartLine,
  FaCode,
  FaTrash,
  FaToggleOn,
  FaToggleOff,
  FaTimes,
} from "react-icons/fa";
import Swal from "sweetalert2";
import TestChatbot from "./TestChatbot";

Chart.register(...registerables);

const ChatbotCard = () => {
  const { chatbotId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [activeChatbotId, setActiveChatbotId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChatbotCard = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await api.post(
          "/chatbots/chatbot-detail",
          { chatbot: chatbotId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setData(response.data);
        setIsActive(response.data.chatbotDetails.isActive === "active");
      } catch (err) {
        setError(err.response?.data?.error || "Failed to fetch data.");
      }
      setLoading(false);
    };
    fetchChatbotCard();
  }, [chatbotId]);

  const toggleActivation = async () => {
    try {
      const token = localStorage.getItem("token");
      const newStatus = isActive ? "inactive" : "active";
      await api.post(
        "/chatbots/update-status",
        { chatbot: chatbotId, status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsActive(!isActive);
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const handleTestChatbot = () => {
    setActiveChatbotId(chatbotId);
  };

  const handleEditChatbot = (id) => {
    navigate(`/dashboard/update/${id}`);
  };

  const handleCloseTestChatbot = () => {
    setActiveChatbotId(null);
  };

  const handleCopyScript = async () => {
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
      console.error("Failed to copy script:", err);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Failed to copy the script to clipboard!",
      });
    }
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem("token");
        await api.post(
          "/chatbots/delete",
          { chatbotId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        Swal.fire("Deleted!", "Your chatbot has been deleted.", "success");
        navigate(`/dashboard/chatbotList`);
      } catch (err) {
        console.error("Error deleting chatbot:", err);
        Swal.fire("Error!", "Failed to delete the chatbot.", "error");
      }
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-danger mt-2">{error}</p>;

  const chatbotDetails = data?.chatbotDetails;
  const conversations = data?.conversations || [];
  const leads = data?.leads || [];

  // Chart data
  const conversationData = {
    labels: conversations.map((_, index) => `Session ${index + 1}`),
    datasets: [
      {
        label: "Messages per Session",
        data: conversations.map((conv) => conv.messages.length),
        backgroundColor: "rgba(54, 162, 235, 0.5)",
      },
    ],
  };

  const leadStatusCounts = leads.reduce((acc, lead) => {
    acc[lead.status] = (acc[lead.status] || 0) + 1;
    return acc;
  }, {});

  const leadLabels = Object.keys(leadStatusCounts);
  const leadValues = Object.values(leadStatusCounts);

  const leadData = {
    labels: leadLabels,
    datasets: [
      {
        data: leadValues,
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"],
      },
    ],
  };

  const leadsByDate = leads.reduce((acc, lead) => {
    const date = new Date(lead.createdAt).toLocaleDateString();
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  const leadDateLabels = Object.keys(leadsByDate);
  const leadDateValues = Object.values(leadsByDate);

  const leadsByDayData = {
    labels: leadDateLabels,
    datasets: [
      {
        label: "Leads per Day",
        data: leadDateValues,
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
    ],
  };

  return (
    <div className="container mt-4 chatbot-dashboard">
      <div className="row">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="d-flex align-items-center chatbot-name">
            <FaRobot className="me-2" /> {chatbotDetails.name}
          </h2>
          <div className="d-flex align-items-center gap-3">
            <button
              className="btn btn-toggle d-flex align-items-center gap-2"
              onClick={toggleActivation}
            >
              {isActive ? (
                <FaToggleOn className="text-success" size={24} />
              ) : (
                <FaToggleOff className="text-danger" size={24} />
              )}
              <span>{isActive ? "Active" : "Inactive"}</span>
            </button>
            <button className="btn btn-icon" onClick={handleTestChatbot}>
              <FaPlay />
            </button>
            <button
              className="btn btn-icon"
              onClick={() => handleEditChatbot(chatbotDetails._id)}
            >
              <FaEdit />
            </button>
            <button className="btn btn-icon" onClick={handleCopyScript}>
              <FaCode />
            </button>
            <button className="btn btn-icon btn-danger" onClick={handleDelete}>
              <FaTrash />
            </button>
          </div>
        </div>
      </div>

      {/* TestChatbot component with a close button */}
      {activeChatbotId && (
        <div>
          <button
            style={{
              position: "absolute",
              top: "auto",

              right: "5px",
              background: "#fff",
              border: "1px solid #ccc",
              cursor: "pointer",
              fontSize: "16px",
              color: "#333",
              borderRadius: "50%",
              width: "20",
              height: "auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background 0.3s, color 0.3s",
              // paddingBottom: "5px",
              zIndex: "999999999999",
            }}
            onClick={handleCloseTestChatbot}
            onMouseOver={(e) => (e.target.style.background = "#f0f0f0")} // Hover effect
            onMouseOut={(e) => (e.target.style.background = "#fff")} // Reset on mouse out
          >
            X
          </button>
          <TestChatbot />
        </div>
      )}

      <div className="row">
        <div className="col-md-4">
          <div className="card p-2">
            <div className="card-body text-center p-0">
              <FaUsers size={20} className="text-primary" />
              <h5 className="mt-1">Active Users</h5>
              <p className="mb-0">{data.totalUsers || 0}</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <Link className="" to={`/dashboard/leads/${chatbotId}`}>
            <div className="card p-2">
              <div className="card-body text-center p-0">
                <FaChartLine size={20} className="text-success" />
                <h5 className="mt-1">Total Leads</h5>
                <p className="mb-0">{data.leads.length || 0}</p>
              </div>
            </div>
          </Link>
        </div>
        <div className="col-md-4">
          <Link className="" to={`/dashboard/conversations/${chatbotId}`}>
            <div className="card p-2">
              <div className="card-body text-center p-0">
                <FaComments size={20} className="text-info" />
                <h5 className="mt-1">Conversations</h5>
                <p className="mb-0">{data.conversations.length || 0}</p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      <div className="row mt-4">
        <div className="col-md-8">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Conversations Overview</h5>
              <Bar data={conversationData} width={15} height={6} />
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Leads Captured</h5>
              <Doughnut data={leadData} width={15} height={13} />
            </div>
          </div>
        </div>
      </div>

      <div className="row mt-4">
        <div className="col-md-12">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Leads by Day</h5>
              <Bar data={leadsByDayData} width={15} height={6} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatbotCard;
