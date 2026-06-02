import { useLocation } from "react-router-dom";
import "../styles/Topbar.css";

const titles = {
  "/users": { label: "User", accent: "Management" },
  "/races": { label: "Race", accent: "Management" },
  "/horses": { label: "Horse", accent: "Management" },
};

function Topbar() {
  const { pathname } = useLocation();
  const title = titles[pathname] || { label: "Dashboard", accent: "" };

  return (
    <div className="topbar">
      <div className="topbar-title">
        <h1>
          {title.label} <span>{title.accent}</span>
        </h1>
      </div>

      <div className="topbar-right">
        <div className="admin-box">
          <div className="avatar">A</div>
          <div>
            <h4>Administrator</h4>
            <p>admin@horse.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Topbar;
