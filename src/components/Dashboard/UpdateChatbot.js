import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './UpdateChatbot.css';

const UpdateChatbot = () => {
    const { chatbotId } = useParams();
    const [trainingData, setTrainingData] = useState([]);
    const [statusMessage, setStatusMessage] = useState('');
    const [error, setError] = useState('');

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();

            formData.append('chatbot_id', chatbotId);
            if (file) formData.append('file', file);

            const response = await axios.post('http://localhost:3001/api/chatbots/train', formData, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
            });
            
            setStatusMessage('Chatbot training file updated successfully!');
        } catch (err) {
            console.error('Error uploading file:', err);
            setStatusMessage('Failed to update chatbot training file.');
        }
    };

    useEffect(() => {
        const fetchChatbotData = async () => {
            try { 
                const token = localStorage.getItem('token');
                // console.log('token from update file', token)
                // console.log('token from update file chatbotId', chatbotId)

                var chatbotData = {
                    chatbotId
                }

                if (!chatbotData) {
                    console.error('No chatbot data found');
                    return;
                }
                // console.log('chatbot data from update file', chatbotData);
                const response = await axios.post('http://localhost:3001/api/chatbots/chatbot-detail', chatbotData, {
                    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                });
                setTrainingData(response.data.trained_data_ai);
            } catch (err) {
                console.error('Error fetching chatbot data:', err);
                setStatusMessage('Failed to load chatbot data.');
            }
        };

        fetchChatbotData();
    }, [chatbotId]);

    const handleUpdate = async () => {
        if (!trainingData.trim()) {
            setStatusMessage('Training data cannot be empty');
            return;
        }
        // Convert textarea data into a Blob (file-like object)
        const blob = new Blob([trainingData], { type: 'text/plain' });
        const file = new File([blob], 'training-data.txt', { type: 'text/plain' });

        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('chatbot_id', chatbotId);
        if (file) formData.append('file', file);
        
        try {
            const response = await axios.post('http://localhost:3001/api/chatbots/train', formData, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
            });
            
            setStatusMessage('Chatbot training updated successfully!');
        } catch (err) {
            console.error('Error updating chatbot:', err);
            setStatusMessage('Failed to update chatbot training.');
        }
    };

    return (
        <div className="update-chatbot-container">
            <h2>Update Chatbot Training</h2>
            <textarea
                value={trainingData}
                onChange={(e) => setTrainingData(e.target.value)}
                placeholder="Enter updated training data..."
                className="training-textarea"
            />
            <button onClick={handleUpdate} className="update-button">
                Update Training
            </button>
            {statusMessage && <p className="status-message">{statusMessage}</p>}


            <div className="update-chatbot-container">
                <h2>Update Chatbot Training</h2>
                <input
                    type="file"
                    accept=".json,.txt"
                    onChange={handleFileUpload}
                    className="file-upload-input"
                />
                {statusMessage && <p className="status-message">{statusMessage}</p>}
            </div>
        </div>
    );
};

export default UpdateChatbot;