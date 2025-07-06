import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Users, DollarSign, ShoppingBag, Clock, ArrowRight } from 'lucide-react';
import { useOrder } from '../../../contexts/OrderContext';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { orders } = useOrder();
  
  // Calculate today's orders
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayOrders = orders.filter(order => {
    const orderCreatedAt = order.createdAt instanceof Date 
      ? order.createdAt 
      : new Date(order.createdAt);
    return orderCreatedAt >= today;
  });
  
  // Calculate today's revenue
  const todayRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0);
  
  // Get pending orders
  const pendingOrders = orders.filter(order => order.status === 'pending');
  
  // Calculate new customers (unique group names today)
  const todayCustomers = Array.from(new Set(todayOrders.map(order => order.groupName)));
  const newCustomersCount = todayCustomers.length;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">仪表盘</h1>
        <div className="text-sm text-gray-500">
          {new Date().toLocaleDateString('zh-CN', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric', 
            weekday: 'long' 
          })}
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="overflow-hidden rounded-lg bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">今日订单数</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">{todayOrders.length}</p>
            </div>
            <div className="rounded-full bg-green-100 p-3 text-green-600">
              <ShoppingBag className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs font-medium text-green-600">
            <TrendingUp className="mr-1 h-3 w-3" />
            <span>较昨日增长 23%</span>
          </div>
        </div>
        
        <div className="overflow-hidden rounded-lg bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">今日营业额</p>
                              <p className="mt-1 text-2xl font-semibold text-gray-900">€{todayRevenue.toFixed(1)}</p>
            </div>
            <div className="rounded-full bg-blue-100 p-3 text-blue-600">
              <DollarSign className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs font-medium text-blue-600">
            <TrendingUp className="mr-1 h-3 w-3" />
            <span>较昨日增长 15%</span>
          </div>
        </div>
        
        <div className="overflow-hidden rounded-lg bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">待处理订单</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">{pendingOrders.length}</p>
            </div>
            <div className="rounded-full bg-amber-100 p-3 text-amber-600">
              <Clock className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs font-medium text-amber-600">
            <Clock className="mr-1 h-3 w-3" />
            <span>平均处理时间 12 分钟</span>
          </div>
        </div>
        
        <div className="overflow-hidden rounded-lg bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">今日顾客</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">{newCustomersCount}</p>
            </div>
            <div className="rounded-full bg-purple-100 p-3 text-purple-600">
              <Users className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs font-medium text-purple-600">
            <Users className="mr-1 h-3 w-3" />
            <span>今日不同客户数量</span>
          </div>
        </div>
      </div>
      
      {/* Recent Orders */}
      <div className="mb-6 overflow-hidden rounded-lg bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="font-semibold text-gray-800">最近订单</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  订单编号
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  取餐码
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  时间
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  金额
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  状态
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    暂无订单数据
                  </td>
                </tr>
              ) : (
                orders.slice(-5).map((order) => (
                  <tr key={order.id}>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                      {order.id.substring(0, 8)}...
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {order.pickupCode}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {(order.createdAt instanceof Date 
                        ? order.createdAt 
                        : new Date(order.createdAt)
                      ).toLocaleTimeString('zh-CN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      €{order.total.toFixed(1)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      {order.status === 'pending' && (
                        <span className="inline-flex rounded-full bg-yellow-100 px-2 text-xs font-semibold leading-5 text-yellow-800">
                          待处理
                        </span>
                      )}
                      {order.status === 'preparing' && (
                        <span className="inline-flex rounded-full bg-blue-100 px-2 text-xs font-semibold leading-5 text-blue-800">
                          制作中
                        </span>
                      )}
                      {order.status === 'ready' && (
                        <span className="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800">
                          可取餐
                        </span>
                      )}
                      {order.status === 'completed' && (
                        <span className="inline-flex rounded-full bg-gray-100 px-2 text-xs font-semibold leading-5 text-gray-800">
                          已完成
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      <button 
                        onClick={() => navigate('/admin/orders')}
                        className="text-orange-600 hover:text-orange-900"
                      >
                        查看详情
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="border-t border-gray-200 bg-gray-50 px-6 py-3 text-right">
          <button 
            onClick={() => navigate('/admin/orders')}
            className="flex items-center justify-end text-sm font-medium text-orange-600 hover:text-orange-800"
          >
            查看所有订单
            <ArrowRight className="ml-1 h-4 w-4" />
          </button>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;