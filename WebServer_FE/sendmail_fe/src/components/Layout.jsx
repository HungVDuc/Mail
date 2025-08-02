import Sidebar from "./Sidebar";
import "../styles/layout.css";

export default function Layout({ children, logout }) {
  return (
    <div className="app-layout">
      <Sidebar logout={logout} />
      <main className="main-content">{children}</main>
    </div>
  );
}