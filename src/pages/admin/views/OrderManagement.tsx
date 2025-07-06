import React, { useState } from 'react';
import { Search, Filter, Clock, Check, X, ChevronDown, Package, User, MessageSquare, Calendar, Euro, Trash2 } from 'lucide-react';
import { useOrder, OrderStatus } from '../../../contexts/OrderContext';

const OrderManagement: React.FC = () => {
  const { orders, updateOrderStatus, deleteOrder } = useOrder();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );


  // Filter orders based on search query, status, and date
  const filteredOrders = orders.filter((order) => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.pickupCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.groupName && order.groupName.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    
    // 兼容处理：createdAt可能是Date对象或字符串
    const orderCreatedAt = order.createdAt instanceof Date ? order.createdAt : new Date(order.createdAt);
    const orderDate = orderCreatedAt.toISOString().split('T')[0];
    const matchesDate = orderDate === selectedDate;
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  // 调试信息
  console.log('OrderManagement 渲染 - 当前订单数据:', orders.length, orders);
  console.log('选中日期:', selectedDate);
  console.log('过滤后订单数据:', filteredOrders.length, filteredOrders);
  console.log('搜索条件:', { searchQuery, filterStatus });
  
  // 检查今天的订单
  const today = new Date().toISOString().split('T')[0];
  const todayOrders = orders.filter(order => {
    const orderCreatedAt = order.createdAt instanceof Date ? order.createdAt : new Date(order.createdAt);
    const orderDate = orderCreatedAt.toISOString().split('T')[0];
    return orderDate === today;
  });
  console.log('今天的订单:', todayOrders.length, todayOrders);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
    } catch (error) {
      console.error('更新订单状态失败:', error);
      alert('更新订单状态失败，请重试');
    }
  };

  const handleDeleteOrder = async (orderId: string, orderInfo: string) => {
    if (confirm(`确定要删除订单 ${orderInfo} 吗？\n此操作不可恢复！`)) {
      try {
        await deleteOrder(orderId);
      } catch (error) {
        console.error('删除订单失败:', error);
        alert('删除订单失败，请重试');
      }
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'preparing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ready': return 'bg-green-100 text-green-800 border-green-200';
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return '待处理';
      case 'preparing': return '制作中';
      case 'ready': return '可取餐';
      case 'completed': return '已完成';
      case 'cancelled': return '已取消';
      default: return '未知状态';
    }
  };

  const getNextStatusAction = (status: OrderStatus) => {
    switch (status) {
      case 'pending': 
        return { 
          action: 'preparing', 
          text: '开始制作', 
          icon: Clock, 
          color: 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200' 
        };
      case 'preparing': 
        return { 
          action: 'ready', 
          text: '制作完成', 
          icon: Check, 
          color: 'bg-green-50 text-green-700 hover:bg-green-100 border-green-200' 
        };
      case 'ready': 
        return { 
          action: 'completed', 
          text: '客户取餐', 
          icon: Package, 
          color: 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200' 
        };
      default: 
        return null;
    }
  };

  const calculateItemPrice = (item: any): number => {
    let totalPrice = item.menuItem.price;
    
    // 计算自定义选项的价格
    if (item.special && item.menuItem.customOptions) {
      // 这里需要解析special来计算实际价格
      // 由于special是文本格式，我们使用简化的计算方法
      // 实际应用中可能需要更复杂的解析逻辑
    }
    
    return totalPrice * item.quantity;
  };

  return (
    <div>
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">订单管理</h1>
          <p className="mt-1 text-sm text-gray-600">管理和跟踪所有订单状态</p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 pl-10 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Filter className="h-4 w-4" />
            筛选
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      {/* Filters */}
      {showFilters && (
        <div className="mb-6 rounded-lg bg-white p-4 shadow-sm border">
          <div className="mb-4 flex items-center">
            <div className="relative flex-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="搜索订单号、取餐码或群昵称..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full rounded-md border border-gray-300 py-2 pl-10 pr-3 text-sm placeholder-gray-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`rounded-full px-3 py-1 text-sm border ${
                filterStatus === 'all'
                  ? 'bg-orange-500 text-white border-orange-500'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
              }`}
            >
              全部订单
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`rounded-full px-3 py-1 text-sm border ${
                filterStatus === 'pending'
                  ? 'bg-orange-500 text-white border-orange-500'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
              }`}
            >
              待处理
            </button>
            <button
              onClick={() => setFilterStatus('preparing')}
              className={`rounded-full px-3 py-1 text-sm border ${
                filterStatus === 'preparing'
                  ? 'bg-orange-500 text-white border-orange-500'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
              }`}
            >
              制作中
            </button>
            <button
              onClick={() => setFilterStatus('ready')}
              className={`rounded-full px-3 py-1 text-sm border ${
                filterStatus === 'ready'
                  ? 'bg-orange-500 text-white border-orange-500'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
              }`}
            >
              可取餐
            </button>
            <button
              onClick={() => setFilterStatus('completed')}
              className={`rounded-full px-3 py-1 text-sm border ${
                filterStatus === 'completed'
                  ? 'bg-orange-500 text-white border-orange-500'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
              }`}
            >
              已完成
            </button>
          </div>
        </div>
      )}
      
      {/* Orders Grid */}
      {filteredOrders.length === 0 ? (
        <div className="rounded-lg bg-white p-12 text-center shadow-sm border">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">暂无订单</h3>
          <p className="mt-2 text-sm text-gray-500">
            {selectedDate === new Date().toISOString().split('T')[0] 
              ? '今日还没有新订单' 
              : '选定日期没有订单'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {filteredOrders.map((order) => (
            <div key={order.id} className="rounded-lg bg-white p-6 shadow-sm border hover:shadow-md transition-shadow">
              {/* 订单头部 */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                      <User className="h-5 w-5 text-orange-600" />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {order.groupName || '未知用户'}
                    </p>
                    <p className="text-xs text-gray-500">
                      取餐码: <span className="font-mono font-semibold text-orange-600">{order.pickupCode}</span>
                    </p>
                  </div>
                </div>
                
                <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold border ${getStatusColor(order.status)}`}>
                  {getStatusText(order.status)}
                </span>
              </div>

              {/* 时间和金额 */}
              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div className="flex items-center text-gray-600">
                  <Clock className="h-4 w-4 mr-1" />
                  {(order.createdAt instanceof Date 
                    ? order.createdAt 
                    : new Date(order.createdAt)
                  ).toLocaleTimeString('zh-CN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
                <div className="flex items-center text-gray-900 font-semibold">
                  <Euro className="h-4 w-4 mr-1" />
                  €{order.total.toFixed(1)}
                </div>
              </div>

              {/* 菜品详情 */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">订单详情</h4>
                <div className="space-y-2 max-h-24 overflow-y-auto">
                  {order.items.map((item, index) => {
                    const price = calculateItemPrice(item);
                    
                    return (
                      <div key={index} className="flex justify-between text-xs">
                        <div className="flex-1 min-w-0">
                          <span className="text-gray-900 font-medium">{item.menuItem.name}</span>
                          {item.special && (
                            <div className="text-gray-500 text-xs truncate mt-1">
                              {item.special}
                            </div>
                          )}
                        </div>
                        <div className="text-right whitespace-nowrap">
                          <div>{item.quantity}x</div>
                          <div className="text-gray-900 font-medium">€{(price / item.quantity).toFixed(1)}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-2 pt-2 border-t border-gray-100">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">总计 {order.items.reduce((sum, item) => sum + item.quantity, 0)} 件商品</span>
                    <span className="font-semibold text-gray-900">€{order.total.toFixed(1)}</span>
                  </div>
                </div>
              </div>

              {/* 备注 */}
              {order.notes && (
                <div className="mb-4 p-2 bg-gray-50 rounded-md">
                  <div className="flex items-start">
                    <MessageSquare className="h-4 w-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-gray-600">{order.notes}</p>
                  </div>
                </div>
              )}

                            {/* 操作按钮 */}
              <div className="flex space-x-2">
                {(() => {
                  const nextAction = getNextStatusAction(order.status);
                  return (
                    <>
                      {nextAction && (
                          <button
                          onClick={() => handleStatusChange(order.id, nextAction.action as OrderStatus)}
                          className={`flex-1 flex items-center justify-center rounded-md px-3 py-2 text-xs font-medium border transition-colors ${nextAction.color}`}
                          >
                          <nextAction.icon className="mr-1 h-3 w-3" />
                          {nextAction.text}
                          </button>
                        )}
                        
                        {(order.status === 'pending' || order.status === 'preparing') && (
                          <button
                            onClick={() => handleStatusChange(order.id, 'cancelled')}
                          className="flex-shrink-0 flex items-center justify-center rounded-md px-3 py-2 text-xs font-medium bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 transition-colors"
                          title="取消订单"
                          >
                          <X className="h-3 w-3" />
                          </button>
                        )}
                        
                        {/* 删除按钮 */}
                        <button
                          onClick={() => handleDeleteOrder(order.id, `${order.pickupCode} (${order.groupName})`)}
                          className="flex-shrink-0 flex items-center justify-center rounded-md px-3 py-2 text-xs font-medium bg-gray-50 text-gray-500 hover:bg-red-50 hover:text-red-700 border border-gray-200 hover:border-red-200 transition-colors"
                          title="删除订单"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                    </>
                  );
                })()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderManagement;