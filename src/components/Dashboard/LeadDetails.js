import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../config/axios";

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

  if (!leadId) return <p>No lead selected.</p>;
  if (loading) return <p>Loading lead details...</p>;
  if (!leadData || !leadData.leadDetail) return <p>No lead details found.</p>;

  return (
    <div className="lead-details">
      {/* <button className="close-btn" onClick={onClose}>
        Close
      </button> */}
      <h3>Lead Details</h3>
      <p>
        <strong>Name:</strong> {leadData.leadDetail.name}
      </p>
      <p>
        <strong>Email:</strong> {leadData.leadDetail.email}
      </p>
      <p>
        <strong>Phone:</strong> {leadData.leadDetail.phone}
      </p>
      <p>
        <strong>Chatbot:</strong> {leadData.leadDetail.chatbotId?.name}
      </p>
      <h4>Activity Logs</h4>
      <ul>
        {leadData.activityLogs.map((log, index) => (
          <li key={index}>
            {log.timestamp} - {log.performedBy?.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LeadDetails;
