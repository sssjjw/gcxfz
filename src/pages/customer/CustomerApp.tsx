import React, { useState, useEffect, useRef } from 'react';
import { ShoppingBag } from 'lucide-react';
import RestaurantHeader from './components/RestaurantHeader';
import CategoryNav from './components/CategoryNav';
import MenuList from './components/MenuList';
import Cart from './components/Cart';
import OrderInfoForm from './components/OrderInfoForm';
import OrderConfirmation from './components/OrderConfirmation';
import AnnouncementModal from './components/AnnouncementModal';
import FlyToCart from './components/FlyToCart';
import { useMenu } from '../../contexts/MenuContext';
import { useCart } from '../../contexts/CartContext';
import { useOrder, Order } from '../../contexts/OrderContext';
import { AnnouncementData } from './components/Announcement';
import { forceAnnouncementSync, ANNOUNCEMENT_VERSION } from '../../utils/announcementSync';

// 硬编码最新的公告数据，作为默认值和备用方案
const latestAnnouncementData: AnnouncementData = {
  isEnabled: true,
  title: "📢 本周订餐公告",
  description: "请查看以下重要信息，以便顺利完成订餐",
  orderDate: "5.24",
  orderWeekday: "周五",
  orderDeadline: "5.24（周五）12:00",
  specialDeadline: "甜品截至5.23晚22:00",
  pickupTime: "18:00",
  pickupLocation: "蓝塔楼下",
  paymentMethods: ["微信支付", "支付宝", "现金"],
  tips: [
    "请在截单时间前完成订单提交，过时将无法接受订单",
    "用餐高峰期请提前15分钟取餐",
    "如需取消订单，请提前2小时联系客服"
  ],
  promotionText: "本周特惠: 三份餐点八折优惠！"
};

