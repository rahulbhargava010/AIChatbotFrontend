import { Outlet } from "react-router-dom";
import Navbar from "../Dashboard/Navbar"; // Adjust the path based on your project structure

const ProtectedLayout = () => {
  return (
    <>
      <Navbar />
      <Outlet /> {/* Renders the protected route content */}
    </>
  );
};

export default ProtectedLayout;
