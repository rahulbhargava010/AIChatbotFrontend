import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DataTable from 'react-data-table-component';
// import './ConversationTable.css';
import { useParams } from 'react-router-dom';

const ConversationTable = () => {
    const { chatbotId } = useParams();
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);

    useEffect(() => {
        fetchConversations();
    }, []);

    const fetchConversations = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                'http://localhost:3001/api/conversations/list',
                { chatbotId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setConversations(response.data);
            console.log('response.data', response.data);
            console.log(response.data[0].messages.filter(msg => msg?.sender === 'User').length);

        } catch (error) {
            console.error("Error fetching conversations:", error);
        }
    };

    const columns = [
        {
            name: 'Session ID',
            selector: row => row.sessionId,
            sortable: true,
        },
        {
            name: 'User Replies Count',
            selector: row => row.messages.filter(msg => msg.sender === 'User').length,
            sortable: true,
        },
        {
            name: 'Lead',
            selector: row => row?.Lead?.name,
            sortable: true,
        },
        {
            name: 'Last Updated',
            selector: row => new Date(row.createdAt).toLocaleString(),
            sortable: true,
        }
    ];

    return (
        <div className="conversation-table-container container">
            <h2>Chatbot Conversations</h2>
            <DataTable
                columns={columns}
                data={conversations}
                pagination
                highlightOnHover
                responsive
                onRowClicked={row => setSelectedConversation(row)}
            />
            {selectedConversation && (
                <div className="conversation-detail container-fluid" style={{border: "2px solid grey", borderRadius:"10px", padding: "20px"}}>
                    <h3>Conversation Details</h3>
                    <p><strong>Session ID:</strong> {selectedConversation.sessionId}</p>
                    <button onClick={() => setSelectedConversation(null)}>Close</button>
                    <div className="chat-history">
                        {selectedConversation.messages.map((msg, index) => (
                            <div key={index} className={`message ${msg.sender === "Bot" ? "bot-message" : "user-message"}`}>
                                { msg?.text && <div className="message-bubble">{msg.text}</div> }
                            </div>
                        ))}
                    </div>
                    
                </div>
            )}
        </div>
    );
};

export default ConversationTable;