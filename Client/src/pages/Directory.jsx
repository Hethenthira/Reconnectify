import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { userAPI, connectionAPI } from "../services/api";

const Directory = () => {
  const { user, isAuthenticated } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");

  // Map of userId → connection status: 'none' | 'pending' | 'accepted' | 'rejected'
  const [connectionStatus, setConnectionStatus] = useState({});
  // Map of userId → connectionId (needed to remove/manage)
  const [connectionIds, setConnectionIds] = useState({});

  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    if (isAuthenticated) {
      fetchUsers();
      fetchConnectionStatus();
    }
  }, [isAuthenticated]);

  const fetchUsers = async (search = "", role = "", department = "", year = "") => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.name = search;
      if (role) params.role = role;
      if (department) params.department = department;
      if (year) params.graduationYear = year;

      const response = await userAPI.getDirectory(params);
      setUsers(response.data.filter((u) => u._id !== user?.id));
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchConnectionStatus = async () => {
    try {
      const statusMap = {};
      const idMap = {};

      // Accepted connections
      const accepted = await connectionAPI.getConnections();
      accepted.data.forEach((conn) => {
        statusMap[conn._id] = "accepted";
        idMap[conn._id] = conn.connectionId || conn._id;
      });

      // Sent (pending outgoing)
      const sent = await connectionAPI.getSentRequests();
      sent.data.forEach((req) => {
        const targetId = req.recipient?._id || req.recipient;
        if (targetId) {
          statusMap[targetId] = "pending";
          idMap[targetId] = req._id;
        }
      });

      // Incoming pending (alumni gets these)
      const pending = await connectionAPI.getPendingRequests();
      pending.data.forEach((req) => {
        const senderId = req.requester?._id || req.requester;
        if (senderId) {
          statusMap[senderId] = "incoming";
          idMap[senderId] = req._id;
        }
      });

      setConnectionStatus(statusMap);
      setConnectionIds(idMap);
    } catch (err) {
      console.error("Error fetching connection status:", err);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    fetchUsers(term, roleFilter, departmentFilter, yearFilter);
  };

  const handleRoleFilter = (e) => {
    const role = e.target.value;
    setRoleFilter(role);
    fetchUsers(searchTerm, role, departmentFilter, yearFilter);
  };

  const handleDepartmentFilter = (e) => {
    const dept = e.target.value;
    setDepartmentFilter(dept);
    fetchUsers(searchTerm, roleFilter, dept, yearFilter);
  };

  const handleYearFilter = (e) => {
    const year = e.target.value;
    setYearFilter(year);
    fetchUsers(searchTerm, roleFilter, departmentFilter, year);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setRoleFilter("");
    setDepartmentFilter("");
    setYearFilter("");
    fetchUsers();
  };

  // ── Student clicks "Connect" ──────────────────────────────────────────────
  const handleConnect = async (targetUserId) => {
    setActionLoading((prev) => ({ ...prev, [targetUserId]: true }));
    try {
      const res = await connectionAPI.sendRequest(targetUserId);
      const connectionId = res.data?._id || res.data?.connection?._id;
      setConnectionStatus((prev) => ({ ...prev, [targetUserId]: "pending" }));
      if (connectionId) {
        setConnectionIds((prev) => ({ ...prev, [targetUserId]: connectionId }));
      }
    } catch (err) {
      alert(err.response?.data?.message || "Error sending request");
    } finally {
      setActionLoading((prev) => ({ ...prev, [targetUserId]: false }));
    }
  };

  // ── Alumni clicks Accept / Reject ─────────────────────────────────────────
  const handleRespond = async (targetUserId, status) => {
    const connectionId = connectionIds[targetUserId];
    if (!connectionId) return;
    setActionLoading((prev) => ({ ...prev, [targetUserId]: true }));
    try {
      await connectionAPI.respondToRequest(connectionId, status);
      setConnectionStatus((prev) => ({ ...prev, [targetUserId]: status }));
      if (status === "accepted") {
        // Refresh so the accepted user appears in messages
        fetchConnectionStatus();
      }
    } catch (err) {
      alert(err.response?.data?.message || "Error responding to request");
    } finally {
      setActionLoading((prev) => ({ ...prev, [targetUserId]: false }));
    }
  };

  const handleViewProfile = (u) => {
    setSelectedUser(u);
    setShowModal(true);
  };

  // ── Render the correct action button(s) based on connection status ─────────
  const renderConnectionButton = (targetUser) => {
    const status = connectionStatus[targetUser._id] || "none";
    const busy = actionLoading[targetUser._id];

    if (status === "accepted") {
      return (
        <button className="btn btn-success btn-sm" disabled>
          <i className="bi bi-check-circle-fill me-1"></i> Connected
        </button>
      );
    }

    if (status === "rejected") {
      return (
        <button className="btn btn-outline-secondary btn-sm" disabled>
          <i className="bi bi-x-circle me-1"></i> Request Declined
        </button>
      );
    }

    if (status === "pending") {
      // Current user sent the request → waiting
      return (
        <button className="btn btn-warning btn-sm" disabled>
          <i className="bi bi-clock-history me-1"></i> Request Sent
        </button>
      );
    }

    if (status === "incoming") {
      // Current user (alumni) received a request → Accept / Reject
      return (
        <div className="d-flex gap-2">
          <button
            className="btn btn-success btn-sm flex-grow-1"
            disabled={busy}
            onClick={() => handleRespond(targetUser._id, "accepted")}
          >
            {busy ? (
              <span className="spinner-border spinner-border-sm" />
            ) : (
              <><i className="bi bi-check-lg me-1"></i> Accept</>
            )}
          </button>
          <button
            className="btn btn-outline-danger btn-sm"
            disabled={busy}
            onClick={() => handleRespond(targetUser._id, "rejected")}
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
      );
    }

    // Default: no relationship → show Connect button
    return (
      <button
        className="btn btn-primary btn-sm"
        disabled={busy}
        onClick={() => handleConnect(targetUser._id)}
      >
        {busy ? (
          <span className="spinner-border spinner-border-sm" />
        ) : (
          <><i className="bi bi-person-plus me-1"></i> Connect</>
        )}
      </button>
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="container mt-5">
        <div className="alert alert-warning">
          <i className="bi bi-exclamation-triangle me-2"></i>
          Please login to view the directory
        </div>
      </div>
    );
  }

  return (
    <div className="bg-light min-vh-100" style={{ marginTop: "70px", paddingBottom: "50px" }}>
      <div className="container py-5">
        {/* Header */}
        <div className="text-center mb-5">
          <h1 className="fw-bold mb-2">
            <i className="bi bi-people-fill text-primary me-2"></i>
            Alumni Directory
          </h1>
          <p className="text-muted lead">
            Connect with {users.length}+ professionals in your network
          </p>
        </div>

        {/* Filters */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body p-4">
            <div className="row g-3 mb-3">
              <div className="col-md-3">
                <label className="form-label fw-semibold small">
                  <i className="bi bi-search me-1"></i> Search
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by name..."
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label fw-semibold small">
                  <i className="bi bi-person-badge me-1"></i> Role
                </label>
                <select className="form-select" value={roleFilter} onChange={handleRoleFilter}>
                  <option value="">All Roles</option>
                  <option value="student">Students</option>
                  <option value="alumni">Alumni</option>
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label fw-semibold small">
                  <i className="bi bi-building me-1"></i> Department
                </label>
                <select className="form-select" value={departmentFilter} onChange={handleDepartmentFilter}>
                  <option value="">All Departments</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Mechanical">Mechanical</option>
                  <option value="Civil">Civil</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Business Administration">Business Administration</option>
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label fw-semibold small">
                  <i className="bi bi-calendar me-1"></i> Graduation Year
                </label>
                <select className="form-select" value={yearFilter} onChange={handleYearFilter}>
                  <option value="">All Years</option>
                  {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
            {(searchTerm || roleFilter || departmentFilter || yearFilter) && (
              <button className="btn btn-sm btn-outline-secondary" onClick={clearFilters}>
                <i className="bi bi-x-circle me-1"></i> Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status" />
            <p className="text-muted mt-3">Loading directory...</p>
          </div>
        ) : users.length > 0 ? (
          <>
            <div className="mb-3">
              <small className="text-muted">
                Showing <strong>{users.length}</strong>{" "}
                {users.length === 1 ? "result" : "results"}
              </small>
            </div>
            <div className="row g-4">
              {users.map((targetUser) => {
                const status = connectionStatus[targetUser._id] || "none";
                return (
                  <div key={targetUser._id} className="col-lg-4 col-md-6">
                    <div className="card h-100 border-0 shadow-sm hover-card">
                      <div className="card-body p-4">
                        {/* Status badge ribbon */}
                        {status === "incoming" && (
                          <div className="position-absolute top-0 end-0 m-2">
                            <span className="badge bg-warning text-dark">
                              <i className="bi bi-bell-fill me-1"></i> Wants to Connect
                            </span>
                          </div>
                        )}

                        {/* User Header */}
                        <div className="text-center mb-3">
                          <div
                            className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                            style={{ width: "80px", height: "80px", fontSize: "36px" }}
                          >
                            {targetUser.role === "alumni" ? "👨‍💼" : "👨‍🎓"}
                          </div>
                          <h5 className="fw-bold mb-1">{targetUser.name}</h5>
                          <span
                            className={`badge ${
                              targetUser.role === "alumni" ? "bg-primary" : "bg-success"
                            } mb-2`}
                          >
                            {targetUser.role?.toUpperCase()}
                          </span>
                        </div>

                        {/* User Info */}
                        <div className="mb-3">
                          {targetUser.department && (
                            <p className="small mb-2">
                              <i className="bi bi-mortarboard text-primary me-2"></i>
                              <strong>Department:</strong> {targetUser.department}
                            </p>
                          )}
                          {targetUser.graduationYear && (
                            <p className="small mb-2">
                              <i className="bi bi-calendar-check text-success me-2"></i>
                              <strong>Class of:</strong> {targetUser.graduationYear}
                            </p>
                          )}
                          {targetUser.company && (
                            <p className="small mb-2">
                              <i className="bi bi-building text-info me-2"></i>
                              <strong>Company:</strong> {targetUser.company}
                            </p>
                          )}
                          {targetUser.position && (
                            <p className="small mb-2">
                              <i className="bi bi-briefcase text-warning me-2"></i>
                              <strong>Position:</strong> {targetUser.position}
                            </p>
                          )}
                          {targetUser.bio && (
                            <p
                              className="small text-muted mb-0"
                              style={{
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                              }}
                            >
                              {targetUser.bio}
                            </p>
                          )}
                        </div>

                        {/* Social Links */}
                        {(targetUser.linkedin || targetUser.github || targetUser.twitter) && (
                          <div className="d-flex gap-2 mb-3">
                            {targetUser.linkedin && (
                              <a href={targetUser.linkedin} target="_blank" rel="noopener noreferrer"
                                className="btn btn-sm btn-outline-primary">
                                <i className="bi bi-linkedin"></i>
                              </a>
                            )}
                            {targetUser.github && (
                              <a href={targetUser.github} target="_blank" rel="noopener noreferrer"
                                className="btn btn-sm btn-outline-dark">
                                <i className="bi bi-github"></i>
                              </a>
                            )}
                            {targetUser.twitter && (
                              <a href={targetUser.twitter} target="_blank" rel="noopener noreferrer"
                                className="btn btn-sm btn-outline-info">
                                <i className="bi bi-twitter"></i>
                              </a>
                            )}
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="d-grid gap-2">
                          <button
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => handleViewProfile(targetUser)}
                          >
                            <i className="bi bi-eye me-1"></i> View Profile
                          </button>
                          {renderConnectionButton(targetUser)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center py-5">
              <i className="bi bi-search display-1 text-muted mb-3 d-block"></i>
              <h5 className="fw-bold mb-2">No users found</h5>
              <p className="text-muted mb-3">Try adjusting your search criteria or filters</p>
              <button className="btn btn-primary" onClick={clearFilters}>
                <i className="bi bi-arrow-counterclockwise me-1"></i> Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Profile Modal */}
      {showModal && selectedUser && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content">
              <div
                className="modal-header border-0"
                style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}
              >
                <div className="text-white">
                  <h5 className="modal-title fw-bold">{selectedUser.name}</h5>
                  <small>
                    {selectedUser.role?.toUpperCase()} • {selectedUser.department}
                  </small>
                </div>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body p-4">
                <div className="row">
                  <div className="col-md-4 text-center mb-4">
                    <div
                      className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                      style={{ width: "120px", height: "120px", fontSize: "60px" }}
                    >
                      {selectedUser.role === "alumni" ? "👨‍💼" : "👨‍🎓"}
                    </div>
                    <div className="mt-2">{renderConnectionButton(selectedUser)}</div>
                  </div>
                  <div className="col-md-8">
                    <h6 className="fw-bold mb-3">About</h6>
                    <p className="text-muted">{selectedUser.bio || "No bio available"}</p>

                    {selectedUser.role === "alumni" && (
                      <>
                        <h6 className="fw-bold mb-3 mt-4">Professional Info</h6>
                        <p className="mb-2">
                          <i className="bi bi-building text-primary me-2"></i>
                          <strong>Company:</strong> {selectedUser.company || "Not specified"}
                        </p>
                        <p className="mb-2">
                          <i className="bi bi-briefcase text-success me-2"></i>
                          <strong>Position:</strong> {selectedUser.position || "Not specified"}
                        </p>
                      </>
                    )}

                    <h6 className="fw-bold mb-3 mt-4">Academic</h6>
                    <p className="mb-2">
                      <i className="bi bi-mortarboard text-primary me-2"></i>
                      <strong>Department:</strong> {selectedUser.department || "Not specified"}
                    </p>
                    {selectedUser.graduationYear && (
                      <p className="mb-2">
                        <i className="bi bi-calendar-check text-success me-2"></i>
                        <strong>Class of:</strong> {selectedUser.graduationYear}
                      </p>
                    )}

                    <h6 className="fw-bold mb-3 mt-4">Contact</h6>
                    <p className="mb-2">
                      <i className="bi bi-envelope text-danger me-2"></i>
                      {selectedUser.email}
                    </p>
                    {selectedUser.phone && (
                      <p className="mb-2">
                        <i className="bi bi-telephone text-success me-2"></i>
                        {selectedUser.phone}
                      </p>
                    )}

                    {(selectedUser.linkedin || selectedUser.github || selectedUser.twitter) && (
                      <>
                        <h6 className="fw-bold mb-3 mt-4">Social Profiles</h6>
                        <div className="d-flex gap-2">
                          {selectedUser.linkedin && (
                            <a href={selectedUser.linkedin} target="_blank" rel="noopener noreferrer"
                              className="btn btn-outline-primary btn-sm">
                              <i className="bi bi-linkedin me-1"></i> LinkedIn
                            </a>
                          )}
                          {selectedUser.github && (
                            <a href={selectedUser.github} target="_blank" rel="noopener noreferrer"
                              className="btn btn-outline-dark btn-sm">
                              <i className="bi bi-github me-1"></i> GitHub
                            </a>
                          )}
                          {selectedUser.twitter && (
                            <a href={selectedUser.twitter} target="_blank" rel="noopener noreferrer"
                              className="btn btn-outline-info btn-sm">
                              <i className="bi bi-twitter me-1"></i> Twitter
                            </a>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .hover-card {
          transition: transform 0.2s, box-shadow 0.2s;
          position: relative;
        }
        .hover-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
        }
      `}</style>
    </div>
  );
};

export default Directory;