import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminHeader from './components/AdminHeader';
import AdminSidebar from './components/AdminSidebar';
import Dashboard from './views/Dashboard';
import OrderManagement from './views/OrderManagement';
import MenuManagement from './views/MenuManagement';
import SystemSettings from './views/SystemSettings';
import Statistics from './views/Statistics';
import PreparationStats from './views/PreparationStats';
import { useAuth } from '../../contexts/AuthContext';

const AdminDashboard: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminHeader />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Routes>
            <Route path="/" element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="orders" element={<OrderManagement />} />
            <Route path="menu" element={<MenuManagement />} />
            <Route path="preparation" element={<PreparationStats />} />
            <Route path="settings" element={<SystemSettings />} />
            <Route path="statistics" element={<Statistics />} />
            <Route path="*" element={<Navigate to="dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;