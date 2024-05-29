import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/authContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);

  if (loading) {
    return <div>Loading...</div>; // Anda bisa menampilkan spinner atau indikator loading lainnya
  }

  return isAuthenticated ? children : <Navigate to="/" />;
};

export default ProtectedRoute;
