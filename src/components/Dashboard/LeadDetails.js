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
import SiteVisit from "./SiteVisit";
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
  const [editFollowUpId, setEditFollowUpId] = useState(null); // Now, store the ID of the FollowUp being edited
  const [editFollowUpData, setEditFollowUpData] = useState({
    // Stores temporary edited data
    followUpDate: new Date(),
    notes: "",
    status: "Pending",
  });
  const [siteVisitLogs, setSiteVisitLogs] = useState([]);

  const [isFollowUpPaneOpen, setIsFollowUpPaneOpen] = useState(false);
  const [isCommentPaneOpen, setIsCommentPaneOpen] = useState(false);
  const [isSiteVisitPaneOpen, setIsSiteVisitPaneOpen] = useState(false);

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
        setComments(response?.data?.commentLogs);
        setFollowUps(
          response?.data?.followUpLogs.map((followUp) => ({
            ...followUp,
            followUpDate: new Date(followUp.followUpDate),
          }))
        );
        setSiteVisitLogs(response?.data?.SiteVisitLogs);
      } catch (error) {
        console.error("Error fetching lead details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeadDetails();
  }, [leadId]);

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
      setIsFollowUpPaneOpen(false); // Close the panel after creation
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

      // Update the followUps state with the updated follow-up
      const updatedFollowUps = followUps.map((followUp) =>
        followUp._id === editFollowUpId ? response.data.followUp : followUp
      );
      setFollowUps(updatedFollowUps);

      setEditFollowUpId(null); // Clear the ID of the follow-up being edited
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

  if (!leadId) return <p className="text-center">No lead selected.</p>;
  if (loading)
    return (
      <div className="text-center">
        <div className="spinner-border" role="status"></div>
      </div>
    );
  if (!leadData || !leadData.leadDetail)
    return <p className="text-center">No lead details found.</p>;

  const { leadDetail, activityLogs, conversationLogs } = leadData;

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
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Lead Activity Over Time",
      },
    },
    scales: {
      //Added scales to fix chart warnings
      x: {
        ticks: {
          autoSkip: true,
          maxRotation: 45,
          minRotation: 0,
        },
      },
    },
  };

  return (
    <div className="container mt-4">
      <div className="row">
        {/* Top Buttons */}
        <div className="col-md-12 mb-3">
          <div className="d-flex justify-content-end">
            <button
              className="btn btn-primary me-2"
              onClick={() => setIsFollowUpPaneOpen(true)}
            >
              <FaPlus className="me-1" /> Add Follow-Up
            </button>
            <button
              className="btn btn-primary me-2"
              onClick={() => setIsCommentPaneOpen(true)}
            >
              <FaPlus className="me-1" /> Add Comment
            </button>
            {/* <button
              className="btn btn-primary"
              onClick={() => setIsSiteVisitPaneOpen(true)}
            >
              <FaPlus className="me-1" /> Add Site Visit
            </button> */}
          </div>
        </div>

        {/* Lead Details Card */}
        <div className="col-md-6 mb-4">
          <div className="card lead-card">
            <div className="card-header">
              <h5 className="card-title">Lead Details</h5>
            </div>
            <div className="card-body">
              <ul className="list-group list-group-flush">
                <li className="list-group-item">
                  <FaUser className="me-2 icon" />
                  <strong>Name:</strong> {leadDetail.name}
                </li>
                <li className="list-group-item">
                  <FaEnvelope className="me-2 icon" />
                  <strong>Email:</strong> {leadDetail.email}
                </li>
                <li className="list-group-item">
                  <FaPhone className="me-2 icon" />
                  <strong>Phone:</strong> {leadDetail.phone}
                </li>
                <li className="list-group-item">
                  <FaRobot className="me-2 icon" />
                  <strong>Chatbot:</strong>{" "}
                  {leadDetail.chatbotId?.name || "N/A"}
                </li>
                <li className="list-group-item">
                  <FaCalendar className="me-2 icon" />
                  <strong>Created At:</strong>{" "}
                  {new Date(leadDetail.createdAt).toLocaleString()}
                </li>
                <li className="list-group-item">
                  <FaBuilding className="me-2 icon" />
                  <strong>Status:</strong> {leadDetail.status}
                </li>
                <li className="list-group-item">
                  <FaMapMarker className="me-2 icon" />
                  <strong>Location:</strong>{" "}
                  {leadDetail.location
                    ? `${leadDetail.location.city}, ${leadDetail.location.region}, ${leadDetail.location.country}`
                    : "N/A"}
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Follow-ups List Card */}
        <div className="col-md-6 mb-4">
          <div className="card lead-card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="card-title">Follow-ups</h5>
            </div>
            <div className="card-body ">
              {followUps.map((followUp) => (
                <li key={followUp._id} className="list-group-item comment-item">
                  {editFollowUpId === followUp._id ? (
                    <div className="edit-comment">
                      <div className="mb-2">
                        <DatePicker
                          selected={new Date(editFollowUpData.followUpDate)}
                          onChange={handleDateChange}
                          showTimeSelect
                          dateFormat="Pp"
                          className="form-control"
                          placeholderText="Select date and time"
                        />
                      </div>
                      <textarea
                        className="form-control mb-2"
                        placeholder="Notes"
                        name="notes"
                        value={editFollowUpData.notes}
                        onChange={handleFollowUpInputChange}
                      />
                      <select
                        className="form-control mb-2"
                        name="status"
                        value={editFollowUpData.status}
                        onChange={handleFollowUpInputChange}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>

                      <div className="edit-comment-actions">
                        <button
                          className="btn btn-sm btn-success me-2 save-btn"
                          onClick={handleUpdateFollowUp}
                        >
                          <FaSave className="me-1" /> Save
                        </button>
                        <button
                          className="btn btn-sm btn-secondary cancel-btn"
                          onClick={handleCancelEditFollowUp}
                        >
                          <FaTimes className="me-1" /> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      key={followUp._id}
                      className="card col-md-12 mb-2 follow-up-item"
                    >
                      <div className="card-body">
                        <p className="follow-up-date">
                          <FaCalendar className="me-1" />
                          {followUp.followUpDate.toLocaleString()}
                        </p>
                        <p className="follow-up-notes">
                          <strong>Notes:</strong> {followUp.notes}
                        </p>
                        <p className="follow-up-status">
                          <strong>Status:</strong> {followUp.status}
                        </p>
                        <div className="follow-up-actions">
                          <button
                            className="btn btn-sm btn-outline-secondary me-2 edit-btn"
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
                    </div>
                  )}
                </li>
              ))}
            </div>
          </div>
        </div>

        {/* Activities Card */}
        <div className="col-md-6 mb-4">
          <div className="card lead-card">
            <div className="card-header">
              <h5 className="card-title">Activities</h5>
            </div>
            <div className="card-body">
              {activityLogs && activityLogs.length > 0 ? (
                <ul className="list-group">
                  {activityLogs.map((log, index) => (
                    <li key={index} className="list-group-item activity-item">
                      <FaHistory className="me-2 icon" /> {log.timestamp} -{" "}
                      {log.action}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center">No activity logs available.</p>
              )}
            </div>
          </div>
        </div>

        {/* Comments List Card */}
        <div className="col-md-6 mb-4">
          <div className="card lead-card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="card-title">Comments</h5>
            </div>
            <div className="card-body">
              {comments && comments.length > 0 ? (
                <ul className="list-group">
                  {comments.map((comment) => (
                    <li
                      key={comment._id}
                      className="list-group-item comment-item"
                    >
                      {editCommentId === comment._id ? (
                        <div className="edit-comment">
                          <textarea
                            className="form-control mb-2"
                            value={editCommentText}
                            onChange={(e) => setEditCommentText(e.target.value)}
                          />
                          <div className="edit-comment-actions">
                            <button
                              className="btn btn-sm btn-success me-2 save-btn"
                              onClick={handleSaveEdit}
                            >
                              <FaSave className="me-1" /> Save
                            </button>
                            <button
                              className="btn btn-sm btn-secondary cancel-btn"
                              onClick={handleCancelEdit}
                            >
                              <FaTimes className="me-1" /> Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="comment-content">
                          <p>{comment.comment}</p>
                          <small className="text-muted">
                            {new Date(comment.createdAt).toLocaleString()}
                          </small>
                          <div className="comment-actions">
                            <button
                              className="btn btn-sm btn-outline-secondary me-2 edit-btn"
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
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center">No comments available.</p>
              )}
            </div>
          </div>
        </div>

        {/* Conversation Card */}
        <div className="col-md-6 mb-4">
          <div className="card lead-card">
            <div className="card-header">
              <h5 className="card-title">Conversation</h5>
            </div>
            <div className="card-body">
              {conversationLogs &&
              conversationLogs.messages &&
              conversationLogs.messages.length > 0 ? (
                <div
                  className="list-group conversation-list"
                  style={{ maxHeight: "300px", overflowY: "auto" }}
                >
                  {conversationLogs.messages.map((log, index) =>
                    log.sender ? (
                      <div
                        key={index}
                        className="list-group-item conversation-item"
                      >
                        <div className="d-flex align-items-center">
                          <FaComment className="me-2 icon" />
                          <strong>{log.sender}:</strong>
                        </div>
                        <div className="ms-4 mt-2">
                          <p className="mb-1">
                            {log.text || "No message content"}
                          </p>
                          <small className="text-muted">
                            {new Date(log.timestamp).toLocaleString()}
                          </small>
                        </div>
                      </div>
                    ) : null
                  )}
                </div>
              ) : (
                <p className="text-center">No conversation logs available.</p>
              )}
            </div>
          </div>
        </div>

        {/* Site Visit Card */}
        <div className="col-md-6 mb-4">
          <div className="card lead-card">
            <div className="card-header">
              <h5 className="card-title">Site Visits</h5>
            </div>
            <div className="card-body">
              <SiteVisit leadId={leadId} siteVisitLogs={siteVisitLogs} />
            </div>
          </div>
        </div>

        {/* Activity Chart Card */}
        <div className="col-md-12 mb-4">
          <div className="card lead-card">
            <div className="card-header">
              <h5 className="card-title">Lead Activity Over Time</h5>
            </div>
            <div className="card-body">
              <div className="chart-container">
                {/* Use the class for chart height */}
                <Bar data={chartData} options={chartOptions} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Follow-Up Sliding Pane */}
      <SlidingPane
        className="sliding-pane"
        isOpen={isFollowUpPaneOpen}
        title="Add Follow-Up"
        width="500px" // Adjust width as needed
        onRequestClose={() => setIsFollowUpPaneOpen(false)}
      >
        <div className="pane-content">
          <div className="mb-3">
            <div className="mb-2">
              <DatePicker
                selected={newFollowUp.followUpDate}
                onChange={(date) =>
                  setNewFollowUp({ ...newFollowUp, followUpDate: date })
                }
                showTimeSelect
                dateFormat="Pp"
                className="form-control"
                placeholderText="Select date and time"
              />
            </div>
            <textarea
              className="form-control mb-2"
              placeholder="Notes"
              value={newFollowUp.notes}
              onChange={(e) =>
                setNewFollowUp({ ...newFollowUp, notes: e.target.value })
              }
            />
            <select
              className="form-control mb-2"
              value={newFollowUp.status}
              onChange={(e) =>
                setNewFollowUp({ ...newFollowUp, status: e.target.value })
              }
            >
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
            </select>
            <button
              className="btn btn-primary w-100 add-followup-btn"
              onClick={handleCreateFollowUp}
            >
              <FaPlus className="me-1" />
              Add Follow-Up
            </button>
          </div>
        </div>
      </SlidingPane>

      {/* Comment Sliding Pane */}
      <SlidingPane
        className="sliding-pane"
        isOpen={isCommentPaneOpen}
        title="Add Comment"
        width="500px" // Adjust width as needed
        onRequestClose={() => setIsCommentPaneOpen(false)}
      >
        <div className="pane-content">
          <div className="mb-3">
            <textarea
              className="form-control mb-2"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
            />
            <button
              className="btn btn-primary w-100 add-comment-btn"
              onClick={handleAddComment}
            >
              <FaPlus className="me-1" />
              Add Comment
            </button>
          </div>
        </div>
      </SlidingPane>

      {/* Site Visit Sliding Pane */}
      <SlidingPane
        className="sliding-pane"
        isOpen={isSiteVisitPaneOpen}
        title="Add Site Visit"
        width="500px" // Adjust width as needed
        onRequestClose={() => setIsSiteVisitPaneOpen(false)}
      >
        <div className="pane-content">
          <SiteVisit leadId={leadId} siteVisitLogs={siteVisitLogs} />
        </div>
      </SlidingPane>
    </div>
  );
};

export default LeadDetails;
