import React, { useState, useEffect } from 'react';
import api from "../config/axios";

const SiteVisit = ({ leadId, siteVisitLogs }) => {
    console.log('coming in site visit', siteVisitLogs)
    const [siteVisits, setSiteVisits] = useState([]);
    const [newSiteVisit, setNewSiteVisit] = useState({ datetime: '', notes: '', status: 'Scheduled' });
    const [editSiteVisit, setEditSiteVisit] = useState(null);

    useEffect(() => {
        try {
            console.log('siteVisitLogs', siteVisitLogs)
            setSiteVisits(siteVisitLogs);
        } catch (error) {
            console.error('Error fetching site visits:', error);
        }
       
    }, [siteVisitLogs]);
  // Create a site visit
    const handleCreateSiteVisit = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await api.post("/sitevisit/save", 
            { ...newSiteVisit, leadId },
            {
                headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
                },
            });
            console.log('response --- ', response.data)
            setSiteVisits([...siteVisits, response.data]);
            setNewSiteVisit({ datetime: '', notes: '', status: 'Scheduled' });
        } catch (error) {
        console.error('Error creating site visit:', error);
        }
    };

    // Update a site visit
    const handleUpdateSiteVisit = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await api.post("/sitevisit/update", 
            { editSiteVisit, leadId },
            {
                headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
                },
            });
            console.log('response --- ', response.data)
            setSiteVisits(siteVisits?.map((sv) => (sv._id === editSiteVisit._id ? response.data : sv)));
            setEditSiteVisit(null);
        } catch (error) {
        console.error('Error updating site visit:', error);
        }
    };

    // Delete a site visit
    const handleDeleteSiteVisit = async (id) => {
        try {
            const token = localStorage.getItem("token");
            const response = await api.post("/sitevisit/delete", 
            { id },
            {
                headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
                },
            });
            console.log('response --- ', response.data)
            setSiteVisits(siteVisits?.filter((sv) => sv._id !== id));
        } catch (error) {
            console.error('Error deleting site visit:', error);
        }
    };

    return (
        <div>
        <h3>Site Visits</h3>

        {/* Create Site Visit */}
        <div>
            <input
            type="datetime-local"
            value={newSiteVisit.datetime}
            onChange={(e) => setNewSiteVisit({ ...newSiteVisit, datetime: e.target.value })}
            />
            <textarea
            placeholder="Notes"
            value={newSiteVisit.notes}
            onChange={(e) => setNewSiteVisit({ ...newSiteVisit, notes: e.target.value })}
            />
            <select
            value={newSiteVisit.status}
            onChange={(e) => setNewSiteVisit({ ...newSiteVisit, status: e.target.value })}
            >
            <option value="Scheduled">Scheduled</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
            </select>
            <button onClick={handleCreateSiteVisit}>Add Site Visit</button>
        </div>

        {/* List Site Visits */}
        {siteVisits?.map((siteVisit) => (
            <div key={siteVisit._id}>
            <p>Date & Time: {new Date(siteVisit.datetime).toLocaleString()}</p>
            <p>Notes: {siteVisit.notes}</p>
            <p>Status: {siteVisit.status}</p>
            <button onClick={() => setEditSiteVisit(siteVisit)}>Edit</button>
            <button onClick={() => handleDeleteSiteVisit(siteVisit._id)}>Delete</button>
            </div>
        ))}

        {/* Edit Site Visit */}
        {editSiteVisit && (
            <div>
            <input
                type="datetime-local"
                value={editSiteVisit.datetime}
                onChange={(e) => setEditSiteVisit({ ...editSiteVisit, datetime: e.target.value })}
            />
            <textarea
                placeholder="Notes"
                value={editSiteVisit.notes}
                onChange={(e) => setEditSiteVisit({ ...editSiteVisit, notes: e.target.value })}
            />
            <select
                value={editSiteVisit.status}
                onChange={(e) => setEditSiteVisit({ ...editSiteVisit, status: e.target.value })}
            >
                <option value="Scheduled">Scheduled</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
            </select>
            <button onClick={handleUpdateSiteVisit}>Save</button>
            <button onClick={() => setEditSiteVisit(null)}>Cancel</button>
            </div>
        )}
        </div>
    );
};

export default SiteVisit;