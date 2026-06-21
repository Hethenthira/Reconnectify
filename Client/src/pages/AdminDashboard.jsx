// AdminDashboard.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");
  const [filterRole, setFilterRole] = useState("");

  // ── Auth guard ─────────────────────────────────────────────────────────────
  const token = localStorage.getItem("token");
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = currentUser?.role === "admin";

  useEffect(() => {
    if (!token || !isAdmin) {
      navigate("/login", { replace: true });
      return;
    }
    fetchStats();
    fetchUsers();
  }, []);

  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  // ── Fetch platform stats ───────────────────────────────────────────────────
  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/stats`, { headers: authHeaders });
      if (!res.ok) throw new Error("Failed to fetch stats");
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error("Stats error:", err);
    }
  };

  // ── Fetch all users ────────────────────────────────────────────────────────
  const fetchUsers = async (role = "") => {
    setLoading(true);
    setError("");
    try {
      const params = role ? `?role=${role}` : "";
      const res = await fetch(`${API_BASE}/users${params}`, { headers: authHeaders });
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Failed to load users.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ── Approve user ───────────────────────────────────────────────────────────
  const approveUser = async (userId) => {
    setActionLoading(userId);
    try {
      const res = await fetch(`${API_BASE}/users/${userId}/approve`, {
        method: "PUT",
        headers: authHeaders,
      });
      if (!res.ok) throw new Error("Failed to approve");
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, isApproved: true } : u))
      );
    } catch (err) {
      alert("Failed to approve user",err);
    } finally {
      setActionLoading(null);
    }
  };

  // ── Change user role ───────────────────────────────────────────────────────
  const changeRole = async (userId, newRole) => {
    setActionLoading(userId + "_role");
    try {
      const res = await fetch(`${API_BASE}/users/${userId}/role`, {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify({ role: newRole }),
      });
      if (!res.ok) throw new Error("Failed to update role");
      const data = await res.json();
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, role: data.user.role } : u))
      );
    } catch (err) {
      alert("Failed to update role",err);
    } finally {
      setActionLoading(null);
    }
  };

  // ── Delete user ────────────────────────────────────────────────────────────
  const deleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    setActionLoading(userId + "_del");
    try {
      const res = await fetch(`${API_BASE}/users/${userId}`, {
        method: "DELETE",
        headers: authHeaders,
      });
      if (!res.ok) throw new Error("Failed to delete");
      setUsers((prev) => prev.filter((u) => u._id !== userId));
    } catch (err) {
      alert("Failed to delete user",err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login", { replace: true });
  };

  const handleFilterChange = (role) => {
    setFilterRole(role);
    fetchUsers(role);
  };

  if (!token || !isAdmin) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">
          Admin access required.{" "}
          <a href="/login">Go to Login</a>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard" style={{ marginTop: "90px", paddingBottom: "50px" }}>
      <div className="container">

        {/* ── Header ── */}
        <div className="d-flex justify-content-between align-items-center mb-5">
          <div>
            <h1 className="fw-bold mb-1">Admin Dashboard</h1>
            <p className="text-muted mb-0">
              Logged in as <strong>{currentUser.name}</strong> · {currentUser.email}
            </p>
          </div>
          <button className="btn btn-outline-danger" onClick={handleLogout}>
            <i className="bi bi-box-arrow-right me-2"></i>Logout
          </button>
        </div>

        {/* ── Stats Cards ── */}
        {stats && (
          <div className="row g-4 mb-5">
            {[
              { icon: "👥", label: "Total Users",   value: stats.users  || 0, color: "stat-primary" },
              { icon: "📝", label: "Total Posts",   value: stats.posts  || 0, color: "stat-success" },
              { icon: "💼", label: "Total Jobs",    value: stats.jobs   || 0, color: "stat-info"    },
              { icon: "📅", label: "Total Events",  value: stats.events || 0, color: "stat-warning" },
            ].map((s) => (
              <div key={s.label} className="col-md-6 col-lg-3">
                <div className={`stat-card ${s.color}`}>
                  <div className="stat-icon">{s.icon}</div>
                  <h6>{s.label}</h6>
                  <h2 className="stat-number">{s.value}</h2>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Users Management ── */}
        <div className="card shadow-sm">
          <div className="card-header bg-light d-flex justify-content-between align-items-center flex-wrap gap-2">
            <h5 className="mb-0 fw-bold">Users Management</h5>

            {/* Role Filter */}
            <div className="d-flex gap-2">
              {["", "student", "alumni", "admin"].map((r) => (
                <button
                  key={r}
                  className={`btn btn-sm ${filterRole === r ? "btn-primary" : "btn-outline-secondary"}`}
                  onClick={() => handleFilterChange(r)}
                >
                  {r === "" ? "All" : r.charAt(0).toUpperCase() + r.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="card-body p-0">
            {error && (
              <div className="alert alert-danger m-3">{error}</div>
            )}

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary"></div>
                <p className="mt-2 text-muted">Loading users...</p>
              </div>
            ) : users.length > 0 ? (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Department</th>
                      <th>Status</th>
                      <th>Join Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u._id}>
                        <td className="fw-semibold">{u.name}</td>
                        <td className="text-muted small">{u.email}</td>

                        {/* Role badge + change dropdown */}
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <span
                              className={`badge bg-${
                                u.role === "admin"
                                  ? "danger"
                                  : u.role === "alumni"
                                  ? "success"
                                  : "info"
                              }`}
                            >
                              {u.role?.toUpperCase()}
                            </span>
                            {u._id !== currentUser._id && u.role !== "admin" && (
                              <select
                                className="form-select form-select-sm"
                                style={{ width: "auto" }}
                                value={u.role}
                                disabled={actionLoading === u._id + "_role"}
                                onChange={(e) => changeRole(u._id, e.target.value)}
                              >
                                <option value="student">Student</option>
                                <option value="alumni">Alumni</option>
                              </select>
                            )}
                          </div>
                        </td>

                        <td>{u.department || <span className="text-muted">—</span>}</td>

                        <td>
                          <span className={`badge ${u.isApproved ? "bg-success" : "bg-warning text-dark"}`}>
                            {u.isApproved ? "Approved" : "Pending"}
                          </span>
                        </td>

                        <td className="small text-muted">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>

                        {/* Action buttons */}
                        <td>
                          <div className="d-flex gap-1">
                            {!u.isApproved && (
                              <button
                                className="btn btn-success btn-sm"
                                disabled={actionLoading === u._id}
                                onClick={() => approveUser(u._id)}
                                title="Approve user"
                              >
                                {actionLoading === u._id ? (
                                  <span className="spinner-border spinner-border-sm"></span>
                                ) : (
                                  <i className="bi bi-check-lg"></i>
                                )}
                              </button>
                            )}
                            {u._id !== currentUser._id && (
                              <button
                                className="btn btn-danger btn-sm"
                                disabled={actionLoading === u._id + "_del"}
                                onClick={() => deleteUser(u._id)}
                                title="Delete user"
                              >
                                {actionLoading === u._id + "_del" ? (
                                  <span className="spinner-border spinner-border-sm"></span>
                                ) : (
                                  <i className="bi bi-trash"></i>
                                )}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted text-center py-5">No users found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;