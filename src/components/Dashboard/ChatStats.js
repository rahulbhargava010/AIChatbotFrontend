import { useEffect, useState } from "react";
import axios from "axios";
import api from "../config/axios";
import { useParams } from 'react-router-dom';

const ChatStats = () => {
    const { chatbotId } = useParams();
    const [stats, setStats] = useState({ totalChats: 0, avgMessagesPerChat: 0 });
    const token = localStorage.getItem('token');

    const fetchStats = async () => {
        try {
            const statResponse = await api.post('/conversations/chatbotStats',
                { chatbotId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setStats(statResponse.data)
        } catch (err) {
            console.error(err.statResponse?.data?.error || 'Failed to fetch Stats');
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);
    return (
        <div className="container m-5">
            <h3>Chat Statistics</h3>
            <p>Total Chats: {stats?.totalChats}</p>
            <p>Average Messages Per Chat: {stats?.avgMessagesPerChat}</p>
        </div>
    );
};

export default ChatStats;
