import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

// Pages
import Home from './pages/Home.jsx';
import Products from './pages/Products.jsx';
import ProductDetails from './pages/ProductDetails.jsx';
import Cart from './pages/Cart.jsx';
import Wishlist from './pages/Wishlist.jsx';
import Checkout from './pages/Checkout.jsx';
import Orders from './pages/Orders.jsx';
import Profile from './pages/Profile.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';

// Dashboards
import SellerDashboard from './pages/Dashboard/SellerDashboard.jsx';
import AdminDashboard from './pages/Dashboard/AdminDashboard.jsx';

// Import CSS
import './App.css';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-dark-950 text-slate-200">
        <Navbar />
        
        <main className="flex-grow pb-16">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Customer Protected Routes */}
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute allowedRoles={['customer', 'seller', 'admin']}>
                  <Profile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/checkout" 
              element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <Checkout />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/orders" 
              element={
                <ProtectedRoute allowedRoles={['customer', 'seller', 'admin']}>
                  <Orders />
                </ProtectedRoute>
              } 
            />

            {/* Seller-Only Routes */}
            <Route 
              path="/seller-dashboard" 
              element={
                <ProtectedRoute allowedRoles={['seller']}>
                  <SellerDashboard />
                </ProtectedRoute>
              } 
            />

            {/* Admin-Only Routes */}
            <Route 
              path="/admin-dashboard" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />

            {/* Fallback to Home */}
            <Route path="*" element={<Home />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
