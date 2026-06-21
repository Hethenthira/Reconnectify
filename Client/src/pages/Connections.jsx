import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { connectionAPI } from "../services/api";

/**
 * Connections page
 * ─ Shows accepted connections
 * ─ Shows incoming pending requests (alumni can Accept / Reject)
 * ─ Shows outgoing requests the current user sent
 * ─ On Accept → redirect to Messages with chat auto-open
 */
const Connections = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("connections");
  const [connections, setConnections] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    if (isAuthenticated) fetchAll();
  }, [isAuthenticated]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [connRes, pendingRes, sentRes] = await Promise.all([
        connectionAPI.getConnections(),
        connectionAPI.getPendingRequests(),
        connectionAPI.getSentRequests(),
      ]);
      setConnections(connRes.data);
      setPendingRequests(pendingRes.data);
      setSentRequests(sentRes.data);
    } catch (err) {
      console.error("Error loading connections:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (request, status) => {
    const reqId = request._id;
    setActionLoading((prev) => ({ ...prev, [reqId]: status }));
    try {
      await connectionAPI.respondToRequest(reqId, status);

      if (status === "accepted") {
        const acceptedUser = request.requester || request.sender;
        // Remove from pending list
        setPendingRequests((prev) => prev.filter((r) => r._id !== reqId));
        // Add to connections list
        if (acceptedUser) setConnections((prev) => [...prev, acceptedUser]);
        // Navigate to messages and auto-open the new chat
        const targetId = acceptedUser?._id;
        if (targetId) {
          navigate(`/messages?openChat=${targetId}`);
        }
      } else {
        // Rejected: remove from pending
        setPendingRequests((prev) => prev.filter((r) => r._id !== reqId));
      }
    } catch (err) {
      alert(err.response?.data?.message || "Error responding to request");
    } finally {
      setActionLoading((prev) => ({ ...prev, [reqId]: null }));
    }
  };

  const handleRemoveConnection = async (connId, userId) => {
    if (!window.confirm("Remove this connection?")) return;
    try {
      await connectionAPI.removeConnection(connId);
      setConnections((prev) => prev.filter((c) => c._id !== userId));
    } catch (err) {
      alert(err.response?.data?.message || "Error removing connection");
    }
  };

  const handleOpenChat = (userId) => {
    navigate(`/messages?openChat=${userId}`);
  };

  if (!isAuthenticated) {
    return (
      <div className="container mt-5">
        <div className="alert alert-warning">
          Please login to view your connections.
        </div>
      </div>
    );
  }

  const tabs = [
    {
      key: "connections",
      label: "Connections",
      icon: "bi-people-fill",
      count: connections.length,
      color: "success",
    },
    {
      key: "pending",
      label: "Requests",
      icon: "bi-bell-fill",
      count: pendingRequests.length,
      color: "warning",
    },
    {
      key: "sent",
      label: "Sent",
      icon: "bi-send-fill",
      count: sentRequests.length,
      color: "info",
    },
  ];

  return (
    <div className="bg-light min-vh-100" style={{ marginTop: "70px", paddingBottom: "50px" }}>
      <div className="container py-5">
        {/* Header */}
        <div className="text-center mb-5">
          <h1 className="fw-bold mb-2">
            <i className="bi bi-people-fill text-primary me-2"></i>
            My Connections
          </h1>
          <p className="text-muted lead">Manage your professional network</p>
        </div>

        {/* Tabs */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body p-0">
            <div className="nav nav-tabs border-0 px-3 pt-3">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  className={`nav-link px-4 py-3 fw-semibold ${
                    activeTab === tab.key
                      ? "active border-bottom border-primary border-3 text-primary"
                      : "text-muted"
                  }`}
                  style={{ border: "none", background: "none" }}
                  onClick={() => setActiveTab(tab.key)}
                >
                  <i className={`bi ${tab.icon} me-2`}></i>
                  {tab.label}
                  {tab.count > 0 && (
                    <span className={`badge bg-${tab.color} ms-2`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status" />
            <p className="text-muted mt-3">Loading...</p>
          </div>
        ) : (
          <>
            {/* ── Accepted Connections ─────────────────────────────── */}
            {activeTab === "connections" && (
              <>
                {connections.length === 0 ? (
                  <EmptyState
                    icon="bi-people"
                    title="No connections yet"
                    message="Connect with alumni and students from the directory."
                    actionLabel="Browse Directory"
                    actionHref="/directory"
                  />
                ) : (
                  <div className="row g-4">
                    {connections.map((conn) => (
                      <div key={conn._id} className="col-lg-4 col-md-6">
                        <div className="card border-0 shadow-sm h-100 hover-card">
                          <div className="card-body p-4">
                            <div className="d-flex align-items-center mb-3">
                              <div
                                className="rounded-circle d-flex align-items-center justify-content-center me-3 flex-shrink-0"
                                style={{
                                  width: "60px",
                                  height: "60px",
                                  background: conn.role === "alumni" ? "#e8f0fe" : "#e6f4ea",
                                  fontSize: "28px",
                                }}
                              >
                                {conn.role === "alumni" ? "👨‍💼" : "👨‍🎓"}
                              </div>
                              <div>
                                <h6 className="fw-bold mb-0">{conn.name}</h6>
                                <span className={`badge ${conn.role === "alumni" ? "bg-primary" : "bg-success"} mt-1`}>
                                  {conn.role?.toUpperCase()}
                                </span>
                              </div>
                            </div>

                            {conn.department && (
                              <p className="small mb-1 text-muted">
                                <i className="bi bi-mortarboard me-1"></i>
                                {conn.department}
                              </p>
                            )}
                            {conn.company && (
                              <p className="small mb-1 text-muted">
                                <i className="bi bi-building me-1"></i>
                                {conn.company}
                              </p>
                            )}

                            <div className="d-grid gap-2 mt-3">
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={() => handleOpenChat(conn._id)}
                              >
                                <i className="bi bi-chat-dots me-1"></i> Message
                              </button>
                              <button
                                className="btn btn-outline-danger btn-sm"
                                onClick={() =>
                                  handleRemoveConnection(conn.connectionId || conn._id, conn._id)
                                }
                              >
                                <i className="bi bi-person-x me-1"></i> Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* ── Pending Incoming Requests ─────────────────────────── */}
            {activeTab === "pending" && (
              <>
                {pendingRequests.length === 0 ? (
                  <EmptyState
                    icon="bi-bell"
                    title="No pending requests"
                    message="You have no incoming connection requests."
                  />
                ) : (
                  <div className="row g-4">
                    {pendingRequests.map((req) => {
                      const sender = req.requester || req.sender || {};
                      const busy = actionLoading[req._id];
                      return (
                        <div key={req._id} className="col-lg-4 col-md-6">
                          <div className="card border-0 shadow-sm h-100 border-start border-4 border-warning">
                            <div className="card-body p-4">
                              <div className="d-flex align-items-center mb-3">
                                <div
                                  className="rounded-circle d-flex align-items-center justify-content-center me-3 flex-shrink-0"
                                  style={{
                                    width: "60px",
                                    height: "60px",
                                    background: sender.role === "alumni" ? "#e8f0fe" : "#e6f4ea",
                                    fontSize: "28px",
                                  }}
                                >
                                  {sender.role === "alumni" ? "👨‍💼" : "👨‍🎓"}
                                </div>
                                <div>
                                  <h6 className="fw-bold mb-0">{sender.name || "Unknown"}</h6>
                                  <span className={`badge ${sender.role === "alumni" ? "bg-primary" : "bg-success"} mt-1`}>
                                    {sender.role?.toUpperCase()}
                                  </span>
                                </div>
                              </div>

                              {sender.department && (
                                <p className="small mb-1 text-muted">
                                  <i className="bi bi-mortarboard me-1"></i>
                                  {sender.department}
                                </p>
                              )}

                              <div className="alert alert-warning py-2 small mt-2 mb-3">
                                <i className="bi bi-person-plus me-1"></i>
                                Wants to connect with you
                              </div>

                              <div className="d-grid gap-2">
                                <button
                                  className="btn btn-success btn-sm"
                                  disabled={!!busy}
                                  onClick={() => handleRespond(req, "accepted")}
                                >
                                  {busy === "accepted" ? (
                                    <span className="spinner-border spinner-border-sm me-1" />
                                  ) : (
                                    <i className="bi bi-check-lg me-1"></i>
                                  )}
                                  Accept
                                </button>
                                <button
                                  className="btn btn-outline-danger btn-sm"
                                  disabled={!!busy}
                                  onClick={() => handleRespond(req, "rejected")}
                                >
                                  {busy === "rejected" ? (
                                    <span className="spinner-border spinner-border-sm me-1" />
                                  ) : (
                                    <i className="bi bi-x-lg me-1"></i>
                                  )}
                                  Decline
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}

            {/* ── Sent Requests ─────────────────────────────────────── */}
            {activeTab === "sent" && (
              <>
                {sentRequests.length === 0 ? (
                  <EmptyState
                    icon="bi-send"
                    title="No sent requests"
                    message="You haven't sent any connection requests yet."
                    actionLabel="Browse Directory"
                    actionHref="/directory"
                  />
                ) : (
                  <div className="row g-4">
                    {sentRequests.map((req) => {
                      const recipient = req.recipient || {};
                      return (
                        <div key={req._id} className="col-lg-4 col-md-6">
                          <div className="card border-0 shadow-sm h-100">
                            <div className="card-body p-4">
                              <div className="d-flex align-items-center mb-3">
                                <div
                                  className="rounded-circle d-flex align-items-center justify-content-center me-3 flex-shrink-0"
                                  style={{
                                    width: "60px",
                                    height: "60px",
                                    background: recipient.role === "alumni" ? "#e8f0fe" : "#e6f4ea",
                                    fontSize: "28px",
                                  }}
                                >
                                  {recipient.role === "alumni" ? "👨‍💼" : "👨‍🎓"}
                                </div>
                                <div>
                                  <h6 className="fw-bold mb-0">{recipient.name || "Unknown"}</h6>
                                  <span className={`badge ${recipient.role === "alumni" ? "bg-primary" : "bg-success"} mt-1`}>
                                    {recipient.role?.toUpperCase()}
                                  </span>
                                </div>
                              </div>

                              {recipient.department && (
                                <p className="small mb-1 text-muted">
                                  <i className="bi bi-mortarboard me-1"></i>
                                  {recipient.department}
                                </p>
                              )}

                              <div className="d-flex align-items-center gap-2 mt-3">
                                <span className="badge bg-warning text-dark">
                                  <i className="bi bi-clock-history me-1"></i> Pending
                                </span>
                                <small className="text-muted">
                                  Sent {new Date(req.createdAt).toLocaleDateString()}
                                </small>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      <style jsx>{`
        .hover-card {
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .hover-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.12) !important;
        }
        .border-start.border-4 {
          border-left-width: 4px !important;
        }
      `}</style>
    </div>
  );
};

// ── Helper Component ─────────────────────────────────────────────────────────
const EmptyState = ({ icon, title, message, actionLabel, actionHref }) => (
  <div className="card border-0 shadow-sm">
    <div className="card-body text-center py-5">
      <i className={`bi ${icon} display-1 text-muted mb-3 d-block`}></i>
      <h5 className="fw-bold mb-2">{title}</h5>
      <p className="text-muted mb-3">{message}</p>
      {actionLabel && actionHref && (
        <a href={actionHref} className="btn btn-primary">
          <i className="bi bi-arrow-right-circle me-1"></i> {actionLabel}
        </a>
      )}
    </div>
  </div>
);

export default Connections;