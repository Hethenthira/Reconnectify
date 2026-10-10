import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../hooks/useAuth";
import { messageAPI, connectionAPI } from "../services/api";
import { useMessage } from "../context/MessageContext";
import { io } from "socket.io-client";

/**
 * Messages page
 * ─ Only accepted connections appear in the sidebar
 * ─ Real-time messaging via Socket.IO
 * ─ Incoming messages on LEFT, outgoing on RIGHT
 * ─ If navigated here with ?openChat=userId, that chat opens automatically
 */
const Messages = () => {
  const { user, isAuthenticated } = useAuth();
  const { fetchUnreadCount } = useMessage();

  const [connections, setConnections] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [lastMessages, setLastMessages] = useState({});
  const [unreadCounts, setUnreadCounts] = useState({});
  const [isTyping, setIsTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);

  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const selectedUserRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Keep ref in sync with state for use inside socket callbacks
  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  // ── Socket.IO Setup ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated || !user) return;

const socket = io(
  import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace(/\/api$/, "")
    : "http://localhost:5000",
  {
    auth: {
      token: localStorage.getItem("token"),
    },
    transports: ["websocket"],
  }
);

    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("user:join", { userId: user.id });
    });

    // New incoming message
    socket.on("message:receive", (msg) => {
      const senderId =
        typeof msg.sender === "object" ? msg.sender._id : msg.sender;
      const currentChat = selectedUserRef.current;

      // If the chat with this sender is open → append to messages
      if (currentChat && currentChat._id === senderId) {
        setMessages((prev) => {
          // Avoid duplicates
          if (prev.find((m) => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
        // Mark as read immediately
        messageAPI.markAsRead(msg._id).catch(() => {});
      } else {
        // Increment unread badge for that conversation
        setUnreadCounts((prev) => ({
          ...prev,
          [senderId]: (prev[senderId] || 0) + 1,
        }));
      }

      // Update sidebar preview
      setLastMessages((prev) => ({ ...prev, [senderId]: msg.content }));

      // Refresh global unread count in navbar
      fetchUnreadCount();
    });

    // Message sent confirmation (replace temp message)
    socket.on("message:sent", (msg) => {
      const recipientId =
        typeof msg.recipient === "object" ? msg.recipient._id : msg.recipient;
      setMessages((prev) =>
        prev.map((m) =>
          m.isTemp && m.content === msg.content ? { ...msg } : m
        )
      );
      setLastMessages((prev) => ({ ...prev, [recipientId]: msg.content }));
    });

    // Typing indicator
    socket.on("typing:start", ({ userId }) => {
      if (selectedUserRef.current?._id === userId) setIsTyping(true);
    });
    socket.on("typing:stop", ({ userId }) => {
      if (selectedUserRef.current?._id === userId) setIsTyping(false);
    });

    // Online presence
    socket.on("users:online", (userIds) => setOnlineUsers(userIds));
    socket.on("user:online", (userId) =>
      setOnlineUsers((prev) => [...new Set([...prev, userId])])
    );
    socket.on("user:offline", (userId) =>
      setOnlineUsers((prev) => prev.filter((id) => id !== userId))
    );

    return () => {
      socket.disconnect();
    };
  }, [isAuthenticated, user]);

  // ── Scroll to bottom ───────────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // ── Auto-open chat from URL param ──────────────────────────────────────────
  useEffect(() => {
    if (connections.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const openChatId = params.get("openChat");
      if (openChatId) {
        const target = connections.find((c) => c._id === openChatId);
        if (target) handleSelectUser(target);
      }
    }
  }, [connections]);

  // ── Fetch connections on mount ─────────────────────────────────────────────
  useEffect(() => {
    if (isAuthenticated) fetchConnections();
  }, [isAuthenticated]);

  const fetchConnections = async () => {
    try {
      const response = await connectionAPI.getConnections();
      setConnections(response.data);
      fetchLastMessages(response.data);
    } catch (err) {
      console.error("Error fetching connections:", err);
    }
  };

  const fetchLastMessages = async (conns) => {
    const previews = {};
    const unread = {};
    await Promise.allSettled(
      conns.map(async (conn) => {
        try {
          const res = await messageAPI.getConversation(conn._id);
          const msgs = res.data;
          if (msgs.length > 0) {
            previews[conn._id] = msgs[msgs.length - 1].content;
            unread[conn._id] = msgs.filter(
              (m) => !m.read && (typeof m.sender === "object" ? m.sender._id : m.sender) !== user?.id
            ).length;
          }
        } catch {
          // silently ignore
        }
      })
    );
    setLastMessages(previews);
    setUnreadCounts(unread);
  };

  const fetchMessages = async (userId) => {
    setLoading(true);
    try {
      const response = await messageAPI.getConversation(userId);
      setMessages(response.data);
      setUnreadCounts((prev) => ({ ...prev, [userId]: 0 }));
    } catch (err) {
      console.error("Error fetching messages:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUser = async (targetUser) => {
    setSelectedUser(targetUser);
    setIsTyping(false);
    await fetchMessages(targetUser._id);
    fetchUnreadCount();

    // Join the socket room for this conversation
    if (socketRef.current) {
      socketRef.current.emit("conversation:join", { userId: targetUser._id });
    }
  };

  // ── Typing indicator emit ──────────────────────────────────────────────────
  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    if (!socketRef.current || !selectedUser) return;

    socketRef.current.emit("typing:start", { recipientId: selectedUser._id });
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current?.emit("typing:stop", { recipientId: selectedUser._id });
    }, 1500);
  };

  // ── Send message ───────────────────────────────────────────────────────────
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const content = newMessage.trim();
    const tempMessage = {
      _id: `temp-${Date.now()}`,
      content,
      sender: user?.id,
      recipient: selectedUser._id,
      createdAt: new Date().toISOString(),
      isTemp: true,
    };

    setMessages((prev) => [...prev, tempMessage]);
    setNewMessage("");

    // Stop typing indicator
    if (socketRef.current) {
      socketRef.current.emit("typing:stop", { recipientId: selectedUser._id });
    }

    try {
      const res = await messageAPI.sendMessage(selectedUser._id, content);
      // Replace temp with real message from server
      setMessages((prev) =>
        prev.map((m) => (m._id === tempMessage._id ? res.data : m))
      );
      setLastMessages((prev) => ({ ...prev, [selectedUser._id]: content }));
      fetchUnreadCount();
    } catch (err) {
      alert("Error sending message: " + (err.response?.data?.message || err.message));
      setMessages((prev) => prev.filter((m) => m._id !== tempMessage._id));
    }
  };

  // ── Helpers ────────────────────────────────────────────────────────────────
  const isOwnMessage = (msg) => {
    const senderId =
      typeof msg.sender === "object" ? msg.sender._id : msg.sender;
    return senderId === user?.id;
  };

  const isOnline = (userId) => onlineUsers.includes(userId);

  const filteredConnections = connections.filter((conn) =>
    conn.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleEmoji = (role) => (role === "alumni" ? "👨‍💼" : "👨‍🎓");
  const getRoleBg = (role) => (role === "alumni" ? "#e8f0fe" : "#e6f4ea");

  if (!isAuthenticated) {
    return (
      <div className="container mt-5">
        <div className="alert alert-warning">
          <i className="bi bi-exclamation-triangle me-2"></i>
          Please login to view messages
        </div>
      </div>
    );
  }

  return (
    <div className="vh-100 d-flex flex-column" style={{ marginTop: "70px" }}>
      <div className="container-fluid flex-grow-1 d-flex flex-column p-0">
        <div className="row g-0 flex-grow-1">

          {/* ── Sidebar ────────────────────────────────────────────────── */}
          <div
            className="col-lg-4 col-md-5 border-end bg-white d-flex flex-column"
            style={{ height: "calc(100vh - 70px)" }}
          >
            {/* Header */}
            <div className="p-3 border-bottom bg-light">
              <h5 className="fw-bold mb-3">
                <i className="bi bi-chat-dots text-primary me-2"></i>Messages
              </h5>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0 ps-0"
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Connections list */}
            <div className="flex-grow-1 overflow-auto">
              {connections.length === 0 ? (
                <div className="text-center p-5">
                  <i className="bi bi-people display-3 text-muted d-block mb-3"></i>
                  <h6 className="fw-bold">No accepted connections yet</h6>
                  <p className="text-muted small">
                    Connect with alumni and students to start messaging. Chats
                    unlock once a connection is accepted.
                  </p>
                  <a href="/directory" className="btn btn-primary btn-sm">
                    <i className="bi bi-person-plus me-1"></i> Find Connections
                  </a>
                </div>
              ) : filteredConnections.length === 0 ? (
                <div className="text-center p-4">
                  <i className="bi bi-search display-4 text-muted d-block mb-2"></i>
                  <p className="text-muted">No connections found</p>
                </div>
              ) : (
                filteredConnections.map((conn) => {
                  const unread = unreadCounts[conn._id] || 0;
                  const preview =
                    lastMessages[conn._id] || "Click to start conversation";
                  const isActive = selectedUser?._id === conn._id;
                  const online = isOnline(conn._id);

                  return (
                    <div
                      key={conn._id}
                      className={`p-3 border-bottom conversation-item ${isActive ? "active" : ""}`}
                      onClick={() => handleSelectUser(conn)}
                      role="button"
                    >
                      <div className="d-flex align-items-center">
                        <div className="position-relative me-3 flex-shrink-0">
                          <div
                            className="rounded-circle d-flex align-items-center justify-content-center"
                            style={{
                              width: "50px",
                              height: "50px",
                              background: getRoleBg(conn.role),
                              fontSize: "24px",
                            }}
                          >
                            {getRoleEmoji(conn.role)}
                          </div>
                          {online && (
                            <span
                              className="position-absolute bottom-0 end-0 bg-success border border-white rounded-circle"
                              style={{ width: "12px", height: "12px" }}
                            />
                          )}
                        </div>
                        <div className="flex-grow-1 overflow-hidden">
                          <div className="d-flex justify-content-between align-items-start">
                            <h6
                              className={`mb-0 text-truncate ${
                                unread > 0 ? "fw-bold" : "fw-semibold"
                              }`}
                            >
                              {conn.name}
                            </h6>
                          </div>
                          <div className="d-flex justify-content-between align-items-center mt-1">
                            <p
                              className={`mb-0 small text-truncate ${
                                unread > 0 ? "fw-semibold text-dark" : "text-muted"
                              }`}
                              style={{ maxWidth: "180px" }}
                            >
                              {preview}
                            </p>
                            {unread > 0 && (
                              <span className="badge bg-primary rounded-pill ms-1">
                                {unread}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* ── Chat Area ──────────────────────────────────────────────── */}
          <div
            className="col-lg-8 col-md-7 d-flex flex-column bg-light"
            style={{ height: "calc(100vh - 70px)" }}
          >
            {selectedUser ? (
              <>
                {/* Chat Header */}
                <div className="p-3 border-bottom bg-white shadow-sm flex-shrink-0">
                  <div className="d-flex align-items-center">
                    <div className="position-relative me-3 flex-shrink-0">
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center"
                        style={{
                          width: "50px",
                          height: "50px",
                          background: getRoleBg(selectedUser.role),
                          fontSize: "24px",
                        }}
                      >
                        {getRoleEmoji(selectedUser.role)}
                      </div>
                      {isOnline(selectedUser._id) && (
                        <span
                          className="position-absolute bottom-0 end-0 bg-success border border-white rounded-circle"
                          style={{ width: "12px", height: "12px" }}
                        />
                      )}
                    </div>
                    <div className="flex-grow-1">
                      <h6 className="mb-0 fw-bold">{selectedUser.name}</h6>
                      <small className="text-muted">
                        {selectedUser.role?.toUpperCase()} •{" "}
                        {selectedUser.department}
                        <span
                          className={`ms-2 ${
                            isOnline(selectedUser._id)
                              ? "text-success"
                              : "text-secondary"
                          }`}
                        >
                          <i
                            className="bi bi-circle-fill"
                            style={{ fontSize: "8px" }}
                          ></i>{" "}
                          {isOnline(selectedUser._id) ? "Online" : "Offline"}
                        </span>
                      </small>
                    </div>
                    <div className="dropdown">
                      <button
                        className="btn btn-sm btn-outline-secondary dropdown-toggle"
                        type="button"
                        data-bs-toggle="dropdown"
                      >
                        <i className="bi bi-three-dots-vertical"></i>
                      </button>
                      <ul className="dropdown-menu dropdown-menu-end">
                        <li>
                          <a
                            className="dropdown-item"
                            href={`/profile/${selectedUser._id}`}
                          >
                            <i className="bi bi-person me-2"></i> View Profile
                          </a>
                        </li>
                        <li>
                          <hr className="dropdown-divider" />
                        </li>
                        <li>
                          <button
                            className="dropdown-item text-danger"
                            onClick={() => {
                              if (socketRef.current) {
                                socketRef.current.emit("conversation:leave", {
                                  userId: selectedUser._id,
                                });
                              }
                              setSelectedUser(null);
                              setMessages([]);
                              setIsTyping(false);
                            }}
                          >
                            <i className="bi bi-x-circle me-2"></i> Close Chat
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-grow-1 p-4 overflow-auto chat-bg">
                  {loading ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary" role="status" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-5">
                      <div
                        className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                        style={{
                          width: "80px",
                          height: "80px",
                          background: getRoleBg(selectedUser.role),
                          fontSize: "40px",
                        }}
                      >
                        {getRoleEmoji(selectedUser.role)}
                      </div>
                      <h5 className="fw-bold">{selectedUser.name}</h5>
                      <p className="text-muted">You're now connected! Say hello 👋</p>
                    </div>
                  ) : (
                    <>
                      {messages.map((msg, idx) => {
                        const own = isOwnMessage(msg);
                        const showDate =
                          idx === 0 ||
                          new Date(messages[idx - 1].createdAt).toDateString() !==
                            new Date(msg.createdAt).toDateString();

                        return (
                          <div key={msg._id || idx}>
                            {/* Date separator */}
                            {showDate && (
                              <div className="text-center my-3">
                                <small className="badge bg-light text-dark px-3 py-2 shadow-sm">
                                  {new Date(msg.createdAt).toLocaleDateString(
                                    "en-US",
                                    {
                                      weekday: "long",
                                      month: "long",
                                      day: "numeric",
                                    }
                                  )}
                                </small>
                              </div>
                            )}

                            {/* Message bubble */}
                            <div
                              className={`d-flex mb-2 align-items-end ${
                                own ? "justify-content-end" : "justify-content-start"
                              }`}
                            >
                              {/* Avatar for incoming (LEFT) */}
                              {!own && (
                                <div
                                  className="rounded-circle d-flex align-items-center justify-content-center me-2 flex-shrink-0"
                                  style={{
                                    width: "34px",
                                    height: "34px",
                                    background: getRoleBg(selectedUser.role),
                                    fontSize: "16px",
                                  }}
                                >
                                  {getRoleEmoji(selectedUser.role)}
                                </div>
                              )}

                              {/* Bubble */}
                              <div
                                style={{
                                  maxWidth: "65%",
                                  padding: "10px 14px",
                                  borderRadius: own
                                    ? "18px 18px 4px 18px"
                                    : "18px 18px 18px 4px",
                                  backgroundColor: own ? "#0d6efd" : "#ffffff",
                                  color: own ? "#ffffff" : "#212529",
                                  boxShadow: "0 1px 3px rgba(0,0,0,0.10)",
                                  opacity: msg.isTemp ? 0.7 : 1,
                                  transition: "opacity 0.2s",
                                }}
                              >
                                <p className="mb-1" style={{ lineHeight: 1.45 }}>
                                  {msg.content}
                                </p>
                                <div
                                  className={`d-flex align-items-center gap-1 ${
                                    own ? "justify-content-end" : ""
                                  }`}
                                  style={{ opacity: 0.75 }}
                                >
                                  <small style={{ fontSize: "11px" }}>
                                    {new Date(msg.createdAt).toLocaleTimeString(
                                      [],
                                      { hour: "2-digit", minute: "2-digit" }
                                    )}
                                  </small>
                                  {own && (
                                    <i
                                      className={`bi ${
                                        msg.isTemp
                                          ? "bi-clock"
                                          : msg.read
                                          ? "bi-check2-all text-info"
                                          : "bi-check2-all"
                                      }`}
                                      style={{ fontSize: "12px" }}
                                    ></i>
                                  )}
                                </div>
                              </div>

                              {/* Avatar for outgoing (RIGHT) */}
                              {own && (
                                <div
                                  className="rounded-circle d-flex align-items-center justify-content-center ms-2 flex-shrink-0"
                                  style={{
                                    width: "34px",
                                    height: "34px",
                                    background: getRoleBg(user?.role),
                                    fontSize: "16px",
                                  }}
                                >
                                  {getRoleEmoji(user?.role)}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}

                      {/* Typing indicator */}
                      {isTyping && (
                        <div className="d-flex align-items-end mb-2">
                          <div
                            className="rounded-circle d-flex align-items-center justify-content-center me-2 flex-shrink-0"
                            style={{
                              width: "34px",
                              height: "34px",
                              background: getRoleBg(selectedUser.role),
                              fontSize: "16px",
                            }}
                          >
                            {getRoleEmoji(selectedUser.role)}
                          </div>
                          <div
                            className="px-3 py-2 bg-white rounded"
                            style={{
                              borderRadius: "18px 18px 18px 4px",
                              boxShadow: "0 1px 3px rgba(0,0,0,0.10)",
                            }}
                          >
                            <span className="typing-dots">
                              <span></span>
                              <span></span>
                              <span></span>
                            </span>
                          </div>
                        </div>
                      )}

                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>

                {/* Message Input */}
                <div className="p-3 border-top bg-white flex-shrink-0">
                  <form onSubmit={handleSendMessage}>
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control"
                        placeholder={`Message ${selectedUser.name}...`}
                        value={newMessage}
                        onChange={handleTyping}
                        style={{
                          borderRadius: "24px 0 0 24px",
                          paddingLeft: "16px",
                        }}
                      />
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={!newMessage.trim()}
                        style={{
                          borderRadius: "0 24px 24px 0",
                          paddingLeft: "20px",
                          paddingRight: "20px",
                        }}
                      >
                        <i className="bi bi-send-fill"></i>
                      </button>
                    </div>
                  </form>
                </div>
              </>
            ) : (
              /* Empty state */
              <div className="d-flex align-items-center justify-content-center h-100">
                <div className="text-center">
                  <div
                    className="rounded-circle d-inline-flex align-items-center justify-content-center mb-4"
                    style={{
                      width: "100px",
                      height: "100px",
                      background: "#e8f0fe",
                      fontSize: "50px",
                    }}
                  >
                    💬
                  </div>
                  <h5 className="fw-bold">Your Messages</h5>
                  <p className="text-muted" style={{ maxWidth: "300px" }}>
                    Select a conversation from the left, or connect with someone
                    in the directory to start chatting.
                  </p>
                  <a href="/directory" className="btn btn-outline-primary btn-sm">
                    <i className="bi bi-people me-1"></i> Browse Directory
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .conversation-item {
          transition: background-color 0.15s;
          cursor: pointer;
        }
        .conversation-item:hover {
          background-color: #f8f9fa;
        }
        .conversation-item.active {
          background-color: #e7f1ff;
          border-left: 3px solid #0d6efd;
        }
        .chat-bg {
          background-color: #f0f4f8;
          background-image: url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23d0dae8' fill-opacity='0.25' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E");
        }

        /* Typing indicator animation */
        .typing-dots {
          display: flex;
          gap: 4px;
          align-items: center;
          height: 20px;
        }
        .typing-dots span {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background-color: #adb5bd;
          animation: bounce 1.2s infinite ease-in-out;
        }
        .typing-dots span:nth-child(1) { animation-delay: 0s; }
        .typing-dots span:nth-child(2) { animation-delay: 0.2s; }
        .typing-dots span:nth-child(3) { animation-delay: 0.4s; }

        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
};

export default Messages;