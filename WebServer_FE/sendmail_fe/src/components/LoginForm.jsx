import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginForm({ onSubmit }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ email, password });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Login</h2>
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        type="password"
        placeholder="Password"
      />
      <button type="submit">Login</button>

      <div className="register-section">
        <span>Bạn chưa có tài khoản? </span>
        <button type="button" onClick={() => navigate("/register")}>
          Đăng ký
        </button>
      </div>
    </form>
  );
}
