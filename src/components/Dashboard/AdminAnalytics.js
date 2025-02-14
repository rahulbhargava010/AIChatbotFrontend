import { useEffect, useState } from "react";
import axios from "axios";
import api from "../config/axios";
import io from "socket.io-client";

const socket = io("https://assist-ai.propstory.com/", {
  transports: ["websocket", "polling"]
});

const AdminAnalytics = () => {
    const [analyticsData, setAnalyticsData] = useState([]);
    const [stat, setStat] = useState([]);
    const [activeUsers, setActiveUsers] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('token');
            if(token) {
                const response = await api.post('/analytics/analytics', 
                    { },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setAnalyticsData(response.data);

                const statResponse = await api.post('/conversations/stats',
                    { },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setStat(statResponse.data)
            }
        };
        fetchData();

        socket.on("updateActiveUsers", (count) => {
            setActiveUsers(count);
        });

        return () => socket.disconnect();
    }, []);

    return (
    <div className="container">
        <h2 className="mt-5">Chatbot Analytics</h2>
        <h3>Active Users: {activeUsers}</h3>
        <h3>Chat Statistics</h3>
        <p>Total Chats: {stat?.totalChats}</p>
        <p>Average Messages Per Chat: {stat?.avgMessagesPerChat}</p>
        <table className="table table-bordered">
        <thead>
            <tr>
            <th>Event Type</th>
            <th>Session ID</th>
            <th>Message</th>
            <th>Form Data</th>
            <th>Time Spent</th>
            <th>Timestamp</th>
            </tr>
        </thead>
        <tbody>
            {analyticsData?.map((data) => (
            <tr key={data._id}>
                <td>{data.eventType}</td>
                <td>{data.sessionId}</td>
                <td>{data.message || "N/A"}</td>
                <td>{data.formData ? JSON.stringify(data.formData) : "N/A"}</td>
                <td>{data.timeSpent ? `${data.timeSpent} sec` : "N/A"}</td>
                <td>{new Date(data.timestamp).toLocaleString()}</td>
            </tr>
            ))}
        </tbody>
        </table>
    </div>
    );
};

export default AdminAnalytics;
