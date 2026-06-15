import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Products from './pages/Products';
import Services from './pages/Services';
import About from './pages/About';
import Contact from './pages/Contact';
import Admin from './pages/Admin';
import SellerDashboard from './pages/SellerDashboard';
import Login from './pages/Login';

function AdminRoute({ children }) {
  const { user, isAdmin } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
}

function SellerRoute({ children }) {
  const { user, isSeller } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!isSeller) return <Navigate to="/" replace />;
  return children;
}

function AppInner() {
  return (
    <BrowserRouter>
      <Navbar />
      <main>
        <Routes>
          <Route path="/"         element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/services" element={<Services />} />
          <Route path="/about"    element={<About />} />
          <Route path="/contact"  element={<Contact />} />
          <Route path="/login"    element={<Login />} />
          <Route path="/admin"    element={<AdminRoute><Admin /></AdminRoute>} />
          <Route path="/seller"   element={<SellerRoute><SellerDashboard /></SellerRoute>} />
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
