import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash, Database, AlertTriangle, RotateCcw } from 'lucide-react';
import AnnouncementEditor from '../components/AnnouncementEditor';
import { AnnouncementData, defaultAnnouncementData } from '../../customer/components/Announcement';
import { settingsService } from '../../../firebase/services';

// 定义餐厅信息和优惠活动的接口
interface RestaurantInfo {
  name: string;
  logo: string;
}

interface Discount {
  id: string;
  type: 'amount' | 'percentage';
  threshold: number;
  value: number;
  description: string;
}

// 从Firebase加载数据函数
const loadDataFromFirebase = async <T,>(key: string, defaultValue: T): Promise<T> => {
  try {
    // 从Firebase加载数据
    console.log(`🔄 正在从Firebase加载${key}数据...`);
    const firebaseData = await settingsService.getSetting(key);
    
    if (firebaseData !== null && firebaseData !== undefined) {
      console.log(`✅ 从Firebase加载了${key}数据`);
      return firebaseData;
    }
    
    // Firebase没有数据，返回默认值
    console.log(`⚠️ Firebase没有${key}数据，使用默认值`);
    return defaultValue;
  } catch (error) {
    console.error(`❌ 从Firebase加载${key}数据失败:`, error);
    return defaultValue;
  }
};

// 保存数据函数到localStorage和Firebase
const saveDataToStorage = async <T,>(key: string, data: T) => {
  try {
    // 保存到localStorage（作为缓存）
    localStorage.setItem(key, JSON.stringify(data));
    
    // 保存到Firebase（主要存储）
    try {
      await settingsService.setSetting(key, data);
      console.log(`✅ ${key}数据已保存到Firebase`);
    } catch (firebaseError) {
      console.error(`❌ 保存${key}数据到Firebase失败:`, firebaseError);
    }
    
    // 发送自定义事件通知其他组件
    const updateEvent = new CustomEvent(`${key}Update`, { detail: data });
    window.dispatchEvent(updateEvent);
  } catch (error) {
    console.error(`保存${key}数据失败:`, error);
  }
};

