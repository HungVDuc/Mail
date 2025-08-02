import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/sidebar.css";

export default function Sidebar() {
  const { logout } = useAuth();

  return (
    <div className="sidebar">
      <h3>Mail Client</h3>
      <ul>
        <li>
          <Link to="/">Inbox</Link>
        </li>
        <li>
          <Link to="/sent">Sent</Link>
        </li>
        <li>
          <Link to="/compose">Gửi Mail</Link>
        </li>
      </ul>

      <button onClick={logout}>Đăng xuất</button>
    </div>
  );
}
