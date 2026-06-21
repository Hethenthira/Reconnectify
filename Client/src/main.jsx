import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { MessageProvider } from "./context/MessageContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <MessageProvider>
      <App />
      </MessageProvider>
    </AuthProvider>
  </React.StrictMode>
);
