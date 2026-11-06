import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider, useApp } from "./context/AppContext";

// Import all pages
import LandingPage from "./pages/LandingPage";
import LoginUser from "./pages/LoginUser";
import RegisterUser from "./pages/RegisterUser";
import KatalogProduk from "./pages/KatalogProduk";
import DetailProduk from "./pages/DetailProduk";
import KeranjangBelanja from "./pages/KeranjangBelanja";
import DaftarPesanan from "./pages/DaftarPesanan";
import DetailPesanan from "./pages/DetailPesanan";
import LoginAdmin from "./pages/LoginAdmin";
import AdminProduk from "./pages/AdminProduk";
import AdminBrand from "./pages/AdminBrand";
import AdminOrder from "./pages/AdminOrder";
import AdminDashboard from "./pages/AdminDashboard";
import LevelReseller from "./pages/LevelReseller";
import Kemitraan from "./pages/Kemitraan";

// Reseller route guard
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { currentUser } = useApp();
  if (!currentUser || currentUser.role !== "user") {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

// Cart route guard (redirects unauthenticated users to /register as requested)
function CartRoute({ children }: { children: React.ReactNode }) {
  const { currentUser } = useApp();
  if (!currentUser || currentUser.role !== "user") {
    return <Navigate to="/register" replace />;
  }
  return <>{children}</>;
}

// Admin route guard
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { currentUser } = useApp();
  if (!currentUser || currentUser.role !== "admin") {
    return <Navigate to="/login-admin" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />

          {/* Reseller Authentication Routes */}
          <Route path="/login" element={<LoginUser />} />
          <Route path="/register" element={<RegisterUser />} />

          {/* Secure Reseller Portal Views */}
          <Route
            path="/kemitraan"
            element={
              <PrivateRoute>
                <Kemitraan />
              </PrivateRoute>
            }
          />
          <Route
            path="/catalog"
            element={
              <PrivateRoute>
                <KatalogProduk />
              </PrivateRoute>
            }
          />
          <Route
            path="/product/:id"
            element={
              <PrivateRoute>
                <DetailProduk />
              </PrivateRoute>
            }
          />
          <Route
            path="/cart"
            element={
              <CartRoute>
                <KeranjangBelanja />
              </CartRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <PrivateRoute>
                <DaftarPesanan />
              </PrivateRoute>
            }
          />
          <Route
            path="/order-detail/:id"
            element={
              <PrivateRoute>
                <DetailPesanan />
              </PrivateRoute>
            }
          />
          <Route
            path="/level"
            element={
              <PrivateRoute>
                <LevelReseller />
              </PrivateRoute>
            }
          />

          {/* Admin Authentication Portal */}
          <Route path="/login-admin" element={<LoginAdmin />} />

          {/* Secure Admin Operations Views */}
          <Route
            path="/admin-dashboard"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin-products"
            element={
              <AdminRoute>
                <AdminProduk />
              </AdminRoute>
            }
          />
          <Route
            path="/admin-brands"
            element={
              <AdminRoute>
                <AdminBrand />
              </AdminRoute>
            }
          />
          <Route
            path="/admin-orders"
            element={
              <AdminRoute>
                <AdminOrder />
              </AdminRoute>
            }
          />

          {/* Fallback Catch-all Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
