import { createContext, useContext, useState } from "react";
import API from "../api";


const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const localToken = localStorage.getItem("token");
  const [token, setToken] = useState(localToken || "");

  const login = (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  };

  const logout = async () => {
    try {
      await API.post("/auth/logout");
    } catch (error) {
      console.error("Đăng xuất thất bại:", error);
    }
    localStorage.removeItem("token");
    setToken("");
  };

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
