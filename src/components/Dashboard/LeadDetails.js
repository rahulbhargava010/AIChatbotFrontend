import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../config/axios";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaRobot,
  FaHistory,
} from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";

const LeadDetails = () => {
  const [leadData, setLeadData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { leadId } = useParams();

  useEffect(() => {
    if (!leadId) return;

    const fetchLeadDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await api.post(
          "/leads/getLead",
          { lead: leadId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setLeadData(response.data);
      } catch (error) {
        console.error("Error fetching lead details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeadDetails();
  }, [leadId]);

  if (!leadId) return <p className="text-center">No lead selected.</p>;
  if (loading)
    return (
      <div className="text-center">
        <div className="spinner-border" role="status"></div>
      </div>
    );
  if (!leadData || !leadData.leadDetail)
    return <p className="text-center">No lead details found.</p>;

  return (
    <div className="container mt-4" style={{ maxWidth: "600px" }}>
      <div className="card mb-3 p-3">
        <h5 className="card-title text-center">Lead Details</h5>
        <ul className="list-group list-group-flush">
          <li className="list-group-item d-flex align-items-center">
            <FaUser className="me-2 text-primary" /> <strong>Name:</strong>{" "}
            {leadData.leadDetail.name}
          </li>
          <li className="list-group-item d-flex align-items-center">
            <FaEnvelope className="me-2 text-primary" /> <strong>Email:</strong>{" "}
            {leadData.leadDetail.email}
          </li>
          <li className="list-group-item d-flex align-items-center">
            <FaPhone className="me-2 text-primary" /> <strong>Phone:</strong>{" "}
            {leadData.leadDetail.phone}
          </li>
          <li className="list-group-item d-flex align-items-center">
            <FaRobot className="me-2 text-primary" /> <strong>Chatbot:</strong>{" "}
            {leadData.leadDetail.chatbotId?.name || "N/A"}
          </li>
        </ul>
      </div>

      <div className="card p-3">
        <h6 className="card-title text-center">Activity Logs</h6>
        {Array.isArray(leadData.activityLogs) &&
        leadData.activityLogs.length > 0 ? (
          <ul className="list-group">
            {leadData.activityLogs.map((log, index) => (
              <li
                key={index}
                className="list-group-item d-flex align-items-center"
              >
                <FaHistory className="me-2 text-danger" /> {log?.timestamp} -{" "}
                {log?.action || "Unknown"}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center">No activity logs available.</p>
        )}
      </div>
    </div>
  );
};

export default LeadDetails;
