import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useMessage } from '../context/MessageContext';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { unreadCount } = useMessage();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    logout();
    navigate("/login");
  };

  const getRoleEmoji = (role) => {
    if (role === 'admin') return '👑';
    if (role === 'alumni') return '👨‍💼';
    return '👨‍🎓';
  };

  return (
    <nav
      className="navbar navbar-expand-lg navbar-dark fixed-top"
      style={{ backgroundColor: "#0d6efd" }}
    >
      <div className="container-fluid px-4">
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <div
            className=" d-flex align-items-center justify-content-center me-2"
            style={{ width: "40px", height: "40px" }}
          >
                          <img src="src/assets/logo.png" alt="logo" width={60} height={70} />

          </div>
          <span className="fw-bold">Reconnectify</span>
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav mx-auto align-items-lg-center">
            {isAuthenticated ? (
              <>
                <li className="nav-item text-uppercase fw-bold">
                  <Link className="nav-link text-white" to="/">
                    <i className="bi bi-house me-1"></i>Home
                  </Link>
                </li>
                <li className="nav-item text-uppercase fw-bold">
                  <Link className="nav-link text-white" to="/about">
                    <i className="bi bi-info-circle me-1"></i>About
                  </Link>
                </li>
                <li className="nav-item text-uppercase fw-bold">
                  <Link className="nav-link text-white" to="/dashboard">
                    <i className="bi bi-speedometer2 me-1"></i>Dashboard
                  </Link>
                </li>
                <li className="nav-item text-uppercase fw-bold">
                  <Link className="nav-link text-white" to="/directory">
                    <i className="bi bi-people me-1"></i>Directory
                  </Link>
                </li>
                <li className="nav-item text-uppercase fw-bold">
                  <Link className="nav-link text-white" to="/events">
                    <i className="bi bi-calendar-event me-1"></i>Events
                  </Link>
                </li>
                  <li className="nav-item text-uppercase fw-bold">
                  <Link className="nav-link text-white" to="/feed">
                    <i className="bi bi-calendar-event me-1"></i>Post
                  </Link>
                </li>
                <li className="nav-item text-uppercase fw-bold">
                  <Link className="nav-link text-white" to="/opportunities">
                    <i className="bi bi-briefcase me-1"></i>Jobs
                  </Link>
                </li>

                {/* ── Messages with unread badge ── */}
                <li className="nav-item text-uppercase fw-bold">
                  <Link
                    className="nav-link text-white position-relative"
                    to="/messages"
                  >
                    <i className="bi bi-chat-dots me-1"></i>Messages
                    {unreadCount > 0 && (
                      <span
                        className="position-absolute badge rounded-pill bg-warning text-dark"
                        style={{
                          top: "2px",
                          right: "-4px",
                          fontSize: "10px",
                          minWidth: "18px",
                          padding: "2px 5px",
                          lineHeight: "14px",
                        }}
                      >
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                  </Link>
                </li>

                {/* ── User dropdown ── */}
                <li className="nav-item dropdown ms-lg-3">
                  <a
                    className="nav-link dropdown-toggle d-flex align-items-center"
                    href="#"
                    role="button"
                    data-bs-toggle="dropdown"
                  >
                    <div
                      className="bg-white rounded-circle d-flex align-items-center justify-content-center me-2"
                      style={{ width: "32px", height: "32px" }}
                    >
                      <span style={{ fontSize: "16px" }}>
                        {getRoleEmoji(user?.role)}
                      </span>
                    </div>
                    <span className="d-none d-lg-inline text-white fw-bold">
                      {user?.name}
                    </span>
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end">
                    <li>
                      <Link className="dropdown-item" to="/profile">
                        <i className="bi bi-person me-2"></i>My Profile
                      </Link>
                    </li>
                    <li>
                      <hr className="dropdown-divider" />
                    </li>
                    <li>
                      <button
                        className="dropdown-item text-danger"
                        onClick={handleLogout}
                      >
                        <i className="bi bi-box-arrow-right me-2"></i>Logout
                      </button>
                    </li>
                  </ul>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item text-uppercase fw-bold">
                  <Link className="nav-link text-white" to="/">
                    <i className="bi bi-house me-1"></i>Home
                  </Link>
                </li>
                <li className="nav-item text-uppercase fw-bold">
                  <Link className="nav-link text-white" to="/about">
                    <i className="bi bi-info-circle me-1"></i>About
                  </Link>
                </li>
                <li className="nav-item text-uppercase fw-bold">
                  <Link className="nav-link text-white" to="/login">
                    Login
                  </Link>
                </li>
                <li className="nav-item text-uppercase fw-bold">
                  <Link className="nav-link text-white" to="/register">
                    Sign Up
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;