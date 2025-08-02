import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import "../styles/register.css";


export default function Register() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState(""); 
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await API.post("/auth/register", { email, name, password });
      setMessage("Đăng ký thành công! Đang chuyển đến trang đăng nhập...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      setMessage(error.response?.data?.message || "Đăng ký thất bại");
    }
  };

  return (
    <div className="container">
      <form onSubmit={handleRegister}>
        <h2>Đăng ký</h2>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Họ và tên"
          required
        />
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mật khẩu"
          type="password"
          required
        />
        <button type="submit">Đăng ký</button>
        <p>{message}</p>
      </form>
    </div>
  );
}
