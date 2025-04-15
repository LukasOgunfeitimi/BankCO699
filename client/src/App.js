import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate } from "react-router-dom";
import './index.css';
import { Dashboard, Login, Register, RequestReset, ResetPassword, Navbar } from "./components";


const API_URL = "http://localhost:3001"; // Replace with your server URL

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-50 to-purple-50">
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/requestreset" element={<RequestReset/>} />
          <Route path="/resetpassword" element={<ResetPassword/>} />
          
        </Routes>
      </div>
    </Router>
  );
}




export default App;