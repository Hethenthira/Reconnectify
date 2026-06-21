import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { eventAPI } from "../services/api";

const Events = () => {
  const { user, isAuthenticated } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filter, setFilter] = useState("all"); // all, upcoming, past, attending
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    capacity: "",
    category: "networking",
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (isAuthenticated) fetchEvents();
  }, [isAuthenticated]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await eventAPI.getEvents();
      setEvents(response.data);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = "Title is required";
    if (!formData.description.trim()) errors.description = "Description is required";
    if (!formData.date) errors.date = "Date is required";
    if (!formData.location.trim()) errors.location = "Location is required";
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      await eventAPI.createEvent(formData);
      alert("Event created successfully!");
      setFormData({ title: "", description: "", date: "", location: "", capacity: "", category: "networking" });
      setShowCreateForm(false);
      setFormErrors({});
      fetchEvents();
    } catch (err) {
      alert("Error creating event: " + (err.response?.data?.message || err.message));
    }
  };

  const handleAttendEvent = async (eventId) => {
    try {
      await eventAPI.attendEvent(eventId);
      alert("Successfully registered for event!");
      fetchEvents();
    } catch (err) {
      alert(err.response?.data?.message || "Error registering for event");
    }
  };

  const isEventPast = (date) => {
    return new Date(date) < new Date();
  };

  const isUserAttending = (event) => {
    return event.attendees?.some(attendee => attendee._id === user?.id || attendee === user?.id);
  };

  const filteredEvents = events.filter(event => {
    if (filter === "upcoming") return !isEventPast(event.date);
    if (filter === "past") return isEventPast(event.date);
    if (filter === "attending") return isUserAttending(event);
    return true;
  });

  const getCategoryIcon = (category) => {
    const icons = {
      networking: "🤝",
      workshop: "🛠️",
      seminar: "📚",
      social: "🎉",
      career: "💼",
      other: "📅"
    };
    return icons[category] || icons.other;
  };

  const getCategoryBadge = (category) => {
    const badges = {
      networking: "primary",
      workshop: "success",
      seminar: "info",
      social: "warning",
      career: "danger",
      other: "secondary"
    };
    return badges[category] || badges.other;
  };

  if (!isAuthenticated) {
    return (
      <div className="container mt-5">
        <div className="alert alert-warning">
          <i className="bi bi-exclamation-triangle me-2"></i>
          Please login to view events
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
              <i className="bi bi-calendar-event text-primary me-2"></i>
              Events
            </h1>
            <p className="text-muted lead mb-0">
              Network, learn, and grow together
            </p>
          </div>
          <div className="col-md-4 text-md-end">
            {["alumni", "admin"].includes(user?.role) && (
              <button
                className="btn btn-primary btn-lg"
                onClick={() => setShowCreateForm(!showCreateForm)}
              >
                <i className="bi bi-plus-circle me-2"></i>
                Create Event
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
                className={`btn ${filter === "all" ? "btn-primary" : "btn-outline-primary"}`}
                onClick={() => setFilter("all")}
              >
                <i className="bi bi-grid me-1"></i> All Events ({events.length})
              </button>
              <button
                type="button"
                className={`btn ${filter === "upcoming" ? "btn-primary" : "btn-outline-primary"}`}
                onClick={() => setFilter("upcoming")}
              >
                <i className="bi bi-calendar-check me-1"></i> Upcoming ({events.filter(e => !isEventPast(e.date)).length})
              </button>
              <button
                type="button"
                className={`btn ${filter === "past" ? "btn-primary" : "btn-outline-primary"}`}
                onClick={() => setFilter("past")}
              >
                <i className="bi bi-clock-history me-1"></i> Past ({events.filter(e => isEventPast(e.date)).length})
              </button>
              <button
                type="button"
                className={`btn ${filter === "attending" ? "btn-primary" : "btn-outline-primary"}`}
                onClick={() => setFilter("attending")}
              >
                <i className="bi bi-person-check me-1"></i> My Events ({events.filter(e => isUserAttending(e)).length})
              </button>
            </div>
          </div>
        </div>

        {/* Create Event Form */}
        {showCreateForm && (
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="fw-bold mb-0">
                  <i className="bi bi-plus-square me-2"></i>
                  Create New Event
                </h5>
                <button
                  className="btn-close"
                  onClick={() => {
                    setShowCreateForm(false);
                    setFormErrors({});
                  }}
                ></button>
              </div>
              
              <form onSubmit={handleCreateEvent}>
                <div className="row g-3">
                  <div className="col-md-8">
                    <label className="form-label fw-semibold">Event Title *</label>
                    <input
                      type="text"
                      className={`form-control ${formErrors.title ? 'is-invalid' : ''}`}
                      placeholder="e.g., Tech Career Fair 2024"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                    {formErrors.title && <div className="invalid-feedback">{formErrors.title}</div>}
                  </div>
                  
                  <div className="col-md-4">
                    <label className="form-label fw-semibold">Category</label>
                    <select
                      className="form-select"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      <option value="networking">🤝 Networking</option>
                      <option value="workshop">🛠️ Workshop</option>
                      <option value="seminar">📚 Seminar</option>
                      <option value="social">🎉 Social</option>
                      <option value="career">💼 Career</option>
                      <option value="other">📅 Other</option>
                    </select>
                  </div>
                  
                  <div className="col-12">
                    <label className="form-label fw-semibold">Description *</label>
                    <textarea
                      className={`form-control ${formErrors.description ? 'is-invalid' : ''}`}
                      placeholder="Describe your event, agenda, speakers, etc."
                      rows="4"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    ></textarea>
                    {formErrors.description && <div className="invalid-feedback">{formErrors.description}</div>}
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Date & Time *</label>
                    <input
                      type="datetime-local"
                      className={`form-control ${formErrors.date ? 'is-invalid' : ''}`}
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                    {formErrors.date && <div className="invalid-feedback">{formErrors.date}</div>}
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Location *</label>
                    <input
                      type="text"
                      className={`form-control ${formErrors.location ? 'is-invalid' : ''}`}
                      placeholder="e.g., Main Auditorium or Zoom Link"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                    {formErrors.location && <div className="invalid-feedback">{formErrors.location}</div>}
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Capacity (Optional)</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Maximum attendees"
                      value={formData.capacity}
                      onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    />
                  </div>
                </div>
                
                <div className="d-flex gap-2 mt-4">
                  <button type="submit" className="btn btn-primary">
                    <i className="bi bi-check-circle me-1"></i> Create Event
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => {
                      setShowCreateForm(false);
                      setFormData({ title: "", description: "", date: "", location: "", capacity: "", category: "networking" });
                      setFormErrors({});
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Events List */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-muted mt-3">Loading events...</p>
          </div>
        ) : filteredEvents.length > 0 ? (
          <div className="row g-4">
            {filteredEvents.map((event) => {
              const isPast = isEventPast(event.date);
              const isAttending = isUserAttending(event);
              const eventDate = new Date(event.date);
              const isFull = event.capacity && event.attendees?.length >= event.capacity;
              
              return (
                <div key={event._id} className="col-lg-6">
                  <div className={`card h-100 border-0 shadow-sm ${isPast ? 'bg-light' : ''}`}>
                    <div className="card-body p-4">
                      {/* Event Header */}
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div className="flex-grow-1">
                          <div className="d-flex align-items-center gap-2 mb-2">
                            <span style={{ fontSize: "24px" }}>
                              {getCategoryIcon(event.category)}
                            </span>
                            <h5 className="fw-bold mb-0">{event.title}</h5>
                          </div>
                          <span className={`badge bg-${getCategoryBadge(event.category)} me-2`}>
                            {event.category?.toUpperCase()}
                          </span>
                          {isPast && <span className="badge bg-secondary">PAST</span>}
                          {isAttending && !isPast && <span className="badge bg-success">ATTENDING</span>}
                          {isFull && !isPast && <span className="badge bg-danger">FULL</span>}
                        </div>
                      </div>

                      {/* Event Description */}
                      <p className="text-muted mb-3">{event.description}</p>

                      {/* Event Details */}
                      <div className="mb-3">
                        <div className="d-flex align-items-center mb-2">
                          <i className="bi bi-calendar-event text-primary me-2"></i>
                          <strong className="me-2">Date:</strong>
                          <span>{eventDate.toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}</span>
                        </div>
                        <div className="d-flex align-items-center mb-2">
                          <i className="bi bi-clock text-success me-2"></i>
                          <strong className="me-2">Time:</strong>
                          <span>{eventDate.toLocaleTimeString('en-US', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}</span>
                        </div>
                        <div className="d-flex align-items-center mb-2">
                          <i className="bi bi-geo-alt text-danger me-2"></i>
                          <strong className="me-2">Location:</strong>
                          <span>{event.location}</span>
                        </div>
                        <div className="d-flex align-items-center">
                          <i className="bi bi-people text-info me-2"></i>
                          <strong className="me-2">Attendees:</strong>
                          <span>
                            {event.attendees?.length || 0}
                            {event.capacity && ` / ${event.capacity}`}
                          </span>
                        </div>
                      </div>

                      {/* Organizer */}
                      {event.organizer && (
                        <div className="mb-3 p-2 bg-light rounded">
                          <small className="text-muted">
                            <i className="bi bi-person-badge me-1"></i>
                            Organized by <strong>{event.organizer.name || 'Admin'}</strong>
                          </small>
                        </div>
                      )}

                      {/* Action Button */}
                      <div className="d-grid">
                        {isPast ? (
                          <button className="btn btn-outline-secondary" disabled>
                            <i className="bi bi-clock-history me-1"></i> Event Ended
                          </button>
                        ) : isAttending ? (
                          <button className="btn btn-success" disabled>
                            <i className="bi bi-check-circle me-1"></i> You're Registered
                          </button>
                        ) : isFull ? (
                          <button className="btn btn-danger" disabled>
                            <i className="bi bi-x-circle me-1"></i> Event Full
                          </button>
                        ) : (
                          <button
                            className="btn btn-primary"
                            onClick={() => handleAttendEvent(event._id)}
                          >
                            <i className="bi bi-calendar-plus me-1"></i> Register for Event
                          </button>
                        )}
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
              <i className="bi bi-calendar-x display-1 text-muted mb-3 d-block"></i>
              <h5 className="fw-bold mb-2">No {filter !== 'all' ? filter : ''} events found</h5>
              <p className="text-muted mb-3">
                {filter === 'all' 
                  ? "No events have been created yet"
                  : `No ${filter} events available`}
              </p>
              {["alumni", "admin"].includes(user?.role) && filter === 'all' && (
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowCreateForm(true)}
                >
                  <i className="bi bi-plus-circle me-1"></i> Create First Event
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;