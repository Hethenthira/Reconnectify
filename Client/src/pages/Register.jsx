// Register.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ApiCall from "./ApiCall";
import signupImg from "../assets/signupImage.png";

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    department: "",
    graduationYear: "",
    role: "student",
    phone: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const validateForm = () => {
    const errors = {};

    if (!form.name.trim()) errors.name = "Name is required";

    if (!form.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      errors.email = "Email is invalid";
    }

    if (!form.password) {
      errors.password = "Password is required";
    } else if (form.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    if (form.password !== form.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    if (!form.department.trim()) errors.department = "Department is required";
    if (!form.graduationYear) errors.graduationYear = "Graduation year is required";

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const register = async () => {
    setError("");

    if (!validateForm()) return;

    setLoading(true);

    try {
      // Strip confirmPassword — not sent to backend
      const { confirmPassword, ...registerData } = form;

      const data = await ApiCall("/auth/register", {
        method: "POST",
        body: JSON.stringify(registerData),
      });

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // ── Role-based redirect after registration ───────────────────────────
      const role = data.user?.role;

      if (role === "alumni" || role === "student") {
        navigate("/login", { replace: true });
      } else {
        navigate("/", { replace: true });
      }

    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (validationErrors[name]) {
      setValidationErrors({ ...validationErrors, [name]: "" });
    }
  };

  return (
    <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center bg-light py-5">
      <div className="card shadow-lg border-0 rounded-4" style={{ maxWidth: "1100px", width: "100%" }}>
        <div className="row g-0">
          {/* LEFT FORM */}
          <div className="col-md-6 p-4 p-md-5">
            <div className="d-flex align-items-center mb-4">
              <div
                className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3"
                style={{ width: "50px", height: "50px", fontSize: "24px" }}
              >
                🎓
              </div>
              <div>
                <h3 className="fw-bold mb-0">Sign up</h3>
                <small className="text-muted">Join Alumni Connect</small>
              </div>
            </div>

            {error && (
              <div className="alert alert-danger alert-dismissible fade show" role="alert">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                {error}
                <button type="button" className="btn-close" onClick={() => setError("")}></button>
              </div>
            )}

            <form onSubmit={(e) => { e.preventDefault(); register(); }}>
              {/* Full Name */}
              <div className="mb-3">
                <label className="form-label fw-semibold">
                  Full Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className={`form-control ${validationErrors.name ? "is-invalid" : ""}`}
                  placeholder="Enter your full name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                />
                {validationErrors.name && (
                  <div className="invalid-feedback">{validationErrors.name}</div>
                )}
              </div>

              {/* Email */}
              <div className="mb-3">
                <label className="form-label fw-semibold">
                  Email Address <span className="text-danger">*</span>
                </label>
                <input
                  type="email"
                  className={`form-control ${validationErrors.email ? "is-invalid" : ""}`}
                  placeholder="your.email@example.com"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                />
                {validationErrors.email && (
                  <div className="invalid-feedback">{validationErrors.email}</div>
                )}
              </div>

              {/* Role Selection */}
              <div className="mb-3">
                <label className="form-label fw-semibold">
                  I am a <span className="text-danger">*</span>
                </label>
                <select
                  className="form-select"
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                >
                  <option value="student">Student</option>
                  <option value="alumni">Alumni</option>
                </select>
                <small className="text-muted">
                  {form.role === "student"
                    ? "Current student looking to connect"
                    : "Graduate ready to mentor"}
                </small>
              </div>

              {/* Password */}
              <div className="mb-3">
                <label className="form-label fw-semibold">
                  Password <span className="text-danger">*</span>
                </label>
                <input
                  type="password"
                  className={`form-control ${validationErrors.password ? "is-invalid" : ""}`}
                  placeholder="Minimum 6 characters"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                />
                {validationErrors.password && (
                  <div className="invalid-feedback">{validationErrors.password}</div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="mb-3">
                <label className="form-label fw-semibold">
                  Confirm Password <span className="text-danger">*</span>
                </label>
                <input
                  type="password"
                  className={`form-control ${validationErrors.confirmPassword ? "is-invalid" : ""}`}
                  placeholder="Re-enter your password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                />
                {validationErrors.confirmPassword && (
                  <div className="invalid-feedback">{validationErrors.confirmPassword}</div>
                )}
              </div>

              <div className="row">
                {/* Department */}
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold">
                    Department <span className="text-danger">*</span>
                  </label>
                  <select
                    className={`form-select ${validationErrors.department ? "is-invalid" : ""}`}
                    name="department"
                    value={form.department}
                    onChange={handleChange}
                  >
                    <option value="">Select Department</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Mechanical">Mechanical</option>
                    <option value="Civil">Civil</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Business Administration">Business Administration</option>
                    <option value="Other">Other</option>
                  </select>
                  {validationErrors.department && (
                    <div className="invalid-feedback">{validationErrors.department}</div>
                  )}
                </div>

                {/* Graduation Year */}
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold">
                    Graduation Year <span className="text-danger">*</span>
                  </label>
                  <select
                    className={`form-select ${validationErrors.graduationYear ? "is-invalid" : ""}`}
                    name="graduationYear"
                    value={form.graduationYear}
                    onChange={handleChange}
                  >
                    <option value="">Select Year</option>
                    {Array.from({ length: 15 }, (_, i) => new Date().getFullYear() + 5 - i).map(
                      (year) => (
                        <option key={year} value={year}>{year}</option>
                      )
                    )}
                  </select>
                  {validationErrors.graduationYear && (
                    <div className="invalid-feedback">{validationErrors.graduationYear}</div>
                  )}
                </div>
              </div>

              {/* Phone (Optional) */}
              <div className="mb-4">
                <label className="form-label fw-semibold">Phone Number (Optional)</label>
                <input
                  type="tel"
                  className="form-control"
                  placeholder="+91 98765 43210"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100 py-2 mb-3"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>

              <div className="text-center">
                <small className="text-muted">
                  Already have an account?{" "}
                  <Link to="/login" className="text-decoration-none fw-semibold">
                    Sign in
                  </Link>
                </small>
              </div>
            </form>
          </div>

          {/* RIGHT IMAGE */}
          <div
            className="col-md-6 d-none d-md-flex align-items-center justify-content-center"
            style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}
          >
            <div className="text-center text-white p-5">
              <img
                src={signupImg}
                alt="Signup"
                className="img-fluid mb-4 rounded-4 shadow"
                style={{ maxWidth: "400px" }}
              />
              <h3 className="fw-bold mb-3">Welcome to Alumni Connect</h3>
              <p className="lead">
                Connect with alumni, find mentorship, and explore career opportunities
              </p>
            
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;