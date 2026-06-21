import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { userAPI, connectionAPI, eventAPI, jobAPI, postAPI } from "../services/api";

const Profile = () => {
  const { user, updateProfile, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [userStats, setUserStats] = useState({
    connections: 0,
    events: 0,
    posts: 0,
    applications: 0
  });
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfileData();
      fetchUserStatistics();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (user) {
      setFormData(user);
    }
  }, [user]);

  const fetchProfileData = async () => {
    try {
      const response = await userAPI.getCurrentUser();
      setProfileData(response.data);
      setFormData(response.data);
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
  };

  const fetchUserStatistics = async () => {
    setStatsLoading(true);
    try {
      // Fetch all statistics in parallel
      const [connectionsRes, eventsRes, jobsRes, postsRes] = await Promise.all([
        connectionAPI.getConnections().catch(() => ({ data: [] })),
        eventAPI.getEvents({ attending: 'true' }).catch(() => ({ data: [] })),
        jobAPI.getMyApplications().catch(() => ({ data: [] })),
        postAPI.getFeed({ userId: user?.id }).catch(() => ({ data: [] }))
      ]);

      setUserStats({
        connections: connectionsRes.data?.length || 0,
        events: eventsRes.data?.length || 0,
        posts: postsRes.data?.length || 0,
        applications: jobsRes.data?.length || 0
      });
    } catch (err) {
      console.error("Error fetching statistics:", err);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      // Prepare data to send (remove undefined fields)
      const updateData = {};
      Object.keys(formData).forEach(key => {
        if (formData[key] !== undefined && formData[key] !== null) {
          updateData[key] = formData[key];
        }
      });

      await updateProfile(updateData);
      await fetchProfileData(); // Refresh profile data
      setMessage({ type: "success", text: "Profile updated successfully!" });
      setIsEditing(false);
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (err) {
      console.error("Update error:", err);
      setMessage({ 
        type: "danger", 
        text: err.response?.data?.message || "Error updating profile. Please try again." 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData(profileData || user);
    setIsEditing(false);
    setMessage({ type: "", text: "" });
    setProfileImage(null);
  };

  if (!isAuthenticated) {
    return (
      <div className="container mt-5">
        <div className="alert alert-warning">
          <i className="bi bi-exclamation-triangle me-2"></i>
          Please login to view your profile
        </div>
      </div>
    );
  }

  const getProfileCompleteness = () => {
    const fields = ['name', 'email', 'department', 'graduationYear', 'bio', 'phone'];
    if (profileData?.role === 'alumni') {
      fields.push('company', 'position');
    }
    const filledFields = fields.filter(field => 
      formData[field] && String(formData[field]).trim() !== ''
    );
    return Math.round((filledFields.length / fields.length) * 100);
  };

  const completeness = getProfileCompleteness();

  return (
    <div className="bg-light min-vh-100" style={{ marginTop: "70px", paddingBottom: "50px" }}>
      <div className="container py-5">
        <div className="row">
          <div className="col-lg-8 mx-auto">
            {/* Profile Header Card */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body text-center p-5" style={{ 
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" 
              }}>
                <div className="position-relative d-inline-block">
                  <div className="rounded-circle bg-white d-flex align-items-center justify-content-center mx-auto mb-3" 
                       style={{ width: "120px", height: "120px", fontSize: "48px" }}>
                    {profileImage ? (
                      <img src={profileImage} alt="Profile" className="rounded-circle" 
                           style={{ width: "120px", height: "120px", objectFit: "cover" }} />
                    ) : (
                      profileData?.role === 'alumni' ? '👨‍💼' : 
                      profileData?.role === 'admin' ? '👑' : '👨‍🎓'
                    )}
                  </div>
                  {isEditing && (
                    <label className="position-absolute bottom-0 end-0 btn btn-sm btn-light rounded-circle" 
                           style={{ width: "35px", height: "35px" }}>
                      <i className="bi bi-camera-fill"></i>
                      <input type="file" className="d-none" accept="image/*" onChange={handleImageChange} />
                    </label>
                  )}
                </div>
                <h2 className="text-white fw-bold mb-2">{profileData?.name || user?.name}</h2>
                <p className="text-white-50 mb-0">
                  <span className="badge bg-white text-primary me-2">
                    {profileData?.role?.toUpperCase() || user?.role?.toUpperCase()}
                  </span>
                  {profileData?.department || user?.department}
                </p>
                {profileData?.company && (
                  <p className="text-white-50 mb-0 mt-2">
                    <i className="bi bi-building me-1"></i>
                    {profileData.company} • {profileData.position}
                  </p>
                )}
              </div>
            </div>

            {/* Profile Completeness */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="mb-0">
                    <i className="bi bi-clipboard-check me-2"></i>
                    Profile Completeness
                  </h6>
                  <span className={`badge ${completeness === 100 ? 'bg-success' : 'bg-primary'}`}>
                    {completeness}%
                  </span>
                </div>
                <div className="progress" style={{ height: "10px" }}>
                  <div 
                    className={`progress-bar ${completeness === 100 ? 'bg-success' : 'bg-primary'}`}
                    style={{ width: `${completeness}%` }}
                    role="progressbar"
                  ></div>
                </div>
                {completeness < 100 && (
                  <small className="text-muted mt-2 d-block">
                    <i className="bi bi-info-circle me-1"></i>
                    Complete your profile to increase visibility and get better connection suggestions!
                  </small>
                )}
                {completeness === 100 && (
                  <small className="text-success mt-2 d-block">
                    <i className="bi bi-check-circle me-1"></i>
                    Your profile is complete! You're all set.
                  </small>
                )}
              </div>
            </div>

            {/* Main Profile Card */}
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="fw-bold mb-0">
                    <i className="bi bi-person-circle me-2"></i>
                    Profile Information
                  </h5>
                  {!isEditing && (
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => setIsEditing(true)}
                    >
                      <i className="bi bi-pencil me-1"></i> Edit Profile
                    </button>
                  )}
                </div>

                {message.text && (
                  <div className={`alert alert-${message.type} alert-dismissible fade show`} role="alert">
                    <i className={`bi bi-${message.type === 'success' ? 'check-circle' : 'exclamation-circle'} me-2`}></i>
                    {message.text}
                    <button type="button" className="btn-close" onClick={() => setMessage({ type: "", text: "" })}></button>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  {/* Basic Information */}
                  <div className="mb-4">
                    <h6 className="text-primary fw-semibold mb-3">
                      <i className="bi bi-info-circle me-2"></i>Basic Information
                    </h6>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Full Name</label>
                        <input
                          type="text"
                          className="form-control"
                          name="name"
                          value={formData.name || ""}
                          onChange={handleChange}
                          disabled={!isEditing}
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Email</label>
                        <input
                          type="email"
                          className="form-control bg-light"
                          name="email"
                          value={formData.email || ""}
                          disabled
                        />
                        <small className="text-muted">Email cannot be changed</small>
                      </div>
                    </div>
                  </div>

                  {/* Academic Information */}
                  <div className="mb-4">
                    <h6 className="text-primary fw-semibold mb-3">
                      <i className="bi bi-mortarboard me-2"></i>Academic Information
                    </h6>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Department</label>
                        <select
                          className="form-select"
                          name="department"
                          value={formData.department || ""}
                          onChange={handleChange}
                          disabled={!isEditing}
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
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Graduation Year</label>
                        <input
                          type="text"
                          className="form-control"
                          name="graduationYear"
                          value={formData.graduationYear || ""}
                          onChange={handleChange}
                          disabled={!isEditing}
                          placeholder="e.g., 2024"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Professional Information (Alumni Only) */}
                  {profileData?.role === "alumni" && (
                    <div className="mb-4">
                      <h6 className="text-primary fw-semibold mb-3">
                        <i className="bi bi-briefcase me-2"></i>Professional Information
                      </h6>
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="form-label fw-semibold">Company</label>
                          <input
                            type="text"
                            className="form-control"
                            name="company"
                            placeholder="e.g., Google, Microsoft"
                            value={formData.company || ""}
                            onChange={handleChange}
                            disabled={!isEditing}
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-semibold">Position</label>
                          <input
                            type="text"
                            className="form-control"
                            name="position"
                            placeholder="e.g., Senior Software Engineer"
                            value={formData.position || ""}
                            onChange={handleChange}
                            disabled={!isEditing}
                          />
                        </div>
                        <div className="col-12">
                          <label className="form-label fw-semibold">Industry</label>
                          <select
                            className="form-select"
                            name="industry"
                            value={formData.industry || ""}
                            onChange={handleChange}
                            disabled={!isEditing}
                          >
                            <option value="">Select Industry</option>
                            <option value="Technology">Technology</option>
                            <option value="Finance">Finance</option>
                            <option value="Healthcare">Healthcare</option>
                            <option value="Education">Education</option>
                            <option value="Manufacturing">Manufacturing</option>
                            <option value="Consulting">Consulting</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* About */}
                  <div className="mb-4">
                    <label className="form-label fw-semibold">
                      <i className="bi bi-card-text me-2"></i>Bio
                    </label>
                    <textarea
                      className="form-control"
                      name="bio"
                      rows="4"
                      value={formData.bio || ""}
                      onChange={handleChange}
                      placeholder="Tell us about yourself, your interests, and what you're looking for..."
                      disabled={!isEditing}
                      maxLength={500}
                    ></textarea>
                    <small className="text-muted">
                      {formData.bio?.length || 0}/500 characters
                    </small>
                  </div>

                  {/* Contact Information */}
                  <div className="mb-4">
                    <h6 className="text-primary fw-semibold mb-3">
                      <i className="bi bi-telephone me-2"></i>Contact Information
                    </h6>
                    <div className="row g-3">
                      <div className="col-md-12">
                        <label className="form-label fw-semibold">Phone Number</label>
                        <input
                          type="tel"
                          className="form-control"
                          name="phone"
                          placeholder="+1 (555) 123-4567"
                          value={formData.phone || ""}
                          onChange={handleChange}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Social Links */}
                  <div className="mb-4">
                    <h6 className="text-primary fw-semibold mb-3">
                      <i className="bi bi-share me-2"></i>Social Profiles
                    </h6>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">
                          <i className="bi bi-linkedin text-primary me-2"></i>LinkedIn
                        </label>
                        <input
                          type="url"
                          className="form-control"
                          name="linkedin"
                          placeholder="https://linkedin.com/in/yourprofile"
                          value={formData.linkedin || ""}
                          onChange={handleChange}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">
                          <i className="bi bi-github me-2"></i>GitHub
                        </label>
                        <input
                          type="url"
                          className="form-control"
                          name="github"
                          placeholder="https://github.com/yourusername"
                          value={formData.github || ""}
                          onChange={handleChange}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">
                          <i className="bi bi-twitter text-info me-2"></i>Twitter
                        </label>
                        <input
                          type="url"
                          className="form-control"
                          name="twitter"
                          placeholder="https://twitter.com/yourusername"
                          value={formData.twitter || ""}
                          onChange={handleChange}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">
                          <i className="bi bi-globe me-2"></i>Website
                        </label>
                        <input
                          type="url"
                          className="form-control"
                          name="website"
                          placeholder="https://yourwebsite.com"
                          value={formData.website || ""}
                          onChange={handleChange}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {isEditing && (
                    <div className="d-flex gap-2 justify-content-end pt-3 border-top">
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={handleCancel}
                        disabled={loading}
                      >
                        <i className="bi bi-x-lg me-1"></i> Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary px-4"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Saving...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-check-lg me-1"></i> Save Changes
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </form>
              </div>
            </div>

            {/* Statistics Card - DYNAMIC DATA */}
            <div className="card border-0 shadow-sm mt-4">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="fw-bold mb-0">
                    <i className="bi bi-graph-up me-2"></i>
                    Your Activity
                  </h6>
                  {statsLoading && (
                    <div className="spinner-border spinner-border-sm text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  )}
                </div>
                <div className="row text-center">
                  <div className="col-3">
                    <div className="p-3 bg-primary bg-opacity-10 rounded">
                      <h4 className="text-primary mb-1 fw-bold">
                        {statsLoading ? '-' : userStats.connections}
                      </h4>
                      <small className="text-muted d-block">Connections</small>
                      <a href="/directory" className="btn btn-sm btn-outline-primary mt-2 w-100">
                        <i className="bi bi-plus-circle me-1"></i>Add
                      </a>
                    </div>
                  </div>
                  <div className="col-3">
                    <div className="p-3 bg-success bg-opacity-10 rounded">
                      <h4 className="text-success mb-1 fw-bold">
                        {statsLoading ? '-' : userStats.events}
                      </h4>
                      <small className="text-muted d-block">Events</small>
                      <a href="/events" className="btn btn-sm btn-outline-success mt-2 w-100">
                        <i className="bi bi-calendar me-1"></i>View
                      </a>
                    </div>
                  </div>
                  <div className="col-3">
                    <div className="p-3 bg-info bg-opacity-10 rounded">
                      <h4 className="text-info mb-1 fw-bold">
                        {statsLoading ? '-' : userStats.posts}
                      </h4>
                      <small className="text-muted d-block">Posts</small>
                      <a href="/feed" className="btn btn-sm btn-outline-info mt-2 w-100">
                        <i className="bi bi-eye me-1"></i>See
                      </a>
                    </div>
                  </div>
                  <div className="col-3">
                    <div className="p-3 bg-warning bg-opacity-10 rounded">
                      <h4 className="text-warning mb-1 fw-bold">
                        {statsLoading ? '-' : userStats.applications}
                      </h4>
                      <small className="text-muted d-block">Applications</small>
                      <a href="/opportunities" className="btn btn-sm btn-outline-warning mt-2 w-100">
                        <i className="bi bi-briefcase me-1"></i>Jobs
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Information */}
            <div className="card border-0 shadow-sm mt-4">
              <div className="card-body">
                <h6 className="fw-bold mb-3">
                  <i className="bi bi-shield-check me-2"></i>
                  Account Information
                </h6>
                <div className="row">
                  <div className="col-md-6">
                    <p className="mb-2">
                      <strong>Member since:</strong>
                      <span className="ms-2 text-muted">
                        {profileData?.createdAt ? 
                          new Date(profileData.createdAt).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          }) : 
                          'N/A'
                        }
                      </span>
                    </p>
                  </div>
                  <div className="col-md-6">
                    <p className="mb-2">
                      <strong>Account Status:</strong>
                      <span className="ms-2">
                        <span className={`badge ${profileData?.isApproved ? 'bg-success' : 'bg-warning'}`}>
                          {profileData?.isApproved ? 'Active' : 'Pending Approval'}
                        </span>
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;