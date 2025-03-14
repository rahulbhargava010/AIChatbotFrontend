import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../config/axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import SlidingPane from "react-sliding-pane";
import "react-sliding-pane/dist/react-sliding-pane.css";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaRobot,
  FaHistory,
  FaComment,
  FaCalendar,
  FaMapMarker,
  FaBuilding,
  FaBell,
  FaInfoCircle,
  FaEdit,
  FaTrash,
  FaSave,
  FaTimes,
  FaPlus,
  FaTag,
  FaCheckCircle,
  FaExclamationCircle,
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
import "./LeadDetails.css";

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
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [messages, setMessages] = useState("");
  const [editCommentId, setEditCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState("");
  const [followUps, setFollowUps] = useState([]);
  const [newFollowUp, setNewFollowUp] = useState({
    followUpDate: new Date(),
    notes: "",
    status: "Pending",
  });
  const [editFollowUpId, setEditFollowUpId] = useState(null);
  const [editFollowUpData, setEditFollowUpData] = useState({
    followUpDate: new Date(),
    notes: "",
    status: "Pending",
  });
  const [siteVisitLogs, setSiteVisitLogs] = useState([]);
  const [newSiteVisit, setNewSiteVisit] = useState({
    datetime: new Date(),
    notes: "",
    status: "Scheduled",
  });
  const [editSiteVisitId, setEditSiteVisitId] = useState(null);
  const [editSiteVisitData, setEditSiteVisitData] = useState({
    datetime: new Date(),
    notes: "",
    status: "Scheduled",
  });
  const [activeTab, setActiveTab] = useState("details");

  const [allUsers, setAllUsers] = useState([]);
  const [currentUserRole, setCurrentUserRole] = useState("");
  const [isAssigningLead, setIsAssigningLead] = useState(false);

  const [isFollowUpPaneOpen, setIsFollowUpPaneOpen] = useState(false);
  const [isCommentPaneOpen, setIsCommentPaneOpen] = useState(false);
  const [isSiteVisitPaneOpen, setIsSiteVisitPaneOpen] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

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
        console.log("LEAD_DETAILS:", response.data);
        setLeadData(response.data);
        setComments(response?.data?.commentLogs);
        setFollowUps(
          response?.data?.followUpLogs.map((followUp) => ({
            ...followUp,
            followUpDate: new Date(followUp.followUpDate),
          }))
        );

        // Process site visit logs, converting datetime strings to Date objects
        const updatedSiteVisitLogs =
          response?.data?.SiteVisitLogs?.map((visit) => ({
            ...visit,
            datetime: new Date(visit.datetime),
          })) || [];
        setSiteVisitLogs(updatedSiteVisitLogs);

        // Get current user role from localStorage or user service
        const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
        setCurrentUserRole(userInfo.role || "");

        // Fetch all users if the current user is not a regular user (admin, manager, etc.)
        if (userInfo.role !== "user") {
          fetchAllUsers(token);
        }
      } catch (error) {
        console.error("Error fetching lead details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeadDetails();
  }, [leadId]);

  // Function to fetch all users
  const fetchAllUsers = async (token) => {
    try {
      const response = await api.post("/users/allUsers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("USERS:", response.data);
      setAllUsers(response.data.user);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // Function to handle lead assignment
  const handleAssignLead = async (userId) => {
    if (isAssigningLead) return;

    setIsAssigningLead(true);
    try {
      const token = localStorage.getItem("token");
      const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");

      await api.post(
        "/leads/assign",
        {
          lead: leadId,
          assignedTo: userId === "unassigned" ? null : userId,
          user: userInfo._id,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Refresh lead data to get updated assignment
      const response = await api.post(
        "/leads/getLead",
        { lead: leadId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setLeadData(response.data);
      setMessages("Lead assignment updated successfully!");
    } catch (error) {
      setMessages(error.response?.data?.error || "Failed to assign lead.");
    } finally {
      setIsAssigningLead(false);
    }
  };

  // Add a new comment
  const handleAddComment = async () => {
    if (newComment.trim() === "") return;
    try {
      const token = localStorage.getItem("token");
      const response = await api.post(
        "/leads/saveComment",
        {
          leadId,
          comment: newComment,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const comment = {
        _id: response.data.comment._id,
        comment: newComment,
        createdAt: response.data.comment.createdAt,
      };

      setMessages("Comment added successfully!");
      setComments([...comments, comment]);
      setNewComment("");
      setIsCommentPaneOpen(false);
    } catch (error) {
      setMessages(error.response?.data?.error || "Failed to add comment.");
    }
  };

  // Edit a comment
  const handleEditComment = async (id) => {
    const commentToEdit = comments.find((comment) => comment._id === id);
    if (commentToEdit) {
      setEditCommentId(id);
      setEditCommentText(commentToEdit.comment);
    }
  };

  // Save the edited comment
  const handleSaveEdit = async () => {
    if (editCommentText.trim() === "") return;
    try {
      const token = localStorage.getItem("token");
      const response = await api.post(
        "/leads/editComment",
        {
          commentId: editCommentId,
          comment: editCommentText,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const updatedComments = comments.map((comment) =>
        comment._id === editCommentId
          ? { ...comment, comment: editCommentText }
          : comment
      );

      setComments(updatedComments);
      setEditCommentId(null);
      setEditCommentText("");
    } catch (error) {
      setMessages(error.response?.data?.error || "Failed to edit comment.");
    }
  };

  const handleCancelEdit = () => {
    setEditCommentId(null);
    setEditCommentText("");
  };

  // Delete a comment
  const handleDeleteComment = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await api.post(
        "/leads/deleteComment",
        {
          commentId: id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const updatedComments = comments.filter((comment) => comment._id !== id);
      setComments(updatedComments);
    } catch (error) {
      setMessages(error.response?.data?.error || "Failed to delete comment.");
    }
  };

  // Create a follow-up
  const handleCreateFollowUp = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.post(
        "/followup/save",
        { ...newFollowUp, leadId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setFollowUps([
        ...followUps,
        {
          ...response.data.followUp,
          followUpDate: new Date(response.data.followUp.followUpDate),
        },
      ]);
      setNewFollowUp({
        followUpDate: new Date(),
        notes: "",
        status: "Pending",
      });
      setIsFollowUpPaneOpen(false);
    } catch (error) {
      console.error("Error creating follow-up:", error);
    }
  };

  // Update a follow-up
  const handleUpdateFollowUp = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.post(
        "/followup/update",
        {
          followUpId: editFollowUpId,
          editFollowUp: editFollowUpData,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const updatedFollowUps = followUps.map((followUp) =>
        followUp._id === editFollowUpId ? response.data.followUp : followUp
      );
      setFollowUps(updatedFollowUps);

      setEditFollowUpId(null);
      setEditFollowUpData({
        followUpDate: new Date(),
        notes: "",
        status: "Pending",
      });
    } catch (error) {
      console.error("Error updating follow-up:", error);
    }
  };

  // Delete a follow-up
  const handleDeleteFollowUp = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await api.post(
        "/followup/delete",
        {
          followUpId: id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setFollowUps(followUps.filter((f) => f._id !== id));
    } catch (error) {
      console.error("Error deleting follow-up:", error);
    }
  };

  const handleEditFollowUp = (id) => {
    const followUpToEdit = followUps.find((followUp) => followUp._id === id);
    if (followUpToEdit) {
      setEditFollowUpId(id);
      setEditFollowUpData({
        followUpDate: followUpToEdit.followUpDate,
        notes: followUpToEdit.notes,
        status: followUpToEdit.status,
      });
    }
  };

  const handleCancelEditFollowUp = () => {
    setEditFollowUpId(null);
    setEditFollowUpData({
      followUpDate: new Date(),
      notes: "",
      status: "Pending",
    });
  };

  // Create a site visit
  const handleCreateSiteVisit = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.post(
        "/sitevisit/save",
        { ...newSiteVisit, leadId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setSiteVisitLogs([
        ...siteVisitLogs,
        { ...response.data, datetime: new Date(response.data.datetime) },
      ]);
      setNewSiteVisit({ datetime: new Date(), notes: "", status: "Scheduled" });
      setIsSiteVisitPaneOpen(false);
      setMessages("Site visit scheduled successfully!");
    } catch (error) {
      console.error("Error creating site visit:", error);
      setMessages("Failed to schedule site visit.");
    }
  };

  // Update a site visit
  const handleUpdateSiteVisit = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.post(
        "/sitevisit/update",
        {
          editSiteVisit: {
            _id: editSiteVisitId,
            datetime: editSiteVisitData.datetime,
            notes: editSiteVisitData.notes,
            status: editSiteVisitData.status,
            leadId: leadId,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setSiteVisitLogs(
        siteVisitLogs.map((sv) =>
          sv._id === editSiteVisitId
            ? { ...response.data, datetime: new Date(response.data.datetime) }
            : sv
        )
      );
      setEditSiteVisitId(null);
      setEditSiteVisitData({
        datetime: new Date(),
        notes: "",
        status: "Scheduled",
      });
      setMessages("Site visit updated successfully!");
    } catch (error) {
      console.error("Error updating site visit:", error);
      setMessages("Failed to update site visit.");
    }
  };

  // Delete a site visit
  const handleDeleteSiteVisit = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await api.post(
        "/sitevisit/delete",
        { id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setSiteVisitLogs(siteVisitLogs.filter((sv) => sv._id !== id));
      setMessages("Site visit deleted successfully!");
    } catch (error) {
      console.error("Error deleting site visit:", error);
      setMessages("Failed to delete site visit.");
    }
  };

  const handleUpdateLeadStatus = async (newStatus) => {
    if (isUpdatingStatus) return;

    setIsUpdatingStatus(true);
    try {
      const token = localStorage.getItem("token");
      const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");

      await api.post(
        "/leads/updateStatus",
        {
          lead: leadId,
          status: newStatus,
          user: userInfo._id,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Refresh lead data to get updated status
      const response = await api.post(
        "/leads/getLead",
        { lead: leadId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setLeadData(response.data);
      setMessages("Lead status updated successfully!");
    } catch (error) {
      setMessages(
        error.response?.data?.error || "Failed to update lead status."
      );
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleEditSiteVisit = (siteVisit) => {
    setEditSiteVisitId(siteVisit._id);
    setEditSiteVisitData({
      datetime: new Date(siteVisit.datetime),
      notes: siteVisit.notes,
      status: siteVisit.status,
    });
  };

  const handleCancelEditSiteVisit = () => {
    setEditSiteVisitId(null);
    setEditSiteVisitData({
      datetime: new Date(),
      notes: "",
      status: "Scheduled",
    });
  };

  const handleFollowUpInputChange = (e) => {
    const { name, value } = e.target;
    setEditFollowUpData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleDateChange = (date) => {
    setEditFollowUpData((prevData) => ({
      ...prevData,
      followUpDate: date,
    }));
  };

  // Site visit handlers
  const handleSiteVisitInputChange = (e) => {
    const { name, value } = e.target;
    setEditSiteVisitData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSiteVisitDateChange = (date) => {
    setEditSiteVisitData((prevData) => ({
      ...prevData,
      datetime: date,
    }));
  };

  if (!leadId) return <p className="text-center">No lead selected.</p>;
  if (loading)
    return (
      <div className="loading-container">
        <div className="spinner-pulse"></div>
        <p>Loading lead details...</p>
      </div>
    );
  if (!leadData || !leadData.leadDetail)
    return <p className="text-center">No lead details found.</p>;

  const { leadDetail, activityLogs, conversationLogs } = leadData;

  // Data for the bar chart (example: activity frequency)
  const activityLabels = activityLogs.map((log) => {
    const date = new Date(log.timestamp);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  });

  const activityData = activityLogs.map((log, index) => index + 1);

  const chartData = {
    labels: activityLabels,
    datasets: [
      {
        label: "Activity Frequency",
        data: activityData,
        backgroundColor: "rgba(59, 130, 246, 0.6)",
        borderColor: "rgba(59, 130, 246, 1)",
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          font: {
            family: "'Inter', sans-serif",
            size: 12,
          },
        },
      },
      title: {
        display: true,
        text: "Lead Activity Over Time",
        font: {
          family: "'Inter', sans-serif",
          size: 16,
          weight: "600",
        },
      },
      tooltip: {
        backgroundColor: "rgba(17, 24, 39, 0.9)",
        titleFont: {
          family: "'Inter', sans-serif",
          size: 14,
        },
        bodyFont: {
          family: "'Inter', sans-serif",
          size: 12,
        },
        padding: 12,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        ticks: {
          autoSkip: true,
          maxRotation: 45,
          minRotation: 0,
          font: {
            family: "'Inter', sans-serif",
            size: 11,
          },
        },
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(243, 244, 246, 1)",
        },
        ticks: {
          font: {
            family: "'Inter', sans-serif",
            size: 11,
          },
        },
      },
    },
    animation: {
      duration: 1000,
      easing: "easeOutQuart",
    },
  };

  const getStatusBadgeClass = (status) => {
    switch (status.toLowerCase()) {
      case "new":
        return "status-badge new";
      case "follow-up":
        return "status-badge follow-up";
      case "booked":
        return "status-badge booked";
      case "lost":
        return "status-badge lost";
      case "duplicate":
        return "status-badge duplicate";
      case "sitevisitscheduled":
        return "status-badge sitevisitscheduled";
      case "sitevisitdone":
        return "status-badge sitevisitdone";
      case "pending":
      case "scheduled":
        return "status-badge pending";
      case "completed":
        return "status-badge completed";
      case "cancelled":
        return "status-badge cancelled";
      default:
        return "status-badge";
    }
  };

  const renderLeadDetails = () => (
    <div className="card lead-card">
      <div className="card-header lead-profile-header">
        <h5 className="card-title">
          <FaUser className="header-icon" /> Lead Profile
        </h5>
        {currentUserRole === "user" ? (
          // If current user role is "user", just show the status badge
          <span className={`lead-status ${leadDetail.status.toLowerCase()}`}>
            {leadDetail.status}
          </span>
        ) : (
          // For admin/manager roles, show the dropdown
          <div className="assignment-dropdown">
            <select
              className="form-control assignment-select"
              value={leadDetail.status}
              onChange={(e) => handleUpdateLeadStatus(e.target.value)}
              disabled={isUpdatingStatus}
            >
              <option value="New">New</option>
              <option value="Follow-up">Follow-up</option>
              <option value="Booked">Booked</option>
              <option value="Lost">Lost</option>
              <option value="Duplicate">Duplicate</option>
              <option value="SiteVisitScheduled">Site Visit Scheduled</option>
              <option value="SiteVisitDone">Site Visit Done</option>
            </select>
            {isUpdatingStatus && (
              <div
                className="spinner-border spinner-border-sm ms-2"
                role="status"
              ></div>
            )}
          </div>
        )}
      </div>
      <div className="card-body">
        <div className="lead-info-grid">
          <div className="lead-info-item">
            <div className="info-label">Name</div>
            <div className="info-value">{leadDetail.name}</div>
          </div>

          <div className="lead-info-item">
            <div className="info-label">Email</div>
            <div className="info-value email-value">
              <FaEnvelope className="me-2 info-icon" />
              {leadDetail.email}
            </div>
          </div>

          <div className="lead-info-item">
            <div className="info-label">Phone</div>
            <div className="info-value">
              <FaPhone className="me-2 info-icon" />
              {leadDetail.phone}
            </div>
          </div>

          <div className="lead-info-item">
            <div className="info-label">Chatbot</div>
            <div className="info-value">
              <FaRobot className="me-2 info-icon" />
              {leadDetail.chatbotId?.name || "N/A"}
            </div>
          </div>

          <div className="lead-info-item">
            <div className="info-label">Created</div>
            <div className="info-value">
              <FaCalendar className="me-2 info-icon" />
              {new Date(leadDetail.createdAt).toLocaleString()}
            </div>
          </div>

          <div className="lead-info-item">
            <div className="info-label">Location</div>
            <div className="info-value">
              <FaMapMarker className="me-2 info-icon" />
              {leadDetail.location
                ? `${leadDetail.location.city}, ${leadDetail.location.region}, ${leadDetail.location.country}`
                : "N/A"}
            </div>
          </div>
          <div className="lead-info-item">
            <div className="info-label">Coordinates</div>
            <div className="info-value">
              <FaMapMarker className="me-2 info-icon" />
              {leadDetail.location &&
              (leadDetail.location.lat || leadDetail.location.lng)
                ? `${leadDetail.location.lat || "N/A"}, ${
                    leadDetail.location.lng || "N/A"
                  }`
                : "N/A"}
            </div>
          </div>
          <div className="lead-info-item">
            <div className="info-label">Assigned To</div>
            <div className="info-value">
              <FaBuilding className="me-2 info-icon" />
              {currentUserRole === "user" ? (
                // If current user role is "user", just show the assigned user name
                leadDetail.assignedTo ? (
                  leadDetail.assignedTo.name
                ) : (
                  "Not Assigned"
                )
              ) : (
                // For admin/manager roles, show the dropdown
                <div className="assignment-dropdown">
                  <select
                    className="form-control assignment-select"
                    value={
                      leadDetail.assignedTo
                        ? leadDetail.assignedTo._id
                        : "unassigned"
                    }
                    onChange={(e) => handleAssignLead(e.target.value)}
                    disabled={isAssigningLead}
                  >
                    <option value="unassigned">Not Assigned</option>
                    {allUsers.map((user) => (
                      <option key={user._id} value={user._id}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                  {isAssigningLead && (
                    <div
                      className="spinner-border spinner-border-sm ms-2"
                      role="status"
                    ></div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFollowUps = () => (
    <div className="card lead-card">
      <div className="card-header">
        <h5 className="card-title">
          <FaBell className="header-icon" /> Follow-ups
        </h5>
      </div>
      <div className="card-body scrollable-content">
        {followUps.length === 0 ? (
          <div className="empty-state">
            <FaBell className="empty-icon" />
            <p>No follow-ups scheduled</p>
            <button
              className="btn btn-outline-primary"
              onClick={() => setIsFollowUpPaneOpen(true)}
            >
              Schedule now
            </button>
          </div>
        ) : (
          followUps.map((followUp) => (
            <div key={followUp._id} className="list-item">
              {editFollowUpId === followUp._id ? (
                <div className="edit-form">
                  <div className="form-group mb-3">
                    <label>Date & Time</label>
                    <DatePicker
                      selected={new Date(editFollowUpData.followUpDate)}
                      onChange={handleDateChange}
                      showTimeSelect
                      timeFormat="HH:mm"
                      timeIntervals={15}
                      dateFormat="MMM d, yyyy h:mm aa"
                      className="form-control"
                    />
                  </div>
                  <div className="form-group mb-3">
                    <label>Notes</label>
                    <textarea
                      className="form-control"
                      placeholder="Notes"
                      name="notes"
                      value={editFollowUpData.notes}
                      onChange={handleFollowUpInputChange}
                    />
                  </div>
                  <div className="form-group mb-3">
                    <label>Status</label>
                    <select
                      className="form-control"
                      name="status"
                      value={editFollowUpData.status}
                      onChange={handleFollowUpInputChange}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div className="edit-actions">
                    <button
                      className="btn btn-success save-btn"
                      onClick={handleUpdateFollowUp}
                    >
                      <FaSave className="me-1" /> Save
                    </button>
                    <button
                      className="btn btn-outline-secondary cancel-btn"
                      onClick={handleCancelEditFollowUp}
                    >
                      <FaTimes className="me-1" /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className={`follow-up-item ${followUp.status.toLowerCase()}`}
                >
                  <div className="follow-up-header">
                    <div className="follow-up-date">
                      <FaCalendar className="me-1" />
                      {followUp.followUpDate.toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "numeric",
                        minute: "numeric",
                        hour12: true,
                      })}
                    </div>
                    <span className={getStatusBadgeClass(followUp.status)}>
                      {followUp.status === "Pending" ? (
                        <FaExclamationCircle className="me-1" />
                      ) : (
                        <FaCheckCircle className="me-1" />
                      )}
                      {followUp.status}
                    </span>
                  </div>
                  <div className="follow-up-body">
                    <p className="follow-up-notes">{followUp.notes}</p>
                  </div>
                  <div className="item-actions">
                    <button
                      className="btn btn-sm btn-outline-primary me-2 edit-btn"
                      onClick={() => handleEditFollowUp(followUp._id)}
                    >
                      <FaEdit className="me-1" /> Edit
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger delete-btn"
                      onClick={() => handleDeleteFollowUp(followUp._id)}
                    >
                      <FaTrash className="me-1" /> Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderSiteVisits = () => (
    <div className="card lead-card">
      <div className="card-header">
        <h5 className="card-title">
          <FaMapMarker className="header-icon" /> Site Visits
        </h5>
      </div>
      <div className="card-body scrollable-content">
        {siteVisitLogs.length === 0 ? (
          <div className="empty-state">
            <FaMapMarker className="empty-icon" />
            <p>No site visits scheduled</p>
            <button
              className="btn btn-outline-primary"
              onClick={() => setIsSiteVisitPaneOpen(true)}
            >
              Schedule visit
            </button>
          </div>
        ) : (
          siteVisitLogs.map((siteVisit) => (
            <div key={siteVisit._id} className="list-item">
              {editSiteVisitId === siteVisit._id ? (
                <div className="edit-form">
                  <div className="form-group mb-3">
                    <label>Date & Time</label>
                    <DatePicker
                      selected={new Date(editSiteVisitData.datetime)}
                      onChange={handleSiteVisitDateChange}
                      showTimeSelect
                      timeFormat="HH:mm"
                      timeIntervals={15}
                      dateFormat="MMM d, yyyy h:mm aa"
                      className="form-control"
                    />
                  </div>
                  <div className="form-group mb-3">
                    <label>Notes</label>
                    <textarea
                      className="form-control"
                      placeholder="Notes"
                      name="notes"
                      value={editSiteVisitData.notes}
                      onChange={handleSiteVisitInputChange}
                    />
                  </div>
                  <div className="form-group mb-3">
                    <label>Status</label>
                    <select
                      className="form-control"
                      name="status"
                      value={editSiteVisitData.status}
                      onChange={handleSiteVisitInputChange}
                    >
                      <option value="Scheduled">Scheduled</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div className="edit-actions">
                    <button
                      className="btn btn-success save-btn"
                      onClick={handleUpdateSiteVisit}
                    >
                      <FaSave className="me-1" /> Save
                    </button>
                    <button
                      className="btn btn-outline-secondary cancel-btn"
                      onClick={handleCancelEditSiteVisit}
                    >
                      <FaTimes className="me-1" /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className={`follow-up-item ${siteVisit.status.toLowerCase()}`}
                >
                  <div className="follow-up-header">
                    <div className="follow-up-date">
                      <FaCalendar className="me-1" />
                      {new Date(siteVisit.datetime).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "numeric",
                        minute: "numeric",
                        hour12: true,
                      })}
                    </div>
                    <span className={getStatusBadgeClass(siteVisit.status)}>
                      {siteVisit.status === "Scheduled" ? (
                        <FaExclamationCircle className="me-1" />
                      ) : (
                        <FaCheckCircle className="me-1" />
                      )}
                      {siteVisit.status}
                    </span>
                  </div>
                  <div className="follow-up-body">
                    <p className="follow-up-notes">{siteVisit.notes}</p>
                  </div>
                  <div className="item-actions">
                    <button
                      className="btn btn-sm btn-outline-primary me-2 edit-btn"
                      onClick={() => handleEditSiteVisit(siteVisit)}
                    >
                      <FaEdit className="me-1" /> Edit
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger delete-btn"
                      onClick={() => handleDeleteSiteVisit(siteVisit._id)}
                    >
                      <FaTrash className="me-1" /> Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderActivities = () => (
    <div className="card lead-card">
      <div className="card-header">
        <h5 className="card-title">
          <FaHistory className="header-icon" /> Activities
        </h5>
      </div>
      <div className="card-body scrollable-content">
        {activityLogs && activityLogs.length > 0 ? (
          <div className="timeline">
            {activityLogs.map((log, index) => (
              <div key={index} className="timeline-item">
                <div className="timeline-indicator"></div>
                <div className="timeline-content">
                  <span className="timeline-date">
                    {new Date(log.timestamp).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "numeric",
                      hour12: true,
                    })}
                  </span>
                  <p className="timeline-text">{log.action}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <FaHistory className="empty-icon" />
            <p>No activity logs available</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderComments = () => (
    <div className="card lead-card">
      <div className="card-header">
        <h5 className="card-title">
          <FaComment className="header-icon" /> Comments
        </h5>
      </div>
      <div className="card-body scrollable-content">
        {comments && comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment._id} className="comment-item">
              {editCommentId === comment._id ? (
                <div className="edit-comment">
                  <textarea
                    className="form-control mb-3"
                    value={editCommentText}
                    onChange={(e) => setEditCommentText(e.target.value)}
                  />
                  <div className="edit-actions">
                    <button
                      className="btn btn-success save-btn"
                      onClick={handleSaveEdit}
                    >
                      <FaSave className="me-1" /> Save
                    </button>
                    <button
                      className="btn btn-outline-secondary cancel-btn"
                      onClick={handleCancelEdit}
                    >
                      <FaTimes className="me-1" /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="comment-content">
                  <p>{comment.comment}</p>
                  <div className="comment-footer">
                    <small className="comment-date">
                      {new Date(comment.createdAt).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "numeric",
                        minute: "numeric",
                        hour12: true,
                      })}
                    </small>
                    <div className="item-actions">
                      <button
                        className="btn btn-sm btn-outline-primary me-2 edit-btn"
                        onClick={() => handleEditComment(comment._id)}
                      >
                        <FaEdit className="me-1" /> Edit
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger delete-btn"
                        onClick={() => handleDeleteComment(comment._id)}
                      >
                        <FaTrash className="me-1" /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="empty-state">
            <FaComment className="empty-icon" />
            <p>No comments available</p>
            <button
              className="btn btn-outline-primary"
              onClick={() => setIsCommentPaneOpen(true)}
            >
              Add comment
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderConversation = () => (
    <div className="card lead-card">
      <div className="card-header">
        <h5 className="card-title">
          <FaComment className="header-icon" /> Conversation
        </h5>
      </div>
      <div className="card-body scrollable-content">
        {conversationLogs &&
        conversationLogs.messages &&
        conversationLogs.messages.length > 0 ? (
          <div className="conversation-container">
            {conversationLogs.messages.map((log, index) =>
              log.sender ? (
                <div
                  key={index}
                  className={`chat-bubble ${
                    log.sender.toLowerCase() === "user" ? "user" : "bot"
                  }`}
                >
                  <div className="chat-header">
                    <strong>{log.sender}</strong>
                    <small className="chat-time">
                      {new Date(log.timestamp).toLocaleString("en-US", {
                        hour: "numeric",
                        minute: "numeric",
                        hour12: true,
                      })}
                    </small>
                  </div>
                  <p>{log.text || "No message content"}</p>
                </div>
              ) : null
            )}
          </div>
        ) : (
          <div className="empty-state">
            <FaComment className="empty-icon" />
            <p>No conversation logs available</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderActivityChart = () => (
    <div className="card lead-card">
      <div className="card-header">
        <h5 className="card-title">
          <FaInfoCircle className="header-icon" /> Activity Analysis
        </h5>
      </div>
      <div className="card-body chart-container">
        <Bar data={chartData} options={chartOptions} />
      </div>
    </div>
  );

  return (
    <div className="lead-details-container">
      {/* Top Action Bar */}
      <div className="action-bar">
        <h2 className="page-title">
          <span className="lead-name">{leadDetail.name}</span>
          <span
            className={`status-indicator ${leadDetail.status.toLowerCase()}`}
          ></span>
        </h2>
        <div className="action-buttons">
          <button
            className="btn btn-primary action-btn"
            onClick={() => setIsFollowUpPaneOpen(true)}
          >
            <FaPlus className="me-1" /> FollowUp
          </button>
          <button
            className="btn btn-primary action-btn"
            onClick={() => setIsCommentPaneOpen(true)}
          >
            <FaPlus className="me-1" /> Comment
          </button>
          <button
            className="btn btn-primary action-btn"
            onClick={() => setIsSiteVisitPaneOpen(true)}
          >
            <FaPlus className="me-1" /> Site Visit
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab-button ${activeTab === "details" ? "active" : ""}`}
          onClick={() => setActiveTab("details")}
        >
          <FaUser className="me-1" /> Details
        </button>
        <button
          className={`tab-button ${activeTab === "engagement" ? "active" : ""}`}
          onClick={() => setActiveTab("engagement")}
        >
          <FaHistory className="me-1" /> Engagement
        </button>
        <button
          className={`tab-button ${activeTab === "analysis" ? "active" : ""}`}
          onClick={() => setActiveTab("analysis")}
        >
          <FaInfoCircle className="me-1" /> Analysis
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === "details" && (
          <>
            <div className="row">
              <div className="col-md-6">
                {renderLeadDetails()}
                {renderFollowUps()}
              </div>
              <div className="col-md-6">
                {renderComments()}
                {renderSiteVisits()}
              </div>
            </div>
          </>
        )}

        {activeTab === "engagement" && (
          <>
            <div className="row">
              <div className="col-md-6">{renderActivities()}</div>
              <div className="col-md-6">{renderConversation()}</div>
            </div>
          </>
        )}

        {activeTab === "analysis" && (
          <>
            <div className="row">
              <div className="col-md-12">{renderActivityChart()}</div>
            </div>
          </>
        )}
      </div>

      {/* Follow-Up Sliding Pane */}
      <SlidingPane
        className="modern-sliding-pane"
        isOpen={isFollowUpPaneOpen}
        title="Schedule Follow-Up"
        width="400px"
        onRequestClose={() => setIsFollowUpPaneOpen(false)}
      >
        <div className="pane-content">
          <div className="form-group mb-4">
            <label className="form-label">Date & Time</label>
            <DatePicker
              selected={newFollowUp.followUpDate}
              onChange={(date) =>
                setNewFollowUp({ ...newFollowUp, followUpDate: date })
              }
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              dateFormat="MMM d, yyyy h:mm aa"
              className="form-control"
              placeholderText="Select date and time"
            />
          </div>
          <div className="form-group mb-4">
            <label className="form-label">Notes</label>
            <textarea
              className="form-control"
              placeholder="What needs to be discussed?"
              value={newFollowUp.notes}
              rows={4}
              onChange={(e) =>
                setNewFollowUp({ ...newFollowUp, notes: e.target.value })
              }
            ></textarea>
          </div>
          <div className="form-group mb-4">
            <label className="form-label">Status</label>
            <select
              className="form-control"
              value={newFollowUp.status}
              onChange={(e) =>
                setNewFollowUp({ ...newFollowUp, status: e.target.value })
              }
            >
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <div className="pane-actions">
            <button
              className="btn btn-primary w-100 add-followup-btn"
              onClick={handleCreateFollowUp}
            >
              <FaPlus className="me-2" />
              Schedule Follow-Up
            </button>
          </div>
        </div>
      </SlidingPane>

      {/* Comment Sliding Pane */}
      <SlidingPane
        className="modern-sliding-pane"
        isOpen={isCommentPaneOpen}
        title="Add Comment"
        width="400px"
        onRequestClose={() => setIsCommentPaneOpen(false)}
      >
        <div className="pane-content">
          <div className="form-group mb-4">
            <label className="form-label">Comment</label>
            <textarea
              className="form-control"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Enter your comment here..."
              rows={6}
            ></textarea>
          </div>
          <div className="pane-actions">
            <button
              className="btn btn-primary w-100 add-comment-btn"
              onClick={handleAddComment}
            >
              <FaPlus className="me-2" />
              Add Comment
            </button>
          </div>
        </div>
      </SlidingPane>

      {/* Site Visit Sliding Pane */}
      <SlidingPane
        className="modern-sliding-pane"
        isOpen={isSiteVisitPaneOpen}
        title="Schedule Site Visit"
        width="400px"
        onRequestClose={() => setIsSiteVisitPaneOpen(false)}
      >
        <div className="pane-content">
          <div className="form-group mb-4">
            <label className="form-label">Date & Time</label>
            <DatePicker
              selected={newSiteVisit.datetime}
              onChange={(date) =>
                setNewSiteVisit({ ...newSiteVisit, datetime: date })
              }
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              dateFormat="MMM d, yyyy h:mm aa"
              className="form-control"
              placeholderText="Select date and time"
            />
          </div>
          <div className="form-group mb-4">
            <label className="form-label">Notes</label>
            <textarea
              className="form-control"
              placeholder="Visit details and preparation notes"
              value={newSiteVisit.notes}
              rows={4}
              onChange={(e) =>
                setNewSiteVisit({ ...newSiteVisit, notes: e.target.value })
              }
            ></textarea>
          </div>
          <div className="form-group mb-4">
            <label className="form-label">Status</label>
            <select
              className="form-control"
              value={newSiteVisit.status}
              onChange={(e) =>
                setNewSiteVisit({ ...newSiteVisit, status: e.target.value })
              }
            >
              <option value="Scheduled">Scheduled</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <div className="pane-actions">
            <button
              className="btn btn-primary w-100 add-site-visit-btn"
              onClick={handleCreateSiteVisit}
            >
              <FaPlus className="me-2" />
              Schedule Site Visit
            </button>
          </div>
        </div>
      </SlidingPane>
    </div>
  );
};

export default LeadDetails;
