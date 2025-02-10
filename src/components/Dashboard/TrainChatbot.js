// TrainChatbot.js - Component to train a chatbot with page content or file upload

import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import api from "../config/axios";

import './TrainChatbot.css'; // Import CSS for styling

const TrainChatbot = () => {
    const { chatbotId } = useParams();
    const [pageUrl, setPageUrl] = useState('');
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleTrain = async (e) => {
        e.preventDefault();

        if ((pageUrl && file) || (!pageUrl && !file)) {
            setError('Please provide either a Page URL or upload a file, not both or neither.');
            setMessage('');
            return;
        }

        const token = localStorage.getItem('token');
        const formData = new FormData();

        formData.append('chatbot_id', chatbotId);
        if (pageUrl) formData.append('page_url', pageUrl);
        if (file) formData.append('file', file);
        // console.log('formData', formData);

        if ((pageUrl && file) || (!pageUrl && !file)) {
            setError('Please provide either a Page URL or upload a file, not both or neither.');
            setMessage('');
            return;
        }
        
        try {
            const response = await api.post('/aichatbots/train', formData, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
            });
            setMessage(response.data.message);
            setError('');
            // setTimeout(() => navigate('/dashboard'), 2000);
            setTimeout(() => navigate(`/dashboard/chatbot-test/${chatbotId}`), 2000);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to train chatbot.');
            setMessage('');
        }
    };

    return (
        <div className="train-chatbot-container">
            <div className="train-chatbot-card">
                <h2 className="train-chatbot-title">Train Your Chatbot</h2>
                {message && <p className="success-message">{message}</p>}
                {error && <p className="error-message">{error}</p>}
                <form className="train-chatbot-form" onSubmit={handleTrain}>
                    {/* <div className="form-group">
                        <label htmlFor="page-url">Page URL</label>
                        <input
                            id="page-url"
                            type="text"
                            placeholder="Enter Page URL"
                            value={pageUrl}
                            onChange={(e) => setPageUrl(e.target.value)}
                            className="input-field"
                        />
                    </div> */}
                    <div className="form-group">
                        <label htmlFor="file-upload">Upload File</label>
                        <input
                            id="file-upload"
                            type="file"
                            onChange={(e) => setFile(e.target.files[0])}
                            className="input-field"
                        />
                    </div>
                    <button type="submit" className="submit-button">
                        Train Chatbot
                    </button>
                </form>
            </div>
        </div>
    );
};

export default TrainChatbot;
