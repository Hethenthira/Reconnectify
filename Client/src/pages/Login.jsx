// Login.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ApiCall from "./ApiCall";
import loginImg from "../assets/loginImage.png";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const login = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    setLoading(true);

    try {
      const data = await ApiCall("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      // Store token and full user object
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      if (remember) {
        localStorage.setItem("rememberMe", "true");
      }

      // ── Role-based redirect ──────────────────────────────────────────────
      const role = data.user?.role;

      if (role === "admin") {
        navigate("/admin", { replace: true });
      } else if (role === "alumni") {
        navigate("/dashboard", { replace: true });
      } else if (role === "student") {
        navigate("/", { replace: true });
      } else {
        navigate("/", { replace: true });
      }

    } catch (err) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center bg-light py-5">
      <div className="card shadow-lg border-0 rounded-4" style={{ maxWidth: "1000px", width: "100%" }}>
        <div className="row g-0">
          {/* LEFT IMAGE */}
          <div
            className="col-md-6 d-none d-md-flex align-items-center justify-content-center p-5"
            style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}
          >
            <div className="text-center text-white">
              <img
                src={loginImg}
                alt="Login"
                className="img-fluid mb-4 rounded-4 shadow"
                style={{ maxWidth: "350px" }}
              />
              <h3 className="fw-bold mb-3">Welcome Back!</h3>
              <p className="lead">Continue your journey with Alumni Connect</p>
              <div className="mt-4">
                <p className="small mb-2">✓ Connect with alumni worldwide</p>
                <p className="small mb-2">✓ Find mentorship opportunities</p>
                <p className="small mb-2">✓ Explore career paths</p>
                <p className="small">✓ Attend exclusive events</p>
              </div>
            </div>
          </div>

          {/* RIGHT FORM */}
          <div className="col-md-6 p-4 p-md-5">
            <div className="d-flex align-items-center mb-4">
              <div
                className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3"
                style={{ width: "50px", height: "50px", fontSize: "24px" }}
              >
                🎓
              </div>
              <div>
                <h3 className="fw-bold mb-0">Sign in</h3>
                <small className="text-muted">Access your account</small>
              </div>
            </div>

            {error && (
              <div className="alert alert-danger alert-dismissible fade show" role="alert">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                {error}
                <button type="button" className="btn-close" onClick={() => setError("")}></button>
              </div>
            )}

            <form onSubmit={login}>
              {/* Email */}
              <div className="mb-3">
                <label htmlFor="email" className="form-label fw-semibold">
                  Email Address
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0">
                    <i className="bi bi-envelope"></i>
                  </span>
                  <input
                    type="email"
                    className="form-control border-start-0 ps-0"
                    id="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="mb-3">
                <label htmlFor="password" className="form-label fw-semibold">
                  Password
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0">
                    <i className="bi bi-lock"></i>
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-control border-start-0 border-end-0 ps-0"
                    id="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    className="btn btn-outline-secondary border-start-0"
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    <i className={`bi bi-eye${showPassword ? "-slash" : ""}`}></i>
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={remember}
                    onChange={() => setRemember(!remember)}
                    id="remember"
                  />
                  <label className="form-check-label small" htmlFor="remember">
                    Remember me
                  </label>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100 py-2 mb-4"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </button>

              <div className="text-center">
                <small className="text-muted">
                  Don't have an account?{" "}
                  <Link to="/register" className="text-decoration-none fw-semibold">
                    Create one now
                  </Link>
                </small>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;