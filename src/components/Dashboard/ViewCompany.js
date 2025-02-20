import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../config/axios";
import { Spinner } from "react-bootstrap";

const ViewCompany = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await api.post(
          `/company/getDetail`,
          { companyId: id },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        // console.log("DATA:", response.data.company);
        setCompany(response.data.company);
      } catch (err) {
        setError("Failed to fetch company details");
      } finally {
        setLoading(false);
      }
    };
    fetchCompany();
  }, [id]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container text-center mt-5">
        <p className="text-danger">{error}</p>
        <button
          className="btn btn-primary"
          onClick={() => navigate("/dashboard/companyList")}
        >
          Back to Companies
        </button>
      </div>
    );
  }

  return (
    <div className="container d-flex flex-column align-items-center justify-content-center mt-5 vh-100">
      <div className="card shadow p-4 w-50">
        <h2 className="text-center mb-4">Company Details</h2>
        <ul className="list-group">
          <li className="list-group-item">
            <strong>Name:</strong> {company.name}
          </li>
          <li className="list-group-item">
            <strong>GST:</strong> {company.GST || "N/A"}
          </li>
          <li className="list-group-item">
            <strong>Address:</strong> {company.address || "N/A"}
          </li>
          <li className="list-group-item">
            <strong>City:</strong> {company.city || "N/A"}
          </li>
          <li className="list-group-item">
            <strong>State:</strong> {company.state || "N/A"}
          </li>
          <li className="list-group-item">
            <strong>Website:</strong>{" "}
            {company.website ? (
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
              >
                {company.website}
              </a>
            ) : (
              "N/A"
            )}
          </li>
          <li className="list-group-item">
            <strong>Phone:</strong> {company.phone || "N/A"}
          </li>
          <li className="list-group-item">
            <strong>Email:</strong> {company.email || "N/A"}
          </li>
          <li className="list-group-item">
            <strong>Description:</strong> {company.description || "N/A"}
          </li>
          <li className="list-group-item">
            <strong>Created At:</strong>{" "}
            {new Date(company.createdAt).toLocaleDateString()}
          </li>
        </ul>
        <button
          className="btn btn-secondary mt-3"
          onClick={() => navigate("/dashboard/companyList")}
        >
          Back to Companies
        </button>
      </div>
    </div>
  );
};

export default ViewCompany;
