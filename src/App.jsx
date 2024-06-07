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
import NotFound from "./components/NotFound";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          {/* Dashboard dapat diakses oleh semua peran */}
          <Route path="/dashboard" element={<Dashboard />} />
          {/* Rute untuk dokter */}
          <Route
            path="/pasien"
            element={
              <ProtectedRoute allowedRoles={["Dokter"]}>
                <Pasien />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pasien/obat"
            element={
              <ProtectedRoute allowedRoles={["Dokter"]}>
                <Obat />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pasien/obat/resep"
            element={
              <ProtectedRoute allowedRoles={["Dokter"]}>
                <Resep />
              </ProtectedRoute>
            }
          />
          {/* Rute untuk apoteker */}
          <Route
            path="/history"
            element={
              <ProtectedRoute allowedRoles={["Apoteker"]}>
                <History />
              </ProtectedRoute>
            }
          />
          {/* Rute untuk admin */}
          <Route
            path="/user"
            element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                <Users />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/add"
            element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                <AddUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/edit/:id"
            element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                <EditUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pasien/edit/:id"
            element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                <EditPasiens />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pasienlist"
            element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                <ListPasien />
              </ProtectedRoute>
            }
          />
          {/* Rute untuk 404 Not Found */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
