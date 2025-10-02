import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import WorkoutsPage from "./pages/WorkoutsPage";

function App() {
  return (
    <Router>
      <Routes>
        {/* Landing Page (with background image) */}
        <Route path="/" element={<Home />} />

        {/* Other pages (no background image, clean layout) */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/workouts" element={<WorkoutsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
