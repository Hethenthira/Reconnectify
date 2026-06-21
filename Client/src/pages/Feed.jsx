import { useState, useEffect, useRef } from "react";
import { useAuth } from "../hooks/useAuth";
import { postAPI } from "../services/api";

/* ─── Role helpers ──────────────────────────────────────────────── */
const canPost  = (role) => ["alumni", "admin"].includes(role);
const canLike  = (role) => role === "student";
const canComment = (role) => true; // students + alumni can comment; admin implicit

/* ─── Avatar ────────────────────────────────────────────────────── */
const Avatar = ({ user, size = 44 }) => {
  const emoji = user?.role === "alumni" ? "👨‍💼" : user?.role === "admin" ? "👑" : "👨‍🎓";
  const bg    = user?.role === "alumni" ? "#dbeafe" : user?.role === "admin" ? "#fef9c3" : "#dcfce7";
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: bg, display: "flex", alignItems: "center",
      justifyContent: "center", fontSize: size * 0.48, flexShrink: 0,
      border: "2px solid #fff", boxShadow: "0 1px 4px rgba(0,0,0,.12)"
    }}>{emoji}</div>
  );
};

/* ─── Category config ───────────────────────────────────────────── */
const TYPES = {
  update:      { label: "Update",      icon: "bi-megaphone",      color: "#6366f1", bg: "#eef2ff" },
  opportunity: { label: "Opportunity", icon: "bi-briefcase",      color: "#059669", bg: "#ecfdf5" },
  event:       { label: "Event",       icon: "bi-calendar-event", color: "#d97706", bg: "#fffbeb" },
};

