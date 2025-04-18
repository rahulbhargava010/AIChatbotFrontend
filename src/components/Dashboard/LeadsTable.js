import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
} from "@tanstack/react-table";
import api from "../config/axios";
import "./LeadsTable.css";
import LeadDetails from "./LeadDetails";
import { FaTrash, FaExclamationTriangle, FaComment } from "react-icons/fa";

// CSS is now imported from LeadsTable.css
/* 
Add these styles to your LeadsTable.css file:

.delete-btn {
  background-color: #dc3545 !important;
  color: white !important;
  border: none !important;
  border-radius: 4px !important;
  padding: 8px !important;
  cursor: pointer !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 36px !important;
  height: 36px !important;
}

.delete-btn:hover {
  background-color: #c82333 !important;
}

.delete-conversation-btn {
  background-color: #6c757d !important;
  color: white !important;
  border: none !important;
  border-radius: 4px !important;
  padding: 8px !important;
  cursor: pointer !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 36px !important;
  height: 36px !important;
  margin-right: 8px !important;
}

.delete-conversation-btn:hover {
  background-color: #5a6268 !important;
}

.action-buttons {
  display: flex;
  justify-content: center;
}
*/

const LeadsTable = () => {
  const { chatbotId } = useParams();
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [chatbotNames, setChatbotNames] = useState([]);
  const [selectedChatbot, setSelectedChatbot] = useState("All");
  const [selectedDate, setSelectedDate] = useState(15);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Delete functionality state
  const [isDeleteLeadModalOpen, setIsDeleteLeadModalOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState(null);
  const [isDeletingLead, setIsDeletingLead] = useState(false);

  // New state for conversation deletion
  const [isDeleteConversationModalOpen, setIsDeleteConversationModalOpen] =
    useState(false);
  const [conversationToDelete, setConversationToDelete] = useState(null);
  const [isDeletingConversation, setIsDeletingConversation] = useState(false);

  const [messages, setMessages] = useState("");
  const [currentUserRole, setCurrentUserRole] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    // Get current user role from localStorage
    const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
    setCurrentUserRole(userInfo.role || "");
    console.log("Current user role:", userInfo.role); // Debug log

    fetchLeads(selectedDate, startDate, endDate);
  }, [selectedDate, startDate, endDate]);

  const fetchLeads = async (days, start, end) => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.post(
        "/leads/list",
        { days, chatbot: chatbotId, startDate: start, endDate: end },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLeads(response.data);
      setFilteredLeads(response.data);

      const uniqueChatbotNames = [
        ...new Set(response.data.map((lead) => lead.chatbotName)),
      ];
      setChatbotNames(["All", ...uniqueChatbotNames]);
    } catch (error) {
      console.error("Error fetching leads:", error);
    }
  };

  const handleFilterChange = (event) => {
    const selected = event.target.value;
    setSelectedChatbot(selected);
    setFilteredLeads(
      selected === "All"
        ? leads
        : leads.filter((lead) => lead.chatbotName === selected)
    );
  };

  const handleDateFilterChange = (event) => {
    setSelectedDate(event.target.value);
  };

  const handleStartDateChange = (event) => {
    setStartDate(event.target.value);
  };

  const handleEndDateChange = (event) => {
    setEndDate(event.target.value);
  };

  const handleRowClick = (leadId) => {
    navigate(`/dashboard/leads/leadDetails/${leadId}`);
  };

  // Separate function to handle delete button click for lead
  const handleDeleteButtonClick = (e, leadId, leadName) => {
    // Stop the click from triggering the row click
    e.preventDefault();
    e.stopPropagation();

    setLeadToDelete({ id: leadId, name: leadName });
    setIsDeleteLeadModalOpen(true);

    console.log("Delete lead button clicked for lead:", leadId); // Debug log
  };

  // New function to handle delete conversation button click
  const handleDeleteConversationClick = (
    e,
    leadId,
    leadName,
    conversationId
  ) => {
    // Stop the click from triggering the row click
    e.preventDefault();
    e.stopPropagation();

    if (!conversationId) {
      console.error("No conversation ID found for this lead");
      setMessages("This lead doesn't have a conversation to delete.");
      return;
    }

    setConversationToDelete({
      leadId: leadId,
      leadName: leadName,
      conversationId: conversationId,
    });
    setIsDeleteConversationModalOpen(true);

    console.log(
      "Delete conversation button clicked for lead:",
      leadId,
      "conversation:",
      conversationId
    ); // Debug log
  };

  // Handle lead deletion
  const handleDeleteLead = async () => {
    if (isDeletingLead || !leadToDelete) return;

    setIsDeletingLead(true);
    try {
      const token = localStorage.getItem("token");
      await api.post(
        "/leads/delete",
        { lead: leadToDelete.id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Update the leads list after successful deletion
      const updatedLeads = leads.filter((lead) => lead._id !== leadToDelete.id);
      setLeads(updatedLeads);
      setFilteredLeads(
        selectedChatbot === "All"
          ? updatedLeads
          : updatedLeads.filter((lead) => lead.chatbotName === selectedChatbot)
      );

      setMessages(`Lead "${leadToDelete.name}" deleted successfully!`);

      setTimeout(() => {
        setMessages("");
      }, 2000);

      setIsDeleteLeadModalOpen(false);
    } catch (error) {
      console.error("Error deleting lead:", error);
      setMessages(error.response?.data?.error || "Failed to delete lead.");
    } finally {
      setIsDeletingLead(false);
      setLeadToDelete(null);
    }
  };

  // New function to handle conversation deletion
  const handleDeleteConversation = async () => {
    if (isDeletingConversation || !conversationToDelete) return;

    setIsDeletingConversation(true);
    try {
      const token = localStorage.getItem("token");
      await api.post(
        "/conversations/delete",
        { conversation: conversationToDelete.conversationId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setMessages(
        `Conversation for "${conversationToDelete.leadName}" deleted successfully!`
      );

      setTimeout(() => {
        setMessages("");
      }, 2000);

      setIsDeleteConversationModalOpen(false);

      // Refresh leads to update the UI
      fetchLeads(selectedDate, startDate, endDate);
    } catch (error) {
      console.error("Error deleting conversation:", error);
      setMessages(
        error.response?.data?.error || "Failed to delete conversation."
      );
    } finally {
      setIsDeletingConversation(false);
      setConversationToDelete(null);
    }
  };

  // Define table rows directly instead of using columns definition
  const renderTableRows = () => {
    return filteredLeads.map((lead) => (
      <tr
        key={lead._id}
        onClick={() => handleRowClick(lead._id)}
        style={{ cursor: "pointer" }}
      >
        <td>{lead.name}</td>
        <td>{lead.email}</td>
        <td>{lead.phone}</td>
        <td>{lead.chatbotName}</td>
        <td>{new Date(lead.createdAt).toLocaleString()}</td>
        {/* Only show Actions column for admin/manager users */}

        <td
          onClick={(e) => e.stopPropagation()}
          style={{ textAlign: "center" }}
        >
          <div className="action-buttons">
            {/* Add Delete Conversation button if conversationLogs exists */}
            {lead.conversationLogs && lead.conversationLogs._id && (
              <button
                onClick={(e) =>
                  handleDeleteConversationClick(
                    e,
                    lead._id,
                    lead.name,
                    lead.conversationLogs._id
                  )
                }
                className="delete-conversation-btn"
                title="Delete conversation history"
              >
                <FaComment />
              </button>
            )}
            <button
              onClick={(e) => handleDeleteButtonClick(e, lead._id, lead.name)}
              className="delete-btn"
              title="Delete lead and all associated data"
            >
              <FaTrash />
            </button>
          </div>
        </td>
      </tr>
    ));
  };

  return (
    <div className="leads-container">
      <h2>Leads Table</h2>

      {/* Status message */}
      {messages && (
        <div
          style={{
            padding: "0.75rem 1.25rem",
            marginBottom: "1rem",
            border: "1px solid #bee5eb",
            borderRadius: "0.25rem",
            color: "#0c5460",
            backgroundColor: "#d1ecf1",
            position: "relative",
          }}
        >
          {messages}
          <button
            style={{
              position: "absolute",
              top: "0",
              right: "0",
              padding: "0.75rem 1.25rem",
              background: "transparent",
              border: "0",
              cursor: "pointer",
            }}
            onClick={() => setMessages("")}
          >
            &times;
          </button>
        </div>
      )}

      <div className="filter-container">
        <label>Filter by Chatbot Name:</label>
        <select value={selectedChatbot} onChange={handleFilterChange}>
          {chatbotNames.map((name, index) => (
            <option key={index} value={name}>
              {name}
            </option>
          ))}
        </select>
        <label>Filter by Last:</label>
        <select value={selectedDate} onChange={handleDateFilterChange}>
          <option value={7}>7 Days</option>
          <option value={15}>15 Days</option>
          <option value={30}>30 Days</option>
          <option value={90}>90 Days</option>
        </select>
        <label>Start Date:</label>
        <input type="date" value={startDate} onChange={handleStartDateChange} />
        <label>End Date:</label>
        <input type="date" value={endDate} onChange={handleEndDateChange} />
      </div>

      <table className="leads-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Chatbot Name</th>
            <th>Created Time</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>{renderTableRows()}</tbody>
      </table>

      <div className="pagination">
        <button className="pagination-btn">Previous</button>
        <span>Page 1</span>
        <button className="pagination-btn">Next</button>
      </div>

      {/* Delete lead confirmation modal */}
      {isDeleteLeadModalOpen && leadToDelete && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1050,
          }}
        >
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              zIndex: 1040,
            }}
            onClick={() => setIsDeleteLeadModalOpen(false)}
          ></div>

          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 1050,
              width: "100%",
              maxWidth: "500px",
              backgroundColor: "white",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "15px 20px",
                backgroundColor: "#dc3545",
                color: "white",
                borderTopLeftRadius: "8px",
                borderTopRightRadius: "8px",
              }}
            >
              <h5 style={{ margin: 0 }}>
                <FaExclamationTriangle style={{ marginRight: "10px" }} />
                Delete Lead
              </h5>
              <button
                style={{
                  background: "transparent",
                  border: "none",
                  color: "white",
                  fontSize: "20px",
                  cursor: "pointer",
                }}
                onClick={() => setIsDeleteLeadModalOpen(false)}
              >
                &times;
              </button>
            </div>

            <div style={{ padding: "20px" }}>
              <p>
                Are you sure you want to delete lead "{leadToDelete.name}"? This
                action cannot be undone and will remove all associated data
                including comments, follow-ups, site visits, and conversation
                history.
              </p>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                padding: "15px 20px",
                borderTop: "1px solid #dee2e6",
              }}
            >
              <button
                style={{
                  padding: "8px 16px",
                  marginRight: "10px",
                  backgroundColor: "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
                onClick={() => setIsDeleteLeadModalOpen(false)}
              >
                Cancel
              </button>
              <button
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#dc3545",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                }}
                onClick={handleDeleteLead}
                disabled={isDeletingLead}
              >
                {isDeletingLead ? (
                  <>
                    <span
                      style={{
                        display: "inline-block",
                        width: "1rem",
                        height: "1rem",
                        border: "0.2em solid currentColor",
                        borderRightColor: "transparent",
                        borderRadius: "50%",
                        animation: "spinner-border 0.75s linear infinite",
                        marginRight: "8px",
                      }}
                    ></span>
                    Deleting...
                  </>
                ) : (
                  <>
                    <FaTrash style={{ marginRight: "8px" }} /> Delete Lead
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete conversation confirmation modal */}
      {isDeleteConversationModalOpen && conversationToDelete && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1050,
          }}
        >
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              zIndex: 1040,
            }}
            onClick={() => setIsDeleteConversationModalOpen(false)}
          ></div>

          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 1050,
              width: "100%",
              maxWidth: "500px",
              backgroundColor: "white",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "15px 20px",
                backgroundColor: "#ffc107",
                color: "#212529",
                borderTopLeftRadius: "8px",
                borderTopRightRadius: "8px",
              }}
            >
              <h5 style={{ margin: 0 }}>
                <FaExclamationTriangle style={{ marginRight: "10px" }} />
                Delete Conversation
              </h5>
              <button
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#212529",
                  fontSize: "20px",
                  cursor: "pointer",
                }}
                onClick={() => setIsDeleteConversationModalOpen(false)}
              >
                &times;
              </button>
            </div>

            <div style={{ padding: "20px" }}>
              <p>
                Are you sure you want to delete the conversation history for
                lead "{conversationToDelete.leadName}"? This action cannot be
                undone and will remove all chat messages associated with this
                lead.
              </p>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                padding: "15px 20px",
                borderTop: "1px solid #dee2e6",
              }}
            >
              <button
                style={{
                  padding: "8px 16px",
                  marginRight: "10px",
                  backgroundColor: "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
                onClick={() => setIsDeleteConversationModalOpen(false)}
              >
                Cancel
              </button>
              <button
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#dc3545",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                }}
                onClick={handleDeleteConversation}
                disabled={isDeletingConversation}
              >
                {isDeletingConversation ? (
                  <>
                    <span
                      style={{
                        display: "inline-block",
                        width: "1rem",
                        height: "1rem",
                        border: "0.2em solid currentColor",
                        borderRightColor: "transparent",
                        borderRadius: "50%",
                        animation: "spinner-border 0.75s linear infinite",
                        marginRight: "8px",
                      }}
                    ></span>
                    Deleting...
                  </>
                ) : (
                  <>
                    <FaComment style={{ marginRight: "8px" }} /> Delete
                    Conversation
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadsTable;
