import React, { useState, useMemo } from 'react';
import { Download, ChevronDown, BarChart, RotateCcw, Database, AlertTriangle, Trash, Users } from 'lucide-react';
import { useOrder } from '../../../contexts/OrderContext';

const Statistics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('week');
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);
  const { orders } = useOrder();

  // 根据时间范围过滤订单
  const filteredOrders = useMemo(() => {
    const now = new Date();
    const startDate = new Date();

    switch (timeRange) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        const dayOfWeek = now.getDay();
        const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // 从周一开始
        startDate.setDate(now.getDate() - diff);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'month':
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'year':
        startDate.setMonth(0, 1);
        startDate.setHours(0, 0, 0, 0);
        break;
      default:
        return orders;
    }

    return orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= startDate && orderDate <= now;
    });
  }, [orders, timeRange]);

  // 计算统计数据
  const statisticsData = useMemo(() => {
    const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = filteredOrders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // 按菜品和规格统计销量
    const itemStats = new Map();
    filteredOrders.forEach(order => {
      order.items.forEach(item => {
        // 构建包含规格信息的唯一标识
        let itemKey = item.menuItem.name;
        let displayName = item.menuItem.name;
        
        // 添加规格信息到显示名称
        if (item.variant && item.variant.trim() !== '') {
          displayName += ` (${item.variant})`;
          itemKey += `_${item.variant}`;
        }
        
        if (item.special && item.special.trim() !== '') {
          displayName += ` - ${item.special}`;
          itemKey += `_${item.special}`;
        }
        
        const existing = itemStats.get(itemKey) || { 
          quantity: 0, 
          revenue: 0, 
          displayName: displayName,
          baseItemName: item.menuItem.name,
          variant: item.variant || '',
          special: item.special || ''
        };
        
        const itemPrice = item.calculatedPrice || item.menuItem.price;
        itemStats.set(itemKey, {
          ...existing,
          quantity: existing.quantity + item.quantity,
          revenue: existing.revenue + (itemPrice * item.quantity)
        });
      });
    });

    const topSellingItems = Array.from(itemStats.entries())
      .map(([, stats]) => ({ 
        name: stats.displayName,
        baseItemName: stats.baseItemName,
        variant: stats.variant,
        special: stats.special,
        quantity: stats.quantity,
        revenue: stats.revenue
      }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10); // 增加到10个以便看到更多规格

    // 按用户统计点餐量
    const customerStats = new Map();
    filteredOrders.forEach(order => {
      const customerName = order.groupName;
      const existing = customerStats.get(customerName) || { 
        orderCount: 0, 
        totalSpent: 0, 
        itemCount: 0,
        avgOrderValue: 0 
      };
      
      const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
      
      const updated = {
        orderCount: existing.orderCount + 1,
        totalSpent: existing.totalSpent + order.total,
        itemCount: existing.itemCount + itemCount,
        avgOrderValue: 0 // 会在下面计算
      };
      
      updated.avgOrderValue = updated.totalSpent / updated.orderCount;
      customerStats.set(customerName, updated);
    });

    const topCustomers = Array.from(customerStats.entries())
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => b.orderCount - a.orderCount)
      .slice(0, 8);

    // 按日期统计销售额（最近7天）
    const dailySales = [];
    const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      
      const dayOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= date && orderDate < nextDay;
      });
      
      const dayRevenue = dayOrders.reduce((sum, order) => sum + order.total, 0);
      
      dailySales.push({
        day: days[date.getDay()],
        sales: dayRevenue
      });
    }

    return {
      totalRevenue,
      totalOrders,
      averageOrderValue,
      topSellingItems,
      topCustomers,
      dailySales
    };
  }, [filteredOrders, orders]);

  // 数据重置功能
  const handleClearOrdersOnly = () => {
    if (confirm('确定要清理所有订单数据吗？这将删除所有历史订单记录，统计数据将重置为0。')) {
      try {
        localStorage.removeItem('orders');
        localStorage.removeItem('cart');
        localStorage.removeItem('deletedOrders'); // 也清理删除记录
        
        // 发送更新事件
        const orderEvent = new CustomEvent('orderUpdate', { detail: [] });
        const cartEvent = new CustomEvent('cartUpdate', { detail: [] });
        window.dispatchEvent(orderEvent);
        window.dispatchEvent(cartEvent);

        alert('✅ 订单数据已清理完成！统计数据已重置。');
      } catch (error) {
        console.error('清理订单数据失败:', error);
        alert('❌ 清理失败，请重试。');
      }
    }
  };

  // 导出报表功能
  const handleExportReport = () => {
    try {
      // 准备导出数据
      const exportData = {
        exportTime: new Date().toLocaleString('zh-CN'),
        timeRange,
        summary: {
          totalRevenue: statisticsData.totalRevenue,
          totalOrders: statisticsData.totalOrders,
          averageOrderValue: statisticsData.averageOrderValue,
          totalCustomers: statisticsData.topCustomers.length
        },
        orders,
        topSellingItems: statisticsData.topSellingItems,
        topCustomers: statisticsData.topCustomers
      };

      // 创建CSV内容
      let csvContent = '';
      
      // 报表头部信息
      csvContent += `报表导出时间,${exportData.exportTime}\n`;
      csvContent += `统计时间范围,${
        timeRange === 'today' ? '今日' :
        timeRange === 'week' ? '本周' :
        timeRange === 'month' ? '本月' : '本年'
      }\n\n`;
      
      // 汇总数据
      csvContent += `汇总统计\n`;
      csvContent += `总销售额,€${exportData.summary.totalRevenue.toFixed(1)}\n`;
      csvContent += `总订单数,${exportData.summary.totalOrders}\n`;
      csvContent += `平均客单价,€${exportData.summary.averageOrderValue.toFixed(1)}\n`;
      csvContent += `活跃用户数,${exportData.summary.totalCustomers}\n\n`;
      
      // 热销菜品
      csvContent += `热销菜品排行\n`;
      csvContent += `排名,菜品名称,规格,选项,销售数量,销售金额\n`;
      exportData.topSellingItems.forEach((item, index) => {
        csvContent += `${index + 1},${item.baseItemName},${item.variant || ''},${item.special || ''},${item.quantity},€${item.revenue.toFixed(1)}\n`;
      });
      csvContent += '\n';
      
      // 用户排行
      csvContent += `用户点餐排行\n`;
      csvContent += `排名,用户名称,订单数量,菜品数量,消费总额,平均客单价\n`;
      exportData.topCustomers.forEach((customer, index) => {
        csvContent += `${index + 1},${customer.name},${customer.orderCount},${customer.itemCount},€${customer.totalSpent.toFixed(1)},€${customer.avgOrderValue.toFixed(1)}\n`;
      });
      csvContent += '\n';
      
      // 详细订单数据
      if (exportData.orders.length > 0) {
        csvContent += `详细订单数据\n`;
        csvContent += `订单号,取餐码,群昵称,订单时间,订单状态,商品数量,订单金额,备注\n`;
        
        const filteredOrders = exportData.orders.filter(order => {
          const orderDate = order.createdAt instanceof Date ? order.createdAt : new Date(order.createdAt);
          
          if (timeRange === 'today') {
            const today = new Date();
            return orderDate.toDateString() === today.toDateString();
          } else if (timeRange === 'week') {
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return orderDate >= weekAgo;
          } else if (timeRange === 'month') {
            const monthAgo = new Date();
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            return orderDate >= monthAgo;
          } else if (timeRange === 'year') {
            const yearAgo = new Date();
            yearAgo.setFullYear(yearAgo.getFullYear() - 1);
            return orderDate >= yearAgo;
          }
          return true;
        });
        
        filteredOrders.forEach(order => {
          const orderTime = (order.createdAt instanceof Date ? order.createdAt : new Date(order.createdAt)).toLocaleString('zh-CN');
          const statusText = {
            'pending': '待处理',
            'preparing': '制作中',
            'ready': '可取餐',
            'completed': '已完成',
            'cancelled': '已取消'
          }[order.status] || order.status;
          
          csvContent += `${order.id},${order.pickupCode},${order.groupName},${orderTime},${statusText},${order.items.reduce((sum, item) => sum + item.quantity, 0)},€${order.total.toFixed(1)},${order.notes || ''}\n`;
        });
      }
      
      // 创建并下载文件
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      
      const timeRangeText = {
        'today': '今日',
        'week': '本周', 
        'month': '本月',
        'year': '本年'
      }[timeRange] || timeRange;
      
      const fileName = `美食之家_${timeRangeText}报表_${new Date().toISOString().slice(0, 10)}.csv`;
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        alert(`📊 报表导出成功！\n文件名: ${fileName}`);
      } else {
        alert('❌ 浏览器不支持文件下载功能');
      }
      
    } catch (error) {
      console.error('导出报表失败:', error);
      alert('❌ 导出报表失败，请重试');
    }
  };

  const handleResetAllData = () => {
    const confirmText = '确认重置';
    const userInput = prompt(
      `⚠️ 警告：此操作将清除所有系统数据，包括：
      
• 所有历史订单记录
• 购物车数据
• 菜单设置
• 餐厅信息设置
• 公告设置
• 优惠活动设置
• 用户登录状态

此操作无法撤销！统计数据将完全重置！

如果您确定要继续，请在下方输入"${confirmText}"：`
    );

    if (userInput === confirmText) {
      try {
        // 需要清理的localStorage键
        const keysToRemove = [
          'orders',
          'cart', 
          'menuItems',
          'categories',
          'restaurantInfo',
          'announcementData',
          'discounts',
          'isAuthenticated',
          'user',
          'hasShownAnnouncementModal',
          'deletedOrders' // 添加删除记录的清理
        ];

        // 清理指定的localStorage数据
        keysToRemove.forEach(key => {
          localStorage.removeItem(key);
        });

        // 发送数据重置事件
        keysToRemove.forEach(key => {
          const event = new CustomEvent(`${key}Update`, { detail: null });
          window.dispatchEvent(event);
        });

        alert('✅ 系统数据已全部重置！页面将自动刷新。');
        
        // 延迟刷新页面，让用户看到成功消息
        setTimeout(() => {
          window.location.reload();
        }, 2000);

      } catch (error) {
        console.error('重置数据失败:', error);
        alert('❌ 重置失败，请重试或联系管理员。');
      }
    }
  };
  
  // Render bar chart 
  const renderBarChart = () => {
    const { dailySales } = statisticsData;
    const maxSales = dailySales.length > 0 ? Math.max(...dailySales.map(item => item.sales)) : 1;
    
    return (
      <div className="mt-4 h-64">
        <div className="flex h-full items-end">
          {dailySales.map((item, index) => (
            <div key={index} className="flex flex-1 flex-col items-center">
              <div 
                className="relative w-full max-w-[40px] bg-orange-500 transition-all duration-500 hover:bg-orange-600"
                style={{ 
                  height: `${(item.sales / maxSales) * 100}%`,
                  animation: `grow 1s ease-out ${index * 0.1}s` 
                }}
              >
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-medium text-gray-600">
                  €{item.sales}
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500">{item.day}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-2xl font-bold text-gray-900">数据统计</h1>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setShowTimeDropdown(!showTimeDropdown)}
              className="flex items-center gap-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              {timeRange === 'today' && '今日'}
              {timeRange === 'week' && '本周'}
              {timeRange === 'month' && '本月'}
              {timeRange === 'year' && '本年'}
              <ChevronDown className="h-4 w-4" />
            </button>
            
            {showTimeDropdown && (
              <div className="absolute right-0 z-10 mt-1 w-40 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                <div className="py-1">
                  <button
                    onClick={() => {
                      setTimeRange('today');
                      setShowTimeDropdown(false);
                    }}
                    className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                  >
                    今日
                  </button>
                  <button
                    onClick={() => {
                      setTimeRange('week');
                      setShowTimeDropdown(false);
                    }}
                    className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                  >
                    本周
                  </button>
                  <button
                    onClick={() => {
                      setTimeRange('month');
                      setShowTimeDropdown(false);
                    }}
                    className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                  >
                    本月
                  </button>
                  <button
                    onClick={() => {
                      setTimeRange('year');
                      setShowTimeDropdown(false);
                    }}
                    className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                  >
                    本年
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <button
            onClick={handleClearOrdersOnly}
            className="flex items-center gap-1 rounded-md bg-yellow-600 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-700"
          >
            <Trash className="h-4 w-4" />
            清理订单
          </button>
          
          <button
            onClick={handleResetAllData}
            className="flex items-center gap-1 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            <RotateCcw className="h-4 w-4" />
            重置数据
          </button>
          
          <button
            onClick={handleExportReport}
            className="flex items-center gap-1 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            <Download className="h-4 w-4" />
            导出报表
          </button>
        </div>
      </div>
      
      {/* Sales Overview */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="overflow-hidden rounded-lg bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">总销售额</h3>
            {statisticsData.totalRevenue > 0 ? (
              <span className="inline-flex rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                实时数据
              </span>
            ) : (
              <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                暂无数据
              </span>
            )}
          </div>
          <p className="mt-2 text-3xl font-bold text-gray-900">€{statisticsData.totalRevenue.toFixed(1)}</p>
          <div className="mt-1 text-sm text-gray-500">
            {timeRange === 'today' && '今日营业额'}
            {timeRange === 'week' && '本周营业额'}
            {timeRange === 'month' && '本月营业额'}
            {timeRange === 'year' && '本年营业额'}
          </div>
        </div>
        
        <div className="overflow-hidden rounded-lg bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">总订单数</h3>
            {statisticsData.totalOrders > 0 ? (
              <span className="inline-flex rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                实时数据
              </span>
            ) : (
              <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                暂无数据
              </span>
            )}
          </div>
          <p className="mt-2 text-3xl font-bold text-gray-900">{statisticsData.totalOrders}</p>
          <div className="mt-1 text-sm text-gray-500">
            {timeRange === 'today' && '今日订单'}
            {timeRange === 'week' && '本周订单'}
            {timeRange === 'month' && '本月订单'}
            {timeRange === 'year' && '本年订单'}
          </div>
        </div>
        
        <div className="overflow-hidden rounded-lg bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">平均客单价</h3>
            {statisticsData.averageOrderValue > 0 ? (
              <span className="inline-flex rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800">
                实时数据
              </span>
            ) : (
              <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                暂无数据
              </span>
            )}
          </div>
          <p className="mt-2 text-3xl font-bold text-gray-900">€{statisticsData.averageOrderValue.toFixed(1)}</p>
          <div className="mt-1 text-sm text-gray-500">
            基于 {statisticsData.totalOrders} 个订单计算
          </div>
        </div>
      </div>
      
      {/* Daily Sales Chart */}
      <div className="mb-6 overflow-hidden rounded-lg bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">销售额趋势</h2>
            <div className="flex items-center text-sm text-gray-500">
              <BarChart className="mr-1 h-4 w-4" />
              {timeRange === 'today' && '今日'}
              {timeRange === 'week' && '本周'}
              {timeRange === 'month' && '本月'}
              {timeRange === 'year' && '本年'}
            </div>
          </div>
        </div>
        <div className="p-6">
          {renderBarChart()}
        </div>
      </div>
      
      {/* Top Selling Items and Customer Ranking */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="overflow-hidden rounded-lg bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="font-semibold text-gray-800">热销菜品排行（含规格）</h2>
          </div>
          <div className="p-6">
            {statisticsData.topSellingItems.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <BarChart className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">暂无销售数据</p>
              </div>
            ) : (
              <div className="space-y-3">
                {statisticsData.topSellingItems.map((item, index) => (
                  <div key={index} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`flex h-6 w-6 items-center justify-center rounded-full text-white text-xs font-bold flex-shrink-0 ${
                        index === 0 ? 'bg-yellow-500' : 
                        index === 1 ? 'bg-gray-400' : 
                        index === 2 ? 'bg-amber-600' : 'bg-blue-500'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium text-gray-900 text-sm">{item.baseItemName}</h3>
                        {(item.variant || item.special) && (
                          <div className="mt-1 space-y-1">
                            {item.variant && item.variant.trim() !== '' && (
                              <p className="text-xs text-blue-600">规格: {item.variant}</p>
                            )}
                            {item.special && item.special.trim() !== '' && (
                              <p className="text-xs text-green-600">选项: {item.special}</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                      <p className="text-sm font-semibold text-gray-900">{item.quantity} 份</p>
                      <p className="text-xs text-gray-500">€{item.revenue.toFixed(1)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* 用户点餐量排行 */}
        <div className="overflow-hidden rounded-lg bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="font-semibold text-gray-800">用户点餐量排行</h2>
          </div>
          <div className="p-6">
            {statisticsData.topCustomers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">暂无用户数据</p>
              </div>
            ) : (
              <div className="space-y-3">
                {statisticsData.topCustomers.map((customer, index) => (
                  <div key={customer.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full text-white text-sm font-bold ${
                        index === 0 ? 'bg-yellow-500' : 
                        index === 1 ? 'bg-gray-400' : 
                        index === 2 ? 'bg-amber-600' : 'bg-blue-500'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{customer.name}</h3>
                        <p className="text-xs text-gray-500">
                          {customer.orderCount} 单 • {customer.itemCount} 个菜品
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">€{customer.totalSpent.toFixed(1)}</p>
                      <p className="text-xs text-gray-500">平均 €{customer.avgOrderValue.toFixed(1)}/单</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="overflow-hidden rounded-lg bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="font-semibold text-gray-800">销售额占比</h2>
          </div>
          <div className="p-6">
            <div className="flex justify-center">
              <div className="relative flex h-40 w-40 items-center justify-center rounded-full bg-gray-100">
                <svg className="absolute inset-0" viewBox="0 0 100 100">
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="40" 
                    fill="none" 
                    stroke="#E5E7EB" 
                    strokeWidth="20" 
                  />
                  {/* Segment 1 - 40% */}
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="40" 
                    fill="none" 
                    stroke="#F97316" 
                    strokeWidth="20" 
                    strokeDasharray={`${40 * 2.51} ${100 * 2.51}`} 
                    strokeDashoffset="0" 
                  />
                  
                  {/* Segment 2 - 25% */}
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="40" 
                    fill="none" 
                    stroke="#3B82F6" 
                    strokeWidth="20" 
                    strokeDasharray={`${25 * 2.51} ${100 * 2.51}`} 
                    strokeDashoffset={`${-40 * 2.51}`} 
                  />
                  
                  {/* Segment 3 - 20% */}
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="40" 
                    fill="none" 
                    stroke="#10B981" 
                    strokeWidth="20" 
                    strokeDasharray={`${20 * 2.51} ${100 * 2.51}`} 
                    strokeDashoffset={`${-65 * 2.51}`} 
                  />
                  
                  {/* Segment 4 - 15% */}
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="40" 
                    fill="none" 
                    stroke="#A855F7" 
                    strokeWidth="20" 
                    strokeDasharray={`${15 * 2.51} ${100 * 2.51}`} 
                    strokeDashoffset={`${-85 * 2.51}`} 
                  />
                </svg>
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-500">总计</div>
                  <div className="text-xl font-bold text-gray-800">€{statisticsData.totalRevenue.toFixed(1)}</div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 grid grid-cols-2 gap-2">
              <div className="flex items-center">
                <div className="h-3 w-3 rounded-full bg-orange-500"></div>
                <span className="ml-2 text-sm text-gray-600">主食类 (40%)</span>
              </div>
              <div className="flex items-center">
                <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                <span className="ml-2 text-sm text-gray-600">小吃类 (25%)</span>
              </div>
              <div className="flex items-center">
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
                <span className="ml-2 text-sm text-gray-600">饮料类 (20%)</span>
              </div>
              <div className="flex items-center">
                <div className="h-3 w-3 rounded-full bg-purple-500"></div>
                <span className="ml-2 text-sm text-gray-600">其他 (15%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 数据管理区域 */}
      <div className="mt-8 space-y-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800">
          <Database className="h-5 w-5" />
          数据管理与重置
        </h2>
        
        {/* 数据概览 */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
          <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{orders.length}</div>
            <div className="text-sm text-gray-500">历史订单总数</div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
            <div className="text-2xl font-bold text-green-600">€{orders.reduce((sum, order) => sum + order.total, 0).toFixed(1)}</div>
            <div className="text-sm text-gray-500">累计营业额</div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{statisticsData.totalOrders}</div>
            <div className="text-sm text-gray-500">当前筛选期间订单</div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {Math.round((JSON.stringify(orders).length) / 1024 * 100) / 100}KB
            </div>
            <div className="text-sm text-gray-500">订单数据大小</div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
            <div className="text-2xl font-bold text-indigo-600">{statisticsData.topCustomers.length}</div>
            <div className="text-sm text-gray-500">活跃用户数</div>
          </div>
        </div>

        {/* 数据重置操作 */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* 清理订单数据 */}
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-medium text-yellow-800 mb-2">清理订单数据</h3>
                <p className="text-sm text-yellow-700 mb-3">
                  清理所有历史订单记录，统计数据将重置为0。此操作不会影响菜单设置和其他配置。
                </p>
                <button
                  onClick={handleClearOrdersOnly}
                  className="inline-flex items-center gap-2 rounded-md bg-yellow-600 px-3 py-2 text-sm font-medium text-white hover:bg-yellow-700"
                >
                  <Trash className="h-4 w-4" />
                  清理所有订单数据
                </button>
              </div>
            </div>
          </div>

          {/* 重置所有数据 */}
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-medium text-red-800 mb-2">重置所有系统数据</h3>
                <p className="text-sm text-red-700 mb-3">
                  ⚠️ <strong>危险操作</strong>：将清除所有系统数据，包括订单、菜单、设置等，恢复到初始状态。
                </p>
                <button
                  onClick={handleResetAllData}
                  className="inline-flex items-center gap-2 rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
                >
                  <Database className="h-4 w-4" />
                  重置所有系统数据
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 使用说明 */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-start gap-3">
            <Database className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-medium text-blue-800 mb-2">统计数据说明</h3>
              <div className="text-sm text-blue-700 space-y-1">
                <p>• 统计数据基于实际订单记录实时计算，与订单数据完全同步</p>
                <p>• 使用时间筛选可查看不同时期的数据统计</p>
                <p>• 清理订单数据后，所有统计图表将重置为0</p>
                <p>• 数据重置操作不可撤销，请谨慎操作</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;