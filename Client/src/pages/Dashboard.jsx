import { useAuth } from "../hooks/useAuth";
import { useEffect, useState } from "react";
import { adminAPI, userAPI, eventAPI, postAPI } from "../services/api";

const Dashboard = () => {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recentActivity, setRecentActivity] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);

  useEffect(() => {
    if (isAuthenticated) {
      if (isAdmin) {
        fetchAdminStats();
      } else {
        fetchUserStats();
      }
      fetchRecentActivity();
      fetchUpcomingEvents();
    }
  }, [isAuthenticated, isAdmin]);

  const fetchAdminStats = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getStats();
      setStats(response.data);
    } catch (err) {
      console.error("Error fetching admin stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    setLoading(true);
    try {
      const response = await userAPI.getUserStats();
      setUserStats(response.data);
    } catch (err) {
      console.error("Error fetching user stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const response = await postAPI.getFeed();
      const posts = response.data.slice(0, 5);
      
      const activities = posts.map(post => ({
        icon: post.type === 'opportunity' ? "bi-briefcase" : 
              post.type === 'event' ? "bi-calendar-check" : "bi-chat-dots",
        text: post.content.substring(0, 50) + (post.content.length > 50 ? '...' : ''),
        time: getTimeAgo(post.createdAt),
        color: post.type === 'opportunity' ? "info" : 
               post.type === 'event' ? "success" : "primary"
      }));
      
      setRecentActivity(activities);
    } catch (err) {
      console.error("Error fetching activity:", err);
    }
  };

  const fetchUpcomingEvents = async () => {
    try {
      const response = await eventAPI.getEvents();
      const upcoming = response.data
        .filter(event => new Date(event.date) > new Date())
        .slice(0, 2);
      setUpcomingEvents(upcoming);
    } catch (err) {
      console.error("Error fetching events:", err);
    }
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    
    return Math.floor(seconds) + " seconds ago";
  };

  if (!isAuthenticated) {
    return (
      <div className="container mt-5">
        <div className="alert alert-warning">
          <i className="bi bi-exclamation-triangle me-2"></i>
          Please login to view dashboard
        </div>
      </div>
    );
  }

  if (loading && !stats && !userStats) {
    return (
      <div className="container mt-5">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted mt-3">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-light min-vh-100" style={{ marginTop: "70px", paddingBottom: "50px" }}>
      <div className="container py-5">
        {/* Welcome Header */}
        <div className="card border-0 shadow-sm mb-4" style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        }}>
          <div className="card-body p-4 text-white">
            <div className="row align-items-center">
              <div className="col-md-8">
                <h2 className="fw-bold mb-2">
                  Welcome back, {user?.name}! 👋
                </h2>
                <p className="mb-0 opacity-75">
                  {isAdmin ? "Here's what's happening with your platform today" : 
                   user?.role === 'alumni' ? "Continue building your network and mentoring students" :
                   "Explore opportunities and connect with alumni"}
                </p>
              </div>
              <div className="col-md-4 text-md-end mt-3 mt-md-0">
                <div className="d-inline-block text-center">
                  <div className="bg-white bg-opacity-25 rounded-circle d-inline-flex align-items-center justify-content-center mb-2"
                       style={{ width: "80px", height: "80px", fontSize: "40px" }}>
                    {user?.role === 'admin' ? '👑' : user?.role === 'alumni' ? '👨‍💼' : '👨‍🎓'}
                  </div>
                  <div className="small">{user?.role?.toUpperCase()}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        {!isAdmin && userStats && (
          <div className="row g-4 mb-4">
            <div className="col-lg-3 col-md-6">
              <div className="card border-0 shadow-sm h-100 hover-card">
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className="bg-primary bg-opacity-10 rounded p-3">
                      <i className="bi bi-people-fill text-primary" style={{ fontSize: "24px" }}></i>
                    </div>
                    <span className="badge bg-success">Active</span>
                  </div>
                  <h3 className="fw-bold mb-1">{userStats.connections || 0}</h3>
                  <p className="text-muted mb-0 small">Connections</p>
                </div>
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <div className="card border-0 shadow-sm h-100 hover-card">
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className="bg-success bg-opacity-10 rounded p-3">
                      <i className="bi bi-calendar-check text-success" style={{ fontSize: "24px" }}></i>
                    </div>
                    <span className="badge bg-info">Upcoming</span>
                  </div>
                  <h3 className="fw-bold mb-1">{userStats.events || 0}</h3>
                  <p className="text-muted mb-0 small">Events Registered</p>
                </div>
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <div className="card border-0 shadow-sm h-100 hover-card">
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className="bg-info bg-opacity-10 rounded p-3">
                      <i className="bi bi-briefcase text-info" style={{ fontSize: "24px" }}></i>
                    </div>
                    <span className="badge bg-warning">Pending</span>
                  </div>
                  <h3 className="fw-bold mb-1">{userStats.applications || 0}</h3>
                  <p className="text-muted mb-0 small">Job Applications</p>
                </div>
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <div className="card border-0 shadow-sm h-100 hover-card">
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className="bg-warning bg-opacity-10 rounded p-3">
                      <i className="bi bi-chat-dots text-warning" style={{ fontSize: "24px" }}></i>
                    </div>
                    {userStats.unreadMessages > 0 && (
                      <span className="badge bg-danger">{userStats.unreadMessages} new</span>
                    )}
                  </div>
                  <h3 className="fw-bold mb-1">{userStats.unreadMessages || 0}</h3>
                  <p className="text-muted mb-0 small">Unread Messages</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Admin Stats */}
        {isAdmin && stats && (
          <div className="row g-4 mb-4">
            <div className="col-lg-3 col-md-6">
              <div className="card border-0 shadow-sm h-100 hover-card border-start border-primary border-4">
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <p className="text-muted mb-1 small">Total Users</p>
                      <h2 className="fw-bold mb-0">{stats.users || 0}</h2>
                    </div>
                    <div className="bg-primary bg-opacity-10 rounded p-3">
                      <i className="bi bi-people-fill text-primary" style={{ fontSize: "28px" }}></i>
                    </div>
                  </div>
                  <small className="text-success">
                    <i className="bi bi-arrow-up me-1"></i>{stats.newUsers || 0} new this month
                  </small>
                </div>
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <div className="card border-0 shadow-sm h-100 hover-card border-start border-success border-4">
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <p className="text-muted mb-1 small">Total Posts</p>
                      <h2 className="fw-bold mb-0">{stats.posts || 0}</h2>
                    </div>
                    <div className="bg-success bg-opacity-10 rounded p-3">
                      <i className="bi bi-file-text text-success" style={{ fontSize: "28px" }}></i>
                    </div>
                  </div>
                  <small className="text-info">
                    <i className="bi bi-graph-up me-1"></i>{stats.activeUsers || 0} active users
                  </small>
                </div>
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <div className="card border-0 shadow-sm h-100 hover-card border-start border-info border-4">
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <p className="text-muted mb-1 small">Job Postings</p>
                      <h2 className="fw-bold mb-0">{stats.jobs || 0}</h2>
                    </div>
                    <div className="bg-info bg-opacity-10 rounded p-3">
                      <i className="bi bi-briefcase text-info" style={{ fontSize: "28px" }}></i>
                    </div>
                  </div>
                  <small className="text-success">
                    <i className="bi bi-check-circle me-1"></i>Active opportunities
                  </small>
                </div>
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <div className="card border-0 shadow-sm h-100 hover-card border-start border-warning border-4">
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <p className="text-muted mb-1 small">Events</p>
                      <h2 className="fw-bold mb-0">{stats.events || 0}</h2>
                    </div>
                    <div className="bg-warning bg-opacity-10 rounded p-3">
                      <i className="bi bi-calendar-event text-warning" style={{ fontSize: "28px" }}></i>
                    </div>
                  </div>
                  <small className="text-warning">
                    <i className="bi bi-calendar-check me-1"></i>{stats.upcomingEvents || 0} upcoming
                  </small>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="row g-4">
          {/* Quick Actions */}
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4">
                <h5 className="fw-bold mb-4">
                  <i className="bi bi-lightning-charge text-warning me-2"></i>
                  Quick Actions
                </h5>
                <div className="row g-3">
                  <div className="col-md-6">
                    <a href="/profile" className="btn btn-outline-primary w-100 p-3 text-start">
                      <i className="bi bi-person-circle me-2"></i>
                      <strong>Edit Profile</strong>
                      <br />
                      <small className="text-muted">Update your information</small>
                    </a>
                  </div>
                  <div className="col-md-6">
                    <a href="/directory" className="btn btn-outline-success w-100 p-3 text-start">
                      <i className="bi bi-people me-2"></i>
                      <strong>Find Connections</strong>
                      <br />
                      <small className="text-muted">Expand your network</small>
                    </a>
                  </div>
                  <div className="col-md-6">
                    <a href="/events" className="btn btn-outline-info w-100 p-3 text-start">
                      <i className="bi bi-calendar-event me-2"></i>
                      <strong>Browse Events</strong>
                      <br />
                      <small className="text-muted">Attend networking events</small>
                    </a>
                  </div>
                  <div className="col-md-6">
                    <a href="/opportunities" className="btn btn-outline-warning w-100 p-3 text-start">
                      <i className="bi bi-briefcase me-2"></i>
                      <strong>Job Opportunities</strong>
                      <br />
                      <small className="text-muted">Explore career options</small>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Stats for Admin */}
            {isAdmin && stats && (
              <div className="card border-0 shadow-sm mt-4">
                <div className="card-body p-4">
                  <h5 className="fw-bold mb-4">
                    <i className="bi bi-bar-chart text-primary me-2"></i>
                    Platform Metrics
                  </h5>
                  <div className="row text-center">
                    <div className="col-md-4 mb-3">
                      <div className="p-3 bg-light rounded">
                        <h4 className="text-success mb-1">{stats.students || 0}</h4>
                        <small className="text-muted">Students</small>
                      </div>
                    </div>
                    <div className="col-md-4 mb-3">
                      <div className="p-3 bg-light rounded">
                        <h4 className="text-primary mb-1">{stats.alumni || 0}</h4>
                        <small className="text-muted">Alumni</small>
                      </div>
                    </div>
                    <div className="col-md-4 mb-3">
                      <div className="p-3 bg-light rounded">
                        <h4 className="text-info mb-1">{stats.connections || 0}</h4>
                        <small className="text-muted">Total Connections</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="col-lg-4">
            {/* Recent Activity */}
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4">
                <h5 className="fw-bold mb-4">
                  <i className="bi bi-clock-history text-info me-2"></i>
                  Recent Activity
                </h5>
                <div className="activity-list">
                  {recentActivity.length > 0 ? (
                    recentActivity.map((activity, idx) => (
                      <div key={idx} className="d-flex mb-3 pb-3 border-bottom">
                        <div className={`bg-${activity.color} bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3`}
                             style={{ width: "40px", height: "40px", flexShrink: 0 }}>
                          <i className={`${activity.icon} text-${activity.color}`}></i>
                        </div>
                        <div className="flex-grow-1">
                          <p className="mb-1 small">{activity.text}</p>
                          <small className="text-muted">{activity.time}</small>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted small">No recent activity</p>
                  )}
                </div>
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="card border-0 shadow-sm mt-4">
              <div className="card-body p-4">
                <h5 className="fw-bold mb-4">
                  <i className="bi bi-calendar3 text-success me-2"></i>
                  Upcoming Events
                </h5>
                {upcomingEvents.length > 0 ? (
                  upcomingEvents.map((event, idx) => (
                    <div key={event._id} className="mb-3">
                      <div className="d-flex">
                        <div className="bg-primary text-white rounded p-2 text-center me-3" style={{ width: "60px" }}>
                          <div className="fw-bold">{new Date(event.date).getDate()}</div>
                          <small>{new Date(event.date).toLocaleString('default', { month: 'short' }).toUpperCase()}</small>
                        </div>
                        <div>
                          <h6 className="mb-1 fw-semibold">{event.title}</h6>
                          <small className="text-muted">
                            <i className="bi bi-clock me-1"></i>
                            {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            <br />
                            <i className="bi bi-geo-alt me-1"></i>{event.location}
                          </small>
                        </div>
                      </div>
                      {idx < upcomingEvents.length - 1 && <hr />}
                    </div>
                  ))
                ) : (
                  <p className="text-muted small">No upcoming events</p>
                )}
                <a href="/events" className="btn btn-sm btn-outline-success w-100 mt-3">
                  View All Events
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .hover-card {
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .hover-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;