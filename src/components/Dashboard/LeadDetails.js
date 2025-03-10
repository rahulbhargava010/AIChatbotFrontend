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
import SiteVisit from "./SiteVisit";
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
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [messages, setMessages] = useState("");
  const [editCommentId, setEditCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState("");
  
  const [followUps, setFollowUps] = useState([]);
  const [newFollowUp, setNewFollowUp] = useState({ followUpDate: '', notes: '', status: 'Pending' });
  const [editFollowUp, setEditFollowUp] = useState(null);

  const [siteVisitLogs, setSiteVisitLogs] = useState([]);

  const { leadId } = useParams();

  useEffect(() => {
    if (!leadId) return;
    console.log('coming inside leadid')
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
        setComments(response?.data?.commentLogs);
        setFollowUps(response?.data?.followUpLogs);
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
      const token = localStorage.getItem("token"); // Get token from localStorage
      const response = await api.post("/leads/saveComment", 
      {
          leadId,
          comment: newComment
      },
      {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
      });
      console.log('response --- ', response.data)

      const comment = {
          _id: response.data.comment._id, // Unique ID for the comment
          comment: newComment,
          createdAt: response.data.comment.createdAt,
      };

      setMessages("Comment added successfully!");
      setComments([...comments, comment]);
      setNewComment("");
    } catch (error) {
      setMessages(error.response?.data?.error || "Failed to add company.");
    }
  };

  const handleEditComment = async (id) => {
    try {

      const commentToEdit = comments.find((comment) => comment._id === id);
      if (commentToEdit) {
        setEditCommentId(id);
        setEditCommentText(commentToEdit.comment);
      }
      // const token = localStorage.getItem("token"); // Get token from localStorage
      // const response = await api.post("/leads/saveComment", 
      // {
      //     leadId,
      //     comment: newComment
      // },
      // {
      //     headers: {
      //       Authorization: `Bearer ${token}`,
      //       "Content-Type": "application/json",
      //     },
      // });
    } catch (error) {
      setMessages(error.response?.data?.error || "Failed to add company.");
    }
  };

  // Delete a comment
  const handleDeleteComment = async (id) => {

      try {
        const token = localStorage.getItem("token"); // Get token from localStorage
        const response = await api.post("/leads/deleteComment", 
        {
            commentId: id
        },
        {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
        });
      } catch (error) {
          setMessages(error.response?.data?.error || "Failed to add company.");
      }
      const updatedComments = comments.filter((comment) => comment._id !== id);
      setComments(updatedComments);
  };

  // Save the edited comment
  const handleSaveEdit = async () => {
    if (editCommentText.trim() === "") return;
    try {
      const token = localStorage.getItem("token"); // Get token from localStorage
      const response = await api.post("/leads/editComment", 
      {
          commentId: editCommentId,
          comment: editCommentText
      },
      {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
      });

      console.log('comments', comments)
      const updatedComments = await comments?.map((comment) =>
          comment._id === editCommentId ? { ...comment, comment: editCommentText } : comment
      );

      console.log('editCommentId', editCommentId)
      console.log('editCommentText', editCommentText)
      console.log('updatedComments', updatedComments)
      setComments(updatedComments);
      setEditCommentId(null);
      setEditCommentText("");
    } catch (error) {
      setMessages(error.response?.data?.error || "Failed to add company.");
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditCommentId(null);
    setEditCommentText("");
  };



  // Create a follow-up
  const handleCreateFollowUp = async () => {
    try {
      // const response = await axios.post('/api/follow-ups', { ...newFollowUp, leadId });
      const token = localStorage.getItem("token");
      const response = await api.post("/followup/save", 
      { ...newFollowUp, leadId },
      {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
      });
      setFollowUps([...followUps, response.data.followUp]);
      setNewFollowUp({ followUpDate: '', notes: '', status: 'Pending' });
    } catch (error) {
      console.error('Error creating follow-up:', error);
    }
  };

  // Update a follow-up
  const handleUpdateFollowUp = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.post("/followup/update", 
      {
          followUpId: editFollowUp._id,
          editFollowUp
      },
      {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
      });
      console.log('response --- ', response.data)
      setFollowUps(followUps.map((f) => (f._id === editFollowUp._id ? response.data.followUp : f)));
      setEditFollowUp(null);
    } catch (error) {
      console.error('Error updating follow-up:', error);
    }
  };

  // Delete a follow-up
  const handleDeleteFollowUp = async (id) => {
    console.log('handleDeleteFollowUp', id)
    try {
      const token = localStorage.getItem("token");
      const response = await api.post("/followup/delete", 
      {
          followUpId: id,
      },
      {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
      });
      // await axios.delete(`/api/follow-ups/${id}`);
      setFollowUps(followUps.filter((f) => f._id !== id));
    } catch (error) {
      console.error('Error deleting follow-up:', error);
    }
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

  const { leadDetail, activityLogs, conversationLogs, followUpLogs, commentLogs } = leadData;
  // console.log('commentLogs', commentLogs);
  // setComments(commentLogs);
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
    <div className="container mt-6">
      <div className="row">
        {/* Lead Details Card */}
        <div className="col-md-6 col-lg-6 mb-6">
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
        <div className="col-md-6 col-lg-6 mb-6">
          <div className="card h-100 p-3">
            <h6 className="card-title text-center">Follow-ups</h6>
            <div>
                {/* Create Follow-Up */}
                <div>
                  <input
                    type="datetime-local"
                    value={newFollowUp.followUpDate}
                    onChange={(e) => setNewFollowUp({ ...newFollowUp, followUpDate: e.target.value })}
                  />
                  <textarea
                    placeholder="Notes"
                    value={newFollowUp.notes}
                    onChange={(e) => setNewFollowUp({ ...newFollowUp, notes: e.target.value })}
                  />
                  <select
                    value={newFollowUp.status}
                    onChange={(e) => setNewFollowUp({ ...newFollowUp, status: e.target.value })}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                  </select>
                  <button onClick={handleCreateFollowUp}>Add Follow-Up</button>
                </div>

                {/* List Follow-Ups */}
                {followUps.map((followUp) => (
                  <div key={followUp._id}>
                    <p>Date: {new Date(followUp.followUpDate).toLocaleDateString()}</p>
                    <p>Notes: {followUp.notes}</p>
                    <p>Status: {followUp.status}</p>
                    <button onClick={() => setEditFollowUp(followUp)}>Edit</button>
                    <button onClick={() => handleDeleteFollowUp(followUp._id)}>Delete</button>
                  </div>
                ))}

                {/* Edit Follow-Up */}
                {editFollowUp && (
                  <div>
                    <input
                      type="datetime-local"
                      value={editFollowUp.followUpDate}
                      onChange={(e) => setEditFollowUp({ ...editFollowUp, followUpDate: e.target.value })}
                    />
                    <textarea
                      placeholder="Notes"
                      value={editFollowUp.notes}
                      onChange={(e) => setEditFollowUp({ ...editFollowUp, notes: e.target.value })}
                    />
                    <select
                      value={editFollowUp.status}
                      onChange={(e) => setEditFollowUp({ ...editFollowUp, status: e.target.value })}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                    <button onClick={handleUpdateFollowUp}>Save</button>
                    <button onClick={() => setEditFollowUp(null)}>Cancel</button>
                  </div>
                )}
              </div>
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
            <div className="add-comment">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                />
                <button onClick={handleAddComment}>Add Comment</button>
            </div>
            
            {comments && comments?.length > 0 ? (
              <ul className="list-group">
                {comments?.map((comment) => (
                      <div key={comment._id} className="comment">
                      {editCommentId === comment._id ? (
                        // Edit Comment Section
                        <div className="edit-comment">
                          <textarea
                            value={editCommentText}
                            onChange={(e) => setEditCommentText(e.target.value)}
                          />
                          <button onClick={handleSaveEdit}>Save</button>
                          <button onClick={handleCancelEdit}>Cancel</button>
                        </div>
                      ) : (
                        // Show Comment Section
                        <div className="comment-content">
                          <p>{comment.comment}</p>
                          <small>{comment.createdAt}</small>
                          <div className="comment-actions">
                            <button onClick={() => handleEditComment(comment._id)}>Edit</button>
                            <button onClick={() => handleDeleteComment(comment._id)}>Delete</button>
                          </div>
                        </div>
                      )}
                    </div>
                    // <li
                    //   key={index}
                    //   className="list-group-item d-flex align-items-center"
                    // >
                    //   <FaComment className="me-2 text-primary" />{" "}
                    //   {log.comment} - {log.createdAt} -{" "}
                    //   {/* {log.action.replace("Remark Added: ", "")} */}
                    // </li>
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

        {/* Activities Card */}
        <div className="col-md-6 col-lg-4 mb-4">
          <div className="card h-100 p-3">
            <h6 className="card-title text-center">Activities 2</h6>
              <SiteVisit leadId={leadId} siteVisitLogs={siteVisitLogs}/>
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
