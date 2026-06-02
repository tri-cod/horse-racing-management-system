import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { Outlet } from "react-router-dom";

import "../styles/AdminLayout.css";

function AdminLayout() {
  return (
    <div className="admin-layout">
      <Sidebar />

      <div className="main-content">
        <Topbar />
        <Outlet />
      </div>
    </div>
  );
}

export default AdminLayout;