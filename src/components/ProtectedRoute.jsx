import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/authContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);
  const userData = JSON.parse(localStorage.getItem('userData')); // Mendapatkan data pengguna dari local storage
  const userRole = userData ? userData.role : null; // Mengambil peran pengguna dari userData

  if (loading) {
    return <div>Loading...</div>; // Tampilkan indikator loading jika sedang memuat
  }

  // Periksa apakah pengguna telah login dan memiliki peran yang sesuai
  if (!isAuthenticated || !allowedRoles.includes(userRole)) {
    return <Navigate to="/dashboard" />; // Redirect pengguna jika tidak memiliki akses
  }

  return children; // Tampilkan anak-anak jika pengguna memiliki akses
};

export default ProtectedRoute;
