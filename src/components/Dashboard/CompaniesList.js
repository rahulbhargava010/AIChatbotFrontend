import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../config/axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaEye, FaEdit, FaTrashAlt, FaPlus } from "react-icons/fa";
import CompanyForm from "./CompanyForm";

const CompaniesList = () => {
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const companiesPerPage = 5;
  const navigate = useNavigate();

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await api.get("/company/all");
      setCompanies(response.data.companies);
    } catch (error) {
      console.error("Error fetching companies:", error);
    }
  };

  const handleDelete = async (companyId) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this company?");
    if (!isConfirmed) return;
    try {
      await api.post("/company/delete", { company: companyId });
      setCompanies(companies.filter((company) => company._id !== companyId));
      alert("Company deleted successfully!");
    } catch (error) {
      console.error("Error deleting company:", error);
      alert("Failed to delete company.");
    }
  };

  const handleSearch = (event) => {
    setSearch(event.target.value);
    setCurrentPage(1);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const filteredCompanies = companies.filter((company) =>
    company.name.toLowerCase().includes(search.toLowerCase())
  );

  const indexOfLastCompany = currentPage * companiesPerPage;
  const indexOfFirstCompany = indexOfLastCompany - companiesPerPage;
  const currentCompanies = filteredCompanies.slice(
    indexOfFirstCompany,
    indexOfLastCompany
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col main-content transition-all" style={{ transition: "margin 0.3s ease", marginRight: isSidebarOpen ? "350px" : "0" }}>
          <div className="card shadow-lg p-4 mt-5 pt-5">
            <h2 className="text-center mb-4">Companies List</h2>

            <div className="d-flex justify-content-between align-items-center mb-3">
              <input
                type="text"
                className="form-control w-50 mb-0"
                placeholder="🔍 Search company..."
                value={search}
                onChange={handleSearch}
              />
              <button className="btn btn-primary mt-0 w-25" onClick={toggleSidebar}>
                <FaPlus /> Add Company
              </button>
            </div>

            <div className="table-responsive">
              <table className="table table-bordered text-center align-middle">
                <thead className="table-dark">
                  <tr>
                    <th>Sr. No</th>
                    <th>Company Name</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentCompanies.length > 0 ? (
                    currentCompanies.map((company, index) => (
                      <tr key={company._id}>
                        <td>{index + 1 + indexOfFirstCompany}</td>
                        <td>{company.name}</td>
                        <td>
                          <button className="btn btn-info btn-sm me-2" onClick={() => navigate(`company/${company._id}`)}>
                            <FaEye /> View
                          </button>
                          <button className="btn btn-warning btn-sm me-2" onClick={() => navigate(`edit-company/${company._id}`)}>
                            <FaEdit /> Edit
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(company._id)}>
                            <FaTrashAlt /> Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="text-muted">No companies found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className={`offcanvas offcanvas-end p-0 ${isSidebarOpen ? "show" : ""}`} tabIndex="-1" style={{ width: "350px" }}>
          <div className="offcanvas-header">
            <h5 className="offcanvas-title">Add Company</h5>
            <button type="button" className="btn-close" onClick={toggleSidebar}></button>
          </div>
          <div className="offcanvas-body p-0">
            <CompanyForm />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompaniesList;
