import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import { useAuth } from "../context/AuthContext";
import LaoIDLogin from "../components/LaoIDLogin";
import LoginForm from "../components/LoginForm";

import "../styles/login.css";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const handleLogin = async ({ email, password }) => {
    setError("");
    if (!email || !password) {
      setError("Nhập đầy đủ thông tin");
      return;
    }

    try {
      const res = await API.post("/auth/login", { email, password });

      console.log(res.data.data);

      if (res.data?.data.accessToken) {
        login(res.data.data.accessToken);
        navigate("/");
      } else {
        setError("Không tìm thấy accessToken từ server.");
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Đăng nhập thất bại!";
      setError(msg);
    }
  };

  return (
    <div className="login-container">
      <LoginForm onSubmit={handleLogin} />
      {error && <p style={{ color: "red", marginTop: "8px" }}>{error}</p>}
      <hr />
      <LaoIDLogin />
    </div>
  );
}
