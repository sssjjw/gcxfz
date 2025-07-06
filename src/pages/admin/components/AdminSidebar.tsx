import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  X, 
  LayoutDashboard, 
  ClipboardList, 
  UtensilsCrossed, 
  Settings, 
  BarChart3,
  ShoppingBag,
  ChefHat
} from 'lucide-react';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 transition-opacity md:hidden" 
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-white shadow-lg transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-gray-200 px-6">
          <div className="flex items-center">
            <ShoppingBag className="h-6 w-6 text-orange-500" />
            <span className="ml-2 text-lg font-bold text-gray-900">餐饮管理系统</span>
          </div>
          <button 
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500 md:hidden"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <nav className="mt-5 px-4">
          <ul className="space-y-1">
            <li>
              <NavLink
                to="/admin/dashboard"
                className={({ isActive }) => 
                  `flex items-center rounded-lg px-4 py-3 text-sm font-medium ${
                    isActive 
                      ? 'bg-orange-50 text-orange-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                <LayoutDashboard className="mr-3 h-5 w-5" />
                控制面板
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/orders"
                className={({ isActive }) => 
                  `flex items-center rounded-lg px-4 py-3 text-sm font-medium ${
                    isActive 
                      ? 'bg-orange-50 text-orange-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                <ClipboardList className="mr-3 h-5 w-5" />
                订单管理
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/menu"
                className={({ isActive }) => 
                  `flex items-center rounded-lg px-4 py-3 text-sm font-medium ${
                    isActive 
                      ? 'bg-orange-50 text-orange-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                <UtensilsCrossed className="mr-3 h-5 w-5" />
                菜品管理
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/preparation"
                className={({ isActive }) => 
                  `flex items-center rounded-lg px-4 py-3 text-sm font-medium ${
                    isActive 
                      ? 'bg-orange-50 text-orange-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                <ChefHat className="mr-3 h-5 w-5" />
                备餐统计
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/statistics"
                className={({ isActive }) => 
                  `flex items-center rounded-lg px-4 py-3 text-sm font-medium ${
                    isActive 
                      ? 'bg-orange-50 text-orange-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                <BarChart3 className="mr-3 h-5 w-5" />
                数据统计
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/settings"
                className={({ isActive }) => 
                  `flex items-center rounded-lg px-4 py-3 text-sm font-medium ${
                    isActive 
                      ? 'bg-orange-50 text-orange-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                <Settings className="mr-3 h-5 w-5" />
                系统设置
              </NavLink>
            </li>
          </ul>
        </nav>
        
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="rounded-lg bg-orange-50 p-4">
            <h4 className="text-sm font-medium text-orange-800">当前版本</h4>
            <p className="mt-1 text-xs text-orange-600">餐饮管理系统 v1.0.0</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;