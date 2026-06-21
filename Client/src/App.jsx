import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import Layout from "./components/Layout";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Events from "./pages/Events";
import Opportunities from "./pages/Opportunities";
import Dashboard from "./pages/Dashboard";
import Directory from "./pages/Directory";
import About from "./pages/About";
import Messages from "./pages/Messages";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./components/ProtectRoute";
import AdminRoute from "./components/AdminRoute";
import Feed from "./pages/Feed";

export default function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ minHeight: "100vh" }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
<Router>
  <Routes>
  <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    {/* Public Routes */}
    <Route element={<Layout />}>
      <Route path="/" element={<Home />} />
    

      {/* Protected Pages */}
      <Route path="/about" element={
        <ProtectedRoute>
          <About />
        </ProtectedRoute>
      } />

      <Route path="/profile" element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      } />

      <Route path="/events" element={
        <ProtectedRoute>
          <Events />
        </ProtectedRoute>
      } />

      <Route path="/opportunities" element={
        <ProtectedRoute>
          <Opportunities />
        </ProtectedRoute>
      } />
 <Route path="/feed" element={
            <ProtectedRoute><Feed/></ProtectedRoute>
          } />
      <Route path="/directory" element={
        <ProtectedRoute>
          <Directory />
        </ProtectedRoute>
      } />

        <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />

      <Route path="/messages" element={
        <ProtectedRoute>
          <Messages />
        </ProtectedRoute>
      } />

      <Route path="/admin" element={
        <AdminRoute>
          <AdminDashboard />
        </AdminRoute>
      } />
    </Route>

  </Routes>
</Router>

  );
}