const SystemSettings: React.FC = () => {
  // 初始化为默认值，数据将在useEffect中异步加载
  const [restaurantInfo, setRestaurantInfo] = useState<RestaurantInfo>({
    name: '美食之家',
    logo: 'https://images.pexels.com/photos/6287525/pexels-photo-6287525.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  });
  
  const [announcementData, setAnnouncementData] = useState<AnnouncementData>(defaultAnnouncementData);
  
  const [discounts, setDiscounts] = useState<Discount[]>([
    { id: '1', type: 'amount', threshold: 100, value: 10, description: '满100减10元' },
    { id: '2', type: 'amount', threshold: 200, value: 20, description: '满200减20元' },
    { id: '3', type: 'percentage', threshold: 300, value: 15, description: '满300享85折' },
  ]);
  
  const [newDiscount, setNewDiscount] = useState<Omit<Discount, 'id' | 'description'>>({
    type: 'amount',
    threshold: 100,
    value: 10,
  });
  
  const [showDiscountForm, setShowDiscountForm] = useState(false);
  const [activeTab, setActiveTab] = useState('basic'); // 'basic', 'announcement', 'discount', 'dataManagement'
  
  // 异步加载所有设置数据
  useEffect(() => {
    const loadAllSettings = async () => {
      try {
        // 并行加载所有设置数据
        const [loadedRestaurantInfo, loadedAnnouncementData, loadedDiscounts] = await Promise.all([
          loadDataFromStorage('restaurantInfo', {
            name: '美食之家',
            logo: 'https://images.pexels.com/photos/6287525/pexels-photo-6287525.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
          }),
          loadDataFromStorage('announcementData', defaultAnnouncementData),
          loadDataFromStorage('discounts', [
            { id: '1', type: 'amount' as const, threshold: 100, value: 10, description: '满100减10元' },
            { id: '2', type: 'amount' as const, threshold: 200, value: 20, description: '满200减20元' },
            { id: '3', type: 'percentage' as const, threshold: 300, value: 15, description: '满300享85折' },
          ])
        ]);
        
        setRestaurantInfo(loadedRestaurantInfo);
        setAnnouncementData(loadedAnnouncementData);
        setDiscounts(loadedDiscounts);
        
        console.log('✅ 所有设置数据加载完成');
      } catch (error) {
        console.error('❌ 加载设置数据失败:', error);
      }
    };
    
    loadAllSettings();
  }, []);
  
  // 当数据变化时保存到localStorage和Firebase
  useEffect(() => {
    // 避免初始化时就保存默认数据
    if (restaurantInfo.name !== '美食之家') {
      saveDataToStorage('restaurantInfo', restaurantInfo);
    }
  }, [restaurantInfo]);
  
  useEffect(() => {
    saveDataToStorage('discounts', discounts);
  }, [discounts]);
  
  // 监听其他组件触发的数据更新事件
  useEffect(() => {
    const handleRestaurantInfoUpdate = (e: CustomEvent<RestaurantInfo>) => {
      if (e.detail && JSON.stringify(restaurantInfo) !== JSON.stringify(e.detail)) {
        setRestaurantInfo(e.detail);
      }
    };
    
    const handleAnnouncementDataUpdate = (e: CustomEvent<AnnouncementData>) => {
      if (e.detail && JSON.stringify(announcementData) !== JSON.stringify(e.detail)) {
        setAnnouncementData(e.detail);
      }
    };
    
    const handleDiscountsUpdate = (e: CustomEvent<Discount[]>) => {
      if (e.detail && JSON.stringify(discounts) !== JSON.stringify(e.detail)) {
        setDiscounts(e.detail);
      }
    };
    
    window.addEventListener('restaurantInfoUpdate', handleRestaurantInfoUpdate as EventListener);
    window.addEventListener('announcementDataUpdate', handleAnnouncementDataUpdate as EventListener);
    window.addEventListener('discountsUpdate', handleDiscountsUpdate as EventListener);
    
    return () => {
      window.removeEventListener('restaurantInfoUpdate', handleRestaurantInfoUpdate as EventListener);
      window.removeEventListener('announcementDataUpdate', handleAnnouncementDataUpdate as EventListener);
      window.removeEventListener('discountsUpdate', handleDiscountsUpdate as EventListener);
    };
  }, [restaurantInfo, announcementData, discounts]);
  
  // Handle form submission for restaurant info
  const handleRestaurantInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveDataToStorage('restaurantInfo', restaurantInfo);
    alert('餐厅信息已更新');
  };
  
  // Handle announcement update
  const handleSaveAnnouncement = async (data: AnnouncementData) => {
    try {
      // 更新状态
      setAnnouncementData(data);
      
      // 使用新的保存函数（同时保存到localStorage和Firebase）
      await saveDataToStorage('announcementData', data);
      
      // 清除可能阻止弹窗显示的标记
      localStorage.removeItem('hasShownAnnouncementModal');
      
      // 发送自定义事件通知其他组件
      const announcementUpdateEvent = new CustomEvent('announcementUpdate', { 
        detail: data,
        bubbles: true,
        cancelable: true
      });
      
      // 使用dispatchEvent而不是window.dispatchEvent，确保事件传播
      document.dispatchEvent(announcementUpdateEvent);
      window.dispatchEvent(announcementUpdateEvent);
      
      // 在sessionStorage中添加一个标记，表明数据已更新
      sessionStorage.setItem('announcement_updated', 'true');
      sessionStorage.setItem('announcement_updated_time', String(new Date().getTime()));
      
      // 使用更醒目的提示
      alert('公告信息已更新并保存到云端！所有用户将在刷新页面后看到新内容。');
    } catch (error) {
      console.error('保存公告数据失败:', error);
      alert('保存失败，请重试');
    }
  };
  
  // Add a new discount
  const handleAddDiscount = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Generate description based on discount type
    let description = '';
    if (newDiscount.type === 'amount') {
      description = `满${newDiscount.threshold}减${newDiscount.value}元`;
    } else {
      description = `满${newDiscount.threshold}享${100 - newDiscount.value}折`;
    }
    
    const discount: Discount = {
      id: `discount-${Date.now()}`,
      ...newDiscount,
      description,
    };
    
    const updatedDiscounts = [...discounts, discount];
    setDiscounts(updatedDiscounts);
    saveDataToStorage('discounts', updatedDiscounts);
    
    setNewDiscount({
      type: 'amount',
      threshold: 100,
      value: 10,
    });
    setShowDiscountForm(false);
  };
  
  // Delete a discount
  const handleDeleteDiscount = (id: string) => {
    const updatedDiscounts = discounts.filter(discount => discount.id !== id);
    setDiscounts(updatedDiscounts);
    saveDataToStorage('discounts', updatedDiscounts);
  };

  // 获取数据统计信息
  const getDataStatistics = () => {
    const stats = {
      orders: 0,
      cartItems: 0,
      menuItems: 0,
      categories: 0,
      totalDataSize: 0
    };

    try {
      const ordersData = localStorage.getItem('orders');
      const cartData = localStorage.getItem('cart');
      const menuItemsData = localStorage.getItem('menuItems');
      const categoriesData = localStorage.getItem('categories');

      if (ordersData) {
        const orders = JSON.parse(ordersData);
        stats.orders = Array.isArray(orders) ? orders.length : 0;
      }

      if (cartData) {
        const cart = JSON.parse(cartData);
        stats.cartItems = Array.isArray(cart) ? cart.length : 0;
      }

      if (menuItemsData) {
        const menuItems = JSON.parse(menuItemsData);
        stats.menuItems = Array.isArray(menuItems) ? menuItems.length : 0;
      }

      if (categoriesData) {
        const categories = JSON.parse(categoriesData);
        stats.categories = Array.isArray(categories) ? categories.length : 0;
      }

      // 计算总数据大小（KB）
      let totalSize = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          totalSize += localStorage[key].length;
        }
      }
      stats.totalDataSize = Math.round(totalSize / 1024 * 100) / 100; // KB

    } catch (error) {
      console.error('获取数据统计失败:', error);
    }

    return stats;
  };

  // 清理所有系统数据
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

