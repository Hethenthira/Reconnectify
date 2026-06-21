import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer
      className="mt-5 py-5 text-white"
      style={{ backgroundColor: "#0f172a" }}
    >
      <div className="container">

        {/* Top Footer */}
        <div className="row g-5 justify-content-between">

          {/* Company Info */}
          <div className="col-lg-10 col-md-10">
            <div className="d-flex align-items-center gap-2 mb-3">
              <img src="src/assets/logo.png" alt="logo" width={60} height={70} />
              <Link className="navbar-brand fw-bold fs-4 text-white" to="/">
                Reconnectify
              </Link>
            </div>

            <p className="text-white">
            Reconnectify is a modern alumni association platform that helps graduates stay connected with their institution and peers. It enables alumni to share career updates, discover opportunities, participate in events, and build meaningful professional networks that support lifelong engagement and collaboration within the alumni community.            </p>
          </div>

          {/* Company Links */}
          <div className="col-lg-2 col-md-2">
            <h6 className="fw-bold text-uppercase mb-3 text-white">Quick Links</h6>
            <ul className="list-unstyled">
              {[
                { to: "/", label: "Home" },
                { to: "/about", label: "About" },
                { to: "/dashboard", label: "Dashboard" },
                { to: "/events", label: "Events" },
                { to: "/opportunities", label: "Opportunities" },
                { to: "/directory", label: "Directory" },
                { to: "/profile", label: "Profile" },
              ].map((item) => (
                <li className="mb-2" key={item.label}>
                  <Link
                    to={item.to}
                    className="text-white text-decoration-none"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>


          {/* Resources */}
          {/* <div className="col-lg-3 col-md-6">
            <h6 className="fw-bold text-uppercase mb-3 text-white">Resources</h6>
            <ul className="list-unstyled">
              {[
                { to: "/privacy", label: "Privacy Policy" },
                { to: "/terms", label: "Terms & Conditions" },
                { to: "/faq", label: "FAQs" },
                { to: "/support", label: "Support" },
              ].map((item) => (
                <li className="mb-2" key={item.label}>
                  <Link
                    to={item.to}
                    className="text-white text-decoration-none"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div> */}

        </div>

        <hr className="border-light my-4" />

        {/* Bottom Footer */}
        <div className="row pb-3">
          <div className="col-md-6 text-center text-md-start">
            <p className="mb-0 text-white">
              © {new Date().getFullYear()} Reconnectify. All rights reserved.
            </p>
          </div>
          <div className="col-md-6 text-center text-md-end">
            <p className="mb-0 text-white">
              Designed for Alumni Excellence
            </p>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
