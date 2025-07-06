import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  User, 
  LogOut,
  Clock,
  DollarSign
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useOrder } from '../../../contexts/OrderContext';

interface AdminHeaderProps {
  // 不再需要onToggleSidebar参数
}

const AdminHeader: React.FC<AdminHeaderProps> = () => {
  const { logout, user } = useAuth();
  const { orders } = useOrder();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = () => {
    logout();
    // 使用相对路径，避免跳转到根目录
    navigate('/admin/login', { replace: true });
  };

  // 计算通知数据
  const notificationData = React.useMemo(() => {
    // 获取最近24小时的新订单
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const recentOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= yesterday;
    });

    // 待处理订单
    const pendingOrders = orders.filter(order => order.status === 'pending');
    
    // 最新的5个订单用于显示
    const latestOrders = orders.slice(-5).reverse();

    return {
      pendingCount: pendingOrders.length,
      recentCount: recentOrders.length,
      latestOrders
    };
  }, [orders]);

  // 点击外部关闭通知栏
  useEffect(() => {
    const handleClickOutside = () => {
      setShowNotifications(false);
    };

    if (showNotifications) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showNotifications]);

  // 格式化时间
  const formatTime = (date: Date | string) => {
    const orderDate = date instanceof Date ? date : new Date(date);
    return orderDate.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 格式化状态
  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return '待处理';
      case 'preparing': return '制作中';
      case 'ready': return '可取餐';
      case 'completed': return '已完成';
      case 'cancelled': return '已取消';
      default: return '未知状态';
    }
  };

  // 获取状态样式
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'preparing': return 'bg-blue-100 text-blue-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <header className="z-10 border-b border-gray-200 bg-white shadow-sm">
      <div className="flex h-16 items-center justify-between px-4">
        <div className="flex items-center">
          {/* 空的div用于保持布局平衡 */}
        </div>
        
        <div className="flex items-center gap-4">
          {/* 通知下拉菜单 */}
          <div className="relative">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setShowNotifications(!showNotifications);
              }}
              className="relative rounded-full bg-gray-100 p-2 text-gray-600 hover:bg-gray-200 transition-colors"
            >
              <Bell className="h-5 w-5" />
              {notificationData.pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                  {notificationData.pendingCount}
                </span>
              )}
            </button>

            {/* 通知下拉菜单 */}
            {showNotifications && (
              <div 
                className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="py-1">
                  {/* 通知头部 */}
                  <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-md">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-900">订单通知</h3>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          待处理: {notificationData.pendingCount}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 通知内容 */}
                  <div className="max-h-64 overflow-y-auto">
                    {notificationData.latestOrders.length === 0 ? (
                      <div className="px-4 py-8 text-center text-gray-500">
                        <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">暂无新订单</p>
                      </div>
                    ) : (
                      notificationData.latestOrders.map((order) => (
                        <div key={order.id} className="px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-medium text-gray-900 truncate">
                                  #{order.pickupCode}
                                </span>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusClass(order.status)}`}>
                                  {getStatusText(order.status)}
                                </span>
                              </div>
                              <p className="text-xs text-gray-600 mb-1">
                                顾客: {order.groupName}
                              </p>
                              <div className="flex items-center justify-between text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                  <DollarSign className="h-3 w-3" />
                                  €{order.total.toFixed(1)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {formatTime(order.createdAt)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* 通知底部 */}
                  <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 rounded-b-md">
                    <button 
                      onClick={() => {
                        navigate('/admin/orders');
                        setShowNotifications(false);
                      }}
                      className="w-full text-center text-sm text-orange-600 hover:text-orange-800 font-medium"
                    >
                      查看所有订单
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="group relative">
            <button className="flex items-center gap-2 rounded-full hover:bg-gray-100 p-1">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                <User className="h-5 w-5" />
              </div>
              <span className="hidden text-sm font-medium text-gray-700 md:block">
                {user?.username || '管理员'}
              </span>
            </button>
            
            <div className="absolute right-0 mt-2 hidden w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 group-hover:block">
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
              >
                <LogOut className="h-4 w-4" />
                退出登录
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;