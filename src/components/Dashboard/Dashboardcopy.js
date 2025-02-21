import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Link } from 'react-router-dom';
import api from "../config/axios";
import "./Dashboard.css"


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
        <div className="dashboard-container container p-0">
            {/* <h3>My Chatbots</h3> */}
            {error && <p className="error">{error}</p>}
            {/* <button onClick={handleCreateChatbot}>Create Chatbot</button> */}
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
                        <>
                        <span className='fw-bold my-3'>{chatbot.name}</span>
                        <li key={chatbot._id} className="list-group-item d-flex flex-row align-items-right shadow">
                            
                            <Link className="btn card_chat" to={`/dashboard/chatbot-test/${chatbot._id}`}>
                            <i className="bi bi-robot"></i>  
                            <p>Test chatbot</p>
                            </Link>
                            <Link to={`/dashboard/update/${chatbot._id}`} className="btn card_chat">
                            <i className="bi bi-pencil-square"></i>  
                                <p>Update Chatbot</p>
                            </Link>
                            <Link to={`/dashboard/leads/${chatbot._id}`} className="btn card_chat">
                            <i className="bi bi-person-lines-fill"></i>  
                                <p>Leads</p>
                            </Link>
                            <Link to={`/dashboard/conversations/${chatbot._id}`} className="btn card_chat">
                            <i className="bi bi-chat-dots"></i>  
                                <p>Conversations</p>
                            </Link>
                            <Link to={`/dashboard/stats/${chatbot._id}`} className="btn card_chat">
                            <i className="bi bi-bar-chart-line"></i>  
                                <p>Stats</p>
                            </Link>
                            <Link className="btn card_chat" onClick={() => handleCopyScript(chatbot._id)}>
                            <i className="bi bi-file-earmark-code"></i>  
                                <p>Copy Embed Scripts</p>
                            </Link>
                            <Link className="btn card_chat" onClick={() => handleDelete(chatbot._id)}>
                            <i className="bi bi-trash"></i>  
                                <p>Delete</p>
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