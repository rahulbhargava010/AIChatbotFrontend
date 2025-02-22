import { Outlet } from "react-router-dom";
import { useState } from "react";
import Navbar from "../Dashboard/Navbar";
import SideBar from "../Dashboard/SideBar";

const ProtectedLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  return (
    <>
      {/* <Navbar /> */}
      <SideBar onSidebarToggle={setSidebarOpen} />
      <div
        className={`content-wrapper ${sidebarOpen ? "expanded" : "collapsed"}`}
      >
        <Outlet />
      </div>
    </>
  );
};

export default ProtectedLayout;
