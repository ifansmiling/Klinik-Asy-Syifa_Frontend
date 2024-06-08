import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/authContext";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);
  const userData = JSON.parse(localStorage.getItem("userData"));
  const userRole = userData ? userData.role : null;

  if (loading) {
    // Menampilkan loading screen atau spinner saat memeriksa autentikasi
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    // Jika pengguna belum login, arahkan ke halaman login
    return <Navigate to="/" replace />;
  }

  if (isAuthenticated && !allowedRoles.includes(userRole)) {
    // Jika pengguna sudah login tetapi tidak memiliki akses ke halaman ini, arahkan ke dashboard
    return <Navigate to="/dashboard" replace />;
  }

  // Jika pengguna terautentikasi dan memiliki peran yang sesuai, tampilkan halaman yang diminta
  return children;
};

export default ProtectedRoute;
