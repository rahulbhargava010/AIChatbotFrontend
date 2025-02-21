import React, { useState } from "react";
import api from "../config/axios";
import "bootstrap/dist/css/bootstrap.min.css";
import countryData from "../contants/countryData.json"; // Import JSON file

const CompanyForm = () => {
  const [company, setCompany] = useState({
    name: "",
    GST: "",
    address: "",
    city: "",
    state: "",
    website: "",
    phone: "",
    email: "",
    description: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setCompany({ ...company, [e.target.name]: e.target.value });
  };

  const handleStateChange = (e) => {
    const selectedState = e.target.value;
    setCompany({ ...company, state: selectedState, city: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!company.name) {
      setMessage("Company name is required.");
      return;
    }

    try {
      const token = localStorage.getItem("token"); // Get token from localStorage
      await api.post("/company/add", company, {
        headers: {
          Authorization: `Bearer ${token}`, // Add token in Authorization header
          "Content-Type": "application/json",
        },
      });

      setMessage("Company added successfully!");
      setCompany({
        name: "",
        GST: "",
        address: "",
        city: "",
        state: "",
        website: "",
        phone: "",
        email: "",
        description: "",
      });
    } catch (error) {
      setMessage(error.response?.data?.error || "Failed to add company.");
    }
  };

  return (
    <div
      className="container-fluid d-flex justify-content-center align-items-center vh-80"
      style={{ overflowY: "auto", marginTop: "100px" }}
    >
      <div className="col-lg-6 col-md-8 col-sm-10 col-12">
        <div className="card shadow-lg p-4">
          <h2 className="text-center mb-3">Add Company</h2>
          {message && <div className="alert alert-info">{message}</div>}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Company Name *</label>
              <input
                type="text"
                name="name"
                className="form-control"
                value={company.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">GST</label>
              <input
                type="text"
                name="GST"
                className="form-control"
                value={company.GST}
                onChange={handleChange}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Address</label>
              <input
                type="text"
                name="address"
                className="form-control"
                value={company.address}
                onChange={handleChange}
              />
            </div>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">State</label>
                <select
                  name="state"
                  className="form-control"
                  value={company.state}
                  onChange={handleStateChange}
                >
                  <option value="">Select State</option>
                  {countryData.states.map((state) => (
                    <option key={state.code} value={state.name}>
                      {state.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">City</label>
                <select
                  name="city"
                  className="form-control"
                  value={company.city}
                  onChange={handleChange}
                  disabled={!company.state}
                >
                  <option value="">Select City</option>
                  {company.state &&
                    countryData.states
                      .find((state) => state.name === company.state) // Find the selected state
                      ?.cities.map(
                        (
                          city // Access its cities array
                        ) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        )
                      )}
                </select>
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label">Website</label>
              <input
                type="url"
                name="website"
                className="form-control"
                value={company.website}
                onChange={handleChange}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Phone</label>
              <input
                type="text"
                name="phone"
                className="form-control"
                value={company.phone}
                onChange={handleChange}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                name="email"
                className="form-control"
                value={company.email}
                onChange={handleChange}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Description</label>
              <textarea
                name="description"
                className="form-control"
                rows="3"
                value={company.description}
                onChange={handleChange}
              ></textarea>
            </div>
            <button type="submit" className="btn btn-primary w-100">
              Add Company
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CompanyForm;
