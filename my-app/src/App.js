// src/App.js
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";
import "./App.css";
import Home from "./components/Home";
import GroupManagement from "./components/GroupManagement";
import LoginPage from "./components/login";
import Register from "./components/Register";
import AddStudent from "./components/Addstudent";
import Attendance from './components/attendance';
import AttendanceHistory from './components/attendancehistory';
function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

function AppContent() {
  const location = useLocation();
  const isLoginPage = location.pathname === "/logout";

  return (
    <div className={isLoginPage ? "login-page-container" : "app-container"}>
      {!isLoginPage && <Sidebar />}
      <div className={isLoginPage ? "full-width" : "content-area"}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/group-management" element={<GroupManagement />} />
          <Route path="/logout" element={<LoginPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/addstudent" element={<AddStudent />} />
          <Route path='/attendance' element={<Attendance />} />
          <Route path="/history" element={<AttendanceHistory />} />
        </Routes>
      </div>
    </div>
  );
}

function Sidebar() {
  const navigate = useNavigate();

  const handleMenuClick = (path) => {
    navigate(path);
  };
  return (
    <div className="sidebar">
      <ul>
        <li className="menu-item" onClick={() => handleMenuClick("/")}>
          <span className="menu-icon">&#9776;</span>
          Quản Lý Lớp Học
        </li>
        <li className="menu-item" onClick={() => handleMenuClick("/")}>
          <span className="user-icon">👤</span> Sinh viên
        </li>
        <li
          className="menu-item"
          onClick={() => handleMenuClick("/group-management")}
        >
          <span className="group-icon">👥</span> Quản lý nhóm
        </li>
        <li
          className="menu-item"
          onClick={() => handleMenuClick("/attendance")}
        >
          <span className="calendar-icon">📅</span> Quản lí điểm danh
        </li>
        <li className="menu-item" onClick={() => handleMenuClick("/register")}>
          <span className="tasks-icon">📝</span> Đăng kí
        </li>
        <li className="menu-item" onClick={() => handleMenuClick("/logout")}>
          <span className="logout-icon">🚪</span> Đăng xuất
        </li>
      </ul>
    </div>
  );
}

export default App;
