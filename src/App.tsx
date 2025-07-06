import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import CustomerApp from './pages/customer/CustomerApp';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { MenuProvider } from './contexts/MenuContext';
import { OrderProvider } from './contexts/OrderContext';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <MenuProvider>
        <OrderProvider>
          <CartProvider>
            <Routes>
              <Route path="/" element={<CustomerApp />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/*" element={<ProtectedAdminRoute />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </CartProvider>
        </OrderProvider>
      </MenuProvider>
    </AuthProvider>
  );
};

const ProtectedAdminRoute: React.FC = () => {
  // 使用AuthContext中的isAuthenticated状态
  const { isAuthenticated } = useAuth();
  
  return isAuthenticated ? (
    <AdminDashboard />
  ) : (
    <Navigate to="/admin/login" replace />
  );
};

export default App;