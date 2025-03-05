import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../config/axios";
import { FaEye, FaEdit, FaTrashAlt, FaPlus } from "react-icons/fa";
import ReactPaginate from "react-paginate";
import "./Dashboard.css";

const CompaniesList = () => {
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const companiesPerPage = 6;
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
    if (!window.confirm("Are you sure you want to delete this company?"))
      return;
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
    setCurrentPage(0);
  };

  const filteredCompanies = companies.filter((company) =>
    company.name.toLowerCase().includes(search.toLowerCase())
  );

  const offset = currentPage * companiesPerPage;
  const currentCompanies = filteredCompanies.slice(
    offset,
    offset + companiesPerPage
  );

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  return (
    <div className="dashboard-container container">
      <div className="d-flex justify-content-between align-items-center mb-5">
        <h3 className="m-0">Companies List</h3>
        <button
          className="create-btn mb-3"
          onClick={() => navigate("/dashboard/addCompany")}
        >
          {" "}
          <FaPlus /> Add Company
        </button>
      </div>

      {/* <input
        type="text"
        className="form-control w-50 mb-3"
        placeholder="🔍 Search company..."
        value={search}
        onChange={handleSearch}
      /> */}

      <div className="d-flex flex-wrap gap-3">
        {currentCompanies.map((company, index) => (
          <div key={company._id} className="chatbot-card p-3">
            <h5 className="flex-grow-1">{company.name}</h5>
            <div className="chatbot-actions">
              <Link className="btn" to={`company/${company._id}`}>
                <FaEye />
              </Link>
              <Link className="btn" to={`edit-company/${company._id}`}>
                <FaEdit />
              </Link>
              <a
                className="btn btn-danger"
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleDelete(company._id);
                }}
              >
                <FaTrashAlt />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <ReactPaginate
        previousLabel={"<"}
        nextLabel={">"}
        breakLabel={"..."}
        pageCount={Math.ceil(filteredCompanies.length / companiesPerPage)}
        marginPagesDisplayed={2}
        pageRangeDisplayed={3}
        onPageChange={handlePageClick}
        containerClassName={"pagination justify-content-center mt-4"}
        pageClassName={"page-item"}
        pageLinkClassName={"page-link"}
        previousClassName={"page-item"}
        previousLinkClassName={"page-link"}
        nextClassName={"page-item"}
        nextLinkClassName={"page-link"}
        breakClassName={"page-item disabled"}
        breakLinkClassName={"page-link"}
        activeClassName={"active"}
      />
    </div>
  );
};

export default CompaniesList;
