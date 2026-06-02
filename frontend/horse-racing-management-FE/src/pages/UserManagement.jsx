import { useEffect, useState } from "react";
import StatCard from "../components/StatCard";
import { getUsers, updateUserRole, updateUserStatus } from "../services/adminService";
import "../styles/UserManagement.css";

const ROLES = ["", "ADMIN", "STAFF", "SPECTATOR", "USER", "HORSE_OWNER", "JOCKEY", "REFEREE", "MANAGER"];
const STATUSES = ["", "ACTIVE", "INACTIVE", "BANNED"];

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await getUsers(page, 10, keyword, role, status);
      if (res.success) {
        setUsers(res.data.content || []);
        setTotalPages(res.data.totalPages || 0);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUsers(); }, [page]);

  const activeCount = users.filter(u => u.status === "ACTIVE").length;
  const adminCount = users.filter(u => u.role === "ADMIN").length;
  const bannedCount = users.filter(u => u.status === "BANNED").length;

  return (
    <div className="user-page">

      <div className="stats">
        <StatCard title="Total Users" value={users.length} />
        <StatCard title="Active Users" value={activeCount} color="green" />
        <StatCard title="Admins" value={adminCount} color="blue" />
        <StatCard title="Banned Users" value={bannedCount} color="red" />
      </div>

      <div className="toolbar">
        <input
          placeholder="🔍  Search user..."
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
          onKeyDown={e => e.key === "Enter" && loadUsers()}
        />
        <select value={role} onChange={e => setRole(e.target.value)}>
          {ROLES.map(r => (
            <option key={r} value={r}>{r || "All Roles"}</option>
          ))}
        </select>
        <select value={status} onChange={e => setStatus(e.target.value)}>
          {STATUSES.map(s => (
            <option key={s} value={s}>{s || "All Status"}</option>
          ))}
        </select>
        <button onClick={loadUsers}>Search</button>
      </div>

      <div className="table-container">
        <table className="user-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Full Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Status</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" className="empty-row">Loading...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan="7" className="empty-row">No users found</td></tr>
            ) : (
              users.map(user => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td><strong>{user.fullName}</strong></td>
                  <td>{user.email}</td>
                  <td>{user.phone}</td>
                  <td>
                    <select
                      className="role-select"
                      value={user.role}
                      onChange={e => updateUserRole(user.id, e.target.value)}
                    >
                      {ROLES.slice(1).map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <select
                      className="status-select"
                      value={user.status}
                      onChange={e => updateUserStatus(user.id, e.target.value)}
                    >
                      {STATUSES.slice(1).map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td>{user.createdAt}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button onClick={() => setPage(p => p - 1)} disabled={page === 0}>← Prev</button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button key={i} className={i === page ? "active" : ""} onClick={() => setPage(i)}>
              {i + 1}
            </button>
          ))}
          <button onClick={() => setPage(p => p + 1)} disabled={page === totalPages - 1}>Next →</button>
        </div>
      )}

    </div>
  );
}

export default UserManagement;
