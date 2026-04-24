import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <nav className="navbar">
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <h1>🅿 Smart Parking</h1>
        <a
          href="http://localhost:5173"
          style={{ fontSize: "0.8rem", color: "#aaa", textDecoration: "none" }}
        >
          localhost:5173
        </a>
      </div>
      {user && (
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span style={{ fontSize: "0.9rem" }}>
            Hi, {user.name} {user.role === "admin" && <strong>(Admin)</strong>}
          </span>
          {user.role === "admin" && (
            <Link to="/admin" style={{ color: "#aaa", fontSize: "0.9rem" }}>
              Admin Panel
            </Link>
          )}
          <Link to="/dashboard" style={{ color: "#aaa", fontSize: "0.9rem" }}>
            Dashboard
          </Link>
          <button onClick={handleLogout}>Logout</button>
        </div>
      )}
    </nav>
  );
}
