import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { jobAPI } from "../services/api";

const Opportunities = () => {
  const { user, isAuthenticated } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [typeFilter, setTypeFilter] = useState("all");
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    description: "",
    type: "job",
    location: "",
    requirements: "",
    salaryRange: "",
    applicationDeadline: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [selectedJob, setSelectedJob] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (isAuthenticated) fetchJobs();
  }, [isAuthenticated]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const response = await jobAPI.getJobs();
      setJobs(response.data);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = "Title is required";
    if (!formData.company.trim()) errors.company = "Company is required";
    if (!formData.description.trim()) errors.description = "Description is required";
    if (!formData.location.trim()) errors.location = "Location is required";
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      const submitData = {
        ...formData,
        requirements: formData.requirements.split(",").map((r) => r.trim()).filter(r => r),
      };
      await jobAPI.postJob(submitData);
      alert("Opportunity posted successfully!");
      setFormData({
        title: "",
        company: "",
        description: "",
        type: "job",
        location: "",
        requirements: "",
        salaryRange: "",
        applicationDeadline: "",
      });
      setShowCreateForm(false);
      setFormErrors({});
      fetchJobs();
    } catch (err) {
      alert("Error posting opportunity: " + (err.response?.data?.message || err.message));
    }
  };

  const handleApplyJob = async (jobId) => {
    try {
      await jobAPI.applyJob(jobId);
      alert("Application submitted successfully!");
      fetchJobs();
    } catch (err) {
      alert(err.response?.data?.message || "Error applying for position");
    }
  };

  const hasUserApplied = (job) => {
    return job.applicants?.some(applicant => applicant._id === user?.id || applicant === user?.id);
  };

  const filteredJobs = typeFilter === "all" 
    ? jobs 
    : jobs.filter(job => job.type === typeFilter);

  const getTypeIcon = (type) => {
    const icons = {
      job: "💼",
      internship: "🎓",
      freelance: "💻"
    };
    return icons[type] || icons.job;
  };

  const getTypeBadge = (type) => {
    const badges = {
      job: "success",
      internship: "info",
      freelance: "warning"
    };
    return badges[type] || badges.job;
  };

  if (!isAuthenticated) {
    return (
      <div className="container mt-5">
        <div className="alert alert-warning">
          <i className="bi bi-exclamation-triangle me-2"></i>
          Please login to view opportunities
        </div>
      </div>
    );
  }

  return (
    <div className="bg-light min-vh-100" style={{ marginTop: "70px", paddingBottom: "50px" }}>
      <div className="container py-5">
        {/* Header */}
        <div className="row align-items-center mb-4">
          <div className="col-md-8">
            <h1 className="fw-bold mb-2">
              <i className="bi bi-briefcase text-primary me-2"></i>
              Career Opportunities
            </h1>
            <p className="text-muted lead mb-0">
              Discover your next career move
            </p>
          </div>
          <div className="col-md-4 text-md-end">
            {["alumni", "admin"].includes(user?.role) && (
              <button
                className="btn btn-primary btn-lg"
                onClick={() => setShowCreateForm(!showCreateForm)}
              >
                <i className="bi bi-plus-circle me-2"></i>
                Post Opportunity
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <div className="btn-group w-100" role="group">
              <button
                type="button"
                className={`btn ${typeFilter === "all" ? "btn-primary" : "btn-outline-primary"}`}
                onClick={() => setTypeFilter("all")}
              >
                <i className="bi bi-grid me-1"></i> All ({jobs.length})
              </button>
              <button
                type="button"
                className={`btn ${typeFilter === "job" ? "btn-primary" : "btn-outline-primary"}`}
                onClick={() => setTypeFilter("job")}
              >
                💼 Full-time ({jobs.filter(j => j.type === "job").length})
              </button>
              <button
                type="button"
                className={`btn ${typeFilter === "internship" ? "btn-primary" : "btn-outline-primary"}`}
                onClick={() => setTypeFilter("internship")}
              >
                🎓 Internships ({jobs.filter(j => j.type === "internship").length})
              </button>
              <button
                type="button"
                className={`btn ${typeFilter === "freelance" ? "btn-primary" : "btn-outline-primary"}`}
                onClick={() => setTypeFilter("freelance")}
              >
                💻 Freelance ({jobs.filter(j => j.type === "freelance").length})
              </button>
            </div>
          </div>
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="fw-bold mb-0">
                  <i className="bi bi-plus-square me-2"></i>
                  Post New Opportunity
                </h5>
                <button className="btn-close" onClick={() => setShowCreateForm(false)}></button>
              </div>
              
              <form onSubmit={handleCreateJob}>
                <div className="row g-3">
                  <div className="col-md-8">
                    <label className="form-label fw-semibold">Job Title *</label>
                    <input
                      type="text"
                      className={`form-control ${formErrors.title ? 'is-invalid' : ''}`}
                      placeholder="e.g., Senior Software Engineer"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                    {formErrors.title && <div className="invalid-feedback">{formErrors.title}</div>}
                  </div>
                  
                  <div className="col-md-4">
                    <label className="form-label fw-semibold">Type</label>
                    <select
                      className="form-select"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    >
                      <option value="job">💼 Full-time</option>
                      <option value="internship">🎓 Internship</option>
                      <option value="freelance">💻 Freelance</option>
                    </select>
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Company *</label>
                    <input
                      type="text"
                      className={`form-control ${formErrors.company ? 'is-invalid' : ''}`}
                      placeholder="Company name"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    />
                    {formErrors.company && <div className="invalid-feedback">{formErrors.company}</div>}
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Location *</label>
                    <input
                      type="text"
                      className={`form-control ${formErrors.location ? 'is-invalid' : ''}`}
                      placeholder="e.g., New York, NY (Remote)"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                    {formErrors.location && <div className="invalid-feedback">{formErrors.location}</div>}
                  </div>
                  
                  <div className="col-12">
                    <label className="form-label fw-semibold">Description *</label>
                    <textarea
                      className={`form-control ${formErrors.description ? 'is-invalid' : ''}`}
                      placeholder="Job description, responsibilities, and requirements..."
                      rows="5"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    ></textarea>
                    {formErrors.description && <div className="invalid-feedback">{formErrors.description}</div>}
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Requirements (comma-separated)</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g., JavaScript, React, Node.js, 3+ years"
                      value={formData.requirements}
                      onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                    />
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Salary Range (optional)</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g., $80,000 - $120,000"
                      value={formData.salaryRange}
                      onChange={(e) => setFormData({ ...formData, salaryRange: e.target.value })}
                    />
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Application Deadline (optional)</label>
                    <input
                      type="date"
                      className="form-control"
                      value={formData.applicationDeadline}
                      onChange={(e) => setFormData({ ...formData, applicationDeadline: e.target.value })}
                    />
                  </div>
                </div>
                
                <div className="d-flex gap-2 mt-4">
                  <button type="submit" className="btn btn-primary">
                    <i className="bi bi-check-circle me-1"></i> Post Opportunity
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowCreateForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Jobs List */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="text-muted mt-3">Loading opportunities...</p>
          </div>
        ) : filteredJobs.length > 0 ? (
          <div className="row g-4">
            {filteredJobs.map((job) => {
              const hasApplied = hasUserApplied(job);
              const deadline = job.applicationDeadline ? new Date(job.applicationDeadline) : null;
              const isPastDeadline = deadline && deadline < new Date();
              
              return (
                <div key={job._id} className="col-lg-6">
                  <div className="card h-100 border-0 shadow-sm hover-lift">
                    <div className="card-body p-4">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div className="flex-grow-1">
                          <div className="d-flex align-items-center gap-2 mb-2">
                            <span style={{ fontSize: "24px" }}>{getTypeIcon(job.type)}</span>
                            <h5 className="fw-bold mb-0">{job.title}</h5>
                          </div>
                          <p className="text-primary fw-semibold mb-2">
                            <i className="bi bi-building me-1"></i>
                            {job.company}
                          </p>
                        </div>
                        <span className={`badge bg-${getTypeBadge(job.type)}`}>
                          {job.type?.toUpperCase()}
                        </span>
                      </div>

                      <p className="text-muted mb-3">{job.description}</p>

                      <div className="mb-3">
                        <div className="d-flex align-items-center mb-2">
                          <i className="bi bi-geo-alt text-danger me-2"></i>
                          <span>{job.location}</span>
                        </div>
                        
                        {job.salaryRange && (
                          <div className="d-flex align-items-center mb-2">
                            <i className="bi bi-currency-dollar text-success me-2"></i>
                            <span>{job.salaryRange}</span>
                          </div>
                        )}
                        
                        {deadline && (
                          <div className="d-flex align-items-center mb-2">
                            <i className="bi bi-calendar-x text-warning me-2"></i>
                            <span>Deadline: {deadline.toLocaleDateString()}</span>
                            {isPastDeadline && <span className="badge bg-danger ms-2">Closed</span>}
                          </div>
                        )}
                        
                        <div className="d-flex align-items-center">
                          <i className="bi bi-people text-info me-2"></i>
                          <span>{job.applicants?.length || 0} applicants</span>
                        </div>
                      </div>

                      {job.requirements && job.requirements.length > 0 && (
                        <div className="mb-3">
                          <strong className="small">Skills:</strong>
                          <div className="mt-2 col-md-5">
                            {job.requirements.slice(0, 5).map((req, idx) => (
                              <span key={idx} className="badge bg-light text-dark me-1 mb-1">
                                {req}
                              </span>
                            ))}
                            {job.requirements.length > 5 && (
                              <span className="badge bg-light text-dark">
                                +{job.requirements.length - 5} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {job.postedBy && (
                        <div className="mb-3 p-2 bg-light rounded">
                          <small className="text-muted">
                            <i className="bi bi-person-badge me-1"></i>
                            Posted by <strong>{job.postedBy.name || 'Alumni'}</strong>
                          </small>
                        </div>
                      )}

                      <div className="row g-2">
                        <div className="col-6">
                          <button
                            className="btn btn-outline-primary btn-sm w-100"
                            onClick={() => {
                              setSelectedJob(job);
                              setShowModal(true);
                            }}
                          >
                            <i className="bi bi-eye me-1"></i> View Details
                          </button>
                        </div>
                        <div className="col-6">
                          {hasApplied ? (
                            <button className="btn btn-success btn-sm w-100" disabled>
                              <i className="bi bi-check-circle me-1"></i> Applied
                            </button>
                          ) : isPastDeadline ? (
                            <button className="btn btn-secondary btn-sm w-100" disabled>
                              <i className="bi bi-x-circle me-1"></i> Closed
                            </button>
                          ) : (
                            <button
                              className="btn btn-primary btn-sm w-100"
                              onClick={() => handleApplyJob(job._id)}
                            >
                              <i className="bi bi-send me-1"></i> Apply Now
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center py-5">
              <i className="bi bi-briefcase-fill display-1 text-muted mb-3 d-block"></i>
              <h5 className="fw-bold mb-2">No opportunities found</h5>
              <p className="text-muted mb-3">
                {typeFilter === 'all' 
                  ? "No opportunities have been posted yet" 
                  : `No ${typeFilter} opportunities available`}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Job Details Modal */}
      {showModal && selectedJob && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <div>
                  <h5 className="modal-title fw-bold">{selectedJob.title}</h5>
                  <small className="text-muted">{selectedJob.company}</small>
                </div>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-4">
                  <h6 className="fw-bold">Job Description</h6>
                  <p className="text-muted">{selectedJob.description}</p>
                </div>
                
                {selectedJob.requirements && selectedJob.requirements.length > 0 && (
                  <div className="mb-4">
                    <h6 className="fw-bold">Required Skills</h6>
                    <div>
                      {selectedJob.requirements.map((req, idx) => (
                        <span key={idx} className="badge bg-primary me-2 mb-2">
                          {req}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="mb-4">
                  <h6 className="fw-bold">Details</h6>
                  <p className="mb-2"><i className="bi bi-geo-alt me-2"></i><strong>Location:</strong> {selectedJob.location}</p>
                  {selectedJob.salaryRange && (
                    <p className="mb-2"><i className="bi bi-currency-dollar me-2"></i><strong>Salary:</strong> {selectedJob.salaryRange}</p>
                  )}
                  <p className="mb-2"><i className="bi bi-tag me-2"></i><strong>Type:</strong> {selectedJob.type?.toUpperCase()}</p>
                  <p className="mb-2"><i className="bi bi-people me-2"></i><strong>Applicants:</strong> {selectedJob.applicants?.length || 0}</p>
                </div>
              </div>
              <div className="modal-footer">
                {!hasUserApplied(selectedJob) && (
                  <button 
                    className="btn btn-primary"
                    onClick={() => {
                      handleApplyJob(selectedJob._id);
                      setShowModal(false);
                    }}
                  >
                    <i className="bi bi-send me-1"></i> Apply Now
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .hover-lift {
          transition: transform 0.2s;
        }
        .hover-lift:hover {
          transform: translateY(-5px);
        }
      `}</style>
    </div>
  );
};

export default Opportunities;