此操作无法撤销！

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
          'deletedOrders'
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

        // 重置当前组件状态为默认值
        setRestaurantInfo({
          name: '美食之家',
          logo: 'https://images.pexels.com/photos/6287525/pexels-photo-6287525.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
        });
        setAnnouncementData(defaultAnnouncementData);
        setDiscounts([
          { id: '1', type: 'amount', threshold: 100, value: 10, description: '满100减10元' },
          { id: '2', type: 'amount', threshold: 200, value: 20, description: '满200减20元' },
          { id: '3', type: 'percentage', threshold: 300, value: 15, description: '满300享85折' },
        ]);

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

  // 清理订单数据（保留其他设置）
  const handleClearOrdersOnly = () => {
    if (confirm('确定只清理订单数据吗？这将删除所有历史订单记录。')) {
      try {
        console.log('🧹 开始清理订单数据...');
        
        // 清除localStorage
        localStorage.removeItem('orders');
        localStorage.removeItem('cart');
        localStorage.removeItem('deletedOrders'); // 也清理删除记录
        
        console.log('📤 发送清理事件...');
        
        // 发送清空事件（使用空数组）
        const orderEvent = new CustomEvent('orderUpdate', { detail: [] });
        const cartEvent = new CustomEvent('cartUpdate', { detail: [] });
        
        window.dispatchEvent(orderEvent);
        window.dispatchEvent(cartEvent);
        
        console.log('✅ 清理事件已发送');

        alert('✅ 订单数据已清理完成！');
      } catch (error) {
        console.error('❌ 清理订单数据失败:', error);
        alert('❌ 清理失败，请重试。');
      }
    }
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">系统设置</h1>
      
      {/* 导航标签页 */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('basic')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'basic'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            基本信息
          </button>
          <button
            onClick={() => setActiveTab('announcement')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'announcement'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            公告设置
          </button>
          <button
            onClick={() => setActiveTab('discount')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'discount'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            优惠活动
          </button>
          <button
            onClick={() => setActiveTab('dataManagement')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'dataManagement'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            数据管理
          </button>
        </nav>
      </div>
      
      {/* 基本信息标签内容 */}
      {activeTab === 'basic' && (
        <div className="overflow-hidden rounded-lg bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="font-semibold text-gray-800">餐厅基本信息</h2>
        </div>
        
        <div className="p-6">
          <form onSubmit={handleRestaurantInfoSubmit}>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">餐厅名称</label>
                <input
                  type="text"
                    value={restaurantInfo.name}
                    onChange={(e) => setRestaurantInfo({ ...restaurantInfo, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Logo URL</label>
                <input
                  type="text"
                    value={restaurantInfo.logo}
                    onChange={(e) => setRestaurantInfo({ ...restaurantInfo, logo: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-1 rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
              >
                <Save className="h-4 w-4" />
                保存设置
              </button>
            </div>
          </form>
        </div>
      </div>
      )}
      
      {/* 公告设置标签内容 */}
      {activeTab === 'announcement' && (
        <div className="overflow-hidden rounded-lg bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="font-semibold text-gray-800">公告信息设置</h2>
          </div>
          
          <div className="p-6">
            <AnnouncementEditor 
              initialData={announcementData}
              onSave={handleSaveAnnouncement}
            />
          </div>
        </div>
      )}
      
      {/* 优惠活动标签内容 */}
      {activeTab === 'discount' && (
      <div className="overflow-hidden rounded-lg bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="font-semibold text-gray-800">优惠活动设置</h2>
          
          <button
            onClick={() => setShowDiscountForm(!showDiscountForm)}
            className="flex items-center gap-1 rounded-md bg-orange-500 px-3 py-1 text-sm font-medium text-white hover:bg-orange-600"
          >
            <Plus className="h-4 w-4" />
            添加优惠
          </button>
        </div>
        
        <div className="p-6">
          {/* Add Discount Form */}
          {showDiscountForm && (
            <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <h3 className="mb-3 font-medium text-gray-700">添加新优惠</h3>
              
              <form onSubmit={handleAddDiscount} className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">优惠类型</label>
                  <select
                    value={newDiscount.type}
                    onChange={(e) => setNewDiscount({ ...newDiscount, type: e.target.value as 'amount' | 'percentage' })}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  >
                    <option value="amount">满减优惠</option>
                    <option value="percentage">折扣优惠</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">满足金额</label>
                  <div className="relative mt-1 rounded-md shadow-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <span className="text-gray-500 sm:text-sm">€</span>
                    </div>
                    <input
                      type="number"
                      min="0"
                      value={newDiscount.threshold}
                      onChange={(e) => setNewDiscount({ ...newDiscount, threshold: parseInt(e.target.value) })}
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 pl-7 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {newDiscount.type === 'amount' ? '减免金额' : '折扣比例 (%)'}
                  </label>
                  <div className="relative mt-1 rounded-md shadow-sm">
                    {newDiscount.type === 'amount' && (
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <span className="text-gray-500 sm:text-sm">€</span>
                      </div>
                    )}
                    <input
                      type="number"
                      min="0"
                      max={newDiscount.type === 'percentage' ? 100 : undefined}
                      value={newDiscount.value}
                      onChange={(e) => setNewDiscount({ ...newDiscount, value: parseInt(e.target.value) })}
                      className={`block w-full rounded-md border border-gray-300 px-3 py-2 ${
                        newDiscount.type === 'amount' ? 'pl-7' : ''
                      } shadow-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500`}
                    />
                    {newDiscount.type === 'percentage' && (
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                        <span className="text-gray-500 sm:text-sm">%</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="md:col-span-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowDiscountForm(false)}
                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
                  >
                    添加
                  </button>
                </div>
              </form>
            </div>
          )}
          
          {/* Discounts List */}
          {discounts.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center">
              <p className="text-gray-500">暂无优惠活动</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      优惠描述
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      类型
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      满足金额
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      优惠值
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {discounts.map((discount) => (
                    <tr key={discount.id}>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                        {discount.description}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {discount.type === 'amount' ? '满减' : '折扣'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        €{discount.threshold}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                          {discount.type === 'amount' ? `€${discount.value}` : `${100 - discount.value}%`}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                          <button
                            onClick={() => handleDeleteDiscount(discount.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash className="h-4 w-4" />
                          </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      )}

      {/* 数据管理标签内容 */}
      {activeTab === 'dataManagement' && (
        <div className="space-y-6">
          {/* 数据统计 */}
          <div className="overflow-hidden rounded-lg bg-white shadow-sm">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="flex items-center gap-2 font-semibold text-gray-800">
                <Database className="h-5 w-5" />
                数据统计
              </h2>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {(() => {
                  const stats = getDataStatistics();
                  return (
                    <>
                      <div className="rounded-lg border border-gray-200 p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600">{stats.orders}</div>
                        <div className="text-sm text-gray-500">历史订单</div>
                      </div>
                      <div className="rounded-lg border border-gray-200 p-4 text-center">
                        <div className="text-2xl font-bold text-green-600">{stats.menuItems}</div>
                        <div className="text-sm text-gray-500">菜单项目</div>
                      </div>
                      <div className="rounded-lg border border-gray-200 p-4 text-center">
                        <div className="text-2xl font-bold text-purple-600">{stats.categories}</div>
                        <div className="text-sm text-gray-500">菜品分类</div>
                      </div>
                      <div className="rounded-lg border border-gray-200 p-4 text-center">
                        <div className="text-2xl font-bold text-orange-600">{stats.totalDataSize}KB</div>
                        <div className="text-sm text-gray-500">总数据大小</div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* 数据清理操作 */}
          <div className="overflow-hidden rounded-lg bg-white shadow-sm">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="flex items-center gap-2 font-semibold text-gray-800">
                <RotateCcw className="h-5 w-5" />
                数据清理
              </h2>
            </div>
            
            <div className="p-6 space-y-4">
              {/* 清理订单数据 */}
              <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-medium text-yellow-800 mb-2">清理订单数据</h3>
                    <p className="text-sm text-yellow-700 mb-3">
                      清理所有历史订单记录和购物车数据，保留菜单设置、餐厅信息等其他配置。
                    </p>
                    <button
                      onClick={handleClearOrdersOnly}
                      className="inline-flex items-center gap-2 rounded-md bg-yellow-600 px-3 py-2 text-sm font-medium text-white hover:bg-yellow-700"
                    >
                      <Trash className="h-4 w-4" />
                      清理订单数据
                    </button>
                  </div>
                </div>
              </div>

              {/* 重置所有数据 */}
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-medium text-red-800 mb-2">重置所有数据</h3>
                    <p className="text-sm text-red-700 mb-3">
                      ⚠️ <strong>危险操作</strong>：将清除所有系统数据，包括订单、菜单、设置等所有信息，恢复到初始状态。此操作不可撤销！
                    </p>
                    <ul className="text-xs text-red-600 mb-3 list-disc list-inside space-y-1">
                      <li>所有历史订单记录</li>
                      <li>菜单项目和分类设置</li>
                      <li>餐厅信息和公告设置</li>
                      <li>优惠活动配置</li>
                      <li>用户登录状态</li>
                    </ul>
                    <button
                      onClick={handleResetAllData}
                      className="inline-flex items-center gap-2 rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
                    >
                      <Database className="h-4 w-4" />
                      重置所有数据
                    </button>
                  </div>
                </div>
              </div>

              {/* 使用说明 */}
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <div className="flex items-start gap-3">
                  <Database className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-medium text-blue-800 mb-2">使用说明</h3>
                    <div className="text-sm text-blue-700 space-y-1">
                      <p>• 建议在系统测试或新部署时使用数据重置功能</p>
                      <p>• 重置操作会要求输入确认文本以防止误操作</p>
                      <p>• 清理后页面会自动刷新以应用更改</p>
                      <p>• 如需备份数据，请在操作前导出相关信息</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemSettings;