import React, { useState } from "react";
import ReactPaginate from "react-paginate";
import { Link } from "react-router-dom";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./Dashboard.css";

const DataTable = ({
  data,
  columns,
  actions,
  onRowClick,
  searchTerm = "",
  onSearchChange,
  itemsPerPageOptions = [6, 10, 20, 50],
  defaultItemsPerPage = 6,
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(defaultItemsPerPage);

  // Filter data based on search term
  const filteredData = data.filter((item) =>
    Object.values(item).some((value) =>
      String(value || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    )
  );

  console.log("ACTIONS:", actions);

  // Pagination logic
  const offset = currentPage * itemsPerPage;
  const currentItems = filteredData.slice(offset, offset + itemsPerPage);

  // Handle page change
  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  // Handle items per page change
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(0);
  };

  return (
    <div className="dashboard-container container">
      {/* Search and Items Per Page Controls */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex align-items-center">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={onSearchChange}
            className="form-control search-input"
          />
        </div>
        <div className="d-flex align-items-center">
          <span className="me-2">Show:</span>
          <select
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
            className="form-select"
          >
            {itemsPerPageOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key}>{column.header}</th>
              ))}
              {actions && (
                <th className="d-flex justify-content-around">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {currentItems.map((item, index) => (
              <tr key={index}>
                {columns.map((column) => (
                  <td
                    key={column.key}
                    onClick={() => onRowClick(item)}
                    style={{ cursor: "pointer" }}
                  >
                    {column.render
                      ? column.render(item[column.key])
                      : item[column.key]}
                  </td>
                ))}
                {actions && (
                  <td>
                    <div className="chatbot-actions">
                      {actions.map((action) => (
                        <React.Fragment key={action.label}>
                          {action.to ? (
                            <Link
                              className="btn"
                              to={action.to(item)}
                              onClick={(e) =>
                                action.onClick && action.onClick(e, item)
                              }
                              title={action.label}
                              data-bs-toggle="tooltip"
                            >
                              {typeof action.icon === "function"
                                ? action.icon(item)
                                : action.icon}
                            </Link>
                          ) : (
                            <button
                              className="btn"
                              onClick={(e) =>
                                action.onClick && action.onClick(e, item)
                              }
                              title={action.label}
                              data-bs-toggle="tooltip"
                            >
                              {typeof action.icon === "function"
                                ? action.icon(item)
                                : action.icon}
                            </button>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="d-flex justify-content-end mt-4">
        <ReactPaginate
          previousLabel={"<"}
          nextLabel={">"}
          breakLabel={"..."}
          pageCount={Math.ceil(filteredData.length / itemsPerPage)}
          marginPagesDisplayed={2}
          pageRangeDisplayed={3}
          onPageChange={handlePageClick}
          containerClassName={"pagination"}
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
    </div>
  );
};

export default DataTable;
