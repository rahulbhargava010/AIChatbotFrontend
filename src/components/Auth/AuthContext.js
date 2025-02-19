import { createContext, useContext, useEffect, useState } from "react";
import api from "../config/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("userRole");

    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setUser({ token, role }); // ✅ Store role on reload
    }
    setLoading(false);
  }, []);

  const login = (token, user) => {
    localStorage.setItem("token", token);
    localStorage.setItem("userRole", user.roles);
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    setUser({ token, role: user.role });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole"); // ✅ Remove role on logout
    delete api.defaults.headers.common["Authorization"];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
