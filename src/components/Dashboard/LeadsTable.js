import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import DataTable from 'react-data-table-component';
import './LeadsTable.css';

const LeadsTable = () => {
    const { chatbotId } = useParams();
    const [leads, setLeads] = useState([]);
    const [filteredLeads, setFilteredLeads] = useState([]);
    const [chatbotNames, setChatbotNames] = useState([]);
    const [selectedChatbot, setSelectedChatbot] = useState("All");
    const [selectedDate, setSelectedDate] = useState(15);
    const [sortOrder, setSortOrder] = useState("desc");

    useEffect(() => {
        fetchLeads(selectedDate);
    }, [selectedDate]);

    const fetchLeads = async (days) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                'http://localhost:3001/api/leads/list',
                { days, chatbotId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            // const response = await axios.get(`http://localhost:3001/api/chatbots/leads?days=${days}`);
            setLeads(response.data);
            setFilteredLeads(response.data);

            // Extract chatbot names for filter options
            const uniqueChatbotNames = [...new Set(response.data.map((lead) => lead.chatbotName))];
            setChatbotNames(["All", ...uniqueChatbotNames]);
        } catch (error) {
            console.error("Error fetching leads:", error);
        }
    };

    const handleFilterChange = (event) => {
        const selected = event.target.value;
        setSelectedChatbot(selected);

        if (selected === "All") {
            setFilteredLeads(leads);
        } else {
            setFilteredLeads(leads.filter((lead) => lead.chatbotName === selected));
        }
    };

    const handleDateFilterChange = (event) => {
        setSelectedDate(event.target.value);
    };

    const columns = [
        {
            name: 'Name',
            selector: row => row.name,
            sortable: true,
        },
        {
            name: 'Email',
            selector: row => row.email,
        },
        {
            name: 'Phone',
            selector: row => row.phone,
        },
        {
            name: 'Chatbot Name',
            selector: row => row.chatbotName,
            sortable: true,
        },
        {
            name: 'Created Time',
            selector: row => new Date(row.createdAt).toLocaleString(),
            sortable: true,
        }
    ];

    return (
        <div className="leads-container">
            <h2>Leads Table</h2>
            <div className="filter-container">
                <label>Filter by Chatbot Name:</label>
                <select value={selectedChatbot} onChange={handleFilterChange}>
                    {chatbotNames.map((name, index) => (
                        <option key={index} value={name}>{name}</option>
                    ))}
                </select>
                <label>Filter by Last:</label>
                <select value={selectedDate} onChange={handleDateFilterChange}>
                    <option value={7}>7 Days</option>
                    <option value={15}>15 Days</option>
                    <option value={30}>30 Days</option>
                    <option value={90}>90 Days</option>
                </select>
            </div>
            <DataTable
                columns={columns}
                data={filteredLeads}
                pagination
                highlightOnHover
                responsive
            />
        </div>
    );
};

export default LeadsTable;