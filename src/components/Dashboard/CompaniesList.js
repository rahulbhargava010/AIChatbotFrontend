import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../config/axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaEye, FaEdit, FaTrashAlt } from "react-icons/fa";

const CompaniesList = () => {
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
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
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this company?"
    );
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
    <div className="container mt-5">
      <div className="card shadow-lg p-4">
        <h2 className="text-center mb-4">Companies List</h2>

        <div className="d-flex justify-content-center align-items-center mb-3">
          <input
            type="text"
            className="form-control w-50"
            placeholder="🔍 Search company..."
            value={search}
            onChange={handleSearch}
          />
        </div>

        <div className="table-responsive">
          <table className="table table-bordered text-center align-middle">
            <thead className="table-dark">
              <tr>
                <th className="align-middle">#</th>
                <th className="align-middle">Company Name</th>
                <th className="align-middle">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentCompanies.length > 0 ? (
                currentCompanies.map((company, index) => (
                  <tr key={company._id}>
                    <td className="align-middle">
                      {index + 1 + indexOfFirstCompany}
                    </td>
                    <td className="align-middle">{company.name}</td>
                    <td className="align-middle">
                      <button
                        className="btn btn-info btn-sm me-2"
                        onClick={() => navigate(`company/${company._id}`)}
                      >
                        <FaEye /> View
                      </button>
                      <button
                        className="btn btn-warning btn-sm me-2"
                        onClick={() => navigate(`edit-company/${company._id}`)}
                      >
                        <FaEdit /> Edit
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(company._id)}
                      >
                        <FaTrashAlt /> Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="text-muted align-middle">
                    No companies found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredCompanies.length > companiesPerPage && (
          <nav>
            <ul className="pagination justify-content-center">
              <li
                className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
              >
                <button
                  className="page-link"
                  onClick={() => paginate(currentPage - 1)}
                >
                  Previous
                </button>
              </li>
              {Array.from(
                {
                  length: Math.ceil(
                    filteredCompanies.length / companiesPerPage
                  ),
                },
                (_, i) => (
                  <li
                    key={i}
                    className={`page-item ${
                      currentPage === i + 1 ? "active" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => paginate(i + 1)}
                    >
                      {i + 1}
                    </button>
                  </li>
                )
              )}
              <li
                className={`page-item ${
                  currentPage ===
                  Math.ceil(filteredCompanies.length / companiesPerPage)
                    ? "disabled"
                    : ""
                }`}
              >
                <button
                  className="page-link"
                  onClick={() => paginate(currentPage + 1)}
                >
                  Next
                </button>
              </li>
            </ul>
          </nav>
        )}
      </div>
    </div>
  );
};

export default CompaniesList;
