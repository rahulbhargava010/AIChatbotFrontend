import React, { useState, useEffect, useContext } from "react";
import { Card, Row, Col, Container } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { LoaderContext } from "../Auth/LoaderContext";
import "./Dashboard.css";

import {
  faUsers,
  faChartLine,
  faDollarSign,
  faShoppingCart,
} from "@fortawesome/free-solid-svg-icons";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
} from "chart.js";
import api from "../config/axios";
import Loader from "./Loader";
import { useNavigate } from "react-router-dom";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement
);

const Dashboard = () => {
  const [analyticsData, setAnalyticsData] = useState({});
  const [chatbotData, setChatbotData] = useState([]);
  const [leadsData, setLeadsData] = useState([]);
  const { isLoading, showLoader, hideLoader } = useContext(LoaderContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      showLoader();
      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const analyticsRes = await api.post(
          "/analytics/analytics",
          {},
          { headers }
        );

        console.log("DATA:", analyticsRes.data);

        if (analyticsRes.data) {
          setAnalyticsData(analyticsRes.data); // Set the actual data array
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        hideLoader();
      }
    };

    fetchData();
  }, []);

  const handleCreateChatbot = () => {
    navigate("/dashboard/create-chatbot");
  };

  const barChartData = {
    labels: ["January", "February", "March", "April", "May", "June", "July"],
    datasets: [
      {
        label: "Sales",
        data: [65, 59, 80, 81, 56, 55, 40],
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  // Data for the line chart
  const lineChartData = {
    labels: ["January", "February", "March", "April", "May", "June", "July"],
    datasets: [
      {
        label: "Revenue",
        data: [1000, 2000, 1500, 3000, 2500, 4000, 3500],
        borderColor: "rgba(153, 102, 255, 1)",
        borderWidth: 2,
        fill: false,
      },
    ],
  };

  console.log(analyticsData);

  return (
    <Container fluid>
      <div className="d-flex justify-content-between align-items-center mb-5">
        <h1 className="my-4">Dashboard</h1>
        <button className="create-btn mb-3" onClick={handleCreateChatbot}>
          + Create Chatbot
        </button>
      </div>

      {/* Stats Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card>
            <Card.Body>
              <Card.Title>
                <FontAwesomeIcon icon={faUsers} className="me-2" />
                Conversations
              </Card.Title>
              <Card.Text>{analyticsData.length}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card>
            <Card.Body>
              <Card.Title>
                <FontAwesomeIcon icon={faChartLine} className="me-2" />
                Leads
              </Card.Title>
              <Card.Text>$12,345</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card>
            <Card.Body>
              <Card.Title>
                <FontAwesomeIcon icon={faDollarSign} className="me-2" />
                Response Time
              </Card.Title>
              <Card.Text>$45,678</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card>
            <Card.Body>
              <Card.Title>
                <FontAwesomeIcon icon={faShoppingCart} className="me-2" />
                Engagement Rate
              </Card.Title>
              <Card.Text>567</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row className="mb-4">
        <Col md={6}>
          <Card>
            <Card.Body>
              <Card.Title>Sales Chart</Card.Title>
              <Bar data={barChartData} />
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card>
            <Card.Body>
              <Card.Title>Revenue Chart</Card.Title>
              <Line data={lineChartData} />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
