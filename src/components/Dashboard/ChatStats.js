import { useEffect, useState } from "react";
import axios from "axios";
import api from "../config/axios";

const ChatStats = () => {
    const [stats, setStats] = useState({ totalChats: 0, avgMessagesPerChat: 0 });

    useEffect(() => {
        api.get("/conversations/stats").then((response) => {
            setStats(response.data);
        });
    }, []);

    return (
    <div>
        <h3>Chat Statistics</h3>
        <p>Total Chats: {stats.totalChats}</p>
        <p>Average Messages Per Chat: {stats.avgMessagesPerChat}</p>
    </div>
    );
};

export default ChatStats;
