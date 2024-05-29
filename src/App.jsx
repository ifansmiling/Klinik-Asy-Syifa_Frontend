import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./page-list/dashboard";
import Login from "./components/Login";
import Users from "./page-list/Users";
import Pasien from "./page-list/Pasien";
import History from "./page-list/History";
import Obat from "./page-list/Obat";
import Resep from "./page-list/Resep";
import AddUsers from "./page-list/AddUsers";
import EditUsers from "./page-list/EditUsers";
import EditPasiens from "./page-list/EditPasiens";
import ListPasien from "./page-list/ListPasien";
import { AuthProvider } from "./context/authContext";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          {/* DOKTER */}
          <Route
            path="/pasien"
            element={
              <ProtectedRoute>
                <Pasien />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pasien/obat"
            element={
              <ProtectedRoute>
                <Obat />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pasien/obat/resep"
            element={
              <ProtectedRoute>
                <Resep />
              </ProtectedRoute>
            }
          />
          {/* Apoteker */}
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <History />
              </ProtectedRoute>
            }
          />
          {/* Admin */}
          <Route
            path="/user"
            element={
              <ProtectedRoute>
                <Users />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/add"
            element={
              <ProtectedRoute>
                <AddUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/edit/:id"
            element={
              <ProtectedRoute>
                <EditUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pasien/edit/:id"
            element={
              <ProtectedRoute>
                <EditPasiens />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pasienlist"
            element={
              <ProtectedRoute>
                <ListPasien />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
