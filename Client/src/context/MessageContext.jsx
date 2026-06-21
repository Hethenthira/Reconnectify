import { createContext, useContext, useState, useEffect, useRef } from "react";
import { messageAPI } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import { io } from "socket.io-client";

const MessageContext = createContext();

export const MessageProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const socketRef = useRef(null);
  const pollRef = useRef(null);

  const fetchUnreadCount = async () => {
    try {
      const res = await messageAPI.getUnreadCount();
      setUnreadCount(res.data.count ?? 0);
    } catch {
      // silently ignore
    }
  };

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setUnreadCount(0);
      return;
    }

    // Initial fetch
    fetchUnreadCount();

    // Poll every 30s as a fallback
    pollRef.current = setInterval(fetchUnreadCount, 30_000);

    // Socket for real-time increment
    const socket = io("http://localhost:5000", {
      auth: { token: localStorage.getItem("token") },
      transports: ["websocket"],
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("user:join", { userId: user.id });
    });

    socket.on("message:receive", () => {
      // Re-fetch accurate count from server on any new message
      fetchUnreadCount();
    });

    return () => {
      clearInterval(pollRef.current);
      socket.disconnect();
    };
  }, [isAuthenticated, user]);

  return (
    <MessageContext.Provider value={{ unreadCount, fetchUnreadCount }}>
      {children}
    </MessageContext.Provider>
  );
};

export const useMessage = () => useContext(MessageContext);