/* ─── Relative time ─────────────────────────────────────────────── */
const relTime = (date) => {
  const diff = (Date.now() - new Date(date)) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

/* ══════════════════════════════════════════════════════════════════ */
const Feed = () => {
  const { user, isAuthenticated } = useAuth();
  const [posts,      setPosts]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [filter,     setFilter]     = useState("all");
  const [showCreate, setShowCreate] = useState(false);
  const [draft,      setDraft]      = useState({ content: "", type: "update" });
  const [submitting, setSubmitting] = useState(false);
  const [expanded,   setExpanded]   = useState({});   // postId → bool (comments open)
  const [commentVal, setCommentVal] = useState({});   // postId → string
  const [postingComment, setPostingComment] = useState({}); // postId → bool
  const textRef = useRef(null);

  useEffect(() => { if (isAuthenticated) loadFeed(); }, [isAuthenticated]);
  useEffect(() => { if (showCreate && textRef.current) textRef.current.focus(); }, [showCreate]);

  const loadFeed = async () => {
    setLoading(true);
    try {
      const res = await postAPI.getFeed();
      setPosts(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  /* ── Create post ── */
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!draft.content.trim()) return;
    setSubmitting(true);
    try {
      await postAPI.createPost(draft);
      setDraft({ content: "", type: "update" });
      setShowCreate(false);
      await loadFeed();
    } catch (err) {
      alert(err.response?.data?.message || "Error creating post");
    } finally { setSubmitting(false); }
  };

  /* ── Like / unlike ── */
  const handleLike = async (postId) => {
    // Optimistic update
    setPosts(prev => prev.map(p => {
      if (p._id !== postId) return p;
      const liked = p.likes.includes(user.id);
      return {
        ...p,
        likes: liked
          ? p.likes.filter(id => id !== user.id)
          : [...p.likes, user.id],
      };
    }));
    try { await postAPI.likePost(postId); }
    catch { await loadFeed(); } // revert on error
  };

  /* ── Comment ── */
  const handleComment = async (postId) => {
    const text = commentVal[postId]?.trim();
    if (!text) return;
    setPostingComment(p => ({ ...p, [postId]: true }));
    try {
      await postAPI.commentPost(postId, text);
      setCommentVal(v => ({ ...v, [postId]: "" }));
      await loadFeed();
    } catch (err) {
      alert(err.response?.data?.message || "Error posting comment");
    } finally {
      setPostingComment(p => ({ ...p, [postId]: false }));
    }
  };

  /* ── Delete post ── */
  const handleDelete = async (postId) => {
    if (!window.confirm("Delete this post?")) return;
    try {
      await postAPI.deletePost(postId);
      setPosts(prev => prev.filter(p => p._id !== postId));
    } catch (err) {
      alert(err.response?.data?.message || "Error deleting post");
    }
  };

  /* ── Filtered posts ── */
  const visible = filter === "all" ? posts : posts.filter(p => p.type === filter);

  if (!isAuthenticated) return (
    <div className="container mt-5">
      <div className="alert alert-warning">
        <i className="bi bi-lock me-2"></i>Please login to view the feed
      </div>
    </div>
  );

  return (
    <div style={{ marginTop: 70, minHeight: "100vh", background: "#f1f5f9", paddingBottom: 60 }}>
      {/* ── Page Hero ── */}
      <div style={{
        background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 60%, #0ea5e9 100%)",
        padding: "40px 0 60px", position: "relative", overflow: "hidden"
      }}>
        <div style={{
          position: "absolute", inset: 0, opacity: .08,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fff' fill-opacity='1' fill-rule='evenodd'%3E%3Ccircle cx='10' cy='10' r='2'/%3E%3Ccircle cx='40' cy='40' r='2'/%3E%3Ccircle cx='10' cy='40' r='2'/%3E%3Ccircle cx='40' cy='10' r='2'/%3E%3C/g%3E%3C/svg%3E")`
        }} />
        <div className="container position-relative">
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
            <div>
              <h1 style={{ color: "#fff", fontWeight: 800, fontSize: "clamp(1.6rem, 3vw, 2.4rem)", marginBottom: 6, letterSpacing: "-0.5px" }}>
                Alumni Feed
              </h1>
              <p style={{ color: "rgba(255,255,255,.75)", marginBottom: 0, fontSize: "1.05rem" }}>
                Stay connected · Share stories · Inspire students
              </p>
            </div>
            {canPost(user?.role) && (
              <button onClick={() => setShowCreate(v => !v)} style={{
                background: "#fff", color: "#1e40af", border: "none",
                borderRadius: 12, padding: "10px 22px", fontWeight: 700,
                fontSize: ".95rem", display: "flex", alignItems: "center", gap: 8,
                boxShadow: "0 4px 14px rgba(0,0,0,.18)", cursor: "pointer",
                transition: "transform .15s, box-shadow .15s"
              }}
                onMouseEnter={e => e.currentTarget.style.transform = "translateY(-1px)"}
                onMouseLeave={e => e.currentTarget.style.transform = ""}
              >
                <i className={`bi ${showCreate ? "bi-x-lg" : "bi-pencil-square"}`}></i>
                {showCreate ? "Cancel" : "New Post"}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="container mt-4">
        <div className="row g-4">

          {/* ── Main column ── */}
          <div className="col-lg-8">

            {/* Create Post Card */}
            {showCreate && canPost(user?.role) && (
              <div className="card border-0 mb-4" style={{
                borderRadius: 20, boxShadow: "0 8px 32px rgba(30,64,175,.13)",
                animation: "slideDown .25s ease"
              }}>
                <div className="card-body p-4">
                  <div className="d-flex gap-3 mb-3">
                    <Avatar user={user} />
                    <div>
                      <div style={{ fontWeight: 700, color: "#1e293b" }}>{user?.name}</div>
                      <div style={{ fontSize: ".8rem", color: "#64748b" }}>
                        {user?.role?.toUpperCase()} · Sharing with everyone
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleCreate}>
                    {/* Type selector */}
                    <div className="d-flex gap-2 mb-3">
                      {Object.entries(TYPES).map(([key, t]) => (
                        <button key={key} type="button"
                          onClick={() => setDraft(d => ({ ...d, type: key }))}
                          style={{
                            padding: "6px 14px", borderRadius: 20, border: "1.5px solid",
                            borderColor: draft.type === key ? t.color : "#e2e8f0",
                            background: draft.type === key ? t.bg : "#fff",
                            color: draft.type === key ? t.color : "#64748b",
                            fontWeight: 600, fontSize: ".82rem", cursor: "pointer",
                            transition: "all .15s"
                          }}
                        >
                          <i className={`bi ${t.icon} me-1`}></i>{t.label}
                        </button>
                      ))}
                    </div>

                    <textarea ref={textRef}
                      value={draft.content}
                      onChange={e => setDraft(d => ({ ...d, content: e.target.value }))}
                      placeholder="Share an update, opportunity, or insight with students..."
                      rows={4}
                      style={{
                        width: "100%", border: "1.5px solid #e2e8f0", borderRadius: 12,
                        padding: "12px 16px", fontSize: ".95rem", resize: "vertical",
                        outline: "none", color: "#1e293b", background: "#f8fafc",
                        transition: "border-color .15s", fontFamily: "inherit"
                      }}
                      onFocus={e => e.target.style.borderColor = "#3b82f6"}
                      onBlur={e => e.target.style.borderColor = "#e2e8f0"}
                    />

                    <div className="d-flex justify-content-between align-items-center mt-3">
                      <span style={{ fontSize: ".82rem", color: "#94a3b8" }}>
                        <i className="bi bi-globe2 me-1"></i>Visible to all members
                      </span>
                      <button type="submit" disabled={submitting || !draft.content.trim()} style={{
                        background: "linear-gradient(135deg, #1e40af, #3b82f6)",
                        color: "#fff", border: "none", borderRadius: 10,
                        padding: "9px 24px", fontWeight: 700, cursor: "pointer",
                        opacity: (!draft.content.trim() || submitting) ? .5 : 1,
                        transition: "opacity .15s"
                      }}>
                        {submitting
                          ? <><span className="spinner-border spinner-border-sm me-2" />Posting...</>
                          : <><i className="bi bi-send-fill me-2"></i>Post</>}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Filter Tabs */}
            <div style={{
              display: "flex", gap: 8, marginBottom: 20,
              background: "#fff", borderRadius: 14, padding: 6,
              boxShadow: "0 2px 8px rgba(0,0,0,.06)"
            }}>
              {[["all", "bi-grid-3x3-gap", "All"], ...Object.entries(TYPES).map(([k, v]) => [k, v.icon, v.label])].map(([key, icon, label]) => (
                <button key={key} onClick={() => setFilter(key)} style={{
                  flex: 1, padding: "8px 4px", borderRadius: 10, border: "none",
                  background: filter === key ? "#1e40af" : "transparent",
                  color: filter === key ? "#fff" : "#64748b",
                  fontWeight: 600, fontSize: ".82rem", cursor: "pointer",
                  transition: "all .15s"
                }}>
                  <i className={`bi ${icon} me-1`}></i>
                  <span className="d-none d-sm-inline">{label}</span>
                </button>
              ))}
            </div>

            {/* Posts */}
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status" />
                <p className="text-muted mt-3">Loading feed...</p>
              </div>
            ) : visible.length === 0 ? (
              <div style={{
                background: "#fff", borderRadius: 20, padding: "60px 30px",
                textAlign: "center", boxShadow: "0 2px 12px rgba(0,0,0,.06)"
              }}>
                <div style={{ fontSize: 56, marginBottom: 12 }}>📭</div>
                <h5 style={{ fontWeight: 700, color: "#1e293b" }}>No posts yet</h5>
                <p style={{ color: "#64748b" }}>
                  {canPost(user?.role)
                    ? "Be the first to share something with the community!"
                    : "Alumni haven't posted anything yet. Check back soon."}
                </p>
                {canPost(user?.role) && (
                  <button onClick={() => setShowCreate(true)} style={{
                    background: "#1e40af", color: "#fff", border: "none",
                    borderRadius: 10, padding: "10px 24px", fontWeight: 700, cursor: "pointer"
                  }}>
                    <i className="bi bi-pencil-square me-2"></i>Create First Post
                  </button>
                )}
              </div>
            ) : (
              visible.map((post, idx) => {
                const typeInfo = TYPES[post.type] || TYPES.update;
                const authorId = post.userId?._id || post.userId;
                const isOwner  = authorId === user?.id;
                const isAdmin  = user?.role === "admin";
                const hasLiked = post.likes?.includes(user?.id);
                const commOpen = expanded[post._id];
                const commentCount = post.comments?.length || 0;

                return (
                  <div key={post._id} className="post-card" style={{
                    background: "#fff", borderRadius: 20, marginBottom: 20,
                    boxShadow: "0 2px 12px rgba(0,0,0,.06)",
                    border: "1px solid #f1f5f9",
                    animation: `fadeUp .35s ease ${idx * 0.05}s both`
                  }}>
                    {/* Post header */}
                    <div style={{ padding: "20px 24px 0" }}>
                      <div className="d-flex align-items-start justify-content-between">
                        <div className="d-flex gap-3 align-items-center">
                          <Avatar user={post.userId} size={46} />
                          <div>
                            <div style={{ fontWeight: 700, color: "#0f172a", fontSize: ".97rem" }}>
                              {post.userId?.name || "Alumni"}
                            </div>
                            <div className="d-flex align-items-center gap-2 flex-wrap">
                              <span style={{
                                fontSize: ".73rem", fontWeight: 700, letterSpacing: ".04em",
                                color: post.userId?.role === "alumni" ? "#1e40af" : "#059669",
                                background: post.userId?.role === "alumni" ? "#dbeafe" : "#dcfce7",
                                padding: "2px 8px", borderRadius: 20
                              }}>
                                {post.userId?.role?.toUpperCase()}
                              </span>
                              <span style={{ fontSize: ".78rem", color: "#94a3b8" }}>
                                <i className="bi bi-clock me-1"></i>{relTime(post.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          {/* Type badge */}
                          <span style={{
                            background: typeInfo.bg, color: typeInfo.color,
                            padding: "4px 12px", borderRadius: 20,
                            fontSize: ".75rem", fontWeight: 700
                          }}>
                            <i className={`bi ${typeInfo.icon} me-1`}></i>
                            {typeInfo.label}
                          </span>
                          {/* Delete (owner or admin) */}
                          {(isOwner || isAdmin) && (
                            <button onClick={() => handleDelete(post._id)} style={{
                              background: "none", border: "none", color: "#cbd5e1",
                              cursor: "pointer", padding: "4px 6px", borderRadius: 8,
                              fontSize: ".9rem", transition: "color .15s"
                            }}
                              onMouseEnter={e => e.currentTarget.style.color = "#ef4444"}
                              onMouseLeave={e => e.currentTarget.style.color = "#cbd5e1"}
                              title="Delete post"
                            >
                              <i className="bi bi-trash3"></i>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Post content */}
                    <div style={{ padding: "16px 24px" }}>
                      <p style={{
                        color: "#1e293b", lineHeight: 1.7, margin: 0,
                        fontSize: ".97rem", whiteSpace: "pre-wrap"
                      }}>{post.content}</p>
                    </div>

                    {/* Divider */}
                    <div style={{ borderTop: "1px solid #f1f5f9", margin: "0 24px" }} />

                    {/* Stats row */}
                    <div style={{ padding: "10px 24px", display: "flex", gap: 16, alignItems: "center" }}>
                      <span style={{ fontSize: ".82rem", color: "#94a3b8" }}>
                        {post.likes?.length || 0} {post.likes?.length === 1 ? "like" : "likes"}
                      </span>
                      <span style={{ fontSize: ".82rem", color: "#94a3b8" }}>
                        {commentCount} {commentCount === 1 ? "comment" : "comments"}
                      </span>
                    </div>

                    {/* Action bar */}
                    <div style={{ borderTop: "1px solid #f1f5f9", padding: "4px 16px", display: "flex" }}>
                      {/* Like button — students only (alumni see count but no interactive like) */}
                      {user?.role === "student" ? (
                        <button onClick={() => handleLike(post._id)} style={{
                          flex: 1, background: "none", border: "none",
                          padding: "10px 8px", borderRadius: 10, cursor: "pointer",
                          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                          color: hasLiked ? "#ef4444" : "#64748b",
                          fontWeight: 600, fontSize: ".88rem",
                          transition: "background .15s, color .15s"
                        }}
                          onMouseEnter={e => e.currentTarget.style.background = "#fef2f2"}
                          onMouseLeave={e => e.currentTarget.style.background = "none"}
                        >
                          <i className={`bi ${hasLiked ? "bi-heart-fill" : "bi-heart"}`}
                            style={{ fontSize: "1.05rem" }}></i>
                          {hasLiked ? "Liked" : "Like"}
                        </button>
                      ) : (
                        /* Alumni/admin: show like count, no interactive button */
                        <div style={{
                          flex: 1, display: "flex", alignItems: "center",
                          justifyContent: "center", gap: 6, color: "#cbd5e1",
                          fontSize: ".88rem", padding: "10px 8px"
                        }}>
                          <i className="bi bi-heart" style={{ fontSize: "1.05rem" }}></i>
                          {post.likes?.length || 0} Likes
                        </div>
                      )}

                      {/* Comment toggle (everyone) */}
                      <button onClick={() => setExpanded(e => ({ ...e, [post._id]: !commOpen }))} style={{
                        flex: 1, background: "none", border: "none",
                        padding: "10px 8px", borderRadius: 10, cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                        color: commOpen ? "#1e40af" : "#64748b",
                        fontWeight: 600, fontSize: ".88rem", transition: "background .15s"
                      }}
                        onMouseEnter={e => e.currentTarget.style.background = "#eff6ff"}
                        onMouseLeave={e => e.currentTarget.style.background = "none"}
                      >
                        <i className={`bi ${commOpen ? "bi-chat-dots-fill" : "bi-chat-dots"}`}
                          style={{ fontSize: "1.05rem" }}></i>
                        Comment
                      </button>

                      {/* Share (cosmetic) */}
                      <button style={{
                        flex: 1, background: "none", border: "none",
                        padding: "10px 8px", borderRadius: 10, cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                        color: "#64748b", fontWeight: 600, fontSize: ".88rem",
                        transition: "background .15s"
                      }}
                        onMouseEnter={e => e.currentTarget.style.background = "#f0fdf4"}
                        onMouseLeave={e => e.currentTarget.style.background = "none"}
                        onClick={() => {
                          navigator.clipboard?.writeText(window.location.href);
                          alert("Link copied!");
                        }}
                      >
                        <i className="bi bi-share" style={{ fontSize: "1.05rem" }}></i>
                        Share
                      </button>
                    </div>

                    {/* Comments section */}
                    {commOpen && (
                      <div style={{
                        borderTop: "1px solid #f1f5f9",
                        background: "#f8fafc",
                        borderRadius: "0 0 20px 20px",
                        padding: "16px 24px"
                      }}>
                        {/* Existing comments */}
                        {post.comments?.length > 0 ? (
                          <div style={{ marginBottom: 14 }}>
                            {post.comments.map((c, ci) => (
                              <div key={ci} style={{
                                display: "flex", gap: 10, marginBottom: 12
                              }}>
                                <Avatar user={c.userId} size={32} />
                                <div style={{
                                  background: "#fff", borderRadius: "4px 14px 14px 14px",
                                  padding: "8px 14px", flex: 1,
                                  boxShadow: "0 1px 4px rgba(0,0,0,.06)"
                                }}>
                                  <div style={{
                                    fontWeight: 700, fontSize: ".8rem",
                                    color: "#0f172a", marginBottom: 2
                                  }}>
                                    {c.userId?.name || "Member"}
                                  </div>
                                  <div style={{ fontSize: ".88rem", color: "#334155", lineHeight: 1.5 }}>
                                    {c.text}
                                  </div>
                                  <div style={{ fontSize: ".72rem", color: "#94a3b8", marginTop: 3 }}>
                                    {relTime(c.createdAt)}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p style={{ color: "#94a3b8", fontSize: ".85rem", marginBottom: 14, textAlign: "center" }}>
                            No comments yet — be the first!
                          </p>
                        )}

                        {/* Comment input */}
                        <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
                          <Avatar user={user} size={34} />
                          <div style={{ flex: 1, position: "relative" }}>
                            <textarea
                              rows={1}
                              placeholder="Write a comment..."
                              value={commentVal[post._id] || ""}
                              onChange={e => setCommentVal(v => ({ ...v, [post._id]: e.target.value }))}
                              onKeyDown={e => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                  e.preventDefault();
                                  handleComment(post._id);
                                }
                              }}
                              style={{
                                width: "100%", border: "1.5px solid #e2e8f0",
                                borderRadius: 12, padding: "9px 50px 9px 14px",
                                fontSize: ".88rem", resize: "none", outline: "none",
                                background: "#fff", fontFamily: "inherit", color: "#1e293b",
                                transition: "border-color .15s"
                              }}
                              onFocus={e => e.target.style.borderColor = "#3b82f6"}
                              onBlur={e => e.target.style.borderColor = "#e2e8f0"}
                            />
                            <button
                              onClick={() => handleComment(post._id)}
                              disabled={!commentVal[post._id]?.trim() || postingComment[post._id]}
                              style={{
                                position: "absolute", right: 8, top: "50%",
                                transform: "translateY(-50%)",
                                background: "linear-gradient(135deg,#1e40af,#3b82f6)",
                                color: "#fff", border: "none", borderRadius: 8,
                                width: 32, height: 32, cursor: "pointer",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                opacity: (!commentVal[post._id]?.trim()) ? .4 : 1,
                                transition: "opacity .15s"
                              }}
                            >
                              {postingComment[post._id]
                                ? <span className="spinner-border spinner-border-sm" style={{ width: 12, height: 12 }} />
                                : <i className="bi bi-send-fill" style={{ fontSize: ".75rem" }}></i>}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* ── Sidebar ── */}
          <div className="col-lg-4 d-none d-lg-block">

            {/* Role info card */}
            <div style={{
              background: "linear-gradient(135deg,#1e40af,#3b82f6)",
              borderRadius: 20, padding: 24, marginBottom: 20, color: "#fff"
            }}>
              <div style={{ fontWeight: 800, fontSize: "1.05rem", marginBottom: 6 }}>
                {user?.role === "student"
                  ? "👨‍🎓 Student View"
                  : user?.role === "alumni"
                  ? "👨‍💼 Alumni View"
                  : "👑 Admin View"}
              </div>
              <p style={{ fontSize: ".85rem", opacity: .85, marginBottom: 14 }}>
                {user?.role === "student"
                  ? "You can like and comment on posts. Alumni posts will appear here."
                  : user?.role === "alumni"
                  ? "Share updates, job opportunities, and events with the community."
                  : "Full access: post, comment, and moderate all content."}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {[
                  { label: "View posts",    ok: true },
                  { label: "Like posts",    ok: user?.role === "student" || user?.role === "admin" },
                  { label: "Comment",       ok: true },
                  { label: "Create posts",  ok: canPost(user?.role) },
                  { label: "Delete posts",  ok: user?.role === "admin" },
                ].map(({ label, ok }) => (
                  <div key={label} style={{
                    display: "flex", alignItems: "center", gap: 8,
                    fontSize: ".82rem", opacity: .9
                  }}>
                    <span style={{
                      width: 18, height: 18, borderRadius: "50%",
                      background: ok ? "#22c55e" : "rgba(255,255,255,.2)",
                      display: "inline-flex", alignItems: "center", justifyContent: "center",
                      fontSize: ".65rem", flexShrink: 0
                    }}>
                      <i className={`bi bi-${ok ? "check-lg" : "x-lg"}`}></i>
                    </span>
                    {label}
                  </div>
                ))}
              </div>
            </div>

            {/* Post type legend */}
            <div style={{
              background: "#fff", borderRadius: 20, padding: 24, marginBottom: 20,
              boxShadow: "0 2px 12px rgba(0,0,0,.06)"
            }}>
              <div style={{ fontWeight: 700, color: "#0f172a", marginBottom: 14, fontSize: ".95rem" }}>
                Post Types
              </div>
              {Object.entries(TYPES).map(([key, t]) => (
                <div key={key} style={{
                  display: "flex", alignItems: "center", gap: 10, marginBottom: 10
                }}>
                  <span style={{
                    width: 34, height: 34, borderRadius: 10,
                    background: t.bg, color: t.color,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "1rem"
                  }}>
                    <i className={`bi ${t.icon}`}></i>
                  </span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: ".85rem", color: "#1e293b" }}>
                      {t.label}
                    </div>
                    <div style={{ fontSize: ".75rem", color: "#94a3b8" }}>
                      {key === "update" ? "General news & stories" : key === "opportunity" ? "Jobs & internships" : "Campus & virtual events"}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Feed stats */}
            <div style={{
              background: "#fff", borderRadius: 20, padding: 24,
              boxShadow: "0 2px 12px rgba(0,0,0,.06)"
            }}>
              <div style={{ fontWeight: 700, color: "#0f172a", marginBottom: 14, fontSize: ".95rem" }}>
                Feed Stats
              </div>
              {[
                { label: "Total Posts",    value: posts.length,          icon: "bi-file-text", color: "#6366f1" },
                { label: "Total Likes",    value: posts.reduce((s, p) => s + (p.likes?.length || 0), 0), icon: "bi-heart", color: "#ef4444" },
                { label: "Total Comments", value: posts.reduce((s, p) => s + (p.comments?.length || 0), 0), icon: "bi-chat-dots", color: "#0ea5e9" },
              ].map(({ label, value, icon, color }) => (
                <div key={label} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "10px 0", borderBottom: "1px solid #f1f5f9"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <i className={`bi ${icon}`} style={{ color, fontSize: "1rem" }}></i>
                    <span style={{ fontSize: ".85rem", color: "#64748b" }}>{label}</span>
                  </div>
                  <span style={{ fontWeight: 700, color: "#0f172a" }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .post-card { transition: box-shadow .2s; }
        .post-card:hover { box-shadow: 0 6px 24px rgba(30,64,175,.1) !important; }
      `}</style>
    </div>
  );
};

export default Feed;