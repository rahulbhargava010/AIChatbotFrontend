import { useEffect, useState } from "react";
import axios from "axios";
import api from "../config/axios";
import io from "socket.io-client";

const socket = io("http://localhost:3001", {
  transports: ["websocket", "polling"]
});

const AdminAnalytics = () => {
    const [analyticsData, setAnalyticsData] = useState([]);
    const [activeUsers, setActiveUsers] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            const response = await api.post("/analytics/analytics");
            setAnalyticsData(response.data);
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
            {analyticsData.map((data) => (
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
