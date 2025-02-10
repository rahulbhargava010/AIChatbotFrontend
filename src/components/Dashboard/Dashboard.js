import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Link } from 'react-router-dom';
import api from "./axios";


import generateEmbedScript from "../config/embedScript";
const Dashboard = () => {
    const [chatbots, setChatbots] = useState([]);
    const [responseMessage, setResponseMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    
    const fetchChatbots = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await api.get('/chatbots/list', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setChatbots(response.data);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to fetch chatbots');
        }
    };

    useEffect(() => {
        fetchChatbots();
    }, []);

    const handleCreateChatbot = () => {
        navigate('/dashboard/create-chatbot');
    };

    const handleDelete = async (chatbotId) => {
        const confirmDelete = window.confirm('Are you sure you want to delete this chatbot?');
        if (!confirmDelete) return;

        try {
            const token = localStorage.getItem('token');
            const response = await api.post(`/chatbots/delete`,
                { chatbotId },
                { headers: { Authorization: `Bearer ${token}` } },
            );
            setResponseMessage(response.data.message);
            setChatbots(chatbots.filter((chatbot) => chatbot._id !== chatbotId));
        } catch (err) {
            console.error('Error deleting chatbot:', err);
            setResponseMessage(err.response?.data?.error || 'Failed to delete chatbot.');
        }
    };

    const handleCopyScript = async (chatbotId) => {
        // console.log('chatbot:', chatbotId);
        const embedScript = generateEmbedScript(chatbotId)
        // console.log('Copying script', embedScript);
        navigator.clipboard.writeText(embedScript);
        alert("Chatbot script copied to clipboard!");
    };

    return (
        <div className="dashboard-container container">
            <h1>My Chatbots</h1>
            {error && <p className="error">{error}</p>}
            <button onClick={handleCreateChatbot}>Create Chatbot</button>
            {/* <div className="chatbots-list">
                {chatbots.map((bot) => (
                    <div key={bot._id} className="chatbot-card">
                        <h3>{bot.name}</h3>
                        <p>ID: {bot._id}</p>
                    </div>
                ))}
            </div> */}
            <div className="container mt-4">
                <h2 className="mb-4">Your Chatbots</h2>
                <ul className="list-group btn-group btn-group-justified">
                    {chatbots.map((chatbot) => (
                        <><span>{chatbot.name}</span>
                        <li key={chatbot._id} className="list-group-item d-flex flex-row align-items-right">
                            
                            <Link className="btn btn-warning" to={`/dashboard/chatbot-test/${chatbot._id}`}>
                                Test
                            </Link>
                            <Link to={`/dashboard/update/${chatbot._id}`} className="btn btn-secondary">
                                Update Chatbot
                            </Link>
                            <Link to={`/dashboard/leads/${chatbot._id}`} className="btn btn-success">
                                Leads
                            </Link>
                            <Link to={`/dashboard/conversations/${chatbot._id}`} className="btn btn-info">
                                Conversations
                            </Link>
                            <Link className="btn btn-warning" onClick={() => handleCopyScript(chatbot._id)}>
                                Copy Embed Scripts
                            </Link>
                            <Link className="btn btn-danger" onClick={() => handleDelete(chatbot._id)}>
                                Delete
                            </Link>
                        </li>
                        </>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default Dashboard;