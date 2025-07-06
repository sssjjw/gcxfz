import React from 'react';
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
    // 未认证时跳转到登录页面
    window.location.href = '?admin=login';
    return null;
  }

  // 根据URL参数确定默认页面
  const getDefaultPage = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const adminValue = urlParams.get('admin');
    
    switch (adminValue) {
      case 'dashboard':
        return 'dashboard';
      case 'orders':
        return 'orders';
      case 'menu':
        return 'menu';
      case 'settings':
        return 'settings';
      case 'statistics':
        return 'statistics';
      case 'preparation':
        return 'preparation';
      default:
        return 'dashboard';
    }
  };



  // 根据URL参数渲染对应的页面组件
  const renderCurrentPage = () => {
    const currentPage = getDefaultPage();
    
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'orders':
        return <OrderManagement />;
      case 'menu':
        return <MenuManagement />;
      case 'preparation':
        return <PreparationStats />;
      case 'settings':
        return <SystemSettings />;
      case 'statistics':
        return <Statistics />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminHeader />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {renderCurrentPage()}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;