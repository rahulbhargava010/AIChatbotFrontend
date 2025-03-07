import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../config/axios";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaRobot,
  FaHistory,
  FaComment,
  FaCalendar,
  FaMapMarker,
  FaMoneyBill,
  FaBuilding,
  FaDesktop,
  FaBell,
  FaGlobe,
  FaCalendarCheck,
  FaInfoCircle,
} from "react-icons/fa";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import "bootstrap/dist/css/bootstrap.min.css";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

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
        console.log("RES:", response);
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

  const { leadDetail, activityLogs, conversationLogs, followUpLogs } = leadData;
      console.log('leadData', leadData);
  // Data for the bar chart (example: activity frequency)
  const activityLabels = activityLogs.map((log) => log.timestamp);
  const activityData = activityLogs.map((log, index) => index + 1);

  const chartData = {
    labels: activityLabels,
    datasets: [
      {
        label: "Activity Frequency",
        data: activityData,
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Lead Activity Over Time",
      },
    },
  };

  return (
    <div className="container mt-4">
      <div className="row">
        {/* Lead Details Card */}
        <div className="col-md-5 col-lg-5 mb-4">
          <div className="card h-100 p-3">
            <h5 className="card-title text-center">Lead Details</h5>
            <div
              className="list-group list-group-flush"
              style={{ maxHeight: "350px", overflowY: "auto" }}
            >
              <li className="list-group-item d-flex align-items-center">
                <FaUser className="me-2 text-primary" /> <strong></strong>{" "}
                {leadDetail.name}
              </li>
              <li className="list-group-item d-flex align-items-center">
                <FaEnvelope className="me-2 text-primary" />{" "}
                <strong></strong> {leadDetail.email}
              </li>
              <li className="list-group-item d-flex align-items-center">
                <FaPhone className="me-2 text-primary" />{" "}
                <strong></strong> {leadDetail.phone}
              </li>
              <li className="list-group-item d-flex align-items-center">
                <FaRobot className="me-2 text-primary" />{" "}
                <strong>Chatbot:</strong> {leadDetail.chatbotId?.name || "N/A"}
              </li>
              <li className="list-group-item d-flex align-items-center">
                <FaCalendar className="me-2 text-primary" />{" "}
                <strong>Created At:</strong>{" "}
                {new Date(leadDetail.createdAt).toLocaleString()}
              </li>
              <li className="list-group-item d-flex align-items-center">
                <FaBuilding className="me-2 text-primary" />{" "}
                <strong>Status:</strong> {leadDetail.status}
              </li>
              {/* <li className="list-group-item d-flex align-items-center">
                <FaDesktop className="me-2 text-primary" />{" "}
                <strong>Device:</strong> {leadDetail.device}
              </li> */}
              {/* <li className="list-group-item d-flex align-items-center">
                <FaGlobe className="me-2 text-primary" />{" "}
                <strong>IP Address:</strong> {leadDetail.ipAddress}
              </li> */}
              <li className="list-group-item d-flex align-items-center">
                <FaMapMarker className="me-2 text-primary" />{" "}
                <strong>Location:</strong>{" "}
                {leadDetail.location
                  ? `${leadDetail.location.city}, ${leadDetail.location.region}, ${leadDetail.location.country}`
                  : "N/A"}
              </li>
              {/* <li className="list-group-item d-flex align-items-center">
                <FaCalendarCheck className="me-2 text-primary" />{" "}
                <strong>Site Visit:</strong>{" "}
                {leadDetail.siteVisit?.status || "N/A"}
              </li> */}
              {/* <li className="list-group-item d-flex align-items-center">
                <FaInfoCircle className="me-2 text-primary" />{" "}
                <strong>User Agent:</strong> {leadDetail.userAgent}
              </li> */}
            </div>
          </div>
        </div>

        {/* Follow-ups Card */}
        <div className="col-md-5 col-lg-5 mb-4">
          <div className="card h-100 p-3">
            <h6 className="card-title text-center">Follow-ups</h6>
            {followUpLogs && followUpLogs.length > 0 ? (
              <ul className="list-group">
                {followUpLogs.map((log, index) => (
                  <li
                    key={index}
                    className="list-group-item d-flex align-items-center"
                  >
                    <FaCalendar className="me-2 text-primary" /> {log.timestamp}{" "}
                    - {log.msg}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center">No follow-ups available.</p>
            )}
          </div>
        </div>

        {/* Assigned User Card */}
        {/* <div className="col-md-2 col-lg-2 mb-4">
          <div className="card h-100 p-3">
            <h6 className="card-title text-center">Assigned User</h6>
            <ul className="list-group">
              <li className="list-group-item d-flex align-items-center">
                <FaUser className="me-2 text-primary" />{" "}
                {leadDetail.assignedTo?.name || "Unassigned"}
              </li>
            </ul>
          </div>
        </div> */}

        {/* Activities Card */}
        <div className="col-md-6 col-lg-4 mb-4">
          <div className="card h-100 p-3">
            <h6 className="card-title text-center">Activities</h6>
            {activityLogs && activityLogs.length > 0 ? (
              <ul className="list-group">
                {activityLogs.map((log, index) => (
                  <li
                    key={index}
                    className="list-group-item d-flex align-items-center"
                  >
                    <FaHistory className="me-2 text-danger" /> {log.timestamp} -{" "}
                    {log.action}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center">No activity logs available.</p>
            )}
          </div>
        </div>

        {/* Comments Card */}
        <div className="col-md-6 col-lg-4 mb-4">
          <div className="card h-100 p-3">
            <h6 className="card-title text-center">Comments</h6>
            {activityLogs && activityLogs.length > 0 ? (
              <ul className="list-group">
                {activityLogs
                  .filter((log) => log.action.startsWith("Remark Added"))
                  .map((log, index) => (
                    <li
                      key={index}
                      className="list-group-item d-flex align-items-center"
                    >
                      <FaComment className="me-2 text-primary" />{" "}
                      {log.timestamp} -{" "}
                      {log.action.replace("Remark Added: ", "")}
                    </li>
                  ))}
              </ul>
            ) : (
              <p className="text-center">No comments available.</p>
            )}
          </div>
        </div>
        {/* Conversation Card */}
        <div className="col-md-6 col-lg-4 mb-4">
          <div className="card h-100 p-3">
            <h6 className="card-title text-center">Conversation</h6>
            {conversationLogs && conversationLogs.messages && conversationLogs.messages.length > 0 ? (
              <div className="list-group" style={{ maxHeight: "300px", overflowY: "auto" }}>
                {conversationLogs.messages.map((log, index) => (
                  log.sender ? (
                    <div key={index} className="list-group-item d-flex flex-column align-items-start">
                      <div className="d-flex align-items-center">
                        <FaComment className="me-2 text-primary" />
                        <strong>{log?.sender }:</strong>
                      </div>
                      <div className="ms-4 mt-2">
                        <p className="mb-1">{log.text || "No message content"}</p>
                        <small className="text-muted">
                          {new Date(log.timestamp).toLocaleString()}
                        </small>
                      </div>
                    </div>
                  ) : null 
                ))}
              </div>
            ) : (
              <p className="text-center">No conversation logs available.</p>
            )}
          </div>
        </div>


        {/* Future Details Card */}
        {/* <div className="col-md-6 col-lg-4 mb-4">
          <div className="card h-100 p-3">
            <h6 className="card-title text-center">Future Details</h6>
            <ul className="list-group">
              <li className="list-group-item d-flex align-items-center">
                <FaMoneyBill className="me-2 text-primary" />{" "}
                <strong>Budget:</strong> {leadDetail.budget || "N/A"}
              </li>
              <li className="list-group-item d-flex align-items-center">
                <FaBuilding className="me-2 text-primary" />{" "}
                <strong>Property Type:</strong>{" "}
                {leadDetail.propertyType || "N/A"}
                <FaHistory className="me-2 text-danger" /> {log?.timestamp} -{" "}
                {log?.action || "Unknown"}
              </li>
              <li className="list-group-item d-flex align-items-center">
                <FaMapMarker className="me-2 text-primary" />
                <strong>Location:</strong>{" "}
                {leadDetail.location
                  ? `${leadDetail.location.city}, ${leadDetail.location.region}, ${leadDetail.location.country}`
                  : "N/A"}
              </li>
              <li className="list-group-item d-flex align-items-center">
                <FaBell className="me-2 text-primary" />{" "}
                <strong>Notifications:</strong>{" "}
                {leadDetail.notifications ? "Enabled" : "Disabled"}
              </li>
            </ul>
          </div>
        </div> */}

        {/* Activity Chart Card */}
        <div className="col-md-12 mb-4">
          <div className="card h-100 p-3">
            <h6 className="card-title text-center">Lead Activity Over Time</h6>
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadDetails;