const CustomerApp: React.FC = () => {
  const { categories, menuItems, isLoading } = useMenu();
  const { items: cartItems, totalItems, subtotal, discount, total, clearCart } = useCart();
  const { createOrder } = useOrder();
  
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isOrderInfoFormOpen, setIsOrderInfoFormOpen] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [showOrderConfirmation, setShowOrderConfirmation] = useState(false);
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  
  // 使用硬编码数据作为初始状态，但随后会被最新数据覆盖
  const [announcementData, setAnnouncementData] = useState<AnnouncementData>(latestAnnouncementData);
  
  const categoryRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const firstMenuCategoryRef = useRef<string | null>(null);
  const menuContentRef = useRef<HTMLDivElement>(null);
  
  // 创建购物车按钮的引用，用于获取购物车位置
  const cartButtonRef = useRef<HTMLDivElement>(null);
  
  // 飞入购物车动画的状态
  const [flyToCartAnimation, setFlyToCartAnimation] = useState<{
    isActive: boolean;
    productImage: string;
    startPosition: { x: number; y: number };
  } | null>(null);
  
  // 标记当前版本，用于调试
  console.log('当前公告组件版本:', ANNOUNCEMENT_VERSION);

  // 页面首次加载时获取最新公告数据并显示弹窗
  useEffect(() => {
    // 在页面加载时清除阻止弹窗显示的标记
    try {
      localStorage.removeItem('hasShownAnnouncementModal');
      
      // 输出当前localStorage状态，帮助调试
      console.log('localStorage状态:', {
        announcementData: localStorage.getItem('announcementData'),
        hasShownAnnouncementModal: localStorage.getItem('hasShownAnnouncementModal')
      });
    } catch (e) {
      console.error("清除缓存失败:", e);
    }
    
    // 使用同步工具获取最新数据
    const cleanup = forceAnnouncementSync((freshData) => {
      console.log('forceAnnouncementSync收到数据:', freshData);
      setAnnouncementData(freshData);
      
      // 延迟显示弹窗，让页面有时间完全加载
      setTimeout(() => {
        setIsAnnouncementModalOpen(true);
      }, 500);
    }, latestAnnouncementData);
    
    return cleanup;
  }, []);

  // 监听自定义事件更新公告数据
  useEffect(() => {
    const handleAnnouncementUpdate = (e: CustomEvent<AnnouncementData>) => {
      console.log('收到公告更新事件:', e.detail);
      // 更新状态
      setAnnouncementData(e.detail);
    };

    window.addEventListener('announcementUpdate', handleAnnouncementUpdate as EventListener);
    document.addEventListener('announcementUpdate', handleAnnouncementUpdate as EventListener);
    
    return () => {
      window.removeEventListener('announcementUpdate', handleAnnouncementUpdate as EventListener);
      document.removeEventListener('announcementUpdate', handleAnnouncementUpdate as EventListener);
    };
  }, []);

  // 设置初始分类
  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0].id);
      firstMenuCategoryRef.current = categories[0].id;
    }
  }, [categories, selectedCategory]);

  // 添加滚动监听，更新当前可见分类
  useEffect(() => {
    if (!categories.length) return;
    
    const handleScroll = () => {
      if (!menuContentRef.current) return;
      
      // 获取标题栏高度
      const headerHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-height') || '0');
      
      // 获取可视区域顶部位置（加上偏移量）
      const scrollTop = window.scrollY + headerHeight + 50; // 添加额外偏移使高亮更准确
      
      // 找到当前可见的分类
      let currentVisibleCategory = categories[0].id;
      let smallestDistance = Infinity;
      
      Object.entries(categoryRefs.current).forEach(([categoryId, element]) => {
        if (!element) return;
        
        const { top } = element.getBoundingClientRect();
        const absoluteTop = top + window.scrollY;
        const distance = Math.abs(scrollTop - absoluteTop);
        
        // 更新最接近顶部的分类
        if (distance < smallestDistance && scrollTop >= absoluteTop) {
          smallestDistance = distance;
          currentVisibleCategory = categoryId;
        }
      });
      
      // 如果找到了当前可见分类且不同于当前选中分类，则更新
      if (currentVisibleCategory && currentVisibleCategory !== selectedCategory) {
        setSelectedCategory(currentVisibleCategory);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    // 初始触发一次，确保页面加载后正确高亮
    setTimeout(handleScroll, 100);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [categories, selectedCategory]);

  // 设置侧边导航栏宽度CSS变量
  useEffect(() => {
    document.documentElement.style.setProperty('--category-nav-width', '96px');
    
    const updateNavWidth = () => {
      const width = window.innerWidth >= 768 ? '160px' : '96px';
      document.documentElement.style.setProperty('--category-nav-width', width);
    };
    
    updateNavWidth();
    window.addEventListener('resize', updateNavWidth);
    
    return () => {
      window.removeEventListener('resize', updateNavWidth);
    };
  }, []);

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
    
    // Scroll to the category section, accounting for header height
    if (categoryRefs.current[categoryId]) {
      const headerHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-height') || '0');
      
      // 获取元素位置
      const element = categoryRefs.current[categoryId];
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      
      // 计算需要滚动到的位置：元素位置减去标题栏高度，再留出一些额外空间
      const offsetPosition = elementPosition - headerHeight - 8;
      
      // 滚动到目标位置
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const handleAnnouncementClick = () => {
    // 点击公告菜单项时，打开公告弹窗
    setIsAnnouncementModalOpen(true);
  };

  // 处理去点餐按钮点击
  const handleOrderNowClick = () => {
    // 关闭弹窗
    setIsAnnouncementModalOpen(false);
    
    // 如果有菜单分类，滚动到第一个菜单分类
    if (firstMenuCategoryRef.current) {
      handleCategoryClick(firstMenuCategoryRef.current);
    }
  };

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    
    setIsCartOpen(false);
    setIsOrderInfoFormOpen(true);
  };

  const handleOrderSubmit = async (groupName: string, notes?: string) => {
    console.log('🛒 CustomerApp.handleOrderSubmit 开始提交订单:', {
      groupName,
      notes,
      cartItemsCount: cartItems.length,
      total,
      subtotal,
      discountSavings: discount.savings
    });
    
    try {
      const newOrder = await createOrder(
        cartItems,
        total,
        subtotal,
        discount.savings,
        groupName,
        notes
      );
      
      console.log('✅ CustomerApp 订单提交完成:', {
        orderId: newOrder.id,
        pickupCode: newOrder.pickupCode
      });
      
      setOrder(newOrder);
      setIsOrderInfoFormOpen(false);
      setShowOrderConfirmation(true);
      clearCart();
    } catch (error) {
      console.error('❌ 订单提交失败:', error);
      alert('订单提交失败，请重试');
    }
  };

  const closeOrderConfirmation = () => {
    setShowOrderConfirmation(false);
    setOrder(null);
  };

  // 处理添加到购物车的动画
  const handleAddToCartAnimation = (productImage: string, startX: number, startY: number) => {
    // 如果购物车按钮不可见，不执行动画
    if (!cartButtonRef.current) return;
    
    // 获取购物车按钮的位置
    const cartRect = cartButtonRef.current.getBoundingClientRect();
    const endPosition = {
      x: cartRect.left + cartRect.width / 2,
      y: cartRect.top + cartRect.height / 2
    };
    
    // 设置动画状态
    setFlyToCartAnimation({
      isActive: true,
      productImage,
      startPosition: { x: startX, y: startY }
    });
    
    // 创建和分发自定义事件，这样MenuItemCard组件可以获取到动画信息
    const animationEvent = new CustomEvent('fly-to-cart-animation', {
      detail: {
        endPosition,
        onAnimationEnd: () => setFlyToCartAnimation(null)
      }
    });
    
    window.dispatchEvent(animationEvent);
  };
  
  // 添加全局监听器，处理添加到购物车的事件
  useEffect(() => {
    const handleAddToCart = (e: CustomEvent) => {
      const { productImage, position } = e.detail;
      handleAddToCartAnimation(productImage, position.x, position.y);
    };
    
    window.addEventListener('add-to-cart', handleAddToCart as EventListener);
    
    return () => {
      window.removeEventListener('add-to-cart', handleAddToCart as EventListener);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="animate-pulse text-center">
          <div className="text-xl font-semibold text-gray-600">加载中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <RestaurantHeader 
        hideAnnouncement={false} 
        onAnnouncementClick={handleAnnouncementClick}
      />
      
      <div className="flex flex-1 overflow-hidden relative">
        {/* Category Navigation - 修改为固定布局，降低z-index避免覆盖标题栏 */}
        <div className="fixed top-[calc(var(--header-height,64px))] bottom-0 left-0 w-24 bg-white shadow-sm md:w-40 z-5">
          <div className="h-full overflow-y-auto pb-20">
          <CategoryNav 
            categories={categories} 
            selectedCategory={selectedCategory}
            onCategoryClick={handleCategoryClick}
            showAnnouncement={false}
          />
          </div>
          
          {/* Cart Button - 移到左侧菜单栏下方 */}
          <div 
            ref={cartButtonRef}
            className="absolute bottom-4 left-0 right-0 flex justify-center items-center"
          >
            <button
              onClick={toggleCart}
              className="relative flex h-14 w-14 items-center justify-center rounded-full bg-orange-500 text-white shadow-lg transition-transform hover:bg-orange-600 active:scale-95"
            >
              <ShoppingBag className="h-6 w-6" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white shadow-sm">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
        
        {/* Menu Content - 添加左侧边距，为固定导航栏腾出空间 */}
        <div ref={menuContentRef} className="flex-1 overflow-y-auto px-4 pt-4 pb-32 ml-24 md:ml-40">
          <MenuList 
            menuItems={menuItems} 
            categories={categories}
            categoryRefs={categoryRefs}
          />
        </div>
      </div>
      
      {/* 飞入购物车动画 */}
      {flyToCartAnimation && (
        <FlyToCart
          isActive={flyToCartAnimation.isActive}
          productImage={flyToCartAnimation.productImage}
          startPosition={flyToCartAnimation.startPosition}
          endPosition={
            cartButtonRef.current 
            ? {
                x: cartButtonRef.current.getBoundingClientRect().left + cartButtonRef.current.getBoundingClientRect().width / 2,
                y: cartButtonRef.current.getBoundingClientRect().top + cartButtonRef.current.getBoundingClientRect().height / 2
              }
            : { x: 0, y: 0 }
          }
          onAnimationEnd={() => setFlyToCartAnimation(null)}
        />
      )}
      
      {/* Cart Slide-in */}
      <Cart 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)}
        onCheckout={handleCheckout}
      />
      
      {/* Order Info Form */}
      <OrderInfoForm
        isOpen={isOrderInfoFormOpen}
        onClose={() => setIsOrderInfoFormOpen(false)}
        onSubmit={handleOrderSubmit}
      />
      
      {/* Order Confirmation Modal */}
      {showOrderConfirmation && order && (
        <OrderConfirmation order={order} onClose={closeOrderConfirmation} />
      )}
      
      {/* 公告弹窗组件 */}
      <AnnouncementModal 
        data={announcementData}
        isOpen={isAnnouncementModalOpen}
        onClose={() => setIsAnnouncementModalOpen(false)}
        onOrderNow={handleOrderNowClick}
      />
    </div>
  );
};

export default CustomerApp;