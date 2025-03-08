import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../config/axios";
import DataTable from "./DataTable";
import { FaEye, FaEdit, FaTrashAlt, FaPlus } from "react-icons/fa";
import { LoaderContext } from "../Auth/LoaderContext";

const CompaniesList = () => {
  const [companies, setCompanies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const { showLoader, hideLoader } = useContext(LoaderContext);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    showLoader();
    try {
      const response = await api.get("/company/all");
      setCompanies(response.data.companies);
      console.log("ComponiesList:", response.data);
    } catch (error) {
      console.error("Error fetching companies:", error);
    } finally {
      hideLoader();
    }
  };

  const handleDelete = async (companyId) => {
    if (!window.confirm("Are you sure you want to delete this company?"))
      return;
    try {
      await api.post("/company/delete", { company: companyId });
      setCompanies(companies.filter((company) => company._id !== companyId));
    } catch (error) {
      console.error("Error deleting company:", error);
    }
  };

  const columns = [{ key: "name", header: "Name" }];

  const actions = [
    {
      label: "View",
      icon: <FaEye />,
      to: (item) => `/dashboard/companyList/company/${item._id}`,
    },
    {
      label: "Edit",
      icon: <FaEdit />,
      to: (item) => `/dashboard/companyList/edit-company/${item._id}`,
    },
    {
      label: "Delete",
      icon: <FaTrashAlt />,
      onClick: (e, item) => handleDelete(item._id),
    },
  ];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-5">
        <h3 className="m-0">Companies List</h3>
        <button
          className="create-btn mb-3"
          onClick={() => navigate("/dashboard/addCompany")}
        >
          <FaPlus /> Add Company
        </button>
      </div>
      <DataTable
        data={companies}
        columns={columns}
        actions={actions}
        searchTerm={searchTerm}
        onSearchChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>
  );
};

export default CompaniesList;
