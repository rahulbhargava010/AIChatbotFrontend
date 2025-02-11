// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { useParams } from 'react-router-dom';
// import './UpdateChatbot.css';
// import ReactJson from "react-json-view";

// const UpdateChatbot = () => {
//     const { chatbotId } = useParams();
//     const [trainingData, setTrainingData] = useState([]);
//     const [statusMessage, setStatusMessage] = useState('');
//     const [error, setError] = useState('');

//     const handleFileUpload = async (e) => {
//         const file = e.target.files[0];
//         if (!file) return;

//         try {
//             const token = localStorage.getItem('token');
//             const formData = new FormData();

//             formData.append('chatbot_id', chatbotId);
//             if (file) formData.append('file', file);

//             const response = await axios.post('http://localhost:3001/api/chatbots/train', formData, {
//                 headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
//             });
            
//             setStatusMessage('Chatbot training file updated successfully!');
//         } catch (err) {
//             console.error('Error uploading file:', err);
//             setStatusMessage('Failed to update chatbot training file.');
//         }
//     };

//     useEffect(() => {
//         const fetchChatbotData = async () => {
//             try { 
//                 const token = localStorage.getItem('token');
//                 // console.log('token from update file', token)
//                 // console.log('token from update file chatbotId', chatbotId)

//                 var chatbotData = {
//                     chatbotId
//                 }

//                 if (!chatbotData) {
//                     console.error('No chatbot data found');
//                     return;
//                 }
//                 // console.log('chatbot data from update file', chatbotData);
//                 const response = await axios.post('http://localhost:3001/api/chatbots/chatbot-detail', chatbotData, {
//                     headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
//                 });
//                 setTrainingData(response.data.trained_data_ai);
//             } catch (err) {
//                 console.error('Error fetching chatbot data:', err);
//                 setStatusMessage('Failed to load chatbot data.');
//             }
//         };

//         fetchChatbotData();
//     }, [chatbotId]);

//     const handleUpdate = async () => {
//         if (!trainingData) {
//             setStatusMessage('Training data cannot be empty');
//             return;
//         }
//         // Convert textarea data into a Blob (file-like object)
//         const blob = new Blob([trainingData], { type: 'text/plain' });
//         const file = new File([blob], 'training-data.txt', { type: 'text/plain' });

//         const token = localStorage.getItem('token');
//         const formData = new FormData();
//         formData.append('chatbot_id', chatbotId);
//         if (file) formData.append('file', file);
        
//         try {
//             const response = await axios.post('http://localhost:3001/api/chatbots/train', formData, {
//                 headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
//             });
            
//             setStatusMessage('Chatbot training updated successfully!');
//         } catch (err) {
//             console.error('Error updating chatbot:', err);
//             setStatusMessage('Failed to update chatbot training.');
//         }
//     };

//     return (
//         <div className="update-chatbot-container">
//             <h2>Update Chatbot Training</h2>
//             {/* <textarea
//                 value={JSON.stringify(trainingData, null, 2)}
//                 onChange={(e) => setTrainingData(e.target.value)}
//                 placeholder="Enter updated training data..."
//                 className="training-textarea"
//             /> */}
//             <ReactJson
//                 src={trainingData}
//                 onEdit={(e) => setTrainingData(e.updated_src)}
//                 onAdd={(e) => setTrainingData(e.updated_src)}
//                 onDelete={(e) => setTrainingData(e.updated_src)}
//                 theme="monokai"
//                 collapsed={false}
//             />
//             <button onClick={handleUpdate} className="update-button">
//                 Update Training
//             </button>
//             {statusMessage && <p className="status-message">{statusMessage}</p>}


//             {/* <div className="update-chatbot-container">
//                 <h2>Update Chatbot Training</h2>
//                 <input
//                     type="file"
//                     accept=".json,.txt"
//                     onChange={handleFileUpload}
//                     className="file-upload-input"
//                 />
//                 {statusMessage && <p className="status-message">{statusMessage}</p>}
//             </div> */}
//         </div>
//     );
// };

// export default UpdateChatbot;




import React, { useState, useEffect } from 'react';
import ChatbotForm from './ChatbotForm';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import api from "../config/axios";

const UpdateChatbot = () => {
    const [initialData, setInitialData] = useState(null);
    const { chatbotId } = useParams();

    useEffect(() => {
        const fetchChatbotData = async () => {
            try { 
                const token = localStorage.getItem('token');

                var chatbotData = {
                    chatbotId
                }
                if (!chatbotData) {
                    console.error('No chatbot data found');
                    return;
                }

                const response = await api.post('/chatbots/chatbot-detail', chatbotData, {
                    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                });

                setInitialData(response.data);
            } catch (err) {
                console.error('Error fetching chatbot data:', err);
                // setStatusMessage('Failed to load chatbot data.');
            }
        };

        fetchChatbotData();
    }, [chatbotId]);
    const handleUpdate = (formData) => {
        // Implement the API call to update the chatbot
        // Example: axios.put(`/api/chatbots/${chatbotId}`, formData);
    };

    if (!initialData) return <div>Loading...</div>;

    return (
        <div>
        {/* <h2>Update Chatbot</h2> */}
        <ChatbotForm
            initialData={initialData}
            // onSubmit={handleUpdate}
            mode="update"
        />
        </div>
    );
};

export default UpdateChatbot;
