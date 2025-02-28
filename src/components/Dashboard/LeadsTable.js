import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
} from "@tanstack/react-table";
import api from "../config/axios";
import "./LeadsTable.css";
import LeadDetails from "./LeadDetails";

const LeadsTable = () => {
  const { chatbotId } = useParams();
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [chatbotNames, setChatbotNames] = useState([]);
  const [selectedChatbot, setSelectedChatbot] = useState("All");
  const [selectedDate, setSelectedDate] = useState(15);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedLead, setSelectedLead] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchLeads(selectedDate, startDate, endDate);
  }, [selectedDate, startDate, endDate]);

  const fetchLeads = async (days, start, end) => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.post(
        "/leads/list",
        { days, chatbot: chatbotId, startDate: start, endDate: end },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log(response.data);
      setLeads(response.data);
      setFilteredLeads(response.data);

      const uniqueChatbotNames = [
        ...new Set(response.data.map((lead) => lead.chatbotName)),
      ];
      setChatbotNames(["All", ...uniqueChatbotNames]);
    } catch (error) {
      console.error("Error fetching leads:", error);
    }
  };

  const handleFilterChange = (event) => {
    const selected = event.target.value;
    setSelectedChatbot(selected);
    setFilteredLeads(
      selected === "All"
        ? leads
        : leads.filter((lead) => lead.chatbotName === selected)
    );
  };

  const handleDateFilterChange = (event) => {
    setSelectedDate(event.target.value);
  };

  const handleStartDateChange = (event) => {
    setStartDate(event.target.value);
  };

  const handleEndDateChange = (event) => {
    setEndDate(event.target.value);
  };

  const handleRowClick = (leadId) => {
    // console.log(leadId);
    // setSelectedLead(leadId);
    // console.log("SelectedID:", selectedLead);
    // console.log(leadId);
    navigate(`/dashboard/leads/leadDetails/${leadId}`);
    // console.log("SelectedLead:", leadId);
  };

  const columns = useMemo(
    () => [
      { header: "Name", accessorKey: "name" },
      { header: "Email", accessorKey: "email" },
      { header: "Phone", accessorKey: "phone" },
      { header: "Chatbot Name", accessorKey: "chatbotName" },
      {
        header: "Created Time",
        accessorKey: "createdAt",
        cell: (info) => new Date(info.getValue()).toLocaleString(),
      },
    ],
    []
  );

  const table = useReactTable({
    columns,
    data: filteredLeads,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="leads-container">
      <h2>Leads Table</h2>
      <div className="filter-container">
        <label>Filter by Chatbot Name:</label>
        <select value={selectedChatbot} onChange={handleFilterChange}>
          {chatbotNames.map((name, index) => (
            <option key={index} value={name}>
              {name}
            </option>
          ))}
        </select>
        <label>Filter by Last:</label>
        <select value={selectedDate} onChange={handleDateFilterChange}>
          <option value={7}>7 Days</option>
          <option value={15}>15 Days</option>
          <option value={30}>30 Days</option>
          <option value={90}>90 Days</option>
        </select>
        <label>Start Date:</label>
        <input type="date" value={startDate} onChange={handleStartDateChange} />
        <label>End Date:</label>
        <input type="date" value={endDate} onChange={handleEndDateChange} />
      </div>
      <table className="leads-table">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((column) => (
                <th
                  key={column.id}
                  onClick={column.column.getToggleSortingHandler()}
                >
                  {column.column.columnDef.header}
                  {column.column.getIsSorted() === "desc"
                    ? " 🔽"
                    : column.column.getIsSorted() === "asc"
                    ? " 🔼"
                    : ""}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              onClick={() => handleRowClick(row.original._id)}
              style={{ cursor: "pointer" }}
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>{cell.renderValue()}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="pagination">
        <button
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </button>
        <span>Page {table.getState().pagination.pageIndex + 1}</span>
        <button
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default LeadsTable;
