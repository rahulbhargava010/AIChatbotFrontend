import { Outlet } from "react-router-dom";
import Navbar from "../Dashboard/Navbar";

const ProtectedLayout = () => {
  return (
    <>
      <Navbar />
      <Outlet /> {/* Renders the protected route content */}
    </>
  );
};

export default ProtectedLayout;
