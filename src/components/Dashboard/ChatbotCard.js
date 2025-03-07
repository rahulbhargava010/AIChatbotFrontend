import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";
import { Bar, Doughnut } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import api from "../config/axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "./ChatbotDashboard.css";
import "./Dashboard.css";
import {
  FaRobot,
  FaChartBar,
  FaUsers,
  FaPlay,
  FaEdit,
  FaComments,
  FaChartLine,
  FaCode,
  FaTrash,
} from "react-icons/fa";

Chart.register(...registerables);

const ChatbotCard = () => {
  const { chatbotId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  console.log("DATA:", data);

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
      } catch (err) {
        setError(err.response?.data?.error || "Failed to fetch data.");
      }
      setLoading(false);
    };
    fetchChatbotCard();
  }, [chatbotId]);

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

  // Extract labels and values
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

  const handleCopyScript = () => {
    // Logic to copy script
    console.log("Script copied!");
  };

  const handleDelete = () => {
    // Logic to delete chatbot
    console.log("Chatbot deleted!");
  };

  // Leads by Day (Bar Chart)
  const leadsByDate = leads.reduce((acc, lead) => {
    const date = new Date(lead.createdAt).toLocaleDateString(); // Format as 'MM/DD/YYYY'
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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="d-flex align-items-center">
          <FaRobot className="me-2" /> {chatbotDetails.name}
        </h2>
        <span
          className={`badge ${
            chatbotDetails.isActive === "active" ? "bg-success" : "bg-danger"
          } p-2 fs-5`}
        >
          {chatbotDetails.isActive === "active" ? "Active" : "Inactive"}
        </span>
      </div>

      <div className="row">
        <div className="col-md-2 ">
          <div className="card p-2">
            <div className="card-body text-center p-0">
              <FaUsers size={20} className="text-primary" />
              <h5 className="mt-1">Active Users</h5>
              <p className="mb-0">{data.totalUsers || 0}</p>
            </div>
          </div>
        </div>
        <div className="col-md-2">
          <Link className="btn" to={`/dashboard/leads/${chatbotId}`}>
              <div className="card p-2">
                <div className="card-body text-center p-0">
                  <FaChartLine size={20} className="text-success" />
                  <h5 className="mt-1">Total Leads</h5>
                  <p className="mb-0">{data.leads.length || 0}</p>
                </div>
              </div>
            </Link>
        </div>
        <div className="col-md-2">
            <Link
                className="btn"
                to={`/dashboard/conversations/${chatbotId}`}
              >
                <div className="card p-2">
                  <div className="card-body text-center p-0">
                    <FaComments size={20} className="text-info" />
                    <h5 className="mt-1">Conversations</h5>
                    <p className="mb-0">{data.conversations.length || 0}</p>
                  </div>
                </div>
          </Link>
        </div>

        <div className="col-md-6 ">
          <div className="card ">
            <div className="card-body chatbot-actions text-center d-flex justify-content-around align-content-center">
              <Link className="btn" to={`/dashboard/chatbot-test/${chatbotId}`}>
                <FaPlay />
              </Link>
              <Link className="btn" to={`/dashboard/update/${chatbotId}`}>
                <FaEdit />
              </Link>
              {/* <Link className="btn" to={`/dashboard/leads/${chatbotId}`}>
                <FaUsers />
              </Link>
              <Link
                className="btn"
                to={`/dashboard/conversations/${chatbotId}`}
              >
                <FaComments />
              </Link> */}
              <Link className="btn" to={`/dashboard/stats/${chatbotId}`}>
                <FaChartLine />
              </Link>
              <a
                className="btn"
                href="#"
                onClick={(e) => handleCopyScript(chatbotId, e)}
              >
                <FaCode />
              </a>
              <a
                className="btn btn-danger"
                href="#"
                onClick={(e) => handleDelete(chatbotId, e)}
              >
                <FaTrash />
              </a>
            </div>
          </div>
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
