import { useState } from "react";
import { NavLink } from "react-router-dom";
import "../styles/Sidebar.css";

const navItems = [
  { to: "/users", label: "User Management" },
  { to: "/races", label: "Race Management" },
  { to: "/horses", label: "Horse Management" },
  { to: "/betting", label: "Betting Management" },
];

function Sidebar() {
  const [expanded, setExpanded] = useState(false);

  return (
    <aside
      className={`sidebar ${expanded ? "expanded" : ""}`}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      <div className="logo">
        <span className="logo-royal">R</span>
        <span className="logo-text">
          <span className="logo-royal">oyal</span>
          <span className="logo-derby"> Derby</span>
        </span>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(({ to, label }) => (
          <NavLink
            key={to}
            className={({ isActive }) =>
              `menu-link${isActive ? " active" : ""}`
            }
            to={to}
          >
            <span className="menu-dot" />
            <span className="menu-label">{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <span className="footer-text">Admin Panel v1.0</span>
      </div>
    </aside>
  );
}

export default Sidebar;