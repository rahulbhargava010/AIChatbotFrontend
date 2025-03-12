import React, { useState, useEffect } from "react";
import api from "../config/axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaCalendar, FaEdit, FaTrash, FaSave, FaTimes } from "react-icons/fa";

const SiteVisit = ({ leadId, siteVisitLogs }) => {
  const [siteVisits, setSiteVisits] = useState([]);
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

  useEffect(() => {
    if (siteVisitLogs) {
      // Ensure datetime is converted to Date objects
      const updatedSiteVisitLogs = siteVisitLogs.map((visit) => ({
        ...visit,
        datetime: new Date(visit.datetime),
      }));
      setSiteVisits(updatedSiteVisitLogs);
    }
  }, [siteVisitLogs]);

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

      setSiteVisits([
        ...siteVisits,
        { ...response.data, datetime: new Date(response.data.datetime) },
      ]);
      setNewSiteVisit({ datetime: new Date(), notes: "", status: "Scheduled" });
    } catch (error) {
      console.error("Error creating site visit:", error);
    }
  };

  // Update a site visit
  const handleUpdateSiteVisit = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.post(
        "/sitevisit/update",
        {
          id: editSiteVisitId, //Correct id key to match API
          ...editSiteVisitData,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("response --- ", response.data);

      setSiteVisits(
        siteVisits.map((sv) =>
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
    } catch (error) {
      console.error("Error updating site visit:", error);
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
      setSiteVisits(siteVisits.filter((sv) => sv._id !== id));
    } catch (error) {
      console.error("Error deleting site visit:", error);
    }
  };

  const handleEditSiteVisit = (siteVisit) => {
    setEditSiteVisitId(siteVisit._id);
    setEditSiteVisitData({
      datetime: siteVisit.datetime,
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

  const handleSiteVisitInputChange = (e) => {
    const { name, value } = e.target;
    setEditSiteVisitData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleDatetimeChange = (date) => {
    setEditSiteVisitData((prevData) => ({
      ...prevData,
      datetime: date,
    }));
  };

  return (
    <div className="container">
      <h4>Site Visits</h4>

      {/* Create Site Visit */}
      <div className="mb-3">
        <div className="mb-2">
          <DatePicker
            selected={newSiteVisit.datetime}
            onChange={(date) =>
              setNewSiteVisit({ ...newSiteVisit, datetime: date })
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
          value={newSiteVisit.notes}
          onChange={(e) =>
            setNewSiteVisit({ ...newSiteVisit, notes: e.target.value })
          }
        />
        <select
          className="form-control mb-2"
          value={newSiteVisit.status}
          onChange={(e) =>
            setNewSiteVisit({ ...newSiteVisit, status: e.target.value })
          }
        >
          <option value="Scheduled">Scheduled</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
        <button
          className="btn btn-primary w-100"
          onClick={handleCreateSiteVisit}
        >
          Add Site Visit
        </button>
      </div>

      {/* List Site Visits */}
      {siteVisits?.map((siteVisit) => (
        <div key={siteVisit._id} className="card mb-2">
          <div className="card-body">
            {editSiteVisitId === siteVisit._id ? (
              <div>
                <div className="mb-2">
                  <DatePicker
                    selected={new Date(editSiteVisitData.datetime)}
                    onChange={handleDatetimeChange}
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
                  value={editSiteVisitData.notes}
                  onChange={handleSiteVisitInputChange}
                />
                <select
                  className="form-control mb-2"
                  name="status"
                  value={editSiteVisitData.status}
                  onChange={handleSiteVisitInputChange}
                >
                  <option value="Scheduled">Scheduled</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
                <div className="d-flex justify-content-end">
                  <button
                    className="btn btn-sm btn-success me-2"
                    onClick={handleUpdateSiteVisit}
                  >
                    <FaSave className="me-1" /> Save
                  </button>
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={handleCancelEditSiteVisit}
                  >
                    <FaTimes className="me-1" /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p>
                  <FaCalendar className="me-1" />
                  {new Date(siteVisit.datetime).toLocaleString()}
                </p>
                <p>Notes: {siteVisit.notes}</p>
                <p>Status: {siteVisit.status}</p>
                <div className="d-flex justify-content-end">
                  <button
                    className="btn btn-sm btn-outline-secondary me-2"
                    onClick={() => handleEditSiteVisit(siteVisit)}
                  >
                    <FaEdit className="me-1" /> Edit
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDeleteSiteVisit(siteVisit._id)}
                  >
                    <FaTrash className="me-1" /> Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SiteVisit